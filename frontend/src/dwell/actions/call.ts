import { actions, paths } from 'dwell/constants';
import { build } from 'dwell/constants/paths';
import { ActionType, ManageRequestProps } from 'src/interfaces';

export default {
  getCalls: (param: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CALLS_REQUEST,
        actions.GET_CALLS_SUCCESS,
        actions.GET_CALLS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.CALLS, { params: param }),
    },
  }),

  getCallById: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CALL_BY_ID_REQUEST,
        actions.GET_CALL_BY_ID_SUCCESS,
        actions.GET_CALL_BY_ID_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.CALL_DETAILS, id)),
    },
  }),

  updateCallById: (id: number, data: { lead: { id: number } }): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_CALL_REQUEST,
        actions.UPDATE_CALL_SUCCESS,
        actions.UPDATE_CALL_FAILURE,
      ],
      promise: client => client.patch(build(paths.api.v1.CALL_DETAILS, id), data),
    },
  }),

  archiveCalls: (data: { lead: { id: number } }): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.ARCHIVE_CALLS_REQUEST,
        actions.ARCHIVE_CALLS_SUCCESS,
        actions.ARCHIVE_CALLS_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.ARCHIVE_CALLS, data),
    },
  }),

  archiveCall: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.ARCHIVE_CALL_REQUEST,
        actions.ARCHIVE_CALL_SUCCESS,
        actions.ARCHIVE_CALL_FAILURE,
      ],
      promise: client => client.patch(build(paths.api.v1.CALL_DETAILS, id), { is_archived: true }),
    },
  }),
};
