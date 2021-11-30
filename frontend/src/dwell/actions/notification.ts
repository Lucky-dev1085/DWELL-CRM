import { actions, paths } from 'dwell/constants';
import { build } from 'dwell/constants/paths';
import { ActionType } from 'src/interfaces';

export default {
  getNotifications: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_NOTIFICATIONS_REQUEST,
        actions.GET_NOTIFICATIONS_SUCCESS,
        actions.GET_NOTIFICATIONS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.NOTIFICATIONS),
    },
  }),
  clearAllNotifications: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CLEAR_ALL_NOTIFICATIONS_REQUEST,
        actions.CLEAR_ALL_NOTIFICATIONS_SUCCESS,
        actions.CLEAR_ALL_NOTIFICATIONS_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.NOTIFICATION_CLEAR_ALL),
    },
  }),
  readAllNotifications: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.READ_ALL_NOTIFICATIONS_REQUEST,
        actions.READ_ALL_NOTIFICATIONS_SUCCESS,
        actions.READ_ALL_NOTIFICATIONS_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.NOTIFICATION_READ_ALL),
    },
  }),
  updateNotificationById: (id: number, params: { is_read: boolean, is_display: boolean }): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_NOTIFICATION_REQUEST,
        actions.UPDATE_NOTIFICATION_SUCCESS,
        actions.UPDATE_NOTIFICATION_FAILURE,
      ],
      promise: client => client.patch(build(paths.api.v1.NOTIFICATION_DETAILS, id), params),
    },
  }),
  bulkClearNotifications: (ids: number[]): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.BULK_CLEAR_NOTIFICATIONS_REQUEST,
        actions.BULK_CLEAR_NOTIFICATIONS_SUCCESS,
        actions.BULK_CLEAR_NOTIFICATIONS_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.BULK_CLEAR_NOTIFICATION, ids),
    },
  }),
};
