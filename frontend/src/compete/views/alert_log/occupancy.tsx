import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { CardHeader, CardBody } from 'reactstrap';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import alertAction from 'compete/actions/alert';
import { CardTitle } from 'compete/views/styles';
import { CardBasic, TableWrapper } from 'compete/components/common';
import { RemotePaginationTable } from 'compete/components';
import { compareValue } from 'compete/constants';
import { occupancyLogColumns, defaultOccupancyData, defaultOccupancyColumns } from './utils';

const Occupancy: FC<RouteComponentProps> = ({ location: { pathname } }) => {
  const isAlertLogLoaded = useSelector(state => state.alert.isAlertLogLoaded);
  const alertLog = useSelector(state => state.alert.alertLog);
  const alertLogCount = useSelector(state => state.alert.alertLogCount);
  const { getAlertLogDetail } = alertAction;

  const calculatedDiff = data => (data.results.map(el => ({
    ...el,
    occupancy_last_week_diff: el.occupancy_last_week ? compareValue(el.occupancy, el.occupancy_last_week) : 0,
    occupancy_last_week_delta: el.occupancy - el.occupancy_last_week,
    occupancy_last_4_weeks_diff: el.occupancy_last_4_weeks ? compareValue(el.occupancy, el.occupancy_last_4_weeks) : 0,
    occupancy_last_4_weeks_delta: el.occupancy - el.occupancy_last_4_weeks,
  })));

  return (
    <CardBasic>
      <CardHeader>
        <CardTitle xs>Occupancy</CardTitle>
      </CardHeader>
      <CardBody>
        <TableWrapper paginationHidden={alertLogCount < 20} alignMiddle>
          <RemotePaginationTable
            data={isAlertLogLoaded ? calculatedDiff(alertLog) : defaultOccupancyData()}
            totalSize={alertLogCount}
            columns={isAlertLogLoaded ? occupancyLogColumns : defaultOccupancyColumns}
            getData={getAlertLogDetail}
            hideSizePerPage
            id={pathname.split('/').pop()}
          />
        </TableWrapper>
      </CardBody>
    </CardBasic>
  );
};

export default withRouter(Occupancy);
