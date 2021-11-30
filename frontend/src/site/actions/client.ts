import { actions, paths } from 'site/constants';
import { ClientProps, CallBackFunction, ActionType, ManageRequestProps } from 'src/interfaces';

export default {
  updateClient: (id: number, clientData: ClientProps, successCB: CallBackFunction = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_CLIENT_REQUEST,
        actions.UPDATE_CLIENT_SUCCESS,
        actions.UPDATE_CLIENT_FAILURE,
      ],
      promise: client => client.put(paths.build(paths.api.v1.CLIENTS_ID, id), clientData),
      successCB,
    },
  }),

  deleteClient: (id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.DELETE_CLIENT_REQUEST,
        actions.DELETE_CLIENT_SUCCESS,
        actions.DELETE_CLIENT_FAILURE,
      ],
      promise: client => client.delete(paths.build(paths.api.v1.CLIENTS_ID, id)),
    },
  }),

  getClients: (params: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CLIENTS_REQUEST,
        actions.GET_CLIENTS_SUCCESS,
        actions.GET_CLIENTS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.CLIENTS, { params }),
    },
  }),

  createClient: (clientData: ClientProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_CLIENT_REQUEST,
        actions.CREATE_CLIENT_SUCCESS,
        actions.CREATE_CLIENT_FAILURE,
      ],
      promise: client => client.post(paths.build(paths.api.v1.CLIENTS), clientData),
    },
  }),
};
