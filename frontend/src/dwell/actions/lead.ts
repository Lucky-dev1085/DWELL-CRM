import { actions, paths } from 'dwell/constants';
import { build } from 'dwell/constants/paths';
import { ActionType, LeadData, ManageRequestProps } from 'src/interfaces';

interface ActionLead {
  type: string,
  keyword?: string,
  filterType?: string,
}

export default {
  getLeads: (param: ManageRequestProps, token = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_LEAD_REQUEST,
        actions.GET_LEAD_SUCCESS,
        actions.GET_LEAD_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.LEAD, { params: param, cancelToken: token }),
    },
  }),
  getLeadById: (id: number, params?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_LEAD_BY_ID_REQUEST,
        actions.GET_LEAD_BY_ID_SUCCESS,
        actions.GET_LEAD_BY_ID_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.LEAD_DETAILS, id), { params }),
    },
  }),
  updateLeadById: (id: number, params: LeadData): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_LEAD_REQUEST,
        actions.UPDATE_LEAD_SUCCESS,
        actions.UPDATE_LEAD_FAILURE,
      ],
      promise: client => client.patch(build(paths.api.v1.LEAD_DETAILS, id), params),
    },
  }),
  deleteLeads: (ids: number[]): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.DELETE_LEADS_REQUEST,
        actions.DELETE_LEADS_SUCCESS,
        actions.DELETE_LEADS_FAILURE,
      ],
      promise: client => client.delete(paths.api.v1.LEAD_DELETE, { data: ids }),
    },
  }),
  clearLeads: (): ActionLead => ({
    type: actions.CLEAR_LEADS,
  }),
  updateLeads: (params: LeadData): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_LEADS_REQUEST,
        actions.UPDATE_LEADS_SUCCESS,
        actions.UPDATE_LEADS_FAILURE,
      ],
      promise: client => client.put(paths.api.v1.LEAD_UPDATE, params),
    },
  }),
  createLead: (data: LeadData): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_LEAD_REQUEST,
        actions.CREATE_LEAD_SUCCESS,
        actions.CREATE_LEAD_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.LEAD, data),
    },
  }),
  getLeadNames: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_LEAD_NAMES_REQUEST,
        actions.GET_LEAD_NAMES_SUCCESS,
        actions.GET_LEAD_NAMES_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.LEAD_NAMES),
    },
  }),
  testResman: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.TEST_RESMAN_REQUEST,
        actions.TEST_RESMAN_SUCCESS,
        actions.TEST_RESMAN_FAILURE,
      ],
      promise: client => client.get(`${build(paths.api.v1.LEAD_DETAILS, id)}run_test_sync/`),
    },
  }),
  getFilteredLeadsCount: (leadsFilter: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_FILTERED_LEADS_COUNT_REQUEST,
        actions.GET_FILTERED_LEADS_COUNT_SUCCESS,
        actions.GET_FILTERED_LEADS_COUNT_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.FILTERED_LEADS_COUNT, leadsFilter),
    },
  }),
  mergeLeads: (data: LeadData): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.MERGE_LEADS_REQUEST,
        actions.MERGE_LEADS_SUCCESS,
        actions.MERGE_LEADS_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.MERGE_LEADS, data),
    },
  }),
  shareLead: (data: LeadData): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.SHARE_LEAD_REQUEST,
        actions.SHARE_LEAD_SUCCESS,
        actions.SHARE_LEAD_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.SHARE_LEAD, data),
    },
  }),
  transferLead: (data: LeadData): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.TRANSFER_LEAD_REQUEST,
        actions.TRANSFER_LEAD_SUCCESS,
        actions.TRANSFER_LEAD_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.SHARE_LEAD, data),
    },
  }),
  getPMSSyncStatusById: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_PMS_SYNC_STATUS_BY_ID_REQUEST,
        actions.GET_PMS_SYNC_STATUS_BY_ID_SUCCESS,
        actions.GET_PMS_SYNC_STATUS_BY_ID_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.LEAD_DETAILS, id)),
    },
  }),

  getCommunicationsById: (id: number, params: ManageRequestProps, token = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_COMMUNICATIONS_BY_ID_REQUEST,
        actions.GET_COMMUNICATIONS_BY_ID_SUCCESS,
        actions.GET_COMMUNICATIONS_BY_ID_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.LEADS_COMMUNICATION, id), { params, cancelToken: token }),
    },
  }),

  getLeadForProspect: (id: number, params?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_LEAD_FOR_PROSPECT_REQUEST,
        actions.GET_LEAD_FOR_PROSPECT_SUCCESS,
        actions.GET_LEAD_FOR_PROSPECT_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.LEAD_DETAILS, id), { params }),
    },
  }),

  setCommunicationSearchKeyword: (keyword: string): ActionLead => ({
    type: actions.SET_COMMUNICATION_SEARCH_KEYWORD,
    keyword,
  }),

  setCommunicationFilterType: (filterType: string): ActionLead => ({
    type: actions.SET_COMMUNICATION_FILTER_TYPE,
    filterType,
  }),
};
