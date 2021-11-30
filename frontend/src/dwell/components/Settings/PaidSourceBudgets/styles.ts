import styled from 'styled-components';
import { CustomModal } from 'dwell/components/Settings/styles';

export const PaidSourceBudgetsModal = styled(CustomModal)`
    min-height: calc(100% - 3.5rem);
    max-width: 500px;

    .react-datepicker-wrapper {
        width: 100%;

        input {
            width: 100%;
        }
    }

    .react-datepicker__input-container {
        input {
            padding-left: 10px;
        }
    }

    .form-group:last-child {
        margin-bottom 0;
        input {
            margin-bottom 0;
        }
    }

`;
