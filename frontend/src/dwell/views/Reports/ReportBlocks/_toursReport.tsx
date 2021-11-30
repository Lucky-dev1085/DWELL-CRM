import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'codemirror/src/util/misc';

import Charts from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'fusioncharts/react-fusioncharts';
import FusionCharts from 'fusioncharts/fusioncharts';

import { Col, Row } from 'reactstrap';
import {
  ComparePeriodLabel,
  ReportCompare,
  ReportCompareValue,
  ReportLabel,
  ReportValue,
  ToursChartLabel,
} from 'dwell/views/Reports/ReportBlocks/styles';
import { LineSkeleton } from 'src/utils';
import { formatCompareValue, getCompareColor, getCompareIcon, getCompareValue, formatNumberWithCommas } from './_utils';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface ToursData {
  name: string,
  value: number,
  percent: number,
}

interface ToursReportData {
  total_tours: number,
  total_leases: number,
  tours_data: ToursData,
  leases_data: ToursData,
}

interface ToursReportProps extends RouteComponentProps {
  type: string,
  isUpdated: boolean,
  overviewReports: {
    tours_report: ToursReportData,
    portfolio: { tours_report: ToursReportData },
    compare_values: { tours_report: { total_tours: number, total_leases: number }},
  },
  compareFilterValue: string,
  isLoaded: boolean,
}

const ToursReport: FC<ToursReportProps> = ({ overviewReports, compareFilterValue, type, isUpdated, isLoaded }) => {
  const [compareValues, setCompareValues] = useState({ total_tours: 0, total_leases: 0 });
  const [totalTours, setTotalTours] = useState(0);
  const [totalLeases, setTotalLeases] = useState(0);
  const [toursData, setToursData] = useState({} as ToursData);
  const [leasesData, setLeasesData] = useState({} as ToursData);

  useEffect(() => {
    if (!isEmpty(overviewReports)) {
      const { tours_report: toursReport, portfolio } = overviewReports;
      const reportData = type === 'portfolio' && !isEmpty(portfolio) ? portfolio.tours_report : toursReport;
      setTotalTours(reportData.total_tours);
      setTotalLeases(reportData.total_leases);
      setToursData(reportData.tours_data);
      setLeasesData(reportData.leases_data);

      if (!isEmpty(overviewReports.compare_values)) {
        const { compare_values: { tours_report: toursCompareValues } } = overviewReports;
        setCompareValues(toursCompareValues);
      }
    }
  }, [overviewReports]);

  const dataSource = {
    chart: {
      plottooltext: '<b>$dataValue</b> tours',
      theme: 'fusion',
      showValues: '1',
    },
    data: Object.entries(toursData).map(e => ({
      label: e[1].name,
      displayValue: `${e[1].value} | ${e[1].percent}%`,
      value: e[1].value,
      color: '#FF596A',
    })),
  };

  const leasesDataSource = {
    chart: {
      plottooltext: '<b>$dataValue</b> leases',
      theme: 'fusion',
      showValues: '1',
    },
    data: Object.entries(leasesData).map(e => ({
      label: e[1].name,
      displayValue: `${e[1].value} | ${e[1].percent}%`,
      value: e[1].value,
      color: '#00A4EA',
    })),
  };

  const chartConfigs = {
    type: 'bar2d',
    width: '100%',
    height: 170,
    dataFormat: 'json',
    dataSource,
  };

  const leasesChartConfigs = {
    type: 'bar2d',
    width: '100%',
    height: 170,
    dataFormat: 'json',
    dataSource: leasesDataSource,
  };

  return (
    <React.Fragment>
      <Row>
        <Col xs={6}>
          <div className="d-flex align-items-baseline">{isLoaded && isUpdated ?
            <>
              <ReportValue>{formatNumberWithCommas(totalTours)}</ReportValue>
              <ReportCompare className="ml-1" compareFilterValue={compareFilterValue}>
                <ReportCompareValue color={getCompareColor(getCompareValue(compareValues.total_tours))}>
                  {formatCompareValue(getCompareValue(compareValues.total_tours))} {getCompareIcon(getCompareValue(compareValues.total_tours))}
                  {!['n/a', 0].includes(compareValues.total_tours) && <ComparePeriodLabel>{`(${compareValues.total_tours[1]})`}</ComparePeriodLabel>}
                </ReportCompareValue>
              </ReportCompare>
            </>
            : <LineSkeleton width={80} height={32} />}
          </div>
          <ReportLabel>{isLoaded && isUpdated ? 'TOTAL TOURS SCHEDULED' : <LineSkeleton width={100} height={9} />}</ReportLabel>
          <ToursChartLabel>{isLoaded && isUpdated ? 'Tours By Type' : <LineSkeleton width={150} height={12} />}</ToursChartLabel>
          <div>
            {isLoaded && isUpdated ?
              <ReactFC
                {...chartConfigs}
              /> : <LineSkeleton height={170} />}
          </div>
        </Col>
        <Col xs={6}>
          <div className="d-flex align-items-baseline">{isLoaded && isUpdated ?
            <>
              <ReportValue>{formatNumberWithCommas(totalLeases)}</ReportValue>
              <ReportCompare className="ml-1" compareFilterValue={compareFilterValue}>
                <ReportCompareValue color={getCompareColor(getCompareValue(compareValues.total_leases))}>
                  {formatCompareValue(getCompareValue(compareValues.total_leases))} {getCompareIcon(getCompareValue(compareValues.total_leases))}
                  {!['n/a', 0].includes(compareValues.total_leases) && <ComparePeriodLabel>{`(${compareValues.total_leases[1]})`}</ComparePeriodLabel>}
                </ReportCompareValue>
              </ReportCompare>
            </>
            : <LineSkeleton width={80} height={32} />}
          </div>
          <ReportLabel>{isLoaded && isUpdated ? 'TOTAL LEASES FROM TOURS' : <LineSkeleton width={100} height={9} />}</ReportLabel>
          <ToursChartLabel>{isLoaded && isUpdated ? 'Leases By Tour Type' : <LineSkeleton width={150} height={12} />}</ToursChartLabel>
          <div>
            {isLoaded && isUpdated ?
              <ReactFC
                {...leasesChartConfigs}
              /> : <LineSkeleton height={170} />}
          </div>
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

export default connect(mapStateToProps)(withRouter(ToursReport));
