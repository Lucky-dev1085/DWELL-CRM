/* eslint-disable jsx-a11y/heading-has-content */
import { Col, Row, Button, UncontrolledTooltip } from 'reactstrap';
import React, { useState, useEffect, FC } from 'react';
import { connect } from 'react-redux';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import ScrollContainer from 'react-indiana-drag-scroll';
import qs from 'query-string';
import moment from 'moment';
import { toast, ToastOptions } from 'react-toastify';
import { Helmet } from 'react-helmet';

import { roleTypes, toastOptions } from 'site/constants';
import { ConfirmActionModal, ClientModal, Loader } from 'site/components';
import actions from 'site/actions';
import {
  ContentHeader, NavGroup, IconAction, FormSwitcher, ContentBodySite, MediaWrapper, Avatar, MediaBody, PropertyName, SearchIcon,
  FormSearch, NavLink, TextSmall, FlexEnd,
} from 'site/components/common';
import { ListResponse, SuccessResponse, DetailResponse } from 'src/interfaces';
import { defaultTableColumns, defaultTableData, TableClient } from './utils';

const navLink = [
  { label: 'All Clients', name: 'ALL' },
  { label: 'Active', name: 'ACTIVE' },
  { label: 'Inactive', name: 'INACTIVE' },
];

interface ClientState {
  id?: number,
  name?: string,
}

interface Clients extends RouteComponentProps {
  isClientsLoaded: boolean,
  clients: { name: string, status: string }[],
  getClients: ({ show_all: boolean }) => Promise<ListResponse>,
  deleteClient: (id: number) => Promise<SuccessResponse>,
  updateClient: (id: number, data: { status: string }, successCB: () => void) => Promise<DetailResponse>,
  clientsState: { currentClient: { id: number } },
  currentUser: { role: string },
}

