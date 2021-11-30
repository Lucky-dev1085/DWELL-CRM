import { actions, paths } from 'compete/constants';
import { ActionType, ManageRequestProps } from 'src/interfaces';

export default {
  getSubmarketProperties: (id: number, params?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_SUBMARKET_PROPERTIES_REQUEST,
        actions.GET_SUBMARKET_PROPERTIES_SUCCESS,
        actions.GET_SUBMARKET_PROPERTIES_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.SUBMARKET_PROPERTIES_BY_ID, id), { params }),
    },
  }),

  getSubmarketDetail: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_SUBMARKET_DETAIL_REQUEST,
        actions.GET_SUBMARKET_DETAIL_SUCCESS,
        actions.GET_SUBMARKET_DETAIL_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.SUBMARKET_DETAIL, id)),
    },
  }),

  getSubmarketRentComp: (id: number, params?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_SUBMARKET_RENT_COMPS_REQUEST,
        actions.GET_SUBMARKET_RENT_COMPS_SUCCESS,
        actions.GET_SUBMARKET_RENT_COMPS_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.SUBMARKET_RENT_COMPS, id), { params }),
    },
  }),

  getSubmarketMTRBreakdown: (id: number, params?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_SUBMARKET_MTR_BREAKDOWN_REQUEST,
        actions.GET_SUBMARKET_MTR_BREAKDOWN_SUCCESS,
        actions.GET_SUBMARKET_MTR_BREAKDOWN_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.SUBMARKET_MTR_BREAKDOWN, id), { params }),
    },
  }),
};
