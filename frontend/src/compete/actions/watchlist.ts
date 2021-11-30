import { actions, paths, successCallback } from 'compete/constants';
import { ActionType, CallBackFunction, WatchListUpdate } from 'src/interfaces';

export default {
  getWatchlist: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_WATCHLIST_REQUEST,
        actions.GET_WATCHLIST_SUCCESS,
        actions.GET_WATCHLIST_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.WATCHLIST),
    },
  }),

  updateWatchlist: (data: WatchListUpdate, successCB: CallBackFunction = successCallback): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_WATCHLIST_REQUEST,
        actions.UPDATE_WATCHLIST_SUCCESS,
        actions.UPDATE_WATCHLIST_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.WATCHLIST, data),
      successCB,
    },
  }),
};
