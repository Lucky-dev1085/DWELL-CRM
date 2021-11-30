import { actions } from 'dwell/constants';
import { orderBy, unionBy } from 'lodash';
import { RoommateProps, RoommateState, RoommateActionTypes } from 'src/interfaces';
import { isLeadPage, isLeadsObject } from './utils';

const initialState: RoommateState = {
  isSubmitting: false,
  errorMessage: null,
  roommates: [],
  roommate: {} as RoommateProps,
};

const actionMap = {
  [actions.GET_LEAD_BY_ID_SUCCESS]: (state, { result: { data } }) => ({ ...state, roommates: data.roommates }),

  [actions.UPDATE_ROOMMATES_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_ROOMMATES_SUCCESS]: (state, { result: { data } }) =>
    ({ ...state, isSubmitting: false, roommates: orderBy(data, ['updated'], ['desc']) }),
  [actions.UPDATE_ROOMMATES_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.DELETE_ROOMMATE_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.DELETE_ROOMMATE_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, roommates: state.roommates.filter(i => (i.id !== data.id)) }),
  [actions.DELETE_ROOMMATE_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.PUSHER_CREATE_RECORD]: (state, { row }) => {
    let newRoommates = state.roommates;
    if (isLeadPage() && isLeadsObject(row.lead)) {
      newRoommates = orderBy(unionBy([row], state.roommates, 'id'), ['updated'], ['desc']);
    }
    return { ...state, roommates: newRoommates };
  },
  [actions.PUSHER_UPDATE_RECORD]: (state, { row }) => {
    let newRoommates = state.roommates;
    if (isLeadPage() && isLeadsObject(row.lead)) {
      newRoommates = orderBy(unionBy([row], state.roommates, 'id'), ['updated'], ['desc']);
    }
    return { ...state, roommates: newRoommates, roommate: state.roommate.id === row.id ? row : state.roommate };
  },
  [actions.PUSHER_DELETE_RECORD]: (state, { row }) => {
    let newRoommates = state.roommates;
    if (isLeadPage() && isLeadsObject(row.id.lead)) {
      newRoommates = state.roommates.filter(o => o.id.toString() !== row.id.toString());
    }
    return { ...state, roommates: newRoommates };
  },
};

export default (state = initialState, action: RoommateActionTypes): RoommateState => {
  if (actionMap[action.type]) {
    if (action.type.includes('PUSHER_') && action.pusherModel !== 'roommate') {
      return state;
    }
    return actionMap[action.type](state, action);
  }

  return state;
};
