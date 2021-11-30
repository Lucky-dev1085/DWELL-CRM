import { actions, paths } from 'dwell/constants';
import { build } from 'dwell/constants/paths';
import { CallBackFunction, ActionType } from 'src/interfaces';

export default {
  getSources: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_SOURCES_REQUEST,
        actions.GET_SOURCES_SUCCESS,
        actions.GET_SOURCES_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.SOURCE, { params: { show_all: true } }),
    },
  }),
  updateSourceById: (id: number, params: {is_paid: boolean}, successCB: CallBackFunction = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_SOURCES_REQUEST,
        actions.UPDATE_SOURCES_SUCCESS,
        actions.UPDATE_SOURCES_FAILURE,
      ],
      promise: client => client.patch(build(paths.api.v1.SOURCE_DETAILS, id), params),
      successCB,
    },
  }),
  updateSpends: (data: number, successCB: CallBackFunction = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_SPENDS_REQUEST,
        actions.UPDATE_SPENDS_SUCCESS,
        actions.UPDATE_SPENDS_FAILURE,
      ],
      promise: client => client.put(paths.api.v1.SPENDS_UPDATE, data),
      successCB,
    },
  }),
};
