import styled from 'styled-components';
import * as variables from './styledVariables';

export const ModalFormLabel = styled.label`
  font-size: ${variables.fontSizeSm};
  letter-spacing: .2px;
  color: ${variables.colorTx02} !important;
  margin-bottom: 6px !important;
  font-weight: 400;
`;

export const ModalText = styled.p`
  margin-bottom: 0;
  color: ${variables.colorTx02};
  font-size: 15px;
  line-height: 1.55;
`;

export const CustomSwitch = styled.div`
  padding-left: 2.25rem;
  position: relative;
  display: block;
  min-height: 1.3125rem;
  margin-top: 20px;
  margin-bottom: 10px;
`;

export const SwitchLabel = styled.label`
  position: relative;
  margin-bottom: 0;
  vertical-align: top;
  display: inline-block;
  color: #4a5e8a !important;
  font-size: .875rem !important;
  letter-spacing: unset !important;

  &:before {
    left: -2.25rem;
    width: 1.75rem;
    pointer-events: all;
    border-radius: 0.5rem;
    position: absolute;
    top: 0.15625rem;
    display: block;
    height: 1rem;
    content: "";
    border: #a0a9bd solid 1px;
    transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  &:after {
    position: absolute;
    content: "";
    background: no-repeat 50% / 50% 50%;
    top: calc(0.15625rem + 2px);
    left: calc(-2.25rem + 2px);
    width: calc(1rem - 4px);
    height: calc(1rem - 4px);
    background-color: #a0a9bd;
    border-radius: 0.5rem;
    transition: transform 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
`;

export const SwitchInput = styled.input`
  position: absolute;
  left: 0;
  z-index: -1;
  width: 1rem;
  height: 1.15625rem;
  opacity: 0;

  &:checked ~ ${SwitchLabel}:after {
    background-color: #fff;
    transform: translateX(0.75rem);
  }

  &:disabled:checked ~ ${SwitchLabel}::before {
    background-color: rgba(32, 168, 216, 0.5);
  }

  &:checked ~ ${SwitchLabel}:before {
    color: #fff;
    border-color: #0168fa;
    background-color: #0168fa;
  }

  &:focus ~ ${SwitchLabel}:before {
    box-shadow: 0 0 0 0.2rem rgba(1,104,250,0.25);
  }
`;
