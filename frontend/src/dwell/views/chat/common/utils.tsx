import { chatAvatarColorClasses } from 'dwell/constants';
import moment from 'moment';

export const getAvatarColor = (name = '', id: number, isSMS = false):string => {
  let colorClass = chatAvatarColorClasses[id % 8];
  if (!isSMS && name.includes('Prospect #')) {
    colorClass = '';
  }
  return colorClass;
};

export const getInitials = (name: string, isSMS = false):string => {
  if (!(name || '').trim()) return 'U1';
  const splits = name.split(' ').filter(i => !!i);
  if (!isSMS && name.includes('Prospect #')) {
    return name.substr(10, name.length);
  }
  if (splits.length === 1) return splits[0][0].toUpperCase();
  return splits.length > 1 ? `${splits[0][0]}${splits[1][0]}`.toUpperCase() : `${splits[0][0]}`.toUpperCase();
};

export const isSameContact = (activeChats: { id: number, isSMS: boolean }[], id: number, isSMS = false):boolean =>
  !!activeChats.find(i => i.id === id && i.isSMS === isSMS);

export const formatMessageDate = (date: string):string => {
  let formattedDate = null;
  if (date) {
    formattedDate = moment(date);
    formattedDate = moment().diff(formattedDate, 'days') === 0 ? formattedDate.format('hh:mma') : formattedDate.format('MMM D');
  }
  return formattedDate;
};

export const getSearchPlaceholder = (activeFilter: string):string => {
  let searchPlaceholder = '';
  switch (activeFilter) {
    case 'All':
    case 'All Prospects':
      searchPlaceholder = 'Search all prospects';
      break;
    case 'Archive':
    case 'Archive Prospects':
      searchPlaceholder = 'Search archived prospects';
      break;
    case 'Active':
    case 'ACTIVE':
      searchPlaceholder = 'Search active prospects';
      break;
    case 'My':
    case 'MY':
      searchPlaceholder = 'Search my chat prospects';
      break;
    case 'SMS':
      searchPlaceholder = 'Search SMS prospects';
      break;
  }
  return searchPlaceholder;
};

export const getNoContentText = (activeFilter: string): {label: string, text: string} => {
  let label = '';
  let text = '';
  switch (activeFilter) {
    case 'All':
    case 'All Prospects':
      text = 'There are no chats happening on your property websites now.';
      label = 'No Chats';
      break;
    case 'Archive':
    case 'Archive Prospects':
      text = 'There are no archived chats yet.';
      label = 'No Archived Chats';
      break;
    case 'Active':
    case 'ACTIVE':
      text = 'There are no active chats happening on your property websites right now.';
      label = 'No Active Chats';
      break;
    case 'My':
    case 'MY':
      text = 'You don\'t have any chats to manage right now.';
      label = 'No Assigned Chats';
      break;
    case 'SMS':
      text = 'You don\'t have any contacts right now.';
      label = 'No Chats';
      break;
  }
  return { label, text };
};

export const isMostRecentTab = (tab: string): boolean => {
  const tabs = Object.keys(localStorage).filter(key => key.startsWith('tab'))
    .sort((a, b) => new Date(localStorage[a]).getTime() - new Date(localStorage[b]).getTime());
  return tabs[tabs.length - 1] === tab;
};
