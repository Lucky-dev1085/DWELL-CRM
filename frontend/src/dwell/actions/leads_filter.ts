import { actions, paths } from 'dwell/constants';
import { build } from 'dwell/constants/paths';
import { ActionType } from 'src/interfaces';

interface FilterData {
  name: string,
  filter_items: { compare_field: string, compare_operator: string, compare_value: string[] }[],
  filter_type: string,
  focused: boolean,
  id: number,
}

export default {
  getLeadsFilter: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_LEADS_FILTER_REQUEST,
        actions.GET_LEADS_FILTER_SUCCESS,
        actions.GET_LEADS_FILTER_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.LEADS_FILTER),
    },
  }),
  createLeadsFilter: (leadsFilter: FilterData): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_LEADS_FILTER_REQUEST,
        actions.CREATE_LEADS_FILTER_SUCCESS,
        actions.CREATE_LEADS_FILTER_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.LEADS_FILTER, leadsFilter),
    },
  }),
  getLeadsFilterById: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_LEADS_FILTER_BY_ID_REQUEST,
        actions.GET_LEADS_FILTER_BY_ID_SUCCESS,
        actions.GET_LEADS_FILTER_BY_ID_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.LEADS_FILTER_DETAILS, id)),
    },
  }),
  updateLeadsFilter: (id: number, params: FilterData): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_LEADS_FILTER_REQUEST,
        actions.UPDATE_LEADS_FILTER_SUCCESS,
        actions.UPDATE_LEADS_FILTER_FAILURE,
      ],
      promise: client => client.put(build(paths.api.v1.LEADS_FILTER_DETAILS, id), params),
    },
  }),
  deleteLeadsFilter: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.DELETE_LEADS_FILTER_REQUEST,
        actions.DELETE_LEADS_FILTER_SUCCESS,
        actions.DELETE_LEADS_FILTER_FAILURE,
      ],
      promise: client => client.delete(build(paths.api.v1.LEADS_FILTER_DETAILS, id)),
    },
  }),
  getActiveFilter: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_ACTIVE_FILTER_REQUEST,
        actions.GET_ACTIVE_FILTER_SUCCESS,
        actions.GET_ACTIVE_FILTER_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.GET_ACTIVE_FILTER),
    },
  }),
  setActiveFilter: (activeFilter: string): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.SET_ACTIVE_FILTER_REQUEST,
        actions.SET_ACTIVE_FILTER_SUCCESS,
        actions.SET_ACTIVE_FILTER_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.SET_ACTIVE_FILTER, activeFilter),
    },
  }),
};
