import React, { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import { MediaWrapper, MediaBody, TableWrapper } from 'site/components/common';
import styled from 'styled-components';
import { ClientProps, TableColumn } from 'src/interfaces';

const CellSkeleton: FC<{ width: number }> = ({ width }) =>
  (<Skeleton width={width} height="12px" style={{ borderRadius: '6px' }} />);

export const defaultTableData = ():ClientProps[] => new Array(10).fill({
  name: '',
  customer_name: '',
  creator: '',
  created: '',
  status: '',
  properties_count: '',
  page: 1,
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultTableColumns = ():TableColumn[] => ([
  {
    dataField: 'name',
    text: 'Client Name',
    sort: true,
    formatter: () => (
      <MediaWrapper style={{ marginTop: '-3px' }}>
        <Skeleton height={38} width={38} style={{ borderRadius: '5px' }} />
        <MediaBody>
          <Skeleton height={14} width={200} style={{ borderRadius: '6px', marginBottom: '12px' }} />
        </MediaBody>
      </MediaWrapper>
    ),
  },
  {
    dataField: 'customer_name',
    text: 'Customer',
    sort: true,
    formatter: () => (<CellSkeleton width={140} />),
  },
  {
    dataField: 'creator',
    text: 'Creator',
    sort: true,
    formatter: () => (<CellSkeleton width={140} />),
  },
  {
    dataField: 'created',
    text: 'Date Created',
    sort: true,
    formatter: () => (<div className="text-right"><CellSkeleton width={100} /></div>),
  },
  {
    dataField: 'status',
    text: 'Status',
    sort: true,
    formatter: () => (<div className="text-right"><CellSkeleton width={60} /></div>),
  },
  {
    dataField: 'properties_count',
    text: 'Properties',
    sort: true,
    formatter: () => (<div className="text-right"><CellSkeleton width={60} /></div>),
  },
  {
    dataField: 'id',
    text: '',
    formatter: () => (<div className="text-right"><CellSkeleton width={50} /></div>),
  },
]);

export const TableClient = styled(TableWrapper)`
  thead th {
    &:first-child { padding-left: 74px; width: 35%; }
    &:nth-child(2) { width: 23%; }
    &:nth-child(3) { width: 15%; }
    &:nth-child(4) { width: 8%; text-align: right; }
    &:nth-child(5) { width: 6%; text-align: right; }
    &:last-child { width: 13%; }

    &:hover {  outline: none; }
  }
`;
