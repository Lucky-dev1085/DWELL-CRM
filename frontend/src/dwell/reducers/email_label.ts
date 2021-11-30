import { actions } from 'dwell/constants';
import { EmailLabelState, EmailLabelActionTypes } from 'src/interfaces';

const initialState: EmailLabelState = {
  isGettingLabels: false,
  errorMessage: null,
  labels: [],
};

const actionMap = {
  [actions.GET_EMAIL_LABELS_REQUEST]: state => ({ ...state, isGettingLabels: true }),
  [actions.GET_EMAIL_LABELS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isGettingLabels: false, labels: data.results }),
  [actions.GET_EMAIL_LABELS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isGettingLabels: false }),
};

export default (state = initialState, action: EmailLabelActionTypes): EmailLabelState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
