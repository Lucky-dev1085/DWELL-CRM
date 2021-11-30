import styled, { css } from 'styled-components';

export const CustomControl = styled.div`
  position: relative;
  min-height: 1.3125rem;
  padding-left: 1.5rem;
`;

export const ControlLabel = styled.label`
  position: relative;
  margin-bottom: 0;
  vertical-align: top;
  font-weight: 400;

  &:before {
    position: absolute;
    top: .15625rem;
    left: -1.5rem;
    display: block;
    width: 1rem;
    height: 1rem;
    pointer-events: none;
    content: '\\EB7A';
    font-family: 'remixicon';
    font-size: 12px;
    font-weight: 700;
    line-height: 1.3;
    padding-left: 1px;
    background-color: #fff;
    border: #a0a9bd solid 1px;
    transition: background-color 0.15s ease-in-out,border-color 0.15s ease-in-out,box-shadow 0.15s ease-in-out;
    border-radius: 3px;
  }

  &:after {
    position: absolute;
    top: 0.15625rem;
    left: -1.5rem;
    display: block;
    width: 1rem;
    height: 1rem;
    content: "";
    background: no-repeat 50% / 50% 50%;
    border-radius: 3px;
    ${props => (!props.checked ? css`
      background-color: white;
      border: 1px solid #c1c8de;
    ` : '')}
  }
`;

export const ControlInput = styled.input`
  position: absolute;
  z-index: -1;
  opacity: 0;

  &:checked ~ ${ControlLabel}:before {
    color: #fff;
    border-color: #0168fa;
    background-color: #0168fa;
  }
`;
