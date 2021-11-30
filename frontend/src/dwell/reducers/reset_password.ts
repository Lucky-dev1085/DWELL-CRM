import { actions } from 'dwell/constants';
import { ResetPasswordState, ResetPasswordActionTypes } from 'src/interfaces';

const initialState: ResetPasswordState = {
  isSubmitting: false,
  isFormInvalid: false,
  isTokenInvalid: false,
};

const actionMap = {
  [actions.SEND_PASSWORD_RESET_EMAIL_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.SEND_PASSWORD_RESET_EMAIL_SUCCESS]: state => ({ ...state, isSubmitting: false, isFormInvalid: false }),
  [actions.SEND_PASSWORD_RESET_EMAIL_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, isFormInvalid: !!status, isSubmitting: false }),

  [actions.RESET_PASSWORD_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.RESET_PASSWORD_SUCCESS]: state => ({ ...state, isSubmitting: false, isFormInvalid: false }),
  [actions.RESET_PASSWORD_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, isTokenInvalid: !!status, isSubmitting: false }),

  [actions.RESET_CHANGE_PASSWORD_STATE]: state => ({ ...state, isFormInvalid: false, isTokenInvalid: false }),
};

export default (state = initialState, action: ResetPasswordActionTypes): ResetPasswordState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
