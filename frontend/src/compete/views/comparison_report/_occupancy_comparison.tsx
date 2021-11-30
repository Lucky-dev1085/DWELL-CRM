import React, { useState, FC } from 'react';
import { CardHeader, CardBody, Row, Col } from 'reactstrap';
import Skeleton from 'react-loading-skeleton';
import Charts from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'fusioncharts/react-fusioncharts';
import FusionCharts from 'fusioncharts/fusioncharts';
import moment from 'moment';
import { get } from 'lodash';
import { CardTitle, CardSubTitle, ChartWrapper, BreakdownItem, BreakdownLabel, CollapseArea, TableContainer } from 'compete/views/styles';
import { CardBasic, TableWrapper } from 'compete/components/common';
import { CustomTable, BreakdownSkeleton } from 'compete/components';
import { chartCompareConfigs, chartCompareTableViewColumns, calculateBreakdown } from 'compete/constants';
import { SubjectAsset, HistoricalChart } from 'src/interfaces';
import { ChartLegend, BreakdownContainer, Info } from './styles';
import { calculateCompareData, renderBreakdownDiff } from './utils';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface OccupancyComparisonProps {
  subjectAsset: SubjectAsset,
  comparedAgainst: SubjectAsset,
  occupancyAssetData: HistoricalChart,
  occupancyComparedData: HistoricalChart,
  isMonthlyReport: boolean,
  isRotateLabel: boolean,
}

const OccupancyComparison: FC<OccupancyComparisonProps> = ({ subjectAsset, comparedAgainst, occupancyAssetData, occupancyComparedData, isMonthlyReport, isRotateLabel }) => {
  const [tableViews, toggleTableViews] = useState(false);

  return (
    <CardBasic className="mt-20">
      <CardHeader>
        <div className="mr-auto">
          <CardTitle xs className="mb-5">Occupancy Comparison</CardTitle>
          {occupancyAssetData ?
            <CardSubTitle>Reporting Period: {moment(occupancyAssetData.chart_values[0].start_date).format('LL')} - {moment().format('LL')}</CardSubTitle> :
            <Skeleton width={300} style={{ borderRadius: '6px' }} />}
        </div>
      </CardHeader>
      <CardBody>
        <ChartLegend>
          <li>{subjectAsset.value.name}</li>
          <li>{comparedAgainst.value.name}</li>
        </ChartLegend>
        <ChartWrapper>
          {occupancyAssetData && occupancyComparedData ?
            <ReactFC {...chartCompareConfigs(occupancyAssetData.chart_values, occupancyComparedData.chart_values, isMonthlyReport, isRotateLabel, 'percent')} /> :
            <Skeleton width="100%" height="100%" style={{ borderRadius: '6px' }} />}
        </ChartWrapper>
        <CardTitle xs className="mb-20">Breakdown</CardTitle>
        <BreakdownContainer className="mb-10">
          <Row className="m-row-10">
            <Col xs="12" className="p-x-10 mb-15">
              {subjectAsset.value.name}
            </Col>
            {occupancyAssetData && occupancyComparedData ?
              calculateBreakdown('OCCUPANCY', occupancyAssetData.chart_values, isMonthlyReport, occupancyComparedData.chart_values, true).map((item, i) => (
                <Col xs="2" className="p-x-10" key={i}>
                  <BreakdownItem small>
                    <h2 className="mb-0">{item.value && item.value.toFixed(1)}%</h2>
                    <Info succes={item.infoType === 'success'}>
                      {item.info}
                      <i className={item.infoType === 'success' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} />
                    </Info>
                    <BreakdownLabel>
                      {item.type}
                    </BreakdownLabel>
                    <small>{item.date}</small>
                  </BreakdownItem>
                </Col>
              )) :
              <BreakdownSkeleton number={5} colSize={2} />}
            {occupancyAssetData && occupancyComparedData &&
            <React.Fragment>
              <Col xs="2" className="p-x-10">
                <BreakdownItem small>
                  <h2 className="mb-0">{occupancyAssetData.net_absorption_unit_change > 0 && '+'}{occupancyAssetData.net_absorption_unit_change}</h2>
                  {renderBreakdownDiff(occupancyAssetData, occupancyComparedData, 'net_absorption_unit_change', false, true)}
                  <BreakdownLabel>
                    NET ABSORPTION
                  </BreakdownLabel>
                  <small>Entire Period</small>
                </BreakdownItem>
              </Col>
              <Col className="p-x-10">
                <BreakdownItem small>
                  <h2 className="mb-0">{occupancyAssetData.net_absorption_percent_change > 0 && '+'}{occupancyAssetData.net_absorption_percent_change.toFixed(1)}%</h2>
                  {renderBreakdownDiff(occupancyAssetData, occupancyComparedData, 'net_absorption_percent_change', true, true)}
                  <BreakdownLabel>
                    NET ABSORPTION CHANGE
                  </BreakdownLabel>
                  <small>Entire Period</small>
                </BreakdownItem>
              </Col>
            </React.Fragment>}
          </Row>
        </BreakdownContainer>
        <BreakdownContainer className="mb-25">
          <Row className="m-row-10">
            <Col xs="12" className="p-x-10 mb-15">
              {comparedAgainst.value.name}
            </Col>
            {occupancyComparedData ?
              calculateBreakdown('OCCUPANCY', occupancyComparedData.chart_values, isMonthlyReport).map((item, i) => (
                <Col xs="2" className="p-x-10" key={i}>
                  <BreakdownItem small>
                    <h2>{item.value && item.value.toFixed(1)}%</h2>
                    <BreakdownLabel>
                      {item.type}
                    </BreakdownLabel>
                    <small>{item.date}</small>
                  </BreakdownItem>
                </Col>
              )) :
              <BreakdownSkeleton number={5} colSize={2} />}
            {occupancyComparedData &&
            <React.Fragment>
              <Col xs="2" className="p-x-10">
                <BreakdownItem small>
                  <h2>{occupancyComparedData.net_absorption_unit_change > 0 && '+'}{occupancyComparedData.net_absorption_unit_change}</h2>
                  <BreakdownLabel>
                    NET ABSORPTION
                  </BreakdownLabel>
                  <small>Entire Period</small>
                </BreakdownItem>
              </Col>
              <Col className="p-x-10">
                <BreakdownItem small>
                  <h2>{occupancyComparedData.net_absorption_percent_change > 0 && '+'}{occupancyComparedData.net_absorption_percent_change.toFixed(1)}%</h2>
                  <BreakdownLabel>
                    NET ABSORPTION CHANGE
                  </BreakdownLabel>
                  <small>Entire Period</small>
                </BreakdownItem>
              </Col>
            </React.Fragment>}
          </Row>
        </BreakdownContainer>
        <CollapseArea active={tableViews} onClick={() => toggleTableViews(!tableViews)}>
          Table View
          <i className="ri-arrow-right-s-line" />
        </CollapseArea>
        <TableContainer show={tableViews}>
          <TableWrapper paginationHidden>
            <CustomTable
              tableData={calculateCompareData(subjectAsset, comparedAgainst, get(occupancyAssetData, 'chart_values', []), get(occupancyComparedData, 'chart_values', []), true)}
              tableColumns={chartCompareTableViewColumns(get(occupancyAssetData, 'chart_values', []), isMonthlyReport, true)}
            />
          </TableWrapper>
        </TableContainer>
      </CardBody>
    </CardBasic>
  );
};

export default OccupancyComparison;
