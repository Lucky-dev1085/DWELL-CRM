import { actions } from 'dwell/constants';
import { SurveyState, SurveyActionTypes } from 'src/interfaces';

const initialState: SurveyState = {
  isSubmitting: false,
  errorMessage: null,
  surveys: [],
};

const actionMap = {
  [actions.GET_SURVEYS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_SURVEYS_SUCCESS]: (state, { result: { data: { results } } }) => ({ ...state, isSubmitting: false, surveys: results }),
  [actions.GET_SURVEYS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_SURVEYS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_SURVEYS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, surveys: data }),
  [actions.UPDATE_SURVEYS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),
};

export default (state = initialState, action: SurveyActionTypes): SurveyState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
