import styled, { css } from 'styled-components';
import darken from '@bit/styled-components.polished.color.darken';
import lighten from '@bit/styled-components.polished.color.lighten';
import { Row, CardHeader as CommonCardHeader, CardTitle as CommonCardTitle } from 'reactstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';

import { shadowDiffuse } from 'styles/mixins';
import { hexToRgb } from 'dwell/constants';
import { shadowSharp } from 'site/components/common/mixin';
import { TableWrapper, FormSwitcher as CommonFormSwitcher } from 'site/components/common';
import { ContentContainer as CommonContentContainer, BreakdownItem as CommonBreakdownItem } from 'compete/views/styles';

import {
  messageStatusToProps,
  Nav,
  NavLinkWithIcon as CommonNavLinkWithIcon,
  NavLinkWithTooltip,
  Avatar as CommonAvatar,
} from '../utils';

export const TableChats = styled(TableWrapper)`
  strong {
    font-weight: 600;
  }
`;

export const Avatar = styled(CommonAvatar).attrs(props => ({
  hideOnlineIcon: true,
  background: props.background || props.theme.colors.colorbg03,
}))`
  background-color: ${props => props.background};

  i {
    font-size: 20px;
  }
`;

export const ReportsFilterSelect = styled.select`
    border: none;
    outline: 0px;
    color: #136cfa;
`;

export const DividerDot = styled.div`
      width: 7px;
      height: 7px;
      background: #D5DDF4;
      border-radius: 50%;
      margin: auto 5px;
`;

export const NoChatsWithErrors = styled.div`
      width: 100%;
      text-align: center;
      padding-top: 20px;
`;

export const MoreActionNav = styled(Nav).attrs({ className: 'nav-icon' })`
    justify-content: flex-end;

    a {
        border-radius: 3px;
        color: ${props => props.theme.colors.colortx03} !important;
        line-height: 1;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        outline: none;
        cursor: pointer;

        &:hover, &:focus {
            background-color: ${props => props.theme.colors.colorbg01};
            color: ${props => props.theme.colors.colortx02};
        }
    }
`;

const badgeStatusToProps = {
  PENDING: { color: c => c.blue, saturation: 0.1 },
  PROGRESS: { color: c => c.yellow, saturation: 0.25 },
  COMPLETED: { color: c => c.green, saturation: 0.15 },
};

export const BadgeSpan = styled.span.attrs(props => ({
  className: 'badge',
  color: badgeStatusToProps[props.status].color(props.theme.colors),
  saturation: badgeStatusToProps[props.status].saturation,
}))`
  border: 1px solid transparent;
  border-radius: 3px;
  font-weight: 400;
  padding: 5px 8px;
  min-width: 100px;

  ${({ saturation, color }) => `
    background-color: rgba(${hexToRgb(color)}, .1);
    border-color: ${color};
    color: ${darken(saturation, color)};
  `}
`;

export const ContentContainer = styled(CommonContentContainer)`
  padding: 25px 25px 0 25px !important;
`;

export const ContentChatEvaluation = styled(ContentContainer)`
  .breadcrumb {
    background-color: transparent;
    padding: 0;
    border-radius: 0;
    margin-bottom: 3px;
  }

  .breadcrumb-item {
    font-size: 12px;
  }
`;

export const ContentChatReport = styled(ContentChatEvaluation)``;

export const ExportIconButton = styled(NavLinkWithTooltip)`
  margin-top: -6px;
  font-weight: 400;
  text-align: center;
  vertical-align: middle;
  user-select: none;
  border: 1px solid #d5dcf4;
  font-size: .875rem;
  line-height: 1.5;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  min-height: 38px;
  border-radius: 5px;
  background-color: #fff;
  color: #4a5e8a;
  width: 38px;
  height: 38px;
  padding: 0;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  span {
    line-height: 0;
    margin-top: 4px;
  }

  i {
    font-size: 18px;
  }
`;

export const CustomControlLabel = styled.label.attrs({ className: 'custom-control-label' })`
  font-weight: normal;
`;

export const ChatsPanel = styled.div`
  background-color: #fff;
  border: 1px solid ${props => props.theme.input.borderColor};
  border-radius: 6px;
  ${props => shadowSharp(props.theme.colors.colorbg02)}
  display: flex;
  height: calc(100vh - 200px);
`;

export const ChatsPanelSidebar = styled.div`
  width: 280px;
  height: 100%;
  border-right: 1px solid ${props => props.theme.input.borderColor};
`;

