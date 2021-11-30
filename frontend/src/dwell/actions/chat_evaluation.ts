import { actions, paths } from 'dwell/constants';
import { build } from 'dwell/constants/paths';
import {
  ActionType, ChatReportConversation,
  ChatReportConversationData,
  ChatReportConversationMessageWithStatus,
  paginationData,
} from 'src/interfaces';

export default {
  getChatReports: (params: paginationData): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CHAT_REPORTS_REQUEST,
        actions.GET_CHAT_REPORTS_SUCCESS,
        actions.GET_CHAT_REPORTS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.CHAT_REPORTS, { params }),
    },
  }),

  getSingleChatReport: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_SINGLE_CHAT_REPORT_REQUEST,
        actions.GET_SINGLE_CHAT_REPORT_SUCCESS,
        actions.GET_SINGLE_CHAT_REPORT_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.CHAT_REPORT_DETAILS, id)),
    },
  }),

  getChatReportById: (id: number, support_filter: string): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CHAT_REPORT_BY_ID_REQUEST,
        actions.GET_CHAT_REPORT_BY_ID_SUCCESS,
        actions.GET_CHAT_REPORT_BY_ID_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.CHAT_REPORT_DETAILS, id), { params: { support_filter } }),
    },
  }),

  exportChatReportById: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.EXPORT_CHAT_REPORT_BY_ID_REQUEST,
        actions.EXPORT_CHAT_REPORT_BY_ID_SUCCESS,
        actions.EXPORT_CHAT_REPORT_BY_ID_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.CHAT_REPORT_EVALUATION, id)),
    },
  }),

  getChatReportForEvaluationById: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CHAT_REPORT_EVALUATION_BY_ID_REQUEST,
        actions.GET_CHAT_REPORT_EVALUATION_BY_ID_SUCCESS,
        actions.GET_CHAT_REPORT_EVALUATION_BY_ID_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.CHAT_REPORT_EVALUATION, id)),
    },
  }),

  setChatReportStatusById: (id: number, data: { status: string, type: string }): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_EVALUATION_REPORT_REQUEST,
        actions.UPDATE_EVALUATION_REPORT_SUCCESS,
        actions.UPDATE_EVALUATION_REPORT_FAILURE,
      ],
      promise: client => client.patch(build(paths.api.v1.CHAT_REPORT_DETAILS, id), data),
    },
  }),

  updateChatReportStatusById: (id: number, data: { status: string}): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CHANGE_EVALUATION_REPORT_REQUEST,
        actions.CHANGE_EVALUATION_REPORT_SUCCESS,
        actions.CHANGE_EVALUATION_REPORT_FAILURE,
      ],
      promise: client => client.patch(build(paths.api.v1.CHAT_REPORT_DETAILS, id), data),
    },
  }),

  autoSaveChatReportStatusesById: (id: number, data: ChatReportConversationData): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.AUTOSAVE_EVALUATION_REPORT_REQUEST,
        actions.AUTOSAVE_EVALUATION_REPORT_REQUEST_SUCCESS,
        actions.AUTOSAVE_EVALUATION_REPORT_REQUEST_FAILURE,
      ],
      promise: client => client.post(build(paths.api.v1.CHAT_REPORT_EVALUATION_SUBMIT, id), data),
    },
  }),

  getSingleConversationMessagesById: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CHAT_REPORT_MESSAGE_BY_ID_REQUEST,
        actions.GET_CHAT_REPORT_MESSAGE_BY_ID_SUCCESS,
        actions.GET_CHAT_REPORT_MESSAGE_BY_ID_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.CHAT_REPORT_MESSAGE, id)),
    },
  }),

  updateMessageStatusesById: (id: number, message: ChatReportConversationMessageWithStatus): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_CHAT_REPORT_MESSAGE_BY_ID_REQUEST,
        actions.UPDATE_CHAT_REPORT_MESSAGE_BY_ID_SUCCESS,
        actions.UPDATE_CHAT_REPORT_MESSAGE_BY_ID_FAILURE,
      ],
      promise: client => client.patch(build(`${paths.api.v1.CHAT_REPORT_MESSAGE}${message.id}/`, id), message),
    },
  }),
  updateConversationStatusesById: (id: number, conversation: ChatReportConversation): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_CHAT_REPORT_EVALUATION_BY_ID_REQUEST,
        actions.UPDATE_CHAT_REPORT_EVALUATION_BY_ID_SUCCESS,
        actions.UPDATE_CHAT_REPORT_EVALUATION_BY_ID_FAILURE,
      ],
      promise: client => client.patch(build(`${paths.api.v1.CHAT_REPORT_EVALUATION}${conversation.id}/`, id), conversation),
    },
  }),

};
