import { actions } from 'dwell/constants';
import { unionBy } from 'lodash';
import { UserState, UserActionTypes } from 'src/interfaces';

const initialState: UserState = {
  currentUser: {},
  users: [],
  teamUsers: [],
  isSubmitting: false,
  isUpdatingStatus: false,
  isUsersLoaded: false,
};

const actionMap = {
  [actions.GET_CURRENT_USER_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_CURRENT_USER_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, currentUser: data }),
  [actions.GET_CURRENT_USER_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.GET_USERS_REQUEST]: state => ({ ...state, isUsersLoaded: false }),
  [actions.GET_USERS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isUsersLoaded: true, users: data.results }),
  [actions.GET_USERS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isUsersLoaded: false }),

  [actions.GET_TEAM_MATES_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_TEAM_MATES_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, teamUsers: data }),
  [actions.GET_TEAM_MATES_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.CREATE_USER_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_USER_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, users: [data].concat(state.users) }),
  [actions.CREATE_USER_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.DELETE_USER_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.DELETE_USER_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, users: state.users.filter(i => i.id !== data.id) }),
  [actions.DELETE_USER_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_USER_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_USER_SUCCESS]: (state, { result: { data } }) => {
    let additionalParam = {};
    if (data.id === state.currentUser.id) additionalParam = { currentUser: data };
    return ({ ...state, isSubmitting: false, users: unionBy([data], state.users, 'id'), ...additionalParam });
  },
  [actions.UPDATE_USER_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_USER_AVAILABLE_STATUS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_USER_AVAILABLE_STATUS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, currentUser: data }),
  [actions.UPDATE_USER_AVAILABLE_STATUS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),
};

export default (state = initialState, action: UserActionTypes): UserState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
