import axios from 'axios';
import { Dispatch } from 'redux';
import moment from 'moment';

import {
  actions,
  LAST_ACTIVITY_DATE,
  LOGGED_ACCOUNT,
  NOTIFICATION_NOT_REQUIRED_REQUESTS,
  RECENT_PROPERTY_HYPHENS,
} from 'dwell/constants';
import { toastOptions, toastError } from 'site/constants';
import authentication from 'dwell/actions/authentication';
import { toast, ToastOptions } from 'react-toastify';
import { getPropertyId } from 'src/utils';

const requestException = [actions.LOGIN_REQUEST];

const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i += 1) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (`${name}=`)) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const sendToastNotification = (toastType: string, requestType: string, errorMessage?: string): void => {
  if (!['UPDATE', 'CREATE', 'DELETE', 'SEND', 'ARCHIVE', 'MERGE', 'SHARE', 'TRANSFER', 'SAVE', 'COMPLETE'].includes(requestType.split('_')[0]) || requestType.split('_')[1] === 'NOTIFICATION') return;
  if (['UPDATE_CHAT_REPORT_MESSAGE_BY_ID_SUCCESS', 'UPDATE_CHAT_REPORT_EVALUATION_BY_ID_SUCCESS', 'CHANGE_EVALUATION_REPORT_SUCCESS'].includes(requestType)) return;
  if (toastType === 'success') {
    const substring = requestType.substr(0, requestType.lastIndexOf('_')).toLowerCase();
    const action = substring.split('_')[0];
    let model = substring.substr(action.length + 1, substring.length - action.length - 1).replace(/_/g, ' ');
    if (model === 'leads filter') model = 'filter';
    let message = `${model.charAt(0).toUpperCase()}${model.slice(1)} ${action}`;

    switch (requestType.split('_')[0]) {
      case 'UPDATE': {
        if (model === 'columns') message = 'Pipeline table updated';
        else message = message.replace('update', 'updated');
        break;
      }
      case 'CREATE': {
        if (model === 'columns') message = 'Pipeline table updated';
        else {
          message = message.replace('create', 'created');
          message = `New ${message.toLowerCase()}`;
        }
        break;
      }
      case 'DELETE': {
        message = message.replace('delete', 'deleted').replace('!', '');
        break;
      }
      case 'SEND': {
        message = message.replace('send', 'sent');
        break;
      }
      case 'ARCHIVE': {
        if (model === 'email') message = 'Message archived';
        else message = message.replace('archive', 'archived');
        break;
      }
      case 'MERGE': {
        message = message.replace('merge', 'merged');
        break;
      }
      case 'SHARE': {
        message = message.replace('share', 'shared');
        break;
      }
      case 'TRANSFER': {
        message = message.replace('transfer', 'transferred');
        break;
      }
      case 'SAVE': {
        message = message.replace('save', 'saved');
        break;
      }
      case 'COMPLETE': {
        message = message.replace('complete', 'completed');
        break;
      }
      default: break;
    }
    toast.success(message, toastOptions as ToastOptions);
  }
  if (toastType === 'failure') {
    toast.error(errorMessage, toastError as ToastOptions);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export default () => ({ dispatch, getState }: any) => (next: Dispatch<void>) => (action: any): any => {
  if (typeof action === 'function') {
    return action(dispatch, getState);
  }
  const callAPIAction = action[actions.CALL_API];
  if (typeof callAPIAction === 'undefined' || !callAPIAction.promise) {
    return next(action);
  }

  const { promise, types, successCB, failureCB, ...rest } = callAPIAction;
  const [REQUEST, SUCCESS, FAILURE] = types;

  const token = JSON.parse(localStorage.getItem(LOGGED_ACCOUNT)) || {};
  const csrftoken = getCookie('csrftoken');
  const headers = token.access ? { Authorization: `Bearer ${token.access}` } : null;
  const xName = getPropertyId() === 'compete' ? localStorage.getItem(RECENT_PROPERTY_HYPHENS) : getPropertyId() || localStorage.getItem(RECENT_PROPERTY_HYPHENS);

  if (headers) {
    headers['X-CSRFToken'] = csrftoken;
    if (xName && !requestException.includes(REQUEST)) headers['X-Name'] = xName;
  }

  next({ ...rest, type: REQUEST });
  localStorage.setItem(LAST_ACTIVITY_DATE, moment().toDate().toString());

  return promise(axios.create({ headers, baseURL: window.crmApp.config.crmHost }), dispatch)
    .then(
      (result) => {
        if (successCB) successCB(result);
        if (!NOTIFICATION_NOT_REQUIRED_REQUESTS.includes(REQUEST) && !successCB) sendToastNotification('success', SUCCESS);
        setTimeout(() => Promise.resolve(), 500);
        return next({ ...rest, result, type: SUCCESS });
      },
      (error) => {
        if (!NOTIFICATION_NOT_REQUIRED_REQUESTS.includes(REQUEST) && error.response && error.response.status !== 401 && !axios.isCancel(error)) {
          const errorMessage = typeof error.response.data === 'string'
            ? error.message
            : Object.values(error.response.data).reduce<string[]>((acc: string[], val: string[]) => acc.concat(val), []).pop();
          sendToastNotification('failure', FAILURE, errorMessage);
        }
        if (failureCB) failureCB(error.response.data);
        next({ ...rest, error, type: FAILURE });
        const authError = error.response && error.response.status === 401;
        if (authError && REQUEST !== actions.LOGIN_REQUEST) {
          return dispatch(authentication.sessionTimeout());
        }
        return authError ? null : Promise.reject(error);
      },
    );
};
