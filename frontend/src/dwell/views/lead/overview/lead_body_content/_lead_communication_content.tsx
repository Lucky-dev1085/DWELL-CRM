import React, { FC, useEffect, useState, useRef } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { CardBody as ItemBody } from 'reactstrap';
import { useSelector } from 'react-redux';
import moment from 'moment';
import TimeAgo from 'react-timeago';
import { get, debounce, orderBy } from 'lodash';
import { ActiveNote as ActiveTab, Communication } from 'src/interfaces';
import { timeFormatter } from 'dwell/constants';
import { CommunicationContent, CommunicationItem, CommunicationWrapper, ItemCard, ItemHeader, Avatar, TitleWrapper, BodyHeader, BodyTitle,
  GreenBadge, TimeWrapper, StickyDay, CommunicationByDayWrapper, ChatTitle, DayDivider, DayWrapper, HeaderWrapper } from './styles';
import CallDetail from './_call_detail';
import { getIconAndLabel, getIconColor, getChatTitle, prepareCommunicationByDay } from './utils';
import EmailDetail from './_email_detail';
import LeadContentsFooter from './_lead_content_footer';
import CommunicationActivity from './_communication_activity';

interface LeadCommunicationContentProps extends RouteComponentProps {
  communications: Communication[],
  activeTab: ActiveTab,
  setActiveTab: (data: ActiveTab) => void,
  isShared: boolean,
  audioPlayId: { id: number, isPlay: boolean },
  handlePlay: ({ id: number, isPlay: boolean }) => void,
}

const topHeightOffset = 310;

