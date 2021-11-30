import React, { FC, useEffect, useRef, useState } from 'react';
import actions from 'dwell/actions';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import moment from 'moment';
import cn from 'classnames';
import { useInterval } from 'dwell/components';
import newMessageSound from 'src/assets/audio/new-chat-message.mp3';
import newAgentRequestSound from 'src/assets/audio/agent-transfer.mp3';
import {
  getAvatarColor,
  getNoContentText,
  getInitials,
  isSameContact,
  isMostRecentTab,
} from 'dwell/views/chat/common/utils';
import { Avatar } from 'styles/common';
import {
  ChatItem,
  ChatItemBody,
  ChatItemLabel,
  ChatItemTime,
  ChatItemTitle,
  ChatItemTitleWrapper,
  ChatLastMessage, ChatsItems,
  ChatsListBody,
  ChatSpinner,
  ChatSpinnerInner,
  ChatSpinnerWrapper,
  NotificationBadge,
  EmptyContent,
} from './styles';

const NewMessageSoundPlayer = new Audio(newMessageSound);
const newAgentRequestSoundPlayer = new Audio(newAgentRequestSound);

interface AgentRequest {
  is_active: boolean,
  created: string,
  prospect: number,
  is_declined: boolean,
  id: number
}

interface ChatsListProps {
  mainMenuItem: string,
  otherMenuItem: string,
  contacts: {
    is_archived: boolean,
    is_online: boolean,
    name: string,
    last_message_date: string,
    unread_count: number,
    id: number,
    joined_agents: number[],
    is_chat_open: boolean,
    last_prospect_message_date: string,
    property: number,
    active_agent: number,
  }[],
  searchKeyword: string,
  currentUser: { id: number, is_available: boolean },
  activeChats: { id: number, isSMS: boolean }[],
  setChatAsActive: (contact: { id: number, isSMS: boolean }) => void,
  isProspectsLoading: boolean,
  isProspectsLoaded: boolean,
  isContactsLoaded: boolean,
  setProspectsOffline: (ids: number[]) => void,
  activeProperties: number[],
  newMessage: { prospect: number, type: string },
  newAgentRequest: boolean,
  availableAgentsCount: number,
  clearNewMessageAlert: () => void,
  clearAgentRequestAlert: () => void,
  prospectsRequestedAgents: AgentRequest[],
  currentTab: string,
}

