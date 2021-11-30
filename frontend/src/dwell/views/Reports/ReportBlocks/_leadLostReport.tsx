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
import { LineSkeleton } from 'src/utils';
import { LeadLostData, MarketingReportsProps } from 'src/interfaces';
import { formatCompareValue, getCompareColor, getCompareIcon, getCompareValue, formatNumberWithCommas } from './_utils';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface LeadLostReportProps extends RouteComponentProps {
  type: string,
  isUpdated: boolean,
  isLoaded: boolean,
  marketingReports: MarketingReportsProps,
  compareFilterValue: string,
}

const LeadLostReport: FC<LeadLostReportProps> = ({ marketingReports, compareFilterValue, type, isUpdated, isLoaded }) => {
  const [compareValues, setCompareValues] = useState({ lost_leads: 0 });
  const [leadLostData, setLeadLostData] = useState({ lost_leads: 0 } as LeadLostData);

  useEffect(() => {
    if (!isEmpty(marketingReports)) {
      const { lead_lost_report: leadLostReport, portfolio } = marketingReports;
      const reportData = type === 'portfolio' && !isEmpty(portfolio) ? portfolio.lead_lost_report : leadLostReport;
      setLeadLostData(reportData);

      if (!isEmpty(marketingReports.compare_values)) {
        const { compare_values: { lead_lost_report: leadLostCompareValues } } = marketingReports;
        setCompareValues(leadLostCompareValues);
      }
    }
  }, [marketingReports]);

  const dataSource = {
    chart: {
      aligncaptionwithcanvas: '0',
      plottooltext: '<b>$dataValue</b> $displayValue',
      theme: 'fusion',
    },
    data: Object.entries(leadLostData).filter(e => e[0] !== 'lost_leads').map(e => ({
      label: typeof e[1] === 'number' ? '' : e[1].name,
      displayValue: 'leads',
      value: typeof e[1] === 'number' ? '' : e[1].value,
      color: '#2E75F9',
    })),
  };

  const chartConfigs = {
    type: 'bar2d',
    width: '100%',
    height: 300,
    dataFormat: 'json',
    dataSource,
  };

  return (
    <React.Fragment>
      <div className="d-flex align-items-baseline">{isLoaded && isUpdated ?
        <>
          <ReportValue>{formatNumberWithCommas(leadLostData.lost_leads as number)}</ReportValue>
          <ReportCompare compareFilterValue={compareFilterValue}>
            <ReportCompareValue color={getCompareColor(getCompareValue(compareValues.lost_leads))}>
              {formatCompareValue(getCompareValue(compareValues.lost_leads))} {getCompareValue(getCompareIcon(compareValues.lost_leads))}
              {!['n/a', 0].includes(compareValues.lost_leads) && <ComparePeriodLabel>{`(${compareValues.lost_leads[1]})`}</ComparePeriodLabel>}
            </ReportCompareValue>
          </ReportCompare>
        </> : <LineSkeleton width={80} height={32} />}
      </div>
      <ReportLabel>{isLoaded && isUpdated ? 'TOTAL LEADS LOST' : <LineSkeleton width={100} height={9} />}</ReportLabel>
      <div>
        {isLoaded && isUpdated ?
          <ReactFC
            {...chartConfigs}
          /> : <LineSkeleton height={300} />}
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  marketingReports: state.report.marketingReports,
  currentProperty: state.property.property,
  isLoaded: state.report.isLoaded,
});

export default connect(mapStateToProps)(withRouter(LeadLostReport));