const LeadCommunicationContent: FC<LeadCommunicationContentProps> = ({ communications, activeTab, setActiveTab, location: { state }, isShared, audioPlayId, handlePlay }) => {
  const [itemClickId, setClickId] = useState(null);
  const [communicationByDay, setCommunicationByDay] = useState({});
  const commContent = useRef(null);

  const lead = useSelector(s => s.lead.lead);

  const handleScroll = () => {
    const container = commContent.current;

    communications.forEach(({ object: comm, type }) => {
      const isChat = type === 'CHATS';
      const element = document.getElementById(`comm-${isChat ? get(comm, '[0].id') : comm.id}`);
      const elementOffset = element.getBoundingClientRect().top;

      if (elementOffset <= topHeightOffset) {
        setActiveTab({ id: isChat ? get(comm, '[0].id') : comm.id, isClick: false });
      }
    });

    if (container.scrollHeight - container.scrollTop === container.clientHeight) {
      const { object: comm, type } = communications[communications.length - 1];
      const isChat = type === 'CHATS';
      setActiveTab({ id: isChat ? get(comm, '[0].id') : comm.id, isClick: false });
    }

    if (itemClickId) setClickId(null);
  };

  useEffect(() => {
    if (activeTab.isClick) {
      const element = document.getElementById(`comm-${activeTab.id}`);

      if (element) element.scrollIntoView(activeTab.isLast ? {} : { behavior: 'smooth' });

      setClickId(activeTab.id);
    }
  }, [activeTab]);

  useEffect(() => {
    setCommunicationByDay(prepareCommunicationByDay(communications));
  }, [communications]);

  const scrollToTab = () => {
    setActiveTab({ id: activeTab.id, isClick: false });
  };

  const handleClickItem = (id) => {
    setActiveTab({ id, isClick: false });
    if (itemClickId) setClickId(null);
  };

  const communicationCall = (call, isPropertyCommunication, date, index) => {
    const isRecentDate = Math.abs(moment(date).diff(moment(), 'm')) <= 5;
    const isClicked = itemClickId === call.id;
    const dateTitle = moment(date).format('lll');
    const isCurrent = audioPlayId.id === call.id;
    const isPlaying = isCurrent && audioPlayId.isPlay;
    const color = isPlaying ? '#f86c6b' : getIconColor(isPropertyCommunication);
    return (
      <CommunicationItem
        key={call.id}
        className={isPropertyCommunication ? 'flex-row-reverse' : ''}
        id={`comm-${call.id}`}
        onClick={() => handleClickItem(call.id)}
        $first={!index}
      >
        <CommunicationWrapper reverse={isPropertyCommunication}>
          <ItemCard selected={isClicked}>
            <ItemHeader borderBottomNone>
              <Avatar color={color}><i className={isPlaying ? 'ri-volume-up-line' : 'ri-phone-line'} /></Avatar>
              <TitleWrapper>
                <BodyHeader>
                  <span>{lead.first_name} {lead.last_name} - Outbound Call</span>
                  {isRecentDate ?
                    <GreenBadge title={dateTitle}>JUST NOW</GreenBadge> :
                    <TimeWrapper>
                      <span>{<TimeAgo date={dateTitle} title={dateTitle} formatter={timeFormatter} />}</span>
                      <span>{dateTitle}</span>
                    </TimeWrapper>}
                </BodyHeader>
                <BodyTitle>
                  <h6 className="mb-0">{call.call_result === 'no-answer' ? 'Missed' : 'Answered'}</h6>
                </BodyTitle>
              </TitleWrapper>
            </ItemHeader>
            <CallDetail
              call={call}
              isPlaying={isCurrent}
              handlePlay={handlePlay}
            />
          </ItemCard>
        </CommunicationWrapper>
      </CommunicationItem>
    );
  };

  const communicationSMS = (sms, isPropertyCommunication, date, index) => {
    const isRecentDate = Math.abs(moment(date).diff(moment(), 'm')) <= 5;
    const isClicked = itemClickId === sms.id;
    const dateTitle = moment(date).format('lll');
    const name = isPropertyCommunication ? sms.agent_name : sms.lead_name;
    return (
      <CommunicationItem
        key={sms.id}
        className={isPropertyCommunication ? 'flex-row-reverse' : ''}
        id={`comm-${sms.id}`}
        onClick={() => handleClickItem(sms.id)}
        $first={!index}
      >
        <CommunicationWrapper reverse={isPropertyCommunication}>
          <ItemCard selected={isClicked}>
            <ItemHeader>
              <Avatar color={getIconColor(isPropertyCommunication)}><i className="ri-chat-3-line" /></Avatar>
              <TitleWrapper>
                <BodyHeader>
                </BodyHeader>
                <BodyTitle>
                  <h6 className="mb-0">SMS from: {name}</h6>
                  {isRecentDate ?
                    <GreenBadge title={dateTitle}>JUST NOW</GreenBadge> :
                    <TimeWrapper sms>
                      <span>{<TimeAgo date={dateTitle} title={dateTitle} formatter={timeFormatter} />}</span>
                      <span>{dateTitle}</span>
                    </TimeWrapper>}
                </BodyTitle>
              </TitleWrapper>
            </ItemHeader>
            <ItemBody>
              <p className="mb-0">{sms.message}</p>
            </ItemBody>
          </ItemCard>
        </CommunicationWrapper>
      </CommunicationItem>
    );
  };

  const communicationChat = (chat, isPropertyCommunication, date, index) => {
    const isRecentDate = Math.abs(moment(date).diff(moment(), 'm')) <= 5;
    const isClicked = itemClickId === get(chat, '[0].id');
    const dateTitle = moment(date).format('lll');
    let name;
    if (isPropertyCommunication) {
      const filteredChat = chat.filter(item => item.agent_name)[0];
      if (filteredChat) name = filteredChat.agent_name;
    } else {
      name = `${lead.first_name} ${lead.last_name}`;
    }

    const chatTitle = getChatTitle(chat);
    const countMessages = chat.filter(c => !['AGENT_REQUEST', 'JOINED'].includes(c.type)).length;
    const sourceChat = chat.find(el => el.source);

    return (
      <CommunicationItem
        key={get(chat, '[0].id')}
        className={isPropertyCommunication ? 'flex-row-reverse' : ''}
        id={`comm-${get(chat, '[0].id')}`}
        onClick={() => handleClickItem(get(chat, '[0].id'))}
        $first={!index}
      >
        <CommunicationWrapper reverse={isPropertyCommunication}>
          <ItemCard selected={isClicked}>
            <ItemHeader>
              <Avatar color={getIconColor(isPropertyCommunication)}><i className="ri-rocket-fill" /></Avatar>
              <TitleWrapper>
                <BodyHeader>
                  <HeaderWrapper>{name ? `${name} - ` : ''}{countMessages} Chat {countMessages === 1 ? 'Message' : 'Messages'} {sourceChat ? `- ${sourceChat.source}` : ''}</HeaderWrapper>
                  {isRecentDate ?
                    <GreenBadge title={dateTitle}>JUST NOW</GreenBadge> :
                    <TimeWrapper>
                      <span>{<TimeAgo date={dateTitle} title={dateTitle} formatter={timeFormatter} />}</span>
                      <span>{dateTitle}</span>
                    </TimeWrapper>}
                </BodyHeader>
                <BodyTitle>
                  <ChatTitle>{chatTitle}</ChatTitle>
                </BodyTitle>
              </TitleWrapper>
            </ItemHeader>
            <ItemBody>
              {orderBy(chat.filter(c => c.type !== 'AGENT_REQUEST'), 'date', 'asc').map((item, i) => getIconAndLabel(item, i, `${lead.first_name} ${lead.last_name}`))}
            </ItemBody>
          </ItemCard>
        </CommunicationWrapper>
      </CommunicationItem>
    );
  };

  const renderCommunicationType = (type, el, date, isPropertyCommunication, index) => {
    switch (type) {
      case 'NOTE':
      case 'ACTIVITY':
        return <CommunicationActivity activity={el} date={date} handleClickItem={handleClickItem} itemClickId={itemClickId} indexEl={index} type={type} key={el.id} />;
      case 'EMAIL':
        return <EmailDetail communication={el} isPropertyCommunication={isPropertyCommunication} index={index} date={date} handleClickItem={handleClickItem} itemClickId={itemClickId} key={el.id} />;
      case 'CALL':
        return communicationCall(el, isPropertyCommunication, date, index);
      case 'SMS':
        return communicationSMS(el, isPropertyCommunication, date, index);
      case 'CHATS':
        return communicationChat(el, isPropertyCommunication, date, index);
      default:
        return null;
    }
  };

  return (
    <React.Fragment>
      <CommunicationContent onScroll={!activeTab.isClick ? handleScroll : debounce(scrollToTab, 100)} ref={commContent} >
        {Object.keys(communicationByDay).map((key, index) => {
          const isFirst = !index;
          return (
            <CommunicationByDayWrapper key={index} $isFirst={isFirst}>
              {!isFirst && <DayDivider />}
              <DayWrapper><StickyDay>{communicationByDay[key].label}</StickyDay></DayWrapper>
              {communicationByDay[key].communications.map(({ object: el, type, date, is_property_communication }, i) => renderCommunicationType(type, el, date, is_property_communication, i))}
            </CommunicationByDayWrapper>
          );
        })}
      </CommunicationContent>
      <LeadContentsFooter isShared={isShared} stateDetail={state || { openComposer: false }} />
    </React.Fragment>
  );
};

export default withRouter(LeadCommunicationContent);
