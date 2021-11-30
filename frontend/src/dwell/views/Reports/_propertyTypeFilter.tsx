import React, { FC, useEffect, useState } from 'react';
import { Input, TabPane } from 'reactstrap';
import { connect } from 'react-redux';
import { isEmpty } from 'codemirror/src/util/misc';
import 'src/scss/pages/_reports.scss';
import {
  DropdownToggle,
  DropdownWrapper,
  Icon,
  InnerIcon,
  PortfolioSearch,
  PortfolioTabContent,
  PortfolioTabContentType,
  PortfolioTabItem,
  PortfolioTabLink,
  PortfolioTabs,
  PropertyFilterDropdownMenu,
} from 'dwell/views/Reports/styles';

interface PropertyTypeTabContentProps {
  value: {id: number, name: string},
  items: {id: number, name: string}[],
  handleItemClick: (item: {id: number, name: string}) => void,
  itemType: string,
}

const PropertyTypeTabContent: FC<PropertyTypeTabContentProps> = ({ value, items, handleItemClick, itemType }) => (
  <React.Fragment>
    {isEmpty(items) && <div className={itemType}>{`No ${itemType === 'property' ? 'propertie' : itemType}s found.`}</div>}
    {items.map((item, index) => (
      <PortfolioTabContentType
        className={`${itemType} ${!isEmpty(value) && value.id === item.id && value.name === item.name ? 'active' : ''}`}
        key={index}
        onClick={() => handleItemClick(item)}
      >
        <span>{item.name}</span>
        {!isEmpty(value) && value.id === item.id && value.name === item.name && <InnerIcon className="ri-check-line" />}
      </PortfolioTabContentType>))}
  </React.Fragment>
);

interface PropertyTypeFilterProps {
  value: {id: number, name: string},
  onClick: (portfolio: { type: string }) => void,
  properties: {id: number, name: string}[],
  setType: (type: string) => void,
  portfolios: {id: number, name: string, type: string}[],
}

const PropertyTypeFilter: FC<PropertyTypeFilterProps> = (props) => {
  const { value, onClick, properties, portfolios, setType } = props;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolios');
  const [searchValue, setSearchValue] = useState('');
  const [submarkets, setSubmarkets] = useState([]);
  const [assetManagerAndMarkTaylor, setAssetManagerAndMarkTaylor] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);

  const initialAssetManagerAndMarkTaylor = portfolios.filter(portfolio => portfolio.type === 'MARK_TAYLOR')
    .concat(portfolios.filter(portfolio => portfolio.type === 'ASSET_MANAGER'));
  const initialSubmarkets = portfolios.filter(portfolio => portfolio.type === 'SUBMARKET');

  const setInitialData = () => {
    setSubmarkets(initialSubmarkets);
    setAssetManagerAndMarkTaylor(initialAssetManagerAndMarkTaylor);
    setFilteredProperties(properties);
  };

  useEffect(() => {
    setInitialData();
  }, [properties, portfolios]);

  useEffect(() => {
    setSearchValue('');
    setActiveTab('portfolios');
    setInitialData();
  }, [dropdownOpen]);

  const filterPortfolios = (keyword) => {
    setSearchValue(keyword);
    switch (activeTab) {
      case 'portfolios': {
        const filteredPortfolios = initialAssetManagerAndMarkTaylor.filter(portfolio => portfolio.name.toLowerCase().includes(keyword.toLowerCase()));
        setAssetManagerAndMarkTaylor(filteredPortfolios);
        break;
      }
      case 'submarkets': {
        const filteredPortfolios = initialSubmarkets.filter(portfolio => portfolio.name.toLowerCase().includes(keyword.toLowerCase()));
        setSubmarkets(filteredPortfolios);
        break;
      }
      case 'properties': {
        const filteredPortfolios = properties.filter(portfolio => portfolio.name.toLowerCase().includes(keyword.toLowerCase()));
        setFilteredProperties(filteredPortfolios);
        break;
      }
      default: break;
    }
  };

  useEffect(() => {
    filterPortfolios(searchValue);
  }, [activeTab]);

  const handlePortfolioClick = (portfolio) => {
    setType('portfolio');
    onClick(portfolio);
    setDropdownOpen(!dropdownOpen);
  };

  const handlePropertyClick = (portfolio) => {
    setType('property');
    onClick(portfolio);
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <DropdownWrapper isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
      <DropdownToggle>
        <Icon className="ri-building-line" /><span>{isEmpty(value) ? 'Select property type' : value.name}</span>
      </DropdownToggle>
      <PropertyFilterDropdownMenu styles={{ minWidth: '400px' }}>
        <div>
          <PortfolioSearch>
            <Input
              type="text"
              placeholder=" &#xF002;  Search"
              style={{ fontFamily: 'Source Sans Pro, FontAwesome' }}
              value={searchValue}
              onChange={e => filterPortfolios(e.target.value)}
            />
          </PortfolioSearch>
          <PortfolioTabs tabs>
            {['portfolios', 'submarkets', 'properties'].map((item, index) => (
              <PortfolioTabItem key={index} className="col-4" active={activeTab === item}>
                <PortfolioTabLink
                  onClick={() => setActiveTab(item)}
                >
                  {item.replace(/^\w/, c => c.toUpperCase())}
                </PortfolioTabLink>
              </PortfolioTabItem>))}
          </PortfolioTabs>
          <PortfolioTabContent activeTab={activeTab}>
            <TabPane tabId="portfolios" className="portfolios">
              <PropertyTypeTabContent value={value} items={assetManagerAndMarkTaylor} itemType="portfolio" handleItemClick={handlePortfolioClick} />
            </TabPane>
            <TabPane tabId="submarkets" className="submarkets">
              <PropertyTypeTabContent value={value} items={submarkets} itemType="submarket" handleItemClick={handlePortfolioClick} />
            </TabPane>
            <TabPane tabId="properties" className="properties" >
              <PropertyTypeTabContent value={value} items={filteredProperties} itemType="property" handleItemClick={handlePropertyClick} />
            </TabPane>
          </PortfolioTabContent>
        </div>
      </PropertyFilterDropdownMenu>
    </DropdownWrapper>
  );
};

const mapStateToProps = state => ({
  properties: state.property.properties,
  portfolios: state.portfolio.portfolios,
});

export default connect(mapStateToProps)(PropertyTypeFilter);
