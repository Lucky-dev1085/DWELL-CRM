import React, { FC } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import actions from 'dwell/actions/index';
import { Media } from 'reactstrap';
import cn from 'classnames';
import { Avatar } from 'styles/common';
import { getAvatarColor, getInitials } from 'dwell/views/chat/common/utils';
import ProspectSetting from 'dwell/views/chat/common/_prospectSetting';
import 'src/scss/pages/_schedule_form_single_chat.scss';
import { ChatItemHeader, ChatItemContainer } from './styles';
import { ChatHeaderLink } from '../contact/styles';
import SMSChatBody from '../../common/_smsChatBody';
import ProspectChatBody from '../../common/_prospectChatBody';

interface ChatProps extends RouteComponentProps {
  contactId: { id: number, isSMS: boolean, minimized: boolean, isSingleChat: boolean },
  contacts: { id: number }[],
  prospects: { id: number }[],
  removeFromActiveChats: (contact: { id: number, isSMS: boolean }) => void,
  minimizeChatWindow: (contact: { id: number, isSMS: boolean, isSingleChat: boolean, minimized: boolean }) => null,
  currentUser: { id: number },
  minimized: boolean,
}

const ChatWindow: FC<ChatProps> = ({ contactId, contacts, prospects, removeFromActiveChats, minimizeChatWindow, minimized, currentUser }) => {
  let contact;
  let avatarClass = '';
  if (contactId.isSMS) {
    contact = contacts.find(i => i.id === contactId.id) || {};
    avatarClass = cn(`avatar ${getAvatarColor(contact.name, contact.id, contactId.isSMS)}`);
  } else {
    contact = prospects.find(i => i.id === contactId.id) || {};
    if (!contact) return <></>;
    avatarClass = cn(`avatar ${getAvatarColor(contact.name, contact.id, contactId.isSMS)}`, { offline: !contact.is_online, online: contact.is_online });
  }
  const isBlinking = contactId.isSMS ? contact.unread_count && minimized
    : contact.active_agent === currentUser.id && !contact.is_mute && !contact.is_archived && minimized && contact.unread_count;

  const body = contactId.isSMS ? <SMSChatBody contact={contact} minimized={minimized} isSingleChat /> :
    <ProspectChatBody prospect={contact} minimized={minimized} isSingleChat />;

  return (
    <div className="d-flex align-items-end flex-row-reverse">
      <ChatItemContainer isSMS={contactId.isSMS} isBlinking={isBlinking}>
        <ChatItemHeader onClick={() => minimizeChatWindow({ ...contactId, minimized: !minimized })} isBlinking={isBlinking}>
          <Media>
            <Avatar className={avatarClass} hideOnlineIcon={contactId.isSMS}>
              {getInitials(contact.name, contactId.isSMS)}
            </Avatar>
            <div className="media-body">
              <h6 className="mb-0">
                {contact.name}{isBlinking ? ` (${contact.unread_count})` : ''}
                {!contact.isSMS && contact.is_mute && <i className="ri-notification-off-fill" />}
              </h6>
              {!contactId.isSMS ? <span>{contact.last_visit_page_name}</span> : null}
            </div>
            {!contactId.isSMS && <ProspectSetting prospect={contact} isSingleChat />}
            <ChatHeaderLink onClick={() => removeFromActiveChats(contactId)}>
              <i className="ri-close-fill" />
            </ChatHeaderLink>
          </Media>
        </ChatItemHeader>
        {contactId.minimized ? null : body}
      </ChatItemContainer>
    </div>);
};

const mapStateToProps = state => ({
  prospects: state.prospectChat.prospects.filter(p => p.should_display_in_chat),
  chatType: state.prospectChat.chatType,
  contacts: state.smsMessage.contacts,
  currentUser: state.user.currentUser,
});

export default connect(
  mapStateToProps,
  {
    ...actions.smsMessage,
    ...actions.prospectChat,
  },
)(withRouter(ChatWindow));
