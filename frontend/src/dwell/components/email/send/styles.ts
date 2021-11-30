import styled from 'styled-components';
import { ModalBody } from 'reactstrap';

export const SendEmailModalBody = styled(ModalBody)`
    padding: 30px !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: ${props => props.theme.colors.colortx02};

    i {
        font-size: 64px;
        line-height: 1;
        margin-bottom: 20px;
        display: block;
    }
`;

export const SendEmailModalTitle = styled.h6`
    font-size: 20px;
    color: ${props => props.theme.colors.colortx01};
    margin-bottom: 0;
`;

export const SendEmailModalInfoSubjectTitle = styled.h6``;

export const SendEmailButtonGroup = styled.div`
    display: flex;
    flex-direction: row;
    color: #4a5e8a;

    .btn-secondary {
        background-color: #fff;
        color: #4a5e8a;
    }

    .btn-primary {
        background-color: ${props => props.theme.colors.colorui01} !important;
    }

    .btn {
        margin-right: 5px;
        margin-left: 5px;
        height: 40px;
        padding: 0 15px;
    }
`;

export const SendEmailModalInfo = styled.h6`
    align-self: stretch;
    text-align: center;
    background-color: #f0f2f9;
    padding: 25px 30px;
    border-radius: 5px;
    margin: 30px 0;

    p {
        font-weight: 400;
        margin-bottom: 0;
    }
`;
