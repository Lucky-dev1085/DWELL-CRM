import { actions } from 'site/constants';
import { TooltipState, TooltipActionTypes } from 'src/interfaces';

const initialState: TooltipState = {
  isSubmitting: false,
  isTooltipItemsLoaded: false,
  tooltipItems: [],
};

const actionMap = {
  [actions.GET_TOOLTIP_ITEMS_REQUEST]: state => ({ ...state, isTooltipItemsLoaded: false }),
  [actions.GET_TOOLTIP_ITEMS_SUCCESS]: (state, { result }) => ({ ...state, isTooltipItemsLoaded: true, tooltipItems: result.data }),
  [actions.GET_TOOLTIP_ITEMS_FAILURE]: state => ({ ...state, isTooltipItemsLoaded: false }),

  [actions.TOOLTIP_ITEM_UPDATE_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.TOOLTIP_ITEM_UPDATE_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.TOOLTIP_ITEM_UPDATE_FAILURE]: state => ({ ...state, isSubmitting: false }),
};

export default (state = initialState, action: TooltipActionTypes): TooltipState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
