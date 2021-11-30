import { actions } from 'dwell/constants';
import { ProspectSourceState, ProspectSourceActionTypes } from 'src/interfaces';

const initialState: ProspectSourceState = {
  isSubmitting: false,
  errorMessage: null,
  sources: [],
};

const actionMap = {
  [actions.GET_SOURCES_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_SOURCES_SUCCESS]: (state, { result: { data: { results } } }) => ({ ...state, isSubmitting: false, sources: results }),
  [actions.GET_SOURCES_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_SOURCES_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_SOURCES_SUCCESS]: (state, { result: { data } }) => {
    const updateSourcesList = state.sources.map(source => (source.id === data.id ? data : source));
    return { ...state, isSubmitting: false, sources: updateSourcesList };
  },
  [actions.UPDATE_SOURCES_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_SPENDS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_SPENDS_SUCCESS]: (state, { result: { data } }) => {
    const updatedSourcesList = [...state.sources];
    Object.keys(data).forEach((key) => {
      const index = updatedSourcesList.findIndex(source => source.id === Number(key));
      updatedSourcesList[index].spends = data[key];
    });
    return { ...state, isSubmitting: false, sources: updatedSourcesList };
  },
  [actions.UPDATE_SPENDS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),
};

export default (state = initialState, action: ProspectSourceActionTypes): ProspectSourceState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
