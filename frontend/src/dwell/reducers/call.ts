import { actions } from 'dwell/constants';
import { CallState, CallActionTypes } from 'src/interfaces';
import { isLeadPage, isLeadsObject } from './utils';

const initialState: CallState = {
  isSubmitting: false,
  errorMessage: null,
  calls: [],
  call: {} as { id: number, name: string, lead?: number },
  count: 0,
  isLoaded: true,
  isArchiving: false,
};

const actionMap = {
  [actions.GET_LEAD_BY_ID_SUCCESS]: (state, { result: { data } }) => ({ ...state, calls: data.calls }),

  [actions.GET_CALLS_REQUEST]: state => ({ ...state, isLoaded: false }),
  [actions.GET_CALLS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isLoaded: true, calls: data.results, count: data.count }),
  [actions.GET_CALLS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isLoaded: true }),

  [actions.GET_CALL_BY_ID_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_CALL_BY_ID_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, call: data }),
  [actions.GET_CALL_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_CALL_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_CALL_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, call: data }),
  [actions.UPDATE_CALL_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.ARCHIVE_CALL_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.ARCHIVE_CALL_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, call: data }),
  [actions.ARCHIVE_CALL_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.ARCHIVE_CALLS_REQUEST]: state => ({ ...state, isArchiving: true }),
  [actions.ARCHIVE_CALLS_SUCCESS]: state => ({ ...state, isArchiving: false }),
  [actions.ARCHIVE_CALLS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isArchiving: false }),

  [actions.PUSHER_CREATE_RECORD]: (state, { row }) => {
    let newCalls = state.calls;
    if (isLeadPage() && isLeadsObject(row.lead)) {
      newCalls = [row].concat(state.calls.filter(c => c.id !== row.id));
    }
    return { ...state, calls: newCalls };
  },
  [actions.PUSHER_UPDATE_RECORD]: (state, { row }) => {
    let newCalls = state.calls;
    if (isLeadPage() && isLeadsObject(row.lead)) {
      newCalls = [row].concat(state.calls.filter(c => c.id !== row.id));
    }
    return { ...state, calls: newCalls };
  },
  [actions.PUSHER_DELETE_RECORD]: (state, { row }) => {
    let newCalls = state.calls;
    if (isLeadPage() && isLeadsObject(row.id.lead)) {
      newCalls = state.calls.filter(c => c.id.toString() !== row.id.toString());
    }
    return { ...state, calls: newCalls };
  },
};

export default (state = initialState, action: CallActionTypes): CallState => {
  if (actionMap[action.type]) {
    if (action.type.includes('PUSHER_') && action.pusherModel !== 'call') {
      return state;
    }
    return actionMap[action.type](state, action);
  }

  return state;
};
