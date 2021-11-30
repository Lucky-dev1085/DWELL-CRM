import React, { useState, useEffect, FC } from 'react';
import { AppBreadcrumb } from '@coreui/react';
import { useDispatch, useSelector } from 'react-redux';
import { CardHeader, CardBody, Row, Col } from 'reactstrap';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { compete } from 'src/routes';
import moment from 'moment';
import { get } from 'lodash';
import alertAction from 'compete/actions/alert';
import exploreMarketsAction from 'compete/actions/explore_markets';
import { ContentTitle, CardTitle, ContentContainer, ContentHeader, ItemLabel, ItemValue, AlertStatus } from 'compete/views/styles';
import { CustomTable, AlertModal, CompeteEmpty } from 'compete/components';
import { CardBasic, TableWrapper } from 'compete/components/common';
import { stringToCapitalize, unitTypeLabels } from 'compete/constants';
import { EditButton, RemoveButton } from './styles';
import { alertSummaryColumns, defaultAlertColumns, defaultAlertData } from './utils';
import DeleteAlertModal from './delete_modal';

const detailsListCard = [
  { field: 'name', label: 'Alert Name', skeletonWidth: 150 }, { field: 'type', label: 'Type', skeletonWidth: 50, type: 'lower' },
  { field: 'condition_subject', label: 'Tracking', skeletonWidth: 50, type: 'lower' }, { field: 'condition_type', label: 'Condition', skeletonWidth: 50, type: 'condition' },
  { field: 'baseline', label: 'Baseline', skeletonWidth: 80, type: 'lower' }, { field: 'tracked_assets', label: 'Tracked Assets', skeletonWidth: 30 },
  { field: 'geo', label: 'Geo', type: 'array', skeletonWidth: 150 }, { field: 'last_sent', label: 'Last Sent On', type: 'date', skeletonWidth: 100 },
  { field: 'status', label: 'Status', type: 'status', skeletonWidth: 50 },
];

const AlertsSummary: FC<RouteComponentProps> = ({ history: { push }, location: { pathname } }) => {
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const dispatch = useDispatch();
  const isAlertLoaded = useSelector(state => state.alert.isAlertLoaded);
  const alert = useSelector(state => state.alert.alert);
  const { getAlertById } = alertAction;
  const { getExploreMarketsList } = exploreMarketsAction;

  const alertId = pathname.split('/').pop();

  useEffect(() => {
    dispatch(getAlertById(Number(alertId)));
    dispatch(getExploreMarketsList());
  }, []);

  const handleRowClick = (row) => {
    push(`${pathname}/${row.id}`);
  };

  const renderContentHeader = () => (
    <ContentHeader>
      <div className="mr-auto">
        <AppBreadcrumb appRoutes={compete} />
        {isAlertLoaded ?
          <div className="d-flex align-items-center">
            <ContentTitle className="mr-5">{alert.name}</ContentTitle>
          </div> :
          <Skeleton width={200} height={12} style={{ borderRadius: '6px' }} />}
      </div>
      <RemoveButton onClick={() => setShowRemoveModal(true)}><i className="ri-delete-bin-line" /></RemoveButton>
    </ContentHeader>
  );

  return (
    <ContentContainer>
      {renderContentHeader()}
      <Row className="m-row-10">
        <Col xs="3" className="p-x-10">
          <CardBasic>
            <CardHeader>
              <CardTitle xs>Details</CardTitle>
              <EditButton onClick={() => setShowAlertModal(true)}>
                <i className="ri-pencil-line" />
                Edit
              </EditButton>
            </CardHeader>
            <CardBody>
              {detailsListCard.map((item, index) => (
                isAlertLoaded ?
                  !!alert[item.field] &&
                  <div className={`position-relative ${index > 0 ? 'mt-20' : ''}`} key={index}>
                    <ItemLabel>{item.label}</ItemLabel>
                    <ItemValue>
                      {item.type === 'status' && <AlertStatus active={alert[item.field] === 'ACTIVE'}>{alert[item.field].toLowerCase()}</AlertStatus>}
                      {item.type === 'array' && alert[item.field].join(', ')}
                      {item.type === 'lower' && stringToCapitalize(alert[item.field])}
                      {item.type === 'date' && moment(alert[item.field]).format('lll')}
                      {item.type === 'condition' && `${stringToCapitalize(alert[item.field])} by ${alert.condition_value}% ${alert.condition_subject === 'RENT' ? `for ${alert.condition_unit_types.map(el => unitTypeLabels[el]).join(', ')}` : ''}`}
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
            </CardBody>
          </CardBasic>
        </Col>
        <Col xs="9" className="p-x-10">
          <CardBasic>
            <CardHeader>
              <CardTitle xs>Alert Log</CardTitle>
            </CardHeader>
            <CardBody>
              {isAlertLoaded && !get(alert, 'logs', []).length ?
                <CompeteEmpty
                  icon="ri-notification-2-line"
                  title="No alert Logs"
                  text="You don't have any alert logs."
                /> :
                <TableWrapper paginationHidden={get(alert, 'logs', []).length < 20}>
                  <CustomTable
                    tableData={isAlertLoaded ? alert.logs : defaultAlertData()}
                    tableColumns={isAlertLoaded ? alertSummaryColumns : defaultAlertColumns}
                    onClickRow={handleRowClick}
                    size={20}
                  />
                </TableWrapper>}
            </CardBody>
          </CardBasic>
        </Col>
      </Row>
      {showAlertModal && (
        <AlertModal
          show={showAlertModal}
          onClose={() => setShowAlertModal(false)}
          isEdit
          editAlert={alert}
        />
      )}
      {showRemoveModal && (
        <DeleteAlertModal
          show={showRemoveModal}
          handleClose={() => setShowRemoveModal(false)}
          alertName={alert && alert.name}
        />
      )}
    </ContentContainer>
  );
};

export default withRouter(AlertsSummary);
