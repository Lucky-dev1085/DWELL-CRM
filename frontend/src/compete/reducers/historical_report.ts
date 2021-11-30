import { actions, prepareLastDate } from 'compete/constants';
import { HistoricalReportState, HistoricalReportActionTypes } from 'src/interfaces';

const initialState: HistoricalReportState = {
  errorMessage: null,
  isHistoricalPropertyRentLoaded: false,
  historicalPropertyRent: null,
  isHistoricalPropertyOccupancyLoaded: false,
  historicalPropertyOccupancy: null,
  isPropertyConcessionLoaded: false,
  propertyConcession: null,
  isSubmarketRentLoaded: false,
  submarketRent: null,
  isSubmarketOccupancyLoaded: false,
  submarketOccupancy: null,
  isSubmarketConcessionLoaded: false,
  submarketConcession: null,
  isMarketRentLoaded: false,
  marketRent: null,
  isMarketOccupancyLoaded: false,
  marketOccupancy: null,
  isMarketConcessionLoaded: false,
  marketConcession: null,
  isRentCompareLoaded: false,
  rentCompare: null,
};

const actionMap = {
  [actions.GET_HISTORICAL_PROPERTY_RENT_REQUEST]: state => ({ ...state, isHistoricalPropertyRentLoaded: false }),
  [actions.GET_HISTORICAL_PROPERTY_RENT_SUCCESS]: (state, { result: { data } }) => ({ ...state, historicalPropertyRent: prepareLastDate(data), isHistoricalPropertyRentLoaded: true }),
  [actions.GET_HISTORICAL_PROPERTY_RENT_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isHistoricalPropertyRentLoaded: false }),

  [actions.GET_HISTORICAL_PROPERTY_OCCUPANCY_REQUEST]: state => ({ ...state, isHistoricalPropertyOccupancyLoaded: false }),
  [actions.GET_HISTORICAL_PROPERTY_OCCUPANCY_SUCCESS]: (state, { result: { data } }) => ({ ...state, historicalPropertyOccupancy: prepareLastDate(data), isHistoricalPropertyOccupancyLoaded: true }),
  [actions.GET_HISTORICAL_PROPERTY_OCCUPANCY_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isHistoricalPropertyOccupancyLoaded: false }),

  [actions.GET_HISTORICAL_PROPERTY_CONCESSION_REQUEST]: state => ({ ...state, isPropertyConcessionLoaded: false }),
  [actions.GET_HISTORICAL_PROPERTY_CONCESSION_SUCCESS]: (state, { result: { data } }) => ({ ...state, propertyConcession: prepareLastDate(data), isPropertyConcessionLoaded: true }),
  [actions.GET_HISTORICAL_PROPERTY_CONCESSION_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isPropertyConcessionLoaded: false }),

  [actions.GET_HISTORICAL_SUBMARKET_RENT_REQUEST]: state => ({ ...state, isSubmarketRentLoaded: false }),
  [actions.GET_HISTORICAL_SUBMARKET_RENT_SUCCESS]: (state, { result: { data } }) => ({ ...state, submarketRent: prepareLastDate(data), isSubmarketRentLoaded: true }),
  [actions.GET_HISTORICAL_SUBMARKET_RENT_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmarketRentLoaded: false }),

  [actions.GET_HISTORICAL_SUBMARKET_OCCUPANCY_REQUEST]: state => ({ ...state, isSubmarketOccupancyLoaded: false }),
  [actions.GET_HISTORICAL_SUBMARKET_OCCUPANCY_SUCCESS]: (state, { result: { data } }) => ({ ...state, submarketOccupancy: prepareLastDate(data), isSubmarketOccupancyLoaded: true }),
  [actions.GET_HISTORICAL_SUBMARKET_OCCUPANCY_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmarketOccupancyLoaded: false }),

  [actions.GET_HISTORICAL_SUBMARKET_CONCESSION_REQUEST]: state => ({ ...state, isSubmarketConcessionLoaded: false }),
  [actions.GET_HISTORICAL_SUBMARKET_CONCESSION_SUCCESS]: (state, { result: { data } }) => ({ ...state, submarketConcession: prepareLastDate(data), isSubmarketConcessionLoaded: true }),
  [actions.GET_HISTORICAL_SUBMARKET_CONCESSION_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmarketConcessionLoaded: false }),

  [actions.GET_HISTORICAL_MARKET_RENT_REQUEST]: state => ({ ...state, isMarketRentLoaded: false }),
  [actions.GET_HISTORICAL_MARKET_RENT_SUCCESS]: (state, { result: { data } }) => ({ ...state, marketRent: prepareLastDate(data), isMarketRentLoaded: true }),
  [actions.GET_HISTORICAL_MARKET_RENT_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isMarketRentLoaded: false }),

  [actions.GET_HISTORICAL_MARKET_OCCUPANCY_REQUEST]: state => ({ ...state, isMarketOccupancyLoaded: false }),
  [actions.GET_HISTORICAL_MARKET_OCCUPANCY_SUCCESS]: (state, { result: { data } }) => ({ ...state, marketOccupancy: prepareLastDate(data), isMarketOccupancyLoaded: true }),
  [actions.GET_HISTORICAL_MARKET_OCCUPANCY_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isMarketOccupancyLoaded: false }),

  [actions.GET_HISTORICAL_MARKET_CONCESSION_REQUEST]: state => ({ ...state, isMarketConcessionLoaded: false }),
  [actions.GET_HISTORICAL_MARKET_CONCESSION_SUCCESS]: (state, { result: { data } }) => ({ ...state, marketConcession: prepareLastDate(data), isMarketConcessionLoaded: true }),
  [actions.GET_HISTORICAL_MARKET_CONCESSION_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isMarketConcessionLoaded: false }),

  [actions.GET_HISTORICAL_UNDER_OVER_RENT_REQUEST]: state => ({ ...state, isRentCompareLoaded: false }),
  [actions.GET_HISTORICAL_UNDER_OVER_RENT_SUCCESS]: (state, { result: { data } }) => ({ ...state, rentCompare: prepareLastDate(data), isRentCompareLoaded: true }),
  [actions.GET_HISTORICAL_UNDER_OVER_RENT_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isRentCompareLoaded: false }),
};

export default (state = initialState, action: HistoricalReportActionTypes): HistoricalReportState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
