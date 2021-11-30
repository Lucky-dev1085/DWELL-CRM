import styled from 'styled-components';
import { Col, Row } from 'reactstrap';
import { AppSwitch } from '@coreui/react';

export const HeaderRow = styled(Row)`
    padding: 0 0 10px;
    margin: 0;

    .open-slider-header {
        padding-left: 6rem;
    }
`;

export const HeaderColumn = styled(Col)`
    font-size: 13px;
    font-weight: 400;
    color: #929eb9;
    padding-left: 0;
    padding-right: 0;
`;

export const FormBarColumn = styled(Col)`
    display: flex;
    align-items: center;
    padding: 0;

    label {
        color: #0b2151;
        font-weight: 500;
    }
`;

export const FormSwitch = styled.button`
    border: none;
    margin-left: 10px;
    margin-bottom: 0;
    width: 30px;
    height: 14px;
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
      width: 10px;
      height: 10px;
      background-color: #fff;
      border-radius: 100%;
      position: absolute;
      top: 2px;
      left: ${props => (props.checked ? '18px' : '2px')};
      transition: left 0.25s;
    }
`;

export const FormSwitchWrapper = styled(AppSwitch)`
    margin-left: 5.5rem;

    .switch-slider {
        width: 54px;
        background-color:  ${props => (props.checked ? props.theme.colors.green : props.theme.colors.colorbg02)} !important;
        border-color: ${props => (props.checked ? props.theme.colors.green : '#e1e6f7')} !important;

        &:after {
            font-size: 9px;
            font-family: "Helvetica Neue",Arial,sans-serif;
            color: ${props => props.theme.colors.colortx03};
            font-weight: 800;
        }

        &:before {
            left: 3px;
            width: 24px;
            height: 20px;
            background-color: #fff;
            border-radius: 3px;
            box-shadow: 0 1px 3px rgba(9,21,52,0.1);
            transition: left 0.25s;
            border-color: #ffffff !important;
        }
    }
`;

export const HeaderTime = styled(Col)`
    display: flex;
    justify-content: center;
`;
