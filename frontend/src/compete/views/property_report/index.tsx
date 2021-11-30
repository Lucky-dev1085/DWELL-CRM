import React, { useState, useEffect, FC } from 'react';
import { AppBreadcrumb } from '@coreui/react';
import { useDispatch, useSelector } from 'react-redux';
import { CardHeader, CardBody, DropdownMenu, DropdownToggle, Row, Col } from 'reactstrap';
import Skeleton from 'react-loading-skeleton';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import moment from 'moment';
import { times, flatten, sortBy } from 'lodash';
import propertiesActions from 'compete/actions/properties';
import watchlistActions from 'compete/actions/watchlist';
import { compete } from 'src/routes';
import { ContentTitle, CardTitle, ContentContainer, ContentHeader, TabGroup, TabButton, CompeteStar, ItemLabel, ItemValue, ItemLink, NoWrap, CardHeaderWrapper, LeaseUp } from 'compete/views/styles';
import { CompeteEmpty } from 'compete/components';
import { CardBasic, Dropdown } from 'compete/components/common';
import { reportSettingsFilters, REPORT_SETTINGS, percentFormat } from 'compete/constants';
import { CustomSelect } from 'src/common';
import { PropertyAlert } from 'src/interfaces';
import { getPropertyId } from 'src/utils';
import GeneralReport from './general_report';
import HistoricalReport from './historical_report';

const detailsListCard = [
  { field: 'name', label: 'Property Name', skeletonWidth: 150 }, { field: 'address', label: 'Address', skeletonWidth: 200 },
  { field: 'phone_number', label: 'Phone number', skeletonWidth: 100 }, { field: 'website', label: 'Website', type: 'link', skeletonWidth: 150 },
  { field: 'type', label: 'Property Type', skeletonWidth: 100 }, { field: 'market', label: 'Market', skeletonWidth: 100 }, { field: 'submarket', label: 'Submarket', skeletonWidth: 100 },
  { field: 'completed_units_count', label: 'Currently Completed Units', skeletonWidth: 50 },
  { field: 'units_count', label: 'Number of units', skeletonWidth: 50 }, { field: 'occupancy', label: 'LTN Occupancy', type: 'percent', skeletonWidth: 50 },
];

