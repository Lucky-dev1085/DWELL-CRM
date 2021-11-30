import React from 'react';
import moment from 'moment';
import { TableColumn } from 'src/interfaces';
import { currencyFormat, percentFormat } from 'compete/constants';

interface Dataset {
  end_date?: string,
  start_date?: string,
}

export const chartTableViewColumns = (label: string, valueField = 'value', isMonthlyFormat: boolean, isCurrency = true): TableColumn[] => ([
  {
    dataField: 'start_date',
    text: 'Time Period',
    formatter: (value, row) => (isMonthlyFormat ? moment(value).format('MMM YYYY') : `${moment(value).format('ll')} - ${moment(row.end_date).format('ll')}`),
  },
  {
    dataField: valueField,
    text: label,
    formatter: (value) => {
      const isNull = value === null;
      return (
        <div className="text-right">{isNull ? '-' : ''}{!isNull && (isCurrency ? `${value > 0 ? '' : '-'}$${currencyFormat(Math.abs(value))}` : `${label === 'Occupancy' ? percentFormat(value) : currencyFormat(value)}%`)}</div>
      );
    },
    headerFormatter: () => <div className="text-right">{label}</div>,
  },
] as TableColumn[]);

const compareCellFormatter = (value, type, isOccupancy) => {
  const prepareValue = value && value.replace(',', '');

  switch (type) {
    case 'currency':
      return (<div className="text-right">${value}</div>);
    case 'percent':
      return (<div className="text-right">{isOccupancy ? percentFormat(value) : value}%</div>);
    case 'currencyDiff':
      return (<div className={`text-right ${Number(prepareValue) && (prepareValue > 0 ? 'text-success' : 'text-danger')}`}>{!!Number(prepareValue) && (prepareValue > 0 ? '+' : '-')}${currencyFormat(Math.abs(prepareValue))}</div>);
    case 'percentDiff':
      return (<div className={`text-right ${Number(value) && (value > 0 ? 'text-success' : 'text-danger')}`}>{!!Number(value) && (value > 0 ? '+' : '')}{isOccupancy ? percentFormat(value) : value}%</div>);
    default:
      return '';
  }
};

export const chartCompareTableViewColumns = (dataset: Dataset[], isMonthlyFormat: boolean, isOccupancy = false): TableColumn[] => {
  const columns = dataset.map((item, index) => ({
    dataField: index.toString(),
    text: '',
    formatter: (value, row) => compareCellFormatter(value, row.type, isOccupancy),
    headerFormatter: () => <div className="text-right">{isMonthlyFormat ? moment(item.start_date).format('MMM YYYY') : `${moment(item.start_date).format('ll')} - ${moment(item.end_date).format('ll')}`}</div>,
  }));

  return ([
    {
      dataField: 'asset',
      text: 'Asset',
      formatter: value => <div className="text-nowrap">{value}</div>,
    },
    ...columns,
  ] as TableColumn[]);
};
