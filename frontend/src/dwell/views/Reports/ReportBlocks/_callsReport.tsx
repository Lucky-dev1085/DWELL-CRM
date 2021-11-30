import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import {
  ClockIcon,
  ComparePeriodLabel,
  PhoneIcon,
  ReportCompare,
  ReportCompareValue,
  ReportLabel,
  ReportValue,
} from 'dwell/views/Reports/ReportBlocks/styles';

import Charts from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'fusioncharts/react-fusioncharts';
import FusionCharts from 'fusioncharts/fusioncharts';
import { LineSkeleton } from 'src/utils';
import {
  addLabelSetting,
  tooltipHeader,
  formatCompareValue,
  getCompareIcon,
  getCompareColor,
  getCompareValue,
  formatNumberWithCommas,
} from './_utils';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface CallsData {
  prospect_calls: number,
  call_answered: { calls: number, percents: number },
  call_missed: { calls: number, percents: number },
  call_busy: { calls: number, percents: number },
  call_failed: { calls: number, percents: number },
  average_call_time: number,
  average_call_score: number,
  customer_average_call_score: number,

  amenities: number,
  closing: number,
  introduction: number,
  overall: number,
  qualifying: number,
}

interface CallsReportProps extends RouteComponentProps {
  isUpdated: boolean,
  isLoaded: boolean,
  isSourcesCallsLoaded: boolean,
  sourcesCalls: { calls: number, percents: number, source: string }[],
  overviewReports: {
    calls_report: CallsData,
    portfolio: { calls_report: CallsData },
    compare_values: { calls_report: {
      prospect_calls: number,
      average_call_time: number,
      average_call_score: number,
      customer_average_call_score: number
    } },
    chart_values: { prospect_calls: number[], average_call_time: number[], average_call_score: number[] },
  },
  compareFilterValue: string,
}

