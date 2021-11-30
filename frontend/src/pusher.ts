import Pusher from 'pusher-js';
import * as PusherTypes from 'pusher-js';
import actions from 'dwell/actions';
import { getPropertyId } from 'src/utils';
import store from './store';

const { pusher: { pusherCreateRecord, pusherUpdateRecord, pusherDeleteRecord } } = actions;

export default class PusherManager {
  pusher: PusherTypes.Pusher;

  constructor(pusherKey: string, pusherCluster: string) {
    this.pusher = new Pusher(pusherKey, { cluster: pusherCluster });
  }

  // --------------------------------------------------------------------------- PUSHER ACTIONS
  enablePusher = (pusherModel: string, id = null): void => {
    const externalId = getPropertyId();
    let channelName = id ? `private-user-${id}` : `private-property-${externalId}`;
    if (['chatprospect', 'chatconversation'].includes(pusherModel)) {
      channelName = 'private-chat';
    }
    let channel = this.pusher.channels.find(channelName);
    if (!channel) {
      channel = this.pusher.subscribe(channelName);
    }
    if (pusherModel) {
      channel.bind(`${pusherModel}_created`, row => store.dispatch(pusherCreateRecord(pusherModel, row)));
      channel.bind(`${pusherModel}_changed`, row => store.dispatch(pusherUpdateRecord(pusherModel, row)));
      channel.bind(`${pusherModel}_deleted`, row => store.dispatch(pusherDeleteRecord(pusherModel, row)));
      channel.bind('user_typing', row => store.dispatch(pusherUpdateRecord('typing', row)));
    }
  };

  initializePusher(pusherModels = [], id = null): void {
    pusherModels.forEach((model) => {
      this.enablePusher(model, id);
    });
  }
}
