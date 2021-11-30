import React, { FC, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Mention } from 'react-mentions';
import moment from 'moment';
import actions from 'dwell/actions/index';
import { isEmpty } from 'lodash';
import { SMS_LOAD_MORE_OFFSET } from 'dwell/constants';
import { DetailResponse, LeadData, ListResponse, PropertyProps, SuccessResponse } from 'src/interfaces';
import { Avatar } from 'styles/common';
import MessageOptionsPanel from 'dwell/views/chat/common/_messageOptionsPanel';
import { AgentJoinedText } from 'dwell/views/chat/multi_chat/styles';
import { ChatSpinner, JoinButton, SpinnerBorder } from 'dwell/views/chat/single_chat/contact/styles';
import 'src/scss/pages/_placeholders.scss';

import {
  ChatItem,
  ChatItemBody,
  ChatItemFooter,
  ChatItemMessage,
  MessageInput,
  TypingMessage,
  CustomMentionInput,
} from 'dwell/views/chat/single_chat/window/styles';
import { getAvatarColor, getInitials } from 'dwell/views/chat/common/utils';
import { GuestCardDataCapture, NameDataCapture, SchedulingDataCapture } from 'dwell/views/chat/common/dataCaptures';

interface ActiveChatPanelProps {
  chatConversations: { prospect: number, type: string, is_form_message: boolean, message: string, date: string, agent_name: string, agent_avatar: string }[],
  getConversations: (data: { prospect: number, params: { offset: number, limit: number } }) => Promise<ListResponse>,
  readAll: (prospect: number) => null,
  currentUser: { id: number, is_available: boolean },
  sendMessageToProspect: (data: { prospect: number, type: string, is_read: boolean, agent: number, message: string, property: number }) => Promise<DetailResponse>,
  joinProspect: (data: { prospect: number, body: { type: string, agent: number } }) => Promise<DetailResponse>,
  removeFromProspectsRequestedAgent: (id: number) => void,
  updateUserAvailableStatus: (id: number, data: { is_available: boolean}) => Promise<DetailResponse>,
  prospect: { id: number, name: string, active_agent: number, joined_agents: number[], is_online: boolean, property: number, unread_count: number, last_message_date: string },
  minimized: boolean,
  isSingleChat: boolean,
  isSendingText: boolean,
  sendTypingState: (prospect: number, data: { is_typing: boolean, type: 'AGENT'}) => Promise<SuccessResponse>,
  typingData: { isTyping: boolean, prospect: number | null },
  clearTyping: () => void,
  leads: LeadData[],
  property: PropertyProps,
}