export const ChatsPanelSidebarHeaderBadge = styled.span.attrs({ className: 'badge' })`
    background-color: ${props => props.theme.colors.colorbg02};
    font-size: 12px;
    font-family: ${props => props.theme.fonts.default};
    font-weight: 400;
    padding: 8px;
    color: ${props => props.theme.colors.colortx02};
`;

export const ChatsPanelSidebarHeader = styled.div`
  height: 60px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${props => props.theme.input.borderColor};
`;

export const FormSwitcher = styled(CommonFormSwitcher)`
  height: 16px;
  margin-right: 24px;

  &::before {
    width: 12px;
    height: 12px;
    left: 16px;
  }

  ${props => props.inactive && `
    background-color: ${props.theme.colors.colorbg02};

    &:focus, &:hover {
      background-color: ${darken(0.05, props.theme.colors.colorbg02)};
    }

    &::before {
      left: 2px;
    }
  `}
`;

export const ChatItem = styled.li`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: ${props => props.theme.colors.bodyBg};
  border-radius: 4px;
  cursor: pointer;

  &:hover, &:focus {
    background-color: rgba(${props => hexToRgb(props.theme.colors.colorbg02)}, .3);
  }

  ${props => props.selected && `
    background-color: ${props.theme.colors.colorbg01};
    &::before {
      display: none;
    }
  `}

  ${Avatar} {
    flex-shrink: 0;
    width: 46px;
    height: 46px;
    font-weight: 400;
    background-color: ${props => props.theme.colors.colorbg03};
    color: #fff;
    margin-right: 10px;
    position: relative;

    &::before {
      display: block;
      right: 5px;
      box-shadow: 0 0 0 1.5px ${props => props.theme.colors.bodyBg};
    }

    i {
      font-style: normal;
      font-family: ${props => props.theme.fonts.numeric};
    }
  }

  ${props => props.selected && `
    background-color: ${props.theme.colors.bodyBg} !important;
  `}

  ${props => props.checked && css`
    ${Avatar} {
      background-color: ${props.theme.colors.green};
    }
  `}
`;

export const ChatItemBody = styled.div`
  flex: 1;
  color: ${props => props.theme.colors.colortx02};
  position: relative;

  h6 {
    font-weight: 600;
    color: ${props => props.theme.colors.colortx02};
    margin-bottom: 0;
  }

  p {
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.colortx02};
    margin-bottom: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 195px;
    letter-spacing: -.2px;
  }
`;

export const ChatsItems = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: 0;
`;

export const ChatsPanelSidebarBody = styled(PerfectScrollbar)`
  position: relative;
  height: calc(100% - 60px);
  overflow: hidden;

  ${ChatsItems} {
    padding: 0;
    border-radius: 0;

    ${Avatar} {
      width: 40px;
      height: 40px;

      &::before {
        display: none;
      }

      svg {
        stroke-width: 2.5px;
        width: 20px;
        height: 20px;
      }
    }
  }

  ${ChatItem} {
    background-color: transparent;

    + ${ChatItem} {
      margin-top: 1px;
      position: relative;

      &::before {
        border-top: 1px solid rgba(${props => hexToRgb(props.theme.input.borderColor)}, .6);
        position: absolute;
        display: block;
        content: '';
        top: -1px;
        left: 0;
        right: 0;
      }
    }
  }

  ${ChatItemBody} p {
    font-size: 12px;
    color: ${props => props.theme.colors.colortx03};
  }
`;

export const ChatsPanelBody = styled.div`
  flex: 1;
  position: relative;
`;

export const ChatsPanelBodyHeader = styled.div`
  height: 60px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${props => props.theme.input.borderColor};

  .custom-checkbox {
    padding-left: 0;
    padding-right: 1.5rem;

    ${CustomControlLabel} {
      font-size: 13px;

      &::before {
        border-radius: 3px;
      }

      &::before,
      &::after {
        left: auto;
        right: -1.5rem;
      }
    }
  }
`;

export const ChatsItemInfo = styled.div`
  h6 {
    margin-bottom: 2px;
  }
  p {
    margin-bottom: 0;
    font-size: 12px;
    color: ${props => props.theme.colors.colortx03};
  }
