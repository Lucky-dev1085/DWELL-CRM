import React from 'react';
import moment from 'moment';
import { get } from 'lodash';
import { CommunicationObject, Communication } from 'src/interfaces';
import { MessageItem, Avatar, MessageBody, AgentJoinedText, AvatarImg } from './styles';

interface Chat {
  message?: string,
  type?: string,
}

interface CommunicationByDay {
  [field: string]: { label: string, communications: Communication[] },
}

export const getNameInitials = (fullName: string): string => (fullName ? fullName.match(/\b(\w)/g).join('') : 'PA');

export const quote = '<i class="ri-double-quotes-l"></i>';

export const prospectTemplateMessage = ['I have a Question', 'View Photos', 'Check Prices / Availability', 'Text me',
  'Nevermind, cancel tour', 'I’d like to schedule a tour', 'Transfer to live agent', 'Cancel Tour', 'Nevermind', 'Edit / Reschedule Tour',
  'No Thanks', 'Yes, have a live agent join'];

export const getIconAndLabel = ({ type, message, date, agent_name, agent_avatar }: CommunicationObject, i: number, name: string): JSX.Element => {
  let icon = <></>;
  let label = '';
  let isReversed = false;
  let isQuote = false;
  let joinedText = null;
  if (['BOT', 'GREETING'].includes(type)) {
    icon = <i className="ri-rocket-2-fill" />;
    label = 'Hobbes';
  }
  if (type === 'PROSPECT') {
    icon = <span>{getNameInitials(name)}</span>;
    label = name;
    isReversed = true;
    isQuote = !message.startsWith('<div') && !prospectTemplateMessage.includes(message);
  }
  if (['AGENT', 'DATA_CAPTURE', 'TEMPLATE'].includes(type)) {
    icon = agent_avatar ? <AvatarImg src={agent_avatar} alt="avatar" /> : <span>{getNameInitials(agent_name)}</span>;
    label = agent_name;
    isQuote = type !== 'DATA_CAPTURE' && !message.startsWith('<div');
  }
  if (type === 'JOINED') {
    icon = <i className="ri-group-line" />;
    joinedText = (
      <AgentJoinedText>
        {agent_name} has entered the chat.
        <small>&nbsp;&nbsp;({moment(date).format('MMM DD, hh:mma')})</small>
      </AgentJoinedText>
    );
  }
  return (
    <MessageItem key={i} reverse={!isReversed} agentJoined={type === 'JOINED'}>
      {type !== 'JOINED' && <Avatar isChat gray={!isReversed}>{icon}</Avatar>}
      <MessageBody reverse={!isReversed}>
        {joinedText || (
          <>
            <div dangerouslySetInnerHTML={{ __html: isQuote ? `${quote} ${message}` : message }} />
            <p>
              <strong>{label}</strong>
              {moment(date).format('lll')}
            </p>
          </>
        )}
      </MessageBody>
    </MessageItem>
  );
};

export const getIconColor = (isPropertyCommunication: boolean): string | boolean => {
  if (isPropertyCommunication === true) {
    return '#15274d';
  }
  if (isPropertyCommunication === false) {
    return '#6c4cd6';
  }
  return false;
};

export const isElementInViewport = (el: Element, isLease: boolean): boolean => {
  const rect = el.getBoundingClientRect();
  const topDiff = isLease ? 346 : 288;

  return rect.top >= topDiff && rect.bottom <= document.documentElement.clientHeight;
};

export const overrideSpeakerLabelStyles = (speaker: string): void => {
  const rows = Array.from(document.querySelectorAll(`span[title="${speaker}"]`));
  rows.forEach((row) => {
    const label = speaker === 'Speaker 0' ? 'A' : 'B';
    const avatarColor = speaker === 'Speaker 0' ? '#15274d' : '#0168fa';
    const speakerElement = document.createElement('li') as HTMLElement;
    speakerElement.className = 'list-group-item';
    speakerElement.innerHTML = `<div class="avatar" style="background: ${avatarColor};"><span>${label}</span></div>`;
    row.replaceWith(speakerElement);

    speakerElement.nextSibling.replaceWith('');

    const sibling = speakerElement.parentNode.nextSibling as HTMLElement;
    sibling.style.paddingLeft = '30px';
    sibling.style.paddingRight = '30px';
    sibling.style.margin = 'auto 0';

    const parent = speakerElement.parentNode.parentNode as HTMLElement;
    parent.style.marginTop = '3px';
    parent.style.marginBottom = '3px';
    parent.className += ' transcription-wrapper';

    const parentOfParent = speakerElement.parentNode.parentNode.parentNode as HTMLElement;
    parentOfParent.style.borderTopWidth = '1px';
    parentOfParent.style.borderColor = '#f0f2f9';
    parentOfParent.style.borderTopStyle = 'solid';
  });
};

