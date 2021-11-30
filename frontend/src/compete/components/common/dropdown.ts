import { Dropdown as DefaultDropdown } from 'reactstrap';
import styled from 'styled-components';
import { shadowDropdown, shadowSharp, parseColor } from './mixin';

export const Dropdown = styled(DefaultDropdown)`
  .btn {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid ${props => props.theme.colors.colorbg02};
    border-radius: 5px;
    outline: none;
    transition: all 0.25s;
    box-shadow: none !important;
    background-color: transparent !important;

    &:hover {
      border-color: rgba(${props => parseColor(props.theme.colors.colorbg03).toString()},0.6);
      ${props => shadowSharp(props.theme.colors.colorbg02)} !important;
    }

    i {
      font-size: 20px;
      color: ${props => (!props.$setting ? props.theme.colors.colortx02 : 'rgba(74,94,138,0.75)')};
      line-height: 1;

      &:hover {
        ${props => (props.$setting && `color: ${props.theme.colors.colorui01};`)}
      }
    }

    &:not(.dropdown-toggle) {
      ${props => props.$setting && 'border: none;'}
    }
  }

  .dropdown-menu {
    width: 340px;
    max-height: 300px;
    overflow: visible;
    font-size: 13px;
    padding: 18px 20px 20px;
    margin-top: 5px;
    border-radius: 5px;
    color: ${props => props.theme.colors.bodyColor};
    border-color: rgba(${props => parseColor(props.theme.colors.colorbg03).toString()},0.6);
    ${props => shadowDropdown(props.theme.colors.colorbg02)};

    h6 {
      color: ${props => props.theme.colors.colortx01};
      font-weight: 600;
      font-size: .875rem;
    }
  }
`;
