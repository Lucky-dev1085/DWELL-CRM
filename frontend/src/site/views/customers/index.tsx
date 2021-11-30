/* eslint-disable jsx-a11y/heading-has-content */
import { Row, Col, Button, UncontrolledTooltip } from 'reactstrap';
import React, { useState, useEffect, FC } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { toast, ToastOptions } from 'react-toastify';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Helmet } from 'react-helmet';
import ScrollContainer from 'react-indiana-drag-scroll';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import qs from 'query-string';
import { ListResponse, SuccessResponse, DetailResponse, CustomerProps } from 'src/interfaces';
import { toastOptions } from 'site/constants';
import { ConfirmActionModal, CustomerModal, Loader } from 'site/components';
import actions from 'site/actions';
import dwellActions from 'dwell/actions';
import { ContentHeader, FormSwitcher, ContentBodySite, NavGroup, IconAction, PropertyName, SearchIcon, FormSearch, NavLink, TextSmall } from 'site/components/common';
import { defaultTableColumns, defaultTableData, TableCustomer } from './utils';

const navLink = [
  { label: 'All Customers', name: 'ALL' },
  { label: 'Active', name: 'ACTIVE' },
  { label: 'Inactive', name: 'INACTIVE' },
];

interface Customers extends RouteComponentProps {
  getCustomers: ({ show_all: boolean }) => Promise<ListResponse>,
  getClients: ({ show_all: boolean }) => Promise<ListResponse>,
  getCustomerDetails: (id: number) => Promise<DetailResponse>,
  deleteCustomer: (id: number) => Promise<SuccessResponse>,
  updateUser: (id: number, data: { status: string }, successCB: () => void) => Promise<DetailResponse>,
  customers: CustomerProps[],
  isCustomersLoaded: boolean,
}

