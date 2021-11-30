import { actions, paths } from 'dwell/constants';
import { ActionType } from 'src/interfaces';

export default {
  getLabels: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_EMAIL_LABELS_REQUEST,
        actions.GET_EMAIL_LABELS_SUCCESS,
        actions.GET_EMAIL_LABELS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.EMAIL_LABELS),
    },
  }),
};
