import React, { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import ColumnsSettingsDropDown from 'dwell/views/pipeline/_columnDropDown';
import { TableColumn, LeadData } from 'src/interfaces';

const CellSkeleton: FC<{ width: number }> = ({ width }) =>
  (<Skeleton width={width} height="12px" style={{ borderRadius: '6px' }} />);

export const defaultTableData = (): LeadData[] => new Array(10).fill({
  name: '',
  stage: '',
  owner: '',
  move_in_date: '',
  next_task: '',
  next_task_date: '',
  source: '',
  created: '',
  page: 1,
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultTableColumns = (): TableColumn[] => ([
  {
    dataField: '',
    text: '',
    formatter: () => (<Skeleton circle height={38} width={38} />),
  }, {
    dataField: 'name',
    text: 'Name',
    sort: true,
    classes: 'lead-name',
    formatter: () => (<CellSkeleton width={140} />),
  }, {
    dataField: 'stage',
    text: 'Stage',
    sort: true,
    formatter: () => (<CellSkeleton width={140} />),
  }, {
    dataField: 'owner',
    text: 'Owner',
    sort: true,
    formatter: () => (<CellSkeleton width={175} />),
  }, {
    dataField: 'acquisition_date',
    text: 'Acquisition date ',
    sort: true,
    formatter: () => (<CellSkeleton width={160} />),
  }, {
    dataField: 'move_in_date',
    text: 'Move-in date',
    sort: true,
    formatter: () => (<CellSkeleton width={115} />),
  }, {
    dataField: 'days_to_move_in',
    text: 'Days to move-in',
    sort: true,
    formatter: () => (<CellSkeleton width={130} />),
  }, {
    dataField: 'next_task',
    text: 'Next task',
    sort: true,
    formatter: () => (<CellSkeleton width={130} />),
  }, {
    dataField: 'next_task_date',
    text: 'Task due',
    sort: true,
    formatter: () => (<CellSkeleton width={160} />),
  }, {
    dataField: 'source',
    text: 'Source',
    sort: true,
    formatter: () => (<CellSkeleton width={100} />),
  }, {
    dataField: 'floor_plan',
    text: 'Floor plan',
    sort: true,
    formatter: () => (<CellSkeleton width={115} />),
  }, {
    dataField: 'last_activity_date',
    text: 'Last activity date',
    sort: true,
    formatter: () => (<CellSkeleton width={160} />),
  }, {
    dataField: 'last_followup_date',
    text: 'Last followup date',
    sort: true,
    formatter: () => (<CellSkeleton width={160} />),
  }, {
    dataField: 'created',
    text: 'Create date ',
    sort: true,
    formatter: () => (<CellSkeleton width={160} />),
  }, {
    dataField: 'id',
    text: '',
    headerFormatter: () => <ColumnsSettingsDropDown />,
    formatter: () => (<CellSkeleton width={40} />),
  },
]);
