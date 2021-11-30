import React, { FC, useEffect } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import actions from 'dwell/actions';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { ChatContent } from './styles';
import ChatSidebar from './_sidebar';
import ChatContainer from './_container';

interface MultiChatProps extends RouteComponentProps {
  properties: { id: number }[],
  activeProperties: number[],
  property: { id: number },
  setActiveProperties: (ids?: number[]) => void,
  getAllProspects: (show_all: boolean, properties: number[]) => void,
  getSMSContacts: () => void,
  getLeadNames: () => void,
}

const MultiChat: FC<MultiChatProps> = ({ property, properties, activeProperties, setActiveProperties, getAllProspects, getSMSContacts, getLeadNames }) => {
  useEffect(() => {
    if (properties.length && !isEmpty(property) && !activeProperties.includes(property.id)) {
      setActiveProperties(activeProperties.concat([property.id]));
      getAllProspects(true, [property.id]);
      getSMSContacts();
      getLeadNames();
    }
  }, [properties, property]);

  return (
    <ChatContent>
      <ChatSidebar />
      <ChatContainer />
    </ChatContent>);
};

const mapStateToProps = state => ({
  properties: state.property.properties,
  property: state.property.property,
  activeProperties: state.prospectChat.activeProperties,
});

export default connect(
  mapStateToProps,
  {
    ...actions.lead,
    ...actions.prospectChat,
    ...actions.smsMessage,
  },
)(withRouter(MultiChat));
