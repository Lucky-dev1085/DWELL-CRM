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

interface SiteVisitorData {
  prior_period_visitors: number,
  visitors: number,
  pageviews: number,
  new_visitors: number,
  pages_session: number,
  sessions_per_visitor: number,
  avg_session_duration: number,
  sessions: number,
  bounce_rate: number,
}

interface SiteVisitorReportProps extends RouteComponentProps {
  type: string,
  isUpdated: boolean,
  attribution: string,
  isLoaded: boolean,
  sitesReports: {
    site_visitor_report: SiteVisitorData,
    chart_values: {
      prior_period_visitors: { all: [], desktop: [], tablet: [], mobile: [] },
      visitors: { all: [], desktop: [], tablet: [], mobile: [] },
      pageviews: { all: [], desktop: [], tablet: [], mobile: [] },
      new_visitors: { all: [], desktop: [], tablet: [], mobile: [] },
      pages_session: { all: [], desktop: [], tablet: [], mobile: [] },
      sessions_per_visitor: { all: [], desktop: [], tablet: [], mobile: [] },
      avg_session_duration: { all: [], desktop: [], tablet: [], mobile: [] },
      sessions: { all: [], desktop: [], tablet: [], mobile: [] },
      bounce_rate: { all: [], desktop: [], tablet: [], mobile: [] },
    },
    portfolio: { site_visitor_report: SiteVisitorData },
    compare_values: { site_visitor_report: SiteVisitorData }
  },
  compareFilterValue: string,
  setIsAuditionOpen: (show: boolean) => void,
  setAuditionModalType: (type: string) => void,
  period: string,
}

