import { actions } from 'site/constants';
import { CustomerState, CustomerActionTypes } from 'src/interfaces';

const initialState: CustomerState = {
  isSubmitting: false,
  customer: {},
  customerDetails: {},
  isCustomerLoaded: false,
  isCustomersLoaded: false,
  customers: [],
};

const actionMap = {
  [actions.UPDATE_CUSTOMER_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_CUSTOMER_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.UPDATE_CUSTOMER_FAILURE]: state => ({ ...state, isSubmitting: false }),

  [actions.DELETE_CUSTOMER_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.DELETE_CUSTOMER_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.DELETE_CUSTOMER_FAILURE]: state => ({ ...state, isSubmitting: false }),

  [actions.GET_CUSTOMERS_REQUEST]: state => ({ ...state, isSubmitting: true, isCustomersLoaded: false }),
  [actions.GET_CUSTOMERS_SUCCESS]: (state, { result }) => ({ ...state, isSubmitting: false, isCustomersLoaded: true, customers: result.data.results }),
  [actions.GET_CUSTOMERS_FAILURE]: state => ({ ...state, isSubmitting: false, isCustomersLoaded: false }),

  [actions.CREATE_CUSTOMER_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_CUSTOMER_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.CREATE_CUSTOMER_FAILURE]: state => ({ ...state, isSubmitting: false }),

  [actions.CUSTOMER_DETAILS_GET_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CUSTOMER_DETAILS_GET_SUCCESS]: (state, { result }) => ({ ...state, isSubmitting: false, customerDetails: result.data }),
  [actions.CUSTOMER_DETAILS_GET_FAILURE]: state => ({ ...state, isSubmitting: false }),
};

export default (state = initialState, action: CustomerActionTypes): CustomerState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
