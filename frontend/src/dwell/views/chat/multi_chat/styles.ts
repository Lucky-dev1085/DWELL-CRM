import styled, { css, keyframes } from 'styled-components';
import {
  Badge,
  Content,
  DefaultDropdownItem,
  DefaultDropdownMenu, Divider, EmptyContent as CommonEmptyContent,
  FlexCenter,
  Nav,
  PrimaryButton,
  SimpleButton,
} from 'styles/common';
import { Input, DropdownToggle, DropdownMenu } from 'reactstrap';
import { hexToRgb } from 'dwell/constants';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { ArrowLeft, MoreHorizontal } from 'react-feather';

// Main
export const ChatContent = styled(Content)`
    height: calc(100vh - 64px);
    display: flex;
    overflow: hidden;
`;

// Chat Body
export const ChatBodyContent = styled.div`
    width: calc(100% - 300px);
    position: relative;
    background-color: ${props => props.theme.colors.gray100};
    background-image: linear-gradient(to bottom, ${props => props.theme.colors.gray100} 0%, ${props => props.theme.colors.colorbg01} 100%);
    background-repeat: repeat-x;

    .slick-track {
        margin-left: 0;
        margin-right: 0;
    }

    .slick-slider, .slick-list, .slick-track, .slick-slide, .slick-slide > div {
        height: 100%;
    }
`;

export const ChatBodyHeader = styled.div`
    height: 60px;
    padding: 0 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

export const ChatBodyHeaderTitle = styled.h6`
    font-weight: ${props => props.theme.fontWeights.medium};
    font-size: 16px;
    color: ${props => props.theme.colors.darkblue};
    margin-bottom: 0;
    margin-left: 2px;
    display: flex;
    align-items: center;
`;

export const ChatBodyHeaderDotsIndicator = styled.div`
    width: 20px;
    height: 20px;
    background-color: transparent;
    position: relative;
    cursor: pointer;
    transition: fadeout 2s;

    &:before {
        border-radius: 100%;
        width: 8px;
        height: 8px;
        position: absolute;
        content: '';
        background-color: #C8CED3;
        top: 6px;
        left: 6px;
    }

    ${props => props.first && css`
        border-bottom-left-radius: 50%;
        border-top-left-radius: 50%;
    `}

    ${props => props.last && css`
        border-bottom-right-radius: 50%;
        border-top-right-radius: 50%;
    `}

    ${props => (props.middle || props.first || props.last) && css`
        background-color: ${props.isOverlay ? '#C8CED3' : 'transparent'};
        &:before {
            background-color: ${props.isOverlay ? '#C8CED3' : props.theme.colors.white};
            transition: all 0.3s ease-in;
        }
    `}

    ${props => props.isHidden && css`
        visibility: hidden;
    `}
`;

export const ActiveChatsCount = styled.span`
    flex-shrink: 0;
    padding-bottom: 1px;
    margin-left: 8px;
    font-size: 10px;
    font-weight: ${props => props.theme.fontWeights.medium};
    ${FlexCenter}
    border-radius: 100%;
    width: 18px;
    height: 18px;
    background-color: ${props => props.theme.colors.colorbg02};
    color: ${props => props.theme.colors.colortx02};
`;

export const ChatBodyPanel = styled.div`
    position: relative;
    height: calc(100% - 60px);
    .slick-track {
        padding-top: 16px;
    }
`;

// Chat Sidebar
export const ChatSidebarContent = styled.div`
    width: 300px;
    height: 100%;
    background-color: #fff;
    border-right: 1px solid ${props => props.theme.colors.colorbg02};
    position: relative;
`;

export const ChatSidebarHeader = styled.div`
    padding: 15px 15px 5px;
    display: flex;
    align-items: center;
`;

export const ChatsSearch = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    height: 38px;
    background-color: ${props => props.theme.colors.colorbg01};
    padding: 0 10px;
    border-radius: 6px;
`;

export const ChatsSearchInput = styled(Input)`
    border-width: 0;
    border-radius: 0;
    height: auto;
    padding: 0;
    margin: 0;
    background-color: transparent !important;
    text-shadow: none;
    font-size: 13px;
    text-shadow: none !important;

    &:focus {
        box-shadow: none !important;
    }

    &::placeholder, &::-webkit-input-placeholder, &:-ms-input-placeholder {
        color: ${props => props.theme.colors.colortx03};
    }
`;

