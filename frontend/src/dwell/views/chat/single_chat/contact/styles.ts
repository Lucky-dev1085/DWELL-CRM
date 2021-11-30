import styled, { css, keyframes } from 'styled-components';
import { Spinner } from 'reactstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { hexToRgb } from 'dwell/constants';
import { shadowSharp, shadowDreamy } from 'src/styles/mixins';
import { EmptyContent as CommonEmptyContent, PrimaryButton } from 'styles/common';

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

export const blinkerText = keyframes`
  0% {
        color: #4a5e8a;
  }
  50% {
        color: #fff;
  }
  100% {
        color: #4a5e8a;
  }
`;

export const ChatBody = styled.div`
    height: calc(100% - (62px + 43px));
    overflow: hidden;
    position: relative;
`;

export const ChatPanelContainer = styled.div`
    width: 300px;
    height: calc(100vh - ${props => props.theme.templates.headerHeight} + 15px);
    max-height: 560px;
    background-color: #fff;
    border: 1px solid rgba(${props => hexToRgb(props.theme.colors.colorbg03)}, .5);
    border-bottom-width: 0;
    box-shadow: 0 0 35px rgba(${props => hexToRgb(props.theme.colors.colorbg03)}, .4);
    border-top-left-radius: ${props => props.theme.borders.radiusmd};
    border-top-right-radius: ${props => props.theme.borders.radiusmd};
    overflow: hidden;

    a {
        outline: none;
    }

    ${props => props.isMinmized && css`
        display: none;
    `}

    .nav-link {
        position relative;

        span {
            position: absolute;
            top: -8px;
            right: 5px;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: ${props => props.theme.colors.red};
            color: #fff;
            border-radius: 100%;
            font-size: 10px;
            font-weight: 400;
            // font-family: ${props => props.theme.fonts.numeric};
        }
    }
`;

export const ChatHeader = styled.div`
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: #fff;
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;

    .nav {
        background-color: #fff;
        border-radius: ${props => props.theme.borders.radius};
        margin-right: auto;
        height: 32px;
        box-shadow: inset 0 0 0 1.5px ${props => props.theme.input.borderColor};
    }

    .nav-link {
        height: 100%;
        padding: 0 20px;
        display: flex;
        align-items: center;
        font-size: ${props => props.theme.fontSizes.sm};
        color: ${props => props.theme.colors.colortx03};
        border: 1.5px solid transparent;
        font-weight: ${props => props.theme.fontWeights.medium};
        outline: none;
        cursor: pointer;

        &:first-child {
            border-top-left-radius: ${props => props.theme.borders.radius};
            border-bottom-left-radius: ${props => props.theme.borders.radius};
        }
        &:last-child {
            border-top-right-radius: ${props => props.theme.borders.radius};
            border-bottom-right-radius: ${props => props.theme.borders.radius};
        }
        &:hover, &:focus {
            color: ${props => props.theme.colors.colortx03};
        }

        &.active {
          background-color: #e7f1ff;
          color: ${props => props.theme.colors.colorui01};
          border-color: rgba(${props => hexToRgb(props.theme.colors.colorui01)}, .6);
        }

        + .nav-link { margin-left: -1.5px; }
    }
`;

export const ChatSubHeader = styled.div`
    padding: 0 15px 5px;
    display: flex;
    align-items: center;

    .dropdown {
        margin-left: 5px;
        .btn {
            cursor: pointer;
        }
    }

    .dropdown-menu {
        margin-top: 5px;
        border-color: rgba(${props => hexToRgb(props.theme.colors.colortx02)}, .16);
        border-radius: 5px;
        padding: 5px;
        min-width: 180px;
        ${props => shadowDreamy(props.theme.colors.colortx03)}
    }

    .dropdown-item {
        padding: 6px 10px;
        font-size: ${props => props.theme.fontSizes.sm};
        color: ${props => props.theme.colors.colortx02};
        border-radius: 4px;
        display: flex;
        align-items: center;
        position: relative;
        cursor: pointer;
        border: 0;

        &::before {
            content: '\\EB7A';
            font-family: 'remixicon';
            position: absolute;
            line-height: 0;
            top: 50%;
            right: 0;
            color: inherit;
            display: none;
        }

        &:hover, &:focus {
            background-color: ${props => props.theme.colors.colorbd01};
            color: ${props => props.theme.colors.colortx02};
        }

        i {
            font-size: 18px;
            line-height: 1;
            margin-right: 5px;
            opacity: .6;
        }

        &.active {
            background-color: transparent;
            color: ${props => props.theme.colors.colorui01};

            &::before {
               display: block;
            }
            i {
               opacity: 1;
               color: ${props => props.theme.colors.colorui01};
            }
        }
    }

    .btn {
        background-color: ${props => props.theme.colors.colorbg01};
        color: ${props => props.theme.colors.colortx03};
        border-width: 1.5px;

        // btn-icon
        width: 38px;
        height: 38px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            // background-color: darken(${props => props.theme.colors.colorbg01}, 2%);
            color: ${props => props.theme.colors.colortx03};
        }

        &:focus, &:active {
            box-shadow: none;
        }
    }
`;

