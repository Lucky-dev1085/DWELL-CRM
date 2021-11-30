import React, { useState, FC } from 'react';
import { AppBreadcrumb } from '@coreui/react';
import { useSelector } from 'react-redux';
import { CardHeader, CardBody } from 'reactstrap';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import alertAction from 'compete/actions/alert';
import { compete } from 'src/routes';
import { ContentTitle, CardTitle, ContentContainer, ContentHeader } from 'compete/views/styles';
import { AlertModal, RemotePaginationTable, CompeteEmpty } from 'compete/components';
import { CardBasic, TableWrapper } from 'compete/components/common';
import { getPropertyId } from 'src/utils';
import { alertSubscriptionColumns, defaultAlertData, defaultAlertColumns } from './utils';
import { Button } from './styles';

const AlertsSubscriptions: FC<RouteComponentProps> = ({ history: { push } }) => {
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [isReloadAlerts, toggleReloadAlerts] = useState(false);

  const isAlertSubscriptionsLoaded = useSelector(state => state.alert.isAlertSubscriptionsLoaded);
  const countAlerts = useSelector(state => state.alert.countAlerts);
  const alertSubscriptions = useSelector(state => state.alert.alertSubscriptions);
  const { getAlertSubscriptions } = alertAction;

  const rowEvents = {
    onClick: (e, row) => {
      if (row.id) {
        push(`/${getPropertyId()}/compete/alerts/${row.id}`);
      }
    },
  };

  const renderContentHeader = () => (
    <ContentHeader>
      <div className="mr-auto">
        <AppBreadcrumb appRoutes={compete} />
        <div className="d-flex align-items-center">
          <ContentTitle className="mr-5">Alerts</ContentTitle>
        </div>
      </div>
      <Button color="primary" onClick={() => setShowAlertModal(true)}>
        <i className="ri-add-circle-fill" />
        New Alert
      </Button>
    </ContentHeader>
  );

  return (
    <ContentContainer>
      {renderContentHeader()}
      <CardBasic>
        <CardHeader>
          <CardTitle xs>Subscriptions</CardTitle>
        </CardHeader>
        <CardBody>
          {isAlertSubscriptionsLoaded && !countAlerts ?
            <CompeteEmpty
              icon="ri-notification-2-line"
              title="No alerts"
              text="You don't have any alerts enabled for this property yet."
            /> :
            <TableWrapper paginationHidden={countAlerts < 20}>
              <RemotePaginationTable
                data={isAlertSubscriptionsLoaded ? alertSubscriptions : defaultAlertData()}
                totalSize={countAlerts}
                columns={isAlertSubscriptionsLoaded ? alertSubscriptionColumns : defaultAlertColumns}
                getData={getAlertSubscriptions}
                rowEvents={rowEvents}
                hideSizePerPage
                isListRequest
                isReloadTable={isReloadAlerts}
              />
            </TableWrapper>
          }
        </CardBody>
      </CardBasic>
      {showAlertModal && (
        <AlertModal
          reload={() => toggleReloadAlerts(!isReloadAlerts)}
          show={showAlertModal}
          onClose={() => setShowAlertModal(false)}
        />
      )}
    </ContentContainer>
  );
};

export default withRouter(AlertsSubscriptions);
