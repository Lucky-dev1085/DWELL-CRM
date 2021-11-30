import styled from 'styled-components';
import { PrimaryButton, Avatar as CommonAvatar } from 'styles/common';
import { Link } from 'react-router-dom';
import { Badge, Input, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

export const ContentNavbar = styled.div`
    display: flex;
    padding: 10px;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(193,200,222,0.2);
`;

export const NavRight = styled.div`
    display: flex;
`;

export const LeadsPrimaryBtn = styled(PrimaryButton)`
    border-width: 0;
    flex-shrink: 0;
    padding-left: 18px;
    padding-right: 18px;
    font-weight: 500;
    letter-spacing: -0.2px;
    text-transform: capitalize;
    color: rgba(255,255,255,0.85);
    height: 38px;
`;

export const FormSearch = styled.div`
    border-width: 1.5px;
    border-color: #f0f2f9;
    padding: 0 10px;
    width: 220px;
    height: 40px;
    display: flex;
    align-items: center;
    height: 38px;
    background-color: #f0f2f9;
    border: 1px solid transparent;
    border-radius: 6px;
`;

export const FormSearchInput = styled(Input)`
    border: none !important;
    margin-bottom: 0 !important;
    margin-left: 8px;
    padding: 0px;
    border-width: 0px;
    border-radius: 0px;
    min-width: 100px;
    height: auto;
    background-color: transparent;
    text-shadow: none;
    font-weight: 500;
    letter-spacing: -0.2px;

    &:focus {
         box-shadow: none;
         background-color: #f0f2f9;
    }
`;

export const LeadsButtonIcon = styled.i`
    margin-left: -5px;
    margin-right: 5px;
`;

export const StageBadge = styled(Badge)`
    font-size: 11px;
    font-family: ${props => props.theme.fonts.default};
    font-weight: 400;
    padding: 5px 10px 6px;
    border-radius: 3px;
    display: inline-block;
    border: 1px solid;
`;

export const ColumnsSettingsIcon = styled(DropdownToggle)`
    font-size: 16px;
    cursor: pointer;
`;

export const ColumnsSettingDropdownMenu = styled(DropdownMenu)`
    max-height: unset;
    max-width: unset;
    overflow-y: unset;
    padding: 10px 15px 0px 15px;
    border-radius: ${props => props.theme.borders.radius};
    width: 200px;
    border-width: 0;
    margin-right: -10px;
    box-shadow: 2px 5px 45px rgba(36,55,130,0.12),
     0 1px 2px rgba(225,230,247,0.07),
      0 2px 4px rgba(225,230,247,0.07),
       0 4px 8px rgba(225,230,247,0.07),
        0 8px 16px rgba(225,230,247,0.07),
         0 16px 32px rgba(225,230,247,0.07),
          0 32px 64px rgba(225,230,247,0.07);
    transform: translate3d(-180px, 20px, 0px) !important;
`;

export const ColumnsSettingDropdownMenuLabel = styled.label`
    font-size: 10px;
    color: ${props => props.theme.colors.colortx03};
    margin-bottom: 10px;
`;

export const ColumnsSettingsDropdownItem = styled(DropdownItem)`
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.colortx02};
    position: relative;
    display: flex;
    align-items: center;
    padding: 0;
    border: 0;

    &::before {
        content: '';
        font-family: 'remixicon';
        font-size: 12px;
        font-weight: 400;
        display: flex;
        justify-content: center;
        width: 14px;
        height: 14px;
        background-color: rgba(233,234,240,0.6);
        border-radius: 2px;
        margin-right: 15px;
        line-height: 1.2;
    }

    &.active {
        background-color: transparent;
        color: ${props => props.theme.colors.gray800};

        &::before {
            background-color: ${props => props.theme.colors.colorui01};
            content: '\\EB7A';
            color: #fff;
        }
    }
`;

export const MoreActionDropDownMenu = styled(DropdownMenu)`
    border-radius: ${props => props.theme.borders.radius};
    border-color: ${props => props.theme.input.borderColor};
    margin-right: -5px;
    padding: 5px;
    box-shadow: 2px 5px 45px rgba(36,55,130,0.12), 0 1px 2px rgba(225,230,247,0.07), 0 2px 4px rgba(225,230,247,0.07),
     0 4px 8px rgba(225,230,247,0.07), 0 8px 16px rgba(225,230,247,0.07), 0 16px 32px rgba(225,230,247,0.07), 0 32px 64px rgba(225,230,247,0.07);
`;

export const MoreActionDropDownItem = styled(DropdownItem)`
    color: ${props => props.theme.colors.colortx02};
    padding: 6px 8px;
    border-radius: 5px;
    outline: none;
    display: flex;
    align-items: center;
    transition: all 0.25s;
    border: 0;

    &:hover, &:focus {
        background-color: ${props => props.theme.colors.colorbg01};
        color: ${props => props.theme.colors.colortx02};
    }

    &:active:not(:focus) {
        background-color: unset;
    }

    i {
        font-size: 18px;
        line-height: 1;
        margin-right: 8px;
        margin-left: 0;
    }
`;

export const ContextMenuItem = styled.div`
      position: absolute;
      background-color: white;
      border-radius: 0.25rem;
      padding: 10px 0;
      z-index: 1;
      border: none;
      box-shadow: 0 1px 2px rgba(152,164,193,0.07), 0 2px 4px rgba(152,164,193,0.07), 0 4px 8px rgba(152,164,193,0.07), 0 8px 16px rgba(152,164,193,0.07), 0 16px 32px rgba(152,164,193,0.07), 0 32px 64px rgba(152,164,193,0.07);
`;

export const ContextMenuLink = styled(Link)`
    padding: 10px 20px;
    color: #4a5e8a;

    &:hover {
      text-decoration: none;
      color: #4a5e8a;
    }
`;

export const Avatar = styled(CommonAvatar)`
    overflow: hidden;
    background-color: ${props => props.theme.colors.colorbg03};
    color: #fff;

    span {
        font-size: ${props => props.theme.fontSizes.sm};
        font-family: ${props => props.theme.fonts.secondary};
    }

    &:before {
        content: unset;
    }
`;
