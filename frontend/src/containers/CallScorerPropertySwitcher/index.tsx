/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/heading-has-content */
import React, { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { map, isEmpty } from 'lodash';
import { Input, UncontrolledTooltip } from 'reactstrap';
import { toast, ToastOptions } from 'react-toastify';
import { Search, PhoneMissed } from 'react-feather';
import actions from 'dwell/actions/index';
import { getPropertyId } from 'src/utils';
import { PrimaryButton } from 'styles/common';
import { RECENT_PROPERTY_HYPHENS } from 'dwell/constants';
import { toastOptions } from 'site/constants';
import { PropertyProps, CallRescoresMeta } from 'src/interfaces';
import { PropertiesList, BackDrop, PropertyItem, PropertyItemBody, PropertyItemLink,
  PropertyItemLogo, PropertyItemLogoImg, PropertyMenu, PropertyMenuBody, PropertyMenuHeader, PropertyMenuSearch,
  ProspectItems, PropertyDefaultLogoIcon } from './styles';

interface PropertySwitcher {
  getProperties: (data: { show_all: boolean }) => void,
  currentUser: {
    is_chat_reviewer: boolean,
  },
  getCallRescoresMeta: () => void,
  property: PropertyProps,
  properties: PropertyProps[],
  clearAllPropertiesScored: () => void,
  allPropertiesScored: boolean,
  show: boolean,
  propertySwitcherToggle: (updateToggle: boolean) => void,
  submitCallsScoreState: () => Promise<null>,
  callRescoresMeta: CallRescoresMeta,
}

const PropertySwitcher: FC<PropertySwitcher> = ({ currentUser, getProperties, properties, allPropertiesScored, getCallRescoresMeta,
  clearAllPropertiesScored, property: currentProperty = {}, show, propertySwitcherToggle, submitCallsScoreState, callRescoresMeta }) => {
  const [keyword, updateKeyword] = useState('');

  const callRescoreItem = {
    external_id: 'call-rescores',
    name: 'Call Rescores',
    not_scored_calls_count: callRescoresMeta.required_call_rescores_count,
    has_scored_calls_today: callRescoresMeta.has_scored_calls_today,
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const propertiesData = [callRescoreItem].concat(properties);

  useEffect(() => {
    getProperties({ show_all: true });
    getCallRescoresMeta();
  }, []);

  useEffect(() => {
    if (allPropertiesScored) {
      toast.success('All properties scored', toastOptions as ToastOptions);
    }
    return () => {
      clearAllPropertiesScored();
    };
  }, [allPropertiesScored]);

  const onPropertyClick = (event, siteId) => {
    event.preventDefault();
    localStorage.setItem(RECENT_PROPERTY_HYPHENS, siteId);
    window.location.href = `/${siteId}/${(currentUser.is_chat_reviewer && siteId !== callRescoreItem.external_id) ? 'chats' : 'calls'}`;
  };

  const updateScoreState = () => {
    submitCallsScoreState().then(() => {
      toast.success('Call scoring state is submitted.', toastOptions as ToastOptions);
    });
  };

  const renderPropertyItem = (property, key, disabledProperty = false) => (
    <PropertyItem key={key} onClick={event => onPropertyClick(event, property.external_id)} disabledProperty={disabledProperty}>
      {property.external_id === 'call-rescores' ? (
        <PropertyItemLogo isCallScorer>
          <PhoneMissed />
        </PropertyItemLogo>
      ) : (
        <PropertyItemLogo isCallScorer>
          {property && property.logo ? (
            <PropertyItemLogoImg src={property.logo} alt="PLogo" />
          ) : (
            <PropertyDefaultLogoIcon className="ri-home-smile-line" />
          )}
          {!!property.not_scored_calls_count && <span className="badge badge-danger">{property.not_scored_calls_count}</span>}
        </PropertyItemLogo>
      )}
      <PropertyItemBody>
        <h6>{property.name}</h6>
        <p>{property.town}</p>
      </PropertyItemBody>
      <PropertyItemLink id={`site-${key}`} href={`http://${property.domain}`} target="_blank" onClick={e => e.stopPropagation()}>
        <i className="ri-external-link-line" />
      </PropertyItemLink>
      <UncontrolledTooltip placement="top" target={`site-${key}`}>
        Visit Site
      </UncontrolledTooltip>
    </PropertyItem>
  );

  let content = null;
  const siteId = getPropertyId() || currentProperty.external_id;

  if (!isEmpty(propertiesData)) {
    const unfocusedProperties = propertiesData.filter(item => item.external_id !== siteId && item.name.toLowerCase().includes(keyword.toLowerCase()));
    const notScoredProperties = unfocusedProperties.filter(p => !p.has_scored_calls_today && p.not_scored_calls_count > 0);
    const scoredProperties = unfocusedProperties.filter(p => p.has_scored_calls_today);
    const disabledProperties = unfocusedProperties.filter(p => !p.has_scored_calls_today && !p.not_scored_calls_count);

    content = (
      <PropertiesList>
        <ProspectItems>
          {map(notScoredProperties, (property, key) => renderPropertyItem(property, key))}
          <div className="text-center" style={{ padding: 20, width: '100%' }}>
            <PrimaryButton className="d-flex justify-content-center" color="primary" style={{ width: '100%' }} onClick={updateScoreState}>
              Submit
            </PrimaryButton>
          </div>
          {map(scoredProperties, (property, key) => renderPropertyItem(property, key))}
          {map(disabledProperties, (property, key) => renderPropertyItem(property, key, !property.not_scored_calls_count))}
        </ProspectItems>
      </PropertiesList>);
  }

  return (
    <React.Fragment>
      <PropertyMenu show={show}>
        <PropertyMenuHeader>
          <div className="d-flex justify-content-between">
            <h5>Properties</h5>
          </div>
          <span>Switch access to other properties associated with this account.</span>
        </PropertyMenuHeader>
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
        <PropertyMenuBody>
          {currentProperty && (
            <PropertyItem className="active">
              <PropertyItemLogo className="property-item-logo" isCallScorer>
                {currentProperty.logo ? (
                  <PropertyItemLogoImg src={currentProperty.logo} alt="PLogo" />
                ) : (
                  <PropertyDefaultLogoIcon className="ri-home-smile-line" />
                )}
              </PropertyItemLogo>
              <PropertyItemBody>
                <h6>{currentProperty.name}</h6>
                <p>{currentProperty.town}</p>
              </PropertyItemBody>
              <PropertyItemLink id="currentProperty" href={`http://${currentProperty.domain}`} target="_blank" onClick={e => e.stopPropagation()}>
                <i className="ri-external-link-line" />
              </PropertyItemLink>
              <UncontrolledTooltip placement="top" target="currentProperty">
                Visit Site
              </UncontrolledTooltip>
            </PropertyItem>)
          }
          <label>Switch to</label>
          {content}
        </PropertyMenuBody>
      </PropertyMenu>
      <BackDrop show={show} onClick={() => propertySwitcherToggle(false)} />
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  properties: state.property.properties,
  currentUser: state.user.currentUser,
  allPropertiesScored: state.property.allPropertiesScored,
  property: state.property.property,
  callRescoresMeta: state.scoredCalls.callRescoresMeta,
});

export default connect(
  mapStateToProps,
  {
    ...actions.property,
    ...actions.scoredCalls,
    ...actions.user,
  },
)(PropertySwitcher);
