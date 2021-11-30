import styled, { css } from 'styled-components';
import darken from '@bit/styled-components.polished.color.darken';
import * as variables from './styledVariables';

export const FormSwitcher = styled.div`
  margin-bottom: 0;
  width: 30px;
  height: 14px;
  background-color: ${variables.green};
  border-radius: 10px;
  position: relative;
  transition: background-color 0.25s;

  &:focus, &:hover {
    cursor: pointer;
    background-color: ${darken('0.05', variables.green)};
  }

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    background-color: #fff;
    border-radius: 100%;
    position: absolute;
    top: 2px;
    left: 18px;
    transition: left 0.25s;
  }

  ${props => (props.inactive ? css`
    background-color: ${variables.gray400};

    &:focus, &:hover {
      background-color: ${variables.gray500};
    }

    &::before { left: 2px; }
  ` : '')}

  ${props => props.disabled && css`
    pointer-events: none;
    opacity: 0.6;
  `}
`;
