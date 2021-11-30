import styled from 'styled-components';
import { ModalHeader, ModalBody, ModalFooter, Row, FormFeedback } from 'reactstrap';

export const TaskModalHeader = styled(ModalHeader)`
    border-bottom-width: 0;
    padding: 25px 30px;
    position: relative;

    .modal-title {
        font-weight: 500;
        font-size: 20px;
        color: #344563;
        margin-bottom: 0;
    }

    .close {
        font-size: 24px;
        font-weight: 400;
        line-height: 1;
        color: #657697;
        font-family: 'remixicon' !important;
        font-style: normal;
        padding: 10px 5px;
        :before {
            content: "\\eb99";
        }
    }
`;

export const TaskModalBody = styled(ModalBody)`
    padding: 0 30px 30px;

    .form-group {
        margin-bottom: 0;
    }

    .reminder-checkbox {
        padding-top: 20px;
    }

    .DateInput_input {
        border-bottom: 1px solid ${props => props.theme.colors.gray400} !important;
        padding: 6px 12px;
    }

    .rw-input {
        padding: 0.55rem .857em;
    }

    .col-6 {
        padding-left: 10px;
        padding-right: 10px;
    }
`;

export const TaskModalFooter = styled(ModalFooter)`
    display: flex;
    flex-direction: row;
    border-top: 1px solid #fff;
    padding: 15px 30px 30px;
    border-top-width: 0;

    button {
        opacity: 1;
        height: 38px;
        padding-left: 20px;
        padding-right: 20px;
        margin: 0;
    }

    .btn-secondary {
        background-color: #fff;
        height: 40px;
        padding-left: 20px;
        padding-right: 20px;
        margin: 0;
        color: ${props => props.theme.colors.gray600};

        :hover {
            background-color: #fff;
            border-color: ${props => props.theme.colors.gray400};
        }
    }

    .btn-primary {
        margin-left: 10px !important;
        background-color: ${props => props.theme.colors.colorui01};
        border-color: ${props => props.theme.colors.colorui01};

        :hover {
            background-color: ${props => props.theme.colors.colorui02};
            border-color: ${props => props.theme.colors.colorui02};
        }
    }
`;

export const InlineRow = styled(Row)`
    margin-left: -10px;
    margin-right: -10px;
`;

export const DueDateFeedback = styled(FormFeedback)`
    margin-top: 0.6rem!important;
`;

export const TogglePlaceHolder = styled.span`
    color: ${props => props.theme.colors.gray600} !important;
`;
