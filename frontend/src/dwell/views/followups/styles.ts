import styled, { css } from 'styled-components';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { shadowSharp } from 'styles/mixins';
import { hexToRgb } from 'dwell/constants';
import { FormCheckBox as CommonFormCheckBox } from 'styles/common';
import { MoreActionNav } from 'dwell/views/calls/styles';

export const EnableFollowupsHeader = styled.h4``;

export const FollowUpsPanel = styled.div`
   ${props => (props.isLeadPage ? css`
        display: block;
        position: fixed;
        top: 234px;
        left: 400px;
        right: 25px;
        bottom: 28px;
        z-index: 10;
   ` : css`
        display: flex;
        min-height: calc(100vh - 64px);
        transition: all 0.25s;
   `)}
`;

export const EmailSidebar = styled.div`
    ${props => (props.isLeadPage ? css`
        width: 320px;
        position: absolute;
        top: 0;
        left: 0;
    ` : css`
        width: 375px;
        top: 64px;
        position: fixed;
        height: calc(100% - 60px);
    `)}
    background-color: ${props => props.theme.colors.gray100};
    overflow: hidden;
    bottom: 0;


    .mg-l-10 {
        margin-left: 10px;
    }

    .mg-r-auto {
        margin-right: auto;
    }

    .mg-r-10 {
        margin-right: 10px;
    }

    .mg-l-5 {
        margin-left: 5px;
    }

    .pd-15 {
        padding: 15px;
    }
`;

export const EmailSidebarHeader = styled.div`
    height: 60px;
    padding: 0 15px;
    display: flex;
    align-items: center;
    background-color: #fff;
    border-bottom: 1px solid ${props => props.theme.colors.colorbg01};
    border-right: 1px solid ${props => props.theme.colors.colorbg02};
`;

export const EmailSidebarHeaderTitle = styled.h6`
    font-size: 16px;
    font-weight: ${props => props.theme.fontWeights.semibold};
    color: ${props => props.theme.colors.colortx01};
    margin-bottom: 0;
    display: flex;
    align-items: center;

    span {
      margin-left: 8px;
      padding: 0 5px;
      font-weight: 400;
      font-size: 11px;
      color: ${props => props.theme.colors.colortx03};
      min-width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background-color: ${props => props.theme.colors.colorbg01};
    }
`;

export const FollowupsSidebarHeaderSpan = styled.span`
    margin-left: 8px;
    padding: 0 5px;
    font-weight: 400;
    font-size: 11px;
    color: ${props => props.theme.colors.colortx03};
    min-width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background-color: ${props => props.theme.colors.colorbg01};
`;

export const NoteSidebarHeaderAddButton = styled.a`
    width: ${props => props.theme.templates.heightBase};
    height: ${props => props.theme.templates.heightBase};;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff !important;
    border-radius: 5px;
    margin-right 4px;
    margin-left 4px;
    outline: none;
    background-color: #0168fa;
    border-color: #0168fa;
    :hover {
      background-color: #0153c7;
      border-color: ##0153c7;
      box-shadow: 0 1px 1px rgba(225,230,247,0.11), 0 2px 2px rgba(225,230,247,0.11), 0 4px 4px rgba(225,230,247,0.11), 0 6px 8px rgba(225,230,247,0.11), 0 8px 16px rgba(225,230,247,0.11);
    }
    i {
      font-size: 20px;
      line-height: 0;
    }
`;

export const NoteSidebarHeaderAddButtonSpan = styled.span``;

export const SidebarBody = styled(PerfectScrollbar)`
    height: calc(100% - 60px);
    position: relative;
    box-shadow: inset 0 0 0 1px ${props => props.theme.colors.colorbg02};
    background-color: rgba(${props => hexToRgb(props.theme.colors.gray100)}, .75);
    overflow: hidden;

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

export const EmailGroup = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

export const TimeWrapper = styled.div`
  margin-left: auto;
  margin-top: -3px;
  span:nth-child(2) {
    display: none;
  }

  span {
    color: ${props => props.theme.colors.colortx03} !important;
    font-size: 11px !important;
  }
