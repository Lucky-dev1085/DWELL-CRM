import React, { FC, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import TimeAgo from 'react-timeago';
import moment from 'moment';
import actions from 'dwell/actions/index';
import { notificationTypes, notificationIcons } from 'dwell/constants';
import { Tooltip } from 'reactstrap';
import styled from 'styled-components';
import { DetailResponse, SuccessResponse } from 'src/interfaces';

const Notification = styled.div`
  display: flex;
  cursor: pointer;
  width: 100%;
  background: 'red';

  opacity: ${props => (props.toHide ? 0 : 1)};
  transition: opacity 0.5s;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 20px;
    right: 20px;
    border-top: 1px solid #f0f2f9;
  }
  &:hover .notify-clear{
    opacity:1;
    visibility:visible;
  }
`;

const NotificationBody = styled.div`
  margin-left: 12px;
  flex: 1;
  overflow: hidden;

   &:hover .notify-clear:hover{
    color: #0468fa;
    border-color: #0468fa;
  }
`;

const NotificationTime = styled.span`
  font-size: 11px;
  font-weight: 400;
  font-family: "Helvetica Neue",Arial,sans-serif;
  color: ${props => props.theme.colors.colortx03};
`;

const NotificationTitle = styled.h6`
  font-weight: 500;
  font-size: 13px;
  color: ${props => props.theme.colors.colortx01};
  margin-bottom: 3px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NotificationMessage = styled.p`
  margin-bottom: 0;
  color: ${props => props.theme.colors.colortx03};
  font-size: 13px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  background-color: ${props => props.theme.colors.colorbg02};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  position: relative;

  i {
    font-size: 20px;
    line-height: 1;
    color: ${props => props.theme.colors.colortx02};
  }
`;

const NotificationClear = styled.a`
    opacity: 0;
    visibility: hidden;
    position: absolute;
    bottom: calc(50% - 20px);
    right: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: #fff;
    border: 1px solid #d5dcf4;
    border-radius: 100%;
    color: #929eb9;
    font-size: 18px;
    font-weight: 600;
    transition: all 0.2s;
    box-shadow: 0 0 5px rgb(173 186 233 / 30%);
`;

interface NotificationProps {
  is_read: boolean,
  id: number,
  type: string,
  redirect_url: string,
  object_id: string,
  content: string,
  created: string,
}

interface NotificationDetailProps extends RouteComponentProps {
  onUpdate: (isUpdated: boolean) => void,
  updateNotificationById: (id: number, data: { is_read: boolean, is_display: boolean }) => Promise<DetailResponse>,
  notification: NotificationProps,
  setChatType: (type: string) => void,
  updateNotificationRedirection: (isRedirect: boolean) => void,
  setChatMinimiseStatus: (isMinimized: boolean) => void,
  notificationsArray: NotificationProps[],
  isChatMinimized: boolean,
  bulkClearNotifications: (data: { ids: number[] }) => Promise<SuccessResponse>,
  getNotifications: () => void,
  currentContact: number,
  contacts: { id: number }[],
  setChatAsActive: (contact: { id: number, isSMS: boolean, isSingleChat: boolean }) => null,
}

const NotificationDetail: FC<NotificationDetailProps> = (props) => {
  const [hovered, setHovered] = useState(false);
  const [hideCurr, setHideCurr] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleUpdateSuccess = () => {
    const { onUpdate } = props;
    setTimeout(() => {
      onUpdate(true);
    }, 500);
  };

  const redirectAndUpdate = (event) => {
    let toHide = false;
    const { history: { push }, updateNotificationById, notification, setChatType,
      setChatAsActive, updateNotificationRedirection, setChatMinimiseStatus,
      notificationsArray, isChatMinimized, bulkClearNotifications, getNotifications, currentContact, contacts } = props;
    if (event?.target?.className !== 'ri-close-fill' && !event?.target?.className.includes('notify-clear')) {
      if (notification.redirect_url && notification.type === 'NEW_SMS') {
        const leadId = parseInt(notification.redirect_url.split('/').pop(), 10);
        const contact = contacts.find(c => c.id === leadId);
        if (contact) {
          setChatAsActive({ id: contact.id, isSMS: true, isSingleChat: true });
          updateNotificationRedirection(true);
          setChatType('sms');
          if (isChatMinimized) {
            const notificationArray = [];
            notificationsArray.forEach((data) => {
              if (data.redirect_url && parseInt(data.redirect_url.split('/').pop(), 10) === currentContact) notificationArray.push(data.id);
            });
            bulkClearNotifications({ ids: notificationArray }).then(() => {
              getNotifications();
            });
            setChatMinimiseStatus(false);
          }
        }
      } else if (notification.redirect_url) push(notification.redirect_url);
    } else {
      toHide = true;
    }
    updateNotificationById(notification.id, { is_read: true, is_display: !toHide })
      .then(() => {
        handleUpdateSuccess();
        setHideCurr(toHide);
      });
  };

  const { notification: { content, created, type } } = props;
  return (
    <Notification notification={props.notification} toHide={hideCurr} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={e => redirectAndUpdate(e)}>
      <Avatar>
        <i className={notificationIcons[type]} />
      </Avatar>
      <NotificationBody>
        <NotificationTitle>
          {notificationTypes.NOTIFICATION_TYPES[type]}
          <NotificationTime> { !hovered ? <TimeAgo date={moment(created).local()} /> : `${moment(created).local().format('MMM D, YY h:mm a')}` }</NotificationTime>
        </NotificationTitle>
        <NotificationClear className="notify-clear" id={`notify-clear-${props.notification.id}`}><i className="ri-close-fill" />
          <Tooltip trigger="hover" placement="top" fade={false} target={`notify-clear-${props.notification.id}`} isOpen={tooltipVisible} toggle={() => setTooltipVisible(!tooltipVisible)}>
            Clear
          </Tooltip>
        </NotificationClear>
        <NotificationMessage dangerouslySetInnerHTML={{ __html: content }} />
      </NotificationBody>
    </Notification>
  );
};

const mapStateToProps = state => ({
  contacts: state.smsMessage.contacts,
});

export default connect(
  mapStateToProps,
  {
    ...actions.notification,
    ...actions.smsMessage,
    ...actions.prospectChat,
    ...actions.nylas,
  },
)(withRouter(NotificationDetail));
