import React, { FC, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import TextareaAutosize from 'react-textarea-autosize';
import actions from 'dwell/actions/index';
import moment from 'moment';
import { isEmpty, get } from 'lodash';
import { toast, ToastOptions } from 'react-toastify';
import { DetailResponse, ListResponse, SmsMessageConversations } from 'src/interfaces';
import { Avatar } from 'styles/common';
import { SMS_LOAD_MORE_OFFSET } from 'dwell/constants';
import { toastError } from 'site/constants';
import { getAvatarColor, getInitials } from 'dwell/views/chat/common/utils';
import { ChatSpinner, SpinnerBorder } from 'dwell/views/chat/single_chat/contact/styles';
import { ChatItemBody, ChatItemFooter, ChatItemMessage, MessageInput, ChatItem } from 'dwell/views/chat/single_chat/window/styles';

interface ActiveChatPanelProps {
  conversations: SmsMessageConversations[],
  getConversationById: (data: { lead: number, params: { offset: number, limit: number } }) => Promise<ListResponse>,
  bulkClearNotifications: ({ ids }) => null,
  notifications: { redirect_url: string, id: number, type: string }[],
  readAll: (lead: number) => null,
  currentUser: { id: number, is_available: boolean },
  sendTextToLead: (data: { lead: number, message: string }) => Promise<DetailResponse>,
  contact: { id: number, name: string, property: number, unread_count: number, last_message: string },
  minimized: boolean,
  isSingleChat: boolean,
  isSendingText: boolean,
}

const SMSChatBody: FC<ActiveChatPanelProps> = ({ contact, conversations, getConversationById, readAll, sendTextToLead, notifications,
  bulkClearNotifications, minimized, isSingleChat, isSendingText }) => {
  const [newMessage, setNewMessage] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [oldScrollPosition, setOldScrollPosition] = useState(0);
  const [isScrollLoading, setIsScrollLoading] = useState(false);

  const chatWindow: { current: { _container: { scrollTop: number, scrollHeight: number, clientHeight: number } }} | undefined = useRef();

  const filteredConversations = conversations.filter(c => c.lead === contact.id);

  const scrollToLastMessage = () => {
    if (chatWindow.current) {
      const { _container } = chatWindow.current;
      _container.scrollTop = _container.scrollHeight;
    }
  };

  const clearLeadNotifications = (id) => {
    const notificationArray = [];
    notifications.forEach((data) => {
      if (data.redirect_url && parseInt(data.redirect_url.split('/').pop(), 10) === id && data.type === 'NEW_SMS') notificationArray.push(data.id);
    });
    if (notificationArray.length) bulkClearNotifications({ ids: notificationArray });
  };

  useEffect(() => {
    if (contact.id) {
      if ((!minimized || !isSingleChat) && !totalCount) {
        getConversationById({
          lead: contact.id,
          params: {
            offset: filteredConversations.length,
            limit: SMS_LOAD_MORE_OFFSET,
          } }).then((response) => {
          if (response) {
            const { result: { data: { count } } } = response;
            setTotalCount(count);
          }
          scrollToLastMessage();
          if (contact.id && contact.unread_count) {
            readAll(contact.id);
          }
          clearLeadNotifications(contact.id);
        });
      } else if (contact.unread_count) {
        // for the unread message
        readAll(contact.id);
      }
    }
  }, [contact.unread_count]);

  const onscroll = ({ target }) => {
    if (totalCount === filteredConversations.length) return;
    if (target && target.scrollTop === 0) {
      setIsScrollLoading(true);
      setOldScrollPosition(target.scrollHeight - target.clientHeight);
      setTimeout(() => {
        if (contact.id) {
          getConversationById({ lead: contact.id, params: { offset: filteredConversations.length, limit: SMS_LOAD_MORE_OFFSET } })
            .then((response) => {
              if (response) {
                const { result: { data: { count } } } = response;
                setTotalCount(count);
              }
              setIsScrollLoading(false);
            });
        }
      }, 1000);
    }
  };

  const sendMessage = (message) => {
    if (message) {
      sendTextToLead({ lead: contact.id, message })
        .then(() => {
          setNewMessage('');
          scrollToLastMessage();
        }).catch((error) => {
          const errorMsg = get(error, 'response.data.detail', '');
          if (errorMsg === 'Failed to send message') {
            toast.error('Phone number invalid. Please provide correct phone number for Lead.', toastError as ToastOptions);
          }
        });
    }
  };

  useEffect(() => {
    if (chatWindow.current) {
      const { _container } = chatWindow.current;
      const newScroll = _container.scrollHeight - _container.clientHeight;
      _container.scrollTop += (newScroll - oldScrollPosition);
    }
  }, [filteredConversations, totalCount]);

  return (
    <>
      <ChatItemBody ref={chatWindow} onScroll={onscroll} isSingleChat={isSingleChat}>
        <ul>
          {isScrollLoading && (
            <ChatSpinner>
              <SpinnerBorder>
                <span className="sr-only">Loading ...</span>
              </SpinnerBorder>
            </ChatSpinner>
          )}
          {conversations.filter(message => message.lead === contact.id)
            .map((message, index) => (
              <ChatItem reverse={message.is_team_message} isSMS>
                <Avatar
                  className={`avatar ${message.is_team_message ? 'bg-dark' : getAvatarColor(contact.name, contact.id, true)}`}
                >
                  {message.is_team_message && message.agent_avatar ?
                    <img src={message.agent_avatar} alt="avatar" /> :
                    <i>{getInitials(message.is_team_message ? message.agent_name : contact.name, true)}</i>}
                </Avatar>
                <ChatItemMessage key={index} className="message">
                  <p dangerouslySetInnerHTML={{ __html: message.message }} />
                  <small>{moment(message.date).format('MMM DD, hh:mma')}</small>
                </ChatItemMessage>
              </ChatItem>))}
        </ul>
      </ChatItemBody>
      <ChatItemFooter>
        <MessageInput>
          <TextareaAutosize
            className="form-control m-0"
            placeholder="Write an SMS message"
            onChange={({ target: { value } }) => setNewMessage(value)}
            onKeyUp={(e) => {
              if ((e.key === 'Enter' || e.keyCode === 13) && !isEmpty(newMessage)) {
                if (!isSendingText) {
                  sendMessage(newMessage);
                }
              }
            }}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.keyCode === 13) && !isEmpty(newMessage)) {
                e.preventDefault();
              }
            }}
            value={newMessage}
            minRows={1}
            maxRows={2}
          />
          <span
            className="msg-send"
            onClick={() => {
              if (!isSendingText) sendMessage(newMessage);
            }}
          >
            <i className="ri-send-plane-fill" />
          </span>
        </MessageInput>
      </ChatItemFooter>
    </>);
};

const mapStateToProps = state => ({
  conversations: state.smsMessage.conversations,
  isSendingText: state.smsMessage.isSendingText,
  currentUser: state.user.currentUser,
  notifications: state.notification.notifications,
});

export default connect(
  mapStateToProps,
  {
    ...actions.smsMessage,
    ...actions.notification,
  },
)(SMSChatBody);