`;

export const EmailItem = styled.li`
  display: flex;
  flex-direction: row;
  padding: 12px 15px;
  outline: none;
  border-right: 2px solid transparent;
  border-bottom: 1px solid ${props => props.theme.colors.colorbg01};
  transition: all 0.2s;
  cursor: pointer;

  border-top: 1px solid ${props => props.theme.colors.colorbg01};

  :hover {
    background-color: ${props => props.theme.colors.colorbg01};
    border-right-color: ${props => props.theme.colors.colorbg01};

    ${TimeWrapper} {
        span:nth-child(1) {
          display: none;
        }

        span:nth-child(2) {
          display: block;
        }
      }
  }

  &.active {
    border-right-color: ${props => props.theme.colors.colorui01};
    background-color: #fff;
    opacity: 1;
    .note-icon {
      color: ${props => props.theme.colors.colorui01};
      svg {
        fill: ${props => props.theme.colors.colorui01};
        fill-opacity: 0.1;
      }
    }
  }

  &.unread {
    background-color: #fff;
    opacity: 1;
    border-right-color: ${props => props.theme.colors.colorbg01};

    .email-number-indicator { display: flex; }

    .email-item-header span:first-child {
      color: $color-tx-01;
      font-weight: ${props => props.theme.fontWeights.medium};
    }

    .email-text { color: ${props => props.theme.colors.colortx01}; }
  }

  &.checked {
    background-color: ${props => props.theme.colors.colorlight01};
    border-right-color: ${props => props.theme.colors.colorbg01};
    + .checked { border-top-color: #d3e2fd; }
  }
`;

export const FollowupsMessageBody = styled.div`
    p {
    color: ${props => props.theme.colors.colortx01};
    font-weight: ${props => props.theme.fontWeights.medium};
    font-size: ${props => props.theme.fontSizes.sm};
    margin-bottom: 3px;
  }
`;

export const FormCheckBox = styled(CommonFormCheckBox)`
    margin-right: 10px;
`;

export const SenderAvatar = styled.div`
    width: ${props => props.theme.templates.heightmd};
    height: ${props => props.theme.templates.heightmd};
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100%;
    color: #fff;
    background-color: ${props => props.theme.colors.colorui01};
    text-transform: uppercase;
    font-size: 18px;
    font-weight: 400;
    position: relative;

    span {
        font-size: 14px;
        display: block;
        text-transform: uppercase;
    }

    ${props => props.showLinkedMark && css`
        &:after {
            content: '\\EB7A';
            font-family: 'remixicon';
            font-size: 9px;
            font-weight: 700;
            border: 1px solid #fff;
            border-radius: 100%;
            background-color: ${props.theme.colors.primary};
            color: #fff;
            position: absolute;
            top: -2px;
            right: 0;
            width: 14px;
            height: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `}
`;

export const EmailItemBody = styled.div`
    padding-left: 10px;
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    flex: 1;
    word-break: break-word;
`;

export const EmailItemHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 4px;

    span:first-child {
    color: ${props => props.theme.colors.colortx02};
    font-size: ${props => props.theme.fontSizes.xs};
    }
`;

export const EmailSubject = styled.h6`
    font-weight: ${props => props.theme.fontWeights.medium};
    color: ${props => props.theme.colors.colortx01};
    margin-bottom: 5px;
`;

export const EmailText = styled.p`
    margin-bottom: 2px;
    color: ${props => props.theme.colors.colortx03};
    font-size: ${props => props.theme.fontSizes.sm};
`;

export const ArchiveButton = styled.button`
    padding: 0 12px;
    ${props => !props.heightUnset && css`height: 32px;`}
    min-height: inherit;
    border-width: 1.5px;
    border-radius: 4px;
    font-weight: 500;
    font-size: 13px;
    display: flex;
    align-items: center;

    background-color: #fff;
    border-color: ${props => props.theme.input.borderColor};
    color: ${props => props.theme.colors.colortx02};

    &:hover, &:focus {
        border-color: ${props => props.theme.colors.colorui01};
        color: ${props => props.theme.colors.colorui01};
        background-color: ${props => props.theme.colors.colorlight01};
    }

    i {
        font-size: 18px;
        margin-right: 5px;
    }

`;

export const NavPager = styled.nav`

    &.disabled { color: ${props => props.theme.input.borderColor}; }

    .nav-link:last-child {
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
    }

    .nav-link:first-child {
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
    }
`;

export const NavButtons = styled.a`
    border: 1.5px solid #d5dcf4;
    width: 28px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    padding: 0;
    cursor: pointer;

     + .nav-link { margin-left: -1.5px; }

    color: ${props => props.theme.colors.colortx02};

    &:hover, &:focus {
          border-color: ${props => props.theme.colors.colorui01};
          color: ${props => props.theme.colors.colorui01};
          background-color: ${props => props.theme.colors.colorlight01};
          position: relative;
    }

`;

export const ShowMoreButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    padding: 15px;
`;

export const ShowMoreButton = styled.button`
    border-radius: 5px;
    border-width: 0;
    width: 90%;
    justify-content: center;
    box-shadow: ${props => props.theme.shadows.base};
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.colortx02} !important;
    background-color: rgba(225,230,247,0.6) !important;
    height: ${props => props.theme.templates.heightBase};
    :hover {
      color: ${props => props.theme.colors.colortx02} !important;
      background-color: #e1e6f7 !important;
      cursor: pointer;
    }
