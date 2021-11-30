import { actions, paths } from 'dwell/constants';
import { build } from 'dwell/constants/paths';
import { ActionType, SmsMessageConversations } from 'src/interfaces';

interface ContactSms {
  id: number,
}

interface ActionSms {
  type: string,
  id?: number,
  contact?: ContactSms,
  data?: boolean,
}

export default {
  getSMSContacts: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.SMS_CONTACTS_REQUEST,
        actions.SMS_CONTACTS_SUCCESS,
        actions.SMS_CONTACTS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.SMS_CONTACTS),
    },
  }),
  getConversationById: (data: SmsMessageConversations): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CONVERSATION_BY_ID_REQUEST,
        actions.GET_CONVERSATION_BY_ID_SUCCESS,
        actions.GET_CONVERSATION_BY_ID_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.TEXT_MESSAGE_HISTORY, data.lead), { params: data.params }),
    },
  }),
  sendTextToLead: (data: SmsMessageConversations): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.SEND_TEXT_TO_LEAD_REQUEST,
          actions.SEND_TEXT_TO_LEAD_SUCCESS,
          actions.SEND_TEXT_TO_LEAD_FAILURE,
        ],
        promise: client => client.post(build(paths.api.v1.TEXT_MESSAGE_HISTORY, data.lead), data),
      },
    }),
  readAll: (data: number): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.SMS_READ_ALL_REQUEST,
          actions.SMS_READ_ALL_SUCCESS,
          actions.SMS_READ_ALL_FAILURE,
        ],
        promise: client => client.post(build(paths.api.v1.SMS_CONVERSATIONS_READALL, data)),
      },
    }),
  setComposerMinimiseStatus: (data: boolean): ActionSms =>
    ({
      type: actions.UPDATE_COMPOSER_MINIMISE,
      data,
    }),
  setActiveChat: (contact: ContactSms): ActionSms =>
    ({
      type: actions.UPDATE_CURRENT_CONTACT,
      contact,
    }),
  updateNotificationRedirection: (data: boolean): ActionSms =>
    ({
      type: actions.UPDATE_NOTIFICATION_REDIRECTION,
      data,
    }),
};
