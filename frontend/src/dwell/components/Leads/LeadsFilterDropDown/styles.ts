import styled, { css } from 'styled-components';
import { DefaultDropdownMenu, WhiteButton } from 'styles/common';
import { DropdownToggle, DropdownMenu, DropdownItem, NavLink } from 'reactstrap';

export const NavFiltersGroup = styled.nav`
    letter-spacing: -0.3px;
    height: 40px;
    margin-right: auto;

    background-color: #f0f2f9;
    border-radius: 5px;
    align-self: stretch;
    align-items: stretch;

    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
`;

export const FiltersNavLink = styled(NavLink)`
    cursor: pointer;
    min-width: 120px;
    justify-content: center;

    padding: 0 15px;
    color: #4a5e8a !important;
    font-weight: 500;
    border-radius: inherit;
    border: 1.5px solid transparent;
    display: flex;
    align-items: center;
    outline: none;

    ${props => props.active && css`
        border-color: #3a8bfe;
        background-color: #f1f7ff;
        color: #243782 !important;
    `}

    small {
        font-weight: 400;
        font-size: ${props => props.theme.fontSizes.sm};
        font-family: ${props => props.theme.fonts.numeric};
        color: ${props => props.theme.colors.colortx02};
        margin-left: 8px;
        opacity: .5;
    }
`;

export const FiltersDropdownButton = styled(DropdownToggle)`
    outline: none;
    height: 40px;
    border: 1.5px solid transparent !important;
    background-color: transparent !important;
    padding: 0 12px 0 15px;
    display: flex;
    align-items: center;
    font-weight: 500;
    color: #4a5e8a !important;
    border-radius: 5px;
    box-shadow: none !important;
    color: ${props => props.theme.colors.colortx03} !important;

    &:hover, &:focus {
      box-shadow: none;
      border: 1.5px solid ${props => (props.active ? '#3a8bfe' : 'transparent')} !important;
      background-color: ${props => (props.active ? '#f1f7ff' : 'transparent')} !important;
    }

    ${props => props.active && css`
        border-color: #3a8bfe !important;
        background-color: #f1f7ff !important;
        color: #243782 !important;
    `}

    small {
        font-weight: 400;
        font-size: ${props => props.theme.fontSizes.sm};
        font-family: ${props => props.theme.fonts.numeric};
        color: ${props => props.theme.colors.colortx02};
        margin-left: 3px;
        opacity: .5;
    }
`;

export const CollapseIcon = styled.i`
    font-size: 10px;
    font-weight: 700;
    transform: rotate(90deg);
    margin-left: 10px;
`;

export const FiltersDropdownMenu = styled(DropdownMenu)`
    ${DefaultDropdownMenu}
    min-width: 200px;
    margin-top: 5px;
    padding: 6px 12px 12px;
    border: none;
`;

export const FiltersDropdownLabel = styled.label`
    font-size: 10px;
    font-family: ${props => props.theme.fonts.default};
    font-weight: 500;
    color: #929eb9;
    margin-bottom: 12px;

    line-height: 1;
    letter-spacing: .5px;
    text-transform: uppercase;
`;

export const FiltersDropdownItem = styled(DropdownItem)`
    margin-top: 3px;
    height: 38px;
    display: flex;
    align-items: center;
    padding: 0 15px;
    color: #4a5e8a;
    font-weight: 500;
    background-color: #f0f2f9;
    border: 1.5px solid transparent !important;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover, &:focus, &:active {
      cursor: pointer;
      background-color: #e1e6f7;
      color: #4a5e8a;
      outline: none;
    }
`;

export const NewFilterButton = styled(WhiteButton)`
    margin-top: 10px;
    height: 36px;
    justify-content: center;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    width: 100%;

    border-color: ${props => props.theme.input.borderColor};
    color: ${props => props.theme.colors.colortx02};

    &:hover {
      border-color: ${props => props.theme.colors.colorbg03};
      color: ${props => props.theme.colors.colortx02};
    }

    &:focus {
      outline: none;
    }
`;

export const NewFilterIcon = styled.i`
    margin-right: 5px;
    font-size: 16px;
    line-height: .7;
`;

export const FiltersDropdownItemIcon = styled.i`
    margin-left: auto !important;
    font-size: 14px;
    line-height: 1;
    color: #929eb9 !important;
    margin-right 0 !important;
`;
