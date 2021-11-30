import React, { useState, useEffect, FC } from 'react';
import { AppBreadcrumb } from '@coreui/react';
import { useDispatch, useSelector } from 'react-redux';
import { CardHeader, CardBody, DropdownMenu, DropdownToggle, Row, Col } from 'reactstrap';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { compete } from 'src/routes';
import watchlistActions from 'compete/actions/watchlist';
import submarketActions from 'compete/actions/submarket';
import { ContentTitle, CardTitle, ContentContainer, ContentHeader, TabGroup, TabButton, CompeteStar, ItemLabel, ItemValue, CardHeaderWrapper, BlueBadge } from 'compete/views/styles';
import { CustomSelect } from 'src/common';
import { CardBasic, Dropdown } from 'compete/components/common';
import { reportSettingsFilters, REPORT_SETTINGS, currencyRoundedFormat } from 'compete/constants';
import GeneralReport from './general_report';
import HistoricalReport from './historical_report';

const detailsListCard = [
  { field: 'name', label: 'Submarket Name', skeletonWidth: 100 }, { field: 'market_name', label: 'Market', skeletonWidth: 50 },
  { field: 'submarkets_count', label: 'Number of Submarkets', skeletonWidth: 30 }, { field: 'properties_count', label: 'Number of Properties', skeletonWidth: 30 },
  { field: 'units_count', label: 'Number of Units', skeletonWidth: 50 }, { field: 'avg_rent', label: 'Average Submarket Rent', type: 'currency', skeletonWidth: 50 },
];

