import { actions } from 'dwell/constants';
import { orderBy, unionBy } from 'lodash';
import { EmailMessageState, EmailMessageActionTypes } from 'src/interfaces';
import { isLeadPage, isLeadsObject } from './utils';

const initialState: EmailMessageState = {
  isSubmitting: false,
  errorMessage: null,
  messages: [],
  message: {},
  messagesCount: 0,
  isLoaded: true,
  isFollowupMessagesLoaded: true,
  conversations: [],

  leadId: null,
  data: '',
  subject: '',
  cc: '',
  selectedTemplateId: '',
  subjectVariables: [],
  files: [],
  isShowingCc: false,
};

const actionMap = {
  [actions.GET_EMAIL_MESSAGES_REQUEST]: state => ({ ...state, isFollowupMessagesLoaded: false }),
  [actions.GET_EMAIL_MESSAGES_SUCCESS]: (state, { result: { data } }) => {
    const messages = state.messages.filter(p => !data.results.map(item => item.id).includes(p.id)).concat(data.results)
      .sort((a, b) => b.date - a.date);
    return ({ ...state, isFollowupMessagesLoaded: true, messages, messagesCount: data.count });
  },
  [actions.GET_EMAIL_MESSAGES_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isFollowupMessagesLoaded: true }),

  [actions.GET_EMAIL_MESSAGE_BY_ID_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_EMAIL_MESSAGE_BY_ID_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, message: data }),
  [actions.GET_EMAIL_MESSAGE_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),
  [actions.UPDATE_EMAIL_MESSAGE_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_EMAIL_MESSAGE_SUCCESS]: (state, { result: { data } }) => {
    const updateEmailMessagesList = state.messages.map(message => (message.id === data.id ? data : message));
    return { ...state, isSubmitting: false, message: data, messages: updateEmailMessagesList };
  },
  [actions.UPDATE_EMAIL_MESSAGE_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.ARCHIVE_MESSAGES_SUCCESS]: (state, { result: { data: { ids } } }) =>
    ({ ...state, isSubmitting: false, messages: state.messages.filter(i => !ids.includes(i.id)), messagesCount: state.messagesCount - ids.length }),

  [actions.ARCHIVE_EMAIL_MESSAGE_SUCCESS]: (state, { result: { data } }) =>
    ({ ...state, isSubmitting: false, messages: state.messages.filter(i => i.id !== data.id), messagesCount: state.messagesCount - 1 }),

  [actions.MARK_EMAIL_MESSAGE_AS_READ_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.MARK_EMAIL_MESSAGE_AS_READ_SUCCESS]: (state, { result: { data } }) => {
    const updateEmailMessagesList = state.messages.map(message => (message.id === data.id ? data : message));
    return { ...state, isSubmitting: false, message: data, messages: updateEmailMessagesList };
  },
  [actions.MARK_EMAIL_MESSAGE_AS_READ_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.GET_LEAD_CONVERSATIONS_REQUEST]: state => ({ ...state, isLoaded: false }),
  [actions.GET_LEAD_CONVERSATIONS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isLoaded: true, conversations: data.results }),
  [actions.GET_LEAD_CONVERSATIONS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isLoaded: true }),

  [actions.GET_LEAD_BY_ID_SUCCESS]: (state, { result: { data } }) => ({ ...state, conversations: orderBy(data.email_messages, ['date'], ['desc']) }),

  [actions.SEND_BULK_EMAIL_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.SEND_BULK_EMAIL_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.SEND_BULK_EMAIL_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.PUSHER_CREATE_RECORD]: (state, { row }) => {
    const object = row.object || row;
    const messages = orderBy(unionBy([row], state.messages, 'id'), ['date'], ['desc']);
    let { conversations } = state;
    if ((isLeadPage() && isLeadsObject(object.lead)) || (state.message.lead && state.message.lead === object.lead)) {
      conversations = [object].concat(state.conversations.filter(t => t.id !== object.id));
    }
    return { ...state, messages, conversations };
  },
  [actions.PUSHER_UPDATE_RECORD]: (state, { row }) => {
    const object = row.object || row;
    if ((isLeadPage() && isLeadsObject(object.lead)) || (state.message.lead && state.message.lead === object.lead)) {
      const newEmails = [object].concat(state.conversations.filter(t => t.id !== object.id));
      return { ...state, conversations: newEmails, message: state.message.id === object.id ? object : state.message };
    }
    return { ...state, message: state.message.id === object.id ? object : state.message };
  },
  [actions.PUSHER_DELETE_RECORD]: (state, { row }) => {
    const object = row.object || row;
    return { ...state, conversations: state.conversations.filter(t => t.id.toString() !== object.id.toString()) };
  },
  [actions.SET_EMAIL_LEAD_ID]: (state, { leadId }) => ({ ...state, leadId }),
  [actions.SET_EMAIL_BODY]: (state, { data }) => ({ ...state, data }),
  [actions.SET_EMAIL_SUBJECT]: (state, { subject }) => ({ ...state, subject }),
  [actions.SET_SELECTED_EMAIL_TEMPLATE_ID]: (state, { selectedTemplateId }) => ({ ...state, selectedTemplateId }),
  [actions.SET_EMAIL_SUBJECT_VARIABLES]: (state, { subjectVariables }) => ({ ...state, subjectVariables }),
  [actions.SET_FILES]: (state, { files }) => ({ ...state, files }),
  [actions.SET_IS_SHOWING_CC]: (state, { isShowingCc }) => ({ ...state, isShowingCc }),
  [actions.SET_EMAIL_CC]: (state, { cc }) => ({ ...state, cc }),
  [actions.CLEAR_EMAIl_CONTENT]: state => ({
    ...state,
    data: '',
    subject: '',
    cc: '',
    selectedTemplateId: '',
    subjectVariables: [],
    files: [],
    isShowingCc: false,
  }),
};

export default (state = initialState, action: EmailMessageActionTypes): EmailMessageState => {
  if (actionMap[action.type]) {
    if (action.type.includes('PUSHER_') && action.pusherModel !== 'emailmessage') {
      return state;
    }
    return actionMap[action.type](state, action);
  }

  return state;
};