export const ChatsSettingsWrapper = styled.div`
    margin-left: 10px;
`;

export const ChatsSidebarMenu = styled.div`
    height: 48px;
    border-bottom: 1px solid rgba(225,230,247,0.75);
`;

export const ChatsMainMenu = styled.div`
    height: 100%;
    padding: 0 15px;
    display: flex;
    align-items: center;
`;

export const ChatsOtherMenu = styled.div`
    height: 100%;
    padding: 0 15px;
    display: flex;
    align-items: center;
`;

export const ChatsBack = styled.div`
    color: ${props => props.theme.colors.blue};
    margin-right: 10px;
    cursor: pointer;

    &:hover {
        color: ${props => props.theme.colors.lightblue};
    }
`;

export const ChatsBackSvg = styled(ArrowLeft)`
    width: 16px;
    height: 16px;
    stroke-width: 2.5px;
`;

export const ChatsOtherMenuTitle = styled.h6`
    margin-top: 3px;
    margin-bottom: 0;
    font-size: 13px;
`;

export const ChatsMainMenuNav = styled(Nav)`
    margin-right: 15px;
`;

export const ChatsMenuItem = styled.div`
    padding: 0 5px;
    font-size: 13px;
    color: #6579a1;
    display: flex;
    align-items: center;
    position: relative;
    outline: none;
    cursor: pointer;

    ${props => (props.active ? css`
      color: ${props.theme.colors.blue};
      &:before {
          display: block;
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -14px;
          border-bottom: 1px solid #5d9cfc;
      }

    ` : css`
      &:hover {
          color: ${props.theme.colors.darkblue};
      }
    `)}
`;

export const ChatsMyMenu = styled(ChatsMenuItem)`
      margin-left: 10px;
`;

export const MenuDotsSvg = styled.svg`
    width: 18px;
    height: 18px;
`;

export const ChatsMenuDots = styled(DropdownToggle)`
    color: ${props => props.theme.colors.colortx03};
    cursor: pointer;

    &:hover {
        color: ${props => props.theme.colors.colortx02};
    }
    position: relative;

    span {
        position: absolute;
        top: 0px;
        right: -4px;
        width: 7px;
        height: 7px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 100%;
        background-color: ${props => props.theme.colors.cyan};
        font-size: 9px;
    }
`;

export const MagnifyingGlassSvg = styled.svg`
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    stroke-width: 2.5px;
    margin-right: 8px;
    color: ${props => props.theme.colors.colortx03};
`;

export const ChatsMainMenuDropdown = styled(DropdownMenu)`
    ${DefaultDropdownMenu}
    padding: 8px;
    margin-top: 10px;
    min-width: 160px;
    margin-left: -10px;

    ${props => props.isSingleChat && css`
        box-shadow: 0 2px 10px rgba(0,23,55,0.21);
        border: 1px solid rgba(0,23,55,0.12);
        margin-top: 0px;
    `}
`;

export const ChatsMainMenuDropdownItem = styled.button`
    ${DefaultDropdownItem}
    font-size: 13px;
    white-space: nowrap;
    display: flex;
    align-items: center;
    position: relative;

    span {
        position: absolute;
        top: 14px;
        right: 8px;
        width: 7px;
        height: 7px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 100%;
        background: ${props => props.theme.colors.cyan};
        font-size: 7px;
    }
`;

export const SliderButton = styled.button`
    outline: none;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    color: ${props => (props.disabled ? '#e1e6f7' : '#6579a1')};
    background-color: ${props => (props.disabled ? 'transparent' : '#fff')};
    border: 1px solid #e1e6f7;
    transition: all 0.2s;
    margin-right: 7px;
    cursor: ${props => (props.disabled ? 'default' : 'pointer')};

    &:focus {
        outline: none;
    }

    ${props => !props.disabled && css`
      &:hover {
          background-color: #fff;
          border-color: transparent;
          color: ${props.theme.colors.darkblue};
          box-shadow: 0 1px 1px rgba(101,121,161,0.11),
          0 2px 2px rgba(101,121,161,0.11),
          0 4px 4px rgba(101,121,161,0.11),
          0 6px 8px rgba(101,121,161,0.11),
          0 8px 16px rgba(101,121,161,0.11);
      }
    `};
`;

// Chat Settings
export const MenuDropdownIcon = styled.i`
    font-size: 14px;
    line-height: .7;
    margin-right: 8px;
`;

