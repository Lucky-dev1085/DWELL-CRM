import React, { FC, useEffect } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import actions from 'dwell/actions/index';
import { Nav, NavLink, UncontrolledTooltip } from 'reactstrap';
import { DetailResponse, PropertyProps } from 'src/interfaces';
import { UserAvailableSwitch, UserAvailableSwitchWrapper } from 'containers/DefaultLayout/styles';
import { ChatHeader, ChatPanelContainer, ChatHeaderLink } from './styles';
import SMSContact from './_sms';
import ProspectChat from './_prospect';

interface ChatProps extends RouteComponentProps {
  setChatMinimiseStatus: (minimized: boolean) => void,
  setChatType: (type: string) => void,
  updateUserAvailableStatus: (id: number, data: { is_available: boolean }) => Promise<DetailResponse>,
  chatType: string,
  isChatMinimized: boolean,
  prospect: { id: number },
  currentUser: { id: number, is_available: boolean },
  contacts: { id: number, name: string, unread_count: number }[],
  prospects: { id: number, name: string, active_agent: number, is_mute: boolean, is_archived: boolean, unread_count: number }[],
  currentProperty: PropertyProps,
}

const ContactPanel: FC<ChatProps> = ({ chatType, isChatMinimized, setChatMinimiseStatus, setChatType, currentUser,
  updateUserAvailableStatus, prospects, contacts, currentProperty }) => {
  useEffect(() => {
    if (!isEmpty(currentProperty) && !currentProperty.agent_chat_enabled && chatType === 'chat') {
      setChatType('sms');
    }
  }, [currentProperty]);
  const prospectUnread = prospects.reduce((acc, crr) => {
    if (crr.active_agent === currentUser.id && !crr.is_mute && !crr.is_archived) {
      return acc + Number(crr.unread_count);
    }
    return acc;
  }, 0);

  const smsUnread = contacts.reduce((acc, crr) => (acc + Number(crr.unread_count)), 0);

  return (
    <ChatPanelContainer isMinmized={isChatMinimized}>
      <ChatHeader>
        <Nav>
          {currentProperty.agent_chat_enabled && (
            <NavLink active={chatType === 'chat'} onClick={() => setChatType('chat')}>Chat {!!prospectUnread && <span>{prospectUnread}</span>}</NavLink>
          )}
          <NavLink active={chatType === 'sms'} onClick={() => setChatType('sms')}>SMS {!!smsUnread && <span>{smsUnread}</span>}</NavLink>
        </Nav>
        {currentProperty.agent_chat_enabled && (
          <UserAvailableSwitchWrapper className="p-0 mr-2">
            <UserAvailableSwitch
              id="available-to-chat"
              available={currentUser.is_available}
              onClick={() => updateUserAvailableStatus(currentUser.id, { is_available: !currentUser.is_available })}
            />
            <UncontrolledTooltip trigger="hover" placement="top" target="available-to-chat" fade={false}>
              Available to Chat
            </UncontrolledTooltip>
          </UserAvailableSwitchWrapper>
        )}
        <ChatHeaderLink onClick={() => setChatMinimiseStatus(!isChatMinimized)}>
          <i className="ri-close-fill" />
        </ChatHeaderLink>
      </ChatHeader>
      {chatType === 'sms' ? <SMSContact /> : <ProspectChat />}
    </ChatPanelContainer>
  );
};

const mapStateToProps = state => ({
  chatType: state.prospectChat.chatType,
  isChatMinimized: state.prospectChat.isChatMinimized,
  currentUser: state.user.currentUser,
  currentProperty: state.property.property,
  prospects: state.prospectChat.prospects.filter(p => p.should_display_in_chat),
  contacts: state.smsMessage.contacts,
});

export default connect(
  mapStateToProps,
  {
    ...actions.user,
    ...actions.prospectChat,
  },
)(withRouter(ContactPanel));
