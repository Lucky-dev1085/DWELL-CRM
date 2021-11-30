import React, { useState, useEffect, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UncontrolledTooltip, CardHeader, CardBody } from 'reactstrap';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import watchlistAction from 'compete/actions/watchlist';
import { ContentTitle, CardTitle } from 'compete/views/styles';
import { SearchInput } from 'compete/components';
import { CardBasic } from 'compete/components/common';
import { searchFilters } from 'compete/constants';
import { CustomSelect } from 'src/common';
import { getPropertyId } from 'src/utils';
import { ContentContainer, ContentHeader, NavContainer, NavLink, ContentBody, ContentSidebar, ContentLabel, NavCompete, CompeteItem, ItemLink,
  NavSubCompete, CompeteSubItem, SubItemLink, SubItemRemove, ContentMain } from './styles';

const watchListMenu = [
  { label: 'Markets', icon: 'ri-building-line', key: 'markets', path: 'market-report' },
  { label: 'Submarkets', icon: 'ri-store-3-line', key: 'submarkets', path: 'submarket-report' },
  { label: 'Properties', icon: 'ri-home-8-line', key: 'properties', path: 'property-report' },
  { label: 'Comparison', icon: 'ri-line-chart-fill', key: 'comparisons', path: 'comparison/report' },
];

const CompeteHome: FC<RouteComponentProps> = ({ history: { push } }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [assetType, setAssetType] = useState('All Assets');

  const dispatch = useDispatch();
  const watchList = useSelector(state => state.watchlist.watchlist);
  const { getWatchlist, updateWatchlist } = watchlistAction;

  useEffect(() => {
    dispatch(getWatchlist());
  }, []);

  const handleRemove = (type, item) => {
    const objectType = type === 'properties' ? 'property' : type.slice(0, -1);
    dispatch(updateWatchlist({ object_type: objectType, object_id: item.id, is_stored: false })).then(() => dispatch(getWatchlist()));
  };

  const handleSearch = (type, value) => {
    if (value && value.id) {
      push(`/${getPropertyId()}/compete/${type}/${value.id}`);
    }
  };

  const renderSidebar = () => (
    <ContentSidebar>
      <ContentLabel className="mb-15">Watchlist</ContentLabel>
      {watchListMenu.map((item, index) => (
        <React.Fragment key={index}>
          <NavCompete>
            <CompeteItem className={activeMenu === item.label ? 'active' : ''}>
              <ItemLink onClick={() => setActiveMenu(activeMenu === item.label ? null : item.label)}><i className={item.icon} />{item.label}</ItemLink>
              {watchList &&
                <NavSubCompete $scroll={watchList[item.key].length > 15}>
                  {watchList[item.key].filter(el => el.is_stored).map(el => (
                    <CompeteSubItem key={el.id}>
                      <SubItemLink
                        onClick={() => item.path && push(`/${getPropertyId()}/compete/${item.path}/${el.id}`)}
                        title={item.key === 'comparisons' ? `${el.subject_asset_name} vs ${el.compared_asset_name}` : el.name}
                      >
                        {item.key === 'comparisons' ? `${el.subject_asset_name} vs ${el.compared_asset_name}` : el.name}
                      </SubItemLink>
                      <SubItemRemove id={`${item.key}-${el.id}`} onClick={() => handleRemove(item.key, el)}><i className="ri-close-circle-fill" /></SubItemRemove>
                      <UncontrolledTooltip placement="top" target={`${item.key}-${el.id}`}>
                        Remove
                      </UncontrolledTooltip>
                    </CompeteSubItem>
                  ))}
                </NavSubCompete>}
            </CompeteItem>
          </NavCompete>
        </React.Fragment>))}
    </ContentSidebar>
  );

  const renderMainContent = () => (
    <ContentMain>
      <CardBasic>
        <CardHeader>
          <CardTitle>Explore Markets</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="d-flex">
            <CustomSelect
              selected={assetType}
              optionList={searchFilters.assetType}
              onChange={selected => setAssetType(selected)}
              isSelectSearch
            />
            <SearchInput searchFilter={{ assetType }} handleSearch={handleSearch} fieldName="name" isSelectSearch />
          </div>
        </CardBody>
      </CardBasic>
    </ContentMain>
  );

  return (
    <ContentContainer>
      <ContentHeader>
        <ContentTitle>Compete</ContentTitle>
        <NavContainer>
          <NavLink onClick={() => push(`/${getPropertyId()}/compete/comparison`)}>
            <i className="ri-line-chart-fill" />
            <span>Comparison</span>
          </NavLink>
          <NavLink onClick={() => push(`/${getPropertyId()}/compete/alerts`)}>
            <i className="ri-notification-3-line" />
            <span>Alerts</span>
          </NavLink>
        </NavContainer>
      </ContentHeader>
      <ContentBody>
        {renderSidebar()}
        {renderMainContent()}
      </ContentBody>
    </ContentContainer>
  );
};

export default withRouter(CompeteHome);
