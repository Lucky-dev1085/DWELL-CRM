import styled from 'styled-components';
import { FlexCenter } from 'styles/common';

export const NotificationBell = styled.div`
    position: relative;
    font-size: 20px;
    color: ${props => props.theme.colors.colortx01};
    outline: none;
    text-decoration: none;
    cursor: pointer;
    margin-top: 5px;
    display: block;
    margin-left: 12px;


    &:after {
      content: '${props => props.unread}';
      display: ${props => (props.unread ? 'flex' : 'none')};
      position: absolute;
      color: #fff;
      top: -3px;
      right: -3px;
      width: 14px;
      height: 14px;
      border-radius: 100%;
      background-color: #f3505c;
      box-shadow: 0 0 0 1.5px #fff;
      align-items: center;
      justify-content: center;
      font-size: 9px;
    }
`;

export const DropdownMenuStyles = {
  border: 'none',
  borderRadius: '8px',
  boxShadow: '2px 5px 45px rgba(36,55,130,0.12), ' +
    '0 1px 2px rgba(225,230,247,0.07), ' +
    '0 2px 4px rgba(225,230,247,0.07), ' +
    '0 4px 8px rgba(225,230,247,0.07), ' +
    '0 8px 16px rgba(225,230,247,0.07), ' +
    '0 16px 32px rgba(225,230,247,0.07), ' +
    '0 32px 64px rgba(225,230,247,0.07)',
};

export const notifDropdownMenuStyles = {
  ...DropdownMenuStyles,
  overflowY: 'hidden',
  maxHeight: 'none',
  width: '420px',
  marginTop: '11px',
  left: '10px',
  paddingTop: '.5rem',
  zIndex: 1020,
};

export const NotificationsNumber = styled.span`
    font-weight: 400;
    font-size: 12px;
    font-family: "Helvetica Neue",Arial,sans-serif;
    color: #929eb9;
    min-width: 18px;
    min-height: 18px;
    padding:0 2px;
    align-items: center;
    justify-content: center;
    display: inline;
    flex-shrink: 0;
    border-radius: 100%;
    border: 1.5px solid #fff;
    border-left-color: #c1c8de;
    border-right-color: #c1c8de;
    margin-left: 5px;
`;

export const NotificationsDropdownHeader = styled.div`
  padding: 7px 0 15px;
  margin-left: 20px;
  margin-right: 20px;
  margin-top:11px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const NotificationsDropdownTitle = styled.h6`
  margin-bottom: 0;
  font-weight: 600;
  font-size: 15px;
  color: ${props => props.theme.colors.colortx01};
`;

export const NotificationsDropdownActions = styled.div`
  margin: 0 20px;
  padding: 10px 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const LinkButton = styled.span`
  text-decoration: none;
  background-color: transparent;
  color: ${props => props.theme.colors.colorui01};
  font-size: 13px;
  cursor: pointer;

  &:hover {
    color: ${props => props.theme.colors.colorui02};
    box-shadow: none;
  }
`;

export const NotificationList = styled.div`
    max-height: 510px;
    overflow-y: auto;
    padding-top: ${props => (props?.notifications?.length === 1 ? '15px' : '0px')};
`;

export const MoreButton = styled.a`
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translate(-50%);
    padding: 0 15px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    background-color: #fff;
    border: 1px solid #d5dcf4;
    border-radius: 20px;
    color: #4a5e8a;
    cursor: pointer;
`;

export const NotificationWrapper = styled.div`
  outline: none;
  border-width: 0;
  padding: 10px 20px;
  border-radius: 0;
  display: flex;
  position: relative;
  background-color: #fff;
  min-height: 72px;
  margin: 2px 0;
  background-color: ${props => (props.notification.is_read ? '#ffffff' : 'aliceblue')};

  &:hover {
    background-color: ${props => props.theme.colors.bodyBg};
  }

  &:last-child {
    > div:after {
        content: '';
        position: absolute;
        top: 69px;
        left: 20px;
        right: 20px;
        border-top: 1px solid #f0f2f9;
    }
  }
`;

export const NotificationEmpty = styled.div`
    background: white;
    ${FlexCenter}
    font-size: 14px;
    min-height: 150px;
    height: 160px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #929eb9;
    background-color: #f7f8fc;
    margin: -1px 20px 20px;
    .ri-checkbox-multiple-fill{
      line-height: 1;
      font-size: 32px;
      font-weight: 300;
      display: block !important;
      margin-bottom: 10px;
    }
`;
