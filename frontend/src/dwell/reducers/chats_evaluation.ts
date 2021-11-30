import { actions } from 'dwell/constants';
import { ChatReportState, ChatReportActionTypes } from 'src/interfaces';

const initialState: ChatReportState = {
  isSubmitting: false,
  errorMessage: '',
  chats_list: [],
  chats: [],
  current_messages: [],
  chat: { id: 0, reviewed: false },
  isLoaded: false,
  isExported: true,
  isChatLoaded: true,
  selected_chat_messages: [],
};

const actionMap = {
  [actions.GET_CHAT_REPORTS_REQUEST]: state => ({ ...state, isLoaded: false }),
  [actions.GET_CHAT_REPORTS_SUCCESS]: (state, { result: { data: { results: chats_list } } }) => ({ ...state, isLoaded: true, chats_list }),
  [actions.GET_CHAT_REPORTS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isLoaded: true }),

  [actions.GET_SINGLE_CHAT_REPORT_REQUEST]: state => ({ ...state, isLoaded: false }),
  [actions.GET_SINGLE_CHAT_REPORT_SUCCESS]: (state, { result: { data: { ...data } } }) => ({ ...state, isLoaded: true, data }),
  [actions.GET_SINGLE_CHAT_REPORT_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isLoaded: true }),

  [actions.GET_CHAT_REPORT_BY_ID_REQUEST]: state => ({ ...state, isLoaded: false }),
  [actions.GET_CHAT_REPORT_BY_ID_SUCCESS]: (state, { result: { data: chat } }) => ({ ...state, isLoaded: true, chat }),
  [actions.GET_CHAT_REPORT_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isLoaded: true }),

  [actions.EXPORT_CHAT_REPORT_BY_ID_REQUEST]: state => ({ ...state, isExported: false }),
  [actions.EXPORT_CHAT_REPORT_BY_ID_SUCCESS]: (state, { result: { data: { results: chats } } }) => ({ ...state, isExported: true, chats }),
  [actions.EXPORT_CHAT_REPORT_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isExported: false }),

  [actions.GET_CHAT_REPORT_EVALUATION_BY_ID_REQUEST]: state => ({ ...state, chats: [], data: null, isLoaded: false }),
  [actions.GET_CHAT_REPORT_EVALUATION_BY_ID_SUCCESS]: (state, { result: { data: { results: chats } } }) => ({ ...state, isLoaded: true, chats }),
  [actions.GET_CHAT_REPORT_EVALUATION_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isLoaded: true }),

  [actions.GET_CHAT_REPORT_MESSAGE_BY_ID_REQUEST]: state => ({ ...state, chat: {}, isChatLoaded: false }),
  [actions.GET_CHAT_REPORT_MESSAGE_BY_ID_SUCCESS]: (state, { result: { data: selected_chat_messages } }) => ({ ...state, isChatLoaded: true, selected_chat_messages }),
  [actions.GET_CHAT_REPORT_MESSAGE_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isChatLoaded: true }),

  [actions.UPDATE_EVALUATION_REPORT_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_EVALUATION_REPORT_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.UPDATE_EVALUATION_REPORT_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),
};

export default (state = initialState, action: ChatReportActionTypes): ChatReportState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
