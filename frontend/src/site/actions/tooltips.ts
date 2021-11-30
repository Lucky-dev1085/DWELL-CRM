import { actions, paths } from 'site/constants';
import { ActionType } from 'src/interfaces';

interface TooltipData {
  sectionString: string,
  selectorString: string,
  valueString: string
}

export default {
  getTooltipItems: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_TOOLTIP_ITEMS_REQUEST,
        actions.GET_TOOLTIP_ITEMS_SUCCESS,
        actions.GET_TOOLTIP_ITEMS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.TOOLTIP_ITEMS),
    },
  }),

  updateTooltipItem: (data: TooltipData): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.TOOLTIP_ITEM_UPDATE_REQUEST,
        actions.TOOLTIP_ITEM_UPDATE_SUCCESS,
        actions.TOOLTIP_ITEM_UPDATE_FAILURE,
      ],
      promise: client => client.put(paths.api.v1.TOOLTIP_ITEMS, data),
    },
  }),
};
