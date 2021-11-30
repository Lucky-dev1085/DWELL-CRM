import React, { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import { UserProps, TableColumn } from 'src/interfaces';

const CellSkeleton: FC<{ width: number }> = ({ width }) =>
  (<Skeleton width={width} height="12px" style={{ borderRadius: '6px' }} />);

export const defaultTableData = ():UserProps[] => new Array(10).fill({
  nameLogo: '',
  fullName: '',
  email: '',
  properties: '',
  login_count: '',
  last_login: '',
  created: '',
  role: '',
  status: '',
  page: 1,
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultTableColumns = ():TableColumn[] => ([
  {
    dataField: 'nameLogo',
    text: '',
    formatter: () => (<div style={{ marginTop: '-3px' }}><Skeleton circle height={38} width={38} /></div>),
  },
  {
    dataField: 'fullName',
    text: 'Name of User',
    sort: true,
    formatter: () => (<CellSkeleton width={140} />),
  },
  {
    dataField: 'email',
    text: 'Email',
    sort: true,
    formatter: () => (<CellSkeleton width={140} />),
  },
  {
    dataField: 'properties',
    text: 'Properties',
    sort: true,
    formatter: () => (<CellSkeleton width={240} />),
  },
  {
    dataField: 'login_count',
    text: 'Login Count',
    sort: true,
    formatter: () => (<div className="text-right"><CellSkeleton width={80} /></div>),
  },
  {
    dataField: 'last_login',
    text: 'Last login',
    sort: true,
    formatter: () => (<CellSkeleton width={140} />),
  },
  {
    dataField: 'created',
    text: 'Signup date',
    sort: true,
    formatter: () => (<CellSkeleton width={140} />),
  },
  {
    dataField: 'role',
    text: 'Role',
    sort: true,
    formatter: () => (<CellSkeleton width={140} />),
  },
  {
    dataField: 'status',
    text: 'Status',
    sort: true,
    formatter: () => (<CellSkeleton width={60} />),
  },
  {
    dataField: 'id',
    text: '',
    formatter: () => (<div className="text-right"><CellSkeleton width={80} /></div>),
  },
]);
