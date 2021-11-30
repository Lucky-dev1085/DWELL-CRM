import { actions, paths } from 'dwell/constants';
import { build } from 'dwell/constants/paths';
import { ActionType, ManageRequestProps, EmailMessageProps } from 'src/interfaces';

interface ActionEmailMessage {
  type: string,
  leadId?: number,
  data?: EmailMessageProps,
  subject?: string,
  selectedTemplateId?: number,
  subjectVariables?: string[],
  files?: string[],
  isShowingCc?: boolean,
  cc?: string,
}

export default {
  getMessages: (param: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_EMAIL_MESSAGES_REQUEST,
        actions.GET_EMAIL_MESSAGES_SUCCESS,
        actions.GET_EMAIL_MESSAGES_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.EMAIL_MESSAGES, { params: param }),
    },
  }),

  getMessageById: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_EMAIL_MESSAGE_BY_ID_REQUEST,
        actions.GET_EMAIL_MESSAGE_BY_ID_SUCCESS,
        actions.GET_EMAIL_MESSAGE_BY_ID_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.EMAIL_MESSAGE_DETAILS, id)),
    },
  }),

  updateMessageById: (id: number, data: EmailMessageProps): ActionType => ({
    [actions.CALL_API]: {
      types: typeof data.is_unread !== 'undefined'
        ? [
          actions.MARK_EMAIL_MESSAGE_AS_READ_REQUEST,
          actions.MARK_EMAIL_MESSAGE_AS_READ_SUCCESS,
          actions.MARK_EMAIL_MESSAGE_AS_READ_FAILURE,
        ]
        : [
          actions.UPDATE_EMAIL_MESSAGE_REQUEST,
          actions.UPDATE_EMAIL_MESSAGE_SUCCESS,
          actions.UPDATE_EMAIL_MESSAGE_FAILURE,
        ],
      promise: client => client.patch(build(paths.api.v1.EMAIL_MESSAGE_DETAILS, id), data),
    },
  }),

  archiveMessage: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.ARCHIVE_EMAIL_MESSAGE_REQUEST,
        actions.ARCHIVE_EMAIL_MESSAGE_SUCCESS,
        actions.ARCHIVE_EMAIL_MESSAGE_FAILURE,
      ],
      promise: client => client.patch(build(paths.api.v1.EMAIL_MESSAGE_DETAILS, id), { is_archived: true }),
    },
  }),

  getEmailConversations: (param: { lead_id: number }): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_LEAD_CONVERSATIONS_REQUEST,
        actions.GET_LEAD_CONVERSATIONS_SUCCESS,
        actions.GET_LEAD_CONVERSATIONS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.EMAIL_MESSAGES, { params: param }),
    },
  }),

  sendBulkEmail: (data: EmailMessageProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.SEND_BULK_EMAIL_REQUEST,
        actions.SEND_BULK_EMAIL_SUCCESS,
        actions.SEND_BULK_EMAIL_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.SEND_BULK_EMAIL, data),
    },
  }),

  setEmailLeadId: (leadId: number): ActionEmailMessage => ({ type: actions.SET_EMAIL_LEAD_ID, leadId }),

  setData: (data: EmailMessageProps): ActionEmailMessage => ({
    type: actions.SET_EMAIL_BODY,
    data,
  }),

  setSubject: (subject: string): ActionEmailMessage => ({
    type: actions.SET_EMAIL_SUBJECT,
    subject,
  }),

  setSelectedTemplateId: (selectedTemplateId: number): ActionEmailMessage => ({
    type: actions.SET_SELECTED_EMAIL_TEMPLATE_ID,
    selectedTemplateId,
  }),

  setSubjectVariables: (subjectVariables: string[]): ActionEmailMessage => ({
    type: actions.SET_EMAIL_SUBJECT_VARIABLES,
    subjectVariables,
  }),

  setFiles: (files: string[]): ActionEmailMessage => ({
    type: actions.SET_FILES,
    files,
  }),

  setIsShowingCc: (isShowingCc: boolean): ActionEmailMessage => ({
    type: actions.SET_IS_SHOWING_CC,
    isShowingCc,
  }),

  setCc: (cc: string): ActionEmailMessage => ({
    type: actions.SET_EMAIL_CC,
    cc,
  }),

  clearEmailContent: (): ActionEmailMessage => ({ type: actions.CLEAR_EMAIl_CONTENT }),
};
