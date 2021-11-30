import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/browser';
import 'src/polyfill';
import App from 'src/App';
import PusherManager from 'src/pusher';

const { config } = window.crmApp;
if (config.sentryDsn) Sentry.init({ dsn: config.sentryDsn });
if (config.pusherKey && config.pusherCluster) {
  const pusher = new PusherManager(config.pusherKey, config.pusherCluster);
  pusher.initializePusher(['smscontent', 'notification', 'lead', 'roommate', 'note', 'task', 'emailmessage', 'call', 'leadsfilter', 'column', 'report', 'chatprospect', 'chatconversation', 'agentrequest']);
}

ReactDOM.render(<App />, document.getElementById('root'));