const ProspectChatBody: FC<ActiveChatPanelProps> = ({ prospect, chatConversations, getConversations, readAll, currentUser, sendMessageToProspect,
  joinProspect, removeFromProspectsRequestedAgent, updateUserAvailableStatus, minimized, isSingleChat, isSendingText, sendTypingState, typingData, clearTyping }) => {
  const [newMessage, setNewMessage] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [oldScrollPosition, setOldScrollPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoinDisabled, setIsJoinDisabled] = useState(false);
  const [canPublish, setCanPublish] = useState(true);
  const [isSendDisabled, setIsSendDisabled] = useState(false);
  const [messageType, setMessageType] = useState(null);
  const typingTimeoutId = useRef(null);

  const chatWindow: { current: { _container: { scrollTop: number, scrollHeight: number, clientHeight: number } }} | undefined = useRef();

  const scrollToLastMessage = () => {
    if (chatWindow.current) {
      const { _container } = chatWindow.current;
      _container.scrollTop = _container.scrollHeight;
    }
  };

  useEffect(() => {
    if (typingTimeoutId.current) {
      clearTimeout(typingTimeoutId.current);
    }
    typingTimeoutId.current = setTimeout(() => {
      if (typingData.isTyping) {
        clearTyping();
      }
    }, 1700);
  }, [typingData]);

  const getDataCaptureElement = (type) => {
    switch (type) {
      case 'Name': return NameDataCapture;
      case 'Guest card': return GuestCardDataCapture;
      case 'Schedule a Tour': return SchedulingDataCapture;
      default: return NameDataCapture;
    }
  };

  useEffect(() => {
    const conversations = chatConversations.filter(message => message.prospect === prospect.id);
    if (prospect.id) {
      if ((!minimized || !isSingleChat) && !totalCount) {
        // for the first loading
        setIsLoading(true);
        getConversations({
          prospect: prospect.id,
          params: {
            offset: conversations.length,
            limit: SMS_LOAD_MORE_OFFSET,
          } }).then((response) => {
          if (response) {
            const { result: { data: { count } } } = response;
            setTotalCount(count);
          }
          if (prospect && prospect.unread_count) {
            readAll(prospect.id);
          }
          setIsLoading(false);
        });
      } else if (prospect.unread_count) {
        // for the unread message
        readAll(prospect.id);
      }
      scrollToLastMessage();
    }
  }, [prospect.unread_count]);

  const onscroll = ({ target }) => {
    const conversations = chatConversations.filter(message => message.prospect === prospect.id);
    if (totalCount === conversations.length) return;
    if (target && target.scrollTop === 0 && !isLoading && totalCount) {
      setIsLoading(true);
      setOldScrollPosition(target.scrollHeight - target.clientHeight);
      setTimeout(() => {
        if (prospect.id) {
          getConversations({ prospect: prospect.id, params: { offset: conversations.length, limit: SMS_LOAD_MORE_OFFSET } })
            .then((response) => {
              if (response) {
                const { result: { data: { count } } } = response;
                setTotalCount(count);
              }
              setIsLoading(false);
            });
        }
      }, 1000);
    }
  };

  const sendMessage = (message, type = messageType || 'AGENT') => {
    if (message && !isSendDisabled && !isSendingText) {
      sendMessageToProspect({
        prospect: prospect.id,
        type,
        is_read: true,
        agent: currentUser.id,
        message,
        property: prospect.property,
      }).then(() => {
        setNewMessage('');
        setMessageType(null);
        scrollToLastMessage();
      });
    }
  };

  useEffect(() => {
    if (chatWindow.current) {
      const { _container } = chatWindow.current;
      const newScroll = _container.scrollHeight - _container.clientHeight;
      _container.scrollTop += (newScroll - oldScrollPosition);
    }
  }, [chatConversations, totalCount]);

  const onJoin = () => {
    setIsJoinDisabled(true);
    updateUserAvailableStatus(currentUser.id, { is_available: true })
      .then(() => joinProspect({ prospect: prospect.id, body: { type: 'JOINED', agent: currentUser.id } }))
      .then(() => {
        scrollToLastMessage();
        readAll(prospect.id);
        removeFromProspectsRequestedAgent(prospect.id);
        setIsJoinDisabled(false);
      });
  };

  const replaceSubjectEmptyVariables = () => {
    const placeholders = document.getElementsByClassName('subject-variable');
    if (!isEmpty(placeholders)) {
      [...placeholders].forEach((el) => {
        el.classList.add('subject-variable-empty');
        el.classList.remove('subject-variable');
      });
    }
    setIsSendDisabled(!isEmpty([...document.getElementsByClassName('subject-variable-empty')]));
  };

  useEffect(() => {
    setTimeout(() => replaceSubjectEmptyVariables(), 100);
  }, [newMessage]);

  const handleKeyUp = (e) => {
    replaceSubjectEmptyVariables();
    if ((e.key === 'Enter' || e.keyCode === 13) && !isEmpty(newMessage)) {
      if (!isSendingText && !isSendDisabled) {
        sendMessage(newMessage);
      }
    } else if (canPublish) {
      sendTypingState(prospect.id, { is_typing: true, type: 'AGENT' });
      setCanPublish(false);
      setTimeout(() => {
        setCanPublish(true);
      }, 200);
    }
  };

  const handleKeyDown = (e) => {
    replaceSubjectEmptyVariables();
    if ((e.key === 'Enter' || e.keyCode === 13) && !isEmpty(newMessage)) {
      e.preventDefault();
    }
  };

  const handleChange = (value) => {
    setNewMessage(value);
    setMessageType(null);
  };

  const isResponsible = prospect.active_agent === currentUser.id;
  const inActiveSession = isResponsible && prospect.is_online && currentUser.is_available;
  const shouldJoinInSession = !(prospect.joined_agents || []).includes(currentUser.id) && prospect.is_online
      && !prospect.active_agent;
  const shouldRejoinInSession = (prospect.joined_agents || []).includes(currentUser.id) && prospect.is_online
      && (!prospect.active_agent || (isResponsible && !currentUser.is_available));
  const isNotMyChat = prospect.active_agent && !isResponsible;

  return (
    <>
      <ChatItemBody ref={chatWindow} onScroll={onscroll} isSingleChat={isSingleChat}>
        <ul>
          {isLoading && (
            <ChatSpinner>
              <SpinnerBorder>
                <span className="sr-only">Loading ...</span>
              </SpinnerBorder>
            </ChatSpinner>
          )}
          {chatConversations.filter(message => message.prospect === prospect.id && !['AGENT_REQUEST'].includes(message.type))
            .sort((a, b) => (new Date(a.date).getTime() - new Date(b.date).getTime()))
            .map((message, index, array) => {
              if (message.type === 'PROSPECT') {
                return (
                  <ChatItem key={index}>
                    <Avatar className={`avatar ${getAvatarColor(prospect.name, prospect.id)}`}>
                      <i>{getInitials(prospect.name)}</i>
                    </Avatar>
                    <ChatItemMessage key={index} className="message">
                      <p dangerouslySetInnerHTML={{ __html: message.message }} />
                      <small>{moment(message.date).format('MMM DD, hh:mma')}</small>
                    </ChatItemMessage>
                  </ChatItem>
                );
              } else if (message.type === 'JOINED') {
                return (
                  <ChatItem agentJoined key={index}>
                    <AgentJoinedText key={index}>
                      {message.agent_name} has entered the chat.
                      <small>&nbsp;&nbsp;({moment(message.date).format('MMM DD, hh:mma')})</small>
                    </AgentJoinedText>
                  </ChatItem>);
              } else if (message.type === 'DATA_CAPTURE' && index === array.length - 1) {
                return (
                  <ChatItem reverse key={index}>
                    <Avatar className="avatar bg-dark">
                      <i>{getInitials(message.agent_name)}</i>
                    </Avatar>
                    <ChatItemMessage key={index} className="message" agent>
                      <p dangerouslySetInnerHTML={{ __html: getDataCaptureElement(message.message) }} />
                      <small>{moment(message.date).format('MMM DD, hh:mma')}</small>
                    </ChatItemMessage>
                  </ChatItem>);
              } else if (message.type !== 'DATA_CAPTURE') {
                const avatarColor = `avatar ${['AGENT', 'BOT', 'GREETING', 'TEMPLATE'].includes(message.type) ? 'bg-dark' : getAvatarColor(prospect.name, prospect.id)}`;
                const name = ['AGENT', 'TEMPLATE'].includes(message.type) ? getInitials(message.agent_name) : 'H';
                let avatar = (
                  <Avatar className={avatarColor}>
                    <i>{name}</i>
                  </Avatar>
                );
                if (['AGENT', 'TEMPLATE'].includes(message.type) && message.agent_avatar) {
                  avatar = (
                    <Avatar className={avatarColor}>
                      <img src={message.agent_avatar} alt="avatar" />
                    </Avatar>
                  );
                }
                if (['GREETING', 'BOT'].includes(message.type)) {
                  avatar = (
                    <Avatar className={avatarColor}>
                      <img
                        src="https://img.icons8.com/material-outlined/36/000000/bot.png"
                        alt="bot-icon"
                        className="bot"
                        style={{ filter: 'brightness(100%) invert(100%)' }}
                      />
                    </Avatar>
                  );
                }
                return (
                  <ChatItem reverse={['AGENT', 'BOT', 'GREETING', 'TEMPLATE'].includes(message.type)} key={index}>
                    {avatar}
                    <ChatItemMessage key={index} className="message">
                      <p dangerouslySetInnerHTML={{ __html: message.type === 'GREETING'
                        ? message.message.replace(/<\/?h[0-9]>/g, ' ')
                          .replace(/<\/?p>/g, '')
                        : message.message }}
                      />
                      <small>{moment(message.date).format('MMM DD, hh:mma')}</small>
                    </ChatItemMessage>
                  </ChatItem>);
              }
              return <></>;
            })}
        </ul>
      </ChatItemBody>
      <ChatItemFooter>
        {inActiveSession && (
          <>
            {typingData.isTyping && prospect.id === typingData.prospect &&
            <TypingMessage>
              {`${prospect.name} is typing...`}
            </TypingMessage>}
            <MessageInput className="subject">
              <CustomMentionInput
                singleLine
                placeholder="Write a chat message"
                value={newMessage}
                onClick={() => replaceSubjectEmptyVariables()}
                onChange={({ target: { value } }) => handleChange(value)}
                onBlur={() => setTimeout(() => replaceSubjectEmptyVariables())}
                onKeyUp={e => handleKeyUp(e)}
                onKeyDown={e => handleKeyDown(e)}
              >
                <Mention
                  appendSpaceOnAdd
                  className="subject-variable"
                  trigger="["
                  markup="[=__display__=]"
                  displayTransform={(id, display) => `[=${display}=]`}
                  data={(matchInfo, callback) => callback([])}
                  renderSuggestion={(suggestion, search, highlightedDisplay, index, focused) => (<div className={`${focused ? 'focused' : ''}`}>{highlightedDisplay}</div>)}
                />
              </CustomMentionInput>
              <span
                className="msg-send"
                onClick={() => sendMessage(newMessage)}
              >
                <i className="ri-send-plane-fill" />
              </span>
              <MessageOptionsPanel
                sendMessage={(message, type) => sendMessage(message, type)}
                setNewMessage={message => setNewMessage(message)}
                setMessageType={setMessageType}
                prospect={prospect}
                isSingleChat
              />
            </MessageInput>
          </>)}
        {shouldJoinInSession &&
        <JoinButton
          onClick={() => onJoin()}
          disabled={isJoinDisabled || isNotMyChat}
        >Join
        </JoinButton>}
        {shouldRejoinInSession &&
        <JoinButton
          onClick={() => onJoin()}
          disabled={isJoinDisabled || isNotMyChat}
        >Rejoin
        </JoinButton>}
      </ChatItemFooter>
    </>);
};

const mapStateToProps = state => ({
  chatConversations: state.prospectChat.conversations,
  isSendingText: state.prospectChat.isSendingText,
  currentUser: state.user.currentUser,
  properties: state.property.properties,
  typingData: state.prospectChat.typingData,
});

export default connect(
  mapStateToProps,
  {
    ...actions.prospectChat,
    ...actions.user,
  },
)(ProspectChatBody);
