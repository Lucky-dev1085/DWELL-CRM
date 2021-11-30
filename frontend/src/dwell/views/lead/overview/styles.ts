import styled, { css } from 'styled-components';
import { Card, CardBody, CardHeader, Col, Input, Row, CardFooter, DropdownMenu, DropdownToggle } from 'reactstrap';
import { hexToRgb } from 'dwell/constants';
import { PrimaryButton } from 'styles/common';

export const LeadOverviewBody = styled.div`
    flex: 1;
    margin-left: 20px;
`;

export const LeadOverviewBodyContainer = styled.div`
    padding: 25px;
    display: flex;
    flex-direction: row-reverse;
    height: calc(100vh - 150px);
    position: relative;
    overflow: hidden;
`;

export const LeadOverviewSidebar = styled.div`
    width: 290px;
    height: calc(100vh - 200px);
    position: unset;
    overflow-y: auto;
    padding-right: 1px;

    &:hover {
        &::-webkit-scrollbar-thumb {
            background-color: ${props => props.theme.colors.colorbg03};
        }
    }

    &::-webkit-scrollbar {
        width: 2px;
        background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background-color: transparent;
    }
`;

export const CardWidgetHeader = styled(CardHeader)`
    position: relative;
    padding: 20px 20px 0;
    background-color: transparent;
    border-bottom-width: 0;
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;

    &:first-child {
        border-radius: 5px 5px 0 0;
    }
`;

export const CardWidgetBody = styled(CardBody)`
    position: relative;
    padding: 20px;

    &:last-child {
        border-bottom-right-radius: inherit;
        border-bottom-left-radius: inherit;
    }
`;

export const CardWidgetTitle = styled.h6`
    ${props => !props.$small && `
        color: ${props.theme.colors.colortx01};
        font-size: 15px;
        font-weight: 600;
    `}
    margin-bottom: 0;
`;

export const CardWidgetFooter = styled(CardFooter)`
    border-top-width: 0;
    padding: 10px 30px 30px;
    background-color: #fff;
`;

export const CardWidget = styled(Card)`
    border-color: ${props => props.theme.colors.colorbg02};
    position: relative;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(225,230,247,0.07),
    0 2px 4px rgba(225,230,247,0.07),
    0 4px 8px rgba(225,230,247,0.07),
    0 8px 16px rgba(225,230,247,0.07),
    0 16px 32px rgba(225,230,247,0.07),
    0 32px 64px rgba(225,230,247,0.07);
    margin-bottom: 20px;

    ${p => p.size === 'sm' && css`
        ${CardWidgetBody} {
            padding: 20px;
        }

        ${CardWidgetFooter} {
            padding: 0 20px 25px;
        }
    `}
`;

export const LeadEdit = styled.a`
    cursor: pointer;
    color: #0168fa !important;
    text-decoration: none !important;
    background-color: transparent;

    &:hover {
        color: #0148ae !important;
        text-decoration: none !important;
    }

    i {
      font-size: 16px;
      line-height: 1;
      margin-right: 5px;
    }

    span {
      display: flex;
      align-items: center;
    }
`;

export const LeadDetailGroup = styled(Row)`
`;

export const FormGroup = styled.div`
    margin-bottom: 0;
    display: flex;
`;

export const FormIcon = styled.div`
    width: 40px;
    height: 40px;
    background-color: ${props => props.theme.colors.colorbg01};
    border-radius: 3px;
    flex-shrink: 0;
    margin-right: 15px;
    display: flex;
    align-items: center;
    justify-content: center;

    i {
        font-size: 24px;
        font-weight: 400;
        line-height: 0;
        color: ${props => props.theme.colors.colortx03};
    }
`;

export const FormLabel = styled.label`
    color: ${props => props.theme.colors.colortx03};
    margin-bottom: 1px;
    font-size: 12px;
    font-weight: 400;
    line-height: 1;
`;

export const FormCol = styled(Col)`
    & + & {
        margin-top: 10px;
    }
`;

