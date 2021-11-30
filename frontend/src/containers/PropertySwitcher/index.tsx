/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/heading-has-content */
import React, { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { map } from 'lodash';
import { Input } from 'reactstrap';
import { Search } from 'react-feather';
import actions from 'dwell/actions/index';
import actionsSite from 'site/actions';
import { getPropertyId } from 'src/utils';
import { RECENT_PROPERTY_HYPHENS } from 'dwell/constants';
import { roleTypes } from 'site/constants';
import { CustomerProps } from 'src/interfaces';
import { PropertiesList, BackDrop, PropertyItem, PropertyItemBody, PropertyItemLink,
  PropertyItemLogo, PropertyItemLogoImg, PropertyMenu, PropertyMenuHeader, PropertyMenuSearch,
  ProspectItems, PropertyDefaultLogoIcon, PropertyActiveBody, PropertyCustomer, CustomerName, CustomerSwitch, PropertyActiveName,
  PropertyLinkTooltip, PropertyTown, PropertySwitchLabel, PropertyMenuGroup, MenuBack, CancelButton } from './styles';

interface Property {
  external_id: string,
  logo: string,
  is_email_blast_disabled: boolean,
  has_scored_calls_today: boolean,
  not_scored_calls_count: number,
  unread_count: number,
  id: number,
  name: string,
  domain: string,
  town: string,
  customer_name: string,
}

interface PropertySwitcher extends RouteComponentProps {
  getProperties: (data: { show_all: boolean }) => void,
  getNotifications: () => void,
  property: Property,
  propertiesData: Property[],
  currentUser: { is_call_scorer: boolean, last_login_property: number, role: string },
  show: boolean,
  propertySwitcherToggle: (updateToggle: boolean) => Promise<void>,
  getCustomers: (data: { show_all: boolean }) => null,
  customers: CustomerProps[],
}

const PropertySwitcher: FC<PropertySwitcher> = ({ getProperties, getNotifications, propertiesData,
  currentUser: { is_call_scorer: isCallScorer, role: userRole }, getCustomers, customers,
  property: currentProperty = {}, show, propertySwitcherToggle }) => {
  const [keyword, updateKeyword] = useState('');
  const [keywordCustomer, updateCustomerKeyword] = useState('');
  const [isScored, setIsScored] = useState({});
  const [switcherStep, setStep] = useState(0);
  const [customerProperties, updateProperties] = useState([]);

  const isLLAdmin = userRole === roleTypes.LIFT_LYTICS_ADMIN;

  useEffect(() => {
    getProperties({ show_all: true });
    getNotifications();
  }, []);

  useEffect(() => {
    if (isLLAdmin) {
      getCustomers({ show_all: true });
    }
  }, [userRole]);

  const onPropertyClick = (event, siteId, id = 0) => {
    event.preventDefault();
    if (event.target.tagName.toLowerCase() === 'label') {
      const checkbox = event.target.parentElement.firstChild;
      if (!checkbox.disabled) {
        setIsScored({ ...isScored, [id]: !checkbox.checked });
      }
    } else {
      localStorage.setItem(RECENT_PROPERTY_HYPHENS, siteId);
      window.location.href = `/${siteId}/leads`;
    }
  };

  const handleClose = () => {
    propertySwitcherToggle(false);
    setStep(0);
    updateKeyword('');
    updateCustomerKeyword('');
  };

  const siteId = getPropertyId() || currentProperty.external_id;

  const renderPropertyList = data => (
    <PropertiesList>
      <ProspectItems>
        {map(data, (property, key) => (
          <PropertyItem key={key} onClick={event => onPropertyClick(event, property.external_id, property.id)}>
            <PropertyItemLogo isCallScorer={isCallScorer}>
              {property && property.logo ? (
                <PropertyItemLogoImg src={property.logo} alt="PLogo" />
              ) : (
                <PropertyDefaultLogoIcon className="ri-home-smile-line" />
              )}
              {!isCallScorer && !!property.unread_count && <span className="badge badge-danger">{property.unread_count > 99 ? '99+' : property.unread_count}</span>}
            </PropertyItemLogo>
            <PropertyItemBody>
              <h6>{property.name}</h6>
              <p>{property.town}</p>
            </PropertyItemBody>
            <PropertyItemLink id={`site-${key}`} href={`http://${property.domain}`} target="_blank" onClick={e => e.stopPropagation()}>
              <i className="ri-external-link-line" />
            </PropertyItemLink>
            <PropertyLinkTooltip placement="top" target={`site-${key}`}>
              Visit Site
            </PropertyLinkTooltip>
          </PropertyItem>
        ))}
      </ProspectItems>
    </PropertiesList>
  );

  const property = propertiesData.find(prop => prop.external_id === siteId);

  const switchProperty = () => {
    let filteredData = propertiesData || [];

    filteredData = filteredData.filter(item => item.external_id !== siteId && item.name.toLowerCase().includes(keyword.toLowerCase()));

    return (
      <React.Fragment>
        <PropertyMenuHeader>
          <PropertyActiveBody>
            <PropertyCustomer>
              <CustomerName>{currentProperty.customer_name}</CustomerName>
              {isLLAdmin && <CustomerSwitch onClick={() => setStep(1)}>Switch Customer</CustomerSwitch>}
            </PropertyCustomer>
            {property &&
              <React.Fragment>
                <PropertyActiveName>
                  <span>{property.name}</span>
                  <PropertyItemLink id="currentProperty" href={`http://${property.domain}`} target="_blank" onClick={e => e.stopPropagation()}>
                    <i className="ri-external-link-line" />
                  </PropertyItemLink>
                  <PropertyLinkTooltip placement="top" target="currentProperty">
                    Visit Site
                  </PropertyLinkTooltip>
                </PropertyActiveName>
                <PropertyTown>{property.town}</PropertyTown>
              </React.Fragment>
            }
          </PropertyActiveBody>
        </PropertyMenuHeader>
        <PropertySwitchLabel>Switch property</PropertySwitchLabel>
        <PropertyMenuSearch>
          <div className="position-relative">
            <Search className="search-logo" />
            <Input
              name="search"
              value={keyword}
              onChange={e => updateKeyword(e.target.value)}
              placeholder="Search property"
            />
          </div>
        </PropertyMenuSearch>
        {renderPropertyList(filteredData)}
      </React.Fragment>
    );
  };

  const selectCustomerProperty = (propertyList) => {
    updateProperties(propertyList);
    setStep(2);
    updateKeyword('');
  };

  const switchCustomer = () => {
    const filteredCustomers = customers.filter(item => item.customer_name.toLowerCase().includes(keywordCustomer.toLowerCase()));

    return (
      <React.Fragment>
        <PropertyMenuHeader className="justify-content-between">
          <MenuBack onClick={() => setStep(0)}>
            <i className="ri-arrow-left-line" />
            Back
          </MenuBack>
          <CancelButton onClick={handleClose}>Cancel</CancelButton>
        </PropertyMenuHeader>
        <PropertySwitchLabel>Switch customer</PropertySwitchLabel>
        <PropertyMenuSearch>
          <div className="position-relative">
            <Search className="search-logo" />
            <Input
              name="search"
              value={keywordCustomer}
              onChange={e => updateCustomerKeyword(e.target.value)}
              placeholder="Search customer"
            />
          </div>
        </PropertyMenuSearch>
        <PropertiesList>
          <ProspectItems>
            {filteredCustomers.map((customer, key) => (
              <PropertyItem key={key} onClick={() => selectCustomerProperty(customer.properties)}>
                <PropertyItemLogo>
                  <PropertyDefaultLogoIcon className="ri-home-smile-line" />
                </PropertyItemLogo>
                <PropertyItemBody>
                  <h6>{customer.customer_name}</h6>
                  <p>{customer.active_properties} Properties</p>
                </PropertyItemBody>
              </PropertyItem>
            ))}
          </ProspectItems>
        </PropertiesList>)
      </React.Fragment>
    );
  };

  const switchPropertyByCustomer = () => {
    const filteredProperty = propertiesData.filter(item => item.external_id !== siteId && customerProperties.includes(item.id) && item.name.toLowerCase().includes(keyword.toLowerCase()));

    return (
      <React.Fragment>
        <PropertyMenuHeader className="justify-content-between">
          <MenuBack onClick={() => setStep(1)}>
            <i className="ri-arrow-left-line" />
            Back
          </MenuBack>
          <CancelButton onClick={handleClose}>Cancel</CancelButton>
        </PropertyMenuHeader>
        <PropertySwitchLabel>Switch property</PropertySwitchLabel>
        <PropertyMenuSearch>
          <div className="position-relative">
            <Search className="search-logo" />
            <Input
              name="search"
              value={keyword}
              onChange={e => updateKeyword(e.target.value)}
              placeholder="Search property"
            />
          </div>
        </PropertyMenuSearch>
        {renderPropertyList(filteredProperty)}
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <PropertyMenu show={show}>
        <PropertyMenuGroup step={-switcherStep}>{switchProperty()}</PropertyMenuGroup>
        {isLLAdmin &&
          <React.Fragment>
            <PropertyMenuGroup step={1 - switcherStep}>{switchCustomer()}</PropertyMenuGroup>
            <PropertyMenuGroup step={2 - switcherStep}>{switchPropertyByCustomer()}</PropertyMenuGroup>
          </React.Fragment>
        }
      </PropertyMenu>
      <BackDrop show={show} onClick={handleClose} />
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  propertiesData: state.property.properties,
  currentUser: state.user.currentUser,
  property: state.property.property,
  customers: state.customer.customers,
});

export default connect(
  mapStateToProps,
  {
    ...actions.property,
    ...actions.notification,
    ...actions.user,
    ...actionsSite.customer,
  },
)(withRouter(PropertySwitcher));
