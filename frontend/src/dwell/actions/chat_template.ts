import { actions, paths } from 'dwell/constants';
import { build } from 'dwell/constants/paths';
import { CallBackFunction, ActionType, ChatTemplateProps } from 'src/interfaces';

export default {
  getChatTemplates: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CHAT_TEMPLATES_REQUEST,
        actions.GET_CHAT_TEMPLATES_SUCCESS,
        actions.GET_CHAT_TEMPLATES_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.CHAT_TEMPLATES, { params: { show_all: true } }),
    },
  }),
  getChatTemplateById: (id: number): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.GET_CHAT_TEMPLATE_BY_ID_REQUEST,
          actions.GET_CHAT_TEMPLATE_BY_ID_SUCCESS,
          actions.GET_CHAT_TEMPLATE_BY_ID_FAILURE,
        ],
        promise: client => client.get(build(paths.api.v1.CHAT_TEMPLATE_DETAILS, id)),
      },
    }),
  createChatTemplate: (data: ChatTemplateProps, successCB: CallBackFunction = null): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.CREATE_CHAT_TEMPLATE_REQUEST,
          actions.CREATE_CHAT_TEMPLATE_SUCCESS,
          actions.CREATE_CHAT_TEMPLATE_FAILURE,
        ],
        promise: client => client.post(paths.api.v1.CHAT_TEMPLATES, data),
        successCB,
      },
    }),
  updateChatTemplateById: (id: number, data: ChatTemplateProps, successCB: CallBackFunction = null): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.UPDATE_CHAT_TEMPLATE_REQUEST,
          actions.UPDATE_CHAT_TEMPLATE_SUCCESS,
          actions.UPDATE_CHAT_TEMPLATE_FAILURE,
        ],
        promise: client => client.put(build(paths.api.v1.CHAT_TEMPLATE_DETAILS, id), data),
        successCB,
      },
    }),
  deleteChatTemplateById: (id: number, successCB: CallBackFunction = null): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.DELETE_CHAT_TEMPLATE_REQUEST,
          actions.DELETE_CHAT_TEMPLATE_SUCCESS,
          actions.DELETE_CHAT_TEMPLATE_FAILURE,
        ],
        promise: client => client.delete(build(paths.api.v1.CHAT_TEMPLATE_DETAILS, id)),
        successCB,
      },
    }),
};
