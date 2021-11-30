import React, { useState, useEffect, FC } from 'react';
import { useSelector } from 'react-redux';
import { CardHeader, CardBody, Row, Col, DropdownMenu, DropdownToggle } from 'reactstrap';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import alertAction from 'compete/actions/alert';
import { CardTitle } from 'compete/views/styles';
import { CardBasic, TableWrapper, Dropdown } from 'compete/components/common';
import { RemotePaginationTable } from 'compete/components';
import { CustomSelect } from 'src/common';
import { reportSettingsFilters, compareValue, ALERT_RENT } from 'compete/constants';
import { rentLogColumns, defaultRentData, defaultRentLogColumns } from './utils';

const defaultFilter = { showRentAs: reportSettingsFilters.showRentAs[0], showRentFor: reportSettingsFilters.showRentForOptions[0] };

const Rent: FC<RouteComponentProps> = ({ location: { pathname } }) => {
  const [dropdownOpen, setDropDownOpen] = useState(false);
  const [reportSettings, setReportSettings] = useState(JSON.parse(localStorage.getItem(ALERT_RENT)) || defaultFilter);

  const isAlertLogLoaded = useSelector(state => state.alert.isAlertLogLoaded);
  const alertLog = useSelector(state => state.alert.alertLog);
  const alertLogCount = useSelector(state => state.alert.alertLogCount);
  const { getAlertLogDetail } = alertAction;

  useEffect(() => {
    localStorage.setItem(ALERT_RENT, JSON.stringify(reportSettings));
  }, [reportSettings]);

  const isUnit = reportSettings.showRentAs.label === 'Per Unit';

  const prepareData = data => (
    data.results.map((el) => {
      const combinedRent = isUnit ? el.average_rent : el.average_rent_per_sqft;
      const lastWeek = isUnit ? el.average_rent_last_week : el.average_rent_per_sqft_last_week;
      const lastMonth = isUnit ? el.average_rent_last_4_weeks : el.average_rent_per_sqft_last_4_weeks;

      return ({
        ...el,
        combined_rent: combinedRent,
        combined_rent_last_week_diff: lastWeek ? compareValue(combinedRent, lastWeek) : 0,
        combined_rent_last_4_weeks_diff: lastMonth ? compareValue(combinedRent, lastMonth) : 0,
        combined_rent_last_week_delta: combinedRent - lastWeek,
        combined_rent_last_4_weeks_delta: combinedRent - lastMonth,
        combined_rent_last_week: lastWeek,
        combined_rent_last_4_weeks: lastMonth,
      });
    }));

  return (
    <CardBasic $dropdownHeader>
      <CardHeader>
        <CardTitle xs>Rent</CardTitle>
        <Dropdown isOpen={dropdownOpen} toggle={() => setDropDownOpen(!dropdownOpen)} $setting>
          <DropdownToggle>
            <i className="ri-settings-fill" />
          </DropdownToggle>
          <DropdownMenu right>
            <h6 className="mb-15">Report Settings</h6>
            <Row className="m-row-5 align-items-center">
              <Col xs="5" className="p-x-5">
                Show rent as
              </Col>
              <Col xs="7" className="p-x-5">
                <CustomSelect
                  selected={reportSettings.showRentAs}
                  optionList={reportSettingsFilters.showRentAs}
                  onChange={selected => setReportSettings({ ...reportSettings, showRentAs: selected })}
                  fieldName="label"
                />
              </Col>
            </Row>
            <Row className="m-row-5 align-items-center mt-10">
              <Col xs="5" className="p-x-5">
                Show rent for
              </Col>
              <Col xs="7" className="p-x-5">
                <CustomSelect
                  selected={reportSettings.showRentFor}
                  optionList={reportSettingsFilters.showRentForOptions}
                  onChange={selected => setReportSettings({ ...reportSettings, showRentFor: selected })}
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
            data={isAlertLogLoaded ? prepareData(alertLog) : defaultRentData()}
            totalSize={alertLogCount}
            columns={isAlertLogLoaded ? rentLogColumns(reportSettings.showRentFor.label, isUnit) : defaultRentLogColumns}
            getData={getAlertLogDetail}
            hideSizePerPage
            id={pathname.split('/').pop()}
            filters={reportSettings.showRentFor.value}
            filterField="unit_type"
          />
        </TableWrapper>
      </CardBody>
    </CardBasic>
  );
};

export default withRouter(Rent);