export const ChatSettingsButton = styled(DropdownToggle)`
    outline: none;
    width: 38px;
    height: 38px;
    border: 1px solid ${props => props.theme.colors.colorbg02};
    background-color: #fff;
    color: ${props => props.theme.colors.darkblue};
    border-radius: 6px;
    ${FlexCenter}
    position: relative;
    font-size: 20px;
    transition: all 0.2s;

    &:hover {
        border-color: transparent;
        box-shadow: 0 1px 1px rgba(152,164,193,0.25), 0 2px 2px rgba(152,164,193,0.2),
        0 4px 4px rgba(152,164,193,0.15), 0 8px 8px rgba(152,164,193,0.1),
        0 16px 16px rgba(152,164,193,0.05);
    }

    &:focus {
        outline: none;
    }
`;

export const ChatSettingsDropdownMenu = styled(DropdownMenu)`
    ${DefaultDropdownMenu}
    max-height: 400px;
    background-color: #fff;
    position: absolute;
    z-index: 90;
    top: 50px;
    left: 15px;
    right: 15px;
    margin-top: 10px;
    padding: 15px;
    border-radius: 9px;
    overflow-y: auto;
`;

export const ChatSettingsDropdownItem = styled.li`
    display: flex;
    align-items: center;

    &:not(:first-child) {
         margin-top: 20px;
         position: relative;

         &:before {
            content: '';
            position: absolute;
            top: -10px;
            right: 0;
            left: 50px;
            border-top: 1px solid ${props => props.theme.colors.colorbg01};
         }
    }
`;

export const ChatSettingsDropdownList = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
`;

export const ChatsSettingsMenuLabel = styled.label`
    line-height: 1;
    text-transform: uppercase;
    font-size: 10px;
    font-weight: ${props => props.theme.fontWeights.medium};
    color: ${props => props.theme.colors.colortx03};
    letter-spacing: .5px;
    margin-bottom: 15px;
    font-family: ${props => props.theme.fonts.default};
`;

export const ItemBody = styled.div`
    flex: 1;
    margin-left: 10px;
`;

export const ItemBodyName = styled.h6`
    font-weight: 500;
    font-size: 13px;
    color: ${props => props.theme.colors.darkblue};
    margin-bottom: 3px;
    white-space:nowrap;
`;

export const ItemBodyProspects = styled.p`
    margin-bottom: 0;
    font-size: 11px;
    font-family: ${props => props.theme.fonts.default};
    color: ${props => props.theme.colors.colortx03};
    position: relative;
    white-space:nowrap;
`;

export const PropertyItemLogo = styled.div`
    width: 40px;
    height: 40px;
    background-color: ${props => props.theme.colors.colorbg01};
    color: ${props => props.theme.colors.colortx02};
    margin-right: 12px;
    flex-shrink: 0;
    border-radius: 4px;
    overflow: hidden;
    ${FlexCenter}
`;

export const PropertyItemLogoImg = styled.img`
    width: 40px;
`;

export const FormSwitch = styled.button`
    border: none;
    margin-left: 10px;
    margin-bottom: 0;
    width: 30px;
    height: 14px;
    background-color: ${props => (props.checked ? props.theme.colors.green : props.theme.colors.gray400)};
    border-radius: 10px;
    position: relative;
    transition: background-color 0.25s;
    cursor: pointer;

    &:focus {
        outline: none;
    }

    &:before {
      content: '';
      width: 10px;
      height: 10px;
      background-color: #fff;
      border-radius: 100%;
      position: absolute;
      top: 2px;
      left: ${props => (props.checked ? '18px' : '2px')};
      transition: left 0.25s;
    }
`;

export const FormSwitchWrapper = styled.div`
    padding-left: 2.25rem;
    display: flex;
    align-items: center;
    color: ${props => props.theme.colors.colortx02};
    font-size: 13px;
`;

// Chat List
export const ChatsListBody = styled(PerfectScrollbar)`
    height: calc(100% - 108px);
    position: relative;

    > .ps__rail-y {
        width: 2px;
        background-color: ${props => props.theme.colors.gray100};
        z-index: 10;
        position: absolute;
        left: auto !important;
        right: 0;
        opacity: 0;
        margin: 1px;
        transition: opacity .2s;

        > .ps__thumb-y {
            position: absolute;
            width: 2px;
            left: 0;
            background-color: ${props => props.theme.colors.gray500};
            border-radius: 0;
        }
  }

  &.ps--active-y {
    &:hover, &:focus {
        > .ps__rail-y { opacity: 1; }
    }
  }
