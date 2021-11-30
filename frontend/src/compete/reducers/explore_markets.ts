import { actions } from 'compete/constants';
import { ExploreMarketsActionTypes, ExploreMarketsState } from 'src/interfaces';

const initialState: ExploreMarketsState = {
  isExploreMarketsLoaded: false,
  exploreMarketsList: null,
};

const actionMap = {
  [actions.GET_EXPLORE_MARKETS_REQUEST]: state => ({ ...state, isExploreMarketsLoaded: false }),
  [actions.GET_EXPLORE_MARKETS_SUCCESS]: (state, { result }) => ({ ...state, isExploreMarketsLoaded: true, exploreMarketsList: result.data }),
  [actions.GET_EXPLORE_MARKETS_FAILURE]: state => ({ ...state, isExploreMarketsLoaded: false }),
};

export default (state = initialState, action: ExploreMarketsActionTypes): ExploreMarketsState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