const Contacts: FC<ChatsListProps> = ({ mainMenuItem, otherMenuItem, contacts, searchKeyword, currentUser, activeChats,
  setChatAsActive, isProspectsLoading, setProspectsOffline, activeProperties, isProspectsLoaded, isContactsLoaded,
  newMessage, prospectsRequestedAgents, currentTab }) => {
  const [blinkingContacts, setBlinkingContacts] = useState([]);

  const playAgentRequestSoundInterval = useRef(null);

  const clearIntervals = () => {
    if (playAgentRequestSoundInterval.current) {
      clearInterval(playAgentRequestSoundInterval.current);
      playAgentRequestSoundInterval.current = null;
    }
    setBlinkingContacts([]);
  };

  const blinkTabMessage = () => {
    document.title = 'Prospect says...';
    setTimeout(() => {
      document.title = 'CRM';
    }, 3000);
  };

  useEffect(() => {
    const isActiveRequests = prospectsRequestedAgents.some(request => request.is_active && !request.is_declined);
    if (isActiveRequests) {
      if (isMostRecentTab(currentTab)) {
        playAgentRequestSoundInterval.current = setInterval(() => {
          newAgentRequestSoundPlayer.play();
        }, 1000);
      }
      setBlinkingContacts([...prospectsRequestedAgents.filter(request => request.is_active && !request.is_declined)
        .map(r => ({ id: r.prospect, isSMS: false })).slice()]);
      setTimeout(() => {
        clearIntervals();
      }, 30000);
    } else {
      clearIntervals();
    }
  }, [prospectsRequestedAgents]);

  const filterProspects = (filtered) => {
    const prospectContacts = filtered.filter(contact => !contact.isSMS);
    if (otherMenuItem) {
      if (otherMenuItem === 'All Prospects') {
        return prospectContacts.filter(contact => !contact.is_archived);
      } else if (otherMenuItem === 'Archive Prospects') {
        return prospectContacts.filter(contact => contact.is_archived);
      } else if (otherMenuItem === 'SMS') {
        return filtered.filter(contact => contact.isSMS);
      } return [];
    }
    if (mainMenuItem === 'ACTIVE') {
      return prospectContacts.filter(contact => contact.is_online && !contact.is_archived);
    } else if (mainMenuItem === 'MY') {
      return prospectContacts.filter(contact => contact.joined_agents.includes(currentUser.id) && !contact.is_archived);
    } return [];
  };

  const filtered = contacts.filter(p => activeProperties.includes(p.property));
  const filteredContacts = filterProspects(filtered).filter(prospect => prospect.name.toLowerCase().includes(searchKeyword.toLowerCase()));

  useInterval(() => {
    blinkTabMessage();
  }, currentUser.is_available &&
      filteredContacts.some(prospect => prospect.active_agent === currentUser.id && prospect.unread_count > 0) ? 6000 : null);

  useEffect(() => {
    if (currentUser.is_available) {
      if (!isEmpty(newMessage)) {
        const prospect = filteredContacts.find(p => p.id === newMessage.prospect);
        if (prospect && prospect.active_agent === currentUser.id) {
          if (isMostRecentTab(currentTab)) NewMessageSoundPlayer.play();
          blinkTabMessage();
        }
      }
    }
  }, [newMessage]);

  const checkOfflineProspects = () => {
    const prospectIds = contacts
      .filter(prospect => prospect.is_online &&
          moment().diff(moment(prospect.last_prospect_message_date), 'minutes') > 5)
      .map(prospect => prospect.id);
    if (prospectIds.length > 0) {
      setProspectsOffline(prospectIds);
    }
  };

  useInterval(() => {
    checkOfflineProspects();
  }, 60000);

  const emptyContent = (
    <EmptyContent>
      <i className="ri-chat-1-line" />
      <h5><span>{searchKeyword ? 'No Chats Found' : getNoContentText(otherMenuItem || mainMenuItem).label}</span></h5>
      <p>{searchKeyword ? 'Try adjusting your search to find what you’re looking for.' : getNoContentText(otherMenuItem || mainMenuItem).text}</p>
    </EmptyContent>
  );

  let content = null;
  if (!isEmpty(filteredContacts)) {
    const sortedContacts = filteredContacts.sort((a, b) => (new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime()));

    content = sortedContacts.map((contact, index, array) => {
      const previousProspect = index > 0 ? array[index - 1] : null;
      const drawDayDivider = contact.last_message_date &&
          ((previousProspect && moment(previousProspect.last_message_date).format('YYYY-MM-DD')
              !== moment(contact.last_message_date).format('YYYY-MM-DD')) ||
              (!previousProspect && moment.utc().format('YYYY-MM-DD')));
      const contactMessage = isSameContact(blinkingContacts, contact.id, contact.isSMS) ? 'Prospect requesting live agent' :
        (contact.last_message || '').replace(/<br\s*\/?>/gi, ' ').replace(/\s\s+/g, ' ');
      const avatarClass = cn(`avatar mr-2 ${getAvatarColor(contact.name, contact.id, contact.isSMS)}`, { offline: !contact.is_online, online: contact.is_online });
      return (
        <React.Fragment key={index}>
          {drawDayDivider && <ChatItemLabel>{moment(contact.last_message_date).format('dddd, MMM D, YYYY')}</ChatItemLabel>}
          <ChatItem
            isActive={isSameContact(activeChats, contact.id, contact.isSMS)}
            onClick={() => setChatAsActive({ id: contact.id, isSMS: contact.isSMS })}
            isBlinking={isSameContact(blinkingContacts, contact.id, contact.isSMS)}
          >
            <Avatar className={avatarClass} hideOnlineIcon={contact.isSMS}>
              {getInitials(contact.name)}
            </Avatar>
            <ChatItemBody hasHistory={!!contact.last_message}>
              <ChatItemTitleWrapper>
                <ChatItemTitle>{contact.name}</ChatItemTitle>
                <ChatItemTime>
                  {!contact.isSMS && contact.is_mute ? <span className="mute-indicator mr-2"><i className="ri-notification-off-fill" /></span> : null}
                  {contact.last_message_date && moment(contact.last_message_date).format('hh:mma')}
                </ChatItemTime>
              </ChatItemTitleWrapper>
              <ChatLastMessage dangerouslySetInnerHTML={{ __html: contactMessage }} />
              {(contact.unread_count > 0 && (contact.active_agent === currentUser.id || contact.isSMS)) &&
                  <NotificationBadge>{contact.unread_count > 9 ? '9+' : contact.unread_count}</NotificationBadge>}
            </ChatItemBody>
          </ChatItem>
        </React.Fragment>);
    });
  }
  if (!filteredContacts.length) content = emptyContent;

  return (
    <ChatsListBody>
      {isProspectsLoading ? (
        <ChatSpinnerWrapper>
          <ChatSpinner>
            <ChatSpinnerInner>Loading...</ChatSpinnerInner>
          </ChatSpinner>
        </ChatSpinnerWrapper>) : (
        <ChatsItems>
          {(otherMenuItem === 'SMS' ? isContactsLoaded : isProspectsLoaded) && content}
        </ChatsItems>)}
    </ChatsListBody>);
};

const mapStateToProps = state => ({
  contacts: state.prospectChat.prospects.filter(p => p.should_display_in_chat).map(p => ({ ...p, isSMS: false })).concat(state.smsMessage.contacts.map(p => ({ ...p, isSMS: true }))),
  currentUser: state.user.currentUser,
  activeChats: state.prospectChat.activeChats,
  isProspectsLoading: state.prospectChat.isProspectsLoading,
  isProspectsLoaded: state.prospectChat.isProspectsLoaded,
  isContactsLoaded: state.smsMessage.isContactsLoaded,
  activeProperties: state.prospectChat.activeProperties,
  newMessage: state.prospectChat.newMessage,
  newAgentRequest: state.prospectChat.newAgentRequest,
  availableAgentsCount: state.prospectChat.availableAgentsCount,
  clearNewMessageAlert: state.prospectChat.clearNewMessageAlert,
  clearAgentRequestAlert: state.prospectChat.clearAgentRequestAlert,
  prospectsRequestedAgents: state.prospectChat.prospectsRequestedAgents,
  currentTab: state.prospectChat.currentTab,
});

export default connect(
  mapStateToProps,
  {
    ...actions.prospectChat,
  },
)(Contacts);
