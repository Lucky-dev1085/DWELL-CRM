import React, { useState, useEffect, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CardHeader, CardBody, Row, Col, DropdownMenu, DropdownToggle } from 'reactstrap';
import Skeleton from 'react-loading-skeleton';
import Charts from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'fusioncharts/react-fusioncharts';
import FusionCharts from 'fusioncharts/fusioncharts';
import moment from 'moment';
import { CardTitle, CardSubTitle, ChartWrapper, BreakdownItem, BreakdownLabel, CollapseArea, TableContainer } from 'compete/views/styles';
import { CardBasic, TableWrapper, Dropdown } from 'compete/components/common';
import { CustomTable, BreakdownSkeleton } from 'compete/components';
import { CustomSelect } from 'src/common';
import { chartTableViewColumns, chartConfigs, calculateBreakdown, currencyFormat, reportSettingsFilters, percentFormat, RENT_COMPARE } from 'compete/constants';
import { ReportSettings } from 'src/interfaces';
import historyAction from 'compete/actions/historical_report';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface RentCompareProps {
  isMonthlyReport: boolean,
  isRotateLabel: boolean,
  commonParams: { period: string, group: string },
  reportSettings: ReportSettings,
  id: number,
}

const RentCompare: FC<RentCompareProps> = ({ isMonthlyReport, isRotateLabel, commonParams, reportSettings, id }) => {
  const [filters, setFilters] = useState(JSON.parse(localStorage.getItem(RENT_COMPARE)) || reportSettingsFilters.showRentForOptions[0]);
  const [rentHistoryDropdown, toggleDropdownRentHistory] = useState(false);
  const [tableViews, toggleTableViews] = useState(false);

  const dispatch = useDispatch();
  const isRentCompareLoaded = useSelector(state => state.historicalReport.isRentCompareLoaded);
  const rentCompare = useSelector(state => state.historicalReport.rentCompare);

  useEffect(() => {
    dispatch(historyAction.getHistoricalUnderOverRent(id, {
      ...commonParams,
      unit_type: filters.value,
    }));
  }, [reportSettings, filters]);

  useEffect(() => {
    localStorage.setItem(RENT_COMPARE, JSON.stringify(filters));
  }, [filters]);

  return (
    <CardBasic className="mt-20">
      <CardHeader>
        <div className="mr-auto">
          <CardTitle xs className="mb-5">Rent Under/Over</CardTitle>
          {isRentCompareLoaded ?
            <CardSubTitle>Reporting Period: {moment(rentCompare.chart_values[0].start_date).format('LL')} - {moment().format('LL')}</CardSubTitle> :
            <Skeleton width={300} style={{ borderRadius: '6px' }} />}
        </div>
        <Dropdown isOpen={rentHistoryDropdown} toggle={() => toggleDropdownRentHistory(!rentHistoryDropdown)} $setting>
          <DropdownToggle>
            <i className="ri-settings-fill" />
          </DropdownToggle>
          <DropdownMenu right>
            <h6 className="mb-15">Report Settings</h6>
            <Row className="m-row-5 align-items-center">
              <Col xs="5" className="p-x-5">
                Show rent for
              </Col>
              <Col xs="7" className="p-x-5">
                <CustomSelect
                  selected={filters}
                  optionList={reportSettingsFilters.showRentForOptions}
                  onChange={selected => setFilters(selected)}
                  fieldName="label"
                />
              </Col>
            </Row>
          </DropdownMenu>
        </Dropdown>
      </CardHeader>
      <CardBody>
        <ChartWrapper>
          {isRentCompareLoaded ?
            <ReactFC {...chartConfigs(rentCompare.chart_values, isMonthlyReport, isRotateLabel)} /> :
            <Skeleton width="100%" height="100%" style={{ borderRadius: '6px' }} />}
        </ChartWrapper>
        <CardTitle xs className="mb-20">Breakdown</CardTitle>
        <Row className="m-row-10 mb-25">
          {isRentCompareLoaded ?
            calculateBreakdown('RENT U/O', rentCompare.chart_values, isMonthlyReport).map((item, i) => (
              <Col xs="2" className="p-x-10" key={i}>
                <BreakdownItem>
                  <h2>{item.value > 0 ? '+' : '-'}${currencyFormat(Math.abs(item.value))}</h2>
                  <BreakdownLabel>
                    {item.type}
                  </BreakdownLabel>
                  <small>{item.date}</small>
                </BreakdownItem>
              </Col>
            )) :
            <BreakdownSkeleton number={5} colSize={2} />}
          {isRentCompareLoaded &&
            <React.Fragment>
              <Col xs="2" className="p-x-10">
                <BreakdownItem>
                  <h2>{rentCompare.net_rent > 0 ? '+' : '-'}${currencyFormat(Math.abs(rentCompare.net_rent))}</h2>
                  <BreakdownLabel>
                    NET RENT U/O
                  </BreakdownLabel>
                  <small>Entire Period</small>
                </BreakdownItem>
              </Col>
              <Col className="p-x-10">
                <BreakdownItem>
                  <h2>{rentCompare.net_rent_change > 0 && '+'}{percentFormat(rentCompare.net_rent_change)}%</h2>
                  <BreakdownLabel>
                    NET RENT U/O CHANGE
                  </BreakdownLabel>
                  <small>Entire Period</small>
                </BreakdownItem>
              </Col>
            </React.Fragment>}
        </Row>
        <CollapseArea active={tableViews} onClick={() => toggleTableViews(!tableViews)}>
          Table View
          <i className="ri-arrow-right-s-line" />
        </CollapseArea>
        <TableContainer show={tableViews}>
          <TableWrapper paginationHidden>
            <CustomTable
              tableData={isRentCompareLoaded ? rentCompare.chart_values.map((el, i) => ({ ...el, id: i + 1 })) : []}
              tableColumns={chartTableViewColumns('Rent U/O', 'value', isMonthlyReport)}
              size={100}
            />
          </TableWrapper>
        </TableContainer>
      </CardBody>
    </CardBasic>
  );
};

export default RentCompare;