const PropertyReport: FC<RouteComponentProps> = ({ location: { pathname } }) => {
  const [isStarActive, toggleStar] = useState(false);
  const [activeTab, setActiveTab] = useState('General');
  const [dropdownOpen, setDropDownOpen] = useState(false);
  const [reportSettings, setReportSettings] = useState({ reportingPeriod: 'Last 12 months', reportingGroup: 'Monthly' });

  const dispatch = useDispatch();
  const isPropertiesDetailLoaded = useSelector(state => state.properties.isPropertiesDetailLoaded);
  const propertiesDetail = useSelector(state => state.properties.propertiesDetail);
  const isAlertLoaded = useSelector(state => state.properties.isAlertLoaded);
  const alertSubscriptions = useSelector(state => state.properties.alertSubscriptions);
  const watchlist = useSelector(state => state.watchlist.watchlist);
  const isSubmitting = useSelector(state => state.watchlist.isSubmitting);
  const isWatchlistLoaded = useSelector(state => state.watchlist.isWatchlistLoaded);

  const { getPropertiesDetail, getAlertSubscriptions } = propertiesActions;
  const { getWatchlist, updateWatchlist } = watchlistActions;

  const recentLogs = isAlertLoaded ? flatten(alertSubscriptions.map(el => el.logs.map(log => ({ ...log, alertId: el.id })))) : [];
  const filteredRecentLogs = sortBy(recentLogs as PropertyAlert[], el => el.sent_on).reverse().splice(0, 5);

  useEffect(() => {
    const propertyId = pathname.split('/').pop();
    dispatch(getPropertiesDetail(Number(propertyId)));
    dispatch(getAlertSubscriptions(Number(propertyId)));
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
    if (isWatchlistLoaded && isPropertiesDetailLoaded) {
      const isWatchlist = watchlist.properties.find(el => el.id === propertiesDetail.id && el.is_stored);
      toggleStar(!!isWatchlist);
      dispatch(updateWatchlist({ object_type: 'property', object_id: propertiesDetail.id }, () => null));
    }
  }, [isWatchlistLoaded, isPropertiesDetailLoaded]);

  const handleToggleStar = () => {
    toggleStar(!isStarActive);
    dispatch(updateWatchlist({ object_type: 'property', object_id: propertiesDetail.id, is_stored: !isStarActive }));
  };

  const renderSkeleton = () => (
    times(3, i => (
      <ItemValue className={i < 2 ? 'mg-b-2' : ''} key={`name-${i}`}>
        <Skeleton width={100} height={12} style={{ borderRadius: '6px' }} />
      </ItemValue>
    ))
  );

  const isDisabledReportingGroup = reportSettingsFilters.exceptPeriod.includes(reportSettings.reportingPeriod);

  const renderContentHeader = () => (
    <ContentHeader>
      <div className="mr-auto">
        <AppBreadcrumb appRoutes={compete} />
        {isPropertiesDetailLoaded ?
          <div className="d-flex align-items-center">
            <ContentTitle className="mr-5">{propertiesDetail.name}</ContentTitle>
            <CompeteStar isActive={isStarActive} disabled={isSubmitting}><i className={isStarActive ? 'ri-star-fill' : 'ri-star-line'} onClick={handleToggleStar} /></CompeteStar>
          </div> :
          <Skeleton width={200} height={12} style={{ borderRadius: '6px' }} />}
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
                {isPropertiesDetailLoaded && propertiesDetail.is_lease_up && <LeaseUp>Lease Up</LeaseUp>}
              </CardHeaderWrapper>
            </CardHeader>
            <CardBody>
              {detailsListCard.map((item, index) => (
                isPropertiesDetailLoaded ?
                  !!propertiesDetail[item.field] &&
                  <div className={`position-relative ${index > 0 ? 'mt-20' : ''}`} key={index}>
                    <ItemLabel>{item.label}</ItemLabel>
                    <ItemValue>
                      {!['percent', 'link'].includes(item.type) && propertiesDetail[item.field]}
                      {item.type === 'percent' && `${percentFormat(propertiesDetail[item.field])}%`}
                      {item.type === 'link' && (
                        <React.Fragment>
                          <NoWrap>
                            {propertiesDetail[item.field]}
                          </NoWrap>
                          <ItemLink href={propertiesDetail.website.includes('http') ? propertiesDetail.website : `http://${propertiesDetail.website}`} target="_blank">
                            <i className="ri-external-link-line" />
                          </ItemLink>
                        </React.Fragment>
                      )}
                    </ItemValue>
                  </div> :
                  <div className={`position-relative ${index > 0 ? 'mt-20' : ''}`} key={index}>
                    <ItemLabel>{item.label}</ItemLabel>
                    <ItemValue>
                      <Skeleton width={item.skeletonWidth} height={12} style={{ borderRadius: '6px' }} />
                    </ItemValue>
                  </div>
              ))}
            </CardBody>
          </CardBasic>
          <CardBasic className="mt-20">
            <CardHeader>
              <CardTitle xs>Alert Subscriptions</CardTitle>
            </CardHeader>
            <CardBody>
              {isAlertLoaded && !alertSubscriptions.length ?
                <CompeteEmpty
                  icon="ri-notification-2-line"
                  title="No alerts"
                  text="You don't have any alerts enabled for this property yet."
                  isCenter
                /> :
                <React.Fragment>
                  <div className="position-relative">
                    <ItemLabel>Active Alerts</ItemLabel>
                    {isAlertLoaded ?
                      alertSubscriptions.map((el, i) => (
                        <ItemValue className={i < alertSubscriptions.length - 1 ? 'mg-b-2' : ''} key={`name-${i}`}>
                          {el.name}
                        </ItemValue>
                      )) :
                      renderSkeleton()}
                  </div>
                  <div className="position-relative">
                    <ItemLabel>Recent Alert Logs</ItemLabel>
                    {isAlertLoaded ?
                      filteredRecentLogs.map(log => (
                        <ItemValue className="mg-b-2" key={log.id}>
                          Alert #{log.id} ({moment(log.sent_on).format('ll')})
                          <ItemLink href={`/${getPropertyId()}/compete/alerts/${log.alertId}/${log.id}`}>
                            <i className="ri-external-link-line" />
                          </ItemLink>
                        </ItemValue>
                      )) :
                      renderSkeleton()}
                  </div>
                </React.Fragment>
              }
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

export default withRouter(PropertyReport);
