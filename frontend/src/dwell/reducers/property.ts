import { actions } from 'dwell/constants';
import { unionBy } from 'lodash';
import { PropertyState, PropertyActionTypes } from 'src/interfaces';

const initialState: PropertyState = {
  isSubmitting: false,
  errorMessage: null,
  properties: [],
  property: {},
  isUpdatingStatus: false,
  allPropertiesScored: false,
  isPropertyDataLoaded: false,
};

const actionMap = {
  [actions.GET_PROPERTY_REQUEST]: state => ({ ...state, isSubmitting: true, isPropertyDataLoaded: false }),
  [actions.GET_PROPERTY_SUCCESS]: (state, { result: { data: { results } } }) => ({ ...state, isSubmitting: false, properties: results, isPropertyDataLoaded: true }),
  [actions.GET_PROPERTY_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false, isPropertyDataLoaded: false }),

  [actions.GET_CURRENT_PROPERTY_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_CURRENT_PROPERTY_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, property: { ...data } }),
  [actions.GET_CURRENT_PROPERTY_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_PROPERTY_SYNC_SETTINGS_REQUEST]: state => ({ ...state, isUpdatingStatus: true }),
  [actions.UPDATE_PROPERTY_SYNC_SETTINGS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isUpdatingStatus: false, property: data }),
  [actions.UPDATE_PROPERTY_SYNC_SETTINGS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isUpdatingStatus: false }),

  [actions.REQUIRE_RESCORE_CALL_SUCCESS]: state => ({ ...state, property: { ...state.property, is_call_rescore_required_today: true } }),

  [actions.CLEAR_ALL_PROPERTIES_SCORED]: state => ({ ...state, allPropertiesScored: false }),
  [actions.SET_SCORED_PROPERTY]: (state, { id }) => {
    const resultProperties = state.properties.map((property) => {
      const result = { ...property };
      if (id === property.external_id) {
        result.has_scored_calls_today = true;
      }
      return result;
    });

    return {
      ...state,
      properties: resultProperties,
      allPropertiesScored: !resultProperties.some(item => !item.has_scored_calls_today && item.not_scored_calls_count > 0),
    };
  },

  [actions.PROPERTY_UPDATE_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.PROPERTY_UPDATE_SUCCESS]: (state, { result: { data } }) =>
    ({ ...state, isSubmitting: false, property: data.id === state.property.id ? data : state.property, properties: unionBy([data], state.properties, 'id') }),
  [actions.PROPERTY_UPDATE_FAILURE]: state => ({ ...state, isSubmitting: false }),

  [actions.UPDATE_TOUR_OPTIONS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_TOUR_OPTIONS_SUCCESS]: (state, { result: { data } }) =>
    ({ ...state, isSubmitting: false, property: data.id === state.property.id ? data : state.property, properties: unionBy([data], state.properties, 'id') }),
  [actions.UPDATE_TOUR_OPTIONS_FAILURE]: state => ({ ...state, isSubmitting: false }),

  [actions.PROPERTY_CREATE_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.PROPERTY_CREATE_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.PROPERTY_CREATE_FAILURE]: state => ({ ...state, isSubmitting: false }),

  [actions.SUBMIT_CALLS_SCORE_STATE_SUCCESS]: state => ({ ...state, isSubmitting: false, properties: state.properties.map(p => ({ ...p, is_call_scoring_submitted_today: true })) }),
};

export default (state = initialState, action: PropertyActionTypes): PropertyState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
