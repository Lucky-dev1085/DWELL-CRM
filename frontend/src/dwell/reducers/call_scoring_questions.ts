import { actions } from 'dwell/constants';
import { CallScoringQuestionsState, CallScoringQuestionsActionTypes } from 'src/interfaces';

const initialState: CallScoringQuestionsState = {
  isSubmitting: false,
  errorMessage: null,
  questions: [],
};

const actionMap = {
  [actions.GET_CALL_SCORING_QUESTIONS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_CALL_SCORING_QUESTIONS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, questions: data.results }),
  [actions.GET_CALL_SCORING_QUESTIONS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),
};

export default (state = initialState, action: CallScoringQuestionsActionTypes): CallScoringQuestionsState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
