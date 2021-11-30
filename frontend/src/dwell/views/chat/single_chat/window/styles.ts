import styled, { css } from 'styled-components';
import { hexToRgb } from 'dwell/constants';
import { shadowSharp } from 'src/styles/mixins';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { blinker, blinkerText } from 'dwell/views/chat/single_chat/contact/styles';
import { MentionsInput } from 'react-mentions';

export const ChatItemContainer = styled.div`
    width: 280px;
    background-color: #fff;
    border-bottom-width: 0;
    box-shadow: 0 -5px 25px rgba(${props => hexToRgb(props.theme.colors.colorbg03)}, .4);
    border-top-right-radius: ${props => props.theme.borders.radiusmd};
    margin-right: 5px;
    position: relative;
    border: 1px solid rgba(${props => hexToRgb(props.theme.colors.colorbg03)}, 0.5);

    &::before {
        content: '${props => (props.isSMS ? 'SMS' : 'CHAT')}';
        position: absolute;
        top: -20px;
        left: -1px;
        background-color: #fff;
        color: ${props => (props.isSMS ? props.theme.colors.teal : props.theme.colors.colorui03)};
        border: 1px solid rgba(${props => hexToRgb(props.theme.colors.colorbg03)}, .5);
        border-bottom-width: 0;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        font-size: 10px;
        font-weight: 600;
        font-family: ${props => props.theme.fonts.default};
        z-index: 10;
        padding: 2px 8px;
    }

    &.minimize {
        height: auto;

        .qc-item-body,
        .qc-item-footer {
            display: none;
        }
    }

    a {
        outline: none;
    }

    ${props => (props.isBlinking && css`
        &:before {
            animation: ${blinker} 7s infinite;
            i {
                animation: ${blinkerText} 7s infinite;
            }
        }
    `)}
`;

export const ChatItemHeader = styled.div`
    height: 54px;
    padding: 0 10px;
    border-bottom: 1px solid ${props => props.theme.colors.colorbd02};
    ${props => shadowSharp({ color: hexToRgb(props.theme.colors.colorbd01) })};
    cursor: pointer;
    // border: 1px solid rgba(${props => hexToRgb(props.theme.colors.colorbg03)}, .5);
    border-top-right-radius: ${props => props.theme.borders.radiusmd};

    .media {
        height: 100%;
        align-items: center;
    }

    .avatar {
        width: ${props => props.theme.templates.heightxs};
        height: ${props => props.theme.templates.heightxs};
        background-color: ${props => props.theme.colors.colorbg03};

        i {
            font-style: normal;
            font-size: ${props => props.theme.fontSizes.sm};
            font-family: ${props => props.theme.fonts.numeric};
        }

        &::before {
            display: block;
        }
        &.online::before {
            background-color: ${props => props.theme.colors.green};
        }
    }

    .media-body {
        padding-left: 10px;
        word-break: break-word;

        h6 {
          line-height: 1.3;
          font-weight: ${props => props.theme.fontWeights.semibold};
        }

        span {
            display: block;
            font-size: 12px;
            color: ${props => props.theme.colors.colortx03};
        }

        i {
            font-size: 10px;
            color: ${props => props.theme.colors.colortx03};
            margin-left: 3px;
        }
    }

    .dropdown { margin-right: 2px; }

    .dropdown-menu {
        margin-top: 5px;
        border-color: rgba(${props => hexToRgb(props.theme.colors.colortx02)}, .16);
        border-radius: 5px;
        padding: 5px;
        @include shadow-dreamy(${props => props.theme.colors.colortx03});
    }

    .dropdown-item {
        padding: 6px 12px;
        font-size: ${props => props.theme.fontSizes.sm} !important;
        color: ${props => props.theme.colors.colortx02} !important;
        border-radius: 4px !important;
        display: flex;
        align-items: center;

        &:hover, &:focus {
            background-color: ${props => props.theme.colors.colorbd01};
            color: ${props => props.theme.colors.colortx02};
        }

        i {
            font-size: 16px;
            line-height: 1;
            margin-right: 5px;
            opacity: .75;
            color: ${props => props.theme.colors.colortx02} !important;
        }
    }

    ${props => (props.isBlinking && css`
        animation: ${blinker} 7s infinite;

        h6, span, small, p {
            animation: ${blinkerText} 7s infinite;
        }
    `)}
`;

