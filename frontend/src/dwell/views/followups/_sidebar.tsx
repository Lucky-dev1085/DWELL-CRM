import React, { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import moment from 'moment';
import TimeAgo from 'react-timeago';
import cn from 'classnames';
import { Spinner } from 'reactstrap';
import actions from 'dwell/actions';
import { timeFormatter } from 'dwell/constants';
import { isEmpty } from 'codemirror/src/util/misc';
import { ListResponse, EmailMessageProps } from 'src/interfaces';
import Skeleton from 'react-loading-skeleton';
import { CheckboxSkeleton, LineSkeleton } from 'src/utils';
import { getInitials, getColor } from './utils';
import { EmailSidebarHeader, EmailSidebarHeaderTitle, EmailGroup, EmailItem, SenderAvatar, EmailSidebar, EmailItemBody,
  EmailItemHeader, EmailText, EmailSubject, ArchiveButton, NavPager, NavButtons, ShowMoreButton, ShowMoreButtonContainer,
  SidebarBody, FormCheckBox, TimeWrapper,
} from './styles';

const defaultMessageData = () => new Array(5).fill({
  receiver_name: '',
  receiver_email: '',
  sender_name: '',
  sender_email: '',
  snippet: '',
  subject: '',
  is_unread: true,
  lead: null,
  date: '',
  body: '',
  subjectSnippet: { subject: '', snippet: '' },
  attachments: [],
}).map((item, index) => ({ ...item, id: index + 1 }));

interface SidebarProps extends RouteComponentProps {
  property: { nylas_status: string, external_id: string },
  isArchiving: boolean,
  activeMessageId: number,
  messages: EmailMessageProps[],
  conversations: EmailMessageProps[],
  messagesCount: number,
  setActiveMessageId: (activeId: number) => unknown,
  archiveMessages: ({ ids } : { ids: number[] }) => void,
  getMessages: ({ offset, limit }: { offset: number, limit: number }) => Promise<ListResponse>,
  updateMessageById: (id: number, data: { is_unread: boolean }) => null,
  isLeadPage: boolean,
  isLoaded: boolean,
}

const Sidebar: FC<SidebarProps> = ({ activeMessageId, setActiveMessageId, messagesCount, property, isArchiving,
  archiveMessages, messages: followupMessages, getMessages, updateMessageById, isLeadPage, conversations, isLoaded }) => {
  const messages = isLeadPage ? conversations : followupMessages;
  const [selected, setSelected] = useState([]);

  const loadMessages = (limit = 10) => getMessages({ offset: messages.length, limit });

  useEffect(() => {
    if (!isLeadPage) loadMessages(20);
  }, []);

  const handleOnSelect = (id) => {
    const isSelect = selected.includes(id);
    const ids = !isSelect ? [...selected, id] : selected.filter(x => x !== id);
    setSelected(ids);
  };

  const handleOnSelectAll = (checked) => {
    setSelected(checked ? messages.map(i => i.id) : []);
  };

  const archiveSelected = () => {
    archiveMessages({ ids: selected });
  };

  useEffect(() => {
    if (messages.length) {
      if (!activeMessageId) {
        setActiveMessageId(messages[0].id);
      } else {
        const message = messages.find(i => i.id === activeMessageId);
        if (!message) {
          setActiveMessageId(messages[0].id);
        }
      }
    }
  }, [messages]);

  const getDate = (date) => {
    const currentDate = Date.now();
    if (moment(date).isSame(currentDate, 'day') &&
        moment(date).isSame(currentDate, 'month') &&
    moment(date).isSame(currentDate, 'year')
    ) {
      return moment(date).format('LT');
    } else if (moment(date).isSame(currentDate, 'year')) {
      return moment(date).format('MMM DD h:mm a');
    }
    return moment(date).format('MMM DD YYYY h:mm a');
  };

  const onContactChange = (messageId) => {
    setActiveMessageId(messageId);

    const message = messages.find(i => i.id === messageId);
    if (message && message.is_unread === true) {
      updateMessageById(messageId, { is_unread: false });
    }
  };

  const messagesData = isLoaded ? messages : defaultMessageData();
  const content = messagesData.map((message, index) => (
    <EmailItem
      id={`message${index}`}
      key={`message${index}`}
      className={cn({ active: activeMessageId === message.id, unread: message.is_unread, checked: selected.includes(message.id) })}
      onClick={() => onContactChange(message.id)}
    >
      {!isLeadPage && (
        <>
          {isLoaded ?
            <FormCheckBox onClick={() => handleOnSelect(message.id)} checked={selected.includes(message.id)}>
              <input id={`row${index}`} type="checkbox" />
            </FormCheckBox> :
            <CheckboxSkeleton />}
        </>
      )}
      {isLoaded ?
        <SenderAvatar className={getColor(message.sender_email)} showLinkedMark={message.lead && !isLeadPage}>
          <span>{getInitials(message.sender_name)}</span>
        </SenderAvatar> :
        <Skeleton circle height={40} width={40} />
      }
      <EmailItemBody>
        <EmailItemHeader>
          {isLoaded ? <span>{ message.sender_name}</span> : <LineSkeleton width={100} height={9} />}
          {isLoaded ?
            <TimeWrapper>
              <span>{<TimeAgo date={message.date} formatter={timeFormatter} />}</span>
              <span>{getDate(message.date)}</span>
            </TimeWrapper> :
            <LineSkeleton width={50} height={9} />}
        </EmailItemHeader>
        <EmailSubject>{isLoaded ? message.subject : <LineSkeleton width={160} height={12} />}</EmailSubject>
        <EmailText>{isLoaded ? `${(message.snippet).substring(0, 72)} ${(message.snippet).length > 75 ? '...' : ''}` :
          <>
            <LineSkeleton width={270} height={8} />
            <LineSkeleton width={215} height={8} />
          </>}
        </EmailText>
      </EmailItemBody>
    </EmailItem>
  ));

  const ArrowNavigation = (step) => {
    const index = messages.findIndex(i => i.id === activeMessageId);
    if (step === 'increment') {
      if (index < messages.length - 1) {
        onContactChange(messages[index + 1].id);
      } else if (!isLeadPage && messagesCount !== messages.length) {
        loadMessages().then(({ result: { data } }) => {
          if (data.results.length) onContactChange(data.results[messages.length + 1].id);
        });
      }
    } else if (step === 'decrement' && index > 0) {
      onContactChange(messages[index - 1].id);
    }
  };

  return (
    <React.Fragment>
      <EmailSidebar isLeadPage={isLeadPage}>
        <EmailSidebarHeader>
          {!isLeadPage && (
            <>
              {isLoaded ?
                <FormCheckBox className="mr-0" onClick={() => handleOnSelectAll(selected.length !== messages.length)} checked={selected.length === messages.length}>
                  <input id="ckAll" type="checkbox" />
                </FormCheckBox> :
                <CheckboxSkeleton />}
            </>)}
          {isLoaded ?
            <EmailSidebarHeaderTitle className="mg-l-10 mg-r-auto">
            Followups <span>{isLeadPage ? conversations.length : messagesCount}</span>
            </EmailSidebarHeaderTitle> :
            <LineSkeleton width={100} height={12} />}
          {!isEmpty(selected) && !isLeadPage &&
            <>
              {isArchiving && <Spinner size="sm" className="mr-2" />}
              <ArchiveButton className="btn" onClick={archiveSelected} disabled={isArchiving || ['DISCONNECTED', 'AUTH_REQUIRED'].includes(property.nylas_status)}>
                <i className="ri-inbox-archive-line" /> Archive
              </ArchiveButton>
            </>
          }
          {isLoaded &&
          <NavPager className="nav nav-pager mg-l-5">
            <NavButtons className="nav-link" data-toggle="tooltip" title="Newer messages" onClick={() => ArrowNavigation('decrement')}>
              <i className="ri-arrow-left-s-line" />
            </NavButtons>
            <NavButtons className="nav-link" data-toggle="tooltip" title="Older messages" onClick={() => ArrowNavigation('increment')}>
              <i className="ri-arrow-right-s-line" />
            </NavButtons>
          </NavPager>}
        </EmailSidebarHeader>
        <SidebarBody>
          <EmailGroup>
            {content}
            {(!isLeadPage && messagesCount !== messages.length) ? (
              <ShowMoreButtonContainer>
                <ShowMoreButton className="btn btn-secondary" onClick={() => loadMessages()}>
                  <span>Show more ({ messagesCount - messages.length })</span>
                </ShowMoreButton>
              </ShowMoreButtonContainer>
            ) : null}
          </EmailGroup>
        </SidebarBody>
      </EmailSidebar>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  messages: state.emailMessage.messages,
  conversations: state.emailMessage.conversations,
  messagesCount: state.emailMessage.messagesCount,
  isLoaded: state.emailMessage.isFollowupMessagesLoaded,
  isArchiving: state.nylas.isArchiving,
  property: state.property.property,
});

export default connect(
  mapStateToProps,
  {
    ...actions.emailMessage,
    ...actions.user,
    ...actions.lead,
    ...actions.nylas,
    ...actions.property,
    ...actions.pusher,
  },
)(withRouter(Sidebar));
