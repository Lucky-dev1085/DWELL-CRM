import React, { useState, FC } from 'react';
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
import { chartTableViewColumns, chartConfigs, calculateBreakdown, currencyFormat, reportSettingsFilters, percentFormat } from 'compete/constants';
import { HistoricalChart, Filters } from 'src/interfaces';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface RentHistoryProps {
  isRentLoaded: boolean,
  historicalRent: HistoricalChart,
  filters: Filters,
  setFilters: (filter: Filters) => void,
  isMonthlyReport: boolean,
  isRotateLabel: boolean,
}

const RentHistory: FC<RentHistoryProps> = ({ isRentLoaded, historicalRent, filters, setFilters, isMonthlyReport, isRotateLabel }) => {
  const [rentHistoryDropdown, toggleDropdownRentHistory] = useState(false);
  const [tableViews, toggleTableViews] = useState(false);

  return (
    <CardBasic>
      <CardHeader>
        <div className="mr-auto">
          <CardTitle xs className="mb-5">Rent History</CardTitle>
          {isRentLoaded ?
            <CardSubTitle>Reporting Period: {moment(historicalRent.chart_values[0].start_date).format('LL')} - {moment().format('LL')}</CardSubTitle> :
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
                  selected={filters.rentHistory}
                  optionList={reportSettingsFilters.showRentForOptions}
                  onChange={selected => setFilters({ ...filters, rentHistory: selected })}
                  fieldName="label"
                />
              </Col>
            </Row>
            <Row className="m-row-5 align-items-center mt-10">
              <Col xs="5" className="p-x-5">
                Show rent as
              </Col>
              <Col xs="7" className="p-x-5">
                <CustomSelect
                  selected={filters.showRentAs}
                  optionList={reportSettingsFilters.showRentAs}
                  onChange={selected => setFilters({ ...filters, showRentAs: selected })}
                  fieldName="label"
                />
              </Col>
            </Row>
          </DropdownMenu>
        </Dropdown>
      </CardHeader>
      <CardBody>
        <ChartWrapper>
          {isRentLoaded ?
            <ReactFC {...chartConfigs(historicalRent.chart_values, isMonthlyReport, isRotateLabel)} /> :
            <Skeleton width="100%" height="100%" style={{ borderRadius: '6px' }} />}
        </ChartWrapper>
        <CardTitle xs className="mb-20">Breakdown</CardTitle>
        <Row className="m-row-10 mb-25">
          {isRentLoaded ?
            calculateBreakdown('RENT', historicalRent.chart_values, isMonthlyReport).map((item, i) => (
              <Col xs="2" className="p-x-10" key={i}>
                <BreakdownItem>
                  <h2>${currencyFormat(item.value)}</h2>
                  <BreakdownLabel>
                    {item.type}
                  </BreakdownLabel>
                  <small>{item.date}</small>
                </BreakdownItem>
              </Col>
            )) :
            <BreakdownSkeleton number={5} colSize={2} />}
          {isRentLoaded &&
            <React.Fragment>
              <Col xs="2" className="p-x-10">
                <BreakdownItem>
                  <h2>{historicalRent.net_rent > 0 ? '+' : '-'}${currencyFormat(Math.abs(historicalRent.net_rent))}</h2>
                  <BreakdownLabel>
                    NET RENT
                  </BreakdownLabel>
                  <small>Entire Period</small>
                </BreakdownItem>
              </Col>
              <Col className="p-x-10">
                <BreakdownItem>
                  <h2>{historicalRent.net_rent_change > 0 && '+'}{percentFormat(historicalRent.net_rent_change)}%</h2>
                  <BreakdownLabel>
                    NET RENT CHANGE
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
              tableData={isRentLoaded ? historicalRent.chart_values.map((el, i) => ({ ...el, id: i + 1 })) : []}
              tableColumns={chartTableViewColumns('Rent', 'value', isMonthlyReport)}
              size={100}
            />
          </TableWrapper>
        </TableContainer>
      </CardBody>
    </CardBasic>
  );
};

export default RentHistory;
