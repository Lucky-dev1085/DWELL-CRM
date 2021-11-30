import React, { FC, useEffect } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import actions from 'dwell/actions';
import { isEmpty } from 'lodash';
import { PropertyProps } from 'src/interfaces';
import ChatNotifications from './_notifications';
import CircledChat from './circled';
import { ChatGroup } from './styles';
import ContactPanel from './contact';
import ChatWindow from './window';

interface ChatProps extends RouteComponentProps {
  property: PropertyProps,
  getAllProspects: (show_all: boolean, properties: number[]) => void,
  getSMSContacts: () => void,
  getLeadNames: () => void,
  activeChats: { id: number, type: string, circled: boolean, minimized: boolean }[],
}

const Chat: FC<ChatProps> = ({ property, getLeadNames, getAllProspects, getSMSContacts, activeChats }) => {
  useEffect(() => {
    if (!isEmpty(property)) {
      getAllProspects(true, [property.id]);
      getSMSContacts();
      getLeadNames();
    }
  }, [property]);

  return (
    <div id="single-chat">
      <CircledChat />
      <ChatGroup>
        <ContactPanel />
        {activeChats.filter(contact => !contact.circled).map(contact => contact && <ChatWindow key={contact.id} contactId={contact} minimized={contact.minimized} />)}
      </ChatGroup>
      {property.agent_chat_enabled && <ChatNotifications />}
    </div>);
};

const mapStateToProps = state => ({
  property: state.property.property,
  activeChats: state.prospectChat.activeChats,
});

export default connect(
  mapStateToProps,
  {
    ...actions.lead,
    ...actions.smsMessage,
    ...actions.prospectChat,
  },
)(withRouter(Chat));