export const FormInput = styled(Input)`
    height: auto;
    width: 194px;
    border-width: 0 !important;
    border-bottom-width: 1px !important;
    border-radius: 0;
    padding: 0;
    font-size: 14px;
    color: #0b2151;
    background-color: transparent !important;
    margin-bottom: 0 !important;
    border-color: ${p => (p.readOnly ? 'transparent !important' : '#d9def0 !important')};

    ${p => p.readOnly && css`
        background-color: #fff;
    `}

    &:focus {
        box-shadow: none;
        border-color: ${p => (p.readOnly ? 'transparent' : '#d9def0')};
        color: #0b2151;
    }

    &.is-invalid:focus {
         box-shadow: none;
    }
`;

export const Activity = styled.div`
    position: relative;
    display: flex;
    align-items: flex-start;

    &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 18.5px;
        height: 80px;
        border-left: 1px solid rgba(36,55,130,0.1);
    }

    &:not(:first-child) {
        margin-top: 25px;
    }

    &:last-child {
        &:before {
            display: none;
        }
    }
`;

export const ActivityIcon = styled.div`
    background-color: ${p => p.color};

    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100%;
    flex-shrink: 0;
    position: relative;
    color: #fff;

    i {
        font-size: 18px;
        line-height: 0;
    }
`;

export const ActivityBody = styled.div`
    padding-left: 15px;
    flex: 1;

    p {
        font-size: 13px;
        color: #4a5e8a;
        margin-bottom: 0;
        text-overflow: ellipsis;
        overflow: hidden;
        width: 310px;
        white-space: nowrap;
        height: 20px;

        a {
            color: #0168fa;
            cursor: text;
            &:hover {
                text-decoration: none;
            }
        }
    }

    small {
        font-size: 12px;
        display: block;
        color: #929eb9;
    }
`;

export const ActivityBodyHeader = styled.h6`
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #0b2151;
`;

export const ActivityTitle = styled.a`
    color: inherit;
    text-decoration: none;
    background-color: transparent;
    cursor: ${p => (p.isClickable ? 'pointer' : 'default')};

    ${p => p.isClickable && css`
        &:hover, &:focus {
             color: #0168fa !important;
        }
    `}
`;

export const ActivityDate = styled.small`
    font-size: 11px;
    color: #929eb9;
`;

export const CardWidgetButton = styled.a`
    background-color: ${p => (p.color === 'primary' ? '#0168fa' : '#fff')};
    border: 1px solid ${p => (p.color === 'primary' ? '#0168fa' : '#dfe1e8')};
    justify-content: center;
    height: 38px;
    color: ${p => (p.color === 'primary' ? '#fff' : '#4a5e8a')} !important;
    font-size: 13px;
    cursor: pointer;
    min-height: 38px;
    display: flex;
    align-items: center;
    padding: 0 15px;
    border-radius: 5px;

    &:hover, &focus {
        color: ${p => (p.color === 'primary' ? '#fff' : '#0b2151')} !important;
        background-color: ${p => (p.color === 'primary' ? '#0168fa' : '#fff')};
        border: 1px solid ${p => (p.color === 'primary' ? '#0168fa' : 'rgba(146,158,185,0.5)')};
        box-shadow: 1px 2px 8px rgba(36,55,130,0.06), 1px 2px 25px rgba(36,55,130,0.04);
    }

    transition: color 0.15s ease-in-out,background-color 0.15s ease-in-out,border-color 0.15s ease-in-out,box-shadow 0.15s ease-in-out;
`;

export const TaskWrapper = styled.div`
    box-shadow: none;
    border: 1px solid #e1e6f7;
    background-color: #fff;
    border-radius: 5px;

    &:not(:first-child) {
        margin-top: 10px;
    }
`;

export const PropertyItemsList = styled.div`
    color: #0b2151;
`;

export const CardWidgetPrimaryButton = styled(PrimaryButton)`
    height: 38px;
    width: 100%;
    justify-content: center;
    font-size: 13px;
    ${props => props.inverse && `
        color: ${props.theme.colors.colorui01};
        background-color: #fff;

        &:hover {
            color: #fff;
            background-color: ${props.theme.colors.colorui01};
            border-color: ${props.theme.colors.colorui01};
        }
        &:focus {
            color: ${props.theme.colors.colorui01};
            background-color: #fff;
            border-color: ${props.theme.colors.colorui01};
            box-shadow: none;
        }
    `}
`;

