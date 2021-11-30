import React, { useState, FC } from 'react';
import { CardHeader, CardBody, Row, Col, DropdownMenu, DropdownToggle } from 'reactstrap';
import Skeleton from 'react-loading-skeleton';
import Charts from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'fusioncharts/react-fusioncharts';
import FusionCharts from 'fusioncharts/fusioncharts';
import moment from 'moment';
import { get } from 'lodash';
import { CardTitle, CardSubTitle, ChartWrapper, BreakdownItem, BreakdownLabel, CollapseArea, TableContainer } from 'compete/views/styles';
import { CardBasic, TableWrapper, Dropdown } from 'compete/components/common';
import { CustomTable, BreakdownSkeleton } from 'compete/components';
import { CustomSelect } from 'src/common';
import { asAmountRent, chartCompareConfigs, chartCompareTableViewColumns, calculateBreakdown, currencyFormat, percentFormat } from 'compete/constants';
import { SubjectAsset, HistoricalChart, Filters } from 'src/interfaces';
import { ChartLegend, BreakdownContainer, Info } from './styles';
import { calculateCompareData, renderBreakdownDiff } from './utils';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface ConcessionComparisonProps {
  concessionAssetData: HistoricalChart,
  concessionComparedData: HistoricalChart,
  filters: Filters,
  setFilters: (filter: Filters) => void,
  subjectAsset: SubjectAsset,
  comparedAgainst: SubjectAsset,
  isMonthlyReport: boolean,
  isRotateLabel: boolean,
}

const ConcessionComparison: FC<ConcessionComparisonProps> = ({ concessionAssetData, concessionComparedData, filters, setFilters, subjectAsset, comparedAgainst,
  isMonthlyReport, isRotateLabel }) => {
  const [concessionsHistoryDropdown, toggleDropdownConcessionsHistory] = useState(false);
  const [tableViews, toggleTableViews] = useState(false);

  const isPercentConcession = filters.concessionsHistory.value === 'RATE';
  const concessionType = isPercentConcession ? 'percent' : 'currency';

  return (
    <CardBasic className="mt-20">
      <CardHeader>
        <div className="mr-auto">
          <CardTitle xs className="mb-5">Concessions Comparison</CardTitle>
          {concessionAssetData ?
            <CardSubTitle>Reporting Period: {moment(concessionAssetData.chart_values[0].start_date).format('LL')} - {moment().format('LL')}</CardSubTitle> :
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
        <ChartLegend>
          <li>{subjectAsset.value.name}</li>
          <li>{comparedAgainst.value.name}</li>
        </ChartLegend>
        <ChartWrapper>
          {concessionAssetData && concessionComparedData ?
            <ReactFC {...chartCompareConfigs(concessionAssetData.chart_values, concessionComparedData.chart_values, isMonthlyReport, isRotateLabel, concessionType)} /> :
            <Skeleton width="100%" height="100%" style={{ borderRadius: '6px' }} />}
        </ChartWrapper>
        <CardTitle xs className="mb-20">Breakdown</CardTitle>
        <BreakdownContainer className="mb-10">
          <Row className="m-row-10">
            <Col xs="12" className="p-x-10 mb-15">
              {subjectAsset.value.name}
            </Col>
            {concessionAssetData && concessionComparedData ?
              calculateBreakdown('CONCESSION', concessionAssetData.chart_values, isMonthlyReport, concessionComparedData.chart_values, isPercentConcession).map((item, i) => (
                <Col xs="2" className="p-x-10" key={i}>
                  <BreakdownItem small>
                    <h2 className="mb-0">{!isPercentConcession && '$'}{currencyFormat(item.value)}{isPercentConcession && '%'}</h2>
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
            {concessionAssetData && concessionComparedData &&
              <React.Fragment>
                <Col xs="2" className="p-x-10">
                  <BreakdownItem small>
                    <h2 className="mb-0">
                      {concessionAssetData.net_concession > 0 ? '+' : '-'}
                      {isPercentConcession ? `${percentFormat(Math.abs(concessionAssetData.net_concession))}%` : `$${currencyFormat(Math.abs(concessionAssetData.net_concession))}`}
                    </h2>
                    {renderBreakdownDiff(concessionAssetData, concessionComparedData, 'net_concession', isPercentConcession)}
                    <BreakdownLabel>
                      NET CONCESSION
                    </BreakdownLabel>
                    <small>Entire Period</small>
                  </BreakdownItem>
                </Col>
                <Col className="p-x-10">
                  <BreakdownItem small>
                    <h2 className="mb-0">{concessionAssetData.net_concession_rent > 0 && '+'}{percentFormat(concessionAssetData.net_concession_rent)}%</h2>
                    {renderBreakdownDiff(concessionAssetData, concessionComparedData, 'net_concession_rent', true)}
                    <BreakdownLabel>
                      NET CONCESSION CHANGE
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
            {concessionComparedData ?
              calculateBreakdown('CONCESSION', concessionComparedData.chart_values, isMonthlyReport).map((item, i) => (
                <Col xs="2" className="p-x-10" key={i}>
                  <BreakdownItem small>
                    <h2>{!isPercentConcession && '$'}{currencyFormat(item.value)}{isPercentConcession && '%'}</h2>
                    <BreakdownLabel>
                      {item.type}
                    </BreakdownLabel>
                    <small>{item.date}</small>
                  </BreakdownItem>
                </Col>
              )) :
              <BreakdownSkeleton number={5} colSize={2} />}
            {concessionComparedData &&
            <React.Fragment>
              <Col xs="2" className="p-x-10">
                <BreakdownItem small>
                  <h2>
                    {concessionComparedData.net_concession > 0 ? '+' : '-'}
                    {isPercentConcession ? `${percentFormat(Math.abs(concessionComparedData.net_concession))}%` : `$${currencyFormat(Math.abs(concessionComparedData.net_concession))}`}
                  </h2>
                  <BreakdownLabel>
                    NET CONCESSION
                  </BreakdownLabel>
                  <small>Entire Period</small>
                </BreakdownItem>
              </Col>
              <Col className="p-x-10">
                <BreakdownItem small>
                  <h2>{concessionComparedData.net_concession_rent > 0 && '+'}{percentFormat(concessionComparedData.net_concession_rent)}%</h2>
                  <BreakdownLabel>
                    NET CONCESSION CHANGE
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
              tableData={calculateCompareData(subjectAsset, comparedAgainst, get(concessionAssetData, 'chart_values', []), get(concessionComparedData, 'chart_values', []), isPercentConcession)}
              tableColumns={chartCompareTableViewColumns(get(concessionAssetData, 'chart_values', []), isMonthlyReport)}
            />
          </TableWrapper>
        </TableContainer>
      </CardBody>
    </CardBasic>
  );
};

export default ConcessionComparison;
