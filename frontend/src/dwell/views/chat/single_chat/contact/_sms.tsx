import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import actions from 'dwell/actions/index';
import { isEmpty } from 'lodash';
import cn from 'classnames';
import { Avatar } from 'styles/common';
import { getAvatarColor, getInitials, formatMessageDate, getNoContentText } from 'dwell/views/chat/common/utils';
import Skeleton from 'react-loading-skeleton';
import { LineSkeleton } from 'src/utils';
import {
  ChatBody,
  ChatList,
  ChatListItem,
  ChatListItemBody,
  ChatListItemHeader,
  ChatSubHeader,
  ChatSearch,
  EmptyContent,
} from './styles';

interface ContactListProps extends RouteComponentProps {
  contacts: { id: number, last_message_date: string, unread_count: number, name: string }[],
  activeChats: { id: number }[],
  setChatAsActive: (contact: { id: number, isSMS: boolean, isSingleChat: boolean }) => null,
  isContactsLoading: boolean,
  isContactsLoaded: boolean,
  isNotificationRedirection: boolean,
  lead: { id: number },
  updateNotificationRedirection: (value: boolean) => null,
}

const defaultContacts = new Array(5).fill({ name: 'Contact' }).map((item, i) => ({ ...item, id: i }));

const SMSContact: FC<ContactListProps> = ({ contacts, activeChats, setChatAsActive, isContactsLoading, lead, updateNotificationRedirection,
  isContactsLoaded }) => {
  const [keyword, setKeyword] = useState('');
  const [searchInFocus, setSearchInFocus] = useState(false);

  const scrollToActiveContact = (id) => {
    const contactBar = document.getElementById('contact-bar');
    const scrollHeight = document.getElementById(`option-${id}`);
    if (scrollHeight && contactBar) contactBar.scrollTop = scrollHeight.offsetTop;
  };

  useEffect(() => {
    if (!isEmpty(lead)) {
      // if (!isNotificationRedirection) {
      //   if (contacts.find(c => c.id === lead.id)) setChatAsActive({ id: lead.id, isSMS: true, isSingleChat: true });
      // }
      scrollToActiveContact(lead.id);
      updateNotificationRedirection(false);
    }
  }, [lead]);

  const renderContact = (contact, index) => {
    const lastMessage = (contact.last_message || '').replace(/<br\s*\/?>/gi, ' ').replace(/\s\s+/g, ' ');

    return (
      <React.Fragment key={index}>
        <ChatListItem
          className={cn('active', { new: contact.unread_count, selected: activeChats.map(i => i.id).includes(contact.id) })}
          onClick={() => setChatAsActive({ id: contact.id, isSMS: true, isSingleChat: true })}
          id={`option-${contact.id}`}
          isBlinking={!!contact.unread_count}
          hideOnlineIcon
        >
          {isContactsLoaded ?
            <Avatar className={`avatar offline ${getAvatarColor(contact.name, contact.id, true)}`}>
              <i>{getInitials(contact.name, true)}</i>
            </Avatar> : <Skeleton circle height={46} width={46} />}
          <ChatListItemBody className="body">
            <ChatListItemHeader className="header">
              <h6><span>{isContactsLoaded ? contact.name : <LineSkeleton width={100} height={12} /> }</span></h6>
              <small>{formatMessageDate(contact.last_message_date)}</small>
            </ChatListItemHeader>
            {isContactsLoaded ? <p dangerouslySetInnerHTML={{ __html: lastMessage }} /> : <LineSkeleton width={200} height={9} /> }
          </ChatListItemBody>
        </ChatListItem>
      </React.Fragment>
    );
  };

  const filteredContacts = contacts.filter(i => i.name.toLowerCase().includes(keyword.toLowerCase()));
  const contactsUnread = filteredContacts.filter(contact => contact.unread_count).sort((a, b) => (new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime()));
  const contactsRead = filteredContacts.filter(contact => !contact.unread_count).sort((a, b) => (new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime()));
  let resultContacts = contactsUnread.concat(contactsRead);

  if (isContactsLoading) {
    resultContacts = defaultContacts;
  }

  const emptyContent = (
    <EmptyContent>
      <i className="ri-chat-1-line" />
      <h5><span>{keyword ? 'No Chats Found' : getNoContentText('SMS').label}</span></h5>
      <p>{keyword ? 'Try adjusting your search to find what you’re looking for.' : getNoContentText('SMS').text}</p>
    </EmptyContent>
  );

  const content = resultContacts.length ? resultContacts.map((prospect, index) => renderContact(prospect, index)) : emptyContent;

  return (
    <>
      <ChatSubHeader>
        <ChatSearch onfocus={searchInFocus}>
          <i className="ri-search-line" />
          <input
            type="text"
            className="form-control"
            placeholder="Search SMS contacts"
            value={keyword}
            onChange={({ target: { value } }) => setKeyword(value)}
            onBlur={() => setSearchInFocus(false)}
            onFocus={() => setSearchInFocus(true)}
          />
        </ChatSearch>
      </ChatSubHeader>
      <ChatBody>
        <ChatList tag="ul">
          {content}
        </ChatList>
      </ChatBody>
    </>);
};

const mapStateToProps = state => ({
  activeChats: state.prospectChat.activeChats,
  contacts: state.smsMessage.contacts,
  isContactsLoading: state.smsMessage.isContactsLoading,
  isContactsLoaded: state.smsMessage.isContactsLoaded,
  isNotificationRedirection: state.smsMessage.isNotificationRedirection,
  lead: state.lead.lead,
});

export default connect(
  mapStateToProps,
  {
    ...actions.smsMessage,
    ...actions.prospectChat,
  },
)(withRouter(SMSContact));
