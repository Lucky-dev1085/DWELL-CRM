import React, { useState, FC } from 'react';
import { CardHeader, CardBody, Row, Col } from 'reactstrap';
import Skeleton from 'react-loading-skeleton';
import Charts from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'fusioncharts/react-fusioncharts';
import FusionCharts from 'fusioncharts/fusioncharts';
import moment from 'moment';
import { CardTitle, CardSubTitle, ChartWrapper, BreakdownItem, BreakdownLabel, CollapseArea, TableContainer } from 'compete/views/styles';
import { CardBasic, TableWrapper } from 'compete/components/common';
import { CustomTable, BreakdownSkeleton } from 'compete/components';
import { chartTableViewColumns, chartConfigs, calculateBreakdown } from 'compete/constants';
import { HistoricalChart } from 'src/interfaces';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface OccupancyHistoryProps {
  isOccupancyLoaded: boolean,
  historicalOccupancy: HistoricalChart,
  isMonthlyReport: boolean,
  isRotateLabel: boolean,
}

const OccupancyHistory: FC<OccupancyHistoryProps> = ({ isOccupancyLoaded, historicalOccupancy, isMonthlyReport, isRotateLabel }) => {
  const [tableViews, toggleTableViews] = useState(false);

  return (
    <CardBasic className="mt-20">
      <CardHeader>
        <div className="mr-auto">
          <CardTitle xs className="mb-5">Occupancy History</CardTitle>
          {isOccupancyLoaded ?
            <CardSubTitle>Reporting Period: {moment(historicalOccupancy.chart_values[0].start_date).format('LL')} - {moment().format('LL')}</CardSubTitle> :
            <Skeleton width={300} style={{ borderRadius: '6px' }} />}
        </div>
      </CardHeader>
      <CardBody>
        <ChartWrapper>
          {isOccupancyLoaded ?
            <ReactFC {...chartConfigs(historicalOccupancy.chart_values, isMonthlyReport, isRotateLabel, 'percent')} /> :
            <Skeleton width="100%" height="100%" style={{ borderRadius: '6px' }} />}
        </ChartWrapper>
        <CardTitle xs className="mb-20">Breakdown</CardTitle>
        <Row className="m-row-10 mb-25">
          {isOccupancyLoaded ?
            calculateBreakdown('OCCUPANCY', historicalOccupancy.chart_values, isMonthlyReport).map((item, i) => (
              <Col xs="2" className="p-x-10" key={i}>
                <BreakdownItem>
                  <h2>{item.value && item.value.toFixed(1)}%</h2>
                  <BreakdownLabel>
                    {item.type}
                  </BreakdownLabel>
                  <small>{item.date}</small>
                </BreakdownItem>
              </Col>
            )) :
            <BreakdownSkeleton number={5} colSize={2} />}
          {isOccupancyLoaded &&
            <React.Fragment>
              <Col xs="2" className="p-x-10">
                <BreakdownItem>
                  <h2>{historicalOccupancy.net_absorption_unit_change > 0 && '+'}{historicalOccupancy.net_absorption_unit_change}</h2>
                  <BreakdownLabel>
                    NET ABSORPTION
                  </BreakdownLabel>
                  <small>Entire Period</small>
                </BreakdownItem>
              </Col>
              <Col className="p-x-10">
                <BreakdownItem>
                  <h2>{historicalOccupancy.net_absorption_percent_change > 0 && '+'}{historicalOccupancy.net_absorption_percent_change.toFixed(1)}%</h2>
                  <BreakdownLabel>
                    NET ABSORPTION CHANGE
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
              tableData={isOccupancyLoaded ? historicalOccupancy.chart_values.map((el, i) => ({ ...el, id: i + 1 })) : []}
              tableColumns={chartTableViewColumns('Occupancy', 'value', isMonthlyReport, false)}
              size={100}
            />
          </TableWrapper>
        </TableContainer>
      </CardBody>
    </CardBasic>
  );
};

export default OccupancyHistory;
