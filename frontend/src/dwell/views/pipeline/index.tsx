// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { FC, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { isEmpty } from 'lodash';
import moment from 'moment';
import axios, { CancelTokenStatic } from 'axios';
import { CustomInput } from 'reactstrap';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons/faPlusCircle';
import actions from 'dwell/actions';
import { fieldChoices, leadsFilterChoices, getShortName, chatAvatarColorClasses } from 'dwell/constants';
import BulkEditDialog from 'dwell/components/Leads/BulkLeadEditModal';
import { LeadCreationModal, LeadsFilterDropDown, LeadsFilterModal, RemotePagination } from 'dwell/components';
import LeadMergeModal from 'dwell/components/Leads/LeadMergeModal';
import 'src/scss/pages/_leads_list.scss';
import { getPropertyId } from 'src/utils';
import { ContainerFluid } from 'styles/common';
import {
  ContentNavbar,
  ContextMenuItem,
  ContextMenuLink,
  FormSearch, FormSearchInput, LeadsButtonIcon, LeadsPrimaryBtn,
  NavRight,
  StageBadge,
  Avatar,
} from 'dwell/views/pipeline/styles';
import { DetailResponse, ListResponse, SuccessResponse, LeadData } from 'src/interfaces';
import { defaultTableColumns, defaultTableData } from 'dwell/views/pipeline/utils';
import ColumnsSettingsDropDown from './_columnDropDown';
import MoreActionDropDown from './_moreActionDropDown';

const ContextMenu = ({ x, y, show, row, setShow }) => {
  const menuStyle = {
    top: `${y}px`,
    left: `${x}px`,
  };

  return (
    show &&
    <ContextMenuItem style={menuStyle}>
      <ContextMenuLink onClick={() => setShow(false)} to={`/${getPropertyId()}/leads/${row.id}`} target="_blank">Open in a new tab</ContextMenuLink>
    </ContextMenuItem>
  );
};

interface CustomHTMLElement extends HTMLElement {
  indeterminate: boolean,
}

interface LeadsTableProps extends RouteComponentProps {
  getLeads: (
    data: { search: string, filter_id: number | string, offset: number, limit: number, order: string, field: string },
    token?: CancelTokenStatic
  ) => Promise<ListResponse>,
  getLeadsFilter: () => void,
  clearLeads: () => void,
  updateLeads: (data: number[]) => Promise<SuccessResponse>,
  activeFilter: string | number,
  leadsFilters: { id: number | string, name: string }[],
  leadsData: {
    leads: LeadData[],
    count: number,
  },
  isLoaded: boolean,
  getColumnsSettings: () => void,
  getActiveFilter: () => Promise<DetailResponse>,
  setActiveFilter: (data: { lead_default_filter?: string, is_default_filter: boolean, lead_filter?: number }) => void,
  getSMSContacts: () => void,
  columns: { id: number, is_visible: boolean, name: string, position: number }[],
  pushLead: { id: number}[] | { id: number },
  pusherClear: () => void,
  mergeLeads: (data: { primary_lead: number, leads: {id: number}[] }) => Promise<SuccessResponse>,
  floorPlans: { id: number, plan: string }[],
}

