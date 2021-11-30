import { actions, paths } from 'dwell/constants';
import { successCallback, failureCallback } from 'site/common';
import { CallBackFunction, ActionType, ManageRequestProps, PropertyProps } from 'src/interfaces';

interface ActionScored {
  type: string,
  id?: number,
}

export default {
  getProperties: (showAll: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_PROPERTY_REQUEST,
        actions.GET_PROPERTY_SUCCESS,
        actions.GET_PROPERTY_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.PROPERTY, { params: showAll }),
    },
  }),
  updatePropertyNylasSettings: (data: PropertyProps, successCB: CallBackFunction = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_PROPERTY_SYNC_SETTINGS_REQUEST,
        actions.UPDATE_PROPERTY_SYNC_SETTINGS_SUCCESS,
        actions.UPDATE_PROPERTY_SYNC_SETTINGS_FAILURE,
      ],
      promise: client => client.put(paths.api.v1.PROPERTY_NYLAS_SYNC_SETTINGS_UPDATE, data),
      successCB,
    },
  }),

  submitCallsScoreState: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.SUBMIT_CALLS_SCORE_STATE_REQUEST,
        actions.SUBMIT_CALLS_SCORE_STATE_SUCCESS,
        actions.SUBMIT_CALLS_SCORE_STATE_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.PROPERTY_SCORE_STATE),
    },
  }),

  getCurrentProperty: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CURRENT_PROPERTY_REQUEST,
        actions.GET_CURRENT_PROPERTY_SUCCESS,
        actions.GET_CURRENT_PROPERTY_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.CURRENT_PROPERTY),
    },
  }),

  clearAllPropertiesScored: (): ActionScored => ({
    type: actions.CLEAR_ALL_PROPERTIES_SCORED,
  }),

  setPropertyAsScored: (id: number): ActionScored => ({
    type: actions.SET_SCORED_PROPERTY,
    id,
  }),

  updateProperty: (id: number, property: PropertyProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.PROPERTY_UPDATE_REQUEST,
        actions.PROPERTY_UPDATE_SUCCESS,
        actions.PROPERTY_UPDATE_FAILURE,
      ],
      promise: client => client.patch(paths.build(paths.api.v1.PROPERTIES_ID, id), property),
    },
  }),

  updateTourOptions: (id: number, property: PropertyProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_TOUR_OPTIONS_REQUEST,
        actions.UPDATE_TOUR_OPTIONS_SUCCESS,
        actions.UPDATE_TOUR_OPTIONS_FAILURE,
      ],
      promise: client => client.patch(paths.build(paths.api.v1.PROPERTIES_ID, id), property),
    },
  }),

  createProperty: (property: PropertyProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.PROPERTY_CREATE_REQUEST,
        actions.PROPERTY_CREATE_SUCCESS,
        actions.PROPERTY_CREATE_FAILURE,
      ],
      promise: client => client.post(paths.build(paths.api.v1.PROPERTY), property),
    },
  }),

  deleteProperty: (id: number, successCB: CallBackFunction = successCallback, failureCB: CallBackFunction = failureCallback): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.PROPERTY_DELETE_REQUEST,
        actions.PROPERTY_DELETE_SUCCESS,
        actions.PROPERTY_DELETE_FAILURE,
      ],
      promise: client => client.delete(paths.build(paths.api.v1.PROPERTIES_ID, id)),
      successCB,
      failureCB,
    },
  }),
};
