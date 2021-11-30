import { actions } from 'dwell/constants';

interface PusherRow {
  type: string,
  lead_owner: string,
}

interface ActionPusher {
  type: string,
  row?: PusherRow,
  pusherModel?: string,
}

export default {
  pusherCreateRecord: (pusherModel: string, row: PusherRow): ActionPusher => ({
    type: actions.PUSHER_CREATE_RECORD,
    row,
    pusherModel,
  }),
  pusherUpdateRecord: (pusherModel: string, row: PusherRow): ActionPusher => ({
    type: actions.PUSHER_UPDATE_RECORD,
    row,
    pusherModel,
  }),
  pusherDeleteRecord: (pusherModel: string, row: PusherRow): ActionPusher => ({
    type: actions.PUSHER_DELETE_RECORD,
    row,
    pusherModel,
  }),
  pusherClear: (): ActionPusher => ({
    type: actions.PUSHER_CLEAR,
  }),
  pusherClearText: (): ActionPusher => ({
    type: actions.PUSHER_CLEAR_TEXT,
  }),
};
