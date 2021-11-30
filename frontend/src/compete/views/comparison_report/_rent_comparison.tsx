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
import { chartCompareConfigs, chartCompareTableViewColumns, reportSettingsFilters, calculateBreakdown, currencyFormat, percentFormat } from 'compete/constants';
import { CustomSelect } from 'src/common';
import { SubjectAsset, HistoricalChart, Filters } from 'src/interfaces';
import { ChartLegend, BreakdownContainer, Info } from './styles';
import { calculateCompareData, renderBreakdownDiff } from './utils';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface RentComparisonProps {
  rentAssetData: HistoricalChart,
  rentComparedData: HistoricalChart,
  filters: Filters,
  setFilters: (filter: Filters) => void,
  subjectAsset: SubjectAsset,
  comparedAgainst: SubjectAsset,
  isMonthlyReport: boolean,
  isRotateLabel: boolean,
}

const RentComparison: FC<RentComparisonProps> = ({ rentAssetData, filters, setFilters, subjectAsset, comparedAgainst, rentComparedData, isMonthlyReport, isRotateLabel }) => {
  const [rentHistoryDropdown, toggleDropdownRentHistory] = useState(false);
  const [tableViews, toggleTableViews] = useState(false);

  return (
    <CardBasic>
      <CardHeader>
        <div className="mr-auto">
          <CardTitle xs className="mb-5">Rent Comparison</CardTitle>
          {rentAssetData ?
            <CardSubTitle>Reporting Period: {moment(rentAssetData.chart_values[0].start_date).format('LL')} - {moment().format('LL')}</CardSubTitle> :
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
        <ChartLegend>
          <li>{subjectAsset.value.name}</li>
          <li>{comparedAgainst.value.name}</li>
        </ChartLegend>
        <ChartWrapper>
          {rentAssetData && rentComparedData ?
            <ReactFC {...chartCompareConfigs(rentAssetData.chart_values, rentComparedData.chart_values, isMonthlyReport, isRotateLabel)} /> :
            <Skeleton width="100%" height="100%" style={{ borderRadius: '6px' }} />}
        </ChartWrapper>
        <CardTitle xs className="mb-20">Breakdown</CardTitle>
        <BreakdownContainer className="mb-10">
          <Row className="m-row-10">
            <Col xs="12" className="p-x-10 mb-15">
              {subjectAsset.value.name}
            </Col>
            {rentAssetData && rentComparedData ?
              calculateBreakdown('RENT', rentAssetData.chart_values, isMonthlyReport, rentComparedData.chart_values).map((item, i) => (
                <Col xs="2" className="p-x-10" key={i}>
                  <BreakdownItem small>
                    <h2 className="mb-0">${currencyFormat(item.value)}</h2>
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
            {rentAssetData && rentComparedData &&
            <React.Fragment>
              <Col xs="2" className="p-x-10">
                <BreakdownItem small>
                  <h2 className="mb-0">{rentAssetData.net_rent > 0 ? '+' : '-'}${currencyFormat(Math.abs(rentAssetData.net_rent))}</h2>
                  {renderBreakdownDiff(rentAssetData, rentComparedData, 'net_rent')}
                  <BreakdownLabel>
                    NET RENT
                  </BreakdownLabel>
                  <small>Entire Period</small>
                </BreakdownItem>
              </Col>
              <Col className="p-x-10">
                <BreakdownItem small>
                  <h2 className="mb-0">{rentAssetData.net_rent_change > 0 && '+'}{percentFormat(rentAssetData.net_rent_change)}%</h2>
                  {renderBreakdownDiff(rentAssetData, rentComparedData, 'net_rent_change', true)}
                  <BreakdownLabel>
                    NET RENT CHANGE
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
            {rentComparedData ?
              calculateBreakdown('RENT', rentComparedData.chart_values, isMonthlyReport).map((item, i) => (
                <Col xs="2" className="p-x-10" key={i}>
                  <BreakdownItem small>
                    <h2>${currencyFormat(item.value)}</h2>
                    <BreakdownLabel>
                      {item.type}
                    </BreakdownLabel>
                    <small>{item.date}</small>
                  </BreakdownItem>
                </Col>
              )) :
              <BreakdownSkeleton number={5} colSize={2} />}
            {rentComparedData &&
            <React.Fragment>
              <Col xs="2" className="p-x-10">
                <BreakdownItem small>
                  <h2>{rentComparedData.net_rent > 0 ? '+' : '-'}${currencyFormat(Math.abs(rentComparedData.net_rent))}</h2>
                  <BreakdownLabel>
                    NET RENT
                  </BreakdownLabel>
                  <small>Entire Period</small>
                </BreakdownItem>
              </Col>
              <Col className="p-x-10">
                <BreakdownItem small>
                  <h2>{rentComparedData.net_rent_change > 0 && '+'}{percentFormat(rentComparedData.net_rent_change)}%</h2>
                  <BreakdownLabel>
                    NET RENT CHANGE
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
              tableData={calculateCompareData(subjectAsset, comparedAgainst, get(rentAssetData, 'chart_values', []), get(rentComparedData, 'chart_values', []))}
              tableColumns={chartCompareTableViewColumns(get(rentAssetData, 'chart_values', []), isMonthlyReport)}
            />
          </TableWrapper>
        </TableContainer>
      </CardBody>
    </CardBasic>
  );
};

export default RentComparison;
