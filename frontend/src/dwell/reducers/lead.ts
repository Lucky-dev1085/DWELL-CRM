import { actions, COMMUNICATION_FILTER } from 'dwell/constants';
import { LeadData, LeadState, LeadActionTypes, RoommateProps } from 'src/interfaces';
import { orderBy, unionBy, get } from 'lodash';

const communicationFilter = localStorage.getItem(COMMUNICATION_FILTER);

const initialState: LeadState = {
  isSubmitting: false,
  isLoaded: true,
  errorMessage: null,
  leads: [],
  lead: {} as LeadData,
  leadProspect: {} as LeadData,
  leadNames: [],
  count: 0,
  filteredCount: 0,
  pmsData: {
    pms_sync_status: 'NOT_STARTED',
    pms_sync_date: null,
    pms_sync_condition_lack_reason: '',
  },
  totalLeadsCount: 0,
  activeLeadsCount: 0,
  myLeadsCount: 0,
  isCommunicationLoaded: false,
  communications: [],
  communicationCount: 0,
  isCommunicationUpdate: false,
  isChatPusher: false,
  communicationSearchKeyword: '',
  communicationFilterType: communicationFilter || '',
};

const mergeCommunications = (communications, model, row, filterType, keyword) => {
  let data;
  const object = {
    type: undefined, date: undefined,
  };
  if (model === 'notification') return communications;
  if (model === 'emailmessage') {
    ['id', 'attachments', 'body', 'date', 'is_unread', 'sender_name', 'sender_email', 'receiver_name', 'receiver_email',
      'formatted_sender_name', 'formatted_receiver_name', 'subject'].forEach((field) => {
      object[field] = row[field];
    });
    data = { date: row.created, is_property_communication: row.is_property_communication, type: 'EMAIL', object };
  } else if (model === 'smscontent') {
    ['id', 'date', 'lead_name', 'message', 'agent_name'].forEach((field) => {
      object[field] = row[field];
    });
    data = { date: row.created, is_property_communication: row.is_team_message, type: 'SMS', object };
  } else if (model === 'call') {
    ['id', 'date', 'lead_name', 'message'].forEach((field) => {
      object[field] = row[field];
    });
    data = { date: row.created, is_property_communication: null, type: 'CALL', object: row };
  } else if (model === 'chatconversation') {
    ['id', 'agent_name', 'date', 'type', 'message'].forEach((field) => {
      object[field] = row[field];
    });
    data = { date: row.created, is_property_communication: !(row.type === 'PROSPECT' && row.to_agent), type: 'CHATS', object: [object] };
  } else if (model === 'notedelete') {
    const removeId = row.id;
    return communications.filter((el) => {
      if (get(el, 'type') === 'NOTE') {
        return Number(get(el, 'object.id')) !== removeId;
      }
      return true;
    });
  } else if (model === 'note') {
    ['id', 'text', 'is_auto_generated', 'updated', 'created'].forEach((field) => {
      object[field] = row[field];
    });
    data = { date: row.updated, is_property_communication: null, type: 'NOTE', object };
  } else {
    const { last_activity: activity } = row;
    if (!activity) return communications;
    ['id', 'tour', 'type', 'transformed_content', 'creator', 'created'].forEach((field) => {
      object[field] = activity[field];
    });
    data = { date: activity.created, is_property_communication: null, type: 'ACTIVITY', object };
  }

  // filter the data by filter type
  if (filterType === 'note' && data.type !== 'NOTE') return communications;
  if (filterType === 'update' && !['LEAD_UPDATED', 'TOUR_UPDATED', 'TASK_UPDATED', 'ROOMMATE_UPDATED'].includes(get(data, 'object.type'))) return communications;
  if (filterType === 'email' && data.type !== 'EMAIL') return communications;
  if (filterType === 'sms' && data.type !== 'SMS') return communications;
  if (filterType === 'chat' && data.type !== 'CHATS') return communications;
  if (filterType === 'call' && data.type !== 'CALL') return communications;

  // filter the data with search keyword
  if (keyword && !Object.values(object).filter((item: string) => (item || '').toString().toLowerCase().includes(keyword.toLowerCase())).length) {
    return communications;
  }

  data = { ...data, uniqueId: `${data.type}-${data.object.id}` };
  let newCommunications = communications.map((item) => {
    if (item.type === 'CHATS') return item;
    return { ...item, uniqueId: `${item.type}-${item.object.id}` };
  });
  let nearestCommIndex = newCommunications.findIndex(comm => comm.type === 'CHATS');
  if (nearestCommIndex < 0) {
    nearestCommIndex = 0;
  }

  if (model === 'chatconversation') {
    const previous_communication = newCommunications[nearestCommIndex];
    if (previous_communication && previous_communication.type === 'CHATS' && object.type !== 'GREETING') {
      previous_communication.date = object.date;
      previous_communication.object = unionBy([object], previous_communication.object, 'id');
      if (previous_communication.is_property_communication && !data.is_property_communication) {
        previous_communication.is_property_communication = false;
      }
    } else {
      newCommunications = unionBy([data], newCommunications, 'uniqueId');
    }
  } else {
    newCommunications = unionBy([data], newCommunications, 'uniqueId');
  }
  return orderBy(newCommunications, 'date', 'desc');
};

