import React, { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import { MediaWrapper, MediaBody, PropertyName } from 'site/components/common';
import { PropertyProps, TableColumn } from 'src/interfaces';

const CellSkeleton: FC<{ width: number }> = ({ width }) =>
  (<Skeleton width={width} height="12px" style={{ borderRadius: '6px' }} />);

export const defaultTableData = ():PropertyProps[] => new Array(10).fill({
  name: '',
  customer_name: '',
  client: '',
  created: '',
  page: 1,
  status: '',
  active_users: '',
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultTableColumns = ():TableColumn[] => ([
  {
    dataField: 'name',
    text: 'Property Name',
    sort: true,
    formatter: () => (
      <MediaWrapper style={{ marginTop: '-3px' }}>
        <Skeleton height={38} width={38} style={{ borderRadius: '5px' }} />
        <MediaBody>
          <PropertyName>
            <Skeleton height={14} width={200} style={{ borderRadius: '6px' }} />
          </PropertyName>
          <Skeleton height={14} width={200} style={{ borderRadius: '6px' }} />
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
    dataField: 'client',
    text: 'Client',
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
    dataField: 'active_users',
    text: 'Users',
    sort: true,
    formatter: () => (<div className="text-right"><CellSkeleton width={60} /></div>),
  },
  {
    dataField: 'id',
    text: '',
    formatter: () => (<div className="text-right"><CellSkeleton width={50} /></div>),
  },
]);
