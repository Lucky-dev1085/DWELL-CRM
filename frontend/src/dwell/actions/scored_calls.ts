import { actions, paths } from 'dwell/constants';
import { build } from 'dwell/constants/paths';
import { ActionType } from 'src/interfaces';

interface ScoredCall {
  [key: string]: string | number | number[]
}

export default {
  getScoredCalls: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_SCORED_CALLS_REQUEST,
        actions.GET_SCORED_CALLS_SUCCESS,
        actions.GET_SCORED_CALLS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.SCORED_CALLS, { params: { show_all: true } }),
    },
  }),

  updateScoredCallById: (id: number, data: ScoredCall): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_SCORED_CALL_REQUEST,
        actions.UPDATE_SCORED_CALL_SUCCESS,
        actions.UPDATE_SCORED_CALL_FAILURE,
      ],
      promise: client => client.patch(build(paths.api.v1.SCORED_CALL_DETAILS, id), data),
    },
  }),

  createScoredCall: (data: ScoredCall): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_SCORED_CALL_REQUEST,
        actions.CREATE_SCORED_CALL_SUCCESS,
        actions.CREATE_SCORED_CALL_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.SCORED_CALLS, data),
    },
  }),

  requireRescoreCall: (id: number, data: ScoredCall): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.REQUIRE_RESCORE_CALL_REQUEST,
        actions.REQUIRE_RESCORE_CALL_SUCCESS,
        actions.REQUIRE_RESCORE_CALL_FAILURE,
      ],
      promise: client => client.post(build(paths.api.v1.REQUIRE_RESCORE_CALL, id), data),
    },
  }),

  getCallRescoresMeta: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CALL_RESCORES_META_REQUEST,
        actions.GET_CALL_RESCORES_META_SUCCESS,
        actions.GET_CALL_RESCORES_META_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.CALL_RESCORES_META),
    },
  }),
};
