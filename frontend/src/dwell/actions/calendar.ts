import { actions, paths } from 'dwell/constants';
import { ActionType } from 'src/interfaces';

export default {
  getCalendars: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CALENDARS_REQUEST,
        actions.GET_CALENDARS_SUCCESS,
        actions.GET_CALENDARS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.CALENDARS),
    },
  }),
};