export const ChatSearch = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    height: ${props => props.theme.templates.heightBase};
    border-radius: ${props => props.theme.borders.radiussm};
    background-color: ${props => props.theme.colors.colorbg01};
    border: 1.5px solid transparent;
    padding-left: 8px;

    i {
        font-size: 20px;
        color: ${props => props.theme.colors.colortx02};
        margin-right: 7px;
        opacity: .5;
    }

    ${props => props.onfocus && css`
        border-color: ${props.theme.input.borderColor};
        background-color: #fff;
        ${shadowSharp({ color: hexToRgb(props.theme.colors.colorbg01) })};

        i {
            opacity: .75;
        }

        .form-control::placeholder {
            opacity: 1;
        }
    `}

    .form-control {
        height: auto;
        padding: 0;
        border-width: 0;
        border-radius: 0;
        background-color: transparent;
        text-shadow: none;
        margin: 0;

        &:focus { box-shadow: none; }

        &::placeholder {
            color: ${props => props.theme.colors.colortx03};
            text-shadow: none;
            opacity: .75;
        }
    }
`;

export const ChatFilterDropdown = styled.div`
`;

export const ChatSpinner = styled.div`
    display: flex;
    justify-content: center;
    padding: 20px 0;
`;

export const SpinnerBorder = styled(Spinner)`
    width: 24px;
    height: 24px;
    border-width: 2px;
    border-color: ${props => props.theme.colors.gray500};
    border-right-color: transparent;
`;

export const ChatList = styled(PerfectScrollbar)`
    padding: 0 5px 5px;
    margin: 0;
    list-style: none;

    .ps__thumb-y {
        width: 2px;
    }

    .ps__rail-y {
        width: 4px;
        &:hover {
            .ps__thumb-y {
                width: 4px;
            }
        }
    }
`;

export const ChatListItem = styled.li`
    padding: 10px;
    display: flex;
    align-items: center;
    background-color: ${props => props.theme.colors.bodyBg};
    border-radius: ${props => props.theme.borders.radiussm};

    + .qc-list-item {
        margin-top: 1.5px;
    }

    &:hover, &:focus {
        background-color: ${props => props.theme.colors.colorbg01};
        cursor: pointer;

        .avatar::before {
            box-shadow: 0 0 0 1.5px ${props => props.theme.colors.bodyBg};
        }
    }

    .avatar {
        flex-shrink: 0;
        width: 46px;
        height: 46px;
        background-color: ${props => props.theme.colors.colorbg03};
        color: #fff;

        &::before {
          width: 7px;
          height: 7px;
          bottom: 2px;
          right: 5px;
        }

        i {
          font-style: normal;
          font-size: ${props => props.theme.fontSizes.base};
          font-family: ${props => props.theme.fonts.numeric};
        }

        &.offline::before {
            display: block;
        }
        &.online::before {
            background-color: ${props => props.theme.colors.green};
        }

        ${props => props.hideOnlineIcon && css`
            &::before {
                display: none !important;
            }
        `}
    }

    &.new {
        background-color: #fff;
        &:hover, &:focus {
            background-color: ${props => props.theme.colors.bodyBg};
        }

        .body p {
            color: ${props => props.theme.colors.colortx01};
            font-weight: ${props => props.theme.fontWeights.medium};
            padding-right: 10px;
            position: relative;

            &::after {
                content: '';
                position: absolute;
                top: 50%;
                right: 0;
                width: 7px;
                height: 7px;
                margin-top: -3px;
                border-radius: 100%;
                background-color: ${props => props.theme.colors.colorui01};
            }
        }

        .header h6 {
          font-weight: ${props => props.theme.fontWeights.semibold};
          color: ${props => props.theme.colors.colortx01};
        }
    }

    &.selected,
    &.selected:hover,
    &.selected:focus {
        background-color: ${props => props.theme.colors.colorbg01};
    }

    ${props => (props.isBlinking && css`
        animation: ${blinker} 7s infinite;

        h6, span, small, p {
            animation: ${blinkerText} 7s infinite;
        }

    `)}
`;

export const ChatListItemHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 3px;

    h6 {
        margin-bottom: 0;
        color: ${props => props.theme.colors.colortx02};
        line-height: 1.2;
        margin-right: auto;
    }

    .mute-indicator {
        display: block;
        font-size: 12px;
        color: ${props => props.theme.colors.colortx03};
        margin-right: 5px;
    }

    small {
        font-size: 11px;
        font-family: ${props => props.theme.fonts.numeric};
        color: ${props => props.theme.colors.colortx03};
        display: block;
        line-height: 1.2;
    }
`;

export const ChatListItemBody = styled.div`
    flex: 1;
    margin-left: 10px;

    p {
        width: 210px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 0;
        color: ${props => props.theme.colors.colortx02};
        font-size: ${props => props.theme.fontSizes.sm};
    }
`;

export const ChatHeaderLink = styled.div`
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100%;
    background-color: #fff;
    color: ${props => props.theme.colors.colortx03};
    font-size: 24px;

    &:hover, &:focus {
        color: ${props => props.theme.colors.colortx02};
        background-color: ${props => props.theme.colors.colorbg01};
    }

    &.qc-link-close {
        font-size: 24px;
    }
`;

export const EmptyContent = styled(CommonEmptyContent)`
    margin: auto 0;
    height: 100%;
    padding: 10px;

    i {
        font-size: 45px;
    }

    p {
        text-align: center;
        color: ${props => props.theme.colors.gray600};
    }
`;

export const JoinButton = styled(PrimaryButton)`
    min-height: 38px;
    display: flex;
    align-items: center;
    padding: 0 15px;
    border-radius: 5px;
    width: 100%;
    justify-content: center;
`;
