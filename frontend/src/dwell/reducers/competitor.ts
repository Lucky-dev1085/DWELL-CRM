import { actions } from 'dwell/constants';
import { CompetitorState, CompetitorActionTypes } from 'src/interfaces';

const initialState: CompetitorState = {
  isSubmitting: false,
  errorMessage: null,
  competitors: [],
};

const actionMap = {
  [actions.GET_COMPETITORS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_COMPETITORS_SUCCESS]: (state, { result: { data: { results } } }) => ({ ...state, isSubmitting: false, competitors: results }),
  [actions.GET_COMPETITORS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_COMPETITOR_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_COMPETITOR_SUCCESS]: (state, { result: { data } }) => {
    const updateCompetitorsList = state.competitors.map(competitor => (competitor.id === data.id ? data : competitor));
    return { ...state, isSubmitting: false, competitors: updateCompetitorsList };
  },
  [actions.UPDATE_COMPETITOR_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.DELETE_COMPETITOR_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.DELETE_COMPETITOR_SUCCESS]: (state, { result: { data } }) => {
    const updateCompetitorsList = state.competitors.filter(competitor => (competitor.id !== data.id));
    return { ...state, isSubmitting: false, competitors: updateCompetitorsList };
  },
  [actions.DELETE_COMPETITOR_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.CREATE_COMPETITOR_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_COMPETITOR_SUCCESS]: (state, { result: { data } }) => {
    const updateCompetitorsList = [...state.competitors];
    updateCompetitorsList.push(data);
    return { ...state, isSubmitting: false, competitors: updateCompetitorsList };
  },
  [actions.CREATE_COMPETITOR_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),
};

export default (state = initialState, action: CompetitorActionTypes): CompetitorState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
