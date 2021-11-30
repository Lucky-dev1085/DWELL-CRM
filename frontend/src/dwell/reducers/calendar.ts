import { actions } from 'dwell/constants';
import { CalendarState, CalendarActionTypes } from 'src/interfaces';

const initialState: CalendarState = {
  isGettingCalendars: false,
  errorMessage: null,
  calendars: [],
};

const actionMap = {
  [actions.GET_CALENDARS_REQUEST]: state => ({ ...state, isGettingCalendars: true }),
  [actions.GET_CALENDARS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isGettingCalendars: false, calendars: data.results }),
  [actions.GET_CALENDARS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isGettingCalendars: false }),
};

export default (state = initialState, action: CalendarActionTypes): CalendarState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
