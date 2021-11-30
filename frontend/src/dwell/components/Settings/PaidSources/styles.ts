import styled from 'styled-components';
import { CustomModal } from 'dwell/components/Settings/styles';

export const PaidSourcesModal = styled(CustomModal)`
    max-width: 500px !important;
    min-height: calc(100% - 3.5rem);
    margin: 1.75rem auto;

    .modal-header {
        padding-bottom: 24px;
    }

    .dropdown-toggle {
        padding-right: 12px;
        border-color: ${props => props.theme.input.borderColor};
        color: ${props => props.theme.colors.gray700} !important;

        &:after {
            border-color: #888 transparent transparent transparent;
            border-style: solid;
            border-width: 5px 4px 0 4px;
            height: 0;
            margin-left: -4px;
            margin-top: -2px;
            position: absolute;
            top: 50%;
            right: 11px;
            width: 0;
        }
    }

    .btn {
        box-shadow: none !important;
        height: 38px !important;
    }

    .btn-secondary {
        background-color: #fff;
        color: ${props => props.theme.colors.colortx02};
        border-color: #d5dcf4;
        border-radius: 5px;

        :hover {
            background-color: #fff;
            border-color: ${props => props.theme.colors.colorbg03};
        }
    }

    .dropdown-item {
        border-radius: 4px;
        margin-bottom: 1px;
        color: #344563;
    }

    .dropdown-menu {
        border-radius: unset;
        border-bottom-right-radius: 4px;
        border-bottom-left-radius: 4px;
        top: -5px !important;
        border-color: ${props => props.theme.input.borderColor};
    }

    .is-invalid {
        background: none;
        border-color: #f86c6b !important;
    }

    textarea {
        color: #0b2151;
        font-size: .875rem;
        border-radius: 5px;
        border-color: #c1c8de !important;
        text-shadow: none;
        -webkit-transition: all 0.25s;
        transition: all 0.25s;
        border: 1px solid #d5dcf4;
    }
`;
