import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { Row, Col } from 'reactstrap';
import { LineSkeleton } from 'src/utils';
import Charts from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'fusioncharts/react-fusioncharts';
import FusionCharts from 'fusioncharts/fusioncharts';
import ChartCaption from '../../../../site/components/text/ChartCaption';

import {
  ComparePeriodLabel,
  Icon,
  ReportCompare,
  ReportCompareValue,
  ReportLabel,
  ReportValue,
} from './styles';
import {
  addLabelSetting,
  formatCompareValue,
  getCompareIcon,
  getCompareColor,
  getCompareValue,
  formatNumberWithCommas,
  chartCommonSetting,
} from './_utils';
import CardBtn from '../../../../site/components/sites_reports/CardBtn';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface ConversionData {
  leads: number,
  conversion_rate: number,
  tours: number,
  leases: number,
}

interface ConversionReportProps extends RouteComponentProps {
  type: string,
  isUpdated: boolean,
  attribution: string,
  isLoaded: boolean,
  sitesReports: {
    conversion_report: ConversionData,
    chart_values: {
      leads: { all: [], desktop: [], tablet: [], mobile: [] },
      conversion_rate: { all: [], desktop: [], tablet: [], mobile: [] },
      tours: { all: [], desktop: [], tablet: [], mobile: [] },
      leases: { all: [], desktop: [], tablet: [], mobile: [] },
      prior_period_leads: { all: [], desktop: [], tablet: [], mobile: [] },
    },
    portfolio: { conversion_report: ConversionData },
    compare_values: { conversion_report: ConversionData }
  },
  compareFilterValue: string,
  setIsAuditionOpen: (show: boolean) => void,
  setAuditionModalType: (type: string) => void,
  period: string,
}