const LeadsTable: FC<LeadsTableProps> = ({ getLeadsFilter, getColumnsSettings, clearLeads, leadsData, columns, getLeads, isLoaded, history: { push }, leadsFilters, updateLeads,
  getActiveFilter, setActiveFilter, activeFilter, mergeLeads, floorPlans, pushLead, pusherClear, getSMSContacts }) => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [sizePerPage, setSizePerPage] = useState(Number(localStorage.getItem('site-per-page')) || 20);
  const [totalSize, setTotalSize] = useState(0);
  const [keyword, setKeyword] = useState(null);
  const [selected, setSelected] = useState([]);
  const [show, setShow] = useState(false);
  const [shouldShowFilterModal, setShouldShowFilterModal] = useState(false);
  const [currentFilterId, setCurrentFilterId] = useState('active_leads' as string | number);
  const [appliedFilterId, setAppliedFilterId] = useState('active_leads' as string | number);
  const [isAppliedFilter, setIsAppliedFilter] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [isLoadedLeads, setIsLoadedLeads] = useState(false);

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuRow, setContextMenuRow] = useState({});

  const timer = useRef(null);
  const wrapperRef = useRef(null);
  const cancelToken = useRef(null);

  const defaultKeys = leadsFilterChoices.DEFAULT_FILTERS.map(item => item.id);

  const getKey = name => `${getPropertyId()}.${name}`;

  const handleClickOutside = (event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target) &&
        !['context-menu-link', 'context-menu'].includes(event.target.className)) {
      setShowContextMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const transformLeads = leads => leads.map((lead) => {
    const newLead = { ...lead };
    newLead.move_in_date = newLead.move_in_date || '';
    newLead.days_to_move_in = newLead.days_to_move_in === undefined ? '' : newLead.days_to_move_in;
    newLead.owner = newLead.owner || '';
    newLead.source = newLead.source || '';
    newLead.next_task_date = newLead.next_task_date || '';
    newLead.next_task = newLead.next_task || '';
    newLead.last_followup_date = newLead.last_followup_date || '';
    newLead.last_activity_date = newLead.last_activity_date || '';
    return newLead;
  });

  const fetchLeads = (currentPage, currentSizePerPage, order = sortOrder, field = sortField, token = null) => {
    getLeads({ search: keyword, filter_id: appliedFilterId, offset: currentSizePerPage * (currentPage - 1), limit: currentSizePerPage, page: currentPage, order, field }, token)
      .then(() => setIsLoadedLeads(true));
  };

  const reloadLeads = (token = null) => {
    setIsLoadedLeads(false);
    fetchLeads(1, sizePerPage, sortOrder, sortField, token);
    setPage(1);
    setSelected([]);
  };

  useEffect(() => {
    if (!isEmpty(leadsData)) {
      setData(leadsData.leads ? transformLeads(leadsData.leads) : []);
      setTotalSize(leadsData.count);
    }
  }, [leadsData.leads]);

  useEffect(() => {
    if (activeFilter) {
      setIsAppliedFilter(true);
      setCurrentFilterId(activeFilter);
      setAppliedFilterId(activeFilter);
    }
  }, [activeFilter]);

  const setActiveLeadFilter = (id) => {
    if (defaultKeys.includes(id)) {
      setActiveFilter({ lead_default_filter: id, is_default_filter: true });
    } else {
      setActiveFilter({ lead_filter: id, is_default_filter: false });
    }
  };

  useEffect(() => {
    getLeadsFilter();
    getColumnsSettings();
    getActiveFilter().then(({ result }) => {
      if (!result.data) {
        setActiveLeadFilter('active_leads');
      }
    }).catch(() => {
      setIsAppliedFilter(true);
      setCurrentFilterId('active_leads');
      setAppliedFilterId('active_leads');
    });
  }, []);

  useEffect(() => {
    const headerCheckbox = document.getElementById('header-checkbox') as CustomHTMLElement;
    if (headerCheckbox) {
      headerCheckbox.indeterminate = (headerCheckbox.getAttribute('indeterminate') === 'true');
    }
  }, [data, selected, page, sizePerPage, totalSize]);

  const showModal = () => {
    setShow(true);
  };

  const hideModal = () => {
    setShow(false);
  };

  const handleCreateLeadCB = () => {
    hideModal();
  };

  useEffect(() => {
    if (!isEmpty(pushLead)) {
      fetchLeads(page, sizePerPage);
      getSMSContacts();
      pusherClear();
    }
  }, [pushLead]);

  const handleClickNewFilter = () => {
    setShouldShowFilterModal(true);
    setCurrentFilterId(-1);
  };

  const handleClickEditFilter = (id) => {
    setShouldShowFilterModal(true);
    setCurrentFilterId(id);
  };

  const hideFilterModal = () => {
    setShouldShowFilterModal(false);
  };

  const handleApplyFilter = (id) => {
    setActiveLeadFilter(id);
    setAppliedFilterId(id);
    getLeadsFilter();
    hideFilterModal();
    setIsAppliedFilter(true);
  };

  const setTableSettings = () => {
    const lsOrder = localStorage.getItem(getKey('sortOrder'));
    const lsField = localStorage.getItem(getKey('sortField'));
    const lsKeyword = localStorage.getItem(getKey('searchKeyword'));
    if (lsOrder) {
      setSortOrder(lsOrder);
    }
    if (lsField) {
      setSortField(lsField);
    }
    if (lsKeyword) {
      setKeyword(lsKeyword);
    }
  };

  const reloadLeadsWithRequestCancel = () => {
    if (cancelToken.current) {
      cancelToken.current.cancel('Operation canceled due to new request.');
    }

    cancelToken.current = axios.CancelToken.source();
    reloadLeads(cancelToken.current.token);
  };

  useEffect(() => {
    if (isAppliedFilter) {
      setTableSettings();
      clearLeads();
      reloadLeadsWithRequestCancel();
      setIsAppliedFilter(false);
    }
  }, [isAppliedFilter]);

  const handleDeleteFilter = (id) => {
    getLeadsFilter();
    hideFilterModal();
    if (id === appliedFilterId) {
      setActiveLeadFilter('active_leads');
    }
  };

  const handleKeyUp = ({ target: { value } }) => {
    setKeyword(value);
    localStorage.setItem(getKey('searchKeyword'), value);
  };

  useEffect(() => {
    if (keyword === null) return;
    if (!keyword) {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      reloadLeadsWithRequestCancel();
      return;
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      timer.current = null;
      reloadLeadsWithRequestCancel();
    }, 500);
  }, [keyword]);

  const handleTableChange = (type, { page: currentPage, sizePerPage: currentSizePerPage, sortField: field, sortOrder: order }) => {
    setIsLoadedLeads(false);
    setData([]);
    fetchLeads(currentPage, currentSizePerPage, order, field);
    setSortField(field);
    setSortOrder(order);
    setPage(currentPage);
    setSizePerPage(currentSizePerPage);
    localStorage.setItem(getKey('sortOrder'), order);
    localStorage.setItem(getKey('sortField'), field);
    localStorage.setItem('site-per-page', currentSizePerPage);
  };

  const handleOnSelect = (row, isSelect) => {
    const ids = isSelect ? [...selected, row.id] : selected.filter(r => r !== row.id);
    setSelected(ids);
  };

  const handleOnSelectAll = (isSelect, rows) => {
    const ids = isSelect ? rows.map(r => r.id) : [];
    setSelected(ids);
  };

  useEffect(() => {
    if (showContextMenu) {
      setShowContextMenu(false);
    }
  }, [selected, sortOrder, page, sizePerPage, sortField]);

  // const handleDeleteBtnClick = () => {
  //   deleteLeads({ ids: selected })
  //     .then(() => {
  //       reloadLeads();
  //     });
  // };

  const handleUpdateBtnClick = (requestData) => {
    updateLeads(requestData)
      .then(() => {
        reloadLeads();
      });
  };

  const indication = () => {
    if (![null, ''].includes(keyword) || (appliedFilterId !== 'active_leads' && isLoaded && isLoadedLeads)) {
      return (
        <React.Fragment>
          <div className="empty-table">
            {/* eslint-disable-next-line jsx-a11y/heading-has-content */}
            <h4>No results found</h4>
            <div>Try adjusting your search or filter to find what you&#39;re looking for.</div>
          </div>
        </React.Fragment>);
    }

    return (
      <React.Fragment>
        <div className="empty-table">
          {/* eslint-disable-next-line jsx-a11y/heading-has-content */}
          <h4>Add leads</h4>
          <div>Add leads here to start creating tasks, setting tours and closing deals.</div>
          <button className="btn btn-primary btn-add-lead" onClick={showModal}><FontAwesomeIcon icon={faPlusCircle} /> New lead</button>
        </div>
      </React.Fragment>);
  };

  const changeColumns = (tableColumns) => {
    const defaultHideColumns = ['move_in_date', 'days_to_move_in', 'created'];
    if (isEmpty(columns)) return tableColumns.filter(column => !defaultHideColumns.includes(column.dataField));
    const hiddenColumns = columns.filter(column => !column.is_visible).map(column => column.name);
    tableColumns.forEach((column) => {
      const columnsSettingsColumnIndex = columns.findIndex(c => c.name === column.dataField);
      // eslint-disable-next-line no-param-reassign
      column.position = columns[columnsSettingsColumnIndex] ? columns[columnsSettingsColumnIndex].position : tableColumns.length;
      // Added default position value if it was not set accidentally by migration script
    });
    return tableColumns.filter(column => !hiddenColumns.includes(column.dataField)).sort((a, b) => (a.position - b.position));
  };

  const leadsFilter = leadsFilters.find(filter => filter.id === currentFilterId) || {};
  let content = null;
  let defaultColumns = [
    {
      dataField: 'name',
      text: 'Name',
      sort: true,
      classes: 'lead-name',
      formatter: cell => (<strong>{cell}</strong>),
    }, {
      dataField: 'stage',
      text: 'Stage',
      sort: true,
      formatter: (cell) => {
        let color = '';
        let backgroundColor = '';
        switch (cell) {
          case 'INQUIRY': {
            color = '#0168fa';
            backgroundColor = '#ddebff';
            break;
          }
          case 'CONTACT_MADE': {
            color = '#9000ff';
            backgroundColor = '#f1deff';
            break;
          }
          case 'TOUR_SET': {
            color = '#fd7e14';
            backgroundColor = '#fff3e8';
            break;
          }
          case 'TOUR_COMPLETED': {
            color = '#24ba7b';
            backgroundColor = '#e3faf0';
            break;
          }
          case 'WAITLIST': {
            color = '#70c4c2';
            backgroundColor = '#ebffff';
            break;
          }
          case 'APPLICATION_PENDING': {
            color = '#e83e8c';
            backgroundColor = '#fef4f9';
            break;
          }
          case 'APPLICATION_COMPLETE': {
            color = '#f3505c';
            backgroundColor = '#fff';
            break;
          }
          default:
            break;
        }
        return <StageBadge style={{ backgroundColor, color }} pill>{fieldChoices.LEAD_FILED_CHOICES.stage[cell]}</StageBadge>;
      },
    }, {
      dataField: 'owner',
      text: 'Owner',
      sort: true,
    }, {
      dataField: 'acquisition_date',
      text: 'Acquisition date ',
      sort: true,
      formatter: cell => moment(cell)
        .format('lll'),
    }, {
      dataField: 'move_in_date',
      text: 'Move-in date',
      sort: true,
      formatter: cell => (cell ? moment(cell).format('ll') : ''),
    }, {
      dataField: 'days_to_move_in',
      text: 'Days to move-in',
      sort: true,
      formatter: cell => (cell === Number.MIN_SAFE_INTEGER ? '' : cell),
    }, {
      dataField: 'next_task',
      text: 'Next task',
      sort: true,
      formatter: (cell, row) => {
        if (!row.next_task_date) return <div />;
        const date = new Date(row.next_task_date);
        const cellClass = date < new Date() ? 'overdue-task' : '';
        const dotClass = date < new Date() ? 'red-dot' : 'gray-dot';
        return (<div className={cellClass}><span className={dotClass} />{cell}</div>);
      },
    }, {
      dataField: 'next_task_date',
      text: 'Task due',
      sort: true,
      formatter: (cell) => {
        if (!cell) return <div />;
        const date = new Date(cell);
        const cellClass = date < new Date() ? 'overdue-task' : '';
        return (
          <span className={cellClass}>{moment(cell)
            .format('ll')}
          </span>
        );
      },
    }, {
      dataField: 'source',
      text: 'Source',
      sort: true,
    }, {
      dataField: 'floor_plan',
      text: 'Floor plan',
      sort: true,
      formatter: cell => (!isEmpty(cell) && !isEmpty(floorPlans) ? floorPlans.filter(plan => cell.includes(plan.id)).map(plan => plan.plan).join(', ') : ''),
    }, {
      dataField: 'last_activity_date',
      text: 'Last activity date',
      sort: true,
      formatter: cell => (cell ? moment(cell).format('lll') : ''),
    }, {
      dataField: 'last_followup_date',
      text: 'Last followup date',
      sort: true,
      formatter: cell => (cell ? moment(cell).format('lll') : ''),
    }, {
      dataField: 'created',
      text: 'Create date ',
      sort: true,
      formatter: cell => moment(cell)
        .format('lll'),
    }, {
      dataField: 'id',
      text: '',
      headerFormatter: () => <ColumnsSettingsDropDown />,
      formatter: (value, row) => <MoreActionDropDown leadId={value} leadName={row.name} />,
    },
  ];
  const colors = chatAvatarColorClasses.concat(['bg-success', '']);
  const avatarColumn = [{
    dataField: '',
    text: '',
    formatter: (cell, row) => <Avatar className={`avatar ${colors[row.id % 9]}`}><span>{getShortName(row.name)}</span></Avatar>,
  }];
  defaultColumns = avatarColumn.concat(changeColumns(defaultColumns));

  const selectRow = {
    mode: 'checkbox',
    hideSelectColumn: false,
    selected,
    onSelect: handleOnSelect,
    onSelectAll: handleOnSelectAll,
    selectionHeaderRenderer: ({ mode, checked, indeterminate }) => <CustomInput type={mode} id="header-checkbox" checked={checked} onChange={handleOnSelectAll} indeterminate={indeterminate.toString()} />,
    selectionRenderer: ({ mode, rowIndex, checked }) => (
      <CustomInput type={mode} id={`row${rowIndex + 1}`} checked={checked} onChange={handleOnSelect} />
    ),
  };
  const rowEvents = {
    onClick: (e, row) => {
      setShowContextMenu(false);
      const siteId = getPropertyId();
      push({ pathname: `/${siteId}/leads/${row.id}`,
        state: { openComposer: false,
        },
      });
    },
    onContextMenu: (e, row) => {
      e.preventDefault();
      setX(e.pageX);
      setY(e.pageY);
      setShowContextMenu(true);
      setContextMenuRow(row);
    },
  };
  const rowClasses = (row) => {
    let classes = 'animated fadeIn';
    if (selected.includes(row.id)) {
      classes = `selected ${classes}`;
    }
    return classes;
  };

  if ((isLoaded && isLoadedLeads && !isEmpty(leadsData)) || (!isLoaded || !isLoadedLeads)) {
    content = (
      <div ref={wrapperRef}>
        <ContextMenu x={x} y={y} show={showContextMenu} row={contextMenuRow} setShow={setShowContextMenu} />
        <RemotePagination
          wrapperClasses="leads-table table-alpha"
          keyField="id"
          data={isLoaded && isLoadedLeads ? data : defaultTableData()}
          page={page}
          sizePerPage={sizePerPage}
          totalSize={totalSize}
          onTableChange={handleTableChange}
          columns={isLoaded && isLoadedLeads ? defaultColumns : defaultTableColumns()}
          selectRow={selectRow}
          rowEvents={isLoaded && isLoadedLeads ? rowEvents : {}}
          indication={indication}
          rowClasses={rowClasses}
          isDragScroll
        />
      </div>
    );
  }

  const handleMerge = (primaryLead) => {
    setShowMergeModal(false);
    mergeLeads({ primary_lead: primaryLead, leads: selected.filter(id => id !== primaryLead) }).then(() => {
      const siteId = getPropertyId();
      push(`/${siteId}/leads/${primaryLead}`);
    });
  };

  return (
    <React.Fragment>
      <ContainerFluid fluid>
        <Helmet>
          <title>DWELL | Pipeline</title>
        </Helmet>
        <ContentNavbar>
          {shouldShowFilterModal && (
            <LeadsFilterModal
              show={shouldShowFilterModal}
              onCancel={hideFilterModal}
              onApply={handleApplyFilter}
              onDelete={handleDeleteFilter}
              leadsFilter={leadsFilter}
            />
          )}
          <LeadsFilterDropDown
            filterId={appliedFilterId}
            onNewFilter={handleClickNewFilter}
            onClickFilter={handleApplyFilter}
            onEditFilter={handleClickEditFilter}
            leadsFilters={leadsFilters}
          />
          {isEmpty(selected) ?
            <NavRight>
              <FormSearch className="mr-2" >
                <i className="ri-search-line" />
                <FormSearchInput
                  name="search"
                  placeholder="Search leads"
                  onKeyUp={handleKeyUp}
                  defaultValue={keyword}
                />
              </FormSearch>
              <LeadsPrimaryBtn onClick={showModal}><LeadsButtonIcon className="ri-add-circle-fill" />New lead</LeadsPrimaryBtn>
              <LeadCreationModal show={show} handleClose={handleCreateLeadCB} />
            </NavRight> :
            <NavRight>
              <LeadsPrimaryBtn className="mr-2" disabled={selected.length < 2} onClick={() => { setShowMergeModal(true); }}><LeadsButtonIcon className="ri-group-fill" />Merge</LeadsPrimaryBtn>
              <LeadsPrimaryBtn onClick={() => { setShowEditModal(true); }}><LeadsButtonIcon className="ri-mark-pen-fill" />Bulk edit</LeadsPrimaryBtn>
              <BulkEditDialog
                show={showEditModal}
                selectedRows={selected}
                handleClose={() => setShowEditModal(false)}
                handleSave={(value) => {
                  setShowEditModal(false);
                  handleUpdateBtnClick(value);
                }}
              />
              <LeadMergeModal
                show={showMergeModal}
                leadIds={selected}
                handleClose={() => setShowMergeModal(false)}
                handleMerge={primaryLead => handleMerge(primaryLead)}
              />
            </NavRight>}
        </ContentNavbar>
        {content}
      </ContainerFluid>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  leadsData: { leads: state.lead.leads, count: state.lead.count },
  leadsFilters: state.leadsFilter.leadsFilters,
  isLoaded: state.lead.isLoaded,
  columns: state.columnsSettings.columns,
  pushLead: state.pusher.pushLead,
  activeFilter: state.leadsFilter.activeFilter,
  floorPlans: state.property.property.floor_plans,
});

export default withRouter(connect(
  mapStateToProps,
  {
    ...actions.lead,
    ...actions.leadsFilter,
    ...actions.property,
    ...actions.columnsSettings,
    ...actions.pusher,
    ...actions.user,
    ...actions.smsMessage,
  },
)(LeadsTable));
