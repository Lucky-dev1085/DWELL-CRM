import { actions, paths } from 'dwell/constants';
import { ActionType, ManageRequestProps, RoommateProps } from 'src/interfaces';
import { build } from '../constants/paths';

export default {
  getRoommates: (leadId: number, params: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_ROOMMATES_REQUEST,
        actions.GET_ROOMMATES_SUCCESS,
        actions.GET_ROOMMATES_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.ROOMMATES, leadId), { params }),
    },
  }),

  getRoommateById: (id: number, leadId: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_ROOMMATE_BY_ID_REQUEST,
        actions.GET_ROOMMATE_BY_ID_SUCCESS,
        actions.GET_ROOMMATE_BY_ID_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.ROOMMATE_DETAILS, leadId, id)),
    },
  }),

  deleteRoommateById: (id: number, leadId: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.DELETE_ROOMMATE_REQUEST,
        actions.DELETE_ROOMMATE_SUCCESS,
        actions.DELETE_ROOMMATE_FAILURE,
      ],
      promise: client => client.delete(build(paths.api.v1.ROOMMATE_DETAILS, leadId, id)),
    },
  }),

  saveRoommates: (data: RoommateProps[], leadId: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_ROOMMATES_REQUEST,
        actions.UPDATE_ROOMMATES_SUCCESS,
        actions.UPDATE_ROOMMATES_FAILURE,
      ],
      promise: client => client.post(build(paths.api.v1.ROOMMATES_SAVE, leadId), data),
    },
  }),
};