export const FormDataWrapper = styled.div`
    ${p => !p.isEditing && css`
        width: 90%;
    `}

    .select__control {
        height: auto;
        border-width: 0;
        border-bottom-width: 1px;
        border-radius: 0;
        padding: 0 0 3px;
        font-size: 15px;
        color: #0b2151;
        background-color: transparent !important;
        margin-bottom: 0;
        border-color: #d9def0;

        &:hover {
            border-color: #d9def0;
        }
    }

    .select__indicators {
        svg {
            cursor: pointer;
            fill: #0b2151;
        }

        .select__indicator-separator {
            background-color: #d9def0;
        }
    }

    .select__placeholder {
        color: #0b2151;
    }

    .select__multi-value {
        background-color: white;
    }

    .select__multi-value__label {
        color: #0b2151;
    }

    .select__multi-value__remove {
        color: #0b2151;
        cursor: pointer;

        &:hover {
            background-color: #fff;
            color: #f86c6b;
        }
    }

    .select__control--is-focused {
        box-shadow: none !important;
    }

    .select__menu-list {
        max-height: 200px;
    }

    .select__value-container {
        width: 157px;
    }

    .react-tel-input .form-control {
        padding: 0;
        font-size: 14px;
        height: 22px;
    }

    .DateInput_fang {
        display: none;
    }
`;

export const AcquisitionDropdownMenu = styled(DropdownMenu)`
  margin-top: 5px;
  width: 400px;
  padding: 0;
  border-color: ${props => props.theme.colors.colorbd02};
  border-width: 0;
  left: 114px !important;
  box-shadow: 2px 5px 45px rgba(${props => hexToRgb(props.theme.colors.colorui02)}, .12),
              0 1px 2px rgba(${props => hexToRgb(props.theme.colors.colorbg02)}, 0.07),
              0 2px 4px rgba(${props => hexToRgb(props.theme.colors.colorbg02)}, 0.07),
              0 4px 8px rgba(${props => hexToRgb(props.theme.colors.colorbg02)}, 0.07),
              0 8px 16px rgba(${props => hexToRgb(props.theme.colors.colorbg02)}, 0.07),
              0 16px 32px rgba(${props => hexToRgb(props.theme.colors.colorbg02)}, 0.07),
              0 32px 64px rgba(${props => hexToRgb(props.theme.colors.colorbg02)}, 0.07);

  .table {
    border-collapse: separate;
    border-spacing: 0;
    border-width: 0;
    margin: 0;
    color: ${props => props.theme.colors.bodyColor};

    tr:first-child {
      th,td {
        &:first-child { border-top-left-radius: 4px; }
        &:last-child { border-top-right-radius: 4px; }
      }
    }

    tr:last-child {
      th,td {
        &:first-child { border-bottom-left-radius: 4px; }
        &:last-child { border-bottom-right-radius: 4px; }
      }
    }

    tr + tr {
      th,td { border-top-width: 0; }
    }

    th,
    td {
      font-size: ${props => props.theme.fontSizes.sm};
      padding: 7px 10px;

      + td { border-left-width: 0; }
    }

    th {
      font-weight: 500;
    }

    .wd-15p {
      width: 15%;
    }

    .wd-35p {
      width: 35%;
    }

    .wd-50p {
      width: 50%;
    }
  }
`;

export const AcquisitionDropdownLink = styled(DropdownToggle)`
  color: ${props => props.theme.colors.colorui01} !important;
  margin-left: 10px;
  cursor: pointer;
  margin-left: 0;
`;

export const Divider = styled.hr`
    border-color: #eaedf5;
    ${props => props.$isRoommate && `
        margin: 0 20px !important;
    `}
`;

export const DatePickerWrapper = styled.div`
    .SingleDatePicker_picker {
        position: fixed;
        left: 160px !important;
        bottom: unset !important;
        top: ${props => (props.top ? (props.top + 35) : 600)}px;
        z-index: 1100;
    }
`;
