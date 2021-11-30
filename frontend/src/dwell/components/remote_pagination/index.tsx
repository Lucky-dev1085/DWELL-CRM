import React, { FC } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory, { PaginationProvider, PaginationListStandalone, SizePerPageDropdownStandalone } from 'react-bootstrap-table2-paginator';
import { isEmpty } from 'codemirror/src/util/misc';
import ScrollContainer from 'react-indiana-drag-scroll';
import styled from 'styled-components';

const sizePerPageOptionRenderer = ({ text, page, onSizePerPageChange }) => (
  <li
    key={text}
    role="presentation"
    className="dropdown-item"
    onMouseDown={(e) => {
      e.preventDefault();
      onSizePerPageChange(page);
    }}
    style={{ cursor: 'default' }}
  >
    { text }
  </li>
);

export const TableNavBar = styled.div`
    padding-left: 20px;
    padding: 10px;
    display: flex;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(193,200,222,0.2);
    align-items: center !important;
`;

export const SizePerPage = styled.div`
    margin-right: auto;
    display: flex;
    align-items: center;
    color: #929eb9;
`;

interface DataInstance {
  [key: string]: number | string,
}

interface RemotePaginationProps {
  data: DataInstance[]
  page: number,
  sizePerPage: number,
  keyField?: string,
  onTableChange: (type: string, tableData: { data: DataInstance[], page: number, sizePerPage: number, sortField: string, sortOrder: string }) => void,
  totalSize: number,
  columns: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment
    [key: string]: any,
  }[],
  selectRow?: {
    mode: string,
    selected: number[],
    hideSelectColumn: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment
    [key: string]: any,
  },
  rowEvents?: {
    [key: string]: (e?: Element, row?: { [key: string]: number | string }) => void,
  },
  indication: () => void,
  rowClasses?: (row: {[key: string]: number | string}) => void,
  isDragScroll?: boolean,
  wrapperClasses: string,
  expandRow?: {[key: string]: string | ((row: {[key: string]: number | string}) => void) | number[] | boolean},
  hideSizePerPage?: boolean,
}

const RemotePagination: FC<RemotePaginationProps> = ({ data, page, sizePerPage, keyField = 'id',
  onTableChange, totalSize, columns, selectRow, rowEvents, indication, rowClasses, expandRow, isDragScroll, wrapperClasses, hideSizePerPage }) => {
  const optionalProps = { selectRow: {
    mode: 'checkbox',
    selected: [],
    hideSelectColumn: true,
  } };
  if (!isEmpty(selectRow)) {
    optionalProps.selectRow = selectRow;
  }
  return (
    <PaginationProvider
      pagination={
        paginationFactory({
          custom: true,
          page,
          sizePerPage,
          totalSize,
          firstPageText: '<<',
          prePageText: '<',
          nextPageText: '>',
          lastPageText: '>>',
          paginationSize: 4,
          sizePerPageList: [
            { text: 10, value: 10 },
            { text: 20, value: 20 },
            { text: 30, value: 30 },
            { text: 50, value: 50 },
            { text: 100, value: 100 },
          ],
          hideSizePerPage,
          hidePageListOnlyOnePage: true,
          sizePerPageOptionRenderer,
        })
      }
    >
      {
        ({
          paginationProps,
          paginationTableProps,
        }) => (
          <React.Fragment>
            {isDragScroll ?
              <ScrollContainer vertical={false} hideScrollbars={false} className="scroll-container">
                <BootstrapTable
                  remote
                  wrapperClasses={wrapperClasses}
                  keyField={keyField}
                  data={data}
                  columns={columns}
                  onTableChange={onTableChange}
                  rowEvents={rowEvents}
                  noDataIndication={indication}
                  bordered={false}
                  rowClasses={rowClasses}
                  expandRow={expandRow}
                  {...paginationTableProps}
                  {...optionalProps}
                />
              </ScrollContainer> :
              <BootstrapTable
                wrapperClasses={`${wrapperClasses} table-responsive`}
                remote
                keyField={keyField}
                data={data}
                columns={columns}
                onTableChange={onTableChange}
                rowEvents={rowEvents}
                noDataIndication={indication}
                bordered={false}
                rowClasses={rowClasses}
                expandRow={expandRow}
                {...paginationTableProps}
                {...optionalProps}
              />
            }
            {
              paginationProps.totalSize > paginationProps.sizePerPage &&
              <TableNavBar>
                {hideSizePerPage
                  ? <SizePerPage />
                  : (
                    <SizePerPage> Show&nbsp;
                      <SizePerPageDropdownStandalone
                        {...paginationProps}
                        variation="dropup"
                      />&nbsp;items
                    </SizePerPage>
                  )
                }
                {
                  paginationProps?.totalSize &&
                  <PaginationListStandalone
                    {...paginationProps}
                  >
                  </PaginationListStandalone>
                }
              </TableNavBar>
            }
          </React.Fragment>
        )
      }
    </PaginationProvider>);
};

export default RemotePagination;
