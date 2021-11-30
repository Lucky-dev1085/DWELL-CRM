import { actions, paths, LOGGED_ACCOUNT, COMMUNICATION_FILTER } from 'dwell/constants';
import { ActionType } from 'src/interfaces';

interface ActionAuthentication {
  type: string,
}

export default {
  login: (credentials: { email: string, password: string }): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.LOGIN_REQUEST,
        actions.LOGIN_SUCCESS,
        actions.LOGIN_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.LOGIN, credentials),
    },
  }),
  logout: (): ActionAuthentication => {
    localStorage.removeItem(LOGGED_ACCOUNT);
    localStorage.removeItem(COMMUNICATION_FILTER);
    window.location.href = '/login';
    return {
      type: actions.LOGOUT,
    };
  },
  sessionTimeout: (): ActionAuthentication => ({ type: actions.SESSION_TIMEOUT }),
  resetLoginState: (): ActionAuthentication => ({ type: actions.RESET_LOGIN_STATE }),
};
