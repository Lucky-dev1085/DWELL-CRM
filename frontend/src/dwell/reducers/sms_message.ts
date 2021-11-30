import { actions } from 'dwell/constants';
import { sortBy, unionBy } from 'lodash';
import moment from 'moment';
import { MessageState, MessageActionTypes } from 'src/interfaces';

const initialState: MessageState = {
  isSubmitting: false,
  isContactsLoading: false,
  isContactsLoaded: false,
  isConversationsLoaded: false,
  errorMessage: null,
  conversations: [],
  count: 0,
  unread: 0,
  contacts: [],
  isSendingText: false,
  activeChat: null,
  isNotificationRedirection: false,
};

const actionMap = {
  [actions.SMS_CONTACTS_REQUEST]: state => ({ ...state, isContactsLoading: true, isContactsLoaded: false }),
  [actions.SMS_CONTACTS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isContactsLoading: false, isContactsLoaded: true, contacts: data }),
  [actions.SMS_CONTACTS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isContactsLoading: false, isContactsLoaded: false }),

  [actions.GET_CONVERSATION_BY_ID_REQUEST]: state => ({ ...state, isSubmitting: true, isConversationsLoaded: false }),
  [actions.GET_CONVERSATION_BY_ID_SUCCESS]: (state, { result: { data } }) => ({
    ...state,
    isSubmitting: false,
    conversations: sortBy(unionBy(data.results, state.conversations, 'id'), (o: { date: string }) => new Date(o.date)),
    count: data.count,
    isConversationsLoaded: true,
  }),
  [actions.GET_CONVERSATION_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false, isConversationsLoaded: false }),

  [actions.SEND_TEXT_TO_LEAD_REQUEST]: state => ({ ...state, isSendingText: true }),
  [actions.SEND_TEXT_TO_LEAD_SUCCESS]: (state, { result: { data } }) => ({
    ...state,
    isSendingText: false,
    conversations: sortBy(unionBy([data], state.conversations, 'id'), o => moment(o.date)),
  }),
  [actions.SEND_TEXT_TO_LEAD_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSendingText: false }),

  [actions.UPDATE_CURRENT_CONTACT]: (state, { contact }) => ({ ...state, activeChat: contact }),
  [actions.UPDATE_NOTIFICATION_REDIRECTION]: (state, { data }) => ({ ...state, isNotificationRedirection: data }),
  [actions.SMS_READ_ALL_SUCCESS]: (state, { result: { data } }) => ({
    ...state,
    contacts: sortBy([data].concat(state.contacts.filter(contact => contact.id !== data.id)), o => moment(o.last_message_date)),
  }),
  [actions.PUSHER_CREATE_RECORD]: (state, { row }) => {
    const contact = state.contacts.find(c => c.id === row.lead);
    let newContacts = {};
    if (contact) {
      if (!row.is_read) contact.unread_count += 1;
      contact.last_message = row.message;
      contact.last_message_date = row.date;
      newContacts = { contacts: sortBy([contact].concat(state.contacts.filter(c => c.id !== row.lead)), o => moment(o.last_message_date)) };
    }
    return { ...state, ...newContacts, conversations: sortBy([row].concat(state.conversations.filter(c => c.id !== row.id)), o => moment(o.date)) };
  },

  [actions.CREATE_LEAD_SUCCESS]: (state, { result: { data } }) => {
    const newSMSContact = data.phone_number ? [{
      id: data.id,
      name: `${data.first_name} ${data.last_name}`,
      phone_number: data.phone_number,
      last_message: null,
      last_message_date: null,
      property: data.property,
      unread_count: 0,
    }] : [];
    return ({ ...state, contacts: newSMSContact.concat(state.contacts) });
  },

  [actions.UPDATE_LEAD_SUCCESS]: (state, { result: { data } }) => {
    if (state.contacts.find(contact => contact.id === data.id)) return state;
    const newSMSContact = data.phone_number ? [{
      id: data.id,
      name: `${data.first_name} ${data.last_name}`,
      phone_number: data.phone_number,
      last_message: null,
      last_message_date: null,
      property: data.property,
      unread_count: 0,
    }] : [];
    return ({ ...state, contacts: newSMSContact.concat(state.contacts) });
  },
};

export default (state = initialState, action: MessageActionTypes): MessageState => {
  if (actionMap[action.type]) {
    if (action.type.startsWith('PUSHER_') && action.pusherModel !== 'smscontent') {
      return state;
    }
    return actionMap[action.type](state, action);
  }

  return state;
};
