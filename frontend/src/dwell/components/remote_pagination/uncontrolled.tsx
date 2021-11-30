import React, { FC, useState, useEffect } from 'react';
import { cloneDeep } from 'lodash';
import { useDispatch } from 'react-redux';

import { ActionType, paginationData } from 'src/interfaces';
import { sortColumns } from 'dwell/views/Reports/ReportBlocks/_utils';
import Loader from 'dwell/components/Loader';

import RemotePagination from './index';

const NoDataInvocationComponent = () => (
  <div className="empty-table">
    <h4>No results found</h4>
    <div>Try adjusting your search or filter to find what you&#39;re looking for.</div>
  </div>
);

interface DataInstance {
  [key: string]: number | string,
}

interface UncontrolledRemotePaginationProps {
  data: DataInstance[],
  columns: {
    [key: string]: unknown,
  }[],
  setData: (newData: DataInstance[]) => void,
  remoteAction: (data: paginationData) => ActionType,
  totalSize: number,
  page?: number,
  sizePerPage?: number,
  keyField?: string,
  selectRow?: {
    mode: string,
    selected: number[],
    hideSelectColumn: boolean,
    [key: string]: unknown,
  },
  rowEvents?: {
    [key: string]: (e?: Element, row?: { [key: string]: number | string }) => void,
  },
  indication?: () => void, // component for no data
  rowClasses?: (row: {[key: string]: number | string}) => void,
  isDragScroll?: boolean,
  wrapperClasses?: string,
  expandRow?: {[key: string]: string | ((row: {[key: string]: number | string}) => void) | number[] | boolean},
  hideSizePerPage?: boolean,
  isLoaded?: boolean,
}

const UncontrolledRemotePagination: FC<UncontrolledRemotePaginationProps> = ({
  data, setData, remoteAction, columns, totalSize,
  page: initialPage = 1, sizePerPage: initialSizePerPage = 10, keyField = 'id',
  selectRow, rowEvents, indication = NoDataInvocationComponent,
  rowClasses, isDragScroll, wrapperClasses = '', expandRow,
  hideSizePerPage, isLoaded = true,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(remoteAction({ offset: initialSizePerPage * (initialPage - 1), limit: initialSizePerPage, page: initialPage }));
  }, []);

  const [page, setPage] = useState(initialPage);
  const [sizePerPage, setSizePerPage] = useState(initialSizePerPage);

  const onTableChange = (changeType, { page: _page, sizePerPage: _sizePerPage, sortField, sortOrder, data: _data }) => {
    if (changeType === 'sort') {
      setData(sortColumns(sortOrder, sortField, cloneDeep(_data)));
    }

    if (changeType === 'pagination') {
      dispatch(remoteAction({ offset: _sizePerPage * (_page - 1), limit: _sizePerPage, page: _page }))
        .then(() => {
          setPage(_page);
          setSizePerPage(_sizePerPage);
        });
    }
  };

  return (
    <>
      {
        isLoaded ?
          <RemotePagination
            data={data}
            columns={columns}
            onTableChange={onTableChange}
            totalSize={totalSize}
            page={page}
            sizePerPage={sizePerPage}
            keyField={keyField}
            selectRow={selectRow}
            rowEvents={rowEvents}
            indication={indication}
            rowClasses={rowClasses}
            isDragScroll={isDragScroll}
            wrapperClasses={wrapperClasses}
            expandRow={expandRow}
            hideSizePerPage={hideSizePerPage}
          /> : <Loader />
      }
    </>
  );
};
export default UncontrolledRemotePagination;
