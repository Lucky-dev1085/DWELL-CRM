import styled, { css } from 'styled-components';
import { CustomModal } from 'dwell/components/Settings/styles';

export const RentSurveyModal = styled(CustomModal)`
    max-width: 1140px;

    .modal-body {
        padding: 0 30px 30px;
    }

    .modal-header {
        padding-bottom: 24px;
    }

    .survey-table .invalid-feedback {
        ${props => props.isSubmitting && css`display: block;`}
    }

    .react-datepicker__input-container {
        input {
            padding-left: 10px;
            height: 42px;
            width: 250px;
        }
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

export const NavGroup = styled.div`
    display: flex;
    flex-direction: row;
    background-color: #f0f2f9;
    border-radius: 5px;
    min-width: inherit;

    .nav-tabs {
        height: 36px;
    }

    .nav-link {
        color: #4a5e8a;
        font-weight: 500;
        border: 1.5px solid #f0f2f9;
        border-width: 1px;
        background-color: transparent;
        border-radius: 5px;
        height: 36px;
        display: flex;
        align-items: center;

        &:hover {
            border-color: transparent;
        }
    }

    .nav-link.active {
        border-color: #3a8bfe;
        background-color: #f1f7ff;
        color: #243782;
        border-width: 1.5px;
    }
`;

export const RentSurveyCustomTable = styled.div`
    .table {
        border-top-width: 0;
        border-bottom-width: 1px;
        padding-left: 0;
        font-size: 13px;
        font-weight: 400;
        color: #4a5e8a !important;
    }

    .tab-pane {
        padding: 0 !important;
     }


    thead {
        th {
            background-color: #fff;
            border-left: 0px solid #fff !important;
            border-top: 0px solid #fff !important;
            border-right: 0px solid#fff !important;
            font-size: 13px;
            font-weight: 400;
            color: #4a5e8a;
            border-bottom: 1px solid #d5dcf4 !important;
            padding-left: 0;
        }

    }

    tbody {
        tr {
            td {
                background-color: #fff;
                border-top: 1px solid #d5dcf4 !important;
                border-left: 0px #fff !important;
                border-bottom: 0px #fff !important;
                border-right: 0px #fff !important;
                outline: none;
                padding: 8px 12px 0 0;
            }
        }
        td:last-child {
            border-top: 1px solid #d5dcf4 !important;
        }
    }

    svg {
        color: #d5dcf4 !important;
    }
`;

