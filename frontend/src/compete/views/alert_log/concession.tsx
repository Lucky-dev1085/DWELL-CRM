import React, { useState, useEffect, FC } from 'react';
import { useSelector } from 'react-redux';
import { CardHeader, CardBody, DropdownMenu, DropdownToggle, Row, Col } from 'reactstrap';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import alertAction from 'compete/actions/alert';
import { CardTitle } from 'compete/views/styles';
import { CardBasic, TableWrapper, Dropdown } from 'compete/components/common';
import { RemotePaginationTable } from 'compete/components';
import { CustomSelect } from 'src/common';
import { asAmountRent, compareValue, ALERT_CONCESSION } from 'compete/constants';
import { concessionLogColumns, defaultConcessionsData, defaultConcessionColumns } from './utils';

const Concession: FC<RouteComponentProps> = ({ location: { pathname } }) => {
  const [showingConcessions, setConcessions] = useState(JSON.parse(localStorage.getItem(ALERT_CONCESSION)) || asAmountRent[0]);
  const [isOpen, toggleDropdown] = useState(false);

  const isAlertLogLoaded = useSelector(state => state.alert.isAlertLogLoaded);
  const alertLog = useSelector(state => state.alert.alertLog);
  const alertLogCount = useSelector(state => state.alert.alertLogCount);
  const { getAlertLogDetail } = alertAction;

  useEffect(() => {
    localStorage.setItem(ALERT_CONCESSION, JSON.stringify(showingConcessions));
  }, [showingConcessions]);

  const calculatedDiff = data => (
    data.results.map((el) => {
      const isAmount = showingConcessions.value === 'AMOUNT';
      const concessionAmount = isAmount ? el.concession_amount : el.concession_avg_rent_percent;
      const lastWeek = isAmount ? el.concession_amount_last_week : el.concession_avg_rent_percent_last_week;
      const lastMonth = isAmount ? el.concession_amount_last_4_weeks : el.concession_avg_rent_percent_last_4_weeks;

      return ({
        ...el,
        concession_amount: concessionAmount,
        concession_amount_last_week_diff: lastWeek ? compareValue(concessionAmount, lastWeek) : 0,
        concession_amount_last_4_weeks_diff: lastMonth ? compareValue(concessionAmount, lastMonth) : 0,
        concession_amount_last_week_delta: concessionAmount - lastWeek,
        concession_amount_last_4_weeks_delta: concessionAmount - lastMonth,
        concession_amount_last_week: lastWeek,
        concession_amount_last_4_weeks: lastMonth,
      });
    }));

  return (
    <CardBasic>
      <CardHeader>
        <CardTitle xs>Concession</CardTitle>
        <Dropdown isOpen={isOpen} toggle={() => toggleDropdown(!isOpen)} $setting>
          <DropdownToggle>
            <i className="ri-settings-fill" />
          </DropdownToggle>
          <DropdownMenu right>
            <h6 className="mb-15">Report Settings</h6>
            <Row className="m-row-5 align-items-center">
              <Col xs="5" className="p-x-5">
                Show concessions as
              </Col>
              <Col xs="7" className="p-x-5">
                <CustomSelect
                  selected={showingConcessions}
                  optionList={asAmountRent}
                  onChange={selected => setConcessions(selected)}
                  fieldName="label"
                />
              </Col>
            </Row>
          </DropdownMenu>
        </Dropdown>
      </CardHeader>
      <CardBody>
        <TableWrapper paginationHidden={alertLogCount < 20} alignMiddle>
          <RemotePaginationTable
            data={isAlertLogLoaded ? calculatedDiff(alertLog) : defaultConcessionsData()}
            totalSize={alertLogCount}
            columns={isAlertLogLoaded ? concessionLogColumns(showingConcessions.value === 'AMOUNT') : defaultConcessionColumns}
            getData={getAlertLogDetail}
            hideSizePerPage
            id={pathname.split('/').pop()}
          />
        </TableWrapper>
      </CardBody>
    </CardBasic>
  );
};

export default withRouter(Concession);