const Clients: FC<Clients> = ({ isClientsLoaded, clients, getClients, deleteClient, location, updateClient, currentUser }) => {
  const [currentClient, setCurrentClient] = useState({} as ClientState);
  const [showClientModal, toggleClientModal] = useState(false);
  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [showActivated, setShowActivated] = useState('ALL');
  const [keyword, setKeyword] = useState(qs.parse(location.search).keyword ? qs.parse(location.search).keyword : '');

  useEffect(() => {
    getClients({ show_all: true });
  }, []);

  const onSearch = ({ target: { value } }) => {
    setKeyword(value);
  };

  const onClickNewClient = () => {
    const isGenericAdmin = [roleTypes.GENERIC_ADMIN, roleTypes.PROPERTY_ADMIN].includes(currentUser.role);
    toggleClientModal(!isGenericAdmin);
    setCurrentClient({});
  };

  // const redirectToProperty = (client = '') => {
  //   if (client.id) {
  //     push(`${paths.client.ADMIN_PROPERTIES}?${qs.stringify({ clientId: client.id })}`);
  //   } else {
  //     push(paths.client.ADMIN_PROPERTIES);
  //   }
  // };

  const handleReloadClients = () => {
    getClients({ show_all: true });
    toggleClientModal(false);
    setCurrentClient({});
  };

  const handleDeleteClient = () => {
    deleteClient(currentClient.id)
      .then(() => {
        getClients({ show_all: true });
        toggleConfirmModal(false);
        setCurrentClient({});
      });
  };

  const renderNavLinks = () => {
    const navLinkList = navLink.map((item, i) => (
      <NavLink key={i} active={showActivated === item.name} onClick={() => setShowActivated(item.name)}>
        <div style={{ marginBottom: '2px' }}>{item.label}</div>
        <TextSmall>{item.name === 'ALL' ? clients.length : clients.filter(el => el.status === item.name).length}</TextSmall>
      </NavLink>));

    return (
      <NavGroup>
        {navLinkList}
      </NavGroup>
    );
  };

  const stopAction = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const updateClientStatus = (e, clientData) => {
    stopAction(e);

    if (clientData.id) {
      const newStatus = clientData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      updateClient(clientData.id, { ...clientData, status: newStatus }, () => toast.success('Client status updated', toastOptions as ToastOptions));
    }
  };

  const updateCurrentClient = (e, client, isRemove = false) => {
    stopAction(e);
    if (isRemove) {
      toggleConfirmModal(true);
    } else {
      toggleClientModal(true);
    }
    setCurrentClient(client);
  };

  const indication = () => {
    if (keyword || showActivated !== 'ALL') {
      return (
        <React.Fragment>
          <div className="text-center">
            <h4>No results found</h4>
            <div>Try adjusting your search or filter to find what you&#39;re looking for.</div>
          </div>
        </React.Fragment>);
    }
    if (!isClientsLoaded) {
      return <Loader />;
    }
    return (
      <React.Fragment>
        <div className="text-center">
          <h4>Add clients</h4>
          <Button color="primary" className="mt-2">
            <i className="fa fa-user-plus mr-2" />Create New Client
          </Button>
        </div>
      </React.Fragment>);
  };

  const isGenericAdmin = [roleTypes.GENERIC_ADMIN, roleTypes.PROPERTY_ADMIN].includes(currentUser.role);
  const tableOptions = [
    {
      dataField: 'name',
      text: 'Client Name',
      sort: true,
      formatter: value => (
        <MediaWrapper className="align-items-center">
          <Avatar>
            <i className="ri-home-smile-2-line" />
          </Avatar>
          <MediaBody>
            <PropertyName onClick={() => { /* redirectToProperty(client) */ }}>
              {value}
            </PropertyName>
          </MediaBody>
        </MediaWrapper>
      ),
    },
    {
      dataField: 'customer_name',
      text: 'Customer',
      sort: true,
    },
    {
      dataField: 'creator',
      text: 'Creator',
      sort: true,
    },
    {
      dataField: 'created',
      text: 'Date Created',
      sort: true,
      formatter: value => <div className="text-right">{moment(value).format('MMM Do YYYY')}</div>,
    },
    {
      dataField: 'status',
      text: 'Status',
      sort: true,
      formatter: (value, raw) => (
        <FlexEnd>
          <FormSwitcher inactive={value === 'INACTIVE'} disabled={isGenericAdmin} onClick={e => updateClientStatus(e, raw)} />
        </FlexEnd>
      ),
    },
    {
      dataField: 'properties_count',
      text: 'Properties',
      sort: true,
      formatter: (value, client) => <div className="text-right" onClick={() => { /* redirectToProperty(client) */ }}>{client.properties.length}</div>,
    },
  ];
  if (!isGenericAdmin) {
    tableOptions.push({
      text: '',
      sort: false,
      dataField: 'id',
      formatter: (value, client) => (
        <div className="d-flex float-right">
          <IconAction>
            <i
              className="ri-pencil-line"
              id={`edit-${client.id}`}
              onClick={e => updateCurrentClient(e, client)}
            />
          </IconAction>
          <UncontrolledTooltip placement="top" target={`edit-${client.id}`}>
            Edit client
          </UncontrolledTooltip>
          <IconAction>
            <i
              className="ri-delete-bin-5-line"
              id={`delete-${client.id}`}
              onClick={e => updateCurrentClient(e, client, true)}
            />
          </IconAction>
          <UncontrolledTooltip placement="top" target={`delete-${client.id}`}>
            Delete client
          </UncontrolledTooltip>
        </div>
      ),
    });
  }

  const filteredClients = clients.filter(client => (client.name.includes(keyword)) && (showActivated !== 'ALL' ? client.status === showActivated : true));

  const content = (
    <section>
      {showClientModal && (
        <ClientModal
          title={currentClient.id ? 'Edit Client' : 'Create Client'}
          reload={handleReloadClients}
          client={currentClient}
          show={showClientModal}
          onClose={() => toggleClientModal(false)}
        />
      )}
      <ConfirmActionModal
        title="Confirm Delete"
        text="Do you wish to delete client"
        itemName={currentClient.name}
        onConfirm={handleDeleteClient}
        show={showConfirmModal}
        onClose={() => toggleConfirmModal(false)}
      />
      <ToolkitProvider
        keyField="id"
        data={isClientsLoaded ? filteredClients : defaultTableData()}
        columns={isClientsLoaded ? tableOptions : defaultTableColumns()}
      >
        {
          props => (
            <ScrollContainer vertical={false} hideScrollbars={false} className="scroll-container">
              <BootstrapTable
                bordered={false}
                noDataIndication={indication}
                pagination={paginationFactory({
                  sizePerPageList: [
                    {
                      text: '30', value: 30,
                    },
                  ],
                  showTotal: true,
                })}
                {...props.baseProps}
              />
            </ScrollContainer>
          )
        }
      </ToolkitProvider>
    </section>
  );

  return (
    <ContentBodySite>
      <Helmet>
        <title>DWELL | Clients</title>
      </Helmet>
      <ContentHeader>
        {renderNavLinks()}
        <div className="d-flex">
          <div className="position-relative mr-10">
            <SearchIcon />
            <FormSearch
              name="search"
              value={keyword}
              onChange={onSearch}
              placeholder="Search clients"
            />
          </div>
          {!isGenericAdmin && (
            <Button
              color="primary"
              onClick={onClickNewClient}
            >
              <i className="ri-add-circle-fill" />
              New Client
            </Button>
          )}
        </div>
      </ContentHeader>
      <Row>
        <Col xs="12">
          <TableClient>
            {content}
          </TableClient>
        </Col>
      </Row>
    </ContentBodySite>
  );
};

const mapStateToProps = state => ({
  isClientsLoaded: state.client.isClientsLoaded,
  clients: state.client.clients,
  currentUser: state.user.currentUser,
});

export default connect(
  mapStateToProps,
  {
    ...actions.client,
  },
)(withRouter(Clients));
