import { actions, paths } from 'dwell/constants';
import { build } from 'dwell/constants/paths';
import { CallBackFunction, ActionType, EmailTemplateProps } from 'src/interfaces';

export default {
  getEmailTemplates: (): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_EMAIL_TEMPLATES_REQUEST,
        actions.GET_EMAIL_TEMPLATES_SUCCESS,
        actions.GET_EMAIL_TEMPLATES_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.EMAIL_TEMPLATES, { params: { show_all: true } }),
    },
  }),
  getEmailTemplateById: (id: number): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.GET_EMAIL_TEMPLATE_BY_ID_REQUEST,
          actions.GET_EMAIL_TEMPLATE_BY_ID_SUCCESS,
          actions.GET_EMAIL_TEMPLATE_BY_ID_FAILURE,
        ],
        promise: client => client.get(build(paths.api.v1.EMAIL_TEMPLATE_DETAILS, id)),
      },
    }),
  createEmailTemplate: (data: EmailTemplateProps, successCB: CallBackFunction = null): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.CREATE_EMAIL_TEMPLATE_REQUEST,
          actions.CREATE_EMAIL_TEMPLATE_SUCCESS,
          actions.CREATE_EMAIL_TEMPLATE_FAILURE,
        ],
        promise: client => client.post(paths.api.v1.EMAIL_TEMPLATES, data),
        successCB,
      },
    }),
  updateEmailTemplateById: (id: number, data: EmailTemplateProps, successCB: CallBackFunction = null): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.UPDATE_EMAIL_TEMPLATE_REQUEST,
          actions.UPDATE_EMAIL_TEMPLATE_SUCCESS,
          actions.UPDATE_EMAIL_TEMPLATE_FAILURE,
        ],
        promise: client => client.put(build(paths.api.v1.EMAIL_TEMPLATE_DETAILS, id), data),
        successCB,
      },
    }),
  deleteEmailTemplateById: (id: number, successCB: CallBackFunction = null): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.DELETE_EMAIL_TEMPLATE_REQUEST,
          actions.DELETE_EMAIL_TEMPLATE_SUCCESS,
          actions.DELETE_EMAIL_TEMPLATE_FAILURE,
        ],
        promise: client => client.delete(build(paths.api.v1.EMAIL_TEMPLATE_DETAILS, id)),
        successCB,
      },
    }),
};
