import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'codemirror/src/util/misc';

import Charts from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'fusioncharts/react-fusioncharts';
import FusionCharts from 'fusioncharts/fusioncharts';

import { Dropdown } from 'reactstrap';
import { LineSkeleton } from 'src/utils';
import {
  DropdownWrapper, FollowupsLabelsItem, FollowupsLabelsItemPercents, FollowupsLabelsList,
  ReportCompare,
  ReportCompareValue,
  ReportLabel,
  ReportValue,
  DropdownButton, SelectItem, SelectMenu, ComparePeriodLabel,
} from 'dwell/views/Reports/ReportBlocks/styles';
import {
  addLabelSetting,
  chartCommonSetting,
  tooltipHeader,
  formatCompareValue,
  getCompareIcon,
  getCompareColor, getCompareValue, convertTime, formatNumberWithCommas,
} from './_utils';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface EngagementData {
  average_response_time_business: number,
  average_response_time_non_business: number,
  average_sign_lease_time: number,
  average_followups_number: number,
  followups_2_hours: number,
  followups_24_hours: number,
  followups_48_hours: number,
  followups_more_48_hours: number,
}

interface EngagementReportProps extends RouteComponentProps {
  type: string,
  isUpdated: boolean,
  isLoaded: boolean,
  overviewReports: {
    engagement_report: EngagementData,
    portfolio: { engagement_report: EngagementData },
    compare_values: { engagement_report: EngagementData},
    chart_values: {
      average_response_time_business: number[],
      average_response_time_non_business: number[],
      average_sign_lease_time: number[],
      average_followups_number: number[]
    },
  },
  compareFilterValue: string,
  isBusinessHours: boolean,
  setIsBusinessHours: (isBusiness: boolean) => void,
}

