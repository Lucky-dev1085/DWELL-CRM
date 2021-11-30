import React, { FC, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory, { PaginationProvider, PaginationListStandalone, SizePerPageDropdownStandalone } from 'react-bootstrap-table2-paginator';
import ScrollContainer from 'react-indiana-drag-scroll';
import { TableNavBar, SizePerPage } from './styles';

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

const indicationDefault = () => (
  <div>
    <h4>No results found</h4>
    <p>Try adjusting your search or filter to find what you&#39;re looking for.</p>
  </div>
);

interface DataInstance {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment
  [key: string]: any,
}

interface RemotePaginationTableProps {
  data: DataInstance[],
  filters?: string,
  keyField?: string,
  totalSize: number,
  columns: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment
    [key: string]: any,
  }[],
  rowEvents?: {
    [key: string]: (e?: Element, row?: { [key: string]: number | string }) => void,
  },
  indication?: () => void,
  rowClasses?: (row: {[key: string]: number | string}) => void,
  wrapperClasses?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getData: any,
  id?: string,
  hideSizePerPage?: boolean,
  hideScrollbars?: boolean,
  isListRequest?: boolean,
  isReloadTable?: boolean,
  filterField?: string,
  scrollClass?: string,
  selectRow?: {
    classes: string,
    selected: number[],
    hideSelectColumn: boolean,
  },
}

const RemotePaginationTable: FC<RemotePaginationTableProps> = ({ data, keyField = 'id', hideScrollbars = false, isListRequest, isReloadTable, scrollClass = '',
  totalSize, columns, rowEvents, indication = indicationDefault, rowClasses, wrapperClasses, filters, getData, hideSizePerPage, id, filterField, selectRow }) => {
  const [page, setPage] = useState(1);
  const [sizePerPage, setSizePerPage] = useState(20);
  const [sortOrder, setSortOrder] = useState(null);
  const [sortField, setSortField] = useState(null);

  const dispatch = useDispatch();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment
  const fetchData = (currentPage, currentSizePerPage, order = sortOrder, field = sortField) => {
    const commonParams = {
      offset: currentSizePerPage * (currentPage - 1),
      limit: currentSizePerPage,
      page: currentPage,
      field,
      order,
    };

    if (id) {
      dispatch(getData(id, {
        ...commonParams,
        [filterField]: filters,
      }));
    } else if (isListRequest) {
      dispatch(getData(commonParams));
    }
  };

  useEffect(() => {
    if (isReloadTable) {
      fetchData(page, sizePerPage);
    } else {
      setPage(1);
      fetchData(1, sizePerPage);
    }
  }, [filters, isReloadTable]);

  const handleTableChange = (type, { page: currentPage, sizePerPage: currentSizePerPage, sortField: field, sortOrder: order }) => {
    fetchData(currentPage, currentSizePerPage, order, field);
    setSortField(field);
    setSortOrder(order);
    setPage(currentPage);
    setSizePerPage(currentSizePerPage);
  };

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
            <ScrollContainer vertical={false} hideScrollbars={hideScrollbars} className={`scroll-container ${scrollClass}`}>
              <BootstrapTable
                remote
                wrapperClasses={wrapperClasses}
                keyField={keyField}
                data={data}
                columns={columns}
                onTableChange={handleTableChange}
                rowEvents={rowEvents}
                noDataIndication={indication}
                bordered={false}
                selectRow={selectRow}
                rowClasses={rowClasses}
                {...paginationTableProps}
              />
            </ScrollContainer>
            <TableNavBar>
              <SizePerPage hide={hideSizePerPage}> Show&nbsp;
                <SizePerPageDropdownStandalone
                  {...paginationProps}
                  variation="dropup"
                />&nbsp;items
              </SizePerPage>
              <PaginationListStandalone
                {...paginationProps}
              />
            </TableNavBar>
          </React.Fragment>
        )
      }
    </PaginationProvider>);
};

export default RemotePaginationTable;