const SiteVisitorReport: FC<SiteVisitorReportProps> = ({ sitesReports, compareFilterValue, type,
  isUpdated, attribution, isLoaded }) => {
  const [priorPeriodVisitors, setPriorPeriodVisitors] = useState(0);
  const [visitor, setVisitors] = useState(0);
  const [pageviews, setPageviews] = useState(0);
  const [newVisitors, setNewVisitors] = useState(0);
  const [pagesSession, setPagesSession] = useState(0);
  const [sessionsPerVisitor, setsessionsPerVisitor] = useState(0);
  const [avgSessionDuration, setAvgSessionDuration] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [bounceRate, setBounceRate] = useState(0);
  const [showChart, setShowChart] = useState('visitors');
  const [chartValues, setChartValues] = useState({ prior_period_visitors: [], visitors: [], pageviews: [], new_visitors: [], pages_session: [], sessions_per_visitor: [], avg_session_duration: [], sessions: [], bounce_rate: [] });
  const [compareValues, setCompareValues] = useState({ prior_period_visitors: 0, visitors: 0, pageviews: 0, new_visitors: 0, pages_session: 0, sessions_per_visitor: 0, avg_session_duration: 0, sessions: 0, bounce_rate: 0 });

  const setSiteVisitorData = (data) => {
    setPriorPeriodVisitors(data.prior_period_visitors);
    setVisitors(data.visitors);
    setPageviews(data.pageviews);
    setNewVisitors(data.new_visitors);
    setPagesSession(data.pages_session);
    setsessionsPerVisitor(data.sessions_per_visitor);
    setAvgSessionDuration(data.avg_session_duration);
    setSessions(data.sessions);
    setBounceRate(data.bounce_rate);
  };

  useEffect(() => {
    if (!isEmpty(sitesReports)) {
      const { site_visitor_report: siteVisitorReport, chart_values: overviewChartValues, portfolio } = sitesReports;
      const reportData = type === 'portfolio' && !isEmpty(portfolio) ? portfolio.site_visitor_report : siteVisitorReport;
      // setSiteVisitorData(reportData);

      setChartValues({
        prior_period_visitors: overviewChartValues.prior_period_visitors.all,
        visitors: overviewChartValues.visitors.all,
        pageviews: overviewChartValues.pageviews.all,
        new_visitors: overviewChartValues.new_visitors.all,
        pages_session: overviewChartValues.pages_session.all,
        sessions_per_visitor: overviewChartValues.sessions_per_visitor.all,
        avg_session_duration: overviewChartValues.avg_session_duration.all,
        sessions: overviewChartValues.sessions.all,
        bounce_rate: overviewChartValues.bounce_rate.all,
      });
      if (!isEmpty(sitesReports.compare_values)) {
        const { compare_values: { site_visitor_report: siteVisitorCompareValues } } = sitesReports;
        setCompareValues(siteVisitorCompareValues);
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
    categories: [{ category: chartValues.prior_period_visitors.map(item => ({ label: moment(item.label).format('ll') })) }],
    dataset: [
      {
        seriesname: 'Visitors',
        color: '#2e75f9',
        anchorBgColor: '#2e75f9',
        initiallyHidden: showChart === 'visitors' ? 0 : 1,
        data: chartValues.visitors.map(({ value }) =>
          ({ value, tooltext: `Visitors: ${value}` })),
      },
      {
        seriesname: 'Prior Period Visitors',
        color: '#21c5b7',
        anchorBgColor: '#21c5b7',
        data: chartValues.prior_period_visitors.map(({ value, label }) => ({ value, tooltext: `${tooltipHeader(moment(label).format('ll'))}<br /><div style="min-width: 70px;">Prior Period Visitors: ${value}</div>` })),
      },
      {
        seriesname: 'Pageviews',
        color: '#cc3333',
        anchorBgColor: '#cc3333',
        initiallyHidden: showChart === 'pageviews' ? 0 : 1,
        data: chartValues.pageviews.map(({ value }) => ({ value, tooltext: `Pageviews: ${value}` })),
      },
      {
        seriesname: 'New Visitors',
        color: '#d4893f',
        anchorBgColor: '#d4893f',
        initiallyHidden: showChart === 'new_visitors' ? 0 : 1,
        data: chartValues.new_visitors.map(({ value }) => ({ value, tooltext: `New Visitors: ${value}` })),
      },
      {
        seriesname: 'Pages / Session',
        color: '#ce97b0',
        anchorBgColor: '#ce97b0',
        initiallyHidden: showChart === 'pages_session' ? 0 : 1,
        data: chartValues.pages_session.map(({ value }) => ({ value, tooltext: `Pages / Session: ${value}` })),
      },
      {
        seriesname: 'Sessions per Visitor',
        color: '#d5338b',
        anchorBgColor: '#d5338b',
        initiallyHidden: showChart === 'sessions_per_visitor' ? 0 : 1,
        data: chartValues.sessions_per_visitor.map(({ value }) => ({ value, tooltext: `Sessions per Visitor: ${value}` })),
      },
      {
        seriesname: 'Avg. Session Duration',
        color: '#a5e1ad',
        anchorBgColor: '#a5e1ad',
        initiallyHidden: showChart === 'avg_session_duration' ? 0 : 1,
        data: chartValues.avg_session_duration.map(({ value }) => ({ value, tooltext: `Avg. Session Duration: ${value}` })),
      },
      {
        seriesname: 'Sessions',
        color: '#77acf1',
        anchorBgColor: '#77acf1',
        initiallyHidden: showChart === 'sessions' ? 0 : 1,
        data: chartValues.sessions.map(({ value }) => ({ value, tooltext: `Sessions: ${value}` })),
      },
      {
        seriesname: 'Bounce Rate',
        color: '#77acf1',
        anchorBgColor: '#77acf1',
        initiallyHidden: showChart === 'bounce_rate' ? 0 : 1,
        data: chartValues.bounce_rate.map(({ value }) => ({ value, tooltext: `Bounce Rate: ${value}` })),
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
        {showChart === 'visitors' && <ChartCaption color="#2e75f9" content="- Visitors" />}
        {showChart === 'pageviews' && <ChartCaption color="#cc3333" content="- Pageviews" />}
        {showChart === 'new_visitors' && <ChartCaption color="#d4893f" content="- New Visitors" />}
        {showChart === 'pages_session' && <ChartCaption color="#ce97b0" content="- Page Session" />}
        {showChart === 'sessions_per_visitor' && <ChartCaption color="#d5338b" content="- Sessions per Visitor" />}
        {showChart === 'avg_session_duration' && <ChartCaption color="#a5e1ad" content="- Avg. Session Duration" />}
        {showChart === 'sessions' && <ChartCaption color="#77acf1" content="- Sessions" />}
        {showChart === 'bounce_rate' && <ChartCaption color="#77acf1" content="- Bounce Rate" />}
        <ChartCaption color="#21c5b7" content="- Prior Period Visitors" />
      </Row>
      <br />
      <div>
        {isLoaded && isUpdated && chartValues ?
          <ReactFC
            {...chartConfigs}
          /> :
          <LineSkeleton height={270} />}
      </div>
      <Row>
        <Col sm="3">
          <CardBtn
            title="visitors"
            content="5,210"
            compare_rate="24.1%"
            compare_val="785"
            compare_status
            active={showChart === 'visitors'}
            onClick={() => cardBtnClick('visitors')}
          />
        </Col>
        <Col sm="3">
          <CardBtn
            title="new visitors"
            content="4,134"
            compare_rate="12.3%"
            compare_val="223"
            compare_status={false}
            active={showChart === 'new_visitors'}
            onClick={() => cardBtnClick('new_visitors')}
          />
        </Col>
        <Col sm="3">
          <CardBtn
            title="sessions per visitor"
            content="1.27"
            compare_rate="18.4%"
            compare_val="1.37"
            compare_status={false}
            active={showChart === 'sessions_per_visitor'}
            onClick={() => cardBtnClick('sessions_per_visitor')}
          />
        </Col>
        <Col sm="3">
          <CardBtn
            title="sessions"
            content="6,278"
            compare_rate="9.7%"
            compare_val="598"
            compare_status
            active={showChart === 'sessions'}
            onClick={() => cardBtnClick('sessions')}
          />
        </Col>
      </Row>
      <br />
      <Row>
        <Col sm="3">
          <CardBtn
            title="pageviews"
            content="65,298"
            compare_rate="24.1%"
            compare_val="785"
            compare_status
            active={showChart === 'pageviews'}
            onClick={() => cardBtnClick('pageviews')}
          />
        </Col>
        <Col sm="3">
          <CardBtn
            title="pages / session"
            content="4.78"
            compare_rate="12.3%"
            compare_val="4.97"
            compare_status={false}
            active={showChart === 'pages_session'}
            onClick={() => cardBtnClick('pages_session')}
          />
        </Col>
        <Col sm="3">
          <CardBtn
            title="avg. session duration"
            content="00:03:10"
            compare_rate="18.4%"
            compare_val="00:03:41"
            compare_status={false}
            active={showChart === 'avg_session_duration'}
            onClick={() => cardBtnClick('avg_session_duration')}
          />
        </Col>
        <Col sm="3">
          <CardBtn
            title="bounce rate"
            content="49.2%"
            compare_rate="9.7%"
            compare_val="54.5%"
            compare_status
            active={showChart === 'bounce_rate'}
            onClick={() => cardBtnClick('bounce_rate')}
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

export default connect(mapStateToProps)(withRouter(SiteVisitorReport));
