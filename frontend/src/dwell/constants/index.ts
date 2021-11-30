import actions from './actions';
import paths from './paths';
import configuration from './configuration';
import leadsFilterChoices from './leads_filter_choices';
import fieldChoices from './field_choices';
import notificationTypes from './notification_types';
import emailVariables from './email_variables';
import emailTemplateTypes from './email_template_types';
import columnsNames from './columns_names';
import roommateRelationships from './roommate_relationships';
import reportsFilterChoices from './reports_filter_choices';
import reportTypes from './report_types';
import unitTypes from './unit_types';
import { TOUR_TYPES } from './tour_types';
import notificationIcons from './notification_icons';
import communicationIcons from './communication_icons';
import communicationTypes from './communication_types';
import leasingTypes from './leasing_types';

export {
  actions,
  configuration,
  paths,
  fieldChoices,
  leadsFilterChoices,
  notificationTypes,
  emailVariables,
  emailTemplateTypes,
  columnsNames,
  roommateRelationships,
  reportsFilterChoices,
  reportTypes,
  unitTypes,
  TOUR_TYPES,
  notificationIcons,
  communicationIcons,
  communicationTypes,
  leasingTypes,
};

export default {
};

export const LOGGED_ACCOUNT = 'crm-auth';
export const REDIRECT_PATH = 'redirect-path';
export const IS_BEEN_LOGGED = 'isAccountBeenLogged';
export const LAST_ACTIVITY_DATE = 'last_activity_date';
export const COMMUNICATION_FILTER = 'communication-filter';
// It's used for keep most recent accessed property for next login, and Nylas authentication redirect
export const RECENT_PROPERTY_HYPHENS = 'last_login_property';
export const IMAGE_COMPRESS_OPTIONS = {
  quality: 0.8,
  maxWidth: 1600,
  maxHeight: 1067,
};
export const MAX_IMG_SIZE = 10000000;
export const MAX_FILE_SIZE = 25000000;
export const imageCompressOption = {
  quality: 0.8,
  maxWidth: 1600,
  maxHeight: 1067,
};
export const NOTIFICATION_NOT_REQUIRED_REQUESTS = [
  actions.SEND_TEXT_TO_LEAD_REQUEST,
  actions.SEND_TEXT_TO_PROSPECT_REQUEST,
  actions.UPDATE_USER_AVAILABLE_STATUS_REQUEST,
  actions.GET_NYLAS_AUTH_REQUEST,
  actions.UPDATE_USER_LAST_PROPERTY_REQUEST,
];
export const SMS_LOAD_MORE_OFFSET = 20;
export const chatAvatarColorClasses = ['bg-teal', 'bg-indigo', 'bg-warning', 'bg-danger', 'bg-purple', 'bg-primary', 'bg-pink'];
export const MULTI_CHAT_FILTER = 'multi-chat-filter';
export const SINGLE_CHAT_FILTER = 'singe-chat-filter';

export const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : null;
};
export const getShortName = (name: string): string => {
  try {
    const splits = name.split(' ').filter(i => !!i);
    if (splits.length === 1) return splits[0][0].toUpperCase();
    return splits.length > 1 ? `${splits[0][0]}${splits[1][0]}`.toUpperCase() : `${splits[0][0]}`.toUpperCase();
  } catch (e) {
    return 'U1';
  }
};
export const redirectPaths = ['/compete/alerts/'];

const pluralTime = {
  second: 'seconds',
  minute: 'minutes',
  hour: 'hours',
  week: 'weeks',
  month: 'months',
  year: 'years',
};

export const timeFormatter = (value: number, unit: string, suffix: string, epochMilliseconds: number): string => {
  const days = Math.floor(Math.abs(epochMilliseconds - Date.now()) / (1000 * 60 * 60 * 24));

  if (days && days < 14) return `${days} ${days === 1 ? 'day' : 'days'} ${suffix}`;

  if (unit === 'week') {
    const week = Math.floor(days / 7);
    return `${week} ${week === 1 ? unit : pluralTime[unit]} ${suffix}`;
  }

  if (unit === 'month') {
    const month = Math.floor(days / 30);
    return `${month} ${month === 1 ? unit : pluralTime[unit]} ${suffix}`;
  }

  if (unit === 'year') {
    const year = Math.floor(days / 365);
    return `${year} ${year === 1 ? unit : pluralTime[unit]} ${suffix}`;
  }

  return `${value} ${value === 1 ? unit : pluralTime[unit]} ${suffix}`;
};
