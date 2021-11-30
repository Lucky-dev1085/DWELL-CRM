import { actions } from 'compete/constants';
import { PropertiesState, PropertiesActionTypes, Properties } from 'src/interfaces';

const initialState: PropertiesState = {
  isSubmitting: false,
  errorMessage: null,
  isAvailableUnitsLoaded: false,
  isPropertiesDetailLoaded: false,
  isPropertiesCompetitorsLoaded: false,
  isCompetitorListLoaded: false,
  isAlertLoaded: false,
  countAvailableUnit: 0,
  countCompetitors: 0,
  availableUnits: null,
  propertiesDetail: null,
  propertiesCompetitors: null,
  competitorList: null,
  alertSubscriptions: null,
  isSessionLoaded: false,
  sessionInfo: null,
  properties: [],
};

const actionMap = {
  [actions.GET_AVAILABLE_UNITS_REQUEST]: state => ({ ...state, isAvailableUnitsLoaded: false }),
  [actions.GET_AVAILABLE_UNITS_SUCCESS]: (state, { result: { data: { results, count } } }) => ({ ...state, availableUnits: results, isAvailableUnitsLoaded: true, countAvailableUnit: count }),
  [actions.GET_AVAILABLE_UNITS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isAvailableUnitsLoaded: false }),

  [actions.GET_PROPERTIES_SUCCESS]: (state, { result: { data: { results } } }) => ({ ...state, properties: results }),

  [actions.GET_PROPERTIES_DETAIL_REQUEST]: state => ({ ...state, isPropertiesDetailLoaded: false }),
  [actions.GET_PROPERTIES_DETAIL_SUCCESS]: (state, { result: { data } }) => ({ ...state, propertiesDetail: data, isPropertiesDetailLoaded: true }),
  [actions.GET_PROPERTIES_DETAIL_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isPropertiesDetailLoaded: false }),

  [actions.GET_PROPERTIES_COMPETITORS_REQUEST]: state => ({ ...state, isPropertiesCompetitorsLoaded: false }),
  [actions.GET_PROPERTIES_COMPETITORS_SUCCESS]: (state, { result: { data: { results, count } } }) => ({ ...state, propertiesCompetitors: results, isPropertiesCompetitorsLoaded: true, countCompetitors: count }),
  [actions.GET_PROPERTIES_COMPETITORS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isPropertiesCompetitorsLoaded: false }),

  [actions.ADD_MARKET_ENVIRONMENT_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.ADD_MARKET_ENVIRONMENT_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.ADD_MARKET_ENVIRONMENT_FAILURE]: state => ({ ...state, isSubmitting: false }),

  [actions.GET_COMPETITOR_SET_REQUEST]: state => ({ ...state, isCompetitorListLoaded: false }),
  [actions.GET_COMPETITOR_SET_SUCCESS]: (state, { result: { data: { results } } }) => ({ ...state, competitorList: results, isCompetitorListLoaded: true }),
  [actions.GET_COMPETITOR_SET_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isCompetitorListLoaded: false }),

  [actions.GET_PROPERTIES_ALERT_SUBSCRIPTIONS_REQUEST]: state => ({ ...state, isAlertLoaded: false }),
  [actions.GET_PROPERTIES_ALERT_SUBSCRIPTIONS_SUCCESS]: (state, { result: { data } }) => ({ ...state, alertSubscriptions: data, isAlertLoaded: true }),
  [actions.GET_PROPERTIES_ALERT_SUBSCRIPTIONS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isAlertLoaded: false }),

  [actions.GET_SESSION_DETAIL_BY_ID_REQUEST]: state => ({ ...state, isSessionLoaded: false }),
  [actions.GET_SESSION_DETAIL_BY_ID_SUCCESS]: (state, { result: { data } }) => ({ ...state, sessionInfo: data, isSessionLoaded: true }),
  [actions.GET_SESSION_DETAIL_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSessionLoaded: false }),

  [actions.SET_AVAILABLE_LOADED]: state => ({ ...state, isAvailableUnitsLoaded: false }),
  [actions.SET_COMPETITORS_LOADED]: state => ({ ...state, isPropertiesCompetitorsLoaded: false }),
};

export const selectProperties = (state : { properties: PropertiesState }) : Properties[] => state.properties.properties;

export default (state = initialState, action: PropertiesActionTypes): PropertiesState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
