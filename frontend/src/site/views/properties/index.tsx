/* eslint-disable jsx-a11y/heading-has-content */
import { Row, Col, Button, UncontrolledTooltip } from 'reactstrap';
import React, { useState, useEffect, FC } from 'react';
import qs from 'query-string';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ScrollContainer from 'react-indiana-drag-scroll';
import { toast, ToastOptions } from 'react-toastify';
import { Helmet } from 'react-helmet';
import moment from 'moment';
import { ListResponse, SuccessResponse, DetailResponse } from 'src/interfaces';
import { roleTypes, toastOptions } from 'site/constants';
import dwellActions from 'dwell/actions';
import { paths } from 'dwell/constants';
import actions from 'site/actions';
import { ConfirmActionModal, PropertyModal, OnboardModal, Loader } from 'site/components';
import {
  ContentHeader, FormSwitcher, ContentBodySite, NavGroup, IconAction, MediaWrapper, Avatar, MediaBody, SearchIcon,
  PropertyName, FormSearch, NavLink, TextSmall, FlexEnd,
} from 'site/components/common';
import { getPropertyId } from 'src/utils';
import { TableProperty, PropertyDomain, PropertiesCount } from 'site/views/properties/styles';
import { defaultTableColumns, defaultTableData } from './utils';

const navLink = [
  { label: 'All Properties', name: 'ALL' },
  { label: 'Active', name: 'ACTIVE' },
  { label: 'Inactive', name: 'INACTIVE' },
];

interface Property {
  id?: number,
  name?: string,
  domain?: string,
  client?: string,
  city?: string,
  status?: string,
}

interface Properties extends RouteComponentProps {
  isClientsLoaded: boolean,
  isPropertyDataLoaded: boolean,
  getProperties: ({ show_all: boolean }) => Promise<ListResponse>,
  getClients: ({ show_all: boolean }) => Promise<ListResponse>,
  deleteProperty: (id: number, successCB: () => void) => Promise<SuccessResponse>,
  updateProperty: (id: number, data: { status: string }) => Promise<DetailResponse>,
  properties: Property[],
  currentUser: { role: string },
}

