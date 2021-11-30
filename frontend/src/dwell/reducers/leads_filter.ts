import { actions } from 'dwell/constants';
import { LeadFilterState, LeadFilterActionTypes } from 'src/interfaces';

const initialState: LeadFilterState = {
  isSubmitting: false,
  errorMessage: null,
  leadsFilters: [],
  leadsFilter: {} as { id: number | string, name: string },
  activeFilter: '',
};

const actionMap = {
  [actions.GET_LEADS_FILTER_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_LEADS_FILTER_SUCCESS]: (state, { result: { data: { results } } }) => ({ ...state, isSubmitting: false, leadsFilters: results }),
  [actions.GET_LEADS_FILTER_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.CREATE_LEADS_FILTER_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_LEADS_FILTER_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, leadsFilter: data }),
  [actions.CREATE_LEADS_FILTER_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_LEADS_FILTER_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_LEADS_FILTER_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, leadsFilter: data }),
  [actions.UPDATE_LEADS_FILTER_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.PUSHER_CREATE_RECORD]: (state, { row }) => ({ ...state,
    leadsFilters: state.leadsFilters.filter(leadsFilter => leadsFilter.id !== row.id).concat(row) }),
  [actions.PUSHER_UPDATE_RECORD]: (state, { row }) => ({ ...state,
    leadsFilters: state.leadsFilters.filter(leadsFilter => leadsFilter.id !== row.id).concat(row),
    leadsFilter: state.leadsFilter.id === row.id ? row : state.leadsFilter,
  }),
  [actions.PUSHER_DELETE_RECORD]: (state, { row }) => ({ ...state,
    leadsFilters: state.leadsFilters.filter(leadsFilter => leadsFilter.id.toString() !== row.id.toString()) }),

  [actions.GET_ACTIVE_FILTER_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_ACTIVE_FILTER_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, activeFilter: data }),
  [actions.GET_ACTIVE_FILTER_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.SET_ACTIVE_FILTER_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.SET_ACTIVE_FILTER_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, activeFilter: data }),
  [actions.SET_ACTIVE_FILTER_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

};

export default (state = initialState, action: LeadFilterActionTypes): LeadFilterState => {
  if (actionMap[action.type]) {
    if (action.type.includes('PUSHER_') && action.pusherModel !== 'leadsfilter') {
      return state;
    }
    return actionMap[action.type](state, action);
  }

  return state;
};
