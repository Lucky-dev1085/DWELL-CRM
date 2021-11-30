import { actions, paths } from 'compete/constants';
import { ActionType, ManageRequestProps, MarketEnvironment, CallBackFunction } from 'src/interfaces';

interface ActionChange {
  type: string,
  changed?: boolean,
}

export default {
  getAvailableUnits: (id: number, params?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_AVAILABLE_UNITS_REQUEST,
        actions.GET_AVAILABLE_UNITS_SUCCESS,
        actions.GET_AVAILABLE_UNITS_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.AVAILABLE_UNITS, id), { params }),
    },
  }),

  getProperties: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_PROPERTIES_REQUEST,
        actions.GET_PROPERTIES_SUCCESS,
        actions.GET_PROPERTIES_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.PROPERTIES, { params: { show_all: true } }),
    },
  }),

  getPropertiesDetail: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_PROPERTIES_DETAIL_REQUEST,
        actions.GET_PROPERTIES_DETAIL_SUCCESS,
        actions.GET_PROPERTIES_DETAIL_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.PROPERTIES_DETAIL, id)),
    },
  }),

  getPropertiesCompetitors: (id: number, params?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_PROPERTIES_COMPETITORS_REQUEST,
        actions.GET_PROPERTIES_COMPETITORS_SUCCESS,
        actions.GET_PROPERTIES_COMPETITORS_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.PROPERTIES_COMPETITORS, id), { params }),
    },
  }),

  saveMarketEnvironment: (id: number, data: MarketEnvironment, successCB: CallBackFunction = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.ADD_MARKET_ENVIRONMENT_REQUEST,
        actions.ADD_MARKET_ENVIRONMENT_SUCCESS,
        actions.ADD_MARKET_ENVIRONMENT_FAILURE,
      ],
      promise: client => client.post(paths.build(paths.api.v1.MARKET_ENVIRONMENT, id), data),
      successCB,
    },
  }),

  getCompetitorSet: (params?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_COMPETITOR_SET_REQUEST,
        actions.GET_COMPETITOR_SET_SUCCESS,
        actions.GET_COMPETITOR_SET_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.COMPETITOR_SET, { params }),
    },
  }),

  getAlertSubscriptions: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_PROPERTIES_ALERT_SUBSCRIPTIONS_REQUEST,
        actions.GET_PROPERTIES_ALERT_SUBSCRIPTIONS_SUCCESS,
        actions.GET_PROPERTIES_ALERT_SUBSCRIPTIONS_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.PROPERTIES_ALERT, id)),
    },
  }),

  getSessionDetailById: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_SESSION_DETAIL_BY_ID_REQUEST,
        actions.GET_SESSION_DETAIL_BY_ID_SUCCESS,
        actions.GET_SESSION_DETAIL_BY_ID_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.UNIT_SESSION, id)),
    },
  }),

  setAvailableLoaded: (changed: boolean): ActionChange => ({ type: actions.SET_AVAILABLE_LOADED, changed }),
  setCompetitorsLoaded: (changed: boolean): ActionChange => ({ type: actions.SET_COMPETITORS_LOADED, changed }),
};
