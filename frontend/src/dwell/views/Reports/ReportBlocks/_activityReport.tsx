import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'codemirror/src/util/misc';

import Charts from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'fusioncharts/react-fusioncharts';
import FusionCharts from 'fusioncharts/fusioncharts';
import {
  ComparePeriodLabel,
  ReportCompare,
  ReportCompareValue,
  ReportLabel,
  ReportValue,
} from 'dwell/views/Reports/ReportBlocks/styles';
import { Row, Col } from 'reactstrap';
import { LineSkeleton } from 'src/utils';
import { formatCompareValue, getCompareColor, getCompareIcon, getCompareValue, formatNumberWithCommas } from './_utils';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface ActivityReportProps extends RouteComponentProps {
  type: string,
  isUpdated: boolean,
  isLoaded: boolean,
  overviewReports: {
    activity_report: { activities: number },
    portfolio: { activity_report: { activities: number} },
    compare_values: { activity_report: { activities: number} }
  },
  compareFilterValue: string,
  period: string,
}

const ActivityReport: FC<ActivityReportProps> = ({ overviewReports, compareFilterValue, type, isUpdated, isLoaded }) => {
  const [emails, setEmails] = useState(0);
  const [tasks, setTasks] = useState(0);
  const [notes, setNotes] = useState(0);
  const [calls, setCalls] = useState(0);
  const [agentChats, setAgentChats] = useState(0);
  const [activities, setActivities] = useState(0);
  const [compareValues, setCompareValues] = useState({ activities: 0 });

  const setActivitiesData = (data) => {
    setEmails(data.emails);
    setTasks(data.tasks);
    setNotes(data.notes);
    setActivities(data.activities);
    setCalls(data.calls);
    setAgentChats(data.agent_chats);
  };

  useEffect(() => {
    if (!isEmpty(overviewReports)) {
      const { activity_report: activityReport, portfolio } = overviewReports;
      const reportData = type === 'portfolio' && !isEmpty(portfolio) ? portfolio.activity_report : activityReport;
      setActivitiesData(reportData);

      if (!isEmpty(overviewReports.compare_values)) {
        const { compare_values: { activity_report: activityCompareValues } } = overviewReports;
        setCompareValues(activityCompareValues);
      }
    }
  }, [overviewReports]);

  const dataSource = {
    chart: {
      aligncaptionwithcanvas: '0',
      plottooltext: '<b>$dataValue</b> $displayValue',
      theme: 'fusion',
    },
    data: [
      {
        label: 'Emails',
        displayValue: 'Emails',
        value: emails,
        color: '#2E75F9',
      },
      {
        label: 'Phone calls',
        displayValue: 'Phone calls',
        value: calls,
        color: '#2E75F9',
      },
      {
        label: 'Tasks',
        displayValue: 'Tasks',
        value: tasks,
        color: '#2E75F9',
      },
      {
        label: 'Notes',
        displayValue: 'Notes',
        value: notes,
        color: '#2E75F9',
      },
      {
        label: 'Agent chats',
        displayValue: 'agent chats',
        value: agentChats,
        color: '#2E75F9',
      },
    ],
  };

  const chartConfigs = {
    type: 'bar2d',
    width: '100%',
    height: 200,
    dataFormat: 'json',
    dataSource,
  };

  return (
    <React.Fragment>
      <Row>
        <Col sm={2}>
          <div className="d-flex align-items-baseline">{isLoaded && isUpdated ?
            <>
              <ReportValue>{formatNumberWithCommas(activities)}</ReportValue>
              <ReportCompare className="ml-1" compareFilterValue={compareFilterValue}>
                <ReportCompareValue color={getCompareColor(getCompareValue(compareValues.activities))}>
                  {formatCompareValue(getCompareValue(compareValues.activities))} {getCompareIcon(getCompareValue(compareValues.activities))}
                  {!['n/a', 0].includes(compareValues.activities) && <ComparePeriodLabel>{`(${compareValues.activities[1]})`}</ComparePeriodLabel>}
                </ReportCompareValue>
              </ReportCompare>
            </> : <LineSkeleton width={80} height={32} />}
          </div>
          <ReportLabel>{isLoaded && isUpdated ? 'TOTAL ACTIVITY' : <LineSkeleton width={100} height={9} />}</ReportLabel>
        </Col>
        <Col sm={10}>
          {isLoaded && isUpdated ?
            <ReactFC
              {...chartConfigs}
            /> : <LineSkeleton height={200} />}
        </Col>
      </Row>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  overviewReports: state.report.overviewReports,
  currentProperty: state.property.property,
  isLoaded: state.report.isLoaded,
});

export default connect(mapStateToProps)(withRouter(ActivityReport));
