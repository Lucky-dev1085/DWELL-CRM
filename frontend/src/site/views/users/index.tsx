/* eslint-disable jsx-a11y/heading-has-content */
import { Row, Col, Button, UncontrolledTooltip, Dropdown, CustomInput } from 'reactstrap';
import React, { useState, useEffect, FC } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import qs from 'query-string';
import { toast, ToastOptions } from 'react-toastify';
import ScrollContainer from 'react-indiana-drag-scroll';
import { Helmet } from 'react-helmet';
import { ListResponse, SuccessResponse, DetailResponse, PropertyProps, CustomerProps, ClientProps } from 'src/interfaces';
import { ConfirmActionModal, UserModal, Loader } from 'site/components';
import actions from 'site/actions';
import dwellActions from 'dwell/actions';
import { ContentHeader, FormSwitcher, ContentBodySite, NavGroup, IconAction, PropertyName, SearchIcon, FormSearch, NavLink, TextSmall } from 'site/components/common';
import { toastOptions, roleTypes, roleChoices } from 'site/constants';
import { getColorFromString } from 'site/common/getColor';
import {
  CollapseIcon, FiltersDropdownButton, FiltersDropdownItem, FiltersDropdownLabel, FiltersDropdownMenu,
} from 'dwell/components/Leads/LeadsFilterDropDown/styles';
import { PrimaryButton } from 'styles/common';
import { TableUser, Avatar, EmptyContent, Tooltip } from 'site/views/users/styles';
import { defaultTableColumns, defaultTableData } from './utils';

const navLink = [
  { label: 'All Users', name: 'ALL' },
  { label: 'Active', name: 'ACTIVE' },
  { label: 'Inactive', name: 'INACTIVE' },
];

interface User {
  id?: number,
  role?: string,
  status?: string,
  first_name?: string,
  last_name?: string,
  properties?: number[],
  clients?: number[],
  email?: string,
  customer?: number,
  is_super_customer?: boolean,
}

interface Users extends RouteComponentProps {
  isClientsLoaded: boolean,
  isUsersLoaded: boolean,
  isPropertiesLoaded: boolean,
  getUsers: ({ show_all: boolean }) => Promise<ListResponse>,
  getClients: ({ show_all: boolean }) => Promise<ListResponse>,
  getCustomers: ({ show_all: boolean }) => Promise<ListResponse>,
  deleteUser: (id: number) => Promise<SuccessResponse>,
  updateUser: (id: number, data: { status?: string, is_super_customer?: boolean }, successCB?: () => void) => Promise<DetailResponse>,
  currentUser: User,
  currentProperty: PropertyProps,
  users: User[],
  clients: ClientProps[],
  customers: CustomerProps[],
}

interface StateProps {
  property: number,
}

