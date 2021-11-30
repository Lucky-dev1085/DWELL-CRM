import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import actions from 'dwell/actions/index';
import cn from 'classnames';
import { SINGLE_CHAT_FILTER } from 'dwell/constants';
import { getAvatarColor, getInitials, formatMessageDate, getSearchPlaceholder, getNoContentText } from 'dwell/views/chat/common/utils';
import { Avatar } from 'styles/common';
import Skeleton from 'react-loading-skeleton';
import { LineSkeleton } from 'src/utils';
import moment from 'moment';
import { useInterval } from 'dwell/components';
import { ChatBody, ChatList, ChatListItem, ChatListItemBody, ChatListItemHeader, ChatSubHeader, ChatSearch, EmptyContent } from './styles';
import ProspectFilter from './_filter';

interface AgentRequest {
  is_active: boolean,
  created: string,
  prospect: number,
  is_declined: boolean,
  id: number
}

interface ContactListProps extends RouteComponentProps {
  prospects: { id: number, name: string, last_message_date: string, is_archived: boolean, is_online: boolean, joined_agents: number[], last_prospect_message_date: string }[],
  currentUser: { id: number, is_available: boolean },
  activeChat: { id: number },
  setChatAsActive: (contact: { id: number, isSMS: boolean, isSingleChat: boolean }) => null,
  isJoinDisabled: boolean,
  isProspectsLoading: boolean,
  isProspectsLoaded: boolean,
  onJoin: (id: number) => null,
  onRejoin: (id: number) => null,
  prospectsRequestedAgents: AgentRequest[],
  setProspectsOffline: (ids: number[]) => void,
}

const defaultProspects = new Array(5).fill({ name: 'Prospect', is_mute: false }).map((item, i) => ({ ...item, id: i }));

const ProspectContacts: FC<ContactListProps> = ({ prospects, currentUser, prospectsRequestedAgents, isProspectsLoading, setChatAsActive, isProspectsLoaded, setProspectsOffline }) => {
  const [blinkingContacts, setBlinkingContacts] = useState([]);
  const [activeFilter, setActiveFilter] = useState(localStorage.getItem(SINGLE_CHAT_FILTER) || 'Active');
  const [keyword, setKeyword] = useState('');
  const [searchInFocus, setSearchInFocus] = useState(false);

  const onActiveFilterClick = (filter) => {
    setActiveFilter(filter);
    localStorage.setItem(SINGLE_CHAT_FILTER, filter);
  };

  let filteredProspects = prospects;
  if (activeFilter === 'All') filteredProspects = prospects.filter(prospect => !prospect.is_archived);
  if (activeFilter === 'Archive') filteredProspects = prospects.filter(prospect => prospect.is_archived);
  if (activeFilter === 'Active') filteredProspects = prospects.filter(prospect => prospect.is_online && !prospect.is_archived);
  if (activeFilter === 'My') filteredProspects = prospects.filter(prospect => prospect.joined_agents.includes(currentUser.id) && !prospect.is_archived);
  filteredProspects = filteredProspects.filter(prospect => prospect.name.toLowerCase().includes(keyword.toLowerCase()))
    .sort((a, b) => (new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime()));

  if (isProspectsLoading) {
    filteredProspects = defaultProspects;
  }
  useEffect(() => {
    const isActiveRequests = prospectsRequestedAgents.some(request => request.is_active && !request.is_declined);
    if (isActiveRequests) {
      setBlinkingContacts([...prospectsRequestedAgents.filter(request => request.is_active && !request.is_declined).map(r => r.prospect).slice()]);

      setTimeout(() => {
        setBlinkingContacts([]);
      }, 30000);
    } else {
      setBlinkingContacts([]);
    }
  }, [prospectsRequestedAgents]);

  const checkOfflineProspects = () => {
    const prospectIds = prospects
      .filter(prospect => prospect.is_online &&
          moment().diff(moment(prospect.last_prospect_message_date), 'minutes') > 5)
      .map(prospect => prospect.id);
    if (prospectIds.length > 0) {
      setProspectsOffline(prospectIds);
    }
  };

  useInterval(() => {
    checkOfflineProspects();
  }, 60000);

  const renderContact = (prospect, index) => {
    const lastMessage = (prospect.last_message || '').replace(/<br\s*\/?>/gi, ' ')
      .replace(/\s\s+/g, ' ').replace(/<\/?h[0-9]>/g, ' ')
      .replace(/<\/?p>/g, '');
    const contactMessage = blinkingContacts.includes(prospect.id) ? 'Prospect requesting live agent' : lastMessage;

    return (
      <ChatListItem
        className={cn('active', { new: prospect.unread_count })}
        key={index}
        isBlinking={blinkingContacts.includes(prospect.id)}
        onClick={isProspectsLoaded ? () => setChatAsActive({ id: prospect.id, isSMS: false, isSingleChat: true }) : null}
      >
        {isProspectsLoaded ?
          <Avatar className={cn(`avatar ${getAvatarColor(prospect.name, prospect.id)}`, { offline: !prospect.is_online, online: prospect.is_online })}>
            <i>{getInitials(prospect.name)}</i>
          </Avatar> : <Skeleton circle height={46} width={46} />}
        <ChatListItemBody className="body">
          <ChatListItemHeader className="header">
            <h6><span>{isProspectsLoaded ? prospect.name : <LineSkeleton width={100} height={12} /> }</span></h6>
            {prospect.is_mute ? <span className="mute-indicator"><i className="ri-notification-off-fill" /></span> : null}
            <small>{isProspectsLoaded ? formatMessageDate(prospect.last_message_date) : <LineSkeleton width={40} height={8} />}</small>
          </ChatListItemHeader>
          {isProspectsLoaded ? <p dangerouslySetInnerHTML={{ __html: contactMessage }} /> : <LineSkeleton width={200} height={9} />}
        </ChatListItemBody>
      </ChatListItem>
    );
  };

  const emptyContent = (
    <EmptyContent>
      <i className="ri-chat-1-line" />
      <h5><span>{keyword ? 'No Chats Found' : getNoContentText(activeFilter).label}</span></h5>
      <p>{keyword ? 'Try adjusting your search to find what you’re looking for.' : getNoContentText(activeFilter).text}</p>
    </EmptyContent>
  );
  const content = filteredProspects.length ? filteredProspects.map((prospect, index) => renderContact(prospect, index)) : emptyContent;

  return (
    <>
      <ChatSubHeader>
        <ChatSearch onfocus={searchInFocus}>
          <i className="ri-search-line" />
          <input
            type="text"
            className="form-control m-0"
            placeholder={getSearchPlaceholder(activeFilter)}
            value={keyword}
            onChange={({ target: { value } }) => setKeyword(value)}
            onBlur={() => setSearchInFocus(false)}
            onFocus={() => setSearchInFocus(true)}
          />
        </ChatSearch>
        <ProspectFilter activeFilter={activeFilter} setActiveFilter={onActiveFilterClick} />
      </ChatSubHeader>
      <ChatBody>
        <ChatList>
          {content}
        </ChatList>
      </ChatBody>
    </>);
};

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  isProspectsLoading: state.prospectChat.isProspectsLoading,
  isProspectsLoaded: state.prospectChat.isProspectsLoaded,
  activeChat: state.prospectChat.activeChat,
  prospects: state.prospectChat.prospects.filter(p => p.should_display_in_chat),
  prospectsRequestedAgents: state.prospectChat.prospectsRequestedAgents,
});

export default connect(
  mapStateToProps,
  {
    ...actions.lead,
    ...actions.smsMessage,
    ...actions.prospectChat,
  },
)(withRouter(ProspectContacts));
