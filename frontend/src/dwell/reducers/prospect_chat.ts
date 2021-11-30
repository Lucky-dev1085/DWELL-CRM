import { actions } from 'dwell/constants';
import { sortBy, unionBy } from 'lodash';
import moment from 'moment';
import { ProspectChatState, ProspectChatActionTypes } from 'src/interfaces';

const initialState: ProspectChatState = {
  isSubmitting: false,
  isProspectsLoading: false,
  isProspectsLoaded: false,
  errorMessage: null,
  isSendingText: false,
  newAgentRequest: false,
  isChatMinimized: true,
  conversations: [],
  suggestions: [], // keep it for the moment until we decide finally to remove it
  prospects: [],
  leadProspects: [],
  newMessage: {} as { prospect: number, type: string },
  prospectsRequestedAgents: [],
  availableAgentsCount: 0,
  chatType: 'chat', // chat or sms
  activeChats: [],
  activeProperties: [],
  activeSlide: 0,
  currentTab: '',
  typingData: { isTyping: false, prospect: null },
  tour_scheduling_in_progress: false,
};

const sortByDate = arr => (arr.sort((a, b) => b.last_message_date - a.last_message_date));

const actionMap = {
  [actions.GET_PROSPECTS_REQUEST]: state => ({ ...state, isProspectsLoading: true, isProspectsLoaded: false }),
  [actions.GET_PROSPECTS_SUCCESS]: (state, { result: { data } }) => {
    const prospects = state.prospects.filter(p => !data.results.map(item => item.id).includes(p.id)).concat(data.results);
    return ({ ...state, isProspectsLoading: false, isProspectsLoaded: true, prospects, suggestions: sortByDate(prospects) });
  },
  [actions.GET_PROSPECTS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isProspectsLoading: false, isProspectsLoaded: false }),

  [actions.SEARCH_PROSPECT_CHAT_REQUEST]: state => ({ ...state }),
  [actions.SEARCH_PROSPECT_CHAT_SUCCESS]: (state, { result: { data } }) => ({ ...state, suggestions: data.results }),
  [actions.SEARCH_PROSPECT_CHAT_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.JOIN_PROSPECT_CHAT_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.JOIN_PROSPECT_CHAT_SUCCESS]: (state, { result: { data } }) => {
    const { conversations } = state;
    // update for prospects
    let prospects = [...state.prospects];
    let currentProspect = prospects.find(p => p.id === data.prospect);
    if (currentProspect) {
      currentProspect = { ...currentProspect };
      currentProspect.active_agent = data.agent;
      currentProspect.joined_agents = currentProspect.joined_agents.concat([data.agent]);
      prospects = prospects.filter(p => p.id !== data.prospect).concat([currentProspect]);
    }
    // update for current prospect if it's same
    // todo should adjust logic here with new active chats logic
    const activeChatState = { activeChats: state.activeChats };
    if (state.activeChats.includes(data.prospect)) {
      const prospect = state.activeChats.find(p => p.id === data.prospect);
      activeChatState.activeChats = state.activeChats.filter(p => p.id !== prospect.id).concat([
        { ...prospect, active_agent: data.agent, joined_agents: prospect.joined_agents.concat([data.agent]) }]);
    }
    return ({
      ...state,
      ...activeChatState,
      isSubmitting: false,
      prospects: [...prospects.slice()],
      conversations: [...conversations.slice(), data],
    });
  },
  [actions.JOIN_PROSPECT_CHAT_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.GET_PROSPECT_CONVERSATION_BY_ID_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_PROSPECT_CONVERSATION_BY_ID_SUCCESS]: (state, { result: { data } }) => {
    const { conversations } = state;
    const newConvo = data.results.filter(i => !conversations.find(j => j.id === i.id)).reverse().concat(state.conversations);
    return ({
      ...state,
      isSubmitting: false,
      conversations: newConvo,
    });
  },
  [actions.GET_PROSPECT_CONVERSATION_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.CHANGE_PROSPECT_CHAT_STATUS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CHANGE_PROSPECT_CHAT_STATUS_SUCCESS]: (state, { result: { data } }) => {
    const { prospects } = state;
    const updatedProspects = prospects.filter(p => p.id !== data.id).concat([data]);
    return ({
      ...state,
      isSubmitting: false,
      prospects: updatedProspects,
      suggestions: (data.is_archived) ? sortByDate(updatedProspects) : state.suggestions,
    });
  },
  [actions.CHANGE_PROSPECT_CHAT_STATUS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.SEND_TEXT_TO_PROSPECT_REQUEST]: state => ({ ...state, isSendingText: true }),
  [actions.SEND_TEXT_TO_PROSPECT_SUCCESS]: (state, { result: { data } }) => {
    const pro = state.prospects.find(p => p.id === data.prospect);
    pro.last_message = data.message;
    pro.last_message_date = data.date;
    return ({ ...state,
      isSendingText: false,
      conversations: [...state.conversations.slice(), data],
      prospects: state.prospects.filter(prospect => prospect.id !== pro.id).concat([{ ...pro }]),
    });
  },
  [actions.SEND_TEXT_TO_PROSPECT_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSendingText: false }),

  [actions.PROSPECT_CHAT_READALL_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.PROSPECT_CHAT_READALL_SUCCESS]: (state, { result: { data } }) => ({
    ...state,
    isSubmitting: false,
    prospects: state.prospects.map((prospect) => {
      const updatedProspect = { ...prospect };
      if (updatedProspect.id === data.id) {
        updatedProspect.unread_count = 0;
      }
      return updatedProspect;
    }),
  }),
  [actions.PROSPECT_CHAT_READALL_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.PROSPECT_CHAT_DISMISS_NEW_MESSAGE_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.PROSPECT_CHAT_DISMISS_NEW_MESSAGE_SUCCESS]: (state, { result: { data } }) => ({
    ...state,
    isSubmitting: false,
    prospects: [data].concat(state.prospects.filter(prospect => prospect.id !== data.id)),
  }),
  [actions.PROSPECT_CHAT_DISMISS_NEW_MESSAGE_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.PUSHER_CREATE_RECORD]: (state, { row, pusherModel }) => {
    if (pusherModel === 'chatprospect') {
      if (state.activeProperties.includes(row.property)) {
        return { ...state, prospects: [row].concat(state.prospects) };
      }
      return state;
    } else if (pusherModel === 'chatconversation') {
      const { conversations, prospects } = state;
      if (state.activeProperties.includes(row.property)) {
        const found = conversations.filter(i => i.id === row.id);
        if (!found.length) {
          let result = { ...state,
            newMessage: row.type !== 'AGENT_REQUEST' ? { prospect: row.prospect, type: row.type } : state.newMessage,
            newAgentRequest: row.type === 'AGENT_REQUEST',
            availableAgentsCount: row.available_agents_count,
            conversations: sortBy(conversations.concat([row]), o => moment(o.date)),
          };
          if (row.type === 'AGENT_REQUEST') result.newMessage = state.newMessage;
          else result.newMessage = ['AGENT', 'TEMPLATE'].includes(row.type) ? {} : { prospect: row.prospect, type: row.type };

          const pro = prospects.find(p => p.id === row.prospect);
          if ((['AGENT_REQUEST', 'JOINED'].includes(row.type) || row.action === 'SCHEDULE_TOUR') && pro && !pro.should_display_in_chat) {
            pro.should_display_in_chat = true;
          }
          if (row.type !== 'JOINED') {
            if (pro && !['AGENT_REQUEST'].includes(row.type)) {
              if (!row.message.includes('unit-form') && !row.is_form_message) {
                pro.last_message = row.message;
                pro.last_message_date = row.date;
              }
              if (!['AGENT', 'TEMPLATE'].includes(row.type)) {
                pro.unread_count += 1;
                pro.has_not_seen_new_message = true;
              }
              if (row.type === 'PROSPECT' || !pro.last_prospect_message) {
                pro.last_prospect_message = row.message;
                pro.last_prospect_message_date = row.date;
                if (row.is_form_message) {
                  if (row.message.includes('<div class="schedule-form">')) {
                    pro.last_prospect_formatted_message = 'Guest card completed';
                  } else if (row.message.includes('<div class="schedule-form" id="tour-card">') || row.message.includes('<div class="calendar-links">')) {
                    pro.last_prospect_formatted_message = 'Tour card completed';
                  }
                } else {
                  pro.last_prospect_formatted_message = row.message;
                }
                pro.is_online = true;
              }
              result = { ...result, prospects: state.prospects.filter(prospect => prospect.id !== pro.id).concat([{ ...pro }]) };
            }
          }
          return result;
        }
      }
      return state;
    } else if (pusherModel === 'agentrequest') {
      if (!state.prospectsRequestedAgents.map(request => request.id).includes(row.id)) {
        return { ...state,
          prospectsRequestedAgents: [...state.prospectsRequestedAgents].concat([row]),
        };
      }
      return state;
    }
    return state;
  },

  [actions.PUSHER_UPDATE_RECORD]: (state, { row, pusherModel }) => {
    if (pusherModel === 'chatprospect' && state.activeProperties.includes(row.property)) {
      return { ...state, prospects: [row].concat(state.prospects.filter(p => p.id !== row.id)) };
    } else if (pusherModel === 'chatconversation') {
      let result = { ...state, conversations: [row].concat(state.conversations.filter(c => c.id !== row.id)) };
      const prospect = state.prospects.filter(p => p.id === row.prospect);
      if ((['AGENT_REQUEST', 'JOINED'].includes(row.type) || row.action === 'SCHEDULE_TOUR') && prospect && !prospect.should_display_in_chat) {
        result = { ...result,
          prospects: state.prospects.filter(p => p.id !== row.prospect)
            .concat([{ ...prospect, should_display_in_chat: true }]) };
      }
      return result;
    } else if (pusherModel === 'agentrequest') {
      return {
        ...state,
        prospectsRequestedAgents: unionBy([row], state.prospectsRequestedAgents, 'id'),
      };
    } else if (pusherModel === 'typing') {
      return {
        ...state,
        typingData: { isTyping: row.is_typing, prospect: row.prospect_id },
      };
    }
    return state;
  },

  [actions.CLEAR_NEW_MESSAGE_ALERT]: state => ({ ...state, newMessage: {} }),

  [actions.CLEAR_NEW_AGENT_REQUEST_ALERT]: state => ({ ...state, newAgentRequest: false }),
  [actions.REMOVE_FROM_PROSPECTS_REQUESTED_AGENT]: (state, { id }) => ({ ...state, prospectsRequestedAgents: state.prospectsRequestedAgents.filter(request => request.prospect !== id) }),

  [actions.GET_LEAD_BY_ID_SUCCESS]: (state, { result: { data } }) =>
    ({ ...state, prospects: sortByDate(unionBy(data.chat_prospects, state.prospects, 'id')) }),

  [actions.DECLINE_AGENT_REQUEST_REQUEST]: state => ({ ...state }),
  [actions.DECLINE_AGENT_REQUEST_SUCCESS]: (state, { result: { data } }) => ({ ...state, prospectsRequestedAgents: [...state.prospectsRequestedAgents.filter(request => request.id !== data.id)].concat([data]) }),
  [actions.DECLINE_AGENT_REQUEST_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.SET_PROSPECTS_OFFLINE]: (state, { ids }) => {
    const updatedProspects = state.prospects.map((prospect) => {
      const pro = { ...prospect };
      if (pro.is_online && ids.includes(pro.id)) {
        pro.is_online = false;
      }
      return pro;
    });

    return { ...state, prospects: updatedProspects };
  },
  [actions.SET_CHAT_MINIMISE_STATUS]: (state, { data }) => ({ ...state, isChatMinimized: data }),
  [actions.SET_CHAT_TYPE]: (state, { data }) => ({ ...state, chatType: data }),

  [actions.SET_CHAT_AS_ACTIVE]: (state, { contact }) => {
    if (!state.activeChats.filter(i => i.isSMS === contact.isSMS).map(i => i.id).includes(contact.id)) {
      const newContacts = [...state.activeChats].concat(contact);
      if (state.activeChats.filter(i => !i.circled).length < 3) {
        return { ...state, activeChats: newContacts };
      }
      const index = newContacts.findIndex(i => !i.circled);
      newContacts[index].circled = true;
      return { ...state, activeChats: newContacts };
    }
    return state;
  },

  [actions.SET_ACTIVE_CHAT_SLIDE]: (state, { activeSlide }) => {
    let newContacts = [...state.activeChats];
    newContacts = newContacts.map((i, ind) => {
      if (ind >= activeSlide && ind <= activeSlide + 2) return { ...i, circled: false };
      return { ...i, circled: true };
    });
    return ({ ...state, activeSlide, activeChats: newContacts });
  },
  [actions.SET_ACTIVE_PROPERTIES]: (state, { ids }) => ({ ...state, activeProperties: ids }),

  [actions.GET_PROSPECTS_BY_PROPERTY_REQUEST]: state => ({ ...state, isProspectsLoading: true }),
  [actions.GET_PROSPECTS_BY_PROPERTY_SUCCESS]: (state, { result: { data } }) => ({ ...state,
    isProspectsLoading: false,
    prospects: state.prospects.filter(p => !data.results.map(item => item.id).includes(p.id)).concat(data.results),
  }),
  [actions.GET_PROSPECTS_BY_PROPERTY_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isProspectsLoading: false }),

  [actions.REMOVE_FROM_ACTIVE_CHATS]: (state, { contact }) => ({ ...state,
    activeChats: state.activeChats.filter(i => !(i.id === contact.id && i.isSMS === contact.isSMS)),
  }),

  [actions.SET_CURRENT_TAB]: (state, { tabKey }) => ({ ...state, currentTab: tabKey }),

  [actions.GET_CHAT_CONVERSATIONS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_CHAT_CONVERSATIONS_SUCCESS]: (state, { result: { data } }) => {
    const { conversations } = state;
    const newConversations = data.results.filter(i => !conversations.find(j => j.id === i.id)).concat(state.conversations);
    return ({
      ...state,
      isSubmitting: false,
      conversations: newConversations,
    });
  },
  [actions.GET_CHAT_CONVERSATIONS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.REORDER_ACTIVE_CHATS]: (state, { contact }) => {
    let newContacts = [...state.activeChats];
    if (newContacts.filter(i => !i.circled).length >= 3) {
      const index = newContacts.findIndex(i => !i.circled);
      newContacts[index].circled = true;
    }
    newContacts = newContacts.filter(i => !(i.id === contact.id && i.isSMS === contact.isSMS)).concat([{ ...contact, circled: false, minimized: false }]);
    return ({ ...state, activeChats: newContacts });
  },

  [actions.MINIMIZE_CHAT_WINDOW]: (state, { contact }) => {
    const newContacts = [...state.activeChats];
    const index = newContacts.findIndex(i => i.id === contact.id && i.isSMS === contact.isSMS);
    if (index === -1) return ({ ...state });
    newContacts[index].minimized = contact.minimized;
    return ({ ...state, activeChats: newContacts });
  },

  [actions.CLEAR_TYPING]: state => ({ ...state, typingData: { isTyping: false, prospect: null } }),
};

export default (state = initialState, action: ProspectChatActionTypes): ProspectChatState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
