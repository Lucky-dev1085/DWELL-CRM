import moment, * as m from 'moment';
import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Col, Row, UncontrolledTooltip } from 'reactstrap';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import {
  ReportCompare,
  ReportCompareScoring,
  ReportCompareValue,
  ReportLabel,
  ReportValue,
  ScoringTable,
  ScoringTableBodyItem,
  ScoringTableHeaderItem,
  Separator,
  StyledTHead,
  StyledTRow,
  StyledTBody,
  AgentReportLabel,
  PropertyTableItem,
  PropertiesText,
  TableWrapper,
} from 'dwell/views/Reports/ReportBlocks/styles';
import actions from 'dwell/actions';
import Charts from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'fusioncharts/react-fusioncharts';
import FusionCharts from 'fusioncharts/fusioncharts';
import ScoredCallsModal from 'dwell/views/Reports/_scoredCallsModal';
import { LineSkeleton } from 'src/utils';
import {
  addLabelSetting,
  chartCommonSetting,
  exportCallScoringDataToXls,
  formatCompareValue,
  getCompareColor,
  getCompareIcon, sortColumns,
  tooltipHeader,
  exportAgentCallScoringDataToXls,
} from './_utils';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface CallsData {
  prospect_calls: number,
  call_answered: { calls: number, percents: number },
  call_missed: { calls: number, percents: number },
  call_busy: { calls: number, percents: number },
  call_failed: { calls: number, percents: number },
  average_call_time: number,
  sources_calls: { calls: number, percents: number, source: string }[],
  average_call_score: number,
  customer_average_call_score: number,

  amenities: number,
  closing: number,
  introduction: number,
  overall: number,
  qualifying: number,
  general: number,

  agents: {
    agent: string,
    score: number,
  }[]
}

interface CallsScoringReportProps extends RouteComponentProps {
  portfolioType: string,
  isUpdated: boolean,
  isLoaded: boolean,
  overviewReports: {
    calls_report: CallsData,
    portfolio: { calls_report: CallsData },
    compare_values: { calls_report: {
      prospect_calls: number,
      average_call_time: number,
      average_call_score: number,
      customer_average_call_score: number,
      amenities: number,
      closing: number,
      introduction: number,
      overall: number,
      qualifying: number,
      general: number,
    } },
    chart_values: { prospect_calls: number[], average_call_time: number[], average_call_score: { value: number, label: string, fakeValue?: number}[] },
  },
  compareFilterValue: string,
  currentProperty: { is_calls_scoring_enabled: boolean, is_chat_reviewing_enabled: boolean, name: string, id: number },
  type: string,
  startDate: string,
  endDate: string,
  requireRescoreCall: (id: number, body: {

  }) => void,
  customDateStart: m.Moment,
  customDateEnd: m.Moment,
  period: string,
}

const defaultAgents = [
  { agent: 'agent1', score: 100 },
  { agent: 'agent2', score: 100 },
  { agent: 'agent3', score: 100 },
  { agent: 'agent4', score: 100 },
  { agent: 'agent5', score: 100 },
  { agent: 'agent6', score: 100 },
];

