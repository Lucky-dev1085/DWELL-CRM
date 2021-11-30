import { actions, paths } from 'dwell/constants';
import { build } from 'dwell/constants/paths';
import { CallBackFunction, ActionType, AssignLeadOwnerProps } from 'src/interfaces';

export default {
  getAssignLeadOwners: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_ASSIGN_LEAD_OWNERS_REQUEST,
        actions.GET_ASSIGN_LEAD_OWNERS_SUCCESS,
        actions.GET_ASSIGN_LEAD_OWNERS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.ASSIGN_LEAD_OWNERS),
    },
  }),
  createAssignLeadOwners: (data: AssignLeadOwnerProps, successCB: CallBackFunction = null): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.CREATE_ASSIGN_LEAD_OWNERS_REQUEST,
          actions.CREATE_ASSIGN_LEAD_OWNERS_SUCCESS,
          actions.CREATE_ASSIGN_LEAD_OWNERS_FAILURE,
        ],
        promise: client => client.post(paths.api.v1.ASSIGN_LEAD_OWNERS, data),
        successCB,
      },
    }),
  updateAssignLeadOwnersById: (id: number, data: AssignLeadOwnerProps): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.UPDATE_ASSIGN_LEAD_OWNERS_REQUEST,
          actions.UPDATE_ASSIGN_LEAD_OWNERS_SUCCESS,
          actions.UPDATE_ASSIGN_LEAD_OWNERS_FAILURE,
        ],
        promise: client => client.put(build(paths.api.v1.ASSIGN_LEAD_OWNERS_DETAILS, id), data),
      },
    }),

  getCurrentAssignLeadOwner: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CURRENT_ASSIGNED_OWNER_REQUEST,
        actions.GET_CURRENT_ASSIGNED_OWNER_SUCCESS,
        actions.GET_CURRENT_ASSIGNED_OWNER_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.CURRENT_ASSIGN_LEAD_OWNER),
    },
  }),

};
