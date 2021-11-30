import { actions, paths } from 'compete/constants';
import { ActionType, ManageRequestProps } from 'src/interfaces';

export default {
  getMarketDetail: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_MARKET_DETAIL_REQUEST,
        actions.GET_MARKET_DETAIL_SUCCESS,
        actions.GET_MARKET_DETAIL_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.MARKET_DETAIL, id)),
    },
  }),

  getMarketProperties: (id: number, params?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_MARKET_PROPERTIES_REQUEST,
        actions.GET_MARKET_PROPERTIES_SUCCESS,
        actions.GET_MARKET_PROPERTIES_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.MARKET_PROPERTIES, id), { params }),
    },
  }),

  getMarketSubmarkets: (id: number, params?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_MARKET_SUBMARKETS_REQUEST,
        actions.GET_MARKET_SUBMARKETS_SUCCESS,
        actions.GET_MARKET_SUBMARKETS_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.MARKET_SUBMARKETS, id), { params }),
    },
  }),

  getMarketRentComp: (id: number, params?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_MARKET_RENT_COMPS_REQUEST,
        actions.GET_MARKET_RENT_COMPS_SUCCESS,
        actions.GET_MARKET_RENT_COMPS_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.MARKET_RENT_COMPS, id), { params }),
    },
  }),

  getMTRGroupBreakdown: (id: number, params?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_MTR_GROUP_BREAKDOWN_REQUEST,
        actions.GET_MTR_GROUP_BREAKDOWN_SUCCESS,
        actions.GET_MTR_GROUP_BREAKDOWN_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.MTR_BREAKDOWN, id), { params }),
    },
  }),
};