`;

export const ChatSpinnerWrapper = styled.div`
    height: 100px;
    ${FlexCenter}
`;

export const ChatSpinner = styled.div`
    opacity: .5;
    color: ${props => props.theme.colors.secondary} !important;
    width: 1rem;
    height: 1rem;
    display: inline-block;
    vertical-align: text-bottom;
    border: .2em solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spinner-border .75s linear infinite;
`;

export const ChatSpinnerInner = styled.span`
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
`;

export const ChatsItems = styled.ul`
    margin: 0;
    padding: 10px 0;
    list-style: none;
    height: 100%;
`;

export const ChatItemLabel = styled.li`
    padding: 10px 15px;
    font-size: 11px;
    color: #98a4c1;
`;

export const ChatAvatar = styled.div`
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    font-size: 21px;
    font-weight: 400;
    background-color: #e1e6f7;
    color: #6579a1;
    margin-right: 10px;
    position: relative;
    ${FlexCenter}
    border-radius: 100%;

    ${props => props.isShow && css`
        &:before {
            display: block;
            background-color: ${props.isOnline ? props.theme.colors.success : props.theme.colors.gray300};
            content: '';
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 6px;
            height: 6px;
            border-radius: 100%;
            box-shadow: 0 0 0 1.5px #fff;
        }
    `}
`;

export const blinker = keyframes`
  0% {
    background: #fff;
  }
  50% {
    background: #8eb7fd;
  }
  100% {
    background: #fff;
  }
`;

export const blinker5s = keyframes`
  0%, 20%, 40%, 60%, 80%, 100% {
    background: #fff;
  }
  10%, 30%, 50%, 70%, 80% {
    background: #ebf2fe;
  }
`;

export const ChatItem = styled.li`
    margin-top: 1px;
    position: relative;
    display: flex;
    padding: 12px 15px 12px 13px;
    border-left: 2px solid ${props => (props.isActive ? props.theme.colors.colorui01 : 'transparent')};
    cursor: pointer;
    background-color: #fff;

    ${props => (props.isActive ? css`
        background-color: ${props.theme.colors.colorlight01};
        background-image: linear-gradient(to right, ${props.theme.colors.colorlight01} 0%, #fff 100%);
        background-repeat: repeat-x;

        ${ChatAvatar} {
            background-color: ${props.theme.colors.colorui01};
            color: #fff;
        }
    ` : css`
        &:hover {
            background-color: rgba(225,230,247,0.3);
        }
    `)}

    ${props => (props.isBlinking && css`
        animation: ${blinker} 3s linear;
        animation-iteration-count: 10;
    `)}

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
`;

export const ChatItemBody = styled.div`
    flex: 1;
    color: #6579a1;
    position: relative;
    display: flex;
    ${props => props.hasHistory && css`
        flex-direction: column;
    `}
`;

export const ChatItemTitleWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2px;
`;

export const ChatItemTitle = styled.h6`
    font-weight: 500;
    font-size: 12px;
    color: #6579a1;
    margin-bottom: 0;
`;

export const ChatItemTime = styled.small`
    font-size: 10px;
    font-weight: 400;
    color: #98a4c1;
`;

export const ChatLastMessage = styled.p`
    font-size: 13px;
    font-weight: 400;
    font-family: ${props => props.theme.fonts.default};
    color: ${props => props.theme.colors.lightblack};
    margin-bottom: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 185px;
    letter-spacing: -.2px;
`;

export const NotificationBadge = styled(Badge)`
    width: 16px;
    height: 16px;
    border-radius: 100%;
    background-color: ${props => props.theme.colors.cyan};
    color: #fff;
    font-weight: 400;
    font-size: 9px;
    font-family: "Rubik",sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    text-shadow: none;
    position: absolute;
    bottom: 3px;
    right: 0;
`;

// Active Chat
export const PrevSlideSvg = styled(ArrowLeft)`
    width: 18px;
    height: 18px;
    stroke-width: 2.5px;
`;

export const NextSlideSvg = styled(ArrowLeft)`
    width: 18px;
    height: 18px;
    stroke-width: 2.5px;
    transform: rotate(180deg);
`;

