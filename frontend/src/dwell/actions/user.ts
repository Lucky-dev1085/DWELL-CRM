import { actions, paths } from 'dwell/constants';
import { CallBackFunction, ActionType, UserProps } from 'src/interfaces';

export default {
  getCurrentUser: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CURRENT_USER_REQUEST,
        actions.GET_CURRENT_USER_SUCCESS,
        actions.GET_CURRENT_USER_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.CURRENT_USER),
    },
  }),
  updateUser: (id: number, user: UserProps, successCB: CallBackFunction = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_USER_REQUEST,
        actions.UPDATE_USER_SUCCESS,
        actions.UPDATE_USER_FAILURE,
      ],
      promise: client => client.patch(paths.build(paths.api.v1.USER_DETAILS, id), user),
      successCB,
    },
  }),
  updateUserAvailableStatus: (id: number, user: UserProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_USER_AVAILABLE_STATUS_REQUEST,
        actions.UPDATE_USER_AVAILABLE_STATUS_SUCCESS,
        actions.UPDATE_USER_AVAILABLE_STATUS_FAILURE,
      ],
      promise: client => client.patch(paths.build(paths.api.v1.USER_DETAILS, id), user),
    },
  }),
  updateUserLastProperty: (id: number, user: UserProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_USER_LAST_PROPERTY_REQUEST,
        actions.UPDATE_USER_LAST_PROPERTY_SUCCESS,
        actions.UPDATE_USER_LAST_PROPERTY_FAILURE,
      ],
      promise: client => client.patch(paths.build(paths.api.v1.USER_DETAILS, id), user),
    },
  }),
  getUsers: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_USERS_REQUEST,
        actions.GET_USERS_SUCCESS,
        actions.GET_USERS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.USERS, { params: { show_all: true } }),
    },
  }),

  getTeamMates: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_TEAM_MATES_REQUEST,
        actions.GET_TEAM_MATES_SUCCESS,
        actions.GET_TEAM_MATES_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.TEAM_MATES),
    },
  }),

  createUser: (user: UserProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_USER_REQUEST,
        actions.CREATE_USER_SUCCESS,
        actions.CREATE_USER_FAILURE,
      ],
      promise: client => client.post(paths.build(paths.api.v1.USERS), user),
    },
  }),

  deleteUser: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.DELETE_USER_REQUEST,
        actions.DELETE_USER_SUCCESS,
        actions.DELETE_USER_FAILURE,
      ],
      promise: client => client.delete(paths.build(paths.api.v1.USER_DETAILS, id)),
    },
  }),
};