`;

// Showing email messages detail

export const EmailPanel = styled.div`
  background-color: #fff;
  position: relative;
  overflow-y: auto;
  ${props => (props.isLeadPage ? css`
    margin-left: 320px;
    width: calc(100% - 320px);
    height: 100%;
  ` : css`
    margin-left: 375px;
    width: calc(100% - 375px);
    height: calc(100vh - ${props.theme.templates.headerHeight});
  `)}
`;

export const EmailPanelBody = styled.div`
    padding: 25px;

    .mg-t-10 {
        margin-top: 10px;
    }

    .mg-l-8 {
        margin-left: 8px;
    }

    .d-flex {
        display: flex !important;
    }

    .btn-white {
        color:  ${props => props.theme.colors.colortx02};
        border-color: ${props => props.theme.input.borderColor};

        &:hover, &:focus {
          border-color: ${props => props.theme.colors.gray400};
        }
    }

`;

export const EmailPanelItem = styled.div`
    padding-bottom: 15px;
    padding-top: 15px;

    ${props => !props.hideBorder && css`
        border-bottom: 1px solid ${props.theme.colors.colorbg02};
    `}

    &.active {
        padding-bottom: 25px;
        padding-top: 15px;

        .media-mail-from .media-body p:last-child { display: block; }
        .email-body { display: flex; }
    }

  ${props => props.showCursor && css`cursor: pointer;`}
`;

export const EmailHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

export const MediaMailForm = styled.div`
    display: flex;
    align-items: flex-start;
`;

export const MediaAvatar = styled.div`
    width: ${props => props.theme.templates.heightlg};
    height: ${props => props.theme.templates.heightlg};
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100%;
    background-color: ${props => props.theme.colors.colorui01};
    color: #fff;
    text-transform: uppercase;
    font-size: 18px;
    font-weight: 300;
    font-family: ${props => props.theme.fonts.default};
`;

export const MediaBody = styled.div`
    margin-left: 12px;
    font-size: ${props => props.theme.fontSizes.sm};

    p {
      margin-bottom: 2px;

      &:last-child {
        font-size: ${props => props.theme.fontSizes.sm};
        color: ${props => props.theme.colors.gray500};
      }
    }

    strong { font-weight: ${props => props.theme.fontWeights.semibold}; }
`;

export const DropdownLinkedLead = styled(Dropdown)``;

export const DropdownLink = styled(DropdownToggle)`
    display: flex;
    align-items: center;
    padding: 0 15px;
    padding-left: 5px;
    height: ${props => props.theme.templates.heightBase};
    background-color: #fff;
    color: ${props => props.theme.colors.colorui01};
    border: 1.5px solid ${props => props.theme.colors.colorui01};
    border-radius: 4px;
    position: relative;
    font-weight: ${props => props.theme.fontWeights.medium};

    &:hover, &:focus{
      background-color: ${props => props.theme.colors.colorui01} !important;
      color: #fff !important;
    }

    &:after {
      font-size: 12px;
      display: inline-block;
      margin-left: 5px;
    }

    i {
      margin-right: 5px;
      margin-left: 5px;
      font-size: 16px;
      font-weight: 700;
      line-height: 1;
    }