const extractUpdatedLead = data => ({
  isSubmitting: false,
  lead: data,
  pmsSyncData: { pms_sync_status: data.pms_sync_status, pms_sync_date: data.pms_sync_date, pms_sync_condition_lack_reason: data.pms_sync_condition_lack_reason },
  totalLeadsCount: data.all_leads_count,
  activeLeadsCount: data.active_leads_count,
  myLeadsCount: data.my_leads_count,
  leads: [],
});

const actionMap = {
  [actions.GET_LEAD_REQUEST]: state => ({ ...state, isLoaded: false, lead: {} }),
  [actions.GET_LEAD_SUCCESS]: (state, { result: { data } }) =>
    ({ ...state,
      isLoaded: true,
      leads: data.results,
      count: data.count,
      totalLeadsCount: data.all_leads_count,
      activeLeadsCount: data.active_leads_count,
      myLeadsCount: data.my_leads_count }),
  [actions.GET_LEAD_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isLoaded: true }),

  [actions.GET_LEAD_BY_ID_REQUEST]: state => ({ ...state, isLoaded: false }),
  [actions.GET_LEAD_BY_ID_SUCCESS]: (state, { result: { data } }) => ({ ...state,
    isLoaded: true,
    lead: data,
    pmsSyncData: { pms_sync_status: data.pms_sync_status, pms_sync_date: data.pms_sync_date, pms_sync_condition_lack_reason: data.pms_sync_condition_lack_reason } }),
  [actions.GET_LEAD_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isLoaded: true }),

  [actions.UPDATE_LEAD_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_LEAD_SUCCESS]: (state, { result: { data } }) => ({ ...state, ...extractUpdatedLead(data) }),
  [actions.UPDATE_LEAD_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.DELETE_LEADS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.DELETE_LEADS_SUCCESS]: state => ({ ...state, isSubmitting: false, leads: [] }),
  [actions.DELETE_LEADS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.DELETE_LEAD_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.DELETE_LEAD_SUCCESS]: (state, { result: { data } }) =>
    ({ ...state,
      isSubmitting: false,
      leads: state.leads.filter(i => i.id !== data.id),
      totalLeadsCount: data.all_leads_count,
      activeLeadsCount: data.active_leads_count,
      myLeadsCount: data.my_leads_count,
    }),
  [actions.DELETE_LEAD_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_LEADS_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_LEADS_SUCCESS]: state => ({ ...state, isSubmitting: false, leads: [] }),
  [actions.UPDATE_LEADS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.CREATE_LEAD_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_LEAD_SUCCESS]: (state, { result: { data } }) => ({ ...state,
    isSubmitting: false,
    lead: data,
    pmsSyncData: { pms_sync_status: data.pms_sync_status, pms_sync_date: data.pms_sync_date, pms_sync_condition_lack_reason: data.pms_sync_condition_lack_reason },
    totalLeadsCount: data.all_leads_count,
    activeLeadsCount: data.active_leads_count,
    myLeadsCount: data.my_leads_count,
    leads: [] }),
  [actions.CREATE_LEAD_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.GET_LEAD_NAMES_REQUEST]: state => ({ ...state, isLoaded: false }),
  [actions.GET_LEAD_NAMES_SUCCESS]: (state, { result: { data } }) => ({ ...state, isLoaded: true, leadNames: data }),
  [actions.GET_LEAD_NAMES_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isLoaded: true }),

  [actions.CLEAR_LEADS]: state => ({ ...state, leads: [] }),

  [actions.GET_FILTERED_LEADS_COUNT_REQUEST]: state => ({ ...state, isLoaded: false }),
  [actions.GET_FILTERED_LEADS_COUNT_SUCCESS]: (state, { result: { data } }) => ({ ...state, isLoaded: true, filteredCount: data.count }),
  [actions.GET_FILTERED_LEADS_COUNT_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isLoaded: true }),

  [actions.PUSHER_DELETE_RECORD]: (state, { row }) => ({ ...state,
    lead: state.lead.id && state.lead.id.toString() === row.id.toString() ? row : state.lead }),

  [actions.GET_PMS_SYNC_STATUS_BY_ID_REQUEST]: state => ({ ...state, isLoaded: false }),
  [actions.GET_PMS_SYNC_STATUS_BY_ID_SUCCESS]: (state, { result: { data } }) => ({ ...state,
    isLoaded: true,
    pmsSyncData: { pms_sync_status: data.pms_sync_status, pms_sync_date: data.pms_sync_date, pms_sync_condition_lack_reason: data.pms_sync_condition_lack_reason },
  }),
  [actions.GET_PMS_SYNC_STATUS_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.GET_COMMUNICATIONS_BY_ID_REQUEST]: state => ({ ...state, isCommunicationLoaded: false }),
  [actions.GET_COMMUNICATIONS_BY_ID_SUCCESS]: (state, { result: { data: { results, count } } }) => ({ ...state, isCommunicationLoaded: true, communications: results, communicationCount: count }),
  [actions.GET_COMMUNICATIONS_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isCommunicationLoaded: true }),

  [actions.SET_COMMUNICATION_SEARCH_KEYWORD]: (state, { keyword }) => ({ ...state, communicationSearchKeyword: keyword }),
  [actions.SET_COMMUNICATION_FILTER_TYPE]: (state, { filterType }) => {
    localStorage.setItem(COMMUNICATION_FILTER, filterType);
    return ({ ...state, communicationFilterType: filterType });
  },

  [actions.PUSHER_CREATE_RECORD]: (state, { row, pusherModel }) => {
    let isCurrentLead = true;
    if (pusherModel === 'chatconversation') {
      isCurrentLead = (state.lead.chat_prospects || []).find(el => el.id === row.prospect);
    } else if (pusherModel === 'lead') {
      isCurrentLead = get(state, 'lead.id') === get(row, 'id', '');
    } else if (['emailmessage', 'note'].includes(pusherModel)) {
      isCurrentLead = get(state, 'lead.id') === get(row, 'lead', '');
    }

    if (!isCurrentLead) return ({ ...state });

    const newCommunications = mergeCommunications(state.communications, pusherModel, row, state.communicationFilterType, state.communicationSearchKeyword);
    const isAdded = newCommunications.length !== state.communications.length;
    return ({
      ...state,
      communications: newCommunications,
      isCommunicationUpdate: isAdded ? !state.isCommunicationUpdate : state.isCommunicationUpdate,
    });
  },
  [actions.PUSHER_UPDATE_RECORD]: (state, { row, pusherModel }) => {
    if (get(row, 'id', '') === get(state, 'lead.id')) {
      const newCommunications = mergeCommunications(state.communications, pusherModel, row, state.communicationFilterType, state.communicationSearchKeyword);
      const isAdded = newCommunications.length !== state.communications.length;
      return ({
        ...state,
        communications: newCommunications,
        lead: pusherModel === 'lead' && state.lead.id === row.id ? row : state.lead,
        isCommunicationUpdate: isAdded ? !state.isCommunicationUpdate : state.isCommunicationUpdate,
      });
    }
    return ({ ...state });
  },

  [actions.GET_LEAD_FOR_PROSPECT_REQUEST]: state => ({ ...state, isLoaded: false }),
  [actions.GET_LEAD_FOR_PROSPECT_SUCCESS]: (state, { result: { data } }) => ({ ...state, isLoaded: true, leadProspect: data }),
  [actions.GET_LEAD_FOR_PROSPECT_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isLoaded: true }),
};

