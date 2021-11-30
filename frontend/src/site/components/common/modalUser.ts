import styled, { css } from 'styled-components';
import lighten from '@bit/styled-components.polished.color.lighten';
import * as variables from './styledVariables';
import { parseColor } from './mixin';
import { ModalWindow } from './modal';
import { CustomSelect } from './common';

export const ModalUser = styled(ModalWindow)`
  max-width: 640px;
  ${props => props.step === 2 && css`max-width: 740px;`}

  .modal-body {
    padding: 0 30px;

    .form-group {
      margin-bottom: 10px;
    }

    .row:not(:first-child) {
      margin-top: 10px;
    }
  }

  .modal-title {
    font-size: 20px !important;
  }

  .form-control, ${CustomSelect} {
    &:focus {
      border-color:  ${lighten('0.1', variables.colorUi01)} !important;
      box-shadow: 0 1px 5px rgba(${parseColor(variables.colorUi02).toString()}, .3), 0 0 0 .5px  ${lighten('0.1', variables.colorUi01)} !important;
    }

    &::placeholder { color: ${variables.colorTx03}; }
  }

  .multi-select-custom {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  .image-uploader-avatar{
    cursor: pointer;
    margin: auto 0;
    p:first-child {
      color: #0096FF;
      margin-bottom: 0;
      margin-top: 15px;
      font-weight: bold;
    }
    p:last-child {
      color: gray;
    }
  }

  select.form-control, input.form-control { color: ${variables.colorTx02}; }

  label {
    font-size: 13px;
    margin-bottom: 5px;
    letter-spacing: .2px;
    color: #929eb9;
  }
`;
