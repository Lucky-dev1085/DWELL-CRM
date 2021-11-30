import React, { FC, useEffect, useState } from 'react';
import actions from 'dwell/actions';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import {
  ActiveChatContainer,
  ActiveChatWrapper,
} from 'dwell/views/chat/multi_chat/styles';
import 'src/scss/pages/_schedule_form.scss';
import ChatHeader from './_header';
import SMSChatBody from '../../common/_smsChatBody';
import ProspectChatBody from '../../common/_prospectChatBody';

interface Prospect {
  id: number,
  name: string,
  last_visit_page_name: string,
  is_online: boolean,
  unread_count: number,
  lead: number,
  is_mute: boolean,
  property: number,
  active_agent: number,
  joined_agents: number[],
  isSMS: false,
}

interface ActiveChatPanelProps {
  contactId: number,
  isSMS: boolean,
  contacts: Prospect[],
  removeFromActiveChats: (contact: { id: number, isSMS: boolean }) => void,
  activeProperties: number[],
  type: string,
  isFirstChatRemove: boolean,
  handleFirstChatRemove: () => void,
}

const Index: FC<ActiveChatPanelProps> = ({ contactId, isSMS, contacts, removeFromActiveChats, activeProperties, isFirstChatRemove, handleFirstChatRemove }) => {
  const [contact, setContact] = useState({} as Prospect);

  useEffect(() => {
    const filtered = contacts.filter(p => activeProperties.includes(p.property));
    // setFilteredProspects(filtered);
    const currentContact = filtered.find(p => p.id === contactId && p.isSMS === isSMS);
    if (!isEmpty(currentContact)) {
      setContact(currentContact);
    } else {
      removeFromActiveChats({ id: contactId, isSMS });
    }
  }, [contactId, contacts]);

  return (
    <React.Fragment>
      {!isEmpty(contact) && (
        <ActiveChatWrapper isSMS={contact.isSMS} firstRemove={isFirstChatRemove}>
          <ActiveChatContainer>
            <ChatHeader contact={contact} handleFirstChatRemove={handleFirstChatRemove} />
            {isSMS ? <SMSChatBody contact={contact} /> : <ProspectChatBody prospect={contact} />}
          </ActiveChatContainer>
        </ActiveChatWrapper>)}
    </React.Fragment>);
};

const mapStateToProps = state => ({
  contacts: state.prospectChat.prospects.filter(p => p.should_display_in_chat).map(p => ({ ...p, isSMS: false })).concat(state.smsMessage.contacts.map(p => ({ ...p, isSMS: true }))),
  activeProperties: state.prospectChat.activeProperties,
});

export default connect(
  mapStateToProps,
  {
    ...actions.prospectChat,
  },
)(Index);