`;

export const ChatsPanelBodyContent = styled(PerfectScrollbar)`
  height: calc(100% - 60px);
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.bodyBg};
`;

export const MessageWrapper = styled.div`
    padding: 8px 10px;
    border: 1px solid ${props => props.theme.input.borderColor};
    border-radius: 4px;
    background-color: ${props => props.theme.colors.white};
    font-size: 13px;
    color: ${props => props.theme.colors.colortx02};

`;

export const MessageItem = styled.div`
  padding: 15px;
  display: flex;
  width: 60%;

  ${Avatar} {
    margin-right: 15px;
  }

  ${props => props.reverse && css`
    flex-direction: row-reverse !important;
    align-self: flex-end;

    ${Avatar} {
      margin-right: 0;
      margin-left: 15px;
    }
  `}
`;

export const NavLinkWithIcon = styled(CommonNavLinkWithIcon).attrs(props => (
  messageStatusToProps[props.status](props.theme.colors)
))`
  border: 1px solid ${props => props.theme.input.borderColor};
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  color: ${props => props.theme.colors.colortx02};
  display: flex;
  align-items: center;
  background-color: ${props => props.theme.colors.white};

  i {
    font-size: 16px;
    line-height: 1;
    margin-right: 5px;
  }

  & + & {
    margin-left: 5px;
  }

  &:hover, &:focus {
    border-color: ${props => props.color};
    color: ${props => props.color} !important;
  }

  ${({ color, background, active }) => active && `
    background-color: ${lighten(background, color)};
    border-color: ${color};
    color: ${color} !important;
  `}
`;

export const MessageItemBody = styled.div`
  flex: 1;

  .form-control {
    border-radius: 4px;
    border-color: ${props => props.theme.input.borderColor};
    padding: 8px 10px;
    transition: none;

    &:focus {
      box-shadow: none;
      border-color: ${props => darken(0.05, props.theme.input.borderColor)};
      ${props => shadowSharp(props.theme.colors.colorbg02)}
    }
  }

  ${Nav} {
    margin-top: 10px;
  }

  ${({ color, background, colorSaturation }) => color && css`
    ${MessageWrapper} {
      border-color: ${color};
      background-color: ${lighten(background, color)};
      color: ${darken(colorSaturation, color)};
    }
  `}
`;

export const BreakdownItem = styled(CommonBreakdownItem).attrs(props => (
  messageStatusToProps[props.status](props.theme.colors)
))`
  label {
    display: block;
    line-height: 1;
    margin-bottom: 2px;
    color: ${props => props.theme.colors.colortx02};
    font-weight: 600;
    font-size: 11px;
    letter-spacing: .5px;
    text-transform: uppercase;

    span {
      letter-spacing: normal;
      text-transform: none;
      font-weight: 400;
      font-size: ${props => props.theme.fontSizes.xs};
      color: ${props => props.theme.colors.colortx03};
    }
  }

  i {
    line-height: 1;
    position: relative;
    top: 4px;
  }

  h2 span {
    font-weight: 300;
    font-size: 20px;
    letter-spacing: -.5px;
    color: ${props => props.theme.colors.colortx02};
    position: relative;
    top: -3px;
  }

  h2, i::before {
    ${props => props.color && `color: ${props.color}`};
  }
`;

export const Card = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-clip: border-box;
  border: 0 solid rgba(0, 0, 0, 0.125);
  border-radius: 0.25rem;
  background-color: ${props => props.theme.colors.colorbg01};

  i {
    font-size: 64px;
    color: ${props => props.theme.colors.colortx03};
    line-height: 1;
    margin-bottom: 10px;
  }

  h4 {
    font-size: 24px;
    color: ${props => props.theme.colors.colortx01};
  }

  p {
    margin-bottom: 0;
    width: 45%;
    text-align: center;
    color: ${props => props.theme.colors.colortx03};
  }
`;

export const CardHeader = styled(CommonCardHeader)``;

export const CardTitle = styled(CommonCardTitle)``;

export const CardBody = styled(Row)`
  flex: 1 1 auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 40px 0 50px;
`;

export const CardComprop = styled.div.attrs({ className: 'card' })`
  border-color: ${props => props.theme.colors.colorbd02};
  ${props => shadowDiffuse({ color: props.theme.colors.colorbg02 })};

  ${CardHeader} {
    background-color: transparent;
    border-bottom-width: 0;
    padding: 20px 23px;
  }

  ${CardTitle} {
    margin-bottom: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.theme.colors.colortx01};
  }

  ${CardBody} {
    padding: 0 23px 23px;
  }
`;
