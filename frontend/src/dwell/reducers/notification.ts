import { actions } from 'dwell/constants';
import { NotificationState, NotificationActionTypes } from 'src/interfaces';

const initialState: NotificationState = {
  isSubmitting: false,
  errorMessage: null,
  notifications: [],
  notification: {} as { is_read: boolean, id: number },
};

const actionMap = {
  [actions.GET_NOTIFICATIONS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_NOTIFICATIONS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, notifications: data.results }),
  [actions.GET_NOTIFICATIONS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_NOTIFICATION_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_NOTIFICATION_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, notification: data }),
  [actions.UPDATE_NOTIFICATION_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.CREATE_NOTIFICATION_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_NOTIFICATION_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.CREATE_NOTIFICATION_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_NOTIFICATION_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_NOTIFICATION_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.UPDATE_NOTIFICATION_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.BULK_CLEAR_NOTIFICATIONS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.BULK_CLEAR_NOTIFICATIONS_SUCCESS]: (state, { result: { data } }) =>
    ({ ...state, isSubmitting: false, notifications: state.notifications.filter(n => !data.ids.includes(n.id)) }),
  [actions.BULK_CLEAR_NOTIFICATIONS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),
};

export default (state = initialState, action: NotificationActionTypes): NotificationState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