export const CloseSvg = styled.svg`
    width: 16px;
    height: 16px;
    stroke-width: 2.5px;
`;

export const ActiveChatWrapper = styled.div`
    flex: 1;
    position: relative;
    height: 100%;
    padding-bottom: 20px;
    margin-left: 7px;
    margin-right: 7px;

    ${props => (props.firstRemove && css`
        transition: all 0.2s ease-in;
        transform: translate3d(calc(-100% - 14px), 0px, 0px);
    `)}

    &:before {
        content: '${props => (props.isSMS ? 'SMS' : 'chat')}';
        position: absolute;
        top: -16.5px;
        left: 0;
        background-color: #fff;
        color: ${props => (props.isSMS ? props.theme.colors.teal : props.theme.colors.colorui03)};
        border: 1px solid rgba(${props => hexToRgb(props.theme.colors.colorbg03)}, .5);
        border-bottom-width: 0;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        font-size: 9px;
        font-family: ${props => props.theme.fonts.default};
        font-weight: 600;
        text-transform: uppercase;
        z-index: 10;
        padding: 3px 8px 0;
    }
`;

export const ActiveChatContainer = styled.div`
    position: relative;
    height: 100%;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 1px rgba(193,200,222,0.25),
    0 2px 2px rgba(193,200,222,0.2),
    0 4px 4px rgba(193,200,222,0.15),
    0 8px 8px rgba(193,200,222,0.1),
    0 16px 16px rgba(193,200,222,0.05);
    transition: all 0.2s;
    border: 1px solid ${props => props.theme.colors.colorbg02};
    border-top-left-radius: 0px;

    &:hover, &:focus {
        box-shadow: 0 2.8px 2.2px rgba(101,121,161,0.02),
        0 6.7px 5.3px rgba(101,121,161,0.028),
        0 12.5px 10px rgba(101,121,161,0.035),
        0 22.3px 17.9px rgba(101,121,161,0.042),
        0 41.8px 33.4px rgba(101,121,161,0.05),
        0 100px 80px rgba(101,121,161,0.07);
    }
`;

export const ActiveChatHeader = styled.div`
    height: 60px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #e1e6f7;
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;

     ${props => (props.isBlinking && css`
        animation: ${blinker5s} 5s linear;
    `)}

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
`;

export const ActiveChatBody = styled(PerfectScrollbar)`
    height: calc(100% - ${props => (props.isSingleChat ? '104px' : '116px')});
    overflow-y: auto;
    font-size: 13px;
    .ps__thumb-y {
        width: 2px;
        &:hover {
            width: 4px;
        }
    }
`;

export const ActiveChatFooter = styled.div`
    height: 56px;
    border-top: 1px solid #e1e6f7;
    display: flex;
    align-items: center;
    padding: 0 20px;
    border-bottom-right-radius: inherit;
    border-bottom-left-radius: inherit;
`;

export const Media = styled.div`
    display: flex;
    align-items: center;
    margin-right: auto;
    opacity: 1;
`;

export const MediaBody = styled.div`
    flex: 1;
    user-select: text;
`;

export const ProspectName = styled.h5`
    font-size: 13px;
    font-weight: 500;
    color: ${props => props.theme.colors.darkblue};
    margin-bottom: 2px;

    i {
        font-size: 10px;
        color: ${props => props.theme.colors.colortx03};
    }
`;

export const ProspectPage = styled.p`
    margin: 0;
    font-size: 10.5px;
    color: ${props => props.theme.colors.colortx03};
`;

export const VerticalMenuDots = styled(MoreHorizontal)`
    transform: rotate(90deg);
    width: 16px;
    height: 16px;
    stroke-width: 2.5px;
`;

export const ActiveChatsMenuDots = styled(ChatsMenuDots)`
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;

    &:hover {
        background-color: #f0f2f9;
    }
`;

export const CloseButton = styled.button`
    outline: none;
    flex-shrink: 0;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    color: #98a4c1;
    transition: all 0.25s;
    background-color: transparent;
    border: none;
    padding: 0;

    &:hover {
        background-color: #f0f2f9;
        color: #6579a1;
    }

    &:focus {
        outline: none;
    }
`;