const CallsScoringReport: FC<CallsScoringReportProps> = ({ overviewReports, compareFilterValue, requireRescoreCall,
  isUpdated, isLoaded, type, startDate, endDate, currentProperty, customDateStart, customDateEnd, period }) => {
  const [callScore, setCallScore] = useState(0);
  const [amenities, setAmenities] = useState(0);
  const [closing, setClosing] = useState(0);
  const [introduction, setIntroduction] = useState(0);
  const [overall, setOverall] = useState(0);
  const [qualifying, setQualifying] = useState(0);
  const [agents, setAgents] = useState([]);
  const [scoringQuestions, setScoringQuestions] = useState([]);
  const [chartValues, setChartValues] = useState({ average_call_score: [] });
  const [scoredCalls, setScoredCalls] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [compareValues, setCompareValues] = useState({
    average_call_score: 0,
    amenities: 0,
    closing: 0,
    introduction: 0,
    overall: 0,
    qualifying: 0,
    general: 0 });
  const [sortOrder, setSortOrder] = useState('desc');

  const setCallsData = (data) => {
    setAmenities(data.amenities);
    setClosing(data.closing);
    setIntroduction(data.introduction);
    setOverall(data.overall);
    setQualifying(data.qualifying);
    setCallScore(data.average_call_score);
    setAgents(data.agents.map(item => ({ ...item, properties: item.properties.join(', ') })));
    setScoredCalls(data.scored_calls);
    setScoringQuestions(data.scoring_questions);
  };

  useEffect(() => {
    if (!isEmpty(overviewReports)) {
      const { calls_report: callsReport, chart_values: overviewChartValues, portfolio } = overviewReports;
      const reportData = !isEmpty(portfolio) ? portfolio.calls_report : callsReport;
      setCallsData(reportData);
      const charts = overviewChartValues.average_call_score.map((score, index) => {
        const resultScore = { ...score, fakeValue: null };
        if (resultScore.value === null) {
          let prevNotNull = [...overviewChartValues.average_call_score].reverse()
            .findIndex((s, i) => s.value !== null && i > ((overviewChartValues.average_call_score.length - 1) - index));
          prevNotNull = prevNotNull === -1 ? prevNotNull : (overviewChartValues.average_call_score.length - 1) - prevNotNull;
          const nextNotNull = overviewChartValues.average_call_score.findIndex((s, i) => s.value !== null && i > index);

          if (prevNotNull === -1 && nextNotNull === -1) {
            resultScore.fakeValue = 0;
          } else if (prevNotNull === -1) {
            resultScore.fakeValue = overviewChartValues.average_call_score[nextNotNull].value;
          } else if (nextNotNull === -1) {
            resultScore.fakeValue = overviewChartValues.average_call_score[prevNotNull].value;
          } else {
            const difference = overviewChartValues.average_call_score[nextNotNull].value - overviewChartValues.average_call_score[prevNotNull].value;
            resultScore.fakeValue = overviewChartValues.average_call_score[prevNotNull].value + ((difference / (nextNotNull - prevNotNull)) * (index - prevNotNull));
          }
        }
        return resultScore;
      });

      setChartValues({ average_call_score: charts });

      if (!isEmpty(overviewReports.compare_values)) {
        const { compare_values: { calls_report: callsCompareValues } } = overviewReports;
        setCompareValues(callsCompareValues);
      }
    }
  }, [overviewReports]);

  useEffect(() => {
    if (!isLoaded) {
      setAgents(defaultAgents);
    }
  }, [isLoaded, isUpdated]);

  const sortTable = (column) => {
    const data = sortColumns(sortOrder === 'desc' ? 'asc' : 'desc', column, agents);
    setAgents(data);
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const requireRescore = (cell, reason) => {
    if (scoredCalls.length === 1) setShowModal(false);
    requireRescoreCall(
      cell,
      {
        id: currentProperty.id,
        date_period: period,
        custom_date_start: customDateStart && customDateStart.format('MM-DD-YYYY'),
        custom_date_end: customDateEnd && customDateEnd.format('MM-DD-YYYY'),
        type,
        compare_value: compareFilterValue,
        reason,
      },
    );
  };

  const callScoreDataSource = {
    chart: chartCommonSetting('#DF2B6D'),
    data: addLabelSetting(chartValues.average_call_score.map(({ value, label, fakeValue }) =>
      ({
        value: value === null ? fakeValue : value,
        color: '#DF2B6D',
        anchorBgColor: value === null ? '#ffffff' : '#DF2B6D',
        anchorBorderColor: value === null ? '#929eb9' : '#DF2B6D',
        label: moment(label).format('ll'),
        tooltext: `${tooltipHeader(moment(label).format('ll'))} ${value !== null ? `Average call score: ${value}` : 'No score'}`,
      }))),
  };

  const callScoreChartConfigs = {
    type: 'line',
    width: '100%',
    height: 200,
    dataFormat: 'json',
    dataSource: callScoreDataSource,
  };

  return (
    <React.Fragment>
      {type === 'property' && scoredCalls.length > 0 &&
      <ScoredCallsModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        scoredCalls={scoredCalls}
        scoringQuestions={scoringQuestions}
        requireRescore={requireRescore}
      />}
      <Row>
        <Col xs={5}>
          <div className="d-flex align-items-baseline">{isLoaded && isUpdated ?
            <>
              <ReportValue>{callScore === null ? '...' : <>{callScore}<small>%</small></>}</ReportValue>
              <ReportCompare className="ml-1" compareFilterValue={compareFilterValue}>
                <ReportCompareValue color={getCompareColor(compareValues.average_call_score)}>
                  {formatCompareValue(compareValues.average_call_score)} {getCompareIcon(compareValues.average_call_score)}
                </ReportCompareValue>
              </ReportCompare>
            </>
            : <LineSkeleton width={80} height={32} />}
          </div>
          <ReportLabel
            active={type === 'property' && scoredCalls.length > 0}
            className="d-flex align-items-center"
          >
            {scoredCalls.length > 0 && (
              <React.Fragment>
                <i
                  className="ri-download-fill"
                  id="export-call-scoring-report"
                  onClick={() => exportCallScoringDataToXls(
                    scoredCalls,
                    scoringQuestions,
                    [{ property: currentProperty.name, startDate, endDate }],
                    type,
                  )}
                />
                <Separator>|</Separator>
                <UncontrolledTooltip trigger="hover" placement="top" target="export-call-scoring-report">
                Download data
                </UncontrolledTooltip>
              </React.Fragment>)}
            {isLoaded && isUpdated ? <span onClick={() => (type === 'property' && scoredCalls.length > 0 ? setShowModal(true) : null)}>AVG. CALL SCORE</span> : <LineSkeleton width={100} height={9} />}
          </ReportLabel>
          <br />
          <div>
            {isLoaded && isUpdated ?
              <ReactFC
                {...callScoreChartConfigs}
              /> : <LineSkeleton height={200} />}
          </div>
        </Col>
        <Col>
          <ReportLabel className="mb-15">{isLoaded && isUpdated ? 'AVG. CALL CATEGORY SCORE' : <LineSkeleton width={150} height={9} />}</ReportLabel>
          <ScoringTable>
            <thead>
              <tr>
                <ScoringTableHeaderItem>{isLoaded && isUpdated ? 'Categories' : <LineSkeleton width={130} height={8} />}</ScoringTableHeaderItem>
                <ScoringTableHeaderItem>{isLoaded && isUpdated ? 'Score' : <LineSkeleton width={50} height={8} />}</ScoringTableHeaderItem>
              </tr>
            </thead>
            <tbody>
              <tr>
                <ScoringTableBodyItem>{isLoaded && isUpdated ? 'Introduction and Lead Information' : <LineSkeleton height={8} />}</ScoringTableBodyItem>
                <ScoringTableBodyItem>{isLoaded && isUpdated ? <>{introduction === null ? '...' : `${introduction}%`}
                  <ReportCompareScoring compareFilterValue={compareFilterValue}>
                    <ReportCompareValue color={getCompareColor(compareValues.introduction)}>
                      {formatCompareValue(compareValues.introduction)} {getCompareIcon(compareValues.introduction)}
                    </ReportCompareValue>
                  </ReportCompareScoring></> : <LineSkeleton width={50} height={8} />}
                </ScoringTableBodyItem>
              </tr>
              <tr>
                <ScoringTableBodyItem>{isLoaded && isUpdated ? 'Qualifying Questions' : <LineSkeleton height={8} />}</ScoringTableBodyItem>
                <ScoringTableBodyItem>{isLoaded && isUpdated ? <>{qualifying === null ? '...' : `${qualifying}%`}
                  <ReportCompareScoring compareFilterValue={compareFilterValue}>
                    <ReportCompareValue color={getCompareColor(compareValues.qualifying)}>
                      {formatCompareValue(compareValues.qualifying)} {getCompareIcon(compareValues.qualifying)}
                    </ReportCompareValue>
                  </ReportCompareScoring></> : <LineSkeleton width={50} height={8} />}
                </ScoringTableBodyItem>
              </tr>
              <tr>
                <ScoringTableBodyItem>{isLoaded && isUpdated ? 'Amenities and Benefits' : <LineSkeleton height={8} />}</ScoringTableBodyItem>
                <ScoringTableBodyItem>{isLoaded && isUpdated ? <>{amenities === null ? '...' : `${amenities}%`}
                  <ReportCompareScoring compareFilterValue={compareFilterValue}>
                    <ReportCompareValue color={getCompareColor(compareValues.amenities)}>
                      {formatCompareValue(compareValues.amenities)} {getCompareIcon(compareValues.amenities)}
                    </ReportCompareValue>
                  </ReportCompareScoring></> : <LineSkeleton width={50} height={8} />}
                </ScoringTableBodyItem>
              </tr>
              <tr>
                <ScoringTableBodyItem>{isLoaded && isUpdated ? 'Closing' : <LineSkeleton height={8} />}</ScoringTableBodyItem>
                <ScoringTableBodyItem>{isLoaded && isUpdated ? <>{closing === null ? '...' : `${closing}%`}
                  <ReportCompareScoring compareFilterValue={compareFilterValue}>
                    <ReportCompareValue color={getCompareColor(compareValues.closing)}>
                      {formatCompareValue(compareValues.closing)} {getCompareIcon(compareValues.closing)}
                    </ReportCompareValue>
                  </ReportCompareScoring></> : <LineSkeleton width={50} height={8} />}
                </ScoringTableBodyItem>
              </tr>
              <tr>
                <ScoringTableBodyItem>{isLoaded && isUpdated ? 'Overall Impression' : <LineSkeleton height={8} />}</ScoringTableBodyItem>
                <ScoringTableBodyItem>{isLoaded && isUpdated ? <>{overall === null ? '...' : `${overall}%`}
                  <ReportCompareScoring compareFilterValue={compareFilterValue}>
                    <ReportCompareValue color={getCompareColor(compareValues.overall)}>
                      {formatCompareValue(compareValues.overall)} {getCompareIcon(compareValues.overall)}
                    </ReportCompareValue>
                  </ReportCompareScoring></> : <LineSkeleton width={50} height={8} />}
                </ScoringTableBodyItem>
              </tr>
            </tbody>
          </ScoringTable>
        </Col>
        <Col>
          <AgentReportLabel className="mb-15">
            {isLoaded && isUpdated ?
              <>
                {type !== 'property' && !isEmpty(agents) &&
                <>
                  <i
                    className="ri-download-fill"
                    id="export-agents-call-scoring-report"
                    onClick={() => exportAgentCallScoringDataToXls(agents)}
                  />
                  <Separator>|</Separator>
                  <UncontrolledTooltip trigger="hover" placement="top" target="export-agents-call-scoring-report">
                    Download data
                  </UncontrolledTooltip>
                </>}
                AVG. CALL SCORE BY PROPERTY AGENT
              </>
              : <LineSkeleton width={150} height={9} />}
          </AgentReportLabel>
          <TableWrapper>
            <ScoringTable>
              <StyledTHead>
                {!isEmpty(agents) ?
                  <tr>
                    <ScoringTableHeaderItem
                      sorting
                      onClick={() => sortTable('agent')}
                    >{isLoaded && isUpdated ?
                        <span>Property Agents
                          <i className="ri-arrow-up-down-line" />
                        </span> : <LineSkeleton width={130} height={8} />}
                    </ScoringTableHeaderItem>
                    {type !== 'property' &&
                    <ScoringTableHeaderItem
                      sorting
                      onClick={() => sortTable('properties')}
                    >{isLoaded && isUpdated ?
                        <span>Properties
                          <i className="ri-arrow-up-down-line" />
                        </span> : <LineSkeleton width={130} height={8} />}
                    </ScoringTableHeaderItem>}
                    <ScoringTableHeaderItem
                      sorting
                      onClick={() => sortTable('score')}
                    >{isLoaded && isUpdated ?
                        <span>Score
                          <i className="ri-arrow-up-down-line" />
                        </span> : <LineSkeleton width={50} height={8} />}
                    </ScoringTableHeaderItem>
                  </tr>
                  :
                  <tr>
                    <ScoringTableHeaderItem className="d-flex justify-content-between">
                      <span>Property Agents</span>
                      <span>Score</span>
                    </ScoringTableHeaderItem>
                  </tr>
                }
              </StyledTHead>
              <StyledTBody>
                {!isEmpty(agents) ? agents.map((item, i) => (
                  <StyledTRow key={i}>
                    <ScoringTableBodyItem>{isLoaded && isUpdated ? item.agent : <LineSkeleton height={8} />}</ScoringTableBodyItem>
                    {type !== 'property' &&
                      <>
                        <PropertyTableItem title={item.properties} id={`properties-${i}`}>
                          {isLoaded && isUpdated ?
                            <PropertiesText>{item.properties}</PropertiesText>
                            : <LineSkeleton height={8} />}
                        </PropertyTableItem>
                        {/* <UncontrolledTooltip trigger="hover" placement="top" target={`properties-${i}`}> */}
                        {/*  {item.properties} */}
                        {/* </UncontrolledTooltip> */}
                      </>}
                    <ScoringTableBodyItem>{isLoaded && isUpdated ? `${item.score}%` : <LineSkeleton width={50} height={8} />}</ScoringTableBodyItem>
                  </StyledTRow>
                )) :
                  <StyledTRow>
                    <ScoringTableBodyItem className="d-flex justify-content-center align-items-center">
                      <div className="d-flex justify-content-center align-items-center" style={{ height: '183px' }}>No data to display</div>
                    </ScoringTableBodyItem>
                  </StyledTRow>}
              </StyledTBody>
            </ScoringTable>
          </TableWrapper>
        </Col>
      </Row>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  overviewReports: state.report.overviewReports,
  currentProperty: state.property.property,
  isLoaded: state.report.isLoaded,
  startDate: state.report.startDate,
  endDate: state.report.endDate,
});

export default connect(
  mapStateToProps,
  {
    ...actions.scoredCalls,
  },
)(withRouter(CallsScoringReport));
