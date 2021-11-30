import styled, { css } from 'styled-components';
import { Dropdown, DropdownToggle, ButtonDropdown, DropdownMenu, DropdownItem } from 'reactstrap';
import { SelectMenu, DefaultDropdownMenu, DefaultDropdownItem } from 'styles/common';
import { shadowSharp } from 'src/styles/mixins';
import { hexToRgb } from 'dwell/constants';

export const MediaAvatar = styled.div`
    width: 38px;
    height: 38px;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100%;
    position: relative;
    background-color: ${props => props.theme.colors.colortx01};

    span {
        font-size: 14px;
        text-transform: uppercase;
    }
`;

export const MediaLead = styled.div`
    display: flex;
    align-items: center;
`;

export const MediaBody = styled.div`
    flex: none;
    flex-shrink: 0;
    padding-left: 10px;

    .fa-check-circle {
        color: ${props => props.theme.colors.success};
        font-size: 14px;
    }

    .fa-times-circle {
        color: ${props => props.theme.colors.danger};
        font-size: 14px;
    }
`;

export const MediaInfo = styled.div`
    margin-left: 25px;
`;

export const MediaLabel = styled.span`
    color: ${props => props.theme.colors.colortx03};
    font-size: 12px;
    display: block;
    margin-bottom: 2px;
`;

export const MediaValue = styled.div`
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 400;
    color: ${props => props.theme.colors.bodyColor};

    .DateInput_input {
        color: ${props => props.theme.colors.colortx01} !important;
        font-family: ${props => props.theme.fonts.base};
        font-weight: 400;
        font-size: 15px;
        width: 110px;
        height: 38px !important;
    }

    .fa-check-circle {
        color: ${props => props.theme.colors.success};
        font-size: 14px;
    }

    .fa-times-circle {
        color: ${props => props.theme.colors.danger};
        font-size: 14px;
    }
`;

export const DatePickerWrapper = styled.div`
    width: 110px;
`;

export const LeadName = styled.h6`
    margin-bottom: 3px;
    font-weight: 600;
    font-size: 16px;
    line-height: 21px;
`;

export const MediaLink = styled.a`
    height: ${props => props.theme.templates.heightxs};
    padding: 0 10px;
    display: flex;
    align-items: center;
    color: ${props => props.theme.colors.colortx02};

    :hover :focus() {
      color: ${props => props.theme.colors.colorui01};
    }

    :before {
      bottom: -14px;
      z-index: 10;
    }

    &:active {
      color: ${props => props.theme.colors.colorui01};
      letter-spacing: normal;
    }

    + .nav-link { margin-left: 10px; }
`;

export const PMSSyncStatus = styled.div`
    display: flex;
    align-items: center;
    font-size: 11px;
    color: #98a4c1;
    ${props => props.status === 'SUCCESS' && `color: ${props.theme.colors.green};`}
    ${props => props.status === 'FAILURE' && `color: ${props.theme.colors.red};`}

    span {
        display: flex;
        align-items: center;
        i {
            font-size: 14px;
            line-height: 1;
            margin-right: 2px;
            font-family: 'remixicon' !important;
            font-style: normal;
            -webkit-font-smoothing: antialiased;
        }
  }
`;

export const DetailDropdownToggle = styled(DropdownToggle)`
    min-width: 194px;
    display: flex;
    height: auto;
    padding: 0;
    font-size: 14px;
    text-indent: -1px;
    background-color: transparent;
    border-width: 0;
    border-bottom-width: 1px;
    border-radius: 0;
    color: #0b2151;
    appearance: none;
    align-items: center;
    justify-content: space-between;
    border-color: #d9def0;

    &:hover, &:active {
        background-color: #fff !important;
        border-color: ${p => (p.disabled ? 'transparent' : '#d9def0')}  !important;
    }

    &:focus, &:active:focus {
        box-shadow: none !important;
    }

    &:disabled {
        background-color: #fff !important;
        cursor: text;
        border-color: transparent !important;
        color: #0b2151;
        opacity: 1;
    }
`;

export const OverviewDropdown = styled(Dropdown)`
    ${p => p.isOpen && css`
        > .dropdown-toggle {
            color: #0b2151;
            background-color: #fff !important;
            border-color: ${p.disabled ? 'transparent' : '#d9def0'}  !important;
        }
    `}
`;

export const OverviewDropdownMenu = styled(SelectMenu)`
    min-width: 194px;
    max-width: fit-content;
`;

export const ContentNavBar = styled.div`
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-bottom: 0;
    margin-left: auto;
`;

export const NavLeadOption = styled.nav`
`;

export const StageDropdown = styled(ButtonDropdown)`
    margin-left: 8px;
    height: 100%;
    :hover {
      background-color: #fff;
      border-color: ${props => props.theme.colors.colorbg03};
      ${props => shadowSharp({ color: hexToRgb(props.theme.colors.colorbg02) })};
    }

    .dropdown-toggle {
        padding-left: 15px;
        padding-right: 6px;
    }
`;

