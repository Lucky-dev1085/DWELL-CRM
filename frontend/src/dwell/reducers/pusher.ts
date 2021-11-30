import { actions } from 'dwell/constants';
import { PusherState, PusherActionTypes } from 'src/interfaces';

const initialState: PusherState = {
  pusherModel: '',
  pushNotification: {} as { type: string, lead_owner: string },
  pushLead: {} as { id: number }[],
  pushEmail: {} as { id: number }[],
  pushReport: {} as { id: number }[],
};

const getObjectName = (pusherModel) => {
  switch (pusherModel) {
    case 'roommate': return 'pushRoommate';
    case 'lead': return 'pushLead';
    case 'emailmessage': return 'pushEmail';
    case 'report': return 'pushReport';
    default: return null;
  }
};

export default (state = initialState, action: PusherActionTypes): PusherState => {
  if ([actions.PUSHER_CREATE_RECORD, actions.PUSHER_UPDATE_RECORD, actions.PUSHER_DELETE_RECORD].includes(action.type)) {
    return action.pusherModel === 'notification' ?
      ({ ...state, pusherModel: action.pusherModel, pushNotification: action.row }) :
      ({ ...state, pusherModel: action.pusherModel, [getObjectName(action.pusherModel)]: action.row });
  }

  if (action.type === actions.PUSHER_CLEAR_TEXT) {
    return initialState;
  }

  return state;
};
