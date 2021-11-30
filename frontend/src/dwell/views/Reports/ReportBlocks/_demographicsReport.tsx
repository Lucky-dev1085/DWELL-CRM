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

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface DemographicsData {
  male: { all: number, desktop: number, tablet: number, mobile: number },
  female: { all: number, desktop: number, tablet: number, mobile: number },
}

interface DemographicsReportProps extends RouteComponentProps {
  type: string,
  isUpdated: boolean,
  attribution: string,
  isLoaded: boolean,
  sitesReports: {
    demographics_report: DemographicsData,
    chart_values: {
      male: { all: [], desktop: [], tablet: [], mobile: [] },
      female: { all: [], desktop: [], tablet: [], mobile: [] },
    },
    portfolio: { demographics_report: DemographicsData },
    compare_values: { demographics_report: DemographicsData }
  },
  compareFilterValue: string,
  setIsAuditionOpen: (show: boolean) => void,
  setAuditionModalType: (type: string) => void,
  period: string,
}

const DemographicsReport: FC<DemographicsReportProps> = ({ sitesReports, compareFilterValue, type,
  isUpdated, attribution, isLoaded }) => {
  const [male, setMale] = useState({ all: 0, desktop: 0, tablet: 0, mobile: 0 });
  const [female, setFemale] = useState({ all: 0, desktop: 0, tablet: 0, mobile: 0 });
  const [malePercent, setMalePercent] = useState(0);
  const [femalePercent, setFemalePercent] = useState(0);
  const [maleLabel, setMaleLabel] = useState('');
  const [femaleLabel, setFemaleLabel] = useState('');
  const [chartValues, setChartValues] = useState({ male: [], female: [] });
  const [compareValues, setCompareValues] = useState({ male: { all: 0, desktop: 0, tablet: 0, mobile: 0 }, female: { all: 0, desktop: 0, tablet: 0, mobile: 0 } });

  const setDemographicsData = (data) => {
    setMale(data.male);
    setFemale(data.female);
    const sum = data.male.all + data.female.all;
    const maleP = data.male.all / sum;
    const femaleP = data.female.all / sum;
    setMalePercent(Number((maleP * 100).toFixed(1)));
    setFemalePercent(Number((femaleP * 100).toFixed(1)));

    let maleLabelTmp = 'Male : ';
    let femaleLabeltmp = 'Female : ';

    maleLabelTmp += data.male.all.toString();
    maleLabelTmp += '(';
    maleLabelTmp += (maleP * 100).toFixed(1);
    maleLabelTmp += '%)';

    femaleLabeltmp += data.female.all.toString();
    femaleLabeltmp += '(';
    femaleLabeltmp += (femaleP * 100).toFixed(1);
    femaleLabeltmp += '%)';

    setMaleLabel(maleLabelTmp);
    setFemaleLabel(femaleLabeltmp);
  };

  useEffect(() => {
    if (!isEmpty(sitesReports)) {
      const { demographics_report: demographicsReport, chart_values: sitesChartValues, portfolio } = sitesReports;
      const reportData = type === 'portfolio' && !isEmpty(portfolio) ? portfolio.demographics_report : demographicsReport;
      setDemographicsData(reportData);

      setChartValues({
        male: sitesChartValues.male.all,
        female: sitesChartValues.female.all,
      });
      if (!isEmpty(sitesReports.compare_values)) {
        const { compare_values: { demographics_report: demographicsCompareValues } } = sitesReports;
        setCompareValues(demographicsCompareValues);
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
      showLegend: 0,
    },
    categories: [{ category: chartValues.male.map(item => ({ label: item.label })) }],
    dataset: [
      {
        seriesname: 'Male',
        color: '#408efb',
        data: chartValues.male.map(({ value, label }) =>
          ({ value, tooltext: `${tooltipHeader(label)}<br /><div style="min-width: 70px;">Male: ${value}</div>` })),
      },
      {
        seriesname: 'Female',
        color: '#bfd9fe',
        data: chartValues.female.map(({ value }) => ({ value, tooltext: `Female: ${value}` })),
      },
    ],
  };

  const chartConfigs = {
    type: 'stackedbar2d',
    width: '100%',
    height: 270,
    dataFormat: 'json',
    dataSource,
  };

  const demographicsDatasource = {
    chart: {
      plottooltext: '<b>$label : </b> $value',
      showlegend: '1',
      showValues: '0',
      showLabels: '0',
      usedataplotcolorforlabels: '1',
      theme: 'fusion',
      decimals: 1,
    },
    data: [
      {
        label: maleLabel,
        value: malePercent,
        color: '#408efb',
      },
      {
        label: femaleLabel,
        value: femalePercent,
        color: '#bfd9fe',
      },
    ],
  };

  const demographicsChartConfigs = {
    type: 'doughnut2d',
    width: '100%',
    height: 270,
    dataFormat: 'json',
    dataSource: demographicsDatasource,
  };

  return (
    <React.Fragment>
      <Row>
        <Col sm={6}>
          {isLoaded && isUpdated ?
            <ReactFC
              {...demographicsChartConfigs}
            /> :
            <LineSkeleton height={270} />}
        </Col>
        <Col sm={6}>
          {isLoaded && isUpdated ?
            <ReactFC
              {...chartConfigs}
            /> :
            <LineSkeleton height={270} />}
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

export default connect(mapStateToProps)(withRouter(DemographicsReport));
