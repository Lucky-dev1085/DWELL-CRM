import React, { useState, useEffect, FC, useRef } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import exploreMarketsAction from 'compete/actions/explore_markets';
import { ExploreMarket, SubjectAsset } from 'src/interfaces';
import { CompeteEmpty } from 'compete/components';
import { SearchIcon, FormSearch, SearchResults, KeywordLabel, ListItem, ItemLink } from './styles';

interface SearchInputProps {
  searchFilter?: { marketCoverage?: { name?: string }, assetType?: string },
  small?: boolean,
  handleSearch: (type?: string, value?: { name: string, id: number }) => void,
  subject?: SubjectAsset,
  fieldName?: string,
  isSubjectAsset?: boolean,
  competitorsList?: ExploreMarket[],
  isSelectSearch?: boolean,
}

const searchKey = [
  { label: 'Markets', key: 'markets', filter: 'Markets only', path: 'market-report' },
  { label: 'Submarkets', key: 'submarkets', filter: 'Submarkets only', path: 'submarket-report' },
  { label: 'Properties', key: 'properties', filter: 'Properties only', path: 'property-report' },
];

const SearchInput: FC<SearchInputProps> = ({ searchFilter: { assetType }, small = false, handleSearch, subject, fieldName, isSubjectAsset, competitorsList, isSelectSearch }) => {
  const [keyword, setKeyword] = useState({ type: '', value: '' });
  const [isShowResults, toggleShowResults] = useState(false);
  const [isShowRecentSearch, toggleShowRecentSearch] = useState(false);
  const [exploreMarkets, setExploreMarkets] = useState(null);

  const dispatch = useDispatch();
  const isRecentSearchLoaded = useSelector(state => state.watchlist.isWatchlistLoaded);
  const recentSearch = useSelector(state => state.watchlist.watchlist);
  const { getExploreMarketsList } = exploreMarketsAction;

  const inputRef = useRef(null);
  const timer = useRef(null);
  const cancelToken = useRef(null);

  const handleFocus = () => {
    toggleShowRecentSearch(true);
  };

  const fetchData = (token = null) => {
    if (keyword.value) {
      dispatch(getExploreMarketsList({ keyword: keyword.value }, token))
        .then(({ result: { data } }) => setExploreMarkets(data));
    }
  };

  const reloadWithRequestCancel = () => {
    if (cancelToken.current) {
      cancelToken.current.cancel('Operation canceled due to new request.');
    }

    cancelToken.current = axios.CancelToken.source();
    fetchData(cancelToken.current.token);
  };

  useEffect(() => {
    if (keyword.value === null) return;
    if (!keyword.value) {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      reloadWithRequestCancel();
      return;
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      timer.current = null;
      reloadWithRequestCancel();
    }, 500);
  }, [keyword]);

  const handleClick = (e) => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      toggleShowResults(false);
      toggleShowRecentSearch(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  const onSearch = ({ target: { value } }) => {
    toggleShowResults(true);
    toggleShowRecentSearch(false);
    setKeyword({ type: '', value });
  };

  useEffect(() => {
    if (!isShowResults && !keyword.type) {
      setKeyword({ type: '', value: '' });
      handleSearch();
    }
  }, [isShowResults]);

  useEffect(() => {
    if (subject && subject.type) {
      setKeyword({ ...subject, value: subject.value[fieldName] });
    }
  }, [subject]);

  const renderEmptySearch = () => {
    let allItems = [];
    searchKey.forEach((el) => {
      allItems = allItems.concat(exploreMarkets[el.key]);
    });

    return allItems.length ? null :
      <CompeteEmpty
        icon="ri-search-line"
        title="No results found"
        text="Try adjusting your search or filter to find what you're looking for"
        isCenter
      />;
  };

  const handleItemClick = (type, value) => {
    setKeyword({ type, value: fieldName ? value[fieldName] : value });
    handleSearch(type, value);
    toggleShowResults(false);
    toggleShowRecentSearch(false);
  };

  const renderCompetitors = () => {
    const filteredCompetitors = competitorsList.filter(el => el.name.toLowerCase().includes(keyword.value.toLowerCase()));

    if (!filteredCompetitors.length) return null;

    return (
      <React.Fragment>
        <KeywordLabel>Competitor</KeywordLabel>
        <ListItem>
          {filteredCompetitors.map((item, i) => (
            <ItemLink key={i} onClick={() => handleItemClick('competitor', item)}>{fieldName ? item[fieldName] : item}</ItemLink>
          ))}
        </ListItem>
      </React.Fragment>
    );
  };

  const renderListItem = (search) => {
    if ((assetType !== 'All Assets' && assetType !== search.filter) || (isSubjectAsset && search.key === 'markets')) return null;

    if (!exploreMarkets[search.key].length) return null;

    return (
      <React.Fragment>
        <KeywordLabel>{search.label}</KeywordLabel>
        <ListItem>
          {exploreMarkets[search.key].map((item, i) => (
            <ItemLink key={i} onClick={() => handleItemClick(search.path, item)}>{fieldName ? item[fieldName] : item}</ItemLink>
          ))}
        </ListItem>
      </React.Fragment>
    );
  };

  const renderRecentSearches = (search, key) => {
    if (!recentSearch || !recentSearch[search.key].length) return null;

    return (
      <React.Fragment key={key}>
        <KeywordLabel>{search.label}</KeywordLabel>
        <ListItem>
          {recentSearch[search.key].map((item, i) => (
            <ItemLink key={i} onClick={() => handleItemClick(search.path, item)}>{fieldName ? item[fieldName] : item}</ItemLink>
          ))}
        </ListItem>
      </React.Fragment>
    );
  };

  const isEmptyRecent = () => {
    let allItems = [];
    searchKey.forEach((el) => {
      allItems = allItems.concat(recentSearch[el.key]);
    });

    return allItems.length;
  };

  return (
    <div className="position-relative w-100" ref={inputRef}>
      <SearchIcon $small={small} />
      <FormSearch
        name="search"
        value={keyword.value}
        onChange={onSearch}
        onFocus={handleFocus}
        placeholder="Search..."
        autoComplete="off"
        $small={small}
        $search={isSelectSearch}
      />
      {exploreMarkets &&
        <SearchResults show={isShowResults}>
          {searchKey.map((search, index) => (
            <React.Fragment key={index}>
              {renderListItem(search)}
            </React.Fragment>
          ))}
          {competitorsList && renderCompetitors()}
          {renderEmptySearch()}
        </SearchResults>}
      {isRecentSearchLoaded && !isEmptyRecent() ?
        <SearchResults show={isShowRecentSearch}>
          <CompeteEmpty icon="ri-search-line" title="Search for a market, submarket, or property asset" isCenter />
        </SearchResults> :
        <SearchResults show={isShowRecentSearch}>
          <h6>Recent Searches</h6>
          {searchKey.map((search, index) => renderRecentSearches(search, index))}
        </SearchResults>}
    </div>
  );
};

SearchInput.defaultProps = {
  searchFilter: { marketCoverage: { name: '' }, assetType: 'All Assets' },
};

export default SearchInput;
