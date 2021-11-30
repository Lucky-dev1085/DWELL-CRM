import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { CardHeader, CardBody } from 'reactstrap';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { get, sum } from 'lodash';
import alertAction from 'compete/actions/alert';
import { CardTitle } from 'compete/views/styles';
import { CardBasic, TableWrapper } from 'compete/components/common';
import { RemotePaginationTable } from 'compete/components';
import { reportSettingsFilters } from 'compete/constants';
import { ThresholdLog } from 'src/interfaces';
import { thresholdColumns, defaultThresholdData, defaultThresholdColumns } from './utils';
import { TableTitle } from './styles';

interface ThresholdLogProps extends RouteComponentProps {
  columnName: string,
  baseline: string,
}

const ThresholdLog: FC<ThresholdLogProps> = ({ location: { pathname }, columnName, baseline }) => {
  const isAlertLogLoaded = useSelector(state => state.alert.isAlertLogLoaded);
  const alertLog = useSelector(state => state.alert.alertLog);
  const alertLogCount = useSelector(state => state.alert.alertLogCount);
  const isUnitTypesLogLoaded = useSelector(state => state.alert.isUnitTypesLogLoaded);
  const unitTypesLog = useSelector(state => state.alert.unitTypesLog);
  const unitTypesLogCount = useSelector(state => state.alert.unitTypesLogCount);
  const { getAlertLogDetail, getAlertLogDetailByUnitType } = alertAction;

  const alertLogId = pathname.split('/').pop();
  const isRentCondition = baseline === 'Rent';
  const sumLogs = isRentCondition && sum(Object.values(unitTypesLogCount));

  return (
    <CardBasic>
      <CardHeader>
        <CardTitle xs>Properties with condition met ({isRentCondition ? sumLogs : get(alertLog, 'count', 0)})</CardTitle>
      </CardHeader>
      <CardBody>
        {isRentCondition ?
          reportSettingsFilters.showRentForOptions.map((el, index) => {
            const isLoaded = isUnitTypesLogLoaded[el.value];
            const count = unitTypesLogCount[el.value] || 0;
            const logData = unitTypesLog[el.value];
            const isHide = isLoaded && !count;
            return (
              <React.Fragment key={index}>
                <TableTitle className={index ? 'mt-10' : ''} hidden={isHide}>{el.label}</TableTitle>
                <TableWrapper paginationHidden={count < 20} hidden={isHide}>
                  <RemotePaginationTable
                    data={isLoaded ? logData : defaultThresholdData()}
                    totalSize={count}
                    columns={isLoaded ? thresholdColumns(columnName, baseline) : defaultThresholdColumns}
                    getData={getAlertLogDetailByUnitType}
                    hideSizePerPage
                    id={alertLogId}
                    filters={el.value}
                    filterField="unit_type"
                  />
                </TableWrapper>
              </React.Fragment>
            );
          }) :
          <TableWrapper paginationHidden={alertLogCount < 20}>
            <RemotePaginationTable
              data={isAlertLogLoaded ? alertLog.results : defaultThresholdData()}
              totalSize={alertLogCount}
              columns={isAlertLogLoaded ? thresholdColumns(columnName, baseline) : defaultThresholdColumns}
              getData={getAlertLogDetail}
              hideSizePerPage
              id={alertLogId}
            />
          </TableWrapper>}
      </CardBody>
    </CardBasic>
  );
};

export default withRouter(ThresholdLog);