export const ChatsMessageInput = styled(Input)`
    padding: 0;
    margin: 0;
    height: auto;
    border-width: 0 !important;
    border-radius: 0;
    font-size: 13px;

    background-color: transparent !important;
    text-shadow: none !important;

    &:focus {
        box-shadow: none !important;
    }

    &::placeholder, &::-webkit-input-placeholder, &:-ms-input-placeholder {
        color: ${props => props.theme.colors.colortx03};
    }
`;

export const SendButton = styled(SimpleButton)`
    padding: 0;
    height: auto;
    margin-left: 8px;
    color: ${props => props.theme.colors.colorui01};

    &:focus {
        outline: none;
    }
`;

export const MsgTextGroup = styled.ul`
    padding: 15px;
    margin: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
`;

export const MsgTextItem = styled.li`
    display: flex;
    align-self: flex-end;
    max-width: 80%;
    margin-top: 15px;
    user-select: text;
    flex-direction: column;
`;

export const MsgText = styled.p`
    background-color: ${props => props.theme.colors.colorui01};
    padding: 10px 14px;
    color: #fff;
    border-radius: 5px;
    margin-bottom: 5px;
    align-self: flex-end;
    width: fit-content;
    word-break: break-word;
`;

export const MsgTextDate = styled.small`
    display: block;
    text-align: right;
    font-size: 11px;
    color: #98a4c1;
`;

export const MsgTextItemReverse = styled.li`
    display: flex;
    align-self: flex-start;
    max-width: 80%;
    margin-top: 15px;
    flex-direction: column;

    ${MsgText} {
      background-color: #f0f2f9;
      color: #6579a1;
      align-self: flex-start;
    }

    ${MsgTextDate} {
      text-align: left;
    }

    ${props => props.showUnreadLine && css`
        width: 100%;
        &::before {
          content: "";
          display: block;
          height: 2px;
          width: calc(100% + 25%);
          background: #ddd;
          margin-bottom: 12px;
          left: 0;
          top: -5px;
        }
    `}
`;

export const AgentJoinedText = styled.div`
    font-size: 13px;
    font-weight: 400;
    color: ${props => props.theme.colors.darkblue};
    margin: 2px;
    text-align: center;
    margin-top: 10px;
`;

// Chat Message Options Panel
export const OptionsPanelDropdownMenu = styled(DropdownMenu)`
    ${DefaultDropdownMenu}
    width: 200px;
    min-height: 150px;
    overflow-y: auto;
    padding: 0;
`;

export const ProspectMenu = styled.div`
    padding: 15px;
`;

export const ProspectMenuLabel = styled.label`
    font-size: 12px;
    line-height: 1;
    display: block;
    margin-bottom: 10px;
    color: ${props => props.theme.colors.colortx02};
    font-weight: 400;
`;

export const ProspectMenuItemBody = styled.div`
    border: 1px solid ${props => props.theme.colors.colorbg02};
    border-radius: 3px;
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    margin-left: 5px;
    color: ${props => props.theme.colors.colortx01};
    padding: 0 10px;
    flex: 1;
    overflow: hidden;
    span:last-child:not(:first-child) {
        color: ${props => props.theme.colors.colortx03};
    }
`;
export const TemplateTitle = styled.span`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const ProspectMenuItemButton = styled(PrimaryButton)`
    width: 28px;
    height: 28px;
    min-height: 0;
    padding: 0;
    justify-content: center;
    border-radius: 3px;
    border-width: 0;
`;

export const ProspectMenuDivider = styled(Divider)`
  margin-top: 10px;
  margin-bottom: 10px;
`;

export const OptionsPanelDropdownItem = styled.div`
    display: flex;
    align-items: flex-start;
    margin-top: 7px;
`;

export const OptionsPanelIcon = styled.i`
    font-size: 21px;
    line-height: .7;
`;

export const OptionsPanelIconInner = styled(OptionsPanelIcon)`
    font-size: 18px;
`;

export const OptionsPanelDropdownToggle = styled(DropdownToggle)`
    font-size: 24px;
    top: 1.5px;
    position: relative;
    outline: none;
    margin-left: 10px;
    align-self: center;
    color: ${props => props.theme.colors.colorui01};
    cursor: pointer;
`;

export const EmptyContent = styled(CommonEmptyContent)`
    margin: auto 0;
    margin-top: -50px;
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

export const Overlay = styled.div`
    height: 20px;
    width: 60px;
    position: absolute;
    left: ${p => `${p.left}px` || 0};
    transition: all 0.3s ease-in;
    display: flex;
`;
