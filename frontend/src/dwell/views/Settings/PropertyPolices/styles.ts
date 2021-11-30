import styled from 'styled-components';
import { FormSwitchWrapper } from 'dwell/views/Settings/BusinessHours/styles';

export const FormLabel = styled.label`
  font-size: 13px;
  font-weight: 400;
  margin-bottom: 0;
`;

export const SectionDivider = styled.hr`
  border-color: #eaedf5;
  margin: 20px 0;
`;

export const FormYesNoSwitch = styled(FormSwitchWrapper).attrs({ dataOn: 'Yes', dataOff: 'No', label: true })`
  margin: 8px 0px;
  .switch-slider {
        width: 55px;
        &:before {
          left: ${props => (props.checked ? '5px' : '3px')};
        }
     }
`;

export const PolicyWrapper = styled.div`
  .form-control {
    color: #233457;
    border-radius: 5px;
    height: 36px;
    border: 1px solid #d9def0;
    font-size: 13px;

    &:focus {
      box-shadow: none;
      border-color: #b4bfe2;
    }
  }

  textarea {
    height: auto !important;
  }

  .custom-control-label, .label-checkbox {
    font-size: 13px;
    font-weight: 400;
    margin-bottom: 0;
  }

  .select__control {
    border: 1px solid #d9def0 !important;
    box-shadow: none;

    &--is-focused {
      box-shadow: none;
      border-color: #b4bfe2 !important;
    }

    .select__placeholder {
      color: #233457;
      font-size: 13px;
    }
  }

  .btn-primary {
    padding: 0 15px;
    height: 38px;
    border-radius: 5px;
    margin-top: 5px;
  }
`;

export const FormSwitch = styled.button`
  border: none;
  margin-bottom: 0;
  width: 30px;
  height: 16px;
  background-color: ${props => (props.checked ? props.theme.colors.green : props.theme.colors.gray400)};
  border-radius: 10px;
  position: relative;
  transition: background-color 0.25s;
  cursor: pointer;

  &:focus {
      outline: none;
  }

  &:before {
    content: '';
    width: 12px;
    height: 12px;
    background-color: #fff;
    border-radius: 100%;
    position: absolute;
    top: 2px;
    left: ${props => (props.checked ? '16px' : '2px')};
    transition: left 0.25s;
  }
`;
