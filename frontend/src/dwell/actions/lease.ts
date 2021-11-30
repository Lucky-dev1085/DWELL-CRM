import { actions, paths } from 'dwell/constants';
import { build } from 'dwell/constants/paths';
import { CallBackFunction, ActionType, PropertyPolicy, DurationPricing } from 'src/interfaces';

interface PayloadData {
  id?: number,
  name?: string,
  description?: string,
}

export default {
  saveLeaseDefault: (data: PayloadData, successCB: CallBackFunction = null): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.SAVE_LEASE_DEFAULT_REQUEST,
          actions.SAVE_LEASE_DEFAULT_SUCCESS,
          actions.SAVE_LEASE_DEFAULT_FAILURE,
        ],
        promise: client => client.post(paths.api.v1.LEASE_DEFAULTS, data),
        successCB,
      },
    }),
  savePropertyPolicy: (data: PropertyPolicy, successCB: CallBackFunction = null): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.SAVE_PROPERTY_POLICY_REQUEST,
          actions.SAVE_PROPERTY_POLICY_SUCCESS,
          actions.SAVE_PROPERTY_POLICY_FAILURE,
        ],
        promise: client => client.post(paths.api.v1.PROPERTY_POLICIES, data),
        successCB,
      },
    }),
  saveDurationPricing: (data: DurationPricing, successCB: CallBackFunction = null): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.SAVE_DURATION_PRICING_REQUEST,
          actions.SAVE_DURATION_PRICING_SUCCESS,
          actions.SAVE_DURATION_PRICING_FAILURE,
        ],
        promise: client => client.post(paths.api.v1.DURATION_PRICING, data),
        successCB,
      },
    }),
  createRentableItem: (data: PayloadData, successCB: CallBackFunction = null): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.CREATE_RENTABLE_ITEM_REQUEST,
          actions.CREATE_RENTABLE_ITEM_SUCCESS,
          actions.CREATE_RENTABLE_ITEM_FAILURE,
        ],
        promise: client => client.post(paths.api.v1.RENTABLE_ITEMS, data),
        successCB,
      },
    }),
  updateRentableItem: (id: number, params: PayloadData, successCB: CallBackFunction = null): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.UPDATE_RENTABLE_ITEM_REQUEST,
          actions.UPDATE_RENTABLE_ITEM_SUCCESS,
          actions.UPDATE_RENTABLE_ITEM_FAILURE,
        ],
        promise: client => client.patch(build(paths.api.v1.RENTABLE_ITEM_DETAILS, id), params),
        successCB,
      },
    }),
  deleteRentableItem: (id: number, successCB: CallBackFunction = null): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.DELETE_RENTABLE_ITEM_REQUEST,
          actions.DELETE_RENTABLE_ITEM_SUCCESS,
          actions.DELETE_RENTABLE_ITEM_FAILURE,
        ],
        promise: client => client.delete(build(paths.api.v1.RENTABLE_ITEM_DETAILS, id)),
        successCB,
      },
    }),
  getRentableItems: (): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.GET_RENTABLE_ITEMS_REQUEST,
          actions.GET_RENTABLE_ITEMS_SUCCESS,
          actions.GET_RENTABLE_ITEMS_FAILURE,
        ],
        promise: client => client.get(paths.api.v1.RENTABLE_ITEMS),
      },
    }),
};
