import styled from 'styled-components';
import { ModalHeader as ModalHeaderLib, Card } from 'reactstrap';

export const ModalHeader = styled(ModalHeaderLib)`
    border-bottom-width: 0;
    padding: 25px 30px;
    padding-bottom: 10px !important;
`;

export const CardMerge = styled(Card)`
    border-width: 0;
    background-color: ${props => props.theme.colors.gray100};

    .card-header {
        background-color: transparent;
        border-bottom-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px 20px;

        h6 {
            margin-bottom: 0;
            color: ${props => props.theme.colors.colortx01};
            font-weight: ${props => props.theme.fontWeights.semibold};
        }
    }

    .card-body {
        padding: 0 20px 20px;
        color: ${props => props.theme.colors.colortx02};
    }

    .row {
        > div:last-child {
          color: ${props => props.theme.colors.colortx01};
          font-weight: ${props => props.theme.fontWeights.medium};
        }

        + .row { margin-top: 5px; }
    }
`;
