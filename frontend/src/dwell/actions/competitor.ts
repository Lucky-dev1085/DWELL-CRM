import { actions, paths } from 'dwell/constants';
import { build } from 'dwell/constants/paths';
import { ActionType, CompetitorProps } from 'src/interfaces';

export default {
  getCompetitors: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_COMPETITORS_REQUEST,
        actions.GET_COMPETITORS_SUCCESS,
        actions.GET_COMPETITORS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.COMPETITOR, { params: { show_all: true } }),
    },
  }),
  updateCompetitorById: (id: number, params: CompetitorProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_COMPETITOR_REQUEST,
        actions.UPDATE_COMPETITOR_SUCCESS,
        actions.UPDATE_COMPETITOR_FAILURE,
      ],
      promise: client => client.patch(build(paths.api.v1.COMPETITOR_DETAILS, id), params),
    },
  }),

  createCompetitor: (data: CompetitorProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_COMPETITOR_REQUEST,
        actions.CREATE_COMPETITOR_SUCCESS,
        actions.CREATE_COMPETITOR_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.COMPETITOR, data),
    },
  }),

  deleteCompetitorRateById: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.DELETE_COMPETITOR_REQUEST,
        actions.DELETE_COMPETITOR_SUCCESS,
        actions.DELETE_COMPETITOR_FAILURE,
      ],
      promise: client => client.delete(build(paths.api.v1.COMPETITOR_DETAILS, id)),
    },
  }),
};