const objectCreatedSignals = [
  actions.CREATE_NOTE_SUCCESS, actions.UPDATE_NOTE_SUCCESS, actions.DELETE_NOTE_SUCCESS, actions.CREATE_TASK_SUCCESS,
  actions.UPDATE_TASK_SUCCESS, actions.DELETE_TASK_SUCCESS, actions.COMPLETE_TASK_SUCCESS, actions.SEND_MESSAGE_SUCCESS,
  actions.SEND_TEXT_TO_LEAD_SUCCESS, actions.SEND_TEXT_TO_PROSPECT_SUCCESS, actions.UPDATE_LEAD_SUCCESS,
  actions.SHARE_LEAD_SUCCESS, actions.DELETE_ROOMMATE_SUCCESS, actions.UPDATE_ROOMMATES_SUCCESS,
];

const getModelNameByActionType = (type) => {
  if ([actions.CREATE_NOTE_SUCCESS, actions.UPDATE_NOTE_SUCCESS].includes(type)) return 'note';
  if ([actions.CREATE_TASK_SUCCESS, actions.UPDATE_TASK_SUCCESS, actions.DELETE_TASK_SUCCESS, actions.COMPLETE_TASK_SUCCESS].includes(type)) return 'task';
  if ([actions.SEND_MESSAGE_SUCCESS].includes(type)) return 'emailmessage';
  if ([actions.SEND_TEXT_TO_LEAD_SUCCESS].includes(type)) return 'smscontent';
  if ([actions.SEND_TEXT_TO_PROSPECT_SUCCESS].includes(type)) return 'chatconversation';
  if ([actions.UPDATE_LEAD_SUCCESS, actions.SHARE_LEAD_SUCCESS].includes(type)) return 'lead';
  if ([actions.UPDATE_ROOMMATES_SUCCESS].includes(type)) return 'roommates';
  if ([actions.DELETE_NOTE_SUCCESS].includes(type)) return 'notedelete';
  return '';
};

