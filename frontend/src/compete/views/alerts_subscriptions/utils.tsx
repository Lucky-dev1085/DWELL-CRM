import React, { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import moment from 'moment';
import { TableColumn, Alert } from 'src/interfaces';
import { AlertStatus } from 'compete/views/styles';
import { stringToCapitalize } from 'compete/constants';

const CellSkeleton: FC<{ width: number }> = ({ width }) =>
  (<Skeleton width={width} height={9} style={{ borderRadius: '6px' }} />);

export const defaultAlertData = (): Alert[] => new Array(3).fill({
  name: '',
  tracked_assets: '',
  geo: '',
  type: '',
  last_sent: '',
  status: '',
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultAlertColumns = [
  {
    dataField: 'name',
    text: 'Name',
    sort: true,
    formatter: () => <CellSkeleton width={80} />,
  },
  {
    dataField: 'type',
    text: 'Type',
    sort: true,
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'tracked_assets',
    text: 'Tracked Properties',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={30} /></div>,
  },
  {
    dataField: 'geo',
    text: 'Geo',
    sort: true,
    formatter: () => <CellSkeleton width={150} />,
  },
  {
    dataField: 'last_sent',
    text: 'Last Sent',
    sort: true,
    formatter: () => <CellSkeleton width={100} />,
  },
  {
    dataField: 'status',
    text: 'Status',
    sort: true,
    formatter: () => <CellSkeleton width={50} />,
  },
] as TableColumn[];

export const alertSubscriptionColumns = [
  {
    dataField: 'name',
    text: 'Name',
    sort: true,
  },
  {
    dataField: 'type',
    text: 'Type',
    sort: true,
    formatter: value => stringToCapitalize(value),
  },
  {
    dataField: 'tracked_assets',
    text: 'Tracked Properties',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{value || '-'}</div>,
  },
  {
    dataField: 'geo',
    text: 'Geo',
    sort: true,
    formatter: value => value.join(', '),
  },
  {
    dataField: 'last_sent',
    text: 'Last Sent',
    sort: true,
    formatter: value => (value ? moment(value).format('lll') : '-'),
  },
  {
    dataField: 'status',
    text: 'Status',
    sort: true,
    formatter: value => <AlertStatus active={value === 'ACTIVE'}>{value.toLowerCase()}</AlertStatus>,
  },
] as TableColumn[];
