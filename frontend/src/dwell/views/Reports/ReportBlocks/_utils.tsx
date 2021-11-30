import moment from 'moment';
import React from 'react';
import { CHAT_MESSAGE_STATUSES } from 'dwell/constants/chat_evaluations';
import { PriceValueSmall, ReportValue } from 'dwell/views/Reports/ReportBlocks/styles';
import { TableColumn, ChatReportStats } from 'src/interfaces';
import { getPropertyId, LineSkeleton } from 'src/utils';

interface LeadSorce {
  source: string,
  type: string,
  leads: number,
  tours: number,
  leases: number,
  calls: number,
  leased_rate: number,
  tour_completed_rate: number,
  spend: number,
  cost_per_lead: number,
  cost_per_tour: number,
  cost_per_lease: number,
}

interface Spend {
  date: string,
  price: number,
}

interface CommonSetting {
  theme: string,
  usePlotGradientColor: string,
  plotGradientColor: string,
  plotFillAngle: string,
  plotFillAlpha: string,
  plotFillRatio: string,
  showPlotBorder: string,
  drawFullAreaBorder: string,
  plotBorderColor: string,
  anchorAlpha: string,
  anchorBgColor: string,
  anchorBorderColor: string,
  plotFillColor: string,
  plotBorderAlpha: string,
  maxLabelHeight: number,
  drawCrossLine: number,
  crossLineAlpha: number,
  labelDisplay: string,
}

interface Source {
  label: string,
  showLabel?: string,
}

interface Agent {
  agent: string,
  score: number,
  properties: string,
}

interface CallScoringDrilldown {
  property: string,
  average_call_score: number,
  introduction: number,
  qualifying: number,
  amenities: number,
  closing: number,
  overall: number,
}

interface CallScoringData {
  lead_id: string,
  property: string,
  lead_name: string,
  source: string,
  prospect_phone_number: string,
  agent_name: string,
  duration: number,
  date: string,
  score: number,
  yes_questions: string[],
  omitted_questions: string[],
}

interface DateRange {
  property: string,
  startDate: string,
  endDate: string,
}

interface Questions {
  id: string,
  question: string,
  weight: number,
}

export const addLabelSetting = (source: Source[]): Source[] => source.map((item, index) => ({ ...item, showLabel: [0, source.length - 1].includes(index) ? '1' : '0' }));
export const tooltipHeader = (label: string): string => `<div style="background-color:#0168fa;color:#fff;border-radius: 3px 3px 0 0;padding: 8px;margin: -6px -6px 5px;text-align: center;">${label}</div>`;

export const chartCommonSetting = (color: string): CommonSetting => ({
  theme: 'fusion',
  usePlotGradientColor: '1',
  plotGradientColor: '#ffffff',
  plotFillAngle: '90',
  plotFillAlpha: '20',
  plotFillRatio: '10,100',
  showPlotBorder: '1',
  drawFullAreaBorder: '0',
  plotBorderColor: color,
  anchorAlpha: '100',
  anchorBgColor: color,
  anchorBorderColor: color,
  plotFillColor: color,
  plotBorderAlpha: '100',
  maxLabelHeight: 90,
  drawCrossLine: 1,
  crossLineAlpha: 70,
  labelDisplay: 'none',
});

