import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'codemirror/src/util/misc';
import BootstrapTable from 'react-bootstrap-table-next';
import { Dropdown, Tooltip } from 'reactstrap';
import moment from 'moment';
import { cloneDeep } from 'lodash';

import Charts from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'fusioncharts/react-fusioncharts';
import FusionCharts from 'fusioncharts/fusioncharts';

import { reportTypes, unitTypes } from 'dwell/constants';
import Loader from 'dwell/components/Loader';
import {
  CardBox,
  Divider,
  DropdownButton,
  DropdownWrapper, ReportChart, ReportCompare, ReportCompareValue, ReportLabel, ReportMedia, ReportSidebar, ReportValue,
  SelectItem,
  SelectMenu,
  ReportCardHeader, ComparePeriodLabel,
} from 'dwell/views/Reports/ReportBlocks/styles';
import { DrilldownIcon, ReportCardText, ReportCardTitle } from 'dwell/views/Reports/styles';
import {
  addLabelSetting,
  sortColumns,
  formatCompareValue,
  getCompareIcon,
  formatPriceValue,
  getCompareColor, formatHeaderPriceValue, getLastPeriod,
} from './_utils';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface MtRents {
  market_rent_low: number,
  market_rent_high: number,
  market_rent: number,
  effective_rent_low: number,
  effective_rent_high: number,
  effective_rent: number,
  name: string,
  unit_class: string,
  isProperty?: boolean,
  id?: string,
  _id?: number
}

interface MarketingCompData {
  competitor_rents: MtRents[],
  effective_rent_avg: { unit_class: string, effective_rent_avg: number }[],
  market_rent_avg: { unit_class: string, market_rent_avg: number }[],
  mt_rents: MtRents[],
}

interface MarketingCompCompareData {
  effective_rent_avg: number,
  market_rent_avg: number,
}

interface MarketingCompReportProps extends RouteComponentProps {
  type: string,
  isUpdated: boolean,
  isLoaded: boolean,
  operationsReports: {
    marketing_comp_report: MarketingCompData,
    portfolio: { marketing_comp_report: MarketingCompData },
    compare_values: { marketing_comp_report: MarketingCompData }
    chart_values: { [key: string]: { effective_rent_avg: { value: number, label: string }[], market_rent_avg: { value: number, label: string }[]}},
  },
  compareFilterValue: string,
  setIsDrilldownOpen: (open: boolean) => void,
  period: string,
}

