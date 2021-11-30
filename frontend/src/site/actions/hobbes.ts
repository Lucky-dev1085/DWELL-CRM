import { actions, paths } from 'site/constants';
import { ActionType, CallBackFunction, CompanyPolicyProps } from 'src/interfaces';

export default {
  saveCompanyPolicies: (data: CompanyPolicyProps, successCB: CallBackFunction = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.SAVE_COMPANY_POLICIES_REQUEST,
        actions.SAVE_COMPANY_POLICIES_SUCCESS,
        actions.SAVE_COMPANY_POLICIES_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.COMPANY_POLICIES, data),
      successCB,
    },
  }),

  getAmenityCategories: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_AMENITY_CATEGORY_REQUEST,
        actions.GET_AMENITY_CATEGORY_SUCCESS,
        actions.GET_AMENITY_CATEGORY_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.AMENITY_CATEGORIES),
    },
  }),
};
