import { actions } from 'dwell/constants';
import { MarketingReportsProps, Report, ReportState, ReportActionTypes } from 'src/interfaces';
import axios from 'axios';

const initialState: ReportState = {
  isSubmitting: false,
  isLoaded: true,
  errorMessage: null,
  overviewReports: {} as Report,
  marketingReports: {} as MarketingReportsProps,
  operationsReports: {} as Report,
  sitesReports: {
    // site_visitor_report: {
    //   prior_period_visitors: 0,
    //   visitors: 24.1,
    //   pageviews: 24.1,
    //   new_visitors: 12.3,
    //   pages_session: 12.3,
    //   sessions_per_visitor: 18.4,
    //   avg_session_duration: 18.4,
    //   sessions: 9.7,
    //   bounce_rate: 9.7,
    // },
    // conversion_report: {
    //   leads: 0,
    //   conversion_rate: 0,
    //   tours: 0,
    //   leases: 0,
    // },
    // demographics_report: {
    //   male: 389,
    //   female: 426,
    // },
    // devices_report: {
    //   desktop: 69.8,
    //   mobile: 28.2,
    //   tablet: 2,
    // },
    // acquisition_channels_report: {
    //   direct: 10,
    //   paid_search: 10,
    //   display: 20,
    //   affiliates: 15,
    //   other: 20,
    //   organic_search: 15,
    //   referral: 10,
    // },
    // seo_score_report: {
    //   performance: 0,
    //   accesibility: 0,
    //   best_practices: 0,
    //   seo: 0,
    // },
    // chart_values: {
    //   prospect_calls: [],
    //   average_call_score: [],
    //   average_call_time: [],
    //   prior_period_visitors: [
    //     { value: 120, label: '2021-11-07' },
    //     { value: 60, label: '2021-11-08' },
    //     { value: 40, label: '2021-11-09' },
    //     { value: 60, label: '2021-11-10' },
    //     { value: 80, label: '2021-11-11' },
    //   ],
    //   visitors: [
    //     { value: 5, label: '2021-11-07' },
    //     { value: 15, label: '2021-11-08' },
    //     { value: 20, label: '2021-11-09' },
    //     { value: 10, label: '2021-11-10' },
    //     { value: 5, label: '2021-11-11' },
    //   ],
    //   pageviews: [
    //     { value: 40, label: '2021-11-07' },
    //     { value: 45, label: '2021-11-08' },
    //     { value: 50, label: '2021-11-09' },
    //     { value: 70, label: '2021-11-10' },
    //     { value: 40, label: '2021-11-11' },
    //   ],
    //   new_visitors: [
    //     { value: 85, label: '2021-11-07' },
    //     { value: 130, label: '2021-11-08' },
    //     { value: 80, label: '2021-11-09' },
    //     { value: 100, label: '2021-11-10' },
    //     { value: 92, label: '2021-11-11' },
    //   ],
    //   pages_session: [
    //     { value: 20, label: '2021-11-07' },
    //     { value: 25, label: '2021-11-08' },
    //     { value: 10, label: '2021-11-09' },
    //     { value: 15, label: '2021-11-10' },
    //     { value: 25, label: '2021-11-11' },
    //   ],
    //   sessions_per_visitor: [
    //     { value: 30, label: '2021-11-07' },
    //     { value: 20, label: '2021-11-08' },
    //     { value: 30, label: '2021-11-09' },
    //     { value: 20, label: '2021-11-10' },
    //     { value: 13, label: '2021-11-11' },
    //   ],
    //   avg_session_duration: [
    //     { value: 5, label: '2021-11-07' },
    //     { value: 17, label: '2021-11-08' },
    //     { value: 15, label: '2021-11-09' },
    //     { value: 18, label: '2021-11-10' },
    //     { value: 10, label: '2021-11-11' },
    //   ],
    //   sessions: [
    //     { value: 10, label: '2021-11-07' },
    //     { value: 18, label: '2021-11-08' },
    //     { value: 5, label: '2021-11-09' },
    //     { value: 10, label: '2021-11-10' },
    //     { value: 20, label: '2021-11-11' },
    //   ],
    //   bounce_rate: [
    //     { value: 22, label: '2021-11-07' },
    //     { value: 25, label: '2021-11-08' },
    //     { value: 30, label: '2021-11-09' },
    //     { value: 20, label: '2021-11-10' },
    //     { value: 22, label: '2021-11-11' },
    //   ],
    //   prior_period_leads: [
    //     { value: 120, label: '2021-11-07' },
    //     { value: 60, label: '2021-11-08' },
    //     { value: 40, label: '2021-11-09' },
    //     { value: 60, label: '2021-11-10' },
    //     { value: 80, label: '2021-11-11' },
    //   ],
    //   leads: [
    //     { value: 5, label: '2021-11-07' },
    //     { value: 15, label: '2021-11-08' },
    //     { value: 20, label: '2021-11-09' },
    //     { value: 10, label: '2021-11-10' },
    //     { value: 5, label: '2021-11-11' },
    //   ],
    //   conversion_rate: [
    //     { value: 40, label: '2021-11-07' },
    //     { value: 45, label: '2021-11-08' },
    //     { value: 50, label: '2021-11-09' },
    //     { value: 70, label: '2021-11-10' },
    //     { value: 40, label: '2021-11-11' },
    //   ],
    //   tours: [
    //     { value: 85, label: '2021-11-07' },
    //     { value: 130, label: '2021-11-08' },
    //     { value: 80, label: '2021-11-09' },
    //     { value: 100, label: '2021-11-10' },
    //     { value: 92, label: '2021-11-11' },
    //   ],
    //   leases: [
    //     { value: 20, label: '2021-11-07' },
    //     { value: 25, label: '2021-11-08' },
    //     { value: 10, label: '2021-11-09' },
    //     { value: 15, label: '2021-11-10' },
    //     { value: 25, label: '2021-11-11' },
    //   ],
    //   male: [
    //     { value: 50, label: '18-24' },
    //     { value: 25, label: '25-34' },
    //     { value: 10, label: '35-44' },
    //     { value: 15, label: '45-54' },
    //     { value: 20, label: '55-64' },
    //     { value: 30, label: '65+' },
    //   ],
    //   female: [
    //     { value: 40, label: '18-24' },
    //     { value: 20, label: '25-34' },
    //     { value: 5, label: '35-44' },
    //     { value: 10, label: '45-54' },
    //     { value: 15, label: '55-64' },
    //     { value: 25, label: '65+' },
    //   ],
    //   prior_period_performance: [
    //     { value: 120, label: '2021-11-07' },
    //     { value: 60, label: '2021-11-08' },
    //     { value: 40, label: '2021-11-09' },
    //     { value: 60, label: '2021-11-10' },
    //     { value: 80, label: '2021-11-11' },
    //   ],
    //   performance: [
    //     { value: 40, label: '2021-11-07' },
    //     { value: 45, label: '2021-11-08' },
    //     { value: 50, label: '2021-11-09' },
    //     { value: 70, label: '2021-11-10' },
    //     { value: 40, label: '2021-11-11' },
    //   ],
    //   accesibility: [
    //     { value: 5, label: '2021-11-07' },
    //     { value: 15, label: '2021-11-08' },
    //     { value: 20, label: '2021-11-09' },
    //     { value: 10, label: '2021-11-10' },
    //     { value: 5, label: '2021-11-11' },
    //   ],
    //   best_practices: [
    //     { value: 22, label: '2021-11-07' },
    //     { value: 25, label: '2021-11-08' },
    //     { value: 30, label: '2021-11-09' },
    //     { value: 20, label: '2021-11-10' },
    //     { value: 22, label: '2021-11-11' },
    //   ],
    //   seo: [
    //     { value: 85, label: '2021-11-07' },
    //     { value: 130, label: '2021-11-08' },
    //     { value: 80, label: '2021-11-09' },
    //     { value: 100, label: '2021-11-10' },
    //     { value: 92, label: '2021-11-11' },
    //   ],
    // },
    // tbl_values: {
    //   source_mediums: ['(direct) (none)', 'google / cpc', 'dfa / cpm', 'Partners / affiliate', 'google organic', 'optimize.google...', 'analytics.google...', 'tagassistant.google...'],
    //   acquisitions: [
    //     { sessions: '70.9K', visitors: '55.9K', new_visitors: '51.2K' },
    //     { sessions: '69,179', visitors: '54,522', new_visitors: '50,113' },
    //     { sessions: '769', visitors: '683', new_visitors: '620' },
    //     { sessions: '503', visitors: '387', new_visitors: '384' },
    //     { sessions: '250', visitors: '163', new_visitors: '142' },
    //     { sessions: '13', visitors: '4', new_visitors: '2' },
    //     { sessions: '2', visitors: '1', new_visitors: '0' },
    //     { sessions: '1', visitors: '2', new_visitors: '1' },
    //     { sessions: '1', visitors: '1', new_visitors: '1' },
    //   ],
    //   behaviors: [
    //     { bounce_rate: '49.2%', pages_session: '4.8', avg_session_duration: '03:10' },
    //     { bounce_rate: '48.57%', pages_session: '4.84', avg_session_duration: '00:03:13' },
    //     { bounce_rate: '73.08%', pages_session: '2.54', avg_session_duration: '00:00:58' },
    //     { bounce_rate: '92.84%', pages_session: '1.58', avg_session_duration: '00:00:10' },
    //     { bounce_rate: '71.2%', pages_session: '2.28', avg_session_duration: '00:02:27' },
    //     { bounce_rate: '23.08%', pages_session: '14.08', avg_session_duration: '00:14:29' },
    //     { bounce_rate: '0%', pages_session: '13', avg_session_duration: '00:44:32' },
    //     { bounce_rate: '20.10%', pages_session: '0.04', avg_session_duration: '00:01:01' },
    //     { bounce_rate: '0.08%', pages_session: '1.5', avg_session_duration: '00:00:12' },
    //   ],
    //   conversions: [
    //     { leads_per: '21.0%', leads_sharp: '14.9K', tours_per: '21.0%', tours_sharp: '14.9K', leases_per: '21.0%', leases_sharp: '14.9K' },
    //     { leads_per: '21.39%', leads_sharp: '14,800K', tours_per: '21.39%', tours_sharp: '14,800', leases_per: '21.39%', leases_sharp: '14,800' },
    //     { leads_per: '6.24%', leads_sharp: '48', tours_per: '6.24%', tours_sharp: '48', leases_per: '6.24%', leases_sharp: '48' },
    //     { leads_per: '0.2%', leads_sharp: '1', tours_per: '1.3%', tours_sharp: '4', leases_per: '0.5%', leases_sharp: '2' },
    //     { leads_per: '6%', leads_sharp: '15', tours_per: '5.2%', tours_sharp: '8', leases_per: '7.4%', leases_sharp: '18' },
    //     { leads_per: '46.15%', leads_sharp: '48', tours_per: '5.5%', tours_sharp: '29', leases_per: '8.2%', leases_sharp: '30' },
    //     { leads_per: '50%', leads_sharp: '2', tours_per: '38%', tours_sharp: '1', leases_per: '0%', leases_sharp: '0' },
    //     { leads_per: '1.25%', leads_sharp: '5', tours_per: '1.05%', tours_sharp: '4', leases_per: '1.01%', leases_sharp: '2' },
    //     { leads_per: '3.24%', leads_sharp: '1', tours_per: '2.1%', tours_sharp: '0', leases_per: '1.05%', leases_sharp: '0' },
    //   ],
    // },
  } as Report,
  leadSourceDrilldown: {},
  leadLostDrilldown: [],
  isLoadedDrilldown: true,
  startDate: '',
  endDate: '',
  sourcesCalls: [],
  isSourcesCallsLoaded: true,
};

