import styled, { css } from 'styled-components';

export const DropdownWrapper = styled.div`
  .select-input {
    height: 38px !important;
  }

  .dropdown-toggle {
    border-radius: 4px;
    border-color: ${props => props.theme.input.borderColor} !important;
    color: ${props => props.theme.colors.gray700} !important;
    justify-content: left !important;

    &:focus, &:hover {
      box-shadow: none !important;
      background-color: #fff !important;
    }

    &:after {
        border-color: #888 transparent transparent transparent;
        border-style: solid;
        border-width: 5px 4px 0 4px;
        height: 0;
        margin-left: -4px;
        margin-top: -2px;
        position: absolute;
        top: 50%;
        right: 11px;
        width: 0;
    }

    ${props => props.isOpen && css`&::after {
      transform: rotate(180deg);
    }`}
  }

  .dropdown-item {
    border-radius: 4px;
    margin-bottom: 1px;
    color: ${props => props.theme.colors.bodyColor};
    background-color: #fff;
    padding: 6px 10px;
    border: none;
    font-size: 14px;

    &:hover {
      color: #fff !important;
      background-color: ${props => props.theme.colors.colorui01} !important;
    }
  }

  .dropdown-menu {
    width: 100% !important;
    padding: 4px !important;
    border-radius: unset !important;
    border-bottom-right-radius: 4px !important;
    border-bottom-left-radius: 4px !important;
    top: -8px !important;
    border-color: ${props => props.theme.input.borderColor} !important;
    ${props => props.$noScroll && `
      max-height: fit-content;
    `}
  }

  ${props => props.isSearch && css`
    .dropdown-toggle {
      padding-right: 20px;
      border-bottom-right-radius: unset;
      border-top-right-radius: unset;
      color: #fff !important;
      background-color: ${props.theme.colors.colorui01} !important;

      &:focus, &:hover {
        background-color: #0158d4 !important;
      }

      &:after {
        border-color: #fff transparent transparent transparent;
      }
    }

    .select-input {
      height: 42px !important;
    }
  `}

  ${props => props.disabled && css`
    opacity: 0.6;
    pointer-events: none;
  `}
`;

export const Divider = styled.div`
  border-top: 1px solid #dfe1e8;
  margin: 8px 0;
  padding: 0;
`;
