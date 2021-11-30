import { actions } from 'dwell/constants';
import { AssignLeadOwnerProps, AssignLeadOwnersState, AssignLeadOwnersActionTypes, OwnerProps } from 'src/interfaces';

const initialState: AssignLeadOwnersState = {
  isSubmitting: false,
  errorMessage: null,
  assignLeadOwners: {} as AssignLeadOwnerProps,
  currentAssignedOwner: {} as OwnerProps,
};

const actionMap = {
  [actions.GET_ASSIGN_LEAD_OWNERS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_ASSIGN_LEAD_OWNERS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, assignLeadOwners: data.results[0] }),
  [actions.GET_ASSIGN_LEAD_OWNERS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_ASSIGN_LEAD_OWNERS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_ASSIGN_LEAD_OWNERS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, assignLeadOwners: data }),
  [actions.UPDATE_ASSIGN_LEAD_OWNERS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.CREATE_ASSIGN_LEAD_OWNERS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_ASSIGN_LEAD_OWNERS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, assignLeadOwners: data }),
  [actions.CREATE_ASSIGN_LEAD_OWNERS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.GET_CURRENT_ASSIGNED_OWNER_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_CURRENT_ASSIGNED_OWNER_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, currentAssignedOwner: data }),
  [actions.GET_CURRENT_ASSIGNED_OWNER_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),
};

export default (state = initialState, action: AssignLeadOwnersActionTypes): AssignLeadOwnersState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