const Customers: FC<Customers> = ({ getCustomers, getClients, getCustomerDetails, customers, deleteCustomer, isCustomersLoaded, location, updateUser }) => {
  const [customerToDelete, updateCustomerDelete] = useState({} as CustomerProps);
  const [currentCustomer, updateCustomer] = useState({} as CustomerProps);
  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [showCustomerModal, toggleCustomerModal] = useState(false);
  const [showActivated, setShowActivated] = useState('ALL');
  const [keyword, setKeyword] = useState(qs.parse(location.search).keyword ? qs.parse(location.search).keyword : '');
  const [editStep, updateEditStep] = useState(null);

  useEffect(() => {
    getCustomers({ show_all: true });
    getClients({ show_all: true });
  }, []);

  const onSearch = ({ target: { value } }) => {
    setKeyword(value);
  };

  const getCustomerDetail = (id) => {
    getCustomerDetails(id).then(({ result: { data } }) => {
      toggleConfirmModal(true);
      updateCustomerDelete(data);
    });
  };

  const handleDeleteCustomer = () => {
    deleteCustomer(customerToDelete.id)
      .then(() => {
        getCustomers({ show_all: true });
        toggleConfirmModal(false);
        updateCustomer({});
      });
  };

  const handleReloadCustomer = () => {
    toggleCustomerModal(false);
    updateCustomer({});
    getClients({ show_all: true });
    getCustomers({ show_all: true });
  };

  const stopAction = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const updateCustomerStatus = (e, { user }) => {
    stopAction(e);

    if (user.id) {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      updateUser(user.id, { status: newStatus }, () => toast.success('Customer status updated', toastOptions as ToastOptions))
        .then(() => handleReloadCustomer());
    }
  };

  const updateCurrentCustomer = (e, customer, step) => {
    stopAction(e);
    toggleCustomerModal(true);
    updateCustomer(customer);
    updateEditStep(step);
  };

  const handleClose = () => {
    toggleCustomerModal(false);
    updateCustomer({});
    updateEditStep(null);
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
    if (!isCustomersLoaded) {
      return <Loader />;
    }
    return (
      <React.Fragment>
        <div className="text-center">
          <h4>Add customers</h4>
          <Button color="primary" className="mt-2">
            <i className="fa fa-user-plus mr-2" />Create New Customer
          </Button>
        </div>
      </React.Fragment>);
  };

  const renderNavLinks = () => {
    const navLinkList = navLink.map((item, i) => (
      <NavLink key={i} active={showActivated === item.name} onClick={() => setShowActivated(item.name)}>
        <div style={{ marginBottom: '2px' }}>{item.label}</div>
        <TextSmall>{item.name === 'ALL' ? customers.length : customers.filter(el => el.user && el.user.status === item.name).length}</TextSmall>
      </NavLink>));

    return (
      <NavGroup>
        {navLinkList}
      </NavGroup>
    );
  };

  let filteredCustomers = customers.filter(customer => (customer.customer_name.includes(keyword) && (showActivated !== 'ALL' ? customer.user.status === showActivated : true)));
  filteredCustomers = filteredCustomers.map(item => ({ ...item, userFullName: `${item.user.first_name} ${item.user.last_name}` }));

  let confirmModalContent = null;
  if (!isEmpty(customerToDelete)) {
    confirmModalContent = (
      <React.Fragment>
        <div className="mt-10">
          <strong>Customer Admin{customerToDelete.admins.length && 's'}</strong>
          {customerToDelete.admins.map(item => <div>{item.first_name} {item.last_name}</div>)}
        </div>
        <Row>
          <Col>
            <strong>Properties</strong>
            {customerToDelete.properties.map(item => <div>{item}</div>)}
          </Col>
        </Row>
        <Row>
          <Col>
            <strong>Clients</strong>
            {customerToDelete.clients.map(item => <div>{item}</div>)}
          </Col>
        </Row>
        <Row>
          <Col>
            <strong>Employees</strong>
            {customerToDelete.employee.map(item => <div>{`${item.first_name} ${item.last_name}`}</div>)}
          </Col>
        </Row>
      </React.Fragment>
    );
  }
  let customerModalTitle = 'Add New Customer';

  const defaultColumns = [
    {
      dataField: 'logo',
      text: 'Logo',
      formatter: value => (
        <img src={value || '/static/images/no-image.jpg'} alt="customer logo" style={{ width: '38px', height: '38px', borderRadius: '5px' }} />
      ),
    },
    {
      dataField: 'customer_name',
      text: 'Customer name',
      sort: true,
      formatter: value => <PropertyName>{value}</PropertyName>,
    },
    {
      dataField: 'active_properties',
      text: 'Properties',
      sort: true,
      formatter: value => <div className="text-right">{value}</div>,
    },
    {
      dataField: 'employees_count',
      text: 'Employees',
      sort: true,
      formatter: value => <div className="text-right">{value}</div>,
    },
    {
      dataField: 'userFullName',
      text: 'Name of User',
      sort: true,
    },
    {
      dataField: 'user.email',
      text: 'Email',
      sort: true,
    },
    {
      dataField: 'user.phone_number',
      text: 'Phone',
      sort: true,
    },
    {
      dataField: 'created',
      text: 'Created',
      sort: true,
      formatter: value => moment(value).format('MMM Do YYYY'),
    },
    {
      dataField: 'user.status',
      text: 'Status',
      sort: true,
      formatter: (value, raw) => (
        <FormSwitcher inactive={value === 'INACTIVE'} onClick={e => updateCustomerStatus(e, raw)} />
      ),
    },
    {
      dataField: 'id',
      text: '',
      formatter: (value, customer) => (
        <div className="d-flex float-right">
          <IconAction>
            <i
              className="ri-pencil-line"
              id={`edit-${customer.id}`}
              onClick={e => updateCurrentCustomer(e, customer, 1)}
            />
          </IconAction>
          <UncontrolledTooltip placement="top" target={`edit-${customer.id}`}>
            Edit customer
          </UncontrolledTooltip>
          <IconAction>
            <i
              className="ri-shield-user-line"
              id={`edit-access-${customer.id}`}
              onClick={e => updateCurrentCustomer(e, customer, 2)}
            />
          </IconAction>
          <UncontrolledTooltip placement="top" target={`edit-access-${customer.id}`}>
            Edit managed properties
          </UncontrolledTooltip>
          <IconAction>
            <i
              className="ri-delete-bin-5-line"
              id={`delete-${customer.id}`}
              onClick={(e) => { stopAction(e); getCustomerDetail(customer.id); }}
            />
          </IconAction>
          <UncontrolledTooltip placement="top" target={`delete-${customer.id}`}>
            Delete customer
          </UncontrolledTooltip>
        </div>
      ),
    },
  ];

  if (currentCustomer.id) customerModalTitle = editStep === 1 ? 'Edit Customer' : 'Edit Managed Properties';
  const content = (
    <section>
      <ConfirmActionModal
        text="Do you wish to delete customer"
        itemName={customerToDelete.customer_name}
        content={confirmModalContent}
        onConfirm={handleDeleteCustomer}
        title="Confirm Delete"
        onClose={() => toggleConfirmModal(false)}
        show={showConfirmModal}
      />
      {showCustomerModal && (
        <CustomerModal
          title={customerModalTitle}
          reload={handleReloadCustomer}
          show={showCustomerModal}
          onClose={handleClose}
          customer={currentCustomer}
          editStep={editStep}
        />
      )}
      <ToolkitProvider
        keyField="id"
        data={isCustomersLoaded ? filteredCustomers : defaultTableData()}
        columns={isCustomersLoaded ? defaultColumns : defaultTableColumns()}
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
                      text: '10', value: 10,
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
        <title>DWELL | Customers</title>
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
              placeholder="Search customers"
            />
          </div>
          <Button
            color="primary"
            onClick={() => { toggleCustomerModal(true); updateCustomer({}); }}
          >
            <i className="ri-add-circle-fill" />
            New Customer
          </Button>
        </div>
      </ContentHeader>
      <Row>
        <Col xs="12">
          <TableCustomer>
            {content}
          </TableCustomer>
        </Col>
      </Row>
    </ContentBodySite>
  );
};

const mapStateToProps = state => ({
  isCustomersLoaded: state.customer.isCustomersLoaded,
  isClientsLoaded: state.client.isClientsLoaded,
  customers: state.customer.customers,
  clients: state.client.clients,
});

export default connect(
  mapStateToProps,
  {
    ...dwellActions.user,
    ...actions.customer,
    ...actions.client,
  },
)(withRouter(Customers));