const Users: FC<Users> = ({ getUsers, getClients, getCustomers, deleteUser, location, currentUser, users, customers, clients,
  isClientsLoaded, isUsersLoaded, isPropertiesLoaded, updateUser, currentProperty, location: { state } }) => {
  const { property: stateProperty } = (state || {}) as StateProps;
  const [user, setUser] = useState({} as User);
  const [keyword, setKeyword] = useState(qs.parse(location.search).keyword ? qs.parse(location.search).keyword : '');
  const [showActivated, setShowActivated] = useState('ALL');
  const [propertyFilter, setPropertyFilter] = useState(stateProperty || null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dropdownOpen, setDropdownState] = useState(false);
  const [editStep, setEditStep] = useState(null);
  const [customerAgentId, setCustomerAgentId] = useState(null);

  useEffect(() => {
    getUsers({ show_all: true });
    getClients({ show_all: true });
  }, []);

  useEffect(() => {
    if (currentUser.id && currentUser.role === roleTypes.LIFT_LYTICS_ADMIN) {
      getCustomers({ show_all: true });
    }
  }, [currentUser]);

  const handleReloadUsers = () => {
    getUsers({ show_all: true });
    setShowUserModal(false);
    setUser({});
  };

  const handleDeleteUser = () => {
    if (customerAgentId) {
      updateUser(customerAgentId, { is_super_customer: true }, () => setCustomerAgentId(null));
    }
    deleteUser(user.id)
      .then(() => {
        getUsers({ show_all: true });
        setShowConfirmModal(false);
        setUser({});
      });
  };

  const stopAction = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const updateUserStatus = (e, userData) => {
    stopAction(e);

    if (userData.id) {
      const newStatus = userData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      updateUser(userData.id, { ...userData, status: newStatus }, () => toast.success('User status updated', toastOptions as ToastOptions));
    }
  };

  const properties = clients.reduce((prev, client) => ([...prev, ...client.properties]), []);
  const activeFilterProperty = properties.find(i => i.id === propertyFilter);
  const reOrderedProperties = [currentProperty].concat(properties.filter(i => i.id !== currentProperty.id));
  const filterDropdown = (
    <Dropdown isOpen={dropdownOpen} toggle={() => setDropdownState(!dropdownOpen)}>
      <FiltersDropdownButton active={propertyFilter}>
        {activeFilterProperty ? (
          <span>{activeFilterProperty.name} <small>{users.filter(i => i.properties.includes(activeFilterProperty.id)).length}</small></span>
        ) :
          (
            <span>Properties</span>
          )}
        <CollapseIcon className="ri-code-line" />
      </FiltersDropdownButton>
      <FiltersDropdownMenu>
        <FiltersDropdownLabel>Filter By Property</FiltersDropdownLabel>
        {reOrderedProperties.map(p => (
          <React.Fragment key={p.id}>
            <FiltersDropdownItem onClick={() => setPropertyFilter(p.id)}>
              <span>{p.name} {p.id === currentProperty.id && ' (current)'}</span>
            </FiltersDropdownItem>
          </React.Fragment>))}
      </FiltersDropdownMenu>
    </Dropdown>
  );

  const renderNavLinks = () => {
    const navLinkList = navLink.map((item, i) => (
      <NavLink key={i} active={!propertyFilter && showActivated === item.name} onClick={() => { setShowActivated(item.name); setPropertyFilter(null); }}>
        <div style={{ marginBottom: '2px' }}>{item.label}</div>
        <TextSmall>{item.name === 'ALL' ? users.length : users.filter(el => el.status === item.name).length}</TextSmall>
      </NavLink>));

    return (
      <NavGroup>
        {navLinkList}
        {properties.length > 1 && filterDropdown}
      </NavGroup>
    );
  };

  const indication = () => {
    if (keyword || showActivated !== 'ALL' || propertyFilter) {
      return (
        <EmptyContent>
          <i className="ri-group-line" />
          <h4>No results found</h4>
          <p>Try adjusting your search or filter to find what you&#39;re looking for.</p>
        </EmptyContent>);
    }

    if (!isUsersLoaded || !isClientsLoaded || !isPropertiesLoaded) {
      return <Loader />;
    }
    return (
      <EmptyContent>
        <i className="ri-group-line" />
        <h4>No results found</h4>
        <p>Please create new user here.</p>
        <PrimaryButton color="primary" className="mt-2">
          <i className="fa fa-user-plus mr-2" />Create New User
        </PrimaryButton>
      </EmptyContent>);
  };
  const isGenericAdmin = [roleTypes.GENERIC_ADMIN, roleTypes.PROPERTY_ADMIN].includes(currentUser.role);
  const formatPropertiesName = (ids, userId) => {
    const propertyNames = properties.filter(property => ids.includes(property.id)).map(property => property.name);
    const result = propertyNames.join(', ');
    return result.length > 30 ? (
      <span id={`properties-${userId}`}>
        {result.substring(0, 30)} ...
        <Tooltip placement="top" target={`properties-${userId}`}>
          {result}
        </Tooltip>
      </span>
    ) : result;
  };
  const caseInsensitiveCompare = (a, b) => a.toLowerCase().includes(b.toLowerCase());

  let filteredUsers = [];
  if (isPropertiesLoaded) {
    filteredUsers = users.filter(item => caseInsensitiveCompare(item.first_name, keyword)
      || caseInsensitiveCompare(item.last_name, keyword)
      || caseInsensitiveCompare(item.email, keyword)
      || caseInsensitiveCompare(`${item.first_name} ${item.last_name}`, keyword));
    if (propertyFilter) {
      filteredUsers = filteredUsers.filter(item => item.properties.includes(propertyFilter));
    } else {
      filteredUsers = filteredUsers.filter(item => (showActivated !== 'ALL' ? item.status === showActivated : true));
    }
    filteredUsers = filteredUsers.map(item => ({ ...item, fullName: `${item.first_name} ${item.last_name}` }));
  }

  const columns = [
    {
      dataField: 'nameLogo',
      text: '',
      formatter: (value, item) => (
        item.avatar ? (
          <img src={item.avatar} alt="customer logo" style={{ width: '38px', height: '38px', borderRadius: '5px' }} />
        ) :
          (
            <Avatar style={{ backgroundColor: getColorFromString(item.last_name) }}>
              <span>{`${item.first_name[0]}${item.last_name[0]}`}</span>
            </Avatar>
          )
      ),
    },
    {
      dataField: 'fullName',
      text: 'Name of User',
      sort: true,
      formatter: value => <PropertyName>{value}</PropertyName>,
    },
    {
      dataField: 'email',
      text: 'Email',
      sort: true,
    },
    {
      dataField: 'properties',
      text: 'Properties',
      sort: true,
      formatter: (cell, value) => (cell ? formatPropertiesName(cell, value.id) : ''),
    },
    {
      dataField: 'login_count',
      text: 'Login Count',
      sort: true,
      formatter: value => <div className="text-right">{value}</div>,
    },
    {
      dataField: 'last_login',
      text: 'Last login',
      sort: true,
      formatter: cell => (cell ? moment(cell).format('MMM Do YYYY') : ''),
    },
    {
      dataField: 'created',
      text: 'Signup date',
      sort: true,
      formatter: value => moment(value).format('MMM Do YYYY'),
    },
    {
      dataField: 'role',
      text: 'Role',
      sort: true,
      formatter: value => <span className="text-capitalize">{roleChoices[value]}</span>,
    },
    {
      dataField: 'status',
      text: 'Status',
      sort: true,
      formatter: (value, raw) => (
        <FormSwitcher inactive={value === 'INACTIVE'} disabled={raw.role === roleTypes.LIFT_LYTICS_ADMIN} onClick={e => updateUserStatus(e, raw)} />
      ),
    },
    {
      dataField: 'hidden',
      text: '',
      hidden: true,
    },
    {
      dataField: 'id',
      text: '',
      formatter: (value, raw) => (
        <div className="d-flex float-right">
          <IconAction>
            <i
              className="ri-pencil-line"
              id={`edit-${raw.id}`}
              onClick={(e) => {
                stopAction(e);
                setUser(raw);
                setEditStep(1);
                setShowUserModal(true);
              }}
            />
            <UncontrolledTooltip placement="top" target={`edit-${raw.id}`}>
              Edit user
            </UncontrolledTooltip>
          </IconAction>
          <IconAction disabled={[roleTypes.LIFT_LYTICS_ADMIN, roleTypes.CUSTOMER_ADMIN].includes(raw.role)}>
            <i
              className="ri-shield-user-line"
              id={`edit-access-${raw.id}`}
              onClick={(e) => {
                stopAction(e);
                if (![roleTypes.LIFT_LYTICS_ADMIN, roleTypes.CUSTOMER_ADMIN].includes(raw.role)) {
                  setUser(raw);
                  setEditStep(2);
                  setShowUserModal(true);
                }
              }}
            />
            <UncontrolledTooltip placement="top" target={`edit-access-${raw.id}`}>
              Edit access rights
            </UncontrolledTooltip>
          </IconAction>
          <IconAction disabled={raw.id === currentUser.id}>
            <i
              className="ri-delete-bin-5-line"
              id={`delete-${raw.id}`}
              onClick={(e) => {
                if (raw.id !== currentUser.id) {
                  stopAction(e);
                  setUser(raw);
                  setShowConfirmModal(true);
                }
              }}
            />
            <UncontrolledTooltip placement="top" target={`delete-${raw.id}`}>
              Delete user
            </UncontrolledTooltip>
          </IconAction>
        </div>
      ),
    },
  ];
  if (isGenericAdmin) {
    columns.splice(8, 0, {
      dataField: 'customer_name',
      text: 'Customer',
      sort: true,
    });
  }

  let deleteUserContent = null;
  let disableDeleteButton = false;
  if (showConfirmModal && user.role === roleTypes.CUSTOMER_ADMIN && user.is_super_customer) {
    const customer = customers.find(i => i.id === user.customer);
    if (customer && customer.admins.length > 1) {
      disableDeleteButton = !customerAgentId;
      deleteUserContent = (
        <div>
          Please choose the customer super admin account.
          {customer.admins.filter(i => !i.is_super_customer).map((i, index) => (
            <div>
              <CustomInput
                type="radio"
                id={`customer-${index}`}
                label={`${i.first_name} ${i.last_name}`}
                checked={customerAgentId === i.id}
                onChange={({ target: { checked } }) => { if (checked) setCustomerAgentId(i.id); }}
              />
            </div>
          ))}
        </div>
      );
    }
  }

  const isLoaded = isUsersLoaded && isClientsLoaded && isPropertiesLoaded;

  const content = (
    <section>
      {showConfirmModal && (
        <ConfirmActionModal
          text="Do you wish to delete user"
          content={deleteUserContent}
          itemName={`${user.first_name} ${user.last_name}`}
          onConfirm={handleDeleteUser}
          onClose={() => setShowConfirmModal(false)}
          show={showConfirmModal}
          title="Confirm Delete"
          disabled={disableDeleteButton}
        />
      )}
      {showUserModal && (
        <UserModal
          title={user.id ? 'Edit User' : 'Add New User'}
          reload={handleReloadUsers}
          user={user}
          show={showUserModal}
          onClose={() => setShowUserModal(false)}
          editStep={editStep}
        />
      )}
      <ToolkitProvider
        keyField="id"
        data={isLoaded ? filteredUsers : defaultTableData()}
        columns={isLoaded ? columns : defaultTableColumns()}
      >
        {
          ({ baseProps }) => (
            <ScrollContainer vertical={false} hideScrollbars={false} className="scroll-container">
              <BootstrapTable
                bordered={false}
                noDataIndication={indication}
                pagination={paginationFactory({
                  sizePerPageList: [
                    {
                      text: '13', value: 13,
                    },
                  ],
                  showTotal: true,
                })}
                {...baseProps}
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
        <title>DWELL | Users</title>
      </Helmet>
      <ContentHeader>
        {renderNavLinks()}
        <div className="d-flex">
          <div className="position-relative mr-10">
            <SearchIcon />
            <FormSearch
              name="search"
              value={keyword}
              onChange={({ target: { value } }) => setKeyword(value)}
              placeholder="Search users"
            />
          </div>
          <Button
            color="primary"
            onClick={() => {
              setUser({});
              setEditStep(null);
              setShowUserModal(true);
            }}
          >
            <i className="ri-add-circle-fill" />
            New User
          </Button>
        </div>
      </ContentHeader>
      <Row>
        <Col xs="12">
          <TableUser>
            {content}
          </TableUser>
        </Col>
      </Row>
    </ContentBodySite>
  );
};

const mapStateToProps = state => ({
  isUsersLoaded: state.user.isUsersLoaded,
  isClientsLoaded: state.client.isClientsLoaded,
  isPropertiesLoaded: state.property.isPropertyDataLoaded,
  users: state.user.users,
  clients: state.client.clients,
  customers: state.customer.customers,
  currentProperty: state.property.property,
  currentUser: state.user.currentUser,
});

export default connect(
  mapStateToProps,
  {
    ...actions.client,
    ...dwellActions.user,
    ...actions.customer,
  },
)(withRouter(Users));
