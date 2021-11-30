import styled from 'styled-components';
import { CustomModal } from 'dwell/components/Settings/styles';
import { FormGroup } from 'reactstrap';

export const CompetitorsModal = styled(CustomModal)`
    max-width: 600px !important;
    min-height: calc(100% - 3.5rem);
    margin: 1.75rem auto;

    .modal-header {
        padding-bottom: 24px;
    }

    .modal-body {
        padding: 0 30px 30px;
        padding-bottom: 41px;
    }

    .modal-footer{
        .btn {
            height: 38px !important;
        }
    }

    .is-invalid {
        background: none;
        border-color: #f86c6b !important;
    }

    input:focus {
        border-color: #b0b9d5 !important;
        box-shadow: 0 1px 1px rgba(193,200,222,0.25), 0 2px 2px rgba(193,200,222,0.2), 0 4px 4px rgba(193,200,222,0.15), 0 8px 8px rgba(193,200,222,0.1), 0 16px 16px rgba(193,200,222,0.05) !important;
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
`;

export const AddressFormGroup = styled(FormGroup)`
    margin-bottom: 0;
`;