const Properties: FC<Properties> = ({ getProperties, isClientsLoaded, isPropertyDataLoaded, deleteProperty, getClients,
  properties, location, updateProperty, currentUser, history: { push } }) => {
  const [currentProperty, setCurrentProperty] = useState({} as Property);
  const [showPropertyModal, togglePropertyModal] = useState(false);
  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [showActivated, setShowActivated] = useState('ALL');
  const [showOnboardModal, toggleOnboardModal] = useState(false);
  const [keyword, setKeyword] = useState(qs.parse(location.search).keyword ? qs.parse(location.search).keyword : '');

  useEffect(() => {
    getProperties({ show_all: true });
    getClients({ show_all: true });
  }, []);

  const onSearch = ({ target: { value } }) => {
    setKeyword(value);
  };

  const onClickNewProperty = () => {
    setCurrentProperty({});
    toggleOnboardModal([roleTypes.LIFT_LYTICS_ADMIN, roleTypes.CUSTOMER_ADMIN].includes(currentUser.role));
  };

  const handleReloadProperties = () => {
    getProperties({ show_all: true });
    togglePropertyModal(false);
    setCurrentProperty({});
  };

  const redirectToUsers = (id) => {
    const pathname = paths.build(paths.client.MANAGE_USERS, getPropertyId());
    push({ pathname, state: { property: id } });
  };

  const successCB = () => {
    getProperties({ show_all: true });
    toggleConfirmModal(false);
    setCurrentProperty({});
  };

  const handleDeleteProperty = () => {
    deleteProperty(currentProperty.id, () => {
      toast.success('Property deleted', toastOptions as ToastOptions);
      successCB();
    });
  };

  const renderNavLinks = () => {
    const navLinkList = navLink.map((item, i) => (
      <NavLink key={i} active={showActivated === item.name} onClick={() => setShowActivated(item.name)}>
        <div style={{ marginBottom: '2px' }}>{item.label}</div>
        <TextSmall>{item.name === 'ALL' ? properties.length : properties.filter(el => el.status === item.name).length}</TextSmall>
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

  const updatePropertyStatus = (e, propertyData) => {
    stopAction(e);

    if (propertyData.id) {
      const newStatus = propertyData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      updateProperty(propertyData.id, { ...propertyData, status: newStatus })
        .then(() => {
          toast.success('Property status updated', toastOptions as ToastOptions);
        });
    }
  };

  const updateCurrentProperty = (e, property, isRemove = false) => {
    stopAction(e);
    if (isRemove) {
      toggleConfirmModal(true);
    } else {
      togglePropertyModal(true);
    }
    setCurrentProperty(property);
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
    if (!isPropertyDataLoaded || !isClientsLoaded) {
      return <Loader />;
    }
    return (
      <React.Fragment>
        <div className="text-center">
          <h4>Add properties</h4>
          <Button color="primary" className="mt-2">
            <i className="fa fa-user-plus mr-2" />Create New Property
          </Button>
        </div>
      </React.Fragment>);
  };

  const isGenericAdmin = [roleTypes.GENERIC_ADMIN, roleTypes.PROPERTY_ADMIN].includes(currentUser.role);
  const tableOptions = [
    {
      dataField: 'name',
      text: 'Property Name',
      sort: true,
      formatter: (value, property) => (
        <MediaWrapper>
          {property.logo ?
            <img src={property.logo} alt="customer logo" style={{ width: '36px', height: '36px', borderRadius: '5px' }} /> :
            <Avatar>
              <i className="ri-home-8-line" />
            </Avatar>
          }
          <MediaBody>
            <PropertyName>
              {property.name}
            </PropertyName>
            <PropertyDomain href={`http://${property.domain}`} target="_blank">{property.domain}</PropertyDomain>
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
      dataField: 'client',
      text: 'Client',
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
          <FormSwitcher inactive={value === 'INACTIVE'} disabled={isGenericAdmin} onClick={e => updatePropertyStatus(e, raw)} />
        </FlexEnd>
      ),
    },
    {
      dataField: 'active_users',
      text: 'Users',
      sort: true,
      formatter: (value, raw) => <PropertiesCount onClick={() => redirectToUsers(raw.id)}>{value}</PropertiesCount>,
    },
  ];
  if (!isGenericAdmin) {
    tableOptions.push({
      text: '',
      sort: false,
      dataField: 'id',
      formatter: (value, property) => (
        <div className="d-flex float-right">
          <IconAction>
            <i
              className="ri-pencil-line"
              id={`edit-${property.id}`}
              onClick={e => updateCurrentProperty(e, property)}
            />
            <UncontrolledTooltip placement="top" target={`edit-${property.id}`}>
              Edit Property
            </UncontrolledTooltip>
          </IconAction>
          <IconAction>
            <i
              className="ri-delete-bin-5-line"
              id={`delete-${property.id}`}
              onClick={e => updateCurrentProperty(e, property, true)}
            />
            <UncontrolledTooltip placement="top" target={`delete-${property.id}`}>
              Delete Property
            </UncontrolledTooltip>
          </IconAction>

        </div>
      ),
    });
  }

  const caseInsensitiveCompare = (a, b) => a.toLowerCase().includes(b.toLowerCase());
  const filteredProperties = properties.filter(item => (caseInsensitiveCompare(item.name, keyword)
    || caseInsensitiveCompare(item.domain, keyword)
    || caseInsensitiveCompare(item.client, keyword)
    || caseInsensitiveCompare(item.city, keyword)) && (showActivated !== 'ALL' ? item.status === showActivated : true));

  const content = (
    <section>
      {showPropertyModal && (
        <PropertyModal
          title={currentProperty.id ? 'Edit Property' : 'Create Property'}
          reload={handleReloadProperties}
          property={currentProperty}
          show={showPropertyModal}
          onClose={() => togglePropertyModal(false)}
        />
      )}
      {showOnboardModal && (
        <OnboardModal
          title="New Property Wizard"
          subTitle="Following these simple steps will walk you through the creation of a new property."
          reload={handleReloadProperties}
          client={currentProperty}
          show={showOnboardModal}
          onClose={() => toggleOnboardModal(false)}
          source="property"
        />
      )}
      <ConfirmActionModal
        title="Confirm Delete"
        text="Do you wish to delete property"
        itemName={currentProperty.name}
        onConfirm={handleDeleteProperty}
        onClose={() => toggleConfirmModal(false)}
        show={showConfirmModal}
      />
      <ToolkitProvider
        keyField="id"
        data={isPropertyDataLoaded && isClientsLoaded ? filteredProperties : defaultTableData()}
        columns={isPropertyDataLoaded && isClientsLoaded ? tableOptions : defaultTableColumns()}
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
        <title>DWELL | Properties</title>
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
              placeholder="Search properties"
            />
          </div>
          {!isGenericAdmin && (
            <Button
              color="primary"
              onClick={onClickNewProperty}
            >
              <i className="ri-add-circle-fill" />
              New property
            </Button>)
          }
        </div>
      </ContentHeader>
      <Row>
        <Col xs="12">
          <TableProperty>
            {content}
          </TableProperty>
        </Col>
      </Row>
    </ContentBodySite>
  );
};

const mapStateToProps = state => ({
  isSubmitting: state.property.isSubmitting,
  properties: state.property.properties,
  isClientsLoaded: state.client.isClientsLoaded,
  clients: state.client.clients,
  isPropertyDataLoaded: state.property.isPropertyDataLoaded,
  currentUser: state.user.currentUser,
});

export default connect(
  mapStateToProps,
  {
    ...dwellActions.property,
    ...actions.client,
    ...actions.pageData,
  },
)(withRouter(Properties));
