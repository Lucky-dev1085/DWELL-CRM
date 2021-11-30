import React, { FC, useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap';
import { isEmpty } from 'lodash';
import actions from 'dwell/actions/index';
import { notificationTypes } from 'dwell/constants';
import { DetailResponse, SuccessResponse } from 'src/interfaces';
import moment from 'moment';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import NotificationDetail from './_notificationDetails';
import { NotificationBell, notifDropdownMenuStyles, LinkButton, NotificationEmpty, NotificationList,
  NotificationsDropdownHeader, NotificationsDropdownTitle, NotificationWrapper, NotificationsNumber, MoreButton } from './styles';

interface NotificationProps extends RouteComponentProps {
  isChatMinimized: boolean,
  notifications: { is_read: boolean, is_display: boolean, id: number, created: string }[],
  pushNotification: { type: string, lead_owner: string },
  currentUserData: { email: string },
  currentContact: number,
  getNotifications: () => void,
  setChatAsActive: (contact: { id: number, isSMS: boolean, isSingleChat: boolean }) => null,
  setChatMinimiseStatus: (minimized: boolean) => void,
  setChatType: (type: string) => void,
  updateNotificationById: (id: number, data: { is_read: boolean }) => Promise<DetailResponse>,
  clearAllNotifications: () => Promise<SuccessResponse>,
  readAllNotifications: () => Promise<SuccessResponse>,
}

const Notifications: FC<NotificationProps> = (props) => {
  const { setChatType, isChatMinimized, notifications, pushNotification, currentUserData, currentContact,
    setChatAsActive, setChatMinimiseStatus } = props;
  const [dropdownOpen, setDropdownState] = useState(false);
  const [notificationToDisplay, setNotificationToDisplay] = useState([]);
  const notificationListRef = useRef(null);
  const [remainingItems, setRemainingItems] = useState(0);
  const [showMore, setShowMore] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState<number>();

  const handleUpdate = (isUpdated) => {
    const { getNotifications } = props;
    if (isUpdated) {
      getNotifications();
    }
  };
  const sendNotification = (pushNotif) => {
    const options = {
      body: pushNotif.content.replace(/(<([^>]+)>)/g, ''),
      requireInteraction: true,
    };
    const notification = new Notification(notificationTypes.NOTIFICATION_TYPES[pushNotif.type], options);
    notification.onclick = () => {
      const { history: { push }, updateNotificationById } = props;
      updateNotificationById(pushNotif.id, { is_read: true }).then(() => handleUpdate(true));
      window.focus();
      if (pushNotif.type === 'NEW_SMS') {
        setChatAsActive({ id: parseInt(pushNotif.redirect_url.split('/').pop(), 10), isSMS: true, isSingleChat: true });
        setChatMinimiseStatus(false);
        setChatType('sms');
      } else {
        push(pushNotif.redirect_url, pushNotif.type === 'TEAM_MENTION' ? { tab: 'notes' } : null);
        window.location.reload();
      }
    };
  };

  const notificationsScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = notificationListRef.current;
    const hiddenItems = Math.floor((scrollHeight - (scrollTop + clientHeight)) / 76);
    setRemainingItems(hiddenItems);
    if (scrollTop + clientHeight === scrollHeight) {
      setShowMore(false);
    }
  };

  const scrollToBottom = () => {
    const element = notificationListRef.current;
    element.scrollTo({ left: 0, top: element.scrollHeight, behavior: 'smooth' });
    setShowMore(false);
  };

  useEffect(() => {
    const targetElement = notificationListRef.current;
    if (dropdownOpen && targetElement) {
      disableBodyScroll(targetElement);
    } else {
      clearAllBodyScrollLocks();
      setShowMore(true);
    }
  }, [dropdownOpen]);

  useEffect(() => {
    const targetElement = notificationListRef.current;
    if (targetElement && dropdownOpen) {
      notificationsScroll();
    }
  }, [notificationListRef?.current?.scrollHeight, dropdownOpen, notifications, notificationToDisplay]);
  useEffect(() => {
    if (!isEmpty(pushNotification) && typeof Notification !== 'undefined') {
      handleUpdate(true);
      if (pushNotification.type === 'NEW_SMS' && currentUserData.email !== pushNotification.lead_owner) return;
      if (document.visibilityState === 'visible') return;
      if (Notification.permission === 'granted') {
        sendNotification(pushNotification);
      } else {
        Promise.resolve(Notification.requestPermission()).then((permission) => {
          if (permission === 'granted') {
            sendNotification(pushNotification);
          }
        });
      }
    }
  }, [pushNotification]);

  useEffect(() => {
    setNotificationToDisplay(notifications.filter(n => n.is_display && !moment(n.created).isBefore(moment().subtract(7, 'days'))));
  }, [notifications]);

  useEffect(() => {
    setUnreadNotifications(notificationToDisplay.filter(n => !n.is_read).length);
  }, [notificationToDisplay]);

  const markAllNotificationsAsRead = () => {
    const { readAllNotifications } = props;
    readAllNotifications()
      .then(() =>
        setTimeout(() => handleUpdate(true), 500));
  };

  return (
    <Dropdown isOpen={dropdownOpen} toggle={() => setDropdownState(!dropdownOpen)}>
      <NotificationBell
        onClick={() => setDropdownState(!dropdownOpen)}
        unread={unreadNotifications}
      >
        <DropdownToggle
          tag="span"
          data-toggle="dropdown"
          aria-expanded={dropdownOpen}
        >
          <i className="ri-notification-3-line" />
        </DropdownToggle>
      </NotificationBell>
      <DropdownMenu
        modifiers={{
          setWidth: {
            enabled: true,
            fn: data => ({
              ...data,
              styles: {
                ...data.styles,
                ...notifDropdownMenuStyles,
              },
            }),
          },
        }}
        right
      >
        <NotificationsDropdownHeader header className="header" tag="div">
          <NotificationsDropdownTitle className="title">
            Notifications
            {!!unreadNotifications && <NotificationsNumber>{unreadNotifications}</NotificationsNumber>}
          </NotificationsDropdownTitle>
          {!!unreadNotifications && <LinkButton onClick={markAllNotificationsAsRead}>Mark All Read</LinkButton>}
        </NotificationsDropdownHeader>
        {!isEmpty(notificationToDisplay) ? (
          <>
            <NotificationList ref={notificationListRef} notifications={notificationToDisplay} onScroll={() => notificationsScroll()}>
              {notificationToDisplay.map(notification => (
                <NotificationWrapper key={notification.id} notification={notification} >
                  <NotificationDetail
                    notification={notification}
                    onUpdate={handleUpdate}
                    notificationsArray={notificationToDisplay}
                    isChatMinimized={isChatMinimized}
                    currentContact={currentContact}
                  />
                </NotificationWrapper>))}
            </NotificationList>
            { (showMore && remainingItems > 0) &&
                <MoreButton onClick={scrollToBottom}>
                  <i className="ri-arrow-down-line" />
                  <span>  {remainingItems} more</span>
                </MoreButton>
            }
          </>
        ) :
          (
            <NotificationEmpty>
              <i className="ri-checkbox-multiple-fill" />
              <span>No new notifications</span>
            </NotificationEmpty>
          )
        }
      </DropdownMenu>
    </Dropdown>
  );
};

const mapStateToProps = state => ({
  notifications: state.notification.notifications,
  pushNotification: state.pusher.pushNotification,
  pusherModel: state.pusher.pusherModel,
  currentUserData: state.user.currentUser,
  isChatMinimized: state.prospectChat.isChatMinimized,
  currentContact: state.smsMessage.currentContact,
});

export default connect(
  mapStateToProps,
  {
    ...actions.notification,
    ...actions.smsMessage,
    ...actions.prospectChat,
    ...actions.nylas,
    ...actions.pusher,
  },
)(withRouter(Notifications));