export const getChatTitle = (chat: Chat[]): string => {
  let activity = '';
  let representative = '';
  let hasCheckPricePrompt = false;
  let hasViewPhotosPrompt = false;
  let hasResidentAccessPrompt = false;
  let hasAgentRequest = false;
  let hasTourScheduled = false;
  let hasTourCanceled = false;
  let hasTourAccessed = false;
  let hasTourUpdated = false;
  let hasGuestCard = false;
  let hasTextMe = false;
  let isAgentChat = false;
  let isHobbesChat = false;
  chat.forEach((item) => {
    const message = item.message || '';
    const isTourScheduled = message.includes('1. Tour type') && message.includes('. Bedrooms');

    if (message.includes('Your tour is booked!') || isTourScheduled) hasTourScheduled = true;
    if (['Tour Canceled Successfully', 'Tour Cancelled Successfully'].includes(message)) hasTourCanceled = true;
    if (message.includes('Your upcoming tour')) hasTourAccessed = true;
    if (message.includes('Your tour has been updated!')) hasTourUpdated = true;
    if (message.includes('2. Email') && item.message.includes('3. Phone')) hasGuestCard = true;
    if (message.includes('You\'ll be receiving a text shortly to connect you to someone')) hasTextMe = true;
    if (message.includes('Check Prices / Availability')) hasCheckPricePrompt = true;
    if (message.includes('View Photos')) hasViewPhotosPrompt = true;
    if (message.includes('Resident Access')) hasResidentAccessPrompt = true;
    if (message.includes('Transfer to live agent')) hasAgentRequest = true;
    if (['AGENT', 'DATA_CAPTURE', 'TEMPLATE'].includes(item.type)) isAgentChat = true;
    if (item.type === 'BOT') isHobbesChat = true;
  });

  if (isAgentChat) representative += 'Chat w/ Agent | ';
  if (isHobbesChat) representative += 'Chat w/ Hobbes | ';

  if (hasTourScheduled) activity += 'Tour Scheduled | ';
  if (hasTourCanceled) activity += 'Tour Canceled | ';
  if (hasTourAccessed) activity += 'Tour Accessed | ';
  if (hasTourUpdated) activity += 'Tour Updated | ';
  if (hasGuestCard) activity += 'Guest Card Created | ';
  if (hasTextMe) activity += 'Text Me | ';

  if (!activity) {
    if (hasCheckPricePrompt) activity += 'Prices / Availability clicked | ';
    if (hasViewPhotosPrompt) activity += 'View Photos clicked | ';
    if (hasResidentAccessPrompt) activity += 'Resident Access | ';
    if (hasAgentRequest) activity += 'Live Agent Request | ';
  }

  activity = activity.slice(0, -3);
  representative = representative.slice(0, -3);

  let chatTitle = '';
  if (activity && representative) chatTitle = `${representative} - ${activity}`;
  else if (activity) chatTitle = activity;
  else if (representative) chatTitle = representative;

  return chatTitle;
};

export const prepareCommunicationByDay = (communications: Communication[]): CommunicationByDay => {
  const communicationsByDay = {} as CommunicationByDay;

  communications.forEach((el) => {
    const dateDiff = moment(moment()).diff(el.date, 'days');
    const isToday = moment(el.date).isSame(moment(), 'day');
    if (isToday) {
      if (!get(communicationsByDay, 'today.communications')) communicationsByDay.today = { label: 'Today', communications: [] };
      communicationsByDay.today.communications.push(el);
    } else if (!isToday && dateDiff <= 1) {
      if (!get(communicationsByDay, 'yesterday.communications')) communicationsByDay.yesterday = { label: 'Yesterday', communications: [] };
      communicationsByDay.yesterday.communications.push(el);
    } else {
      const day = moment(el.date).format('MM-DD-YY');
      if (!get(communicationsByDay, `${day}.communications`)) communicationsByDay[day] = { label: moment(el.date).format('ddd, MMM DD'), communications: [] };
      communicationsByDay[day].communications.push(el);
    }
  });

  return communicationsByDay;
};

export const noActivityIcon = (filter: string): string => {
  switch (filter) {
    case 'note':
      return 'ri-sticky-note-line';
    case 'update':
      return 'ri-task-line';
    case 'call':
      return 'ri-phone-line';
    case 'email':
      return 'ri-mail-line';
    case 'sms':
      return 'ri-chat-3-line';
    case 'chat':
      return 'ri-rocket-fill';
    default:
      return 'ri-calendar-event-line';
  }
};