const EngagementReport: FC<EngagementReportProps> = ({ overviewReports, type, isUpdated, compareFilterValue, isBusinessHours, setIsBusinessHours, isLoaded }) => {
  const [responseTime, setResponseTime] = useState(0);
  const [signLeaseTime, setSignLeaseTime] = useState(0);
  const [followupsNumber, setFollowupsNumber] = useState(0);
  const [followups2Hours, setFollowups2Hours] = useState(0);
  const [followups24Hours, setFollowups24Hours] = useState(0);
  const [followups48Hours, setFollowups48Hours] = useState(0);
  const [followupsMore48Hours, setFollowupsMore48Hours] = useState(0);
  const [chartValues, setChartValues] = useState({ average_response_time: [], average_sign_lease_time: [], average_followups_number: [] });
  const [compareValues, setCompareValues] = useState({
    average_response_time_business: 0,
    average_response_time_non_business: 0,
    average_sign_lease_time: 0,
    average_followups_number: 0,
    followups_2_hours: 0,
    followups_24_hours: 0,
    followups_48_hours: 0,
    followups_more_48_hours: 0 });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const setEngagementData = (data) => {
    setResponseTime(isBusinessHours
      ? data.average_response_time_business
      : data.average_response_time_non_business);
    setSignLeaseTime(data.average_sign_lease_time);
    setFollowupsNumber(data.average_followups_number);
    setFollowups2Hours(Math.round(data.followups_2_hours[isBusinessHours ? 0 : 1]));
    setFollowups24Hours(Math.round(data.followups_24_hours[isBusinessHours ? 0 : 1]));
    setFollowups48Hours(Math.round(data.followups_48_hours[isBusinessHours ? 0 : 1]));
    setFollowupsMore48Hours(Math.round(data.followups_more_48_hours[isBusinessHours ? 0 : 1]));
  };

  const loadReportData = () => {
    if (!isEmpty(overviewReports)) {
      const { engagement_report: engagementReport, chart_values: overviewChartValues, portfolio } = overviewReports;
      if (type === 'portfolio' && !isEmpty(portfolio)) {
        setEngagementData(portfolio.engagement_report);
      }
      if (type === 'property' && portfolio === undefined) {
        setEngagementData(engagementReport);
      }

      setChartValues({
        average_response_time: isBusinessHours ? overviewChartValues.average_response_time_business : overviewChartValues.average_response_time_non_business,
        average_sign_lease_time: overviewChartValues.average_sign_lease_time,
        average_followups_number: overviewChartValues.average_followups_number,
      });

      if (!isEmpty(overviewReports.compare_values)) {
        const { compare_values: { engagement_report: engagementCompareValues } } = overviewReports;
        setCompareValues(engagementCompareValues);
      }
    }
  };

  useEffect(() => {
    loadReportData();
  }, [overviewReports, isBusinessHours]);

  const responseTimeDataSource = {
    chart: chartCommonSetting('#2E75F9'),
    data: addLabelSetting(chartValues.average_response_time.map(({ value, label }) =>
      ({
        value,
        color: '#2E75F9',
        label: moment(label).format('ll'),
        tooltext: `${tooltipHeader(moment(label).format('ll'))} Response Time: ${value}`,
      }))),
  };

  const responseTimeChartConfigs = {
    type: 'area2d',
    width: '100%',
    height: 200,
    dataFormat: 'json',
    dataSource: responseTimeDataSource,
  };

  const signLeaseTimeDataSource = {
    chart: chartCommonSetting('#35B96A'),
    data: addLabelSetting(chartValues.average_sign_lease_time.map(({ value, label }) =>
      ({
        value,
        color: '#35B96A',
        label: moment(label).format('ll'),
        tooltext: `${tooltipHeader(moment(label).format('ll'))} Lease days: ${value}`,
      }))),
  };

  const signLeaseTimeChartConfigs = {
    type: 'area2d',
    width: '100%',
    height: 200,
    dataFormat: 'json',
    dataSource: signLeaseTimeDataSource,
  };

  const followupsNumberDataSource = {
    chart: chartCommonSetting('#FC5E07'),
    data: addLabelSetting(chartValues.average_followups_number.map(({ value, label }) =>
      ({
        value,
        color: '#FC5E07',
        label: moment(label).format('ll'),
        tooltext: `${tooltipHeader(moment(label).format('ll'))} Followups: ${value}`,
      }))),
  };

  const followupsNumberChartConfigs = {
    type: 'area2d',
    width: '100%',
    height: 200,
    dataFormat: 'json',
    dataSource: followupsNumberDataSource,
  };

  const followupsDataSource = {
    chart: {
      plottooltext: '<b>$percentValue</b>  followups $label',
      showlegend: '0',
      showValues: '0',
      showLabels: '0',
      usedataplotcolorforlabels: '1',
      theme: 'fusion',
      decimals: 1,
    },
    data: [
      {
        label: 'within 2 hours',
        value: followups2Hours,
        color: '#0168fa',
      },
      {
        label: 'within 24 hours',
        value: followups24Hours,
        color: '#20c997',
      },
      {
        label: 'within 48 hours',
        value: followups48Hours,
        color: '#fd7e14',
      },
      {
        label: 'more than 48 hours',
        value: followupsMore48Hours,
        color: '#e83e8c',
      },
    ],
  };

  const followupsChartConfigs = {
    type: 'doughnut2d',
    width: '100%',
    height: 300,
    dataFormat: 'json',
    dataSource: followupsDataSource,
  };

  return (
    <React.Fragment>
      <div className="d-flex align-items-baseline">{isLoaded && isUpdated ?
        <>
          {convertTime(responseTime)}
          <ReportCompare className="ml-1" compareFilterValue={compareFilterValue}>
            <ReportCompareValue color={getCompareColor(getCompareValue(isBusinessHours ? compareValues.average_response_time_business : compareValues.average_response_time_non_business), true)}>
              {formatCompareValue(getCompareValue(isBusinessHours ? compareValues.average_response_time_business : compareValues.average_response_time_non_business))}
              {getCompareIcon(getCompareValue(isBusinessHours ? compareValues.average_response_time_business : compareValues.average_response_time_non_business))}
              {!['n/a', 0].includes(isBusinessHours ? compareValues.average_response_time_business : compareValues.average_response_time_non_business) &&
                <ComparePeriodLabel>{`(${isBusinessHours ? compareValues.average_response_time_business[1] : compareValues.average_response_time_non_business[1]})`}</ComparePeriodLabel>}
            </ReportCompareValue>
          </ReportCompare>
        </> : <LineSkeleton width={80} height={32} />}
      </div>
      <ReportLabel>{isLoaded && isUpdated ? 'AVG. LEAD RESPONSE TIME (HRS)' : <LineSkeleton width={100} height={9} />}</ReportLabel>
      {isLoaded && isUpdated ?
        <DropdownWrapper><span>Showing times:</span>
          <Dropdown isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(!isDropdownOpen)} >
            <DropdownButton
              caret
              tag="div"
              data-toggle="dropdown"
              aria-expanded={isDropdownOpen}
            >
              {isBusinessHours ? 'During business hours' : 'During non-business hours'}
            </DropdownButton>
            <SelectMenu>
              <SelectItem key="business" onClick={() => setIsBusinessHours(true)}>During business hours</SelectItem>
              <SelectItem key="non-business" onClick={() => setIsBusinessHours(false)}>During non-business hours</SelectItem>
            </SelectMenu>
          </Dropdown>
        </DropdownWrapper> : <LineSkeleton height={9} />}
      <div>
        {isLoaded && isUpdated ? <ReactFC
          {...responseTimeChartConfigs}
        /> : <LineSkeleton height={200} />}
      </div>
      <hr />
      <div className="d-flex align-items-baseline">{isLoaded && isUpdated ?
        <>
          <ReportValue>{formatNumberWithCommas(signLeaseTime)}<small>days</small></ReportValue>
          <ReportCompare className="ml-1" compareFilterValue={compareFilterValue}>
            <ReportCompareValue color={getCompareColor(getCompareValue(compareValues.average_sign_lease_time), true)}>
              {formatCompareValue(getCompareValue(compareValues.average_sign_lease_time))} {getCompareIcon(getCompareValue(compareValues.average_sign_lease_time))}
              {!['n/a', 0].includes(compareValues.average_sign_lease_time) && <ComparePeriodLabel>{`(${compareValues.average_sign_lease_time[1]})`}</ComparePeriodLabel>}
            </ReportCompareValue>
          </ReportCompare>
        </> : <LineSkeleton width={80} height={32} />}
      </div>
      <ReportLabel>{isLoaded && isUpdated ? 'AVG. TIME TO SIGN LEASE (DAYS)' : <LineSkeleton width={100} height={9} />}</ReportLabel>
      <div>
        {isLoaded && isUpdated ? <ReactFC
          {...signLeaseTimeChartConfigs}
        /> : <LineSkeleton height={200} />}
      </div>
      <hr />
      <div className="d-flex align-items-baseline">{isLoaded && isUpdated ?
        <>
          <ReportValue>{formatNumberWithCommas(followupsNumber)}</ReportValue>
          <ReportCompare className="ml-1" compareFilterValue={compareFilterValue}>
            <ReportCompareValue color={getCompareColor(getCompareValue(compareValues.average_followups_number), true)}>
              {formatCompareValue(getCompareValue(compareValues.average_followups_number))} {getCompareIcon(getCompareValue(compareValues.average_followups_number))}
              {!['n/a', 0].includes(compareValues.average_followups_number) && <ComparePeriodLabel>{`(${compareValues.average_followups_number[1]})`}</ComparePeriodLabel>}
            </ReportCompareValue>
          </ReportCompare>
        </> : <LineSkeleton width={80} height={32} />}
      </div>
      <ReportLabel>{isLoaded && isUpdated ? 'AVG. NUMBER OF FOLLOWUPS TO SIGN LEASE' : <LineSkeleton width={100} height={9} />}</ReportLabel>
      <div>
        {isLoaded && isUpdated ? <ReactFC
          {...followupsNumberChartConfigs}
        /> : <LineSkeleton height={200} />}
      </div>
      <hr />
      <ReportLabel>{isLoaded && isUpdated ? 'LEAD RESPONSE TIME RANGE' : <LineSkeleton width={100} height={9} />}</ReportLabel>
      <FollowupsLabelsList>
        <FollowupsLabelsItem color="#0168fa">
          <span>{isLoaded && isUpdated ? 'Followup within 2 hrs' : <LineSkeleton width={100} height={9} />}</span>
          <FollowupsLabelsItemPercents>{isLoaded && isUpdated ?
            <>
              <span>{followups2Hours}%</span>
              <ReportCompare compareFilterValue={compareFilterValue}>
                <ReportCompareValue color={getCompareColor(compareValues.followups_2_hours[isBusinessHours ? 0 : 1], true)}>
                  {formatCompareValue(compareValues.followups_2_hours[isBusinessHours ? 0 : 1])}
                  {getCompareIcon(compareValues.followups_2_hours[isBusinessHours ? 0 : 1])}
                </ReportCompareValue>
              </ReportCompare>
            </> : <LineSkeleton width={30} height={9} />}
          </FollowupsLabelsItemPercents>
        </FollowupsLabelsItem>
        <FollowupsLabelsItem color="#20c997">
          <span>{isLoaded && isUpdated ? 'Followup within 24 hrs' : <LineSkeleton width={100} height={9} />}</span>
          <FollowupsLabelsItemPercents>{isLoaded && isUpdated ?
            <>
              <span>{followups24Hours}%</span>
              <ReportCompare compareFilterValue={compareFilterValue}>
                <ReportCompareValue color={getCompareColor(compareValues.followups_24_hours[isBusinessHours ? 0 : 1], true)}>
                  {formatCompareValue(compareValues.followups_24_hours[isBusinessHours ? 0 : 1])}
                  {getCompareIcon(compareValues.followups_24_hours[isBusinessHours ? 0 : 1])}
                </ReportCompareValue>
              </ReportCompare>
            </> : <LineSkeleton width={30} height={9} />}
          </FollowupsLabelsItemPercents>
        </FollowupsLabelsItem>
        <FollowupsLabelsItem color="#fd7e14">
          <span>{isLoaded && isUpdated ? 'Followup within 48 hrs' : <LineSkeleton width={100} height={9} />}</span>
          <FollowupsLabelsItemPercents>{isLoaded && isUpdated ?
            <>
              <span>{followups48Hours}%</span>
              <ReportCompare compareFilterValue={compareFilterValue}>
                <ReportCompareValue color={getCompareColor(compareValues.followups_48_hours[isBusinessHours ? 0 : 1], true)}>
                  {formatCompareValue(compareValues.followups_48_hours[isBusinessHours ? 0 : 1])}
                  {getCompareIcon(compareValues.followups_48_hours[isBusinessHours ? 0 : 1])}
                </ReportCompareValue>
              </ReportCompare>
            </> : <LineSkeleton width={30} height={9} />}
          </FollowupsLabelsItemPercents>
        </FollowupsLabelsItem>
        <FollowupsLabelsItem color="#e83e8c">
          <span>{isLoaded && isUpdated ? 'Followup more than 48 hrs' : <LineSkeleton width={100} height={9} />}</span>
          <FollowupsLabelsItemPercents>{isLoaded && isUpdated ?
            <>
              <span>{followupsMore48Hours}%</span>
              <ReportCompare compareFilterValue={compareFilterValue}>
                <ReportCompareValue color={getCompareColor(compareValues.followups_more_48_hours[isBusinessHours ? 0 : 1], true)}>
                  {formatCompareValue(compareValues.followups_more_48_hours[isBusinessHours ? 0 : 1])}
                  {getCompareIcon(compareValues.followups_more_48_hours[isBusinessHours ? 0 : 1])}
                </ReportCompareValue>
              </ReportCompare>
            </> : <LineSkeleton width={30} height={9} />}
          </FollowupsLabelsItemPercents>
        </FollowupsLabelsItem>
      </FollowupsLabelsList>
      <div>
        {isLoaded && isUpdated ? <ReactFC
          {...followupsChartConfigs}
        /> : <LineSkeleton height={300} />}
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  overviewReports: state.report.overviewReports,
  currentProperty: state.property.property,
  isLoaded: state.report.isLoaded,
});

export default connect(mapStateToProps)(withRouter(EngagementReport));
