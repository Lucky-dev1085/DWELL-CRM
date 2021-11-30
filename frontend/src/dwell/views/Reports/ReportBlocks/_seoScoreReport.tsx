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
import CardChartBtn from '../../../../site/components/sites_reports/CardChartBtn';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface SeoScoreData {
  performance: number,
  accesibility: number,
  best_practices: number,
  seo: number,
}

interface SeoScoreReportProps extends RouteComponentProps {
  type: string,
  isUpdated: boolean,
  attribution: string,
  isLoaded: boolean,
  sitesReports: {
    seo_score_report: SeoScoreData,
    chart_values: { prior_period_performance: [], performance: [], accesibility: [], best_practices: [], seo: [] },
    portfolio: { seo_score_report: SeoScoreData },
    compare_values: { seo_score_report: SeoScoreData }
  },
  compareFilterValue: string,
  setIsAuditionOpen: (show: boolean) => void,
  setAuditionModalType: (type: string) => void,
  period: string,
}

const SeoScoreReport: FC<SeoScoreReportProps> = ({ sitesReports, compareFilterValue, type,
  isUpdated, attribution, isLoaded }) => {
  const [priorPeriodPerformance, setPriorPeriodPerformance] = useState(0);
  const [performance, setPerformance] = useState(0);
  const [accesibility, setAccesibility] = useState(0);
  const [bestPractices, setBestPractices] = useState(0);
  const [seo, setSeo] = useState(0);
  const [showChart, setShowChart] = useState('performance');
  const [chartValues, setChartValues] = useState({ prior_period_performance: [], performance: [], accesibility: [], best_practices: [], seo: [] });
  const [compareValues, setCompareValues] = useState({ performance: 0, accesibility: 0, best_practices: 0, seo: 0 });

  const setSeoScoreData = (data) => {
    setPriorPeriodPerformance(data.prior_period_performance);
    setPerformance(data.performance);
    setAccesibility(data.accesibility);
    setBestPractices(data.best_practices);
    setSeo(data.seo);
  };

  useEffect(() => {
    if (!isEmpty(sitesReports)) {
      const { seo_score_report: seoScoreReport, chart_values: sitesReportChartValues, portfolio } = sitesReports;
      const reportData = type === 'portfolio' && !isEmpty(portfolio) ? portfolio.seo_score_report : seoScoreReport;
      setSeoScoreData(reportData);

      setChartValues({
        prior_period_performance: sitesReportChartValues.prior_period_performance,
        performance: sitesReportChartValues.performance,
        accesibility: sitesReportChartValues.accesibility,
        best_practices: sitesReportChartValues.best_practices,
        seo: sitesReportChartValues.seo,
      });
      if (!isEmpty(sitesReports.compare_values)) {
        const { compare_values: { seo_score_report: seoScoreCompareValues } } = sitesReports;
        setCompareValues(seoScoreCompareValues);
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
    categories: [{ category: chartValues.prior_period_performance.map(item => ({ label: moment(item.label).format('ll') })) }],
    dataset: [
      {
        seriesname: 'Performance',
        color: '#2e75f9',
        anchorBgColor: '#2e75f9',
        initiallyHidden: showChart === 'performance' ? 0 : 1,
        data: chartValues.performance.map(({ value }) =>
          ({ value, tooltext: `Performance: ${value}` })),
      },
      {
        seriesname: 'Prior Period Performance',
        color: '#21c5b7',
        anchorBgColor: '#21c5b7',
        data: chartValues.prior_period_performance.map(({ value, label }) => ({ value, tooltext: `${tooltipHeader(moment(label).format('ll'))}<br /><div style="min-width: 70px;">Prior Period Visitors: ${value}</div>` })),
      },
      {
        seriesname: 'Accesibility',
        color: '#cc3333',
        anchorBgColor: '#cc3333',
        initiallyHidden: showChart === 'accesibility' ? 0 : 1,
        data: chartValues.accesibility.map(({ value }) => ({ value, tooltext: `Accesibility: ${value}` })),
      },
      {
        seriesname: 'Best Practices',
        color: '#d4893f',
        anchorBgColor: '#d4893f',
        initiallyHidden: showChart === 'best_practices' ? 0 : 1,
        data: chartValues.best_practices.map(({ value }) => ({ value, tooltext: `Best Practices: ${value}` })),
      },
      {
        seriesname: 'Seo',
        color: '#ce97b0',
        anchorBgColor: '#ce97b0',
        initiallyHidden: showChart === 'seo' ? 0 : 1,
        data: chartValues.seo.map(({ value }) => ({ value, tooltext: `SEO: ${value}` })),
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

  const CardChartBtnClick = (selCard) => {
    setShowChart(selCard);
  };

  return (
    <React.Fragment>
      <Row>
        {showChart === 'performance' && <ChartCaption color="#2e75f9" content="- Performance" />}
        {showChart === 'accesibility' && <ChartCaption color="#cc3333" content="- Accesibility" />}
        {showChart === 'best_practices' && <ChartCaption color="#d4893f" content="- Best Practices" />}
        {showChart === 'seo' && <ChartCaption color="#ce97b0" content="- SEO" />}
        <ChartCaption color="#21c5b7" content="- Prior Period Performance" />
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
        <Col sm="3">
          <CardChartBtn
            title="performance"
            content={27}
            compare_rate="24.1%"
            compare_val="22"
            compare_status
            content_color="#2e75f9"
            active={showChart === 'performance'}
            onClick={() => CardChartBtnClick('performance')}
          />
        </Col>
        <Col sm="3">
          <CardChartBtn
            title="accesibility"
            content={72}
            compare_rate="12.3%"
            compare_val="79"
            compare_status={false}
            content_color="#cc3333"
            active={showChart === 'accesibility'}
            onClick={() => CardChartBtnClick('accesibility')}
          />
        </Col>
        <Col sm="3">
          <CardChartBtn
            title="best practices"
            content={87}
            compare_rate="18.4%"
            compare_val="98"
            compare_status={false}
            content_color="#d4893f"
            active={showChart === 'best_practices'}
            onClick={() => CardChartBtnClick('best_practices')}
          />
        </Col>
        <Col sm="3">
          <CardChartBtn
            title="seo"
            content={92}
            compare_rate="9.7%"
            compare_val="83"
            compare_status
            content_color="#ce97b0"
            active={showChart === 'seo'}
            onClick={() => CardChartBtnClick('seo')}
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

export default connect(mapStateToProps)(withRouter(SeoScoreReport));
