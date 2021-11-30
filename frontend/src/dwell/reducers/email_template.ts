import { actions } from 'dwell/constants';
import { EmailTemplateProps, EmailTemplateState, EmailTemplateActionTypes } from 'src/interfaces';

const initialState: EmailTemplateState = {
  isSubmitting: false,
  errorMessage: null,
  emailTemplates: [],
  emailTemplate: {} as EmailTemplateProps,
};

const actionMap = {
  [actions.GET_EMAIL_TEMPLATES_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_EMAIL_TEMPLATES_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, emailTemplates: data.results }),
  [actions.GET_EMAIL_TEMPLATES_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.GET_EMAIL_TEMPLATE_BY_ID_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_EMAIL_TEMPLATE_BY_ID_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, emailTemplate: data }),
  [actions.GET_EMAIL_TEMPLATE_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_EMAIL_TEMPLATE_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_EMAIL_TEMPLATE_SUCCESS]: (state, { result: { data } }) => {
    const updateEmailTemplatesList = state.emailTemplates.map(template => (template.id === data.id ? data : template));
    return { ...state, isSubmitting: false, emailTemplates: updateEmailTemplatesList };
  },
  [actions.UPDATE_EMAIL_TEMPLATE_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.CREATE_EMAIL_TEMPLATE_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_EMAIL_TEMPLATE_SUCCESS]: (state, { result: { data } }) => {
    const updateEmailTemplatesList = [...state.emailTemplates];
    updateEmailTemplatesList.push(data);
    return { ...state, isSubmitting: false, emailTemplates: updateEmailTemplatesList };
  },
  [actions.CREATE_EMAIL_TEMPLATE_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),
};

export default (state = initialState, action: EmailTemplateActionTypes): EmailTemplateState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
