import { actions } from 'dwell/constants';
import { NylasState, NylasActionTypes } from 'src/interfaces';

const initialState: NylasState = {
  isSubmitting: false,
  errorMessage: null,
  authUrl: '',
  token: '',
  isTokenObtained: false,
  isArchiving: false,
  isSendingEmail: false,
  isEmailComposerOpened: false,
};

const actionMap = {
  [actions.GET_NYLAS_AUTH_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_NYLAS_AUTH_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, authUrl: data.auth_url }),
  [actions.GET_NYLAS_AUTH_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.GET_NYLAS_TOKEN_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_NYLAS_TOKEN_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, isTokenObtained: data.success }),
  [actions.GET_NYLAS_TOKEN_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.SEND_MESSAGE_REQUEST]: state => ({ ...state, isSendingEmail: true }),
  [actions.SEND_MESSAGE_SUCCESS]: state => ({ ...state, isSendingEmail: false }),
  [actions.SEND_MESSAGE_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSendingEmail: false }),

  [actions.ARCHIVE_MESSAGES_REQUEST]: state => ({ ...state, isArchiving: true }),
  [actions.ARCHIVE_MESSAGES_SUCCESS]: state => ({ ...state, isArchiving: false }),
  [actions.ARCHIVE_MESSAGES_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isArchiving: false }),

  [actions.SET_EMAIL_OPEN_STATUS]: (state, { data }) => ({ ...state, isEmailComposerOpened: data }),
};

export default (state = initialState, action: NylasActionTypes): NylasState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