const SubmarketReport: FC<RouteComponentProps> = ({ location: { pathname } }) => {
  const [isStarActive, toggleStar] = useState(false);
  const [activeTab, setActiveTab] = useState('General');
  const [dropdownOpen, setDropDownOpen] = useState(false);
  const [reportSettings, setReportSettings] = useState({ reportingPeriod: 'Last 12 months', reportingGroup: 'Monthly' });

  const dispatch = useDispatch();
  const submarketDetail = useSelector(state => state.submarket.submarketDetail);
  const isSubmarketDetailLoaded = useSelector(state => state.submarket.isSubmarketDetailLoaded);
  const watchlist = useSelector(state => state.watchlist.watchlist);
  const isSubmitting = useSelector(state => state.watchlist.isSubmitting);
  const isWatchlistLoaded = useSelector(state => state.watchlist.isWatchlistLoaded);

  const { getSubmarketDetail } = submarketActions;
  const { getWatchlist, updateWatchlist } = watchlistActions;

  useEffect(() => {
    dispatch(getSubmarketDetail(Number(pathname.split('/').pop())));
    dispatch(getWatchlist());

    const storageFilter = JSON.parse(localStorage.getItem(REPORT_SETTINGS));
    if (storageFilter) {
      setReportSettings(storageFilter);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(REPORT_SETTINGS, JSON.stringify(reportSettings));
  }, [reportSettings]);

  useEffect(() => {
    if (isWatchlistLoaded && isSubmarketDetailLoaded) {
      const isWatchlist = watchlist.submarkets.find(el => el.id === submarketDetail.id && el.is_stored);
      toggleStar(!!isWatchlist);
      dispatch(updateWatchlist({ object_type: 'submarket', object_id: submarketDetail.id }, () => null));
    }
  }, [isWatchlistLoaded, isSubmarketDetailLoaded]);

  const handleToggleStar = () => {
    toggleStar(!isStarActive);
    dispatch(updateWatchlist({ object_type: 'submarket', object_id: submarketDetail.id, is_stored: !isStarActive }));
  };

  const isDisabledReportingGroup = reportSettingsFilters.exceptPeriod.includes(reportSettings.reportingPeriod);

  const renderContentHeader = () => (
    <ContentHeader>
      <div className="mr-auto">
        <AppBreadcrumb appRoutes={compete} />
        {isSubmarketDetailLoaded ?
          <div className="d-flex align-items-center">
            <ContentTitle className="mr-5">{submarketDetail.name}</ContentTitle>
            <CompeteStar isActive={isStarActive} disabled={isSubmitting}><i className={isStarActive ? 'ri-star-fill' : 'ri-star-line'} onClick={handleToggleStar} /></CompeteStar>
          </div> :
          <Skeleton width={200} height={12} style={{ borderRadius: '6px' }} />
        }
      </div>
      <TabGroup className="mr-10">
        <TabButton active={activeTab === 'General'} onClick={() => setActiveTab('General')}>
          General
        </TabButton>
        <TabButton active={activeTab === 'Historical'} onClick={() => setActiveTab('Historical')}>
          Historical
        </TabButton>
      </TabGroup>
      {activeTab === 'Historical' &&
        <Dropdown isOpen={dropdownOpen} toggle={() => setDropDownOpen(!dropdownOpen)}>
          <DropdownToggle>
            <i className="ri-list-settings-line" />
          </DropdownToggle>
          <DropdownMenu right>
            <h6 className="mb-15">Report Settings</h6>
            <Row className="m-row-5 align-items-center">
              <Col xs="5" className="p-x-5">
                Reporting period
              </Col>
              <Col xs="7" className="p-x-5">
                <CustomSelect
                  selected={reportSettings.reportingPeriod}
                  optionList={reportSettingsFilters.reportingPeriod}
                  onChange={selected => setReportSettings({ ...reportSettings, reportingPeriod: selected })}
                />
              </Col>
            </Row>
            <Row className="m-row-5 align-items-center mt-10">
              <Col xs="5" className="p-x-5">
                Reporting group
              </Col>
              <Col xs="7" className="p-x-5">
                <CustomSelect
                  selected={isDisabledReportingGroup ? 'Weekly' : reportSettings.reportingGroup}
                  optionList={reportSettingsFilters.reportingGroup}
                  onChange={selected => setReportSettings({ ...reportSettings, reportingGroup: selected })}
                  disabled={isDisabledReportingGroup}
                />
              </Col>
            </Row>
          </DropdownMenu>
        </Dropdown>}
    </ContentHeader>
  );

  return (
    <ContentContainer>
      {renderContentHeader()}
      <Row className="m-row-10">
        <Col xs="3" className="p-x-10">
          <CardBasic>
            <CardHeader>
              <CardHeaderWrapper>
                <CardTitle xs>Details</CardTitle>
                {isSubmarketDetailLoaded && submarketDetail.is_mtr_group && <BlueBadge>MTR Group</BlueBadge>}
              </CardHeaderWrapper>
            </CardHeader>
            <CardBody>
              {detailsListCard.map((item, index) => (
                isSubmarketDetailLoaded ?
                  !!submarketDetail[item.field] &&
                  <div className={`position-relative ${index > 0 ? 'mt-20' : ''}`} key={index}>
                    <ItemLabel>{item.label}</ItemLabel>
                    <ItemValue>
                      {item.type === 'currency' ? `$${currencyRoundedFormat(submarketDetail[item.field])}` : submarketDetail[item.field]}
                    </ItemValue>
                  </div> :
                  <div className={`position-relative ${index > 0 ? 'mt-20' : ''}`} key={index}>
                    <ItemLabel>{item.label}</ItemLabel>
                    <ItemValue>
                      <Skeleton width={item.skeletonWidth} height={12} style={{ borderRadius: '6px', marginTop: '7px' }} />
                    </ItemValue>
                  </div>
              ))}
            </CardBody>
          </CardBasic>
        </Col>
        <Col xs="9" className="p-x-10">
          {activeTab === 'General' ?
            <GeneralReport /> :
            <HistoricalReport reportSettings={reportSettings} />
          }
        </Col>
      </Row>
    </ContentContainer>
  );
};

export default withRouter(SubmarketReport);
