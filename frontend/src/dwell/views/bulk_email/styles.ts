import styled from 'styled-components';
import { Card, Label, CardHeader, Nav, NavLink, FormGroup, CardFooter, CardText, Button, CardBody } from 'reactstrap';

export const EmptyFollowups = styled.h4``;

export const BulkContentHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 15px;
`;

export const BulkContentBody = styled(CardBody)`
    padding: 0;
`;

export const CardBulk = styled(Card)`
    border-color: #e0e6f3;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(224,230,243,0.07), 0 2px 4px rgba(224,230,243,0.07), 0 4px 8px rgba(224,230,243,0.07), 0 8px 16px rgba(224,230,243,0.07), 0 16px 32px rgba(224,230,243,0.07), 0 32px 64px rgba(224,230,243,0.07);
`;

export const CardHeaderBulk = styled(CardHeader)`
    background-color: transparent;
    padding: 15px 20px;
    border-bottom-color: #e0e6f3;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

export const CardFooterBulk = styled(CardFooter)`
    background-color: transparent;
    padding: 15px 20px;
    border-top-color: #e0e6f3;

    .btn {
        height: 40px;
        padding-left: 20px;
        padding-right: 20px;
    }

    .btn-primary {
        background-color: ${props => props.theme.colors.colorui01} !important;
    }

    .btn-white {
        background-color: #fff !important;
        color: ${props => props.theme.colors.gray700};
    }
`;

export const CustomCardTitle = styled.h6`
    font-size: 16px;
    margin-bottom: 0;
    font-weight: 600;
    color: ${props => props.theme.colors.colortx01};
`;

export const NavCircle = styled(Nav)`
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
`;

export const NavLinkCircle = styled(NavLink)`
      padding: 0;
      width: ${props => props.theme.templates.heightxs};
      height: ${props => props.theme.templates.heightxs};
      border-radius: 5px;
      border: 1px solid ${props => props.theme.colors.colorbg02};
      font-family: ${props => props.theme.fonts.secondary};
      font-weight: 500;
      color: ${props => props.theme.colors.colortx03} !important;
      display: flex;
      align-items: center;
      justify-content: center;
      outline: none;
      cursor: pointer;

      + .nav-link { margin-left: 5px; }

      &.active {
        background-color: ${props => props.theme.colors.colorlight01};
        border-color: ${props => props.theme.colors.colorui01};
        color: ${props => props.theme.colors.colorui01} !important;
      }

      &.done {
        background-color: ${props => props.theme.colors.colorui01};
        border-color: transparent;
        color: #fff !important;
      }
`;

export const CustomInputLabel = styled(Label)`
    font-weight: 400;
`;

export const SelectRecipientsContainer = styled(CardBody)`
    input[type="text"], input[type="tel"], select, .dropdown-toggle {
        height: 42px !important;
        border-color: #d5dcf4;
        border-width: 1px;
    }

    .form-control:focus, .dropdown-toggle:focus, input:focus, .rw-state-focus > .rw-widget-container, .select__control--is-focused {
        border-color: #3085fe !important;
        box-shadow: none !important;
    }
`;

export const CustomFormGroup = styled(FormGroup)`
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
`;

export const CustomFormLabel = styled(Label)`
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.colortx02};
    display: block;
    margin-bottom: 12px;
    line-height: 1;
    font-weight: 400;
`;

export const RadioButtons = styled.div``;

export const RecipientsCardTitle = styled.h6`
    font-size: 16px;
    font-weight: 400;
`;

export const RecipientsCard = styled(Card)`
    border-width: 0;
    border-radius: 6px;
    background-color: ${props => props.theme.colors.colorui01};
    color: #fff;

    .btn {
      background-color: rgba(255,255,255,0.16);
      border-color: rgba(255,255,255,.6);
      color: rgba(255,255,255,.75);
      justify-content: center;
      width: 100%;
      font-size: ${props => props.theme.fontSizes.sm};

       :hover {
        background-color: #fff !important;
        color: ${props => props.theme.colors.colorui01} !important;
      }
    }

    small {
        font-size: 11px;
        color: rgba(255,255,255,0.6);
    }
`;

export const RecipientsCardText = styled(CardText)`
    font-size: 13px;
    font-weight: 300;
    opacity: .75;
    margin-bottom: 20px;
`;

export const RecipientsCardNumber = styled.h1`
    font-weight: 300;
    font-size: 48px;
    font-family: "Rubik",sans-serif;
    margin-bottom: 2px;
    text-indent: -3px;
    line-height: 1;
`;

export const PreviewEmailButton = styled(Button)`
    height: 38px;
    &.disabled {
        background-color: unset !important;
        color: unset! important;
        &:hover {
            background-color: unset !important;
            color: unset! important;
        }
    }
`;

export const ComposeCardBody = styled(CardBody)`
    padding: 10px;
    .card {
        border: 1px solid #fff;
    }

    .input-group-text {
        color: ${props => props.theme.colors.bodyColor} !important;
        font-weight: 500 !important;
        padding-right: 0;
    }
`;

export const ActiveRecipientsSwitch = styled.div`
    margin-bottom: 10px;

    .switch-info .switch-input:checked + .switch-slider {
        background-color: ${props => props.theme.colors.colorui01};
        border-color: white;

        &:before {
            border: none;
        }
    }
`;
