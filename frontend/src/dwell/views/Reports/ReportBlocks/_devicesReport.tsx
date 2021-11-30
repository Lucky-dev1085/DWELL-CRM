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

interface DevicesData {
  desktop: number,
  mobile: number,
  tablet: number,
}

interface DevicesReportProps extends RouteComponentProps {
  type: string,
  isUpdated: boolean,
  attribution: string,
  isLoaded: boolean,
  sitesReports: {
    devices_report: DevicesData,
    portfolio: { devices_report: DevicesData },
    compare_values: { devices_report: DevicesData }
  },
  compareFilterValue: string,
  setIsAuditionOpen: (show: boolean) => void,
  setAuditionModalType: (type: string) => void,
  period: string,
}

const DevicesReport: FC<DevicesReportProps> = ({ sitesReports, compareFilterValue, type,
  isUpdated, attribution, isLoaded }) => {
  const [desktop, setDesktop] = useState(0);
  const [mobile, setMobile] = useState(0);
  const [tablet, setTablet] = useState(0);
  const [compareValues, setCompareValues] = useState({ desktop: 0, mobile: 0, tablet: 0 });

  const setDevicesData = (data) => {
    setDesktop(data.desktop);
    setMobile(data.mobile);
    setTablet(data.tablet);
  };

  useEffect(() => {
    if (!isEmpty(sitesReports)) {
      const { devices_report: devicesReport, portfolio } = sitesReports;
      const reportData = type === 'portfolio' && !isEmpty(portfolio) ? portfolio.devices_report : devicesReport;
      setDevicesData(reportData);

      if (!isEmpty(sitesReports.compare_values)) {
        const { compare_values: { devices_report: devicesCompareValues } } = sitesReports;
        setCompareValues(devicesCompareValues);
      }
    }
  }, [sitesReports]);

  const datasource = {
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
        label: 'Desktop',
        value: desktop,
        color: '#0168fa',
      },
      {
        label: 'Mobile',
        value: mobile,
        color: '#24ba7b',
      },
      {
        label: 'Tablet',
        value: tablet,
        color: '#e83e8c',
      },
    ],
  };

  const chartConfigs = {
    type: 'doughnut2d',
    width: '100%',
    height: 270,
    dataFormat: 'json',
    dataSource: datasource,
  };

  return (
    <React.Fragment>
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
  sitesReports: state.report.sitesReports,
  currentProperty: state.property.property,
  isLoaded: state.report.isLoaded,
});

export default connect(mapStateToProps)(withRouter(DevicesReport));
