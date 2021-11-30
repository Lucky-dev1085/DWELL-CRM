import { actions } from 'compete/constants';
import { AlertState, AlertActionTypes } from 'src/interfaces';

const initialState: AlertState = {
  isSubmitting: false,
  errorMessage: null,
  isAlertSubscriptionsLoaded: false,
  isAlertLoaded: false,
  countAlerts: 0,
  alertLogCount: 0,
  alertSubscriptions: null,
  alert: null,
  isAlertLogLoaded: false,
  alertLog: null,
  isUnitTypesLogLoaded: {},
  unitTypesLog: {},
  unitTypesLogCount: {},
};

const actionMap = {
  [actions.GET_ALERTS_SUBSCRIPTIONS_REQUEST]: state => ({ ...state, isAlertSubscriptionsLoaded: false }),
  [actions.GET_ALERTS_SUBSCRIPTIONS_SUCCESS]: (state, { result: { data: { results, count } } }) => ({ ...state, alertSubscriptions: results, isAlertSubscriptionsLoaded: true, countAlerts: count, isAlertLogLoaded: false }),
  [actions.GET_ALERTS_SUBSCRIPTIONS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isAlertSubscriptionsLoaded: false }),

  [actions.GET_ALERTS_BY_ID_REQUEST]: state => ({ ...state, isAlertLoaded: false }),
  [actions.GET_ALERTS_BY_ID_SUCCESS]: (state, { result: { data } }) => ({ ...state, alert: data, isAlertLoaded: true }),
  [actions.GET_ALERTS_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isAlertLoaded: false }),

  [actions.GET_ALERT_LOG_DETAIL_REQUEST]: state => ({ ...state, isAlertLogLoaded: false }),
  [actions.GET_ALERT_LOG_DETAIL_SUCCESS]: (state, { result: { data } }) => ({ ...state, alertLog: data, isAlertLogLoaded: true, alertLogCount: data.count }),
  [actions.GET_ALERT_LOG_DETAIL_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isAlertLogLoaded: false }),

  [actions.CREATE_ALERT_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_ALERT_SUCCESS]: state => ({ ...state, isSubmitting: false, isAlertSubscriptionsLoaded: false }),
  [actions.CREATE_ALERT_FAILURE]: state => ({ ...state, isSubmitting: false }),

  [actions.DELETE_ALERT_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.DELETE_ALERT_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.DELETE_ALERT_FAILURE]: state => ({ ...state, isSubmitting: false }),

  [actions.UPDATE_ALERT_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_ALERT_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, alert: data }),
  [actions.UPDATE_ALERT_FAILURE]: state => ({ ...state, isSubmitting: false }),

  [actions.GET_ALERT_LOG_DETAIL_BY_UNIT_TYPE_REQUEST]: (state, { unitType }) => ({ ...state, isUnitTypesLogLoaded: { ...state.isUnitTypesLogLoaded, [unitType]: false } }),
  [actions.GET_ALERT_LOG_DETAIL_BY_UNIT_TYPE_SUCCESS]: (state, { result: { data: { results, count } }, unitType }) => ({
    ...state,
    unitTypesLog: { ...state.unitTypesLog, [unitType]: results },
    isUnitTypesLogLoaded: { ...state.isUnitTypesLogLoaded, [unitType]: true },
    unitTypesLogCount: { ...state.unitTypesLogCount, [unitType]: count },
  }),
  [actions.GET_ALERT_LOG_DETAIL_BY_UNIT_TYPE_FAILURE]: (state, { error: { response: { status } }, unitType }) => ({ ...state, errorMessage: status, isUnitTypesLogLoaded: { ...state.isUnitTypesLogLoaded, [unitType]: false } }),
};

export default (state = initialState, action: AlertActionTypes): AlertState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
