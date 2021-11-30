import { actions, paths } from 'dwell/constants';
import { ActionType, updateSurveysProps } from 'src/interfaces';

export default {
  getSurveys: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_SURVEYS_REQUEST,
        actions.GET_SURVEYS_SUCCESS,
        actions.GET_SURVEYS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.SURVEY, { params: { show_all: true } }),
    },
  }),
  updateSurveys: (data: updateSurveysProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_SURVEYS_REQUEST,
        actions.UPDATE_SURVEYS_SUCCESS,
        actions.UPDATE_SURVEYS_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.SURVEYS_UPDATE, data),
    },
  }),
};
