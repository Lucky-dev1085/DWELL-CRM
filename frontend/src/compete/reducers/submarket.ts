import { actions } from 'compete/constants';
import { SubmarketState, SubmarketActionTypes } from 'src/interfaces';

const initialState: SubmarketState = {
  isSubmitting: false,
  errorMessage: null,
  isSubmarketPropertiesLoaded: false,
  isSubmarketDetailLoaded: false,
  isSubmarketBreakdownLoaded: false,
  isRentCompsLoaded: false,
  countSubmarketProperties: 0,
  countRentComps: 0,
  countSubmarketBreakdown: 0,
  submarketProperties: null,
  submarketDetail: null,
  rentComps: null,
  submarketBreakdown: null,
};

const actionMap = {
  [actions.GET_SUBMARKET_PROPERTIES_REQUEST]: state => ({ ...state, isSubmitting: true, isSubmarketPropertiesLoaded: false }),
  [actions.GET_SUBMARKET_PROPERTIES_SUCCESS]: (state, { result: { data: { results, count } } }) => ({ ...state, isSubmitting: false, submarketProperties: results, isSubmarketPropertiesLoaded: true, countSubmarketProperties: count }),
  [actions.GET_SUBMARKET_PROPERTIES_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false, isSubmarketPropertiesLoaded: false }),

  [actions.GET_SUBMARKET_DETAIL_REQUEST]: state => ({ ...state, isSubmarketDetailLoaded: false }),
  [actions.GET_SUBMARKET_DETAIL_SUCCESS]: (state, { result: { data } }) => ({ ...state, submarketDetail: data, isSubmarketDetailLoaded: true }),
  [actions.GET_SUBMARKET_DETAIL_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmarketDetailLoaded: false }),

  [actions.GET_SUBMARKET_RENT_COMPS_REQUEST]: state => ({ ...state, isRentCompsLoaded: false }),
  [actions.GET_SUBMARKET_RENT_COMPS_SUCCESS]: (state, { result: { data: { results, count } } }) => ({ ...state, rentComps: results, isRentCompsLoaded: true, countRentComps: count }),
  [actions.GET_SUBMARKET_RENT_COMPS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isRentCompsLoaded: false }),

  [actions.GET_SUBMARKET_MTR_BREAKDOWN_REQUEST]: state => ({ ...state, isSubmarketBreakdownLoaded: false }),
  [actions.GET_SUBMARKET_MTR_BREAKDOWN_SUCCESS]: (state, { result: { data: { results, count } } }) => ({ ...state, submarketBreakdown: results, isSubmarketBreakdownLoaded: true, countSubmarketBreakdown: count }),
  [actions.GET_SUBMARKET_MTR_BREAKDOWN_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmarketBreakdownLoaded: false }),
};

export default (state = initialState, action: SubmarketActionTypes): SubmarketState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
