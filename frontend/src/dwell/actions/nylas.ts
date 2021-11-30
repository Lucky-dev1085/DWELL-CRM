import { actions, paths } from 'dwell/constants';
import { CallBackFunction, ActionType } from 'src/interfaces';

interface ActionNylas {
  type: string,
  data?: boolean,
}

export default {
  authorize: (successCB: CallBackFunction = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_NYLAS_AUTH_REQUEST,
        actions.GET_NYLAS_AUTH_SUCCESS,
        actions.GET_NYLAS_AUTH_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.NYLAS_AUTH),
      successCB,
    },
  }),

  getToken: (code: string): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_NYLAS_TOKEN_REQUEST,
        actions.GET_NYLAS_TOKEN_SUCCESS,
        actions.GET_NYLAS_TOKEN_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.NYLAS_AUTH, code),
    },
  }),

  sendMessage: (data: string): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.SEND_MESSAGE_REQUEST,
        actions.SEND_MESSAGE_SUCCESS,
        actions.SEND_MESSAGE_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.NYLAS_SEND_MESSAGE, data),
    },
  }),

  archiveMessages: (data: string): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.ARCHIVE_MESSAGES_REQUEST,
        actions.ARCHIVE_MESSAGES_SUCCESS,
        actions.ARCHIVE_MESSAGES_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.NYLAS_ARCHIVE_MESSAGES, data),
    },
  }),
  setEmailOpenStatus: (data: boolean): ActionNylas =>
    ({
      type: actions.SET_EMAIL_OPEN_STATUS,
      data,
    }),
};
