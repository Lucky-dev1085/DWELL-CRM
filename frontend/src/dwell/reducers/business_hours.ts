import { actions } from 'dwell/constants';
import { BusinessHoursState, BusinessHoursActionTypes } from 'src/interfaces';

const initialState: BusinessHoursState = {
  isSubmitting: false,
  errorMessage: null,
  businessHours: [],
};

const actionMap = {
  [actions.GET_BUSINESS_HOURS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_BUSINESS_HOURS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, businessHours: data.results }),
  [actions.GET_BUSINESS_HOURS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_BUSINESS_HOURS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_BUSINESS_HOURS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, businessHours: data }),
  [actions.UPDATE_BUSINESS_HOURS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.CREATE_BUSINESS_HOURS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_BUSINESS_HOURS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, businessHours: data }),
  [actions.CREATE_BUSINESS_HOURS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),
};

export default (state = initialState, action: BusinessHoursActionTypes): BusinessHoursState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
