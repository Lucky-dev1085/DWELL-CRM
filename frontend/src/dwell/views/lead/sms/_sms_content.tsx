import React, { FC, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { get, debounce } from 'lodash';
import TimeAgo from 'react-timeago';
import { SmsMessageConversations, ActiveNote as ActiveTab } from 'src/interfaces';
import { getNameInitials } from 'dwell/views/lead/overview/lead_body_content/utils';
import { SmsContentContainer, MessageHeader, ChatAvatar, MessageBody, MessageItem, MessageItemBody, MessageBox, MessageDate } from './styles';

interface SmsContentProps {
  conversations: SmsMessageConversations[],
  activeTab: ActiveTab,
  setActiveTab: (data: ActiveTab) => void,
}

const topHeightOffset = 368;

const SmsContent: FC<SmsContentProps> = ({ conversations, activeTab, setActiveTab }) => {
  const lead = useSelector(state => state.lead.lead);

  const leadFullName = `${lead.first_name} ${lead.last_name}`;
  const headerDate = get(conversations, '[0].date', '');

  const smsContent = useRef(null);

  const handleScroll = () => {
    const container = smsContent.current;

    conversations.forEach((el) => {
      const element = document.getElementById(`sms-${el.id}`);
      const elementOffset = element.getBoundingClientRect().top;

      if (elementOffset <= topHeightOffset) {
        setActiveTab({ id: el.id, isClick: false });
      }
    });

    if (container.scrollHeight - container.scrollTop === container.clientHeight) {
      const lastConversation = conversations[conversations.length - 1];
      setActiveTab({ id: get(lastConversation, 'id'), isClick: false });
    }
  };

  useEffect(() => {
    if (activeTab.isClick) {
      const element = document.getElementById(`sms-${activeTab.id}`);

      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab]);

  const scrollToTab = () => {
    setActiveTab({ id: activeTab.id, isClick: false });
  };

  return (
    <SmsContentContainer>
      <MessageHeader>
        <ChatAvatar>{getNameInitials(leadFullName)}</ChatAvatar>
        <h5>{leadFullName}</h5>
        <span> {moment(headerDate).format('lll')} (<TimeAgo date={moment(headerDate)} />)</span>
      </MessageHeader>
      <MessageBody ref={smsContent} onScroll={!activeTab.isClick ? handleScroll : debounce(scrollToTab, 100)}>
        {conversations.map(el => (
          <MessageItem key={el.id} id={`sms-${el.id}`} reverse={el.is_team_message}>
            <ChatAvatar color={el.is_team_message ? '#15274d' : '#c1c8de'} lg>{getNameInitials(el.is_team_message ? '' : el.lead_name)}</ChatAvatar>
            <MessageItemBody reverse={el.is_team_message}>
              <MessageBox reverse={el.is_team_message}>{el.message}</MessageBox>
              <MessageDate>
                <strong>{el.is_team_message ? 'Property Agent' : el.lead_name}</strong> {moment(el.date).format('lll')}
              </MessageDate>
            </MessageItemBody>
          </MessageItem>
        ))}
      </MessageBody>
    </SmsContentContainer>
  );
};

export default SmsContent;
