import { Modal } from 'reactstrap';
import styled, { css } from 'styled-components';
import * as variables from './styledVariables';

export const ModalWindow = styled(Modal)`
  max-width: 600px;

  .modal-content .close {
    padding: 10px 5px;
    font-size: 24px;
    font-weight: 400;
    line-height: 1;
    color: #657697;
    outline: none;
  }

  .modal-content {
    border-width: 0;
    box-shadow: none;
    border-radius: 10px;
  }

  .modal-header {
    border-bottom-width: 0;
    padding: 25px 30px;
    position: relative;
  }

  .modal-title {
    margin-bottom: 0;
    height: 28px;
    font-weight: 500;
    font-size: 18px !important;
    color: #344563;
    line-height: 28px;
  }

  .modal-body {
    padding: 0 30px 30px;

    .form-group {
      margin-bottom: 16px;
    }
  }

  .modal-footer {
    padding: 15px 30px 30px;
    border-top-width: 0;

    .btn {
      height: ${variables.heightMd};
      padding-left: 20px;
      padding-right: 20px;
      margin: 0;
      border-radius: 0.25rem;

      + .btn { margin-left: 10px; }
    }
  }

  .btn-white {
    background-color: #fff;
    border-color: ${variables.borderColor};
    color: ${variables.colorTx02};
    display: flex;
    align-items: center;

    i {
      font-size: 16px;
    }
  }

  .btn-danger {
    color: #fff;
    background-color: #f3505c;
    border-color: #f3505c;

    &:hover {
      background-color: #f12c3b;
      border-color: #f02030;
    }
  }

  input.form-control { height: ${variables.heightLg}; }
  select.form-control { height: ${variables.heightLg}; }

  .form-control {
    color: ${variables.colorTx01};
    font-size: ${variables.fontSizeBase};
    border-radius: 4px;
    border-color: ${variables.colorBg03} !important;
    text-shadow: none;
    transition: all 0.25s;

    &:focus {
      border-color: #afb7d4;
      box-shadow: 0 1px 1px rgba(192, 198, 221, 0.25),
                  0 2px 2px rgba(192, 198, 221, 0.2),
                  0 4px 4px rgba(192, 198, 221, 0.15),
                  0 8px 8px rgba(192, 198, 221, 0.1),
                  0 16px 16px rgba(192, 198, 221, 0.05);
    }
  }

  ${props => (props.isInvalid ? css`
    background: none;
    border-color: #f86c6b !important;
  ` : '')}

  .form-select {
    select { width: 100%; }
  }

  .is-invalid {
    background: none;
    border-color: #f86c6b !important;
  }

  .form-control:focus, .dropdown-toggle:focus, input:focus, .rw-state-focus > .rw-widget-container, .select__control--is-focused {
    border-color: #b0b9d5 !important;
    box-shadow: 0 1px 1px rgba(193,200,222,0.25), 0 2px 2px rgba(193,200,222,0.2), 0 4px 4px rgba(193,200,222,0.15), 0 8px 8px rgba(193,200,222,0.1), 0 16px 16px rgba(193,200,222,0.05) !important;;
  }

  .btn-primary:hover {
    color: #fff;
    background-color: #0158d4;
    border-color: #0153c7;
  }
`;
