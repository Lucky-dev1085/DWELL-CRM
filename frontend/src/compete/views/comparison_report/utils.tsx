import React, { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import { get } from 'lodash';
import { TableColumn, CallBackId, HighestRent, HighestOccupancy, SubjectAsset, ChartData, HistoricalChart } from 'src/interfaces';
import { LinkText } from 'compete/views/styles';
import { currencyFormat, compareValue, percentFormat, currencyRoundedFormat } from 'compete/constants';
import { Info } from './styles';

interface ComparedData {
  id?: number,
  asset: string,
  start_date?: string,
  date?: string,
  value?: number,
  end_date?: string,
  type: string,
}

const CellSkeleton: FC<{ width: number }> = ({ width }) =>
  (<Skeleton width={width} height={9} style={{ borderRadius: '6px' }} />);

export const defaultRentData = (): HighestRent[] => new Array(3).fill({
  name: '',
  rank: '',
  average_rent: '',
  average_rent_per_sqft: '',
  units_count: '',
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultRentColumns = ([
  {
    dataField: 'name',
    text: 'Asset',
    sort: true,
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'rank',
    text: 'Rank',
    sort: true,
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'average_rent',
    text: 'Avg Rent',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
    headerClasses: 'text-right',
  },
  {
    dataField: 'average_rent_per_sqft',
    text: 'Avg Rent/SqFt',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
    headerClasses: 'text-right',
  },
  {
    dataField: 'units_count',
    text: 'Number of Units',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
    headerClasses: 'text-right',
  },
] as TableColumn[]);

export const averageRentsColumns = (handleClick: CallBackId): TableColumn[] => ([
  {
    dataField: 'name',
    text: 'Asset',
    sort: true,
    formatter: (value, row) => <LinkText onClick={() => handleClick(row.id)}>{value !== null ? value : '-'}</LinkText>,
  },
  {
    dataField: 'rank',
    text: 'Rank',
    sort: true,
    formatter: value => (value !== null ? `#${value}` : '-'),
  },
  {
    dataField: 'average_rent',
    text: 'Avg Rent',
    sort: true,
    formatter: value => <div className="text-right">${currencyRoundedFormat(value)}</div>,
    headerClasses: 'text-right',
  },
  {
    dataField: 'average_rent_per_sqft',
    text: 'Avg Rent/SqFt',
    sort: true,
    formatter: value => <div className="text-right">${currencyFormat(value)}</div>,
    headerClasses: 'text-right',
  },
  {
    dataField: 'units_count',
    text: 'Number of Units',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? value : '-'}</div>,
    headerClasses: 'text-right',
  },
] as TableColumn[]);

export const defaultOccupancyData = (): HighestOccupancy[] => new Array(3).fill({
  name: '',
  rank: '',
  occupancy_rate: '',
  units_count: '',
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultOccupancyColumns = ([
  {
    dataField: 'name',
    text: 'Asset',
    sort: true,
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'rank',
    text: 'Rank',
    sort: true,
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'occupancy_rate',
    text: 'LTN Occupancy Rate',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
    headerClasses: 'text-right',
  },
  {
    dataField: 'units_count',
    text: 'Number of Units',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
    headerClasses: 'text-right',
  },
] as TableColumn[]);

export const highestOccupancyRates = (handleClick: CallBackId): TableColumn[] => ([
  {
    dataField: 'name',
    text: 'Asset',
    sort: true,
    formatter: (value, row) => <LinkText onClick={() => handleClick(row.id)}>{value !== null ? value : '-'}</LinkText>,
  },
  {
    dataField: 'rank',
    text: 'Rank',
    sort: true,
    formatter: value => (value !== null ? `#${value}` : '-'),
  },
  {
    dataField: 'occupancy',
    text: 'LTN Occupancy Rate',
    sort: true,
    formatter: value => <div className="text-right">{value ? `${percentFormat(value)}%` : '-'}</div>,
    headerClasses: 'text-right',
  },
  {
    dataField: 'units_count',
    text: 'Number of Units',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? value : '-'}</div>,
    headerClasses: 'text-right',
  },
] as TableColumn[]);

export const calculateCompareData = (subjectAsset: SubjectAsset, comparedAgainst: SubjectAsset, dataset1: ChartData[], dataset2: ChartData[], isPercent = false): ComparedData[] => ([
  {
    id: 1,
    asset: subjectAsset.value.name,
    ...dataset1.map(el => currencyFormat(el.value)),
    type: isPercent ? 'percent' : 'currency',
  },
  {
    id: 2,
    asset: comparedAgainst.value.name,
    ...dataset2.map(el => currencyFormat(el.value)),
    type: isPercent ? 'percent' : 'currency',
  },
  {
    id: 3,
    asset: 'Actual Difference',
    ...dataset1.map((el, i) => currencyFormat(el.value - get(dataset2, `[${i}].value`, 0))),
    type: isPercent ? 'percentDiff' : 'currencyDiff',
  },
  {
    id: 4,
    asset: '% Difference',
    ...dataset1.map((el, i) => (get(dataset2, `[${i}].value`) ? compareValue(el.value, get(dataset2, `[${i}].value`)) : 0)),
    type: 'percentDiff',
  },
]);

export const renderBreakdownDiff = (assetData: HistoricalChart, comparedData: HistoricalChart, key: string, isPercent = false, isOccupancy = false): JSX.Element => {
  const diff = assetData[key] - comparedData[key];
  const diffPercent = comparedData[key] ? compareValue(assetData[key], comparedData[key]) : 0;
  const infoType = assetData[key] > comparedData[key] ? 'success' : 'danger';
  const info = isPercent ? `${diff > 0 ? '+' : ''}${percentFormat(diff)}% (${diffPercent}%)` : `${(diff || '') && (diff > 0 ? '+' : '-')}${!isOccupancy ? '$' : ''}${currencyFormat(Math.abs(diff))} (${diffPercent}%)`;

  return (
    <Info succes={infoType === 'success'}>
      {info}
      <i className={infoType === 'success' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} />
    </Info>
  );
};
