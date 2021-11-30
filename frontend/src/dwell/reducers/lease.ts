import { actions } from 'dwell/constants';
import { LeaseState, LeaseActionTypes, DurationPricing } from 'src/interfaces';

const initialState: LeaseState = {
  isSubmitting: false,
  errorMessage: null,
  leaseDefault: {} as { approved_security_deposit: string },
  propertyPolicy: {} as { is_cosigners_allowed?: boolean, utilities?: string[]},
  durationPricing: {} as DurationPricing,
  rentableItems: [],
};

const actionMap = {
  [actions.SAVE_LEASE_DEFAULT_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.SAVE_LEASE_DEFAULT_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, leaseDefault: data }),
  [actions.SAVE_LEASE_DEFAULT_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.SAVE_PROPERTY_POLICY_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.SAVE_PROPERTY_POLICY_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, propertyPolicy: data }),
  [actions.SAVE_PROPERTY_POLICY_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.GET_RENTABLE_ITEMS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_RENTABLE_ITEMS_SUCCESS]: (state, { result: { data: { results } } }) => ({ ...state, isSubmitting: false, rentableItems: results }),
  [actions.GET_RENTABLE_ITEMS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.CREATE_RENTABLE_ITEM_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_RENTABLE_ITEM_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, rentableItems: [data].concat(state.rentableItems) }),
  [actions.CREATE_RENTABLE_ITEM_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_RENTABLE_ITEM_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_RENTABLE_ITEM_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, rentableItems: [data].concat(state.rentableItems.filter(i => i.id !== data.id)) }),
  [actions.UPDATE_RENTABLE_ITEM_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.DELETE_RENTABLE_ITEM_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.DELETE_RENTABLE_ITEM_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, rentableItems: state.rentableItems.filter(i => i.id !== data.id) }),
  [actions.DELETE_RENTABLE_ITEM_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.GET_CURRENT_PROPERTY_SUCCESS]: (state, { result: { data:
    { lease_default: leaseDefault, polices: propertyPolicy, rentable_items: rentableItems, duration_pricing: durationPricing } } }) => ({ ...state, leaseDefault, propertyPolicy, rentableItems, durationPricing }),

  [actions.SAVE_DURATION_PRICING_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.SAVE_DURATION_PRICING_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, durationPricing: data }),
  [actions.SAVE_DURATION_PRICING_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),
};

export default (state = initialState, action: LeaseActionTypes): LeaseState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