const ConversionReport: FC<ConversionReportProps> = ({ sitesReports, compareFilterValue, type,
  isUpdated, attribution, isLoaded }) => {
  const [leads, setLeads] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [tours, setTours] = useState(0);
  const [leases, setLeases] = useState(0);
  const [showChart, setShowChart] = useState('leads');
  const [chartValues, setChartValues] = useState({ leads: [], conversion_rate: [], tours: [], leases: [], prior_period_leads: [] });
  const [compareValues, setCompareValues] = useState({ leads: 0, conversion_rate: 0, tours: 0, leases: 0 });

  const setConversionData = (data) => {
    setLeads(data.leads);
    setConversionRate(data.conversion_rate);
    setTours(data.tours);
    setLeases(data.leases);
  };

  useEffect(() => {
    if (!isEmpty(sitesReports)) {
      const { conversion_report: conversionReport, chart_values: sitesChartValues, portfolio } = sitesReports;
      const reportData = type === 'portfolio' && !isEmpty(portfolio) ? portfolio.conversion_report : conversionReport;
      // setConversionData(reportData);

      setChartValues({
        leads: sitesChartValues.leads.all,
        conversion_rate: sitesChartValues.conversion_rate.all,
        tours: sitesChartValues.tours.all,
        leases: sitesChartValues.leases.all,
        prior_period_leads: sitesChartValues.prior_period_leads.all,
      });
      if (!isEmpty(sitesReports.compare_values)) {
        const { compare_values: { conversion_report: conversionCompareValues } } = sitesReports;
        setCompareValues(conversionCompareValues);
      }
    }
  }, [sitesReports]);

  const tooltipHeader = label => `<div><span style="padding: 8px 20px 8px 8px;margin: -6px -6px 5px;text-align: center;">${label}</span></div>`;
  const dataSource = {
    chart: {
      drawCrossLine: 1,
      crossLineAlpha: 70,
      showvalues: 0,
      theme: 'fusion',
      labelDisplay: 'none',
      syncAxisLimits: 1,
      usePlotGradientColor: '1',
      plotHighlightEffect: 'fadeout',
      plotGradientColor: '#ffffff',
      plotFillAngle: '90',
      plotFillAlpha: '20',
      plotFillRatio: '10,100',
      showPlotBorder: '1',
      drawFullAreaBorder: '0',
      maxLabelHeight: 90,
      showLegend: 0,
    },
    categories: [{ category: chartValues.prior_period_leads.map(item => ({ label: moment(item.label).format('ll') })) }],
    dataset: [
      {
        seriesname: 'Leads',
        color: '#2e75f9',
        anchorBgColor: '#2e75f9',
        initiallyHidden: showChart === 'leads' ? 0 : 1,
        data: chartValues.leads.map(({ value }) =>
          ({ value, tooltext: `Leads: ${value}` })),
      },
      {
        seriesname: 'Prior Period Leads',
        color: '#21c5b7',
        anchorBgColor: '#21c5b7',
        data: chartValues.prior_period_leads.map(({ value, label }) => ({ value, tooltext: `${tooltipHeader(moment(label).format('ll'))}<br /><div style="min-width: 70px;">Prior Period Leads: ${value}</div>` })),
      },
      {
        seriesname: 'Conversion Rate',
        color: '#cc3333',
        anchorBgColor: '#cc3333',
        initiallyHidden: showChart === 'conversion_rate' ? 0 : 1,
        data: chartValues.conversion_rate.map(({ value }) => ({ value, tooltext: `Conversion Rate: ${value}` })),
      },
      {
        seriesname: 'Tours',
        color: '#d4893f',
        anchorBgColor: '#d4893f',
        initiallyHidden: showChart === 'tours' ? 0 : 1,
        data: chartValues.tours.map(({ value }) => ({ value, tooltext: `Tours: ${value}` })),
      },
      {
        seriesname: 'Leases',
        color: '#ce97b0',
        anchorBgColor: '#ce97b0',
        initiallyHidden: showChart === 'leases' ? 0 : 1,
        data: chartValues.leases.map(({ value }) => ({ value, tooltext: `Leases: ${value}` })),
      },
    ],
  };

  const chartConfigs = {
    type: 'msline',
    width: '100%',
    height: 270,
    dataFormat: 'json',
    dataSource,
  };

  const cardBtnClick = (selCard) => {
    setShowChart(selCard);
  };

  return (
    <React.Fragment>
      <Row>
        {showChart === 'leads' && <ChartCaption color="#2e75f9" content="- Leads" />}
        {showChart === 'conversion_rate' && <ChartCaption color="#cc3333" content="- Conversion Rate" />}
        {showChart === 'tours' && <ChartCaption color="#d4893f" content="- Tours" />}
        {showChart === 'leases' && <ChartCaption color="#ce97b0" content="- Leases" />}
        <ChartCaption color="#21c5b7" content="- Prior Period Leads" />
      </Row>
      <br />
      <div>
        {isLoaded && isUpdated ?
          <ReactFC
            {...chartConfigs}
          /> :
          <LineSkeleton height={270} />}
      </div>
      <Row>
        <Col sm="6">
          <CardBtn
            title="leads"
            content="5,210"
            compare_rate="24.1%"
            compare_val="785"
            compare_status
            active={showChart === 'leads'}
            onClick={() => cardBtnClick('leads')}
          />
        </Col>
        <Col sm="6">
          <CardBtn
            title="conversion rate"
            content="4.13%"
            compare_rate="12.3%"
            compare_val="345"
            compare_status={false}
            active={showChart === 'conversion_rate'}
            onClick={() => cardBtnClick('conversion_rate')}
          />
        </Col>
      </Row>
      <br />
      <Row>
        <Col sm="6">
          <CardBtn
            title="tours"
            content="1.27"
            compare_rate="18.3%"
            compare_val="1.37"
            compare_status={false}
            active={showChart === 'tours'}
            onClick={() => cardBtnClick('tours')}
          />
        </Col>
        <Col sm="6">
          <CardBtn
            title="leases"
            content="6,278"
            compare_rate="9.7%"
            compare_val="598"
            compare_status
            active={showChart === 'leases'}
            onClick={() => cardBtnClick('leases')}
          />
        </Col>
      </Row>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  sitesReports: state.report.sitesReports,
  currentProperty: state.property.property,
  isLoaded: state.report.isLoaded,
});

export default connect(mapStateToProps)(withRouter(ConversionReport));
