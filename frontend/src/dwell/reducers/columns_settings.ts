import { actions } from 'dwell/constants';
import { ColumnSettingsState, ColumnSettingsActionTypes } from 'src/interfaces';

const initialState: ColumnSettingsState = {
  isSubmitting: false,
  errorMessage: null,
  columns: [],
};

const actionMap = {
  [actions.GET_COLUMNS_SETTINGS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_COLUMNS_SETTINGS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, columns: data.results }),
  [actions.GET_COLUMNS_SETTINGS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_COLUMNS_SETTINGS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_COLUMNS_SETTINGS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, columns: data }),
  [actions.UPDATE_COLUMNS_SETTINGS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.CREATE_COLUMNS_SETTINGS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_COLUMNS_SETTINGS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, columns: data }),
  [actions.CREATE_COLUMNS_SETTINGS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.PUSHER_CREATE_RECORD]: (state, { row }) => ({ ...state, columns: row }),
  [actions.PUSHER_UPDATE_RECORD]: (state, { row }) => ({ ...state, columns: row }),
};

export default (state = initialState, action: ColumnSettingsActionTypes): ColumnSettingsState => {
  if (actionMap[action.type]) {
    if (action.type.includes('PUSHER_') && action.pusherModel !== 'column') {
      return state;
    }
    return actionMap[action.type](state, action);
  }

  return state;
};
