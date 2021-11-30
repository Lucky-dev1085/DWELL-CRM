import { actions, paths } from 'dwell/constants';
import { build } from 'dwell/constants/paths';
import { ActionType } from 'src/interfaces';

interface ActionResetPassword {
  type: string,
}

export default {
  sendResetPasswordEmail: (email: string): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.SEND_PASSWORD_RESET_EMAIL_REQUEST,
        actions.SEND_PASSWORD_RESET_EMAIL_SUCCESS,
        actions.SEND_PASSWORD_RESET_EMAIL_FAILURE,
      ],
      promise: client => client.post(build(paths.api.v1.RESET_PASSWORD_SEND_EMAIL), email),
    },
  }),

  resetPassword: (data: { password: string, token: string }): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.RESET_PASSWORD_REQUEST,
        actions.RESET_PASSWORD_SUCCESS,
        actions.RESET_PASSWORD_FAILURE,
      ],
      promise: client => client.post(build(paths.api.v1.RESET_PASSWORD), data),
    },
  }),

  resetChangePasswordState: (): ActionResetPassword => ({ type: actions.RESET_CHANGE_PASSWORD_STATE }),

};
