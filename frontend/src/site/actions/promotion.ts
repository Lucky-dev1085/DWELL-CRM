import { actions, paths } from 'site/constants';
import { getPropertyId } from 'src/utils';
import { ActionType, PromotionProps } from 'src/interfaces';

export default {
  getPromotions: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_PROMOTIONS_REQUEST,
        actions.GET_PROMOTIONS_SUCCESS,
        actions.GET_PROMOTIONS_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.PROMOTIONS, getPropertyId())),
    },
  }),

  createPromotion: (data: PromotionProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_PROMOTION_REQUEST,
        actions.CREATE_PROMOTION_SUCCESS,
        actions.CREATE_PROMOTION_FAILURE,
      ],
      promise: client => client.post(paths.build(paths.api.v1.PROMOTIONS, getPropertyId()), data),
    },
  }),

  updatePromotion: (id: number, data: PromotionProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_PROMOTION_REQUEST,
        actions.UPDATE_PROMOTION_SUCCESS,
        actions.UPDATE_PROMOTION_FAILURE,
      ],
      promise: client => client.put(paths.build(paths.api.v1.PROMOTION_DETAILS, getPropertyId(), id), data),
    },
  }),

  deletePromotion: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.DELETE_PROMOTION_REQUEST,
        actions.DELETE_PROMOTION_SUCCESS,
        actions.DELETE_PROMOTION_FAILURE,
      ],
      promise: client => client.delete(paths.build(paths.api.v1.PROMOTION_DETAILS, getPropertyId(), id)),
    },
  }),
};
