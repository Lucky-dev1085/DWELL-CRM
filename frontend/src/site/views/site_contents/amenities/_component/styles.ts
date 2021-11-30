import styled from 'styled-components';
import { Button } from 'reactstrap';
import { shadowSharp } from 'src/styles/mixins';
import { hexToRgb } from 'dwell/constants';

export const DetailItem = styled.div`
  border-radius: 4px;
  background-color: ${props => props.theme.colors.gray100};
  border: 1px solid ${props => props.theme.input.borderColor};
  display: flex;
  align-items: center;
  padding: 6px;
  height: 42px;
  margin-bottom: 5px;
  z-index: 1100;
  ${props => shadowSharp({ color: hexToRgb(props.theme.colors.colorbg02) })};
`;

export const ButtonDrag = styled.div`
  min-height: 0;
  width: 20px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border-radius: 3px;
  color: ${props => props.theme.colors.colortx03};

  &:hover, &:focus {
    cursor: move;
    background-color: ${props => props.theme.colors.colorbg02};
    color: ${props => props.theme.colors.colortx02};
  }

  &:active {
    box-shadow: none;
  }

  i {
    line-height: 1;
    font-size: 16px;
    margin-right: 0;
  }
`;

export const DetailsText = styled.div`
  padding: 0 5px;
  font-size: 13px;
  width: calc(100% - 76px);
  max-width: calc(100vw - 510px);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-height: 19px;
`;

export const ButtonRemove = styled.div`
  margin-left: auto;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.colortx03};
  background-color: #fff;
  border: 1px solid ${props => props.theme.colors.colorbg03};
  border-radius: 4px;
  text-shadow: none;
  font-weight: 400;
  opacity: .5;
  cursor: pointer;

  i {
    line-height: 0;
    font-weight: 400;
    font-size: 18px;
    position: relative;
  }

  &:hover {
    opacity: .75;
  }
`;

export const DetailsPlaceholder = styled.div`
  height: 42px;
  margin-bottom: 5px;
  position: absolute;
  top: 0;
  border-radius: 4px;
  border: 1px dashed ${props => props.theme.input.borderColor};
  width: 100%;
  pointer-events: none;
  z-index: 1;
`;

export const ButtonOutline = styled(Button)`
  display: flex;
  align-items: center;
  height: 36px;
  color: ${props => props.theme.colors.colorui01};
  border-color: ${props => props.theme.colors.colorui01};
  font-size: 13px;

  &:hover, &:active {
    color: #fff;
    background-color: ${props => props.theme.colors.colorui01} !important;
    border-color: ${props => props.theme.colors.colorui01} !important;
  }

  &:focus {
    box-shadow: 0 0 0 0.2rem rgba(1,104,250,0.5);
  }

  i {
    line-height: 1;
    font-size: 16px;
    margin-right: 3px;
  }
`;

export const FormAmenity = styled.div`
  border-radius: 4px;
  border: 1px solid ${props => props.theme.input.borderColor};
  background-color: ${props => props.theme.colors.gray100};
  padding: 10px;
  ${props => shadowSharp({ color: hexToRgb(props.theme.colors.colorbg02) })};

  .cke_chrome {
    border: 1px solid #d5dcf4 !important;
    border-radius: 3px;
    ${props => props.editorInvalid && `
      border-color: #f86c6b !important;
    `}
  }

  .cke_contents {
    height: 100px !important;
  }
`;

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;

  button {
    height: 36px;
    padding: 0 12px;
    font-size: 13px;
  }
`;

export const DetailsWrapper = styled.div`
  .row>div+div::before {
    content: '';
    position: absolute;
    top: 0;
    left: -1px;
    bottom: 0;
    border-left: 1px solid #e1e6f7;
  }
`;

export const CommonButton = styled(Button)`
  font-size: 13px;
  white-space: nowrap;
`;

export const SelectWrapper = styled.div`
  .css-1uccc91-singleValue, .css-1wa3eu0-placeholder {
    color: ${props => (props.isDisabled ? props.theme.colors.colortx03 : props.theme.colors.bodyColor)};
  }

  .css-yk16xz-control, .css-1pahdxg-control {
    border-color: #d9def0 !important;
    outline: none !important;
    box-shadow: none !important;
    min-height: 36px !important;
    font-size: 13px;

    ${props => props.invalid && `
    border-color: #f86c6b !important;
  `}
  }

  .css-26l3qy-menu {
    z-index: 1300;
  }
`;
