import { actions, paths } from 'dwell/constants';
import { ActionType } from 'src/interfaces';

export default {
  getPortfolios: (showAll: boolean): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_PORTFOLIO_REQUEST,
        actions.GET_PORTFOLIO_SUCCESS,
        actions.GET_PORTFOLIO_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.PORTFOLIO, { params: showAll }),
    },
  }),
};
