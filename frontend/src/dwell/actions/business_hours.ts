import { actions, paths } from 'dwell/constants';
import { ActionType } from 'src/interfaces';

interface BusinessHours { weekday: number, start_time: string, end_time: string, is_workday: boolean }

export default {
  getBusinessHours: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_BUSINESS_HOURS_REQUEST,
        actions.GET_BUSINESS_HOURS_SUCCESS,
        actions.GET_BUSINESS_HOURS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.BUSINESS_HOURS),
    },
  }),
  createBusinessHours: (data: BusinessHours): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.CREATE_BUSINESS_HOURS_REQUEST,
          actions.CREATE_BUSINESS_HOURS_SUCCESS,
          actions.CREATE_BUSINESS_HOURS_FAILURE,
        ],
        promise: client => client.post(paths.api.v1.BUSINESS_HOURS_CREATE, data),
      },
    }),
  updateBusinessHours: (data: BusinessHours): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.UPDATE_BUSINESS_HOURS_REQUEST,
          actions.UPDATE_BUSINESS_HOURS_SUCCESS,
          actions.UPDATE_BUSINESS_HOURS_FAILURE,
        ],
        promise: client => client.put(paths.api.v1.BUSINESS_HOURS_UPDATE, data),
      },
    }),
};
