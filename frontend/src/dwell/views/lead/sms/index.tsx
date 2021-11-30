import React, { useState, useEffect, FC } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import TimeAgo from 'react-timeago';
import prospectChatAction from 'dwell/actions/prospect_chat';
import smsMessageAction from 'dwell/actions/sms_message';
import moment from 'moment';
import { sortBy } from 'lodash';
import { ActiveNote as ActiveTab, SmsMessageConversations } from 'src/interfaces';
import { LineSkeleton } from 'src/utils';
import { LeadPanelBody, LeadPanelSideBar } from 'dwell/views/lead/overview/lead_body_content/styles';
import { getNameInitials } from 'dwell/views/lead/overview/lead_body_content/utils';
import { getLeadId } from 'dwell/views/lead/layout/utils';
import { timeFormatter } from 'dwell/constants';
import { EmptyContent, PrimaryButton } from 'styles/common';
import { SideBarHeader, HeaderLabel, SideBarContent, ChatItem, ChatAvatar, ChatItemBody, ChatText, ChatBodyHeader, TimeWrapper } from './styles';
import SmsContent from './_sms_content';
import { isElementInViewport } from './utils';

const LeadSms: FC<RouteComponentProps> = ({ location: { pathname } }) => {
  const [conversations, setConversations] = useState(null);
  const [activeTab, setActiveTab] = useState({ id: -1, isClick: false } as ActiveTab);

  const dispatch = useDispatch();
  const countConversations = useSelector(state => state.smsMessage.count);
  const isConversationsLoaded = useSelector(state => state.smsMessage.isConversationsLoaded);
  const lead = useSelector(state => state.lead.lead);

  const { setChatAsActive } = prospectChatAction;
  const { getConversationById } = smsMessageAction;

  const leadId = getLeadId(pathname);

  useEffect(() => {
    dispatch(getConversationById({
      lead: leadId,
      params: { offset: 0 },
    })).then(({ result: { data: { results } } }) => {
      const sortResult = sortBy(results, (o: { date: string }) => new Date(o.date)) as SmsMessageConversations[];
      setConversations(sortResult);

      if (sortResult && sortResult.length) {
        setActiveTab({ id: sortResult[0].id, isClick: false });
      }
    });
  }, []);

  useEffect(() => {
    const element = document.getElementById(`side-${activeTab.id}`);

    if (element && !isElementInViewport(element)) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab]);

  const openSmsWindow = () => {
    dispatch(setChatAsActive({ id: leadId, isSMS: true, isSingleChat: true }));
  };

  const emptyContent = (
    <EmptyContent>
      <i className="ri-chat-1-line" />
      <h5><span>No SMS activity yet</span></h5>
      <p>When you send SMS to leads, we'll show the SMS conversations here</p>
      {lead.phone_number &&
        <PrimaryButton onClick={openSmsWindow}>
          <span><i className="ri-chat-1-line" /></span> Send SMS
        </PrimaryButton>}
    </EmptyContent>
  );

  const conversationsList = isConversationsLoaded && conversations ? conversations : Array(8).fill('');

  return (
    <React.Fragment>
      {conversations && !conversations.length ? emptyContent :
        <LeadPanelBody>
          <LeadPanelSideBar>
            <SideBarHeader>
              <HeaderLabel>
                SMS <span>{isConversationsLoaded && countConversations}</span>
              </HeaderLabel>
            </SideBarHeader>
            <SideBarContent>
              {conversationsList.map((el, index) => {
                const preparedMessage = el && `${el.message.substring(0, 72)}${el.message.length > 75 ? '...' : ''}`;

                return (
                  !el ?
                    <ChatItem key={index}>
                      <LineSkeleton height={38} width={38} circle />
                      <ChatItemBody>
                        <ChatBodyHeader>
                          <LineSkeleton height={9} width={120} />
                          <LineSkeleton height={8} width={80} />
                        </ChatBodyHeader>
                        <LineSkeleton height={8} />
                        <LineSkeleton height={8} width={150} />
                      </ChatItemBody>
                    </ChatItem> :
                    <ChatItem
                      key={index}
                      id={`side-${el.id}`}
                      onClick={() => setActiveTab({ id: el.id, isClick: true })}
                      selected={activeTab.id === el.id}
                    >
                      <ChatAvatar color={el.is_team_message ? '#15274d' : '#c1c8de'}>{getNameInitials(el.is_team_message ? '' : el.lead_name)}</ChatAvatar>
                      <ChatItemBody>
                        <ChatBodyHeader>
                          <h6>{el.is_team_message ? 'Property Agent' : el.lead_name}</h6>
                          <TimeWrapper>
                            <small>{<TimeAgo date={moment(el.date).format('lll')} formatter={timeFormatter} />}</small>
                            <small>{moment(el.date).format('ll')}</small>
                          </TimeWrapper>
                        </ChatBodyHeader>
                        <ChatText dangerouslySetInnerHTML={{ __html: preparedMessage }} />
                      </ChatItemBody>
                    </ChatItem>
                );
              })}
            </SideBarContent>
          </LeadPanelSideBar>
          {isConversationsLoaded && conversations && <SmsContent conversations={conversations} activeTab={activeTab} setActiveTab={setActiveTab} />}
        </LeadPanelBody>}
    </React.Fragment>
  );
};

export default withRouter(LeadSms);
