import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import actions from 'dwell/actions/index';
import { useInterval } from 'dwell/components';
import { getAvatarColor, getInitials, isMostRecentTab } from 'dwell/views/chat/common/utils';
import { isEmpty } from 'lodash';
import { PropertyProps } from 'src/interfaces';
import newMessageSound from 'src/assets/audio/new-chat-message.mp3';
import { MinChatGroup, MinChatLink, MinChatItem, UnreadCount, Avatar, CloseIcon } from './styles';

const NewMessageSoundPlayer = new Audio(newMessageSound);

interface ChatProps extends RouteComponentProps {
  setChatMinimiseStatus: (minimized: boolean) => void,
  reorderActiveChats: (contact: { id: number, isSMS: boolean }) => void,
  removeFromActiveChats: (contact: { id: number }) => void,
  isChatMinimized: boolean,
  activeChats: { id: number, isSMS: boolean, circled: boolean }[],
  contacts: { id: number, name: string, unread_count: number }[],
  prospects: { id: number, name: string, active_agent: number, is_mute: boolean, is_archived: boolean, unread_count: number }[],
  currentUser: { id: number, is_available: boolean },
  chatType: string,
  newMessage: { prospect: number, type: string },
  availableAgentsCount: number,
  clearNewMessageAlert: () => void,
  currentTab: string,
  currentProperty: PropertyProps,
}

const CircledChat: FC<ChatProps> = ({ setChatMinimiseStatus, isChatMinimized, activeChats, contacts, prospects, reorderActiveChats, removeFromActiveChats,
  currentUser, chatType, newMessage, availableAgentsCount, clearNewMessageAlert, currentTab, currentProperty }) => {
  const [isBlinking, setIsBlinking] = useState(false);

  const prospectUnread = prospects.reduce((acc, crr) => {
    if (crr.active_agent === currentUser.id && !crr.is_mute && !crr.is_archived) {
      return acc + Number(crr.unread_count);
    }
    return acc;
  }, 0);

  const smsUnread = contacts.reduce((acc, crr) => (acc + Number(crr.unread_count)), 0);

  // Notifications
  const blinkTabMessage = () => {
    document.title = 'Prospect says...';
    setTimeout(() => {
      document.title = 'CRM';
    }, 3000);
  };

  const blinkBlue = () => {
    if (!currentProperty.agent_chat_enabled) return;
    setIsBlinking(true);
    setTimeout(() => {
      setIsBlinking(false);
    }, 2000);
  };

  const shouldShowBlueBlink = (smsUnread && isChatMinimized) || (currentUser.is_available &&
      prospects.some(prospect => prospect.active_agent === currentUser.id && prospect.unread_count > 0) &&
      (isChatMinimized || chatType === 'sms')
  );

  useInterval(() => {
    blinkBlue();
  }, shouldShowBlueBlink ? 4000 : null);

  useInterval(() => {
    blinkTabMessage();
  }, currentUser.is_available &&
      prospects.some(prospect => prospect.active_agent === currentUser.id && prospect.unread_count > 0) ? 6000 : null);

  useEffect(() => {
    if (currentUser.is_available) {
      if (!isEmpty(newMessage)) {
        const prospect = prospects.find(p => p.id === newMessage.prospect);
        if (prospect && prospect.active_agent === currentUser.id && !prospect.is_mute) {
          if (isMostRecentTab(currentTab)) {
            NewMessageSoundPlayer.play();
          }
          blinkBlue();
          blinkTabMessage();
        }
        clearNewMessageAlert();
      }
    } else if (!availableAgentsCount) {
      if (!isEmpty(newMessage)) {
        blinkBlue();
        clearNewMessageAlert();
      }
    }
  }, [newMessage, currentUser]);

  const totalUnreadCount = smsUnread + (currentProperty.agent_chat_enabled ? prospectUnread : 0);

  const renderChatItem = (contactId) => {
    let contact;
    if (contactId.isSMS) {
      contact = contacts.find(i => i.id === contactId.id);
    } else {
      contact = prospects.find(i => i.id === contactId.id);
    }

    return (
      <MinChatItem onClick={() => reorderActiveChats(contactId)}>
        <Avatar className={getAvatarColor(contact.name, contact.id, contactId.isSMS)} online={contact.is_online} hideOnlineIcon={contactId.isSMS}>
          <i>{getInitials(contact.name, contactId.iSMS)}</i>
        </Avatar>
        <UnreadCount show={contact.unread_count}>
          {contact.unread_count}
        </UnreadCount>
        <CloseIcon
          className="min-chat-close"
          onClick={(event) => {
            event.stopPropagation();
            removeFromActiveChats(contactId);
          }}
        />
      </MinChatItem>
    );
  };

  return (
    <MinChatGroup>
      <MinChatLink onClick={() => setChatMinimiseStatus(!isChatMinimized)} blinking={isBlinking}>
        <i className="ri-question-answer-fill" />
        <UnreadCount show={totalUnreadCount}>
          {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
        </UnreadCount>
      </MinChatLink>
      {activeChats.filter(contact => contact.circled).map(contact => renderChatItem(contact))}
    </MinChatGroup>);
};

const mapStateToProps = state => ({
  isChatMinimized: state.prospectChat.isChatMinimized,
  activeChats: state.prospectChat.activeChats,
  prospects: state.prospectChat.prospects.filter(p => p.should_display_in_chat),
  contacts: state.smsMessage.contacts,
  newMessage: state.prospectChat.newMessage,
  chatType: state.prospectChat.chatType,
  availableAgentsCount: state.prospectChat.availableAgentsCount,
  currentUser: state.user.currentUser,
  currentTab: state.prospectChat.currentTab,
  currentProperty: state.property.property,
});

export default connect(
  mapStateToProps,
  {
    ...actions.lead,
    ...actions.prospectChat,
  },
)(withRouter(CircledChat));
