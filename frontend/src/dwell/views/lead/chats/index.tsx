import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import cn from 'classnames';
import moment from 'moment';
import TimeAgo from 'react-timeago';
import { get } from 'lodash';
import { timeFormatter } from 'dwell/constants';
import { getLeadId } from 'dwell/views/lead/layout/utils';
import { EmptyContent } from 'src/styles/common';
import { formatMessageDate, getAvatarColor, getInitials } from 'dwell/views/chat/common/utils';
import { getChatTitle } from 'dwell/views/lead/overview/lead_body_content/utils';
import ChatConversations from './_conversations';
import { Container, ChatContactBody, ChatContactIcon, ChatContactItem, ChatContactName, ChatShortText, ContactBar,
  ContactBarBody, ContactBarHeader, Conversation, ConversationHeader, TimeWrapper,
} from './styles';

const LeadChats = (): JSX.Element => {
  const [currentProspect, setCurrentProspect] = useState({ id: null, name: '', last_message_date: null, source: null });
  const leadId = getLeadId(window.location.pathname);

  const prospects = useSelector(state => state.prospectChat.prospects.filter(p => p.should_display_in_chat));
  const conversations = useSelector(state => state.prospectChat.conversations);
  const property = useSelector(state => state.property.property);

  const filteredProspects = prospects.filter(i => [i.lead, i.guest_card].includes(leadId));
  const chatTitle = getChatTitle(conversations).split('- ');
  const representative = get(chatTitle, '[0]');
  const activity = get(chatTitle, '[1]');

  useEffect(() => {
    if (!currentProspect.id && filteredProspects.length) setCurrentProspect(filteredProspects[0]);
  }, [filteredProspects]);

  const emptyContent = (
    <EmptyContent>
      <i className="ri-message-2-line" />
      <h5><span>No chat activity yet</span></h5>
      <p>When you send chats to leads, we'll show the chat conversations here</p>
    </EmptyContent>
  );

  const contactSideBar = (
    <ContactBar>
      <ContactBarHeader>
        <div>Chats <span>{filteredProspects.length}</span></div>
      </ContactBarHeader>
      <ContactBarBody>
        <div>
          {filteredProspects.map((prospect, index) => {
            formatMessageDate(prospect.last_message_date);
            return (
              <ChatContactItem className={cn({ active: prospect.id === currentProspect.id })} onClick={() => setCurrentProspect(prospect)} key={index}>
                <ChatContactIcon className={getAvatarColor(prospect.name, prospect.id)}>
                  <span>{getInitials(prospect.name)}</span>
                </ChatContactIcon>
                <ChatContactBody>
                  <ChatContactName>{prospect.name}
                    <TimeWrapper>
                      <small>{<TimeAgo date={moment(prospect.last_message_date).format('lll')} formatter={timeFormatter} />}</small>
                      <small>{moment(prospect.last_message_date).format('ll')}</small>
                    </TimeWrapper>
                  </ChatContactName>
                  <ChatShortText>{prospect.last_message}</ChatShortText>
                </ChatContactBody>
              </ChatContactItem>
            );
          })}
        </div>
      </ContactBarBody>
    </ContactBar>
  );

  const content = (
    <Container>
      {contactSideBar}
      <Conversation>
        <ConversationHeader>
          <ChatContactIcon className={getAvatarColor(currentProspect.name, currentProspect.id)}>
            <span>{getInitials(currentProspect.name)}</span>
          </ChatContactIcon>
          <div className="contact-name">
            <span>{currentProspect.name}</span>
            <small>Source: {currentProspect.source === 'SITE' ? property.domain : 'Mark-Taylor.com'}</small>
            {representative && <small className="chat-title">Representative: {representative}</small>}
            {activity && <small className="chat-title">Activity: {activity}</small>}
          </div>
          <span>
            {moment(currentProspect.last_message_date).format('lll')}&nbsp;
            (<TimeAgo
              date={moment(currentProspect.last_message_date)}
            />)
          </span>
        </ConversationHeader>
        <ChatConversations prospect={currentProspect} />
      </Conversation>
    </Container>
  );
  return <React.Fragment>{filteredProspects.length ? content : emptyContent}</React.Fragment>;
};

export default LeadChats;
