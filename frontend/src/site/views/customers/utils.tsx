import React, { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import styled from 'styled-components';
import { TableWrapper } from 'site/components/common';
import { CustomerProps, TableColumn } from 'src/interfaces';

const CellSkeleton: FC<{ width: number }> = ({ width }) =>
  (<Skeleton width={width} height="12px" style={{ borderRadius: '6px' }} />);

export const defaultTableData = ():CustomerProps[] => new Array(10).fill({
  logo: '',
  customer_name: '',
  active_properties: '',
  employees_count: '',
  userFullName: '',
  user: {
    email: '',
    phone_number: '',
    status: '',
  },
  created: '',
  page: 1,
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultTableColumns = ():TableColumn[] => ([
  {
    dataField: 'logo',
    text: 'Logo',
    formatter: () => (<div style={{ marginTop: '-3px' }}><Skeleton height={38} width={38} style={{ borderRadius: '5px' }} /></div>),
  },
  {
    dataField: 'customer_name',
    text: 'Customer name',
    sort: true,
    formatter: () => (<CellSkeleton width={120} />),
  },
  {
    dataField: 'active_properties',
    text: 'Properties',
    sort: true,
    formatter: () => (<div className="text-right"><CellSkeleton width={60} /></div>),
  },
  {
    dataField: 'employees_count',
    text: 'Employees',
    sort: true,
    formatter: () => (<div className="text-right"><CellSkeleton width={60} /></div>),
  },
  {
    dataField: 'userFullName',
    text: 'Name of User',
    sort: true,
    formatter: () => (<CellSkeleton width={120} />),
  },
  {
    dataField: 'user.email',
    text: 'Email',
    sort: true,
    formatter: () => (<CellSkeleton width={120} />),
  },
  {
    dataField: 'user.phone_number',
    text: 'Phone',
    sort: true,
    formatter: () => (<CellSkeleton width={120} />),
  },
  {
    dataField: 'created',
    text: 'Created',
    sort: true,
    formatter: () => (<CellSkeleton width={90} />),
  },
  {
    dataField: 'user.status',
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

export const TableCustomer = styled(TableWrapper)`
  table {
    width: auto;
    min-width: 100%;

    img {
      object-fit: cover;
    }
  }
  thead th {
    &:nth-child(3), &:nth-child(4)  { text-align: right; }
  }
`;