const actionMap = {
  [actions.GET_OVERVIEW_REPORTS_REQUEST]: state => ({ ...state, isSubmitting: true, isLoaded: false, overviewReports: {} }),
  [actions.GET_OVERVIEW_REPORTS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, overviewReports: data.results, startDate: data.start_date, endDate: data.end_date, isLoaded: true }),
  [actions.GET_OVERVIEW_REPORTS_FAILURE]: (state, { error }) => ({ ...state, errorMessage: axios.isCancel(error) ? error.messsage : error.response.status, isSubmitting: false, isLoaded: true }),

  [actions.GET_MARKETING_REPORTS_REQUEST]: state => ({ ...state, isSubmitting: true, isLoaded: false, marketingReports: {} }),
  [actions.GET_MARKETING_REPORTS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, marketingReports: data.results, startDate: data.start_date, endDate: data.end_date, isLoaded: true }),
  [actions.GET_MARKETING_REPORTS_FAILURE]: (state, { error }) => ({ ...state, errorMessage: axios.isCancel(error) ? error.messsage : error.response.status, isSubmitting: false, isLoaded: true }),

  [actions.GET_OPERATIONS_REPORTS_REQUEST]: state => ({ ...state, isSubmitting: true, isLoaded: false, operationsReports: {} }),
  [actions.GET_OPERATIONS_REPORTS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, operationsReports: data.results, startDate: data.start_date, endDate: data.end_date, isLoaded: true }),
  [actions.GET_OPERATIONS_REPORTS_FAILURE]: (state, { error }) => ({ ...state, errorMessage: axios.isCancel(error) ? error.messsage : error.response.status, isSubmitting: false, isLoaded: true }),

  [actions.GET_SITES_REPORTS_REQUEST]: state => ({ ...state, isSubmitting: true, isLoaded: false, sitesReports: {} }),
  [actions.GET_SITES_REPORTS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, sitesReports: data.results, startDate: data.start_date, endDate: data.end_date, isLoaded: true }),
  [actions.GET_SITES_REPORTS_FAILURE]: (state, { error }) => ({ ...state, errorMessage: axios.isCancel(error) ? error.messsage : error.response.status, isSubmitting: false, isLoaded: true }),

  [actions.REQUIRE_RESCORE_CALL_SUCCESS]: (state, { result: { data } }) => ({
    ...state,
    overviewReports: {
      ...state.overviewReports,
      calls_report: data.calls_report,
      chart_values: {
        ...state.overviewReports.chart_values,
        average_call_score: data.chart_values,
      },
    },
  }),

  [actions.CLEAR_REPORTS]: () => ({ ...initialState }),

  [actions.GET_LEAD_SOURCE_DRILLDOWN_REQUEST]: state => ({ ...state, isSubmitting: true, isLoadedDrilldown: false, leadSourceDrilldown: {} }),
  [actions.GET_LEAD_SOURCE_DRILLDOWN_SUCCESS]: (state, { result: { data } }) => ({
    ...state,
    isSubmitting: false,
    leadSourceDrilldown: data.results,
    isLoadedDrilldown: true,
  }),
  [actions.GET_LEAD_SOURCE_DRILLDOWN_FAILURE]: (state, { error }) => ({ ...state, errorMessage: axios.isCancel(error) ? error.messsage : error.response.status, isSubmitting: false, isLoadedDrilldown: true }),

  [actions.GET_LEAD_LOST_DRILLDOWN_REQUEST]: state => ({ ...state, isSubmitting: true, isLoadedDrilldown: false, leadLostDrilldown: [] }),
  [actions.GET_LEAD_LOST_DRILLDOWN_SUCCESS]: (state, { result: { data } }) => ({
    ...state,
    isSubmitting: false,
    leadLostDrilldown: data.results,
    isLoadedDrilldown: true,
  }),
  [actions.GET_LEAD_LOST_DRILLDOWN_FAILURE]: (state, { error }) => ({ ...state, errorMessage: axios.isCancel(error) ? error.messsage : error.response.status, isSubmitting: false, isLoadedDrilldown: true }),

  [actions.GET_SOURCES_CALLS_REQUEST]: state => ({ ...state, isSubmitting: true, isSourcesCallsLoaded: false, sourcesCalls: [] }),
  [actions.GET_SOURCES_CALLS_SUCCESS]: (state, { result: { data } }) => ({
    ...state,
    isSubmitting: false,
    sourcesCalls: data.results,
    isSourcesCallsLoaded: true,
  }),
  [actions.GET_SOURCES_CALLS_FAILURE]: (state, { error }) => ({ ...state, errorMessage: axios.isCancel(error) ? error.messsage : error.response.status, isSubmitting: false, isSourcesCallsLoaded: true }),

};

export default (state = initialState, action: ReportActionTypes): ReportState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
