import { actions, DEMO_EXTERNAL_ID } from 'main_page/constants';
import { DemoTourActionTypes, DemoTourProps, DemoTourState } from 'src/interfaces';
import moment from 'moment-timezone';

const initialState: DemoTourState = {
  isSubmitting: false,
  errorMessage: null,
  demoTour: {} as DemoTourProps,
  availableTimes: [],
  availableDates: [],
};

const actionMap = {
  [actions.GET_DEMO_TOUR_BY_ID_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_DEMO_TOUR_BY_ID_SUCCESS]: (state, { result: { data } }) => {
    let demo = { ...data };
    if (demo.is_cancelled || moment(demo.date) < moment()) {
      demo = {};
      if (localStorage.getItem(DEMO_EXTERNAL_ID)) {
        localStorage.removeItem(DEMO_EXTERNAL_ID);
      }
    }
    return { ...state, isSubmitting: false, demoTour: demo };
  },
  [actions.GET_DEMO_TOUR_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_DEMO_TOUR_BY_ID_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_DEMO_TOUR_BY_ID_SUCCESS]: (state, { result: { data } }) => {
    let demo = { ...data };
    if (demo.is_cancelled) {
      demo = {};
      if (localStorage.getItem(DEMO_EXTERNAL_ID)) {
        localStorage.removeItem(DEMO_EXTERNAL_ID);
      }
    }
    return { ...state, isSubmitting: false, demoTour: demo };
  },
  [actions.UPDATE_DEMO_TOUR_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.CREATE_DEMO_TOUR_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_DEMO_TOUR_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, demoTour: data }),
  [actions.CREATE_DEMO_TOUR_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.GET_DEMO_TOUR_AVAILABLE_DATES_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_DEMO_TOUR_AVAILABLE_DATES_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, availableDates: data }),
  [actions.GET_DEMO_TOUR_AVAILABLE_DATES_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.GET_DEMO_TOUR_AVAILABLE_TIMES_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_DEMO_TOUR_AVAILABLE_TIMES_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, availableTimes: data }),
  [actions.GET_DEMO_TOUR_AVAILABLE_TIMES_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

};

export default (state = initialState, action: DemoTourActionTypes): DemoTourState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
