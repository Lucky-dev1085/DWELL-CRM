import { actions, paths } from 'dwell/constants';
import { ActionType, ManageRequestProps } from 'src/interfaces';

export default {
  getCallScoringQuestions: (param?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CALL_SCORING_QUESTIONS_REQUEST,
        actions.GET_CALL_SCORING_QUESTIONS_SUCCESS,
        actions.GET_CALL_SCORING_QUESTIONS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.CALL_SCORING_QUESTIONS, { params: param }),
    },
  }),
};
