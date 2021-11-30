import { actions } from 'dwell/constants';
import { ChatTemplateProps, ChatTemplateState, ChatTemplateActionTypes } from 'src/interfaces';

const initialState: ChatTemplateState = {
  isSubmitting: false,
  errorMessage: null,
  chatTemplates: [],
  chatTemplate: {} as ChatTemplateProps,
};

const actionMap = {
  [actions.GET_CHAT_TEMPLATES_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_CHAT_TEMPLATES_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, chatTemplates: data.results }),
  [actions.GET_CHAT_TEMPLATES_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.GET_CHAT_TEMPLATE_BY_ID_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_CHAT_TEMPLATE_BY_ID_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, chatTemplate: data }),
  [actions.GET_CHAT_TEMPLATE_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_CHAT_TEMPLATE_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_CHAT_TEMPLATE_SUCCESS]: (state, { result: { data } }) => {
    const updateChatTemplatesList = state.chatTemplates.map(template => (template.id === data.id ? data : template));
    return { ...state, isSubmitting: false, chatTemplates: updateChatTemplatesList };
  },
  [actions.UPDATE_CHAT_TEMPLATE_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.CREATE_CHAT_TEMPLATE_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_CHAT_TEMPLATE_SUCCESS]: (state, { result: { data } }) => {
    const updateChatTemplatesList = [...state.chatTemplates];
    updateChatTemplatesList.push(data);
    return { ...state, isSubmitting: false, chatTemplates: updateChatTemplatesList };
  },
  [actions.CREATE_CHAT_TEMPLATE_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),
};

export default (state = initialState, action: ChatTemplateActionTypes): ChatTemplateState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