export const getTotalSpends = (spends: Spend[], startDate: string, endDate: string): number => {
  const start = moment.utc(startDate).startOf('day');
  const end = moment.utc(endDate).startOf('day');
  let totalSpends = 0;
  spends.forEach((spend) => {
    const date = moment.utc(spend.date);
    if (start.isSame(date, 'month') || end.isSame(date, 'month')) {
      if (start.isSame(end, 'month')) {
        totalSpends += spend.price * ((end.diff(start, 'days') + 1) / date.daysInMonth());
      } else {
        if (date.isSame(start, 'month')) {
          totalSpends += spend.price * ((date.endOf('month').diff(start, 'days') + 1) / date.daysInMonth());
        }
        if (date.isSame(end, 'month')) {
          totalSpends += spend.price * ((end.diff(date.startOf('month'), 'days') + 1) / date.daysInMonth());
        }
      }
    }
    if (date.isBetween(start, end, 'month', '()')) {
      totalSpends += spend.price;
    }
  });
  return totalSpends;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const sortColumns = (sortOrder: string, sortField: string, tableData: any): any => tableData.sort((a, b) => {
  const aField = ['call_answered', 'call_failed', 'call_missed', 'call_busy'].includes(sortField) ? a[sortField].percents : a[sortField];
  const bField = ['call_answered', 'call_failed', 'call_missed', 'call_busy'].includes(sortField) ? b[sortField].percents : b[sortField];
  if (aField > bField) {
    return sortOrder === 'asc' ? 1 : -1;
  } else if (bField > aField) {
    return sortOrder === 'asc' ? -1 : 1;
  }
  return 0;
});

export const getCompareClass = (value: string | number): string => {
  if (value < 0 || value === 'n/a') return 'red-text';
  if (value > 0) return 'green-text';
  return 'grey-text';
};

export const getCompareColor = (value: string | number, isEngagement = false, isNeutral = false): string => {
  if (value === 'n/a') return '#f3505c';
  if (isNeutral) return '#0168fa';
  if (value < 0) return isEngagement ? '#24ba7b' : '#f3505c';
  if (value > 0) return isEngagement ? '#f3505c' : '#24ba7b';
  return '#929eb9';
};

export const getCompareIcon = (value: string | number): JSX.Element => {
  if (value < 0) return <i className="ri-arrow-down-line" />;
  if (value > 0) return <i className="ri-arrow-up-line" />;
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const getCompareValue = (value: any): string => {
  if (value) {
    return ['n/a', 0].includes(value) ? value : value[0];
  } return '';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const formatCompareValue = (value: any): string => {
  if (['n/a', 0].includes(value)) {
    return value;
  }
  if (value === null) {
    return '...';
  }
  return `${Math.abs(value)}%`;
};

export const formatHeaderPriceValue = (value: number): JSX.Element => {
  const result = value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (
    <>
      <PriceValueSmall>$</PriceValueSmall>
      <span>{result.substr(0, result.indexOf('.'))}</span>
      <PriceValueSmall>{result.substr(result.indexOf('.'))}</PriceValueSmall>
    </>);
};

export const formatPriceValue = (value: number): string => (`$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`);

export const getLastPeriod = (period: string): string => {
  switch (period) {
    case 'TODAY': return 'than yesterday';
    case 'THIS_WEEK': return 'than last week';
    case 'THIS_MONTH': return 'than last month';
    case 'THIS_QUARTER': return 'than last quarter';
    case 'THIS_YEAR': return 'than last year';

    case 'LAST_WEEK': return 'than week before last';
    case 'LAST_MONTH': return 'than month before last';
    case 'LAST_QUARTER': return 'than quarter before last';
    case 'LAST_YEAR': return 'than year before last';

    default: return 'than previous period';
  }
};

export const formatToOneDecimal = (value: number): number | string => (value % 1 === 0 ? value : value.toFixed(1));

export const defaultLeadSourceData = (): LeadSorce[] => new Array(5).fill({
  source: '',
  type: '',
  leads: 0,
  tours: 0,
  leases: 0,
  calls: 0,
  leased_rate: 0,
  tour_completed_rate: 0,
  spend: 0,
  cost_per_lead: 0,
  cost_per_tour: 0,
  cost_per_lease: 0,
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultLeadSourceColumns = (): TableColumn[] => ([
  {
    dataField: 'source',
    text: 'Source',
    formatter: () => (<LineSkeleton />),
  },
  {
    dataField: 'type',
    text: 'Type',
    formatter: () => (<LineSkeleton />),
  },
  {
    dataField: 'leads',
    text: 'Leads',
    formatter: () => (<LineSkeleton />),
  },
  {
    dataField: 'tours',
    text: 'Tours',
    formatter: () => (<LineSkeleton />),
  },
  {
    dataField: 'leases',
    text: 'Leases',
    formatter: () => (<LineSkeleton />),
  },
  {
    dataField: 'calls',
    text: 'Calls',
    formatter: () => (<LineSkeleton />),
  },
  {
    dataField: 'leased_rate',
    text: 'Leased rate (%)',
    headerStyle: () => ({ width: 'calc(80% / 11)' }),
    formatter: () => (<LineSkeleton />),
  },
  {
    dataField: 'tour_completed_rate',
    text: 'Tour completed rate (%)',
    headerStyle: () => ({ width: 'calc(80% / 11)' }),
    formatter: () => (<LineSkeleton />),
    sort: true,
  },
  {
    dataField: 'spend',
    text: 'Spend',
    headerStyle: () => ({ width: 'calc(80% / 11)' }),
    formatter: () => (<LineSkeleton />),
  },
  {
    dataField: 'cost_per_lead',
    text: 'Cost per lead',
    headerStyle: () => ({ width: 'calc(80% / 11)' }),
    formatter: () => (<LineSkeleton />),
  },
  {
    dataField: 'cost_per_tour',
    text: 'Cost per tour',
    headerStyle: () => ({ width: 'calc(80% / 11)' }),
    formatter: () => (<LineSkeleton />),
  },
  {
    dataField: 'cost_per_lease',
    text: 'Cost per lease',
    headerStyle: () => ({ width: 'calc(80% / 11)' }),
    formatter: () => (<LineSkeleton />),
  },
]);

export const exportDataToXls = async (id: string, ...dataForXls: { data: unknown[], sheet: string, callback?: (dataTable: unknown, row: unknown, index: number) => void }[]) => {
  const XLSX = await import('xlsx');
  const wb = { Sheets: {}, SheetNames: [] };

  // eslint-disable-next-line no-restricted-syntax
  for (const { data, sheet, callback = null } of dataForXls) {
    const dataTable = XLSX.utils.json_to_sheet(data);
    if (callback) {
      data.forEach((row, index) => callback(dataTable, row, index));
    }

    const shortSheetName = sheet.substr(0, 31);
    wb.Sheets[shortSheetName] = dataTable;
    wb.SheetNames.push(shortSheetName);
  }

  const xlsBlob = new Blob(
    [XLSX.write(wb, { bookType: 'xls', type: 'array' })],
    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' },
  );

  const link = document.createElement('a');
  link.setAttribute('href', window.URL.createObjectURL(xlsBlob));
  link.setAttribute('download', `${id}.xls`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const exportAgentCallScoringDataToXls = (data: Agent[]): void => {
  const reportData = data.map(row => ({
    'Property Agent': row.agent,
    Properties: row.properties,
    Score: `${row.score}%`,
  }));

  exportDataToXls(
    `agents_call-scoring-data_${moment(new Date()).format('MM-DD-YYYY')}`,
    { data: reportData, sheet: 'AVG. CALL SCORE BY AGENT' },
  );
};

export const exportCallScoringDrilldownToXls = (data: CallScoringDrilldown[]): void => {
  const reportData = data.map(row => ({
    Property: row.property,
    'Avg. Call Score': `${row.average_call_score}%`,
    'Introduction and Lead Information': `${row.introduction}%`,
    'Qualifying Questions': `${row.qualifying}%`,
    'Amenities and Benefits': `${row.amenities}%`,
    Closing: `${row.closing}%`,
    'Overall Impression': `${row.overall}%`,
  }));

  exportDataToXls(
    `call-scoring-overall-drilldown_${moment(new Date()).format('MM-DD-YYYY')}`,
    { data: reportData, sheet: 'Call Scoring (Overall)' },
  );
};

export const exportCallScoringDataToXls = (data: CallScoringData[], scoringQuestions: Questions[], filteringData: DateRange[], type = 'property'): void => {
  let reportData = data.map(row => ({
    Property: row.property,
    Name: row.lead_name,
    'Call Source': row.source,
    'Phone Number': row.prospect_phone_number,
    'Property Agent': row.agent_name,
    'Call Duration': moment.utc(row.duration * 1000).format('m:ss'),
    Date: moment(row.date).local().format('lll'),
    Score: `${row.score}%`,
  }));
  if (type === 'property') {
    reportData = reportData.map((item) => {
      const e = { ...item };
      delete e.Property;
      return e;
    });
  } else {
    reportData = reportData.map((item) => {
      const e = { ...item };
      delete e['Call Status'];
      return e;
    });
  }
  scoringQuestions.forEach((item, index) => {
    reportData = reportData.map((row, reportIndex) => ({
      ...row,
      // eslint-disable-next-line no-nested-ternary
      [`Q${index + 1} - ${item.question.replace(/#/g, '')}`]: (data[reportIndex].yes_questions || []).includes(item.id) ? 'Yes' : ((data[reportIndex].omitted_questions || []).includes(item.id) ? 'Omitted' : 'No'),
      [`Q${index + 1} - Weight`]: item.weight,
    }));
  });
  let filteredData = filteringData.map(row => ({
    Property: row.property,
    'Start Date': moment(row.startDate).local().format('lll'),
    'End Date': moment(row.endDate).local().format('lll'),
    'Report Creation Date': moment(new Date()).local().format('lll'),
  }));
  if (type !== 'property') {
    filteredData = filteredData.map((item) => {
      const e = { ...item };
      delete e.Property;
      return e;
    });
  }

  const callbackMapReportData = (dataTable, row, index) => {
    if (row.lead_name) {
      // eslint-disable-next-line no-param-reassign
      dataTable[`A${index + 2}`].l = { Target: `${window.location.origin}/${getPropertyId()}/leads/${row.lead_id}` };
    }
  };

  exportDataToXls(
    `call-scoring-data_${moment(new Date()).format('MM-DD-YYYY')}_${getPropertyId()}`,
    { data: reportData, sheet: 'Data', callback: callbackMapReportData },
    { data: filteredData, sheet: 'Filtering criteria' },
  );
};

export const exportChatsEvaluationData = (report: ChatReportStats): void => {
  const reportData = [{
    'Total Conversations': report.conversations.total,
    'Avg conversation score': report.conversations.avg,
    'Total Responses': report.responses.total,
  }];

  CHAT_MESSAGE_STATUSES.forEach(({ status, label }) => {
    reportData[0][label] = report.responses[status].count;
  });

  exportDataToXls(
    `chats_monthly_session_${moment(new Date()).format('MM-DD-YYYY')}_${getPropertyId()}`,
    {
      data: reportData,
      sheet: moment(report.session_date).format('[Data for] MMMM YYYY [Session]'),
    },
  );
};

export const convertTime = (responseMinutes: number): JSX.Element => {
  const hours = Math.floor(responseMinutes / 60);
  const minutes = Math.floor(responseMinutes % 60);
  return (
    <ReportValue>
      {hours > 0 && <>{hours}<small>{hours === 1 ? 'hr' : 'hrs'}{' '}</small></>}
      {minutes}<small>{minutes === 1 ? 'min' : 'mins'}</small>
    </ReportValue>);
};

export const formatNumberWithCommas = (x: number): string => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
