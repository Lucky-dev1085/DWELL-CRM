import { actions } from 'compete/constants';
import { orderBy } from 'lodash';
import { WatchlistState, WatchlistActionTypes } from 'src/interfaces';

const initialState: WatchlistState = {
  isSubmitting: false,
  errorMessage: null,
  isWatchlistLoaded: false,
  watchlist: null,
};

const actionMap = {
  [actions.GET_WATCHLIST_REQUEST]: state => ({ ...state, isWatchlistLoaded: false }),
  [actions.GET_WATCHLIST_SUCCESS]: (state, { result: { data } }) => {
    const sortedWathlist = {};
    ['markets', 'submarkets', 'properties', 'comparisons'].forEach(key => sortedWathlist[key] = orderBy(data[key] || [], el => (key !== 'comparisons' ? el.name : el.subject_asset_name)));
    return ({ ...state, watchlist: sortedWathlist, isWatchlistLoaded: true });
  },
  [actions.GET_WATCHLIST_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isWatchlistLoaded: false }),

  [actions.UPDATE_WATCHLIST_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_WATCHLIST_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.UPDATE_WATCHLIST_FAILURE]: state => ({ ...state, isSubmitting: false }),
};

export default (state = initialState, action: WatchlistActionTypes): WatchlistState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
