import { actions, paths } from 'dwell/constants';
import { ActionType } from 'src/interfaces';

interface GetReport {
  id: number,
  date_period: string,
  custom_date_start: string,
  custom_date_end: string,
  type: string,
  compare_value: string,
  attribution: string,
}

interface ActionReport {
  type: string,
}

export default {
  getOverviewReports: (params: GetReport, token = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_OVERVIEW_REPORTS_REQUEST,
        actions.GET_OVERVIEW_REPORTS_SUCCESS,
        actions.GET_OVERVIEW_REPORTS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.REPORTS.OVERVIEW_REPORTS, { params, cancelToken: token }),
    },
  }),
  getMarketingReports: (params: GetReport, token = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_MARKETING_REPORTS_REQUEST,
        actions.GET_MARKETING_REPORTS_SUCCESS,
        actions.GET_MARKETING_REPORTS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.REPORTS.MARKETING_REPORTS, { params, cancelToken: token }),
    },
  }),
  getOperationsReports: (params: GetReport, token = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_OPERATIONS_REPORTS_REQUEST,
        actions.GET_OPERATIONS_REPORTS_SUCCESS,
        actions.GET_OPERATIONS_REPORTS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.REPORTS.OPERATIONS_REPORTS, { params, cancelToken: token }),
    },
  }),
  getSitesReports: (params: GetReport, token = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_SITES_REPORTS_REQUEST,
        actions.GET_SITES_REPORTS_SUCCESS,
        actions.GET_SITES_REPORTS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.REPORTS.SITES_REPORTS, { params, cancelToken: token }),
    },
  }),
  clearReports: (): ActionReport => ({
    type: actions.CLEAR_REPORTS,
  }),
  getLeadSourceDrilldown: (params: GetReport, token = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_LEAD_SOURCE_DRILLDOWN_REQUEST,
        actions.GET_LEAD_SOURCE_DRILLDOWN_SUCCESS,
        actions.GET_LEAD_SOURCE_DRILLDOWN_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.REPORTS.LEAD_SOURCE_DRILLDOWN, { params, cancelToken: token }),
    },
  }),
  getLeadLostDrilldown: (params: GetReport): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_LEAD_LOST_DRILLDOWN_REQUEST,
        actions.GET_LEAD_LOST_DRILLDOWN_SUCCESS,
        actions.GET_LEAD_LOST_DRILLDOWN_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.REPORTS.LEAD_LOST_DRILLDOWN, { params }),
    },
  }),
  getSourcesCalls: (params: GetReport): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_SOURCES_CALLS_REQUEST,
        actions.GET_SOURCES_CALLS_SUCCESS,
        actions.GET_SOURCES_CALLS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.REPORTS.SOURCES_CALLS, { params }),
    },
  }),
};
