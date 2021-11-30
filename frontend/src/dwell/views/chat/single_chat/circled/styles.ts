import styled, { css, keyframes, Keyframes, DefaultTheme } from 'styled-components';
import { hexToRgb } from 'dwell/constants';
import { Avatar as DefaultAvatar } from 'src/styles/common';

interface PropsTheme {
  theme: DefaultTheme,
}

export const MinChatGroup = styled.div`
    position: fixed;
    --heightA: 35px;
    --heightB: calc(100vh - 100%);
    --heightC: calc(35px - var(--heightB));
    bottom: var(--heightC);
    --widthA: 15px;
    --widthB: calc(100vw - 100%);
    --widthC: calc(35px - var(--widthB));
    right: var(--widthC);
    display: flex;
    flex-direction: column-reverse;
    z-index: 1010;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;

export const blinking = (props: PropsTheme): Keyframes => keyframes`
    0% {
        box-shadow: 0 1px 1px rgba(${hexToRgb(props.theme.colors.colortx03)}, 0.08),
                    0 2px 2px rgba(${hexToRgb(props.theme.colors.colortx03)}, 0.12),
                    0 4px 4px rgba(${hexToRgb(props.theme.colors.colortx03)}, 0.16),
                    0 8px 8px rgba(${hexToRgb(props.theme.colors.colortx03)}, 0.20),
                    0 0 0 1px rgba(${hexToRgb(props.theme.colors.colortx01)}, .16);
    }

    35% {
        box-shadow: 0 1px 1px rgba(${hexToRgb(props.theme.colors.colortx03)}, 0.08),
                    0 2px 2px rgba(${hexToRgb(props.theme.colors.colortx03)}, 0.12),
                    0 4px 4px rgba(${hexToRgb(props.theme.colors.colortx03)}, 0.16),
                    0 8px 8px rgba(${hexToRgb(props.theme.colors.colortx03)}, 0.20),
                    0 0 0 10px rgba(${hexToRgb(props.theme.colors.colortx01)}, .08);
    }

    70% {
        box-shadow: 0 1px 1px rgba(${hexToRgb(props.theme.colors.colortx03)}, 0.08),
                    0 2px 2px rgba(${hexToRgb(props.theme.colors.colortx03)}, 0.12),
                    0 4px 4px rgba(${hexToRgb(props.theme.colors.colortx03)}, 0.16),
                    0 8px 8px rgba(${hexToRgb(props.theme.colors.colortx03)}, 0.20),
                    0 0 0 20px rgba(${hexToRgb(props.theme.colors.colortx01)}, .02);
    }

    100% {
        box-shadow: 0 1px 1px rgba(${hexToRgb(props.theme.colors.colortx03)}, 0.08),
                    0 2px 2px rgba(${hexToRgb(props.theme.colors.colortx03)}, 0.12),
                    0 4px 4px rgba(${hexToRgb(props.theme.colors.colortx03)}, 0.16),
                    0 8px 8px rgba(${hexToRgb(props.theme.colors.colortx03)}, 0.20),
                    0 0 0 30px rgba(${hexToRgb(props.theme.colors.colortx01)}, 0);
    }
`;

export const MinChatLink = styled.div`
    position: relative;
    width: 48px;
    height: 48px;
    background-color: ${props => props.theme.colors.colorui01};
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100%;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 0 0 1.5px rgba(255,255,255,0.75),
    0 1px 1px rgba(146,158,185,0.08),
    0 2px 2px rgba(146,158,185,0.12),
    0 4px 4px rgba(146,158,185,0.16),
    0 8px 8px rgba(146,158,185,0.2);
    transition: all 0.25s;

    &:hover {
        transform: scale(1.08);
    }

    &:hover, &:focus {
        color: #fff;
    }

    ${props => props.blinking && css`
        animation-name: ${blinking(props)};
        animation-duration: 1.8s;
        animation-delay: 1s;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
    `}
`;

export const MinChatItem = styled.div`
    outline: none;
    margin-bottom: 10px;
    position: relative;
    border-radius: 100%;
    // @include shadow-diffuse($color-bg-02);
    transition: all 0.25s;
    cursor: pointer;
    position: relative;

    &:hover {
        transform: scale(1.08);
        z-index: 10;

        .min-chat-close {
            display: flex;
        }
    }

    ${props => props.blinking && css`
        animation-name: ${blinking};
        animation-duration: 1.8s;
        animation-delay: 1s;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
    `}
`;

export const UnreadCount = styled.span`
    position: absolute;
    top: -5px;
    right: 0;
    width: 18px;
    height: 18px;
    display: none;
    align-items: center;
    justify-content: center;
    border-radius: 100%;
    background-color: ${props => props.theme.colors.red};
    color: ${props => props.theme.colors.white};
    font-size: 9px;
    box-shadow: 0 0 0 1.5px rgba(255, 255, 255, .9);
    font-weight: 700;

    ${props => props.show && css`
        display: flex;
    `}
`;

export const CloseIcon = styled(UnreadCount)`
    background-color: ${props => props.theme.colors.bodyBg};
    color: ${props => props.theme.colors.colortx03};

    &:before {
        content: '\\EB99';
        font-family: 'remixicon';
        font-size: 12px;
        display: inline-block;
    }
`;

export const Avatar = styled(DefaultAvatar)`
    width: 48px;
    height: 48px;
    background-color: ${props => props.theme.colors.colorbg03};
    box-shadow: 0 0 0 1.5px rgba(255, 255, 255, .75);

    &:before {
        content: '';
        display: block;
        right: 5px;
        width: 7px;
        height: 7px;
        position: absolute;
        bottom: 2px;
        box-shadow: 0 0 0 1.5px #fff;
        border-radius: 100%;
        background-color: #e1e6f7;
    }

    ${props => props.hideOnlineIcon && css`
        &:before {
            display: none !important;
        }
    `}

    i {
        font-style: normal;
        font-family: ${props => props.theme.fonts.numeric};
        font-size: ${props => props.theme.fontSizes.base};
        color:${props => props.theme.colors.white};
    }


    ${props => props.online && css`
        &:before {
            display: block;
            background-color: #24ba7b;
        }
    `}
`;
