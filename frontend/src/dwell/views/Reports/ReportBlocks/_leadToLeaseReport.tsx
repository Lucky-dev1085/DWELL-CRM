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

import {
  ComparePeriodLabel,
  Icon,
  ReportCompare,
  ReportCompareValue,
  ReportLabel,
  ReportValue,
} from 'dwell/views/Reports/ReportBlocks/styles';
import {
  addLabelSetting,
  formatCompareValue,
  getCompareIcon,
  getCompareColor,
  getCompareValue,
  formatNumberWithCommas,
} from './_utils';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface LeadToLeaseData {
  leads: number,
  tours: number,
  leases: number,
  leased_rate: number,
  lead_to_tour: number,
  tour_to_lease: number,
}

interface LeadToLeaseReportProps extends RouteComponentProps {
  type: string,
  isUpdated: boolean,
  attribution: string,
  isLoaded: boolean,
  overviewReports: {
    lead_to_lease_report: LeadToLeaseData,
    chart_values: { leads: [], tours: [], leases: [] },
    portfolio: { lead_to_lease_report: LeadToLeaseData },
    compare_values: { lead_to_lease_report: LeadToLeaseData }
  },
  compareFilterValue: string,
  setIsAuditionOpen: (show: boolean) => void,
  setAuditionModalType: (type: string) => void,
  period: string,
}

