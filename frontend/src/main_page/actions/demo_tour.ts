import { actions, paths } from 'main_page/constants';
import { build } from 'main_page/constants/paths';
import {
  CallBackFunction,
  ActionType,
  DemoTourTimesParams,
  DemoTourProps,
} from 'src/interfaces';

export default {
  getDemoTourById: (id: string): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_DEMO_TOUR_BY_ID_REQUEST,
        actions.GET_DEMO_TOUR_BY_ID_SUCCESS,
        actions.GET_DEMO_TOUR_BY_ID_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.DEMO_TOUR_DETAILS, id)),
    },
  }),
  createDemoTour: (data: DemoTourProps, successCB: CallBackFunction = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_DEMO_TOUR_REQUEST,
        actions.CREATE_DEMO_TOUR_SUCCESS,
        actions.CREATE_DEMO_TOUR_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.DEMO_TOURS, data),
      successCB,
    },
  }),
  updateDemoTourById: (id: string, data: DemoTourProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_DEMO_TOUR_BY_ID_REQUEST,
        actions.UPDATE_DEMO_TOUR_BY_ID_SUCCESS,
        actions.UPDATE_DEMO_TOUR_BY_ID_FAILURE,
      ],
      promise: client => client.patch(build(paths.api.v1.DEMO_TOUR_DETAILS, id), data),
    },
  }),

  getDemoTourAvailableDates: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_DEMO_TOUR_AVAILABLE_DATES_REQUEST,
        actions.GET_DEMO_TOUR_AVAILABLE_DATES_SUCCESS,
        actions.GET_DEMO_TOUR_AVAILABLE_DATES_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.DEMO_TOURS_AVAILABLE_DATES),
    },
  }),

  getDemoTourAvailableTimes: (params: DemoTourTimesParams): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_DEMO_TOUR_AVAILABLE_TIMES_REQUEST,
        actions.GET_DEMO_TOUR_AVAILABLE_TIMES_SUCCESS,
        actions.GET_DEMO_TOUR_AVAILABLE_TIMES_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.DEMO_TOUR_AVAILABLE_TIMES, { params }),
    },
  }),
};
