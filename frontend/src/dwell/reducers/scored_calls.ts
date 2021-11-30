import { actions } from 'dwell/constants';
import { CallRescoresMeta, ScoredCallProps, CallsState, CallsActionTypes } from 'src/interfaces';

const initialState: CallsState = {
  isSubmitting: false,
  errorMessage: null,
  scoredCalls: [],
  scoredCall: {} as ScoredCallProps,
  isLoaded: true,
  callRescoresMeta: {} as CallRescoresMeta,
};

const actionMap = {
  [actions.GET_SCORED_CALLS_REQUEST]: state => ({ ...state, isLoaded: false }),
  [actions.GET_SCORED_CALLS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isLoaded: true, scoredCalls: data.results }),
  [actions.GET_SCORED_CALLS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isLoaded: true }),

  [actions.CREATE_SCORED_CALL_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_SCORED_CALL_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.CREATE_SCORED_CALL_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_SCORED_CALL_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_SCORED_CALL_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, scoredCall: data }),
  [actions.UPDATE_SCORED_CALL_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.GET_CALL_RESCORES_META_SUCCESS]: (state, { result: { data } }) => ({ ...state, callRescoresMeta: data }),
  [actions.SUBMIT_CALLS_SCORE_STATE_SUCCESS]: state => ({ ...state, isSubmitting: false, callRescoresMeta: { ...state.callRescoresMeta, is_call_scoring_submitted_today: true } }),
};

export default (state = initialState, action: CallsActionTypes): CallsState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
