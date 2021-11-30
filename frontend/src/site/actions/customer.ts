import { actions, paths } from 'site/constants';
import { CustomerProps, CallBackFunction, ActionType, ManageRequestProps, PropertyProps, ClientProps } from 'src/interfaces';

interface OnboardData {
  customer: CustomerProps,
  user: { ids: number[] },
  property: PropertyProps,
  client: ClientProps
}

export default {
  getCustomers: (params: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CUSTOMERS_REQUEST,
        actions.GET_CUSTOMERS_SUCCESS,
        actions.GET_CUSTOMERS_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.CUSTOMERS, params)),
    },
  }),

  createCustomer: (customer: CustomerProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_CUSTOMER_REQUEST,
        actions.CREATE_CUSTOMER_SUCCESS,
        actions.CREATE_CUSTOMER_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.CUSTOMERS, customer),
    },
  }),

  deleteCustomer: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.DELETE_CUSTOMER_REQUEST,
        actions.DELETE_CUSTOMER_SUCCESS,
        actions.DELETE_CUSTOMER_FAILURE,
      ],
      promise: client => client.delete(paths.build(paths.api.v1.CUSTOMERS_ID, id)),
    },
  }),

  getCustomerDetails: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CUSTOMER_DETAILS_GET_REQUEST,
        actions.CUSTOMER_DETAILS_GET_SUCCESS,
        actions.CUSTOMER_DETAILS_GET_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.CUSTOMER_DETAILS, id)),
    },
  }),

  updateCustomer: (id: number, customer: CustomerProps, successCB: CallBackFunction = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_CUSTOMER_REQUEST,
        actions.UPDATE_CUSTOMER_SUCCESS,
        actions.UPDATE_CUSTOMER_FAILURE,
      ],
      promise: client => client.put(paths.build(paths.api.v1.CUSTOMERS_ID, id), customer),
      successCB,
    },
  }),

  updateCustomerLogo: (id: number, customer: CustomerProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CUSTOMER_LOGO_UPDATE_REQUEST,
        actions.CUSTOMER_LOGO_UPDATE_SUCCESS,
        actions.CUSTOMER_LOGO_UPDATE_FAILURE,
      ],
      promise: client => client.patch(paths.build(paths.api.v1.CUSTOMERS_ID, id), customer),
    },
  }),

  onboard: (data: OnboardData): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.ONBOARD_REQUEST,
        actions.ONBOARD_SUCCESS,
        actions.ONBOARD_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.CUSTOMER_ONBOARD, data),
    },
  }),
};
