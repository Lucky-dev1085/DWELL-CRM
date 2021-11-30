import styled, { css, keyframes } from 'styled-components';
import { Button, ToastBody } from 'reactstrap';

export const ChatBox = styled.div`
    width: 220px;
    position: fixed;
    bottom: 0;
    right: 20px;
    z-index: 1001;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;

    ${props => props.active && css`
        width: 700px;
        & > div:first-child {
            height: 50px;
            &::after {
                content: '${props.active ? '\\F1AE' : '\\ED9B'}';
                font-size: ${props.active ? '16px' : '14px'};
            }
        }
        & > div:last-child {
            display: flex;
        }
    `}
`;

export const blinker = keyframes`
  0% {
    background: #f7f8fc;
  }
  50% {
    background: #0168fa;
  }
  100% {
    background: #f7f8fc;
  }
`;

const blinkerIcon = keyframes`
  0% {
    color: #8392a5;
  }
  50% {
    color: #fff;
  }
  100% {
    color: #8392a5;
  }
`;

const blinkerAfter = keyframes`
  0% {
        color: #1b2e4b;
  }
  50% {
        color: #fff;
  }
  100% {
        color: #1b2e4b;
  }
`;

const blinkerText = keyframes`
  0% {
        color: #0b2151;
  }
  50% {
        color: #fff;
  }
  100% {
        color: #0b2151;
  }
`;

export const ChatHeader = styled.div`
    border: 1px solid ${props => props.theme.input.borderColor};
    border-bottom-width: 0;
    background-color: ${props => props.theme.colors.gray100};
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 15px;
    position: relative;

    &:hover, &:focus {
        cursor: pointer;
    }

    &::after {
        content: '\\ED9B';
        font-family: 'remixicon';
        position: absolute;
        top: 50%;
        right: 13px;
        line-height: 0;
        color: ${props => props.theme.colors.colortx02};
    }

    i {
        font-size: 18px;
        line-height: .7;
        color: ${props => props.theme.colors.colortx03};
        margin-right: 5px;
    }

    h6 {
        margin-bottom: 0;
        color: ${props => props.theme.colors.colortx01};
    }

    ${props => (props.isBlinking && css`
        animation: ${blinker} 1s linear;

        &::after {
            animation: ${blinkerAfter} 1s linear;
        }

        i {
            animation: ${blinkerIcon} 1s linear;
        }

        h6 {
            animation: ${blinkerText} 1s linear;
        }
    `)}
`;

export const ChatBody = styled.div`
    height: calc(100% - (62px + 43px));
    overflow: hidden;
    position: relative;
`;

export const ChatNavBar = styled.div`
    flex-shrink: 0;
    width: 54px;
    border-right: 1px solid ${props => props.theme.colors.colorbg02};
    nav {
        padding: 25px 0 20px;
        flex-direction: column;
        align-items: center;
        height: 100%;
    }
`;

export const NavLink = styled.a`
    padding: 0;
    color: ${props => (props.active ? props.theme.colors.colorui01 : props.theme.colors.colortx03)} !important;
    position: relative;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
    cursor: pointer;

    &:hover, &:focus {
        ${props => !props.active && css`
            color: ${props.theme.colors.colortx01} !important;
        `}
    }

    i {
        font-size: 24px;
        line-height: 1;
    }

    span {
        position: absolute;
        top: -5px;
        right: -5px;
        background-color: ${props => props.theme.colors.red};
        color: ${props => props.theme.colors.white};
        font-size: 9px;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 100%;
        box-shadow: 0 0 0 1px #fff;
        padding-bottom: .5px;
    }

    &:last-child {
        margin-top: 20px;
    }
`;

export const ChatGroup = styled.div`
    position: fixed;
    bottom: 0;
    right: 80px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    flex-direction: row-reverse;
    z-index: 1010;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;

export const NotificationHeader = styled.div`
    display: flex;
    align-items: center;
    padding: .25rem .75rem;
    color: #657697;
    background-color: rgba(255,255,255,0.85);
    background-clip: padding-box;
    border-bottom: 1px solid rgba(0,0,0,0.05);
    font-size: 14px !important;

    i {
      font-size: 14px;
    }
`;

export const NotificationType = styled.strong`
    margin-left: 5px;
    margin-right: auto !important;
    font-size: 14px;
`;

export const NotificationTime = styled.small`
    margin-left: 5px;
    margin-right: auto !important;
`;

export const NotificationBody = styled(ToastBody)`
    padding: .75rem !important;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-evenly;
`;

export const NotificationProspect = styled.h6`
    padding: .75rem !important;
    background-color: white;
`;

export const NotificationButton = styled(Button)`
    width: 100%;
`;

export const WhiteButton = styled(NotificationButton)`
    background-color: #fff;
    border-color: #d5dcf4;
    color: #4a5e8a;

    &:hover {
      color: #4a5e8a;
    }
`;

export const NotificationActions = styled.div`
    width: 100%;

    .btn-primary {
        margin-right: 0.5rem;
    }
`;

export const NotificationsWrapper = styled.div`
    position: fixed;
    top: 60px;
    right: 1rem;
    z-index: 1000;
    height: calc(100vh - 60px - 5px);
    display: flex;
    max-width: 100vw;

    > div {
        direction: rtl;
        flex-direction: column;
        display: flex;
        flex-wrap: wrap;
    }
`;