`;

export const DropdownLinkedLeadMenu = styled(DropdownMenu)`
    min-width: 250px;
    border-width: 0;
    border-radius: 5px;
    padding: 20px;
    margin-top: 5px;
    border: 1px solid ${props => props.theme.colors.colorbg02};
    ${props => shadowSharp({ color: hexToRgb(props.theme.colors.colorui01) })};

    .badge {
        background-color: rgba(${props => props.theme.colors.colorui01}, 0.8);
        color: ${props => props.theme.colors.colorui01};
        font-size: 9px;
        font-weight: ${props => props.theme.fontWeights.semibold};
        font-family: ${props => props.theme.fontWeights.default};
        letter-spacing: 0.5px;
        padding: 5px 8px;
        border-radius: 3px;
        text-transform: uppercase;
    }

    .CONTACT_MADE {
        color: #9000ff;
        background-color: #f1deff;
    }

    .TOUR_SET {
        color: #fd7e14;
        background-color: #fff3e8;
    }

    .INQUIRY {
        color: #0168fa;
        background-color: #ddebff;
    }

    .TOUR_COMPLETED {
        color: #24ba7b;
        background-color: #e3faf0;
    }

    .WAITLIST {
        color: #70c4c2;
        background-color: #ebffff;
    }

    .APPLICATION_PENDING {
        color: #e83e8c;
        background-color: #fef4f9;
    }

    .APPLICATION_COMPLETE {
        color: #f3505c;
        background-color: #fff;
        border: 1px solid #f3505c;
    }

    p {
        font-size: ${props => props.theme.fontSizes.sm};
        color: ${props => props.theme.colors.gray600};
        margin-bottom: 15px;
    }

    .btn-block {
        justify-content: center;
        height: ${props => props.theme.templates.heightsm};
    }

    .btn-success {
        border-width: 0;
        background-color: ${props => props.theme.colors.teal};

        &:hover, &:focus {
          background-color: #1dae83;
        }
    }

`;

export const DropdownMenuHeader = styled.h6`
    margin: 10px 0 5px;
    font-size: ${props => props.theme.fontSizes.md};
    font-weight: ${props => props.theme.fontWeights.semibold};
    color: ${props => props.theme.colors.gray700};
`;

export const DropdownMenuLink = styled.button``;

export const EmailBody = styled.div`
    padding-top: 25px;
    ${props => (props.isLeadPage ? css`padding-left: 11px;` : css`padding-left: 52px;`)}
    flex: 1;
    flex-direction: column;

    + .email-body {
        padding-top: 25px;
        border-top: 1px dashed ${props => props.theme.colors.gray400};
    }
`;

export const EmailBodySubject = styled.h4`
    font-weight: 500;
    color: ${props => props.theme.colors.colortx01};
    margin-bottom: 25px;
`;

export const EmailBodyText = styled.div`
    color: ${props => props.theme.colors.colortx02};

    iframe {
        border: 0;
    }
`;

export const ReplyContainer = styled.div`
    margin-top: 25px;
    border: 1px solid ${props => props.theme.input.borderColor};
    padding: 10px;
    border-radius: ${props => props.theme.borders.radius};

    .cke_top {
        border: 0;
        background-color: #fff;
    }

    .cke_chrome {
        border: 0;
    }

    #cke_1_contents {
        height: 100px !important;
    }

`;

export const LeadLinkActionNav = styled(MoreActionNav)`
    a {
        border: 1px solid ${props => props.theme.input.borderColor};
        color: ${props => props.theme.colors.colortx02} !important;
        height: 30px;
        width: 30px;

        &:hover, &:focus {
            border-color: ${props => props.theme.colors.colorui01};
            background-color: ${props => props.theme.colors.colorlight01};

            i {
                color: ${props => props.theme.colors.colorui01};
            }
        }
    }

    i {
        vertical-align: middle;
    }
`;

export const AttachGroup = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    align-items: baseline;
    li {
        + li {
            margin-left: 10px;
        }
    }
`;

export const Thumbnail = styled.div`
  width: 80px;
  height: 80px;
  border: 1px solid #d5dcf4;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  cursor: pointer;

  &:hover, &:focus {
    ${props => shadowSharp({ color: hexToRgb(props.theme.colors.colorbg02) })};
  }

  i {
    font-size: 32px;
    color: #929eb9;
  }
`;

export const FileName = styled.small`
  width: 80px;
  word-break: break-word;
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #4a5e8a;
  text-align: center;
`;
