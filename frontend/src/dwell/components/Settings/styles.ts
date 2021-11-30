import styled from 'styled-components';
import { Modal } from 'reactstrap';

export const CustomModal = styled(Modal)`

    .modal-body {
        padding: 0 30px 30px;
    }

    .modal-content {
        border-width: 0;
        border-radius: 8px;
    }

    .modal-header{
        border-bottom-width: 0;
        padding: 25px 30px;
        position: relative;
    }

    .modal-title {
        font-weight: 500;
        font-size: 18px !important;
        color: #344563;
        margin-bottom: 0;
    }

    input:focus {
        outline: none;
        color: #0b2151;
    }

    .template-name {
        color: black;
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
            &:not(:disabled) {
                background-color: #0158d4;
                border-color: #0153c7;
            }
        }
    }

    label {
        font-size: 13px;
        color: #4a5e8a;
        margin-bottom: 6px;
        font-weight: 400;
    }

    input {
        height: 42px;
        color: #0b2151;
        font-size: .875rem;
        border-radius: 5px;
        border-color: #c1c8de !important;
        text-shadow: none;
        transition: all 0.25s;
        border: 1px solid #d5dcf4;
    }

    .modal-footer {
        display: flex;
        flex-direction: row;
        border-top: 1px solid #fff;
        padding: 15px 30px 30px;
        padding-top: 0;
        border-top-width: 0;

        button {
            height: 38px;
            padding-left: 20px;
            padding-right: 20px;
            margin: 0;
        }

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

export const NoCompetitorsHeader = styled.h4``;
