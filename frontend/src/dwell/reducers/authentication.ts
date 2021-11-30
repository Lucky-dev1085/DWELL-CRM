import { actions, LOGGED_ACCOUNT } from 'dwell/constants';
import { AuthenticationState, AuthenticationActionTypes } from 'src/interfaces';

const initialState: AuthenticationState = {
  isSubmitting: false,
  isFormInvalid: false,
  isSessionTimedOut: false,
};

const actionMap = {
  [actions.LOGIN_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.LOGOUT]: state => ({ ...state, isSessionTimedOut: false }),
  [actions.LOGIN_SUCCESS]: (state, { result: { data } }) => {
    localStorage.setItem(LOGGED_ACCOUNT, JSON.stringify(data));
    return ({ ...state, isSubmitting: false, isFormInvalid: false, isSessionTimedOut: false });
  },
  [actions.LOGIN_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, isFormInvalid: !!status, isSubmitting: false }),

  [actions.RESET_LOGIN_STATE]: state => ({ ...state, isFormInvalid: false, isPasswordChanged: false }),

  [actions.SESSION_TIMEOUT]: (state) => {
    const loggedAccount = JSON.parse(localStorage.getItem(LOGGED_ACCOUNT)) || {};
    loggedAccount.access = '';
    localStorage.setItem(LOGGED_ACCOUNT, JSON.stringify(loggedAccount));
    return ({ ...state, isSessionTimedOut: true });
  },
};

export default (state = initialState, action: AuthenticationActionTypes): AuthenticationState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
