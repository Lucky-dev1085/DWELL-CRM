import { actions } from 'dwell/constants';
import { PortfolioState, PortfolioActionTypes } from 'src/interfaces';

const initialState: PortfolioState = {
  isSubmitting: false,
  errorMessage: null,
  portfolios: [],
};

const actionMap = {
  [actions.GET_PORTFOLIO_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_PORTFOLIO_SUCCESS]: (state, { result: { data: { results } } }) => ({ ...state, isSubmitting: false, portfolios: results }),
  [actions.GET_PORTFOLIO_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),
};

export default (state = initialState, action: PortfolioActionTypes): PortfolioState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
