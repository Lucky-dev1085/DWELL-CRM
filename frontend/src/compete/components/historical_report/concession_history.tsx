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
import { asAmountRent, chartTableViewColumns, chartConfigs, calculateBreakdown, currencyFormat, percentFormat } from 'compete/constants';
import { HistoricalChart, Filters } from 'src/interfaces';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface ConcessionHistoryProps {
  isConcessionLoaded: boolean,
  historicalConcession: HistoricalChart,
  filters: Filters,
  setFilters: (filter: Filters) => void,
  isMonthlyReport: boolean,
  isRotateLabel: boolean,
}

const ConcessionHistory: FC<ConcessionHistoryProps> = ({ isConcessionLoaded, historicalConcession, filters, setFilters, isMonthlyReport, isRotateLabel }) => {
  const [concessionsHistoryDropdown, toggleDropdownConcessionsHistory] = useState(false);
  const [tableViews, toggleTableViews] = useState(false);

  const isPercentConcession = filters.concessionsHistory.value === 'RATE';
  const concessionType = isPercentConcession ? 'percent' : 'currency';

  return (
    <CardBasic className="mt-20">
      <CardHeader>
        <div className="mr-auto">
          <CardTitle xs className="mb-5">Concessions History</CardTitle>
          {isConcessionLoaded ?
            <CardSubTitle>Reporting Period: {moment(historicalConcession.chart_values[0].start_date).format('LL')} - {moment().format('LL')}</CardSubTitle> :
            <Skeleton width={300} style={{ borderRadius: '6px' }} />}
        </div>
        <Dropdown isOpen={concessionsHistoryDropdown} toggle={() => toggleDropdownConcessionsHistory(!concessionsHistoryDropdown)} $setting>
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
                  selected={filters.concessionsHistory}
                  optionList={asAmountRent}
                  onChange={selected => setFilters({ ...filters, concessionsHistory: selected })}
                  fieldName="label"
                />
              </Col>
            </Row>
          </DropdownMenu>
        </Dropdown>
      </CardHeader>
      <CardBody>
        <ChartWrapper>
          {isConcessionLoaded ?
            <ReactFC {...chartConfigs(historicalConcession.chart_values, isMonthlyReport, isRotateLabel, concessionType)} /> :
            <Skeleton width="100%" height="100%" style={{ borderRadius: '6px' }} />}
        </ChartWrapper>
        <CardTitle xs className="mb-20">Breakdown</CardTitle>
        <Row className="m-row-10 mb-25">
          {isConcessionLoaded ?
            calculateBreakdown('CONCESSION', historicalConcession.chart_values, isMonthlyReport).map((item, i) => (
              <Col xs="2" className="p-x-10" key={i}>
                <BreakdownItem>
                  <h2>{!isPercentConcession && '$'}{currencyFormat(item.value)}{isPercentConcession && '%'}</h2>
                  <BreakdownLabel>
                    {item.type}
                  </BreakdownLabel>
                  <small>{item.date}</small>
                </BreakdownItem>
              </Col>
            )) :
            <BreakdownSkeleton number={5} colSize={2} />}
          {isConcessionLoaded &&
              <React.Fragment>
                <Col xs="2" className="p-x-10">
                  <BreakdownItem>
                    <h2>
                      {historicalConcession.net_concession > 0 ? '+' : '-'}
                      {isPercentConcession ? `${percentFormat(Math.abs(historicalConcession.net_concession))}%` : `$${currencyFormat(Math.abs(historicalConcession.net_concession))}`}
                    </h2>
                    <BreakdownLabel>
                      NET CONCESSION
                    </BreakdownLabel>
                    <small>Entire Period</small>
                  </BreakdownItem>
                </Col>
                <Col className="p-x-10">
                  <BreakdownItem>
                    <h2>{historicalConcession.net_concession_rent > 0 && '+'}{percentFormat(historicalConcession.net_concession_rent)}%</h2>
                    <BreakdownLabel>
                      NET CONCESSION CHANGE
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
              tableData={isConcessionLoaded ? historicalConcession.chart_values.map((el, i) => ({ ...el, id: i + 1 })) : []}
              tableColumns={chartTableViewColumns('Concession', 'value', isMonthlyReport, !isPercentConcession)}
              size={100}
            />
          </TableWrapper>
        </TableContainer>
      </CardBody>
    </CardBasic>
  );
};

export default ConcessionHistory;
