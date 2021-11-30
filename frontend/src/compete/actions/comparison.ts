import { actions, paths } from 'compete/constants';
import { ActionType, ComparisonReport, ManageRequestProps } from 'src/interfaces';

export default {
  getComparisonList: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_COMPARISON_LIST_REQUEST,
        actions.GET_COMPARISON_LIST_SUCCESS,
        actions.GET_COMPARISON_LIST_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.COMPARISON),
    },
  }),

  getComparisonById: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_COMPARISON_BY_ID_REQUEST,
        actions.GET_COMPARISON_BY_ID_SUCCESS,
        actions.GET_COMPARISON_BY_ID_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.COMPARISON_BY_ID, id)),
    },
  }),

  createComparison: (comparison: ComparisonReport): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_COMPARISON_REQUEST,
        actions.CREATE_COMPARISON_SUCCESS,
        actions.CREATE_COMPARISON_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.COMPARISON, comparison),
    },
  }),

  getHighestAvgRent: (id: number, params?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_HIGHEST_RENT_REQUEST,
        actions.GET_HIGHEST_RENT_SUCCESS,
        actions.GET_HIGHEST_RENT_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.COMPARISON_HIGHEST_RENT, id), { params }),
    },
  }),

  getHighestOccupancy: (id: number, params?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_HIGHEST_OCCUPANCY_REQUEST,
        actions.GET_HIGHEST_OCCUPANCY_SUCCESS,
        actions.GET_HIGHEST_OCCUPANCY_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.COMPARISON_HIGHEST_OCCUPANCY, id), { params }),
    },
  }),
};