const LeadToLeaseReport: FC<LeadToLeaseReportProps> = ({ overviewReports, compareFilterValue, type,
  isUpdated, attribution, isLoaded,
  setIsAuditionOpen, setAuditionModalType }) => {
  const [leads, setLeads] = useState(0);
  const [tours, setTours] = useState(0);
  const [leases, setLeases] = useState(0);
  const [leasedRate, setLeasedRate] = useState(0);
  const [leadToTourRate, setLeadToTourRate] = useState(0);
  const [tourToLeaseRate, setTourToLeaseRate] = useState(0);
  const [chartValues, setChartValues] = useState({ leads: [], tours: [], leases: [] });
  const [compareValues, setCompareValues] = useState({ leads: 0, tours: 0, leases: 0, leased_rate: 0, lead_to_tour: 0, tour_to_lease: 0 });

  const setLeadToLeaseData = (data) => {
    setLeads(data.leads);
    setTours(data.tours);
    setLeases(data.leases);
    setLeasedRate(data.leased_rate);
    setLeadToTourRate(data.lead_to_tour);
    setTourToLeaseRate(data.tour_to_lease);
  };

  useEffect(() => {
    if (!isEmpty(overviewReports)) {
      const { lead_to_lease_report: leadToLeaseReport, chart_values: overviewChartValues, portfolio } = overviewReports;
      const reportData = type === 'portfolio' && !isEmpty(portfolio) ? portfolio.lead_to_lease_report : leadToLeaseReport;
      setLeadToLeaseData(reportData);

      setChartValues({ leads: overviewChartValues.leads, tours: overviewChartValues.tours, leases: overviewChartValues.leases });
      if (!isEmpty(overviewReports.compare_values)) {
        const { compare_values: { lead_to_lease_report: leadToLeaseCompareValues } } = overviewReports;
        setCompareValues(leadToLeaseCompareValues);
      }
    }
  }, [overviewReports]);

  const tooltipHeader = label => `<div><span style="padding: 8px 20px 8px 8px;margin: -6px -6px 5px;text-align: center;">${label}</span></div>`;
  const dataSource = {
    chart: {
      showLegend: 0,
      drawCrossLine: 1,
      crossLineAlpha: 40,
      showvalues: 0,
      theme: 'fusion',
      plothighlighteffect: 'fadeout',
      labelDisplay: 'none',
      syncAxisLimits: 1,
    },
    categories: [{ category: addLabelSetting(chartValues.leads.map(lead => ({ label: moment(lead.label).format('ll') }))) }],
    dataset: [
      {
        seriesname: 'Leads',
        color: '#0168fa',
        data: chartValues.leads.map(({ value, label }) =>
          ({ value, tooltext: `${tooltipHeader(moment(label).format('ll'))}<br /><div style="min-width: 70px;">Leads: ${value}</div>` })),
      },
      {
        seriesname: 'Tours',
        color: '#ffc107',
        data: chartValues.tours.map(({ value }) => ({ value, tooltext: `Tours: ${value}` })),
      },
      {
        seriesname: 'Leases',
        color: '#24ba7b',
        data: chartValues.leases.map(({ value }) => ({ value, tooltext: `Leases: ${value}` })),
      },
    ],
  };

  const chartConfigs = {
    type: 'mscolumn2d',
    width: '100%',
    height: 270,
    dataFormat: 'json',
    dataSource,
  };

  const openAuditionModal = (auditionType) => {
    setAuditionModalType(auditionType);
    setIsAuditionOpen(true);
  };

  return (
    <React.Fragment>
      <Row>
        {attribution === 'PERFORMANCE' &&
              <Col sm={2}>
                <ReportValue>{isLoaded && isUpdated ? <>{leasedRate}<small>%</small></> : <LineSkeleton width={80} />}</ReportValue>
                <ReportLabel>{isLoaded && isUpdated ? 'LEASED RATE' : <LineSkeleton width={100} height={9} />}</ReportLabel>
                <ReportCompare compareFilterValue={compareFilterValue}>
                  {isLoaded && isUpdated ?
                    <ReportCompareValue color={getCompareColor(compareValues.leased_rate)}>
                      {formatCompareValue(compareValues.leased_rate)} {getCompareIcon(compareValues.leased_rate)}
                    </ReportCompareValue> :
                    <LineSkeleton width={80} height={8} />}
                </ReportCompare>
              </Col>}
        <Col sm={attribution === 'PERFORMANCE' ? 2 : 4}>
          <ReportValue>{isLoaded && isUpdated ? <>{formatNumberWithCommas(leads)}<Icon className="ri-bar-chart-fill" color="#0168fa" /></> : <LineSkeleton width={80} />}</ReportValue>
          <ReportLabel
            active={type === 'property' && leads > 0}
            onClick={() => (type === 'property' && leads > 0 ? openAuditionModal('LEADS') : null)}
          >{isLoaded && isUpdated ? 'TOTAL LEADS' : <LineSkeleton width={100} height={9} />}
          </ReportLabel>
          <ReportCompare compareFilterValue={compareFilterValue}>
            {isLoaded && isUpdated ?
              <ReportCompareValue color={getCompareColor(getCompareValue(compareValues.leads))}>
                {formatCompareValue(getCompareValue(compareValues.leads))} {getCompareIcon(getCompareValue(compareValues.leads))}
                {!['n/a', 0].includes(compareValues.leads) && <ComparePeriodLabel>{`(${compareValues.leads[1]})`}</ComparePeriodLabel>}
              </ReportCompareValue> :
              <LineSkeleton width={80} height={8} />}
          </ReportCompare>
        </Col>
        {attribution === 'PERFORMANCE' &&
              <Col sm={2}>
                <ReportValue>{isLoaded && isUpdated ? <>{leadToTourRate}<small>%</small></> : <LineSkeleton width={80} />}</ReportValue>
                <ReportLabel>{isLoaded && isUpdated ? 'LEAD TO TOUR RATE' : <LineSkeleton width={100} height={9} />}</ReportLabel>
                <ReportCompare compareFilterValue={compareFilterValue}>
                  {isLoaded && isUpdated ?
                    <ReportCompareValue color={getCompareColor(compareValues.lead_to_tour)}>
                      {formatCompareValue(compareValues.lead_to_tour)} {getCompareIcon(compareValues.lead_to_tour)}
                    </ReportCompareValue> :
                    <LineSkeleton width={80} height={8} />}
                </ReportCompare>
              </Col>}
        <Col sm={attribution === 'PERFORMANCE' ? 2 : 4}>
          <ReportValue>{isLoaded && isUpdated ? <>{formatNumberWithCommas(tours)}<Icon className="ri-bar-chart-fill" color="#ffc107" /></> : <LineSkeleton width={80} />}</ReportValue>
          <ReportLabel
            active={type === 'property' && tours > 0}
            onClick={() => (type === 'property' && tours > 0 ? openAuditionModal('TOURS') : null)}
          >{isLoaded && isUpdated ? 'TOTAL TOURS' : <LineSkeleton width={100} height={9} />}
          </ReportLabel>
          <ReportCompare compareFilterValue={compareFilterValue}>
            {isLoaded && isUpdated ?
              <ReportCompareValue color={getCompareColor(getCompareValue(compareValues.tours))}>
                {formatCompareValue(getCompareValue(compareValues.tours))} {getCompareIcon(getCompareValue(compareValues.tours))}
                {!['n/a', 0].includes(compareValues.tours) && <ComparePeriodLabel>{`(${compareValues.tours[1]})`}</ComparePeriodLabel>}
              </ReportCompareValue> :
              <LineSkeleton width={80} height={8} />}
          </ReportCompare>
        </Col>
        {attribution === 'PERFORMANCE' &&
              <Col sm={2}>
                <ReportValue>{isLoaded && isUpdated ? <>{tourToLeaseRate}<small>%</small></> : <LineSkeleton width={80} />}</ReportValue>
                <ReportLabel>{isLoaded && isUpdated ? 'TOUR TO LEASE RATE' : <LineSkeleton width={100} height={9} />}</ReportLabel>
                <ReportCompare compareFilterValue={compareFilterValue}>
                  {isLoaded && isUpdated ?
                    <ReportCompareValue color={getCompareColor(compareValues.tour_to_lease)}>
                      {formatCompareValue(compareValues.tour_to_lease)} {getCompareIcon(compareValues.tour_to_lease)}
                    </ReportCompareValue> :
                    <LineSkeleton width={80} height={8} />}
                </ReportCompare>
              </Col>}
        <Col sm={attribution === 'PERFORMANCE' ? 2 : 4}>
          <ReportValue>{isLoaded && isUpdated ? <>{formatNumberWithCommas(leases)}<Icon className="ri-bar-chart-fill" color="#24ba7b" /></> : <LineSkeleton width={80} />}</ReportValue>
          <ReportLabel
            active={type === 'property' && leases > 0}
            onClick={() => (type === 'property' && leases > 0 ? openAuditionModal('LEASES') : null)}
          >{isLoaded && isUpdated ? 'TOTAL LEASES' : <LineSkeleton width={100} height={9} />}
          </ReportLabel>
          <ReportCompare compareFilterValue={compareFilterValue}>
            {isLoaded && isUpdated ?
              <ReportCompareValue color={getCompareColor(getCompareValue(compareValues.leases))}>
                {formatCompareValue(getCompareValue(compareValues.leases))} {getCompareIcon(getCompareValue(compareValues.leases))}
                {!['n/a', 0].includes(compareValues.leases) && <ComparePeriodLabel>{`(${compareValues.leases[1]})`}</ComparePeriodLabel>}
              </ReportCompareValue> :
              <LineSkeleton width={80} height={8} />}
          </ReportCompare>
        </Col>
      </Row>
      <br />
      <div>
        {isLoaded && isUpdated ?
          <ReactFC
            {...chartConfigs}
          /> :
          <LineSkeleton height={270} />}
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  overviewReports: state.report.overviewReports,
  currentProperty: state.property.property,
  isLoaded: state.report.isLoaded,
});

export default connect(mapStateToProps)(withRouter(LeadToLeaseReport));
