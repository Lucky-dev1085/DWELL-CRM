import React, { useState, useEffect, FC } from 'react';
import { AppBreadcrumb } from '@coreui/react';
import { useDispatch, useSelector } from 'react-redux';
import { CardHeader, CardBody, Row, Col } from 'reactstrap';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import moment from 'moment';
import { compete } from 'src/routes';
import { ContentTitle, CardTitle, ContentContainer, ContentHeader, TabGroup, TabButton, ItemLabel, ItemValue } from 'compete/views/styles';
import { CardBasic } from 'compete/components/common';
import alertAction from 'compete/actions/alert';
import notificationAction from 'dwell/actions/notification';
import { stringToCapitalize, ALERT_TAB, unitTypeLabels } from 'compete/constants';
import { AlertInfo } from 'src/interfaces';
import Rent from './rent';
import Occupancy from './occupancy';
import Concession from './concession';
import ThresholdLog from './threshold_log';

const detailsListCard = [
  { field: 'name', label: 'Alert Name', skeletonWidth: 150 }, { field: 'logs', label: 'Time Period', skeletonWidth: 100, type: 'period' },
  { field: 'tracked_assets', label: 'Tracked Assets', skeletonWidth: 30 }, { field: 'geo', label: 'Geo', type: 'array', skeletonWidth: 150 },
  { field: 'condition_subject', label: 'Tracking', skeletonWidth: 50, type: 'lower' }, { field: 'condition_type', label: 'Condition', skeletonWidth: 50, type: 'condition' },
  { field: 'baseline', label: 'Baseline', skeletonWidth: 80, type: 'lower' },
];

const AlertLog: FC<RouteComponentProps> = ({ location: { pathname } }) => {
  const [activeTab, setActiveTab] = useState(localStorage.getItem(ALERT_TAB) || 'Rent');

  const dispatch = useDispatch();
  const isAlertLoaded = useSelector(state => state.alert.isAlertLoaded);
  const alert = useSelector(state => state.alert.alert);
  const notifications = useSelector(state => state.notification.notifications);

  const { getAlertById } = alertAction;
  const { updateNotificationById } = notificationAction;

  useEffect(() => {
    const alertId = Number(pathname.split('/').slice(-2, -1)[0]);
    if (!alert || alert.id !== alertId) {
      dispatch(getAlertById(alertId));
    }
  }, []);

  useEffect(() => {
    const notification = notifications.find(el => pathname.includes(el.redirect_url));

    if (notification && !notification.is_read) {
      dispatch(updateNotificationById(notification.id, { is_read: true, is_display: notification.is_display }));
    }
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(ALERT_TAB, activeTab);
  }, [activeTab]);

  const isBenchmarkType = isAlertLoaded && alert.type === 'BENCHMARK';
  const alertLogId = pathname.split('/').pop();
  const currentLog = isAlertLoaded && (alert.logs.find(el => el.id === Number(alertLogId)) || {} as AlertInfo);

  const renderContentHeader = () => (
    <ContentHeader>
      <div className="mr-auto">
        <AppBreadcrumb appRoutes={compete} />
        <div className="d-flex align-items-center">
          <ContentTitle className="mr-5">Alert #{alertLogId}</ContentTitle>
        </div>
      </div>
      {isBenchmarkType &&
        <TabGroup>
          <TabButton active={activeTab === 'Rent'} onClick={() => setActiveTab('Rent')}>
            Rent
          </TabButton>
          <TabButton active={activeTab === 'Occupancy'} onClick={() => setActiveTab('Occupancy')}>
            Occupancy
          </TabButton>
          <TabButton active={activeTab === 'Concession'} onClick={() => setActiveTab('Concession')}>
            Concession
          </TabButton>
        </TabGroup>}
    </ContentHeader>
  );

  const renderActiveTab = () => {
    if (isBenchmarkType) {
      switch (activeTab) {
        case 'Rent':
          return <Rent />;
        case 'Occupancy':
          return <Occupancy />;
        case 'Concession':
          return <Concession />;
        default:
          return '';
      }
    } else {
      const columnName = isAlertLoaded ? `${stringToCapitalize(currentLog.baseline)}'s ${stringToCapitalize(currentLog.condition_subject)} baseline` : '';
      return <ThresholdLog columnName={columnName} baseline={isAlertLoaded ? stringToCapitalize(currentLog.condition_subject) : ''} />;
    }
  };

  const isRenderItem = field => (!!alert[field] && (isBenchmarkType || field !== 'logs'));

  return (
    <ContentContainer>
      {renderContentHeader()}
      <Row className="m-row-10">
        <Col xs="3" className="p-x-10">
          <CardBasic>
            <CardHeader>
              <CardTitle xs>Details</CardTitle>
            </CardHeader>
            <CardBody>
              {detailsListCard.map((item, index) => (
                isAlertLoaded ?
                  isRenderItem(item.field) &&
                  <div className={`position-relative ${index > 0 ? 'mt-20' : ''}`} key={index}>
                    <ItemLabel>{item.label}</ItemLabel>
                    <ItemValue>
                      {item.type === 'array' && alert[item.field].join(', ')}
                      {item.type === 'date' && moment(alert[item.field]).format('lll')}
                      {item.type === 'lower' && stringToCapitalize(alert[item.field])}
                      {item.type === 'condition' && `${stringToCapitalize(alert[item.field])} by ${alert.condition_value}% ${alert.condition_subject === 'RENT' ? `for ${alert.condition_unit_types.map(el => unitTypeLabels[el]).join(', ')}` : ''}`}
                      {item.type === 'period' && `${moment(currentLog.start).format('ll')} - ${moment(currentLog.end).format('ll')}`}
                      {!item.type && alert[item.field]}
                    </ItemValue>
                  </div> :
                  <div className={`position-relative ${index > 0 ? 'mt-20' : ''}`} key={index}>
                    <ItemLabel>{item.label}</ItemLabel>
                    <ItemValue>
                      <Skeleton width={item.skeletonWidth} height={12} style={{ borderRadius: '6px' }} />
                    </ItemValue>
                  </div>
              ))}
              {isAlertLoaded ?
                <div className="position-relative mt-20">
                  <ItemLabel>Sent On</ItemLabel>
                  <ItemValue>
                    {moment(currentLog.sent_on).format('lll')}
                  </ItemValue>
                </div> :
                <div className="position-relative mt-20">
                  <ItemLabel>Sent On</ItemLabel>
                  <ItemValue>
                    <Skeleton width={100} height={12} style={{ borderRadius: '6px' }} />
                  </ItemValue>
                </div>}
            </CardBody>
          </CardBasic>
        </Col>
        <Col xs="9" className="p-x-10">
          {renderActiveTab()}
        </Col>
      </Row>
    </ContentContainer>
  );
};

export default withRouter(AlertLog);