export const ChatItem = styled.li`
    padding: 10px;
    display: flex;
    margin-right: 5%;

    ${props => props.reverse && css`
        flex-direction: row-reverse;
        margin-right: 0;
        margin-left: 5%;

        .message {
            padding-left: 0;
            padding-right: 8px;
            text-align: right;

            p {
                background-color: ${props.isSMS ? props.theme.colors.teal : props.theme.colors.colorui01};
                color: #fff;
                text-align: left;
            }
        }
    `}

    ${props => props.agentJoined && css`
        margin-right: 0;
        justify-content: center;
    `};
`;

export const ChatItemBody = styled(PerfectScrollbar)`
    height: calc(100% - 116px);
    ${props => props.isSingleChat && css`height: 300px;`}

    max-height: calc(100vh - ${props => props.theme.templates.headerHeight} + 146px);
    // border: 1px solid rgba(${props => hexToRgb(props.theme.colors.colorbg03)}, .5);
    // border-top-width: 0px;
    // border-bottom-width: 0px;
    position: relative;
    overflow: hidden;

    ul {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .avatar {
        background-color: ${props => props.theme.colors.colorbg03};
        width: 26px;
        height: 26px;

        &::before {
            display: none;
        }

        i {
            font-size: 10px;
            font-family: ${props => props.theme.fonts.numeric};
            font-style: normal;
        }

        span {
            font-size: 11px;
        }

        img {
            width: 26px;
            height: 26px;
            border-radius: 100%;

            &.bot {
                width: 18px;
                height: 18px;
            }
        }
    }

    p {
        padding: 7px 10px;
        background-color: ${props => props.theme.colors.colorbg01};
        border-radius: ${props => props.theme.borders.radiussm};
        margin-bottom: 2px;
        font-size: ${props => props.theme.fontSizes.sm};
        line-height: 1.4;
        color: ${props => props.theme.colors.colortx02};
        display: inline-block;
    }

    small {
        font-size: 10px;
        color: ${props => props.theme.colors.colortx03};
        display: block;
    }

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

export const ChatItemMessage = styled.div`
    flex: 1;
    padding-left: 8px;
    word-break: break-word;
`;

export const MessageInput = styled.div`
    display: flex;
    align-items: center;
    height: ${props => props.theme.templates.heightBase};
    background-color: ${props => props.theme.colors.colorbg01};
    padding-left: 12px;
    padding-right: 8px;
    border-radius: ${props => props.theme.borders.radius};

    .msg-send i {
        color: ${props => props.theme.colors.colorui01};
        font-size: 20px;
        cursor: pointer;
    }

    .toggle {
        i {
            font-size: 24px;
        }
    }

    input {
        resize: none;
        overflow: hidden;
    }
`;

export const TypingMessage = styled.div`
    color: #929eb9;
    margin-left: 10px;
    margin-bottom: 10px;
    font-size: 12px;
`;
export const ChatItemFooter = styled.div`
    padding: 10px;
    border: 1px solid rgba(${props => hexToRgb(props.theme.colors.colorbg03)}, .5);
    border-top-width: 0px;
    border-bottom-width: 0px;

    .form-control {
        flex: 1;
        height: auto;
        padding: 0;
        background-color: transparent;
        border-width: 0;
        border-radius: 0;
        font-size: ${props => props.theme.fontSizes.sm};

        &:focus {
            box-shadow: none;
        }
    }

    .dropdown {
        margin-left: 5px;
        margin-top: 4px;
    }

    a {
        font-size: 20px;
        color: ${props => props.theme.colors.colorui01};
    }

    .msg-send {
        margin-top: 3px;
    }

    .dropdown-link {
        font-size: 24px;
    }

    button {
        margin-left: auto;
    }
`;

export const CustomMentionInput = styled(MentionsInput)`
    width: calc(100% - 60px);
    > div {
        width: 100%;
    }
    input {
        border: 0;
        &:focus {
            outline: none;
        }
    }
`;
