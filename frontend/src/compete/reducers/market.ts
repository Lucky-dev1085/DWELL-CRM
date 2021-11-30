import { actions } from 'compete/constants';
import { MarketState, MarketActionTypes } from 'src/interfaces';

const initialState: MarketState = {
  isSubmitting: false,
  errorMessage: null,
  isMarketDetailLoaded: false,
  isMarketPropertiesLoaded: false,
  isRentCompsLoaded: false,
  isMarketSubmarketsLoaded: false,
  isMTRBreakdownLoaded: false,
  countMarketProperties: 0,
  countRentComps: 0,
  marketDetail: null,
  marketProperties: null,
  rentComps: null,
  marketSubmarkets: null,
  marketSubmarketsCount: 0,
  mtrGroupBreakdown: null,
  mtrGroupBreakdownCount: 0,
};

const actionMap = {
  [actions.GET_MARKET_DETAIL_REQUEST]: state => ({ ...state, isMarketDetailLoaded: false }),
  [actions.GET_MARKET_DETAIL_SUCCESS]: (state, { result: { data } }) => ({ ...state, marketDetail: data, isMarketDetailLoaded: true }),
  [actions.GET_MARKET_DETAIL_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isMarketDetailLoaded: false }),

  [actions.GET_MARKET_PROPERTIES_REQUEST]: state => ({ ...state, isMarketPropertiesLoaded: false }),
  [actions.GET_MARKET_PROPERTIES_SUCCESS]: (state, { result: { data: { results, count } } }) => ({ ...state, marketProperties: results, isMarketPropertiesLoaded: true, countMarketProperties: count }),
  [actions.GET_MARKET_PROPERTIES_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isMarketPropertiesLoaded: false }),

  [actions.GET_MARKET_RENT_COMPS_REQUEST]: state => ({ ...state, isRentCompsLoaded: false }),
  [actions.GET_MARKET_RENT_COMPS_SUCCESS]: (state, { result: { data: { results, count } } }) => ({ ...state, rentComps: results, isRentCompsLoaded: true, countRentComps: count }),
  [actions.GET_MARKET_RENT_COMPS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isRentCompsLoaded: false }),

  [actions.GET_MARKET_SUBMARKETS_REQUEST]: state => ({ ...state, isMarketSubmarketsLoaded: false }),
  [actions.GET_MARKET_SUBMARKETS_SUCCESS]: (state, { result: { data: { results, count } } }) => ({ ...state, marketSubmarkets: results, isMarketSubmarketsLoaded: true, marketSubmarketsCount: count }),
  [actions.GET_MARKET_SUBMARKETS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isMarketSubmarketsLoaded: false }),

  [actions.GET_MTR_GROUP_BREAKDOWN_REQUEST]: state => ({ ...state, isMTRBreakdownLoaded: false }),
  [actions.GET_MTR_GROUP_BREAKDOWN_SUCCESS]: (state, { result: { data: { results, count } } }) => ({ ...state, mtrGroupBreakdown: results, isMTRBreakdownLoaded: true, mtrGroupBreakdownCount: count }),
  [actions.GET_MTR_GROUP_BREAKDOWN_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isMTRBreakdownLoaded: false }),
};

export default (state = initialState, action: MarketActionTypes): MarketState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