const MarketingCompReport: FC<MarketingCompReportProps> = ({ location: { pathname }, operationsReports, type,
  isUpdated, isLoaded, compareFilterValue, setIsDrilldownOpen, period }) => {
  const [marketingCompReportData, setMarketingCompReportData] = useState([]);
  const [unitSize, setUnitSize] = useState('STUDIO');
  const [marketRentAvg, setMarketRentAvg] = useState(0);
  const [effectiveRentAvg, setEffectiveRentAvg] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chartValues, setChartValues] = useState({ market_rent_avg: [], effective_rent_avg: [] });
  const [compareValues, setCompareValues] = useState({} as MarketingCompCompareData);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const level = pathname.includes('/advanced-reports') ? 'portfolio' : 'property';

  const updateUnitSizeDependencies = () => {
    const { marketing_comp_report: marketingCompReport, chart_values: operationsChartValues } = operationsReports;
    setChartValues(operationsChartValues[unitSize]);
    const mrAvg = marketingCompReport.market_rent_avg.find(rent => rent.unit_class === unitSize);
    const erAvg = marketingCompReport.effective_rent_avg.find(rent => rent.unit_class === unitSize);
    setMarketRentAvg(mrAvg ? mrAvg.market_rent_avg : 0);
    setEffectiveRentAvg(erAvg ? erAvg.effective_rent_avg : 0);

    if (!isEmpty(operationsReports.compare_values)) {
      const { compare_values: { marketing_comp_report: compValues } } = operationsReports;
      setCompareValues(compValues[unitSize]);
    }
  };

  useEffect(() => {
    if (!isEmpty(operationsReports)) {
      const { marketing_comp_report: marketingCompReport } = operationsReports;
      const mtRents = marketingCompReport.mt_rents.map((rent) => {
        const newRent = { ...rent };
        newRent.isProperty = true;
        return newRent;
      });

      const competitorRents = marketingCompReport.competitor_rents.map((rent) => {
        const newRent = { ...rent };
        newRent.isProperty = false;
        return newRent;
      });

      const reportData = mtRents.concat(competitorRents).map((rent, index) => {
        const newRent = { ...rent };
        newRent._id = index;
        return newRent;
      });

      setMarketingCompReportData(reportData);
      updateUnitSizeDependencies();
    }
  }, [operationsReports]);

  useEffect(() => {
    if (!isEmpty(operationsReports)) {
      updateUnitSizeDependencies();
    }
  }, [unitSize]);

  const handleTableChange = (changeType, { sortField, sortOrder, data: tableData }) => {
    if (changeType === 'sort') {
      const result = sortColumns(sortOrder, sortField, cloneDeep(tableData));
      setMarketingCompReportData(result);
    }
  };

  const indication = () => (
    <React.Fragment>
      <div className="empty-table">
        {/* eslint-disable-next-line jsx-a11y/heading-has-content */}
        <div style={{ height: '30px' }}>{!isUpdated || !isLoaded ? <Loader /> : <h5>No results found</h5>}</div>
      </div>
    </React.Fragment>);

  const tooltipHeader = label => `<div class="tooltip-header"><span style="text-align: center; width: 100%">${label}</span></div>`;
  const dataSource = {
    chart: {
      showLegend: 0,
      drawCrossLine: 1,
      crossLineAlpha: 40,
      showvalues: 0,
      theme: 'fusion',
      plothighlighteffect: 'fadeout',
      labelDisplay: 'none',
      decimals: '2',
      numberprefix: '$',
      thousandSeparator: ',',
      formatNumberScale: '0',
    },
    categories: [{ category: addLabelSetting(chartValues.market_rent_avg.map(rate => ({ label: moment(rate.label).format('ll') }))) }],
    dataset: [
      {
        seriesname: 'Avg Market Rent',
        color: '#0EC1E8',
        data: chartValues.market_rent_avg.map(({ value, label }) => ({
          value,
          tooltext: `${tooltipHeader(moment(label).format('ll'))} <br> <br><div style="min-width: 70px;">Mark Taylor rent: ${formatPriceValue(value)}</div>`,
        })),
      },
      {
        seriesname: 'Avg Effective Rent',
        color: '#213AEC',
        data: chartValues.effective_rent_avg.map(({ value }) => ({ value, tooltext: `Avg. competitors rent: ${formatPriceValue(value)}` })),
      },
    ],
  };

  const chartConfigs = {
    type: 'mscolumn2d',
    width: '100%',
    height: 350,
    dataFormat: 'json',
    dataSource,
  };

  return (
    <React.Fragment>
      <ReportMedia>
        <ReportSidebar>
          <ReportCardHeader>
            <div>
              <ReportCardTitle>Market Comp Report</ReportCardTitle>
              <ReportCardText>Get an understanding on how your property rent compares to direct competitions in the market.</ReportCardText>
            </div>
            {level === 'portfolio' && type === 'portfolio' &&
                <>
                  <DrilldownIcon className="ri-fullscreen-fill" onClick={() => setIsDrilldownOpen(true)} id="marketing_comp_report" />
                  <Tooltip trigger="hover" placement="top" isOpen={tooltipOpen} target="marketing_comp_report" toggle={() => setTooltipOpen(!tooltipOpen)}>
                    Market Comp Drilldown
                  </Tooltip>
                </>
            }
          </ReportCardHeader>
          <DropdownWrapper><span>Showing unit class:</span>
            <Dropdown isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(!isDropdownOpen)} >
              <DropdownButton
                caret
                tag="div"
                data-toggle="dropdown"
                aria-expanded={isDropdownOpen}
              >
                {unitTypes.UNIT_TYPES[unitSize]}
              </DropdownButton>
              <SelectMenu>
                {Object.keys(unitTypes.UNIT_TYPES).map((key, index) => <SelectItem key={index} onClick={() => setUnitSize(key)}>{unitTypes.UNIT_TYPES[key]}</SelectItem>)}
              </SelectMenu>
            </Dropdown>
          </DropdownWrapper>
          <Divider />
          <CardBox>
            <ReportValue>{formatHeaderPriceValue(marketRentAvg)}</ReportValue>
            <ReportLabel>AVG. MARKET RENT</ReportLabel>
            <ReportCompare compareFilterValue={compareValues.market_rent_avg !== undefined && compareFilterValue}>
              <ReportCompareValue color={getCompareColor(compareValues.market_rent_avg)}>
                {formatCompareValue(compareValues.market_rent_avg)} {getCompareIcon(compareValues.market_rent_avg)}
                {!['n/a', 0].includes(compareValues.market_rent_avg) && compareFilterValue === 'PREVIOUS_PERIOD' && <ComparePeriodLabel>{getLastPeriod(period)}</ComparePeriodLabel>}
              </ReportCompareValue>
            </ReportCompare>
          </CardBox>
          <CardBox>
            <ReportValue>{formatHeaderPriceValue(effectiveRentAvg)}</ReportValue>
            <ReportLabel>AVG. EFFECTIVE RENT</ReportLabel>
            <ReportCompare compareFilterValue={compareValues.effective_rent_avg !== undefined && compareFilterValue}>
              <ReportCompareValue color={getCompareColor(compareValues.effective_rent_avg)}>
                {formatCompareValue(compareValues.effective_rent_avg)} {getCompareIcon(compareValues.effective_rent_avg)}
                {!['n/a', 0].includes(compareValues.effective_rent_avg) && compareFilterValue === 'PREVIOUS_PERIOD' && <ComparePeriodLabel>{getLastPeriod(period)}</ComparePeriodLabel>}
              </ReportCompareValue>
            </ReportCompare>
          </CardBox>
        </ReportSidebar>
        <ReportChart>
          {isUpdated && isLoaded ?
            <ReactFC
              {...chartConfigs}
            /> : <div style={{ height: '420px' }}><Loader /></div>}
        </ReportChart>
      </ReportMedia>
      {type === 'property' &&
        <React.Fragment>
          <div className="lead-source-report">
            <BootstrapTable
              wrapperClasses="table-responsive"
              remote={{ sort: true }}
              keyField="_id"
              data={marketingCompReportData.filter(rent => rent.unit_class === unitSize)}
              columns={reportTypes.REPORT_BLOCK_TYPES.OPERATIONS_REPORTS.MARKETING_COMP.columns}
              onTableChange={handleTableChange}
              noDataIndication={indication}
            />
          </div>
        </React.Fragment>}
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  operationsReports: state.report.operationsReports,
  isLoaded: state.report.isLoaded,
  startDate: state.report.startDate,
  endDate: state.report.endDate,
});

export default connect(mapStateToProps)(withRouter(MarketingCompReport));
