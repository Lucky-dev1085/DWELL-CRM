import React, { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import moment from 'moment';
import { TableColumn, AlertInfo } from 'src/interfaces';

const CellSkeleton: FC<{ width: number }> = ({ width }) =>
  (<Skeleton width={width} height={9} style={{ borderRadius: '6px' }} />);

export const defaultAlertData = (): AlertInfo[] => new Array(3).fill({
  sent_on: '',
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultAlertColumns = [
  {
    dataField: 'id',
    text: 'ID',
    sort: true,
    formatter: () => <CellSkeleton width={100} />,
  },
  {
    dataField: 'sent_on',
    text: 'Sent On',
    sort: true,
    formatter: () => <CellSkeleton width={150} />,
  },
] as TableColumn[];

export const alertSummaryColumns = [
  {
    dataField: 'id',
    text: 'ID',
    sort: true,
    formatter: value => (value !== null ? `#${value}` : '-'),
  },
  {
    dataField: 'sent_on',
    text: 'Sent On',
    sort: true,
    formatter: value => (value !== null ? moment(value).format('lll') : '-'),
  },
] as TableColumn[];
