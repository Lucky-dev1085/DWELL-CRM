import React, { FC, useState } from 'react';
import { connect } from 'react-redux';
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap';
import { isEmpty } from 'lodash';
import actions from 'dwell/actions/index';
import { DetailResponse, SuccessResponse, Prospect, PropertyProps } from 'src/interfaces';
import MessageDetail from './_messagesDetails';
import { MessageIcon, LinkButton, MessageList, MessagesDropdownActions, MessagesDropdownHeader,
  MessagesDropdownTitle, MessagesEmpty, MessageWrapper, notifDropdownMenuStyles } from './styles';

interface RecentMessages {
  isChatMinimized: boolean,
  currentProperty: PropertyProps,
  currentUserData: { email: string, id: number },
  currentContact: number,
  setChatAsActive: (contact: { id: number, isSMS: boolean, isSingleChat: boolean }) => null,
  setChatMinimiseStatus: (minimized: boolean) => void,
  setChatType: (type: string) => void,
  updateNotificationById: (id: number, data: { is_read: boolean }) => Promise<DetailResponse>,
  clearAllNotifications: () => Promise<SuccessResponse>,
  readAllNotifications: () => Promise<SuccessResponse>,
  prospects: Prospect[],
}

const RecentMessages: FC<RecentMessages> = (props) => {
  const { setChatType, isChatMinimized, currentProperty, currentUserData, setChatAsActive, setChatMinimiseStatus, prospects } = props;
  const [dropdownOpen, setDropdownState] = useState(false);

  const prospectUnread = prospects.reduce((acc, crr) => {
    if (crr.active_agent === currentUserData.id && !crr.is_mute && !crr.is_archived) {
      return acc + Number(crr.unread_count);
    }
    return acc;
  }, 0);

  const openQuickChat = () => {
    if (isChatMinimized) {
      setChatMinimiseStatus(false);
    }
    setChatType('chat');
    setDropdownState(false);
  };

  const onProspectClick = (id) => {
    openQuickChat();
    setChatAsActive({ id, isSMS: false, isSingleChat: true });
  };

  return (
    <Dropdown isOpen={dropdownOpen} toggle={() => setDropdownState(!dropdownOpen)}>
      <MessageIcon unread={prospectUnread > 0}>
        <DropdownToggle
          tag="span"
          data-toggle="dropdown"
          aria-expanded={dropdownOpen}
        >
          <i className="ri-chat-1-line" />
        </DropdownToggle>
      </MessageIcon>
      <DropdownMenu
        modifiers={{
          setWidth: {
            enabled: true,
            fn: data => ({
              ...data,
              styles: {
                ...data.styles,
                ...notifDropdownMenuStyles,
              },
            }),
          },
        }}
        right
      >
        <MessagesDropdownHeader header className="header" tag="div">
          <MessagesDropdownTitle className="title">Recent Messages</MessagesDropdownTitle>
        </MessagesDropdownHeader>
        {!isEmpty(currentProperty) && !isEmpty(prospects) ? (
          <>
            <MessageList>
              {prospects.filter(p => p.property === currentProperty.id)
                .sort((a, b) => (new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime()))
                .slice(0, 5)
                .map(prospect => (
                  <MessageWrapper key={prospect.id} >
                    <MessageDetail
                      onClick={() => onProspectClick(prospect.id)}
                      prospect={prospect}
                    />
                  </MessageWrapper>))}
            </MessageList>
            <MessagesDropdownActions className="actions d-none">
              <LinkButton onClick={openQuickChat}>See all messages</LinkButton>
            </MessagesDropdownActions>
          </>
        ) : (<MessagesEmpty>No new messages</MessagesEmpty>)
        }
      </DropdownMenu>
    </Dropdown>
  );
};

const mapStateToProps = state => ({
  prospects: state.prospectChat.prospects.filter(p => p.should_display_in_chat),
  currentProperty: state.property.property,
  currentUserData: state.user.currentUser,
  isChatMinimized: state.prospectChat.isChatMinimized,
  currentContact: state.smsMessage.currentContact,
});

export default connect(
  mapStateToProps,
  {
    ...actions.prospectChat,
  },
)(RecentMessages);
