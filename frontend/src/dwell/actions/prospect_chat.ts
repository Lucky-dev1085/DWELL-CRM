/* eslint-disable camelcase */
import { actions, paths } from 'dwell/constants';
import { build } from 'dwell/constants/paths';
import { ActionType, Prospect, ManageRequestProps } from 'src/interfaces';

interface ProspectContact {
  id: number,
  isSMS: boolean,
  isSingleChat?: boolean,
}

interface ProspectData {
  prospect: number,
  body: { type: string, agent: number }
}

interface ActionProspect {
  type: string,
  ids?: number[],
  id?: number,
  data?: string | boolean,
  contact?: ProspectContact,
  activeSlide?: number,
  tabKey?: string,
}

export default {
  getAllProspects: (show_all: boolean, properties: number[]): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_PROSPECTS_REQUEST,
        actions.GET_PROSPECTS_SUCCESS,
        actions.GET_PROSPECTS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.PROSPECTS, { params: { show_all, properties } }),
    },
  }),
  searchProspect: (params: Prospect): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.SEARCH_PROSPECT_CHAT_REQUEST,
        actions.SEARCH_PROSPECT_CHAT_SUCCESS,
        actions.SEARCH_PROSPECT_CHAT_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.PROSPECTS, { params }),
    },
  }),
  joinProspect: (data: ProspectData): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.JOIN_PROSPECT_CHAT_REQUEST,
        actions.JOIN_PROSPECT_CHAT_SUCCESS,
        actions.JOIN_PROSPECT_CHAT_FAILURE,
      ],
      promise: client => client.post(build(paths.api.v1.PROSPECT_CONVERSATIONS, data.prospect), data.body),
    },
  }),
  updateProspectChatStatus: (data: ProspectData, properties: number[]): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CHANGE_PROSPECT_CHAT_STATUS_REQUEST,
        actions.CHANGE_PROSPECT_CHAT_STATUS_SUCCESS,
        actions.CHANGE_PROSPECT_CHAT_STATUS_FAILURE,
      ],
      promise: client => client.patch(build(paths.api.v1.PROSPECT_DETAILS, data.prospect), data.body, { params: { properties } }),
    },
  }),
  readAll: (prospect: Prospect): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.PROSPECT_CHAT_READALL_REQUEST,
        actions.PROSPECT_CHAT_READALL_SUCCESS,
        actions.PROSPECT_CHAT_READALL_FAILURE,
      ],
      promise: client => client.post(build(paths.api.v1.PROSPECT_CONVERSATIONS_READALL, prospect)),
    },
  }),
  sendTypingState: (prospect: number, data: { is_typing: boolean, type: string}): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.PROSPECT_CHAT_READALL_REQUEST,
        actions.PROSPECT_CHAT_READALL_SUCCESS,
        actions.PROSPECT_CHAT_READALL_FAILURE,
      ],
      promise: client => client.post(build(paths.api.v1.TYPING_STATE, prospect), data),
    },
  }),
  dismissNewMessage: (prospect: Prospect): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.PROSPECT_CHAT_DISMISS_NEW_MESSAGE_REQUEST,
        actions.PROSPECT_CHAT_DISMISS_NEW_MESSAGE_SUCCESS,
        actions.PROSPECT_CHAT_DISMISS_NEW_MESSAGE_FAILURE,
      ],
      promise: client => client.post(build(paths.api.v1.PROSPECT_DISMISS_NEW_MESSAGE, prospect)),
    },
  }),
  sendMessageToProspect: (data: ProspectData): ActionType =>
    ({
      [actions.CALL_API]: {
        types: [
          actions.SEND_TEXT_TO_PROSPECT_REQUEST,
          actions.SEND_TEXT_TO_PROSPECT_SUCCESS,
          actions.SEND_TEXT_TO_PROSPECT_FAILURE,
        ],
        promise: client => client.post(build(paths.api.v1.PROSPECT_CONVERSATIONS, data.prospect), data),
      },
    }),
  clearNewMessageAlert: (): ActionProspect => ({
    type: actions.CLEAR_NEW_MESSAGE_ALERT,
  }),

  clearAgentRequestAlert: (): ActionProspect => ({
    type: actions.CLEAR_NEW_AGENT_REQUEST_ALERT,
  }),

  setProspectsOffline: (ids: number[]): ActionProspect => ({
    type: actions.SET_PROSPECTS_OFFLINE,
    ids,
  }),

  removeFromProspectsRequestedAgent: (id: number): ActionProspect => ({ type: actions.REMOVE_FROM_PROSPECTS_REQUESTED_AGENT, id }),
  updateAgentRequest: (id: number, params: ProspectData): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.DECLINE_AGENT_REQUEST_REQUEST,
        actions.DECLINE_AGENT_REQUEST_SUCCESS,
        actions.DECLINE_AGENT_REQUEST_FAILURE,
      ],
      promise: client => client.patch(build(paths.api.v1.AGENT_REQUEST_DETAILS, id), params),
    },
  }),
  setChatType: (data: string): ActionProspect =>
    ({
      type: actions.SET_CHAT_TYPE,
      data,
    }),
  setChatMinimiseStatus: (data: boolean): ActionProspect =>
    ({
      type: actions.SET_CHAT_MINIMISE_STATUS,
      data,
    }),
  setChatAsActive: (contact: ProspectContact): ActionProspect => ({
    type: actions.SET_CHAT_AS_ACTIVE,
    contact,
  }),
  setActiveProperties: (ids: number[]): ActionProspect => ({
    type: actions.SET_ACTIVE_PROPERTIES,
    ids,
  }),
  getProspectsByProperty: (show_all: boolean, property_id: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_PROSPECTS_BY_PROPERTY_REQUEST,
        actions.GET_PROSPECTS_BY_PROPERTY_SUCCESS,
        actions.GET_PROSPECTS_BY_PROPERTY_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.PROSPECTS, { params: { show_all, property_id } }),
    },
  }),
  removeProspectsByProperty: (id: number): ActionProspect => ({
    type: actions.REMOVE_PROSPECTS_BY_PROPERTY,
    id,
  }),
  removeFromActiveChats: (contact: ProspectContact): ActionProspect => ({
    type: actions.REMOVE_FROM_ACTIVE_CHATS,
    contact,
  }),
  getConversations: ({ prospect, params }: { prospect: number, params: ManageRequestProps }): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CHAT_CONVERSATIONS_REQUEST,
        actions.GET_CHAT_CONVERSATIONS_SUCCESS,
        actions.GET_CHAT_CONVERSATIONS_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.PROSPECT_CONVERSATIONS, prospect), { params }),
    },
  }),
  reorderActiveChats: (contact: ProspectContact): ActionProspect => ({
    type: actions.REORDER_ACTIVE_CHATS,
    contact,
  }),
  minimizeChatWindow: (contact: ProspectContact): ActionProspect => ({
    type: actions.MINIMIZE_CHAT_WINDOW,
    contact,
  }),
  setActiveSlide: (activeSlide: number): ActionProspect => ({
    type: actions.SET_ACTIVE_CHAT_SLIDE,
    activeSlide,
  }),

  setCurrentTab: (tabKey: string): ActionProspect => ({
    type: actions.SET_CURRENT_TAB,
    tabKey,
  }),

  clearTyping: (): ActionProspect => ({
    type: actions.CLEAR_TYPING,
  }),
};
