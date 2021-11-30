import styled, { css } from 'styled-components';
import { shadowDropdown } from 'compete/components/common/mixin';

export const DropdownWrapper = styled.div`
  ${props => props.isMenu && css`
    .dropdown {
      text-align: -webkit-center;
    }
  `}

  .dropdown span {
    font-weight: 500;
    margin-left: 3px;
    display: flex;
    align-items: center;
    color: ${props => props.theme.colors.colorui01};
    cursor: pointer;

    ${props => props.isMenu && css`
      width: 22px;
    `}

    i {
      margin-left: 2px;
      font-weight: 400;
    }

    &:hover {
      color: #0148ae;
    }
  }

  .dropdown-item {
    border-radius: 4px;
    margin-bottom: 1px;
    color: ${props => props.theme.colors.gray900};
    background-color: #fff;
    padding: ${props => (props.isMenu ? '7px 10px' : '4px 10px')};
    border: none;
    font-size: ${props => (props.isMenu ? '13px' : '14px')};
    outline: none;

    &:hover {
      background-color: ${props => props.theme.colors.colorbg01} !important;
    }
  }

  .active {
    background-color: ${props => props.theme.colors.colorlight01};
    color: ${props => props.theme.colors.colorui01};
  }

  .dropdown-menu {
    padding: 5px !important;
    border-color: ${props => props.theme.colors.colorbd02} !important;
    ${props => shadowDropdown(props.theme.colors.colorbg02)};
  }
`;