const CallsReport: FC<CallsReportProps> = ({ overviewReports, compareFilterValue, isUpdated,
  isLoaded, isSourcesCallsLoaded, sourcesCalls = [] }) => {
  const [prospectCalls, setProspectCalls] = useState(0);
  const [callAnswered, setCallAnswered] = useState({ calls: 0, percents: 0 });
  const [callMissed, setCallMissed] = useState({ calls: 0, percents: 0 });
  const [callBusy, setCallBusy] = useState({ calls: 0, percents: 0 });
  const [callFailed, setCallFailed] = useState({ calls: 0, percents: 0 });
  const [averageCallTime, setAverageCallTime] = useState(0);
  const [chartValues, setChartValues] = useState({ prospect_calls: [], average_call_time: [] });
  const [compareValues, setCompareValues] = useState({ prospect_calls: 0,
    average_call_time: 0,
    average_call_score: 0,
    customer_average_call_score: 0 });

  const setCallsData = (data) => {
    setProspectCalls(data.prospect_calls);
    setCallAnswered(data.call_answered);
    setCallMissed(data.call_missed);
    setCallBusy(data.call_busy);
    setCallFailed(data.call_failed);
    setAverageCallTime(data.average_call_time);
  };

  useEffect(() => {
    if (!isEmpty(overviewReports)) {
      const { calls_report: callsReport, chart_values: overviewChartValues, portfolio } = overviewReports;
      const reportData = !isEmpty(portfolio) ? portfolio.calls_report : callsReport;
      setCallsData(reportData);

      setChartValues({ prospect_calls: overviewChartValues.prospect_calls, average_call_time: overviewChartValues.average_call_time });
      if (!isEmpty(overviewReports.compare_values)) {
        const { compare_values: { calls_report: callsCompareValues } } = overviewReports;
        setCompareValues(callsCompareValues);
      }
    }
  }, [overviewReports]);

  const prospectDataSource = {
    chart: {
      theme: 'fusion',
      maxLabelHeight: 90,
      drawCrossLine: 1,
      crossLineAlpha: 70,
      labelDisplay: 'none',
    },
    data: addLabelSetting(chartValues.prospect_calls.map(({ value, label }) =>
      ({
        value,
        color: '#0DB67A',
        label: moment(label).format('ll'),
        tooltext: `${tooltipHeader(moment(label).format('ll'))} Total Calls: ${value}`,
      }))),
  };

  const prospectChartConfigs = {
    type: 'column2d',
    width: '100%',
    height: 180,
    dataFormat: 'json',
    dataSource: prospectDataSource,
  };

  const callTimeDataSource = {
    chart: {
      theme: 'fusion',
      maxLabelHeight: 90,
      drawCrossLine: 1,
      crossLineAlpha: 70,
      labelDisplay: 'none',
    },
    data: addLabelSetting(chartValues.average_call_time.map(({ value, label }) =>
      ({
        value,
        color: '#5838F1',
        label: moment(label).format('ll'),
        tooltext: `${tooltipHeader(moment(label).format('ll'))} Call Time: ${value}`,
      }))),
  };

  const callTimeChartConfigs = {
    type: 'column2d',
    width: '100%',
    height: 180,
    dataFormat: 'json',
    dataSource: callTimeDataSource,
  };

  const callsDataSource = {
    chart: {
      plottooltext: '<b>$percentValue | $value</b> $label',
      showlegend: '1',
      showValues: '1',
      legendposition: 'bottom',
      usedataplotcolorforlabels: '1',
      theme: 'fusion',
      decimals: 1,
    },
    data: [
      { label: 'Calls Answered', value: callAnswered.calls, displayValue: `${callAnswered.percents}% | ${callAnswered.calls} `, color: '#24ba7b' },
      { label: 'Calls Busy', value: callBusy.calls, displayValue: `${callBusy.percents}% | ${callBusy.calls} `, color: '#ffc107' },
      { label: 'Calls Missed', value: callMissed.calls, displayValue: `${callMissed.percents}% | ${callMissed.calls} `, color: '#f3505c' },
      { label: 'Calls Failed', value: callFailed.calls, displayValue: `${callFailed.percents}% | ${callFailed.calls} `, color: '#657697' },
    ],
  };
  callsDataSource.data = callsDataSource.data.filter(item => item.value !== 0);

  const callsChartConfigs = {
    type: 'doughnut2d',
    width: '100%',
    height: 350,
    dataFormat: 'json',
    dataSource: callsDataSource,
  };

  const sourcesCallsDataSource = {
    chart: {
      plottooltext: '<b>$percentValue | $value</b> $label calls',
      showlegend: '0',
      showValues: '1',
      usedataplotcolorforlabels: '1',
      theme: 'fusion',
      decimals: 1,
    },
    data: sourcesCalls.map(source => ({
      label: source.source,
      value: source.calls,
      displayValue: `${source.source}, ${source.percents}% | ${source.calls} `,
    })),
  };

  const sourcesCallsChartConfigs = {
    type: 'doughnut2d',
    width: '100%',
    height: 350,
    dataFormat: 'json',
    dataSource: sourcesCallsDataSource,
  };

  return (
    <React.Fragment>
      <Row>
        <Col xs={6}>
          <div className="d-flex align-items-baseline">{isLoaded && isUpdated ?
            <>
              <ReportValue><PhoneIcon color="#20c997" size={24} />{formatNumberWithCommas(prospectCalls)}</ReportValue>
              <ReportCompare className="ml-1" compareFilterValue={compareFilterValue}>
                <ReportCompareValue color={getCompareColor(getCompareValue(compareValues.prospect_calls))}>
                  {formatCompareValue(getCompareValue(compareValues.prospect_calls))} {getCompareIcon(getCompareValue(compareValues.prospect_calls))}
                  {!['n/a', 0].includes(compareValues.prospect_calls) && <ComparePeriodLabel>{`(${compareValues.prospect_calls[1]})`}</ComparePeriodLabel>}
                </ReportCompareValue>
              </ReportCompare>
            </>
            : <LineSkeleton width={80} height={32} />}
          </div>
          <ReportLabel>{isLoaded && isUpdated ? 'TOTAL PROSPECT CALLS' : <LineSkeleton width={100} height={9} />}</ReportLabel>
          <br />
          <div>
            {isLoaded && isUpdated ?
              <ReactFC
                {...prospectChartConfigs}
              /> : <LineSkeleton height={180} />}
          </div>
        </Col>
        <Col xs={6}>
          <div className="d-flex align-items-baseline">{isLoaded && isUpdated ?
            <>
              <ReportValue><ClockIcon color="#7957f5" size={24} />{averageCallTime}<small>min</small></ReportValue>
              <ReportCompare className="ml-1" compareFilterValue={compareFilterValue}>
                <ReportCompareValue color={getCompareColor(getCompareValue(compareValues.average_call_time), false, true)}>
                  {formatCompareValue(getCompareValue(compareValues.average_call_time))} {getCompareIcon(getCompareValue(compareValues.average_call_time))}
                  {!['n/a', 0].includes(compareValues.average_call_time) && <ComparePeriodLabel>{`(${compareValues.average_call_time[1]})`}</ComparePeriodLabel>}
                </ReportCompareValue>
              </ReportCompare>
            </>
            : <LineSkeleton width={80} height={32} />}
          </div>
          <ReportLabel>{isLoaded && isUpdated ? 'AVG. CALL TIME (MIN)' : <LineSkeleton width={100} height={9} />}</ReportLabel>
          <br />
          <div>
            {isLoaded && isUpdated ?
              <ReactFC
                {...callTimeChartConfigs}
              /> : <LineSkeleton height={180} />}
          </div>
        </Col>
      </Row>
      <br />
      <Row>
        <Col xs={5}>
          <ReportLabel>{isLoaded && isUpdated ? 'CALL RESULTS' : <LineSkeleton width={100} height={9} />}</ReportLabel>
          {isLoaded && isUpdated ? <ReactFC {...callsChartConfigs} /> : <LineSkeleton height={350} />}
        </Col>
        <Col xs={7}>
          <ReportLabel>{isSourcesCallsLoaded && isUpdated ? 'CALLS BY SOURCE' : <LineSkeleton width={100} height={9} />}</ReportLabel>
          {isSourcesCallsLoaded && isUpdated ? <ReactFC {...sourcesCallsChartConfigs} /> : <LineSkeleton height={350} />}
        </Col>
      </Row>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  sourcesCalls: state.report.sourcesCalls,
  overviewReports: state.report.overviewReports,
  currentProperty: state.property.property,
  isLoaded: state.report.isLoaded,
  isSourcesCallsLoaded: state.report.isSourcesCallsLoaded,
});

export default connect(mapStateToProps)(withRouter(CallsReport));
