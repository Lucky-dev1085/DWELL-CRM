import styled from 'styled-components';
import { CustomInput, Input, Label, Col } from 'reactstrap';
import { shadowSharp } from 'src/styles/mixins';
import { hexToRgb } from 'dwell/constants';

export const ModalSubtitle = styled.p`
    color: #657697;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 400;
    margin-top: 3px;
`;

export const InputLabel = styled(Label)`
    font-size: 13px;
    color: #4a5e8a !important;
    letter-spacing: .2px;
`;

export const FilterNameInput = styled(Input)`
    height: 40px;
    border-radius: 4px;
    max-width: 85%;

    &:focus {
        box-shadow: 0 0 0 0.5px #3085fe !important;
        border-color: #3085fe !important;
    }
`;

export const ConditionsSelectGroup = styled.div`
    margin-top: 1rem;
    color: #4a5e8a;
    display: flex;
    margin-bottom: 1rem;
`;

export const ConditionsRadio = styled(CustomInput)`
    cursor: pointer;
    margin-right: 1rem;
    label {
      color: #4a5e8a !important;
      font-size: 14px !important;
    }

    input:checked ~ label::before {
      background-color: ${props => props.theme.colors.colorui01} !important;
      border-color: ${props => props.theme.colors.colorui01} !important;
    }
`;

export const ConditionCustomSelect = styled(Input)`
    appearance: none;
    height: 40px;
    border-radius: 4px;
    padding-left: 8px;

    transition: background-color 0.15s ease-in-out,border-color 0.15s ease-in-out,box-shadow 0.15s ease-in-out;

    display: inline-block;
    width: 100%;
    padding: .375rem 1.75rem .375rem .75rem;
    font-size: .875rem;
    font-weight: 400;
    line-height: 1.5;
    color: #233457;
    vertical-align: middle;
    background: #fff url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5' viewBox='0 0 4 5'%3e%3cpath fill='%2315274d' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e") no-repeat right .75rem center/8px 10px;
    border: 1px solid #d5dcf4;

    &:focus {
        box-shadow: 0 0 0 0.5px #3085fe;
        border-color: #3085fe;
    }
`;

export const AddConditionButton = styled.button`
    border-color: ${props => props.theme.input.borderColor};
    height: ${props => props.theme.templates.heightsm};
    padding: 0 10px;
    font-size: ${props => props.theme.fontSizes.xs};
    color: ${props => props.theme.colors.colortx02} !important;
    display: flex;
    align-items: center;

    &:hover, &:focus {
      border-color: ${props => props.theme.colors.colorbg03};
      ${props => shadowSharp({ color: hexToRgb(props.theme.colors.colorbd02) })};
    }

    &:active {
      border-color: ${props => props.theme.colors.colorbg03};
      ${props => shadowSharp({ color: hexToRgb(props.theme.colors.colorbg03) })};
    }

    span {
        margin-right: 5px;
        font-size: 18px;
        font-weight: 300;
        display: block;
        position: relative;
        margin-bottom: 2px;
    }
`;

export const AddConditionLink = styled.span`
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;

    color: #0168fa;
    text-decoration: none;
    background-color: transparent;

    &:hover {
        color: #0148ae;
    }
`;

export const RemoveCondition = styled.a`
    display: flex;
    align-items: center;

    font-size: 18px;
    color: #929eb9 !important;
    opacity: .75;

    text-decoration: none;
    background-color: transparent;
    cursor: pointer;
`;

export const RemoveCol = styled(Col)`
      padding: 0;
`;

export const FilterItems = styled.div`
    input, input:focus {
        color: ${props => props.theme.colors.gray700};
    }
    .SingleDatePickerInput .DateInput_input {
         font: inherit;
         font-size: .875rem;
    }

    .row {
      margin-top: 10px;

      .col-sm-6, .col-sm-4, .col-sm-3 {
            padding-right: 0;
            .row {
                  margin-top: 0;
            }
      }

      .col-sm-6 + .col-sm-6 {
            padding-right: 15px;
      }
    }
`;
