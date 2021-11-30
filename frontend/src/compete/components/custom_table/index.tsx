import React, { FC } from 'react';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ScrollContainer from 'react-indiana-drag-scroll';
import { TableColumn } from 'src/interfaces';

interface CustomTableProps {
  indication?: () => JSX.Element,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment
  tableData: any,
  tableColumns: TableColumn[],
  hideScrollbars?: boolean,
  size?: number,
  selectRow?: {
    classes: string,
    selected: number[],
    hideSelectColumn: boolean,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment
  onClickRow?: (row: any) => void,
}

const indicationEmpty = () => (
  <div>
    <h4>No results found</h4>
    <p>Try adjusting your search or filter to find what you&#39;re looking for.</p>
  </div>
);

const CustomTable: FC<CustomTableProps> = ({ indication = indicationEmpty, tableData, tableColumns, hideScrollbars = false, size = 20, selectRow, onClickRow }) => (
  <ToolkitProvider
    keyField="id"
    data={tableData}
    columns={tableColumns}
  >
    {
      ({ baseProps }) => (
        <ScrollContainer vertical={false} hideScrollbars={hideScrollbars} className="scroll-container">
          <BootstrapTable
            bordered={false}
            noDataIndication={indication}
            selectRow={selectRow}
            rowEvents={{ onClick: (e, row) => onClickRow && onClickRow(row) }}
            pagination={paginationFactory({
              sizePerPageList: [
                {
                  text: '3', value: size,
                },
              ],
            })}
            {...baseProps}
          />
        </ScrollContainer>
      )
    }
  </ToolkitProvider>
);

export default CustomTable;
