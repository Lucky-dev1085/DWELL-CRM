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

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface AcquisitionChannelsData {
  direct: number,
  paid_search: number,
  display: number,
  affiliates: number,
  other: number,
  organic_search: number,
  referral: number,
}

interface AcquisitionChannelsReportProps extends RouteComponentProps {
  type: string,
  isUpdated: boolean,
  attribution: string,
  isLoaded: boolean,
  sitesReports: {
    acquisition_channels_report: AcquisitionChannelsData,
    portfolio: { acquisition_channels_report: AcquisitionChannelsData },
    compare_values: { acquisition_channels_report: AcquisitionChannelsData }
  },
  compareFilterValue: string,
  setIsAuditionOpen: (show: boolean) => void,
  setAuditionModalType: (type: string) => void,
  period: string,
}

const AcquisitionChannelsReport: FC<AcquisitionChannelsReportProps> = ({ sitesReports, compareFilterValue, type,
  isUpdated, attribution, isLoaded }) => {
  const [direct, setDirect] = useState(0);
  const [paidSearch, setPaidSearch] = useState(0);
  const [display, setDisplay] = useState(0);
  const [affiliates, setAffiliates] = useState(0);
  const [other, setOther] = useState(0);
  const [organicSearch, setOrganicSearch] = useState(0);
  const [referral, setReferral] = useState(0);
  const [compareValues, setCompareValues] = useState({ direct: 0, paid_search: 0, display: 0, affiliates: 0, other: 0, organic_search: 0, referral: 0 });

  const setAcquisitionChannelsData = (data) => {
    setDirect(data.direct);
    setPaidSearch(data.paid_search);
    setDisplay(data.display);
    setAffiliates(data.affiliates);
    setOther(data.other);
    setOrganicSearch(data.organic_search);
    setReferral(data.referral);
  };

  useEffect(() => {
    if (!isEmpty(sitesReports)) {
      const { acquisition_channels_report: acquisitionChannelsReport, portfolio } = sitesReports;
      const reportData = type === 'portfolio' && !isEmpty(portfolio) ? portfolio.acquisition_channels_report : acquisitionChannelsReport;
      setAcquisitionChannelsData(reportData);

      if (!isEmpty(sitesReports.compare_values)) {
        const { compare_values: { acquisition_channels_report: acquisitionChannelsCompareValues } } = sitesReports;
        setCompareValues(acquisitionChannelsCompareValues);
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
      legendPosition: 'right',
    },
    data: [
      {
        label: 'Direct',
        value: direct,
      },
      {
        label: 'Paid Search',
        value: paidSearch,
      },
      {
        label: 'Display',
        value: display,
      },
      {
        label: 'Affiliates',
        value: affiliates,
      },
      {
        label: '(Other)',
        value: other,
      },
      {
        label: 'Organic Search',
        value: organicSearch,
      },
      {
        label: 'Referral',
        value: referral,
      },
    ],
  };

  const chartConfigs = {
    type: 'doughnut2d',
    width: '100%',
    height: 350,
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

export default connect(mapStateToProps)(withRouter(AcquisitionChannelsReport));
