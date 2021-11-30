import { actions } from 'site/constants';
import { actions as actionsDwell } from 'dwell/constants';
import { CompanyPolicyProps, HobbesState, HobbesActionTypes } from 'src/interfaces';

const initialState: HobbesState = {
  isSubmitting: false,
  errorMessage: null,
  companyPolicy: {} as CompanyPolicyProps,
  isCategoryLoaded: false,
  amenityCategories: [],
};

const actionMap = {
  [actions.SAVE_COMPANY_POLICIES_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.SAVE_COMPANY_POLICIES_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, companyPolicy: data }),
  [actions.SAVE_COMPANY_POLICIES_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.GET_AMENITY_CATEGORY_REQUEST]: state => ({ ...state, isCategoryLoaded: false }),
  [actions.GET_AMENITY_CATEGORY_SUCCESS]: (state, { result: { data } }) => ({ ...state, isCategoryLoaded: true, amenityCategories: data }),
  [actions.GET_AMENITY_CATEGORY_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isCategoryLoaded: false }),

  [actionsDwell.GET_CURRENT_PROPERTY_SUCCESS]: (state, { result: { data: { company_polices: companyPolicy } } }) => ({ ...state, companyPolicy }),
};

export default (state = initialState, action: HobbesActionTypes): HobbesState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
