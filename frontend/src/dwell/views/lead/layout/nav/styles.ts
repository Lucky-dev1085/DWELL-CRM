import styled, { css } from 'styled-components';
import { DropdownToggle, DropdownMenu, DropdownItem, ButtonDropdown } from 'reactstrap';
import { DefaultDropdownItem, DefaultDropdownMenu } from 'styles/common';

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

export const LeadDetailAction = styled.div`
    padding: 30px;
    display: flex;
    min-height: calc(100vh - 260px);
`;

export const Title = styled.h4`

`;

export const NavLine = styled.nav`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: -2px;
    margin-left: 20px;
    margin-right: auto;
    color: ${props => props.theme.colors.colortx02};

`;

export const NavLink = styled.a`
    position: relative;
    height: ${props => props.theme.templates.heightxs};
    padding: 0 10px;
    justify-content: center;
    display: flex;
    align-items: center;
    display: flex;
    flex-direction: column;
    font-weight: 400 !important;
    margin-right: 10px;

    :hover {
        color: ${props => props.theme.colors.colorui01} !important;
        cursor: pointer;
    }

    &.active {
        color: ${props => props.theme.colors.colorui01} !important;
        font-weight: 500 !important;
        letter-spacing: normal;

        &:before {
            bottom: -15px;
            z-index: 10;
            display: block;
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            height: 2px;
            background-color: #0168fa;
        }
    }
`;

export const ContentNavBar = styled.div`
    height: ${props => props.theme.templates.headerHeight};
    padding: 0 25px;
    background-color: #fff;
    display: flex;
    align-items: center;
    border-top: 1px solid ${props => props.theme.colors.colorbg02};
    border-bottom: 1px solid ${props => props.theme.colors.colorbg02};
`;

export const NavPager = styled.nav`
    height: 100%;
    display: flex;
    align-items: center;
`;

export const Arrow = styled.a`
    outline: none;
    width: 34px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6579a1;
    background-color: #fff;
    border: 1px solid #e1e6f7;
    transition: all 0.2s;
    cursor: pointer;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    margin-left: -1px;

    &:focus {
        outline: none;
    }

    &:hover {
          background-color: #fff;
          color: #2d3c68;
    }

    &:first-child {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
        margin-left: 0;
    }
`;

export const NavLeadOption = styled.nav`

`;

export const StageDropdown = styled(ButtonDropdown)`
    margin-left: 8px;
    height: 100%;
    :hover {
      background-color: #fff;
      border-color: ${props => props.theme.colors.colorbg3};
      box-shadow: 0 1px 1px rgba(225,230,247,0.11), 0 2px 2px rgba(225,230,247,0.11), 0 4px 4px rgba(225,230,247,0.11), 0 6px 8px rgba(225,230,247,0.11), 0 8px 16px rgba(225,230,247,0.11);
    }

    .dropdown-toggle {
        padding-left: 15px;
        padding-right: 6px;
    }
`;

export const StageDropdownMenu = styled(DropdownMenu)`
    ${DefaultDropdownMenu}
    padding: 8px;
    // margin-left: -10px;

    overflow: visible !important;
    max-height: none !important;
    min-width: 150px;
    border-color: ${props => props.theme.templates.borderColor};
    border-radius: 5px;
    margin-top: 5px;

    border: 1px solid #d5dcf4;
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
      color: ${props => props.theme.colors.colortx02};
      box-shadow: 0 1px 1px rgba(225,230,247,0.11), 0 2px 2px rgba(225,230,247,0.11), 0 4px 4px rgba(225,230,247,0.11), 0 6px 8px rgba(225,230,247,0.11), 0 8px 16px rgba(225,230,247,0.11);

    }

`;

export const StageDropdownLink = styled(DropdownLink)`
    ${colorCircles}
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

    :hover {
      background-color: #fff;
      border-color: ${props => props.theme.colors.colorbg3};
      box-shadow: 0 1px 1px rgba(225,230,247,0.11), 0 2px 2px rgba(225,230,247,0.11), 0 4px 4px rgba(225,230,247,0.11), 0 6px 8px rgba(225,230,247,0.11), 0 8px 16px rgba(225,230,247,0.11);
    }

    i {
      font-size: 20px;
      line-height: 0;
    }
`;

export const UnassignedItem = styled.div`
    padding-left: 0.5rem;
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

export const StatusDropdownMenu = styled(StageDropdownMenu)`
    min-width: 150px;
    border-color: #d5dcf4;
    border-radius: 5px;
    box-shadow: 0 1px 1px rgba(193,200,222,0.11), 0 2px 2px rgba(193,200,222,0.11), 0 4px 4px rgba(193,200,222,0.11), 0 6px 8px rgba(193,200,222,0.11), 0 8px 16px rgba(193,200,222,0.11);
    padding: 8px;
    width: 340px;

`;
