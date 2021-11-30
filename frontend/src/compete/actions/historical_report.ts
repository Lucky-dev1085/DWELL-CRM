import { actions, paths } from 'compete/constants';
import { ActionType, HistoricalRequestProps } from 'src/interfaces';

export default {
  getHistoricalPropertyRent: (id: number, params?: HistoricalRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_HISTORICAL_PROPERTY_RENT_REQUEST,
        actions.GET_HISTORICAL_PROPERTY_RENT_SUCCESS,
        actions.GET_HISTORICAL_PROPERTY_RENT_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.HISTORICAL_PROPERTY_RENT, id), { params }),
    },
  }),

  getHistoricalPropertyOccupancy: (id: number, params?: HistoricalRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_HISTORICAL_PROPERTY_OCCUPANCY_REQUEST,
        actions.GET_HISTORICAL_PROPERTY_OCCUPANCY_SUCCESS,
        actions.GET_HISTORICAL_PROPERTY_OCCUPANCY_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.HISTORICAL_PROPERTY_OCCUPANCY, id), { params }),
    },
  }),

  getHistoricalPropertyConcession: (id: number, params?: HistoricalRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_HISTORICAL_PROPERTY_CONCESSION_REQUEST,
        actions.GET_HISTORICAL_PROPERTY_CONCESSION_SUCCESS,
        actions.GET_HISTORICAL_PROPERTY_CONCESSION_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.HISTORICAL_PROPERTY_CONCESSION, id), { params }),
    },
  }),

  getHistoricalSubmarketRent: (id: number, params?: HistoricalRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_HISTORICAL_SUBMARKET_RENT_REQUEST,
        actions.GET_HISTORICAL_SUBMARKET_RENT_SUCCESS,
        actions.GET_HISTORICAL_SUBMARKET_RENT_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.HISTORICAL_SUBMARKET_RENT, id), { params }),
    },
  }),

  getHistoricalSubmarketOccupancy: (id: number, params?: HistoricalRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_HISTORICAL_SUBMARKET_OCCUPANCY_REQUEST,
        actions.GET_HISTORICAL_SUBMARKET_OCCUPANCY_SUCCESS,
        actions.GET_HISTORICAL_SUBMARKET_OCCUPANCY_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.HISTORICAL_SUBMARKET_OCCUPANCY, id), { params }),
    },
  }),

  getHistoricalSubmarketConcession: (id: number, params?: HistoricalRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_HISTORICAL_SUBMARKET_CONCESSION_REQUEST,
        actions.GET_HISTORICAL_SUBMARKET_CONCESSION_SUCCESS,
        actions.GET_HISTORICAL_SUBMARKET_CONCESSION_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.HISTORICAL_SUBMARKET_CONCESSION, id), { params }),
    },
  }),

  getHistoricalMarketRent: (id: number, params?: HistoricalRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_HISTORICAL_MARKET_RENT_REQUEST,
        actions.GET_HISTORICAL_MARKET_RENT_SUCCESS,
        actions.GET_HISTORICAL_MARKET_RENT_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.HISTORICAL_MARKET_RENT, id), { params }),
    },
  }),

  getHistoricalMarketOccupancy: (id: number, params?: HistoricalRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_HISTORICAL_MARKET_OCCUPANCY_REQUEST,
        actions.GET_HISTORICAL_MARKET_OCCUPANCY_SUCCESS,
        actions.GET_HISTORICAL_MARKET_OCCUPANCY_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.HISTORICAL_MARKET_OCCUPANCY, id), { params }),
    },
  }),

  getHistoricalMarketConcession: (id: number, params?: HistoricalRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_HISTORICAL_MARKET_CONCESSION_REQUEST,
        actions.GET_HISTORICAL_MARKET_CONCESSION_SUCCESS,
        actions.GET_HISTORICAL_MARKET_CONCESSION_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.HISTORICAL_MARKET_CONCESSION, id), { params }),
    },
  }),

  getHistoricalUnderOverRent: (id: number, params?: HistoricalRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_HISTORICAL_UNDER_OVER_RENT_REQUEST,
        actions.GET_HISTORICAL_UNDER_OVER_RENT_SUCCESS,
        actions.GET_HISTORICAL_UNDER_OVER_RENT_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.HISTORICAL_RENT_COMPARE, id), { params }),
    },
  }),
};
