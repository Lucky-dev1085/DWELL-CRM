import { get } from 'lodash';
import { actions, paths } from 'compete/constants';
import { ActionType, ManageRequestProps, CallBackFunction, Alert } from 'src/interfaces';

export default {
  getAlertSubscriptions: (params?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_ALERTS_SUBSCRIPTIONS_REQUEST,
        actions.GET_ALERTS_SUBSCRIPTIONS_SUCCESS,
        actions.GET_ALERTS_SUBSCRIPTIONS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.ALERTS_SUBSCRIPTIONS, { params }),
    },
  }),

  createAlert: (alert: Alert): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_ALERT_REQUEST,
        actions.CREATE_ALERT_SUCCESS,
        actions.CREATE_ALERT_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.ALERTS_SUBSCRIPTIONS, alert),
    },
  }),

  getAlertById: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_ALERTS_BY_ID_REQUEST,
        actions.GET_ALERTS_BY_ID_SUCCESS,
        actions.GET_ALERTS_BY_ID_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.ALERT_BY_ID, id)),
    },
  }),

  deleteAlert: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.DELETE_ALERT_REQUEST,
        actions.DELETE_ALERT_SUCCESS,
        actions.DELETE_ALERT_FAILURE,
      ],
      promise: client => client.delete(paths.build(paths.api.v1.ALERT_BY_ID, id)),
    },
  }),

  updateAlert: (id: number, alert: Alert, successCB: CallBackFunction = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_ALERT_REQUEST,
        actions.UPDATE_ALERT_SUCCESS,
        actions.UPDATE_ALERT_FAILURE,
      ],
      promise: client => client.put(paths.build(paths.api.v1.ALERT_BY_ID, id), alert),
      successCB,
    },
  }),

  getAlertLogDetail: (id: number, params?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_ALERT_LOG_DETAIL_REQUEST,
        actions.GET_ALERT_LOG_DETAIL_SUCCESS,
        actions.GET_ALERT_LOG_DETAIL_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.ALERT_LOG_DETAIL, id), { params }),
    },
  }),

  getAlertLogDetailByUnitType: (id: number, params?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_ALERT_LOG_DETAIL_BY_UNIT_TYPE_REQUEST,
        actions.GET_ALERT_LOG_DETAIL_BY_UNIT_TYPE_SUCCESS,
        actions.GET_ALERT_LOG_DETAIL_BY_UNIT_TYPE_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.ALERT_LOG_DETAIL, id), { params }),
      unitType: get(params, 'unit_type'),
    },
  }),
};