export const StageDropdownMenu = styled(DropdownMenu)`
    ${DefaultDropdownMenu}
    padding: 8px;

    overflow: visible !important;
    max-height: none !important;
    min-width: 150px;
    border-color: ${props => props.theme.templates.borderColor};
    border-radius: 5px;
    margin-top: 5px;

    border: 1px solid #d5dcf4;
`;

export const CustomDropdownItem = styled(DropdownItem)`
    ${DefaultDropdownItem}
    white-space: nowrap;
    display: flex;
    align-items: center;
    position: relative;

    &:hover {
        background-color: #ebf2fe;
        color: #0168fa;
    }
`;

const colorCircles = css`
    &:before {
      content: '';
      display: block;
      width: 10px;
      height: 10px;
      border-radius: 100%;
      margin-right: 8px;
    }

    &.inquiry:before { background-color: ${props => props.theme.colors.blue}; }
    &.contact_made:before { background-color: ${props => props.theme.colors.violet}; }
    &.tour_set:before { background-color: ${props => props.theme.colors.orange}; }
    &.tour_completed:before { background-color: ${props => props.theme.colors.green}; }
    &.waitlist:before { background-color: ${props => props.theme.colors.lightGreen}; }
    &.application_pending:before { background-color: ${props => props.theme.colors.pink}; }
    &.application_complete:before { background-color: ${props => props.theme.colors.red}; }
`;

export const StageDropdownItem = styled(CustomDropdownItem)`
    ${colorCircles};
`;

export const ControlButtons = styled.a`
    width: ${props => props.theme.templates.heightBase};
    height: ${props => props.theme.templates.heightBase};;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    color: ${props => props.theme.colors.colortx02} !important;
    border: 1px solid ${props => props.theme.input.borderColor} !important;
    border-radius: 5px;
    margin-left: 8px;
    outline: none;
    cursor: pointer;
    @include transition(all 0.2s);

    &:hover {
      background-color: #fff;
      border-color: ${props => props.theme.colors.colorbg03} !important;
      ${props => shadowSharp({ color: hexToRgb(props.theme.colors.colorbg02) })};
    }

    i {
      font-size: 20px;
      line-height: 0;
    }
`;

export const DropdownLink = styled(DropdownToggle)`
    display: flex;
    align-items: center;
    height: ${props => props.theme.templates.heightBase};
    padding-left: 15px;
    border-radius: 5px;
    border: 1px solid ${props => props.theme.input.borderColor};
    background-color: #fff;
    color: ${props => props.theme.colors.colortx02};
    position: relative;
    appearance: none;

    &:focus {
        box-shadow: none;
    }

    &:hover {
      background-color: #fff;
      color: ${props => props.theme.colors.colortx02};
      border-color: ${props => props.theme.colors.colorbg03} !important;
      ${props => shadowSharp({ color: hexToRgb(props.theme.colors.colorbg02) })};
    }

    &:after {
        content: '\\EBA8' ;
        font-family: 'remixicon';
        padding-left: 1px;
        border-top: 0;
        font-size: 11px;
        top: 50%;
        transform: rotate(90deg);
        line-height: 0;
        opacity: .5;
    }

    &[aria-expanded="true"] {
      background-color: #fff !important;
      color: ${props => props.theme.colors.colortx02} !important;
      ${props => shadowSharp({ color: hexToRgb(props.theme.colors.colorbg02) })} !important;
    }
`;

export const StageDropdownLink = styled(DropdownLink)`
    ${colorCircles}
`;

export const UnassignedItem = styled.div`
    padding-left: 0.5rem;
`;

export const StatusDropdownMenu = styled(StageDropdownMenu)`
    min-width: 150px;
    border-color: #d5dcf4;
    border-radius: 5px;
    ${props => shadowSharp({ color: hexToRgb(props.theme.colors.colorbg02) })} !important;
    padding: 8px;
    width: 340px;
`;

export const StatusDropdownItem = styled(CustomDropdownItem)`
    padding: 6px 10px 8px;
    outline: none;
    width: auto;
    height: auto;
    white-space: normal;
    display: block;
    font-size: 12px;

    &:not(:first-child) {
        margin-top: 2px;
    }

    strong {
        font-weight: 600;
        color: #0b2151;
        margin-bottom: 2px;
        font-size: 14px;
        display: flex;
        align-items: center;
    }

    &:hover {
         background-color: #ebf2fe;
         color: rgb(74, 94, 138);
    }

    ${props => props.selected && css`
        strong {
            color: #0168fa;
        }
        strong i {
            color: #0168fa;
            margin-left: 2px;
        }
    `}
`;
