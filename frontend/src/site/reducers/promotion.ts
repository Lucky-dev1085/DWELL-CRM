import { actions } from 'site/constants';
import { PromotionState, PromotionActionTypes } from 'src/interfaces';

const initialState: PromotionState = {
  isSubmitting: false,
  isPromotionsLoaded: false,
  promotions: [],
};

const actionMap = {
  [actions.GET_PROMOTIONS_REQUEST]: state => ({ ...state, isSubmitting: true, isPromotionsLoaded: false }),
  [actions.GET_PROMOTIONS_SUCCESS]: (state, { result }) => ({ ...state, isSubmitting: false, isPromotionsLoaded: true, promotions: result.data.results }),
  [actions.GET_PROMOTIONS_FAILURE]: state => ({ ...state, isSubmitting: false, isPromotionsLoaded: false }),

  [actions.CREATE_PROMOTION_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_PROMOTION_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.CREATE_PROMOTION_FAILURE]: state => ({ ...state, isSubmitting: false }),

  [actions.UPDATE_PROMOTION_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_PROMOTION_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.UPDATE_PROMOTION_FAILURE]: state => ({ ...state, isSubmitting: false }),
};

export default (state = initialState, action: PromotionActionTypes): PromotionState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
