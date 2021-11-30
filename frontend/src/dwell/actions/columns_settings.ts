import { actions, paths } from 'dwell/constants';
import { ActionType, ColumnProps } from 'src/interfaces';

export default {
  getColumnsSettings: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_COLUMNS_SETTINGS_REQUEST,
        actions.GET_COLUMNS_SETTINGS_SUCCESS,
        actions.GET_COLUMNS_SETTINGS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.COLUMNS),
    },
  }),
  createColumnsSettings: (data: ColumnProps): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.CREATE_COLUMNS_SETTINGS_REQUEST,
          actions.CREATE_COLUMNS_SETTINGS_SUCCESS,
          actions.CREATE_COLUMNS_SETTINGS_FAILURE,
        ],
        promise: client => client.post(paths.api.v1.COLUMNS_CREATE, data),
      },
    }),
  updateColumnsSettings: (data: ColumnProps): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.UPDATE_COLUMNS_SETTINGS_REQUEST,
          actions.UPDATE_COLUMNS_SETTINGS_SUCCESS,
          actions.UPDATE_COLUMNS_SETTINGS_FAILURE,
        ],
        promise: client => client.put(paths.api.v1.COLUMNS_UPDATE, data),
      },
    }),
};
