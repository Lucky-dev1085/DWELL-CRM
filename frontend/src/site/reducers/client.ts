import { actions } from 'site/constants';
import { unionBy } from 'lodash';
import { ClientState, ClientActionTypes } from 'src/interfaces';

const initialState: ClientState = {
  isSubmitting: false,
  client: {},
  isClientLoaded: false,
  isClientsLoaded: false,
  clients: [],
};

const actionMap = {
  [actions.UPDATE_CLIENT_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_CLIENT_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, clients: unionBy([data], state.clients, 'id') }),
  [actions.UPDATE_CLIENT_FAILURE]: state => ({ ...state, isSubmitting: false }),

  [actions.DELETE_CLIENT_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.DELETE_CLIENT_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.DELETE_CLIENT_FAILURE]: state => ({ ...state, isSubmitting: false }),

  [actions.GET_CLIENTS_REQUEST]: state => ({ ...state, isSubmitting: true, isClientsLoaded: false }),
  [actions.GET_CLIENTS_SUCCESS]: (state, { result }) => ({ ...state, isSubmitting: false, isClientsLoaded: true, clients: result.data.results }),
  [actions.GET_CLIENTS_FAILURE]: state => ({ ...state, isSubmitting: false, isClientsLoaded: false }),

  [actions.CREATE_CLIENT_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_CLIENT_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.CREATE_CLIENT_FAILURE]: state => ({ ...state, isSubmitting: false }),
};

export default (state = initialState, action: ClientActionTypes): ClientState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