export default (state = initialState, action: LeadActionTypes): LeadState => {
  if (objectCreatedSignals.includes(action.type)) {
    const { result: { data }, type } = action;
    const model = getModelNameByActionType(type);

    if (model === 'chatconversation') {
      const isCurrentProspect = (state.lead.chat_prospects || []).find(el => el.id === data.prospect);
      if (!isCurrentProspect) return state;
    }

    if (model === 'roommates') {
      let communicationList = state.communications;
      (data as RoommateProps[]).forEach((el) => {
        communicationList = mergeCommunications(communicationList, model, el, state.communicationFilterType, state.communicationSearchKeyword);
      });

      return ({
        ...state,
        communications: communicationList,
        isCommunicationUpdate: !state.isCommunicationUpdate,
      });
    }

    const leadData = model === 'lead' ? extractUpdatedLead(data) : {};
    const newCommunications = mergeCommunications(state.communications, model, data, state.communicationFilterType, state.communicationSearchKeyword);
    const isAdded = model !== 'notedelete' ? newCommunications.length !== state.communications.length : false;

    return ({
      ...state,
      ...leadData,
      communications: newCommunications,
      isCommunicationUpdate: isAdded ? !state.isCommunicationUpdate : state.isCommunicationUpdate,
    });
  }

  if (actionMap[action.type]) {
    if (action.type !== 'PUSHER_CREATE_RECORD' && action.type.includes('PUSHER_') && !['lead', 'note'].includes(action.pusherModel)) {
      return state;
    }
    return actionMap[action.type](state, action);
  }

  return state;
};
