import React, { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Toast } from 'reactstrap';
import actions from 'dwell/actions';
import moment from 'moment';
import 'src/scss/pages/_modal_notification.scss';
import 'src/scss/pages/_quick_actions.scss';
import TimeAgo from 'react-timeago';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import {
  NotificationActions,
  NotificationBody,
  NotificationButton,
  NotificationHeader,
  NotificationType,
  WhiteButton,
} from 'dwell/views/chat/single_chat/styles';

const formatter = buildFormatter({
  prefixAgo: null,
  prefixFromNow: null,
  suffixAgo: 'ago',
  suffixFromNow: '',
  seconds: '%d seconds',
  minute: '1 min',
  minutes: '%d mins',
  hour: '1 hour',
  hours: '%d hours',
  day: '1 day',
  days: '%d days',
  month: '1 month',
  months: '%d months',
  year: '1 year',
  years: '%d years',
  wordSeparator: ' ',
  numbers: [],
});

interface ModalNotificationProps {
  showingNotification: boolean,
  type: string,
  unreadCount: number,
  messageDate: string,
  prospectName: string,
  prospectId: number,
  handleClose: () => void,
  viewMessage: () => void,
  decline: () => void,
  joinChat: () => void,
  timeout: number,
  message: string,
}

const ModalNotification: FC<ModalNotificationProps> = ({ showingNotification, type, unreadCount,
  message, messageDate, prospectName, prospectId,
  handleClose, viewMessage, joinChat, decline, timeout = 30 }) => {
  const id = `modal-notification-${prospectId}-${type === 'NEW_MESSAGE' ? 'prospect-message' : 'agent-request'}`;
  const [timeId, setTimeId] = useState(null);
  useEffect(() => {
    const currentTime = moment();
    const difference = currentTime.diff(moment(messageDate), 'seconds');
    if (difference < timeout) {
      const seconds = moment.duration(moment().diff(moment(messageDate))).asSeconds();
      if (timeId) clearTimeout(timeId);
      setTimeId(setTimeout(() => handleClose(), (timeout - seconds) * 1000));
    } else {
      handleClose();
    }
  }, [messageDate]);

  return (
    <Toast
      isOpen={showingNotification}
      aria-labelledby="example-custom-modal-styling-title"
      id={id}
      className={type === 'NEW_MESSAGE' ? 'prospect-message' : 'agent-request'}
    >
      <NotificationHeader>
        <i className="ri-question-answer-fill" />
        <NotificationType>
          {type === 'NEW_MESSAGE' ? `${unreadCount > 1 ? `${unreadCount} New Chat Messages` : 'New Chat Message'}` : 'Agent Transfer Request'}
        </NotificationType>
        <small>
          <TimeAgo
            title={moment(messageDate).format('YYYY-MM-DD HH:mm')}
            date={moment(messageDate).local()}
            formatter={formatter}
          />
        </small>
        <button className="close ml-2 mb-1" onClick={() => handleClose()}>&times;</button>
      </NotificationHeader>
      <NotificationBody>
        <h6>{prospectName}</h6>
        {type === 'NEW_MESSAGE' && <p>{message}</p>}
        {type === 'NEW_MESSAGE' ? <NotificationButton color="primary" onClick={() => viewMessage()}>View Message</NotificationButton> :
          <NotificationActions className="d-flex align-items-center justify-content-between">
            <NotificationButton color="primary" onClick={() => joinChat()}>Join Chat</NotificationButton>
            <WhiteButton color="white" onClick={() => decline()}>Decline</WhiteButton>
          </NotificationActions>}
      </NotificationBody>
    </Toast>
  );
};

export default connect(
  null,
  {
    ...actions.prospectChat,
  },
)(ModalNotification);
