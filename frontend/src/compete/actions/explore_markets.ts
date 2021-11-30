import { actions, paths } from 'compete/constants';
import { ActionType, ManageRequestProps } from 'src/interfaces';

export default {
  getExploreMarketsList: (params?: ManageRequestProps, token = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_EXPLORE_MARKETS_REQUEST,
        actions.GET_EXPLORE_MARKETS_SUCCESS,
        actions.GET_EXPLORE_MARKETS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.EXPLORE_MARKETS, { params, cancelToken: token }),
    },
  }),
};
