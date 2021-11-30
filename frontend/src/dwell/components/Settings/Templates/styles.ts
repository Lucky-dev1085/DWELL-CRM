import styled, { css } from 'styled-components';
import { Modal, FormGroup, ModalFooter } from 'reactstrap';

export const EmailTemplateModal = styled(Modal)`
    max-width: 1000px !important;

    .modal-backdrop.show {
      background-color: desaturate(${props => props.theme.colors.gray900}, 25%) !important;
      opacity: 0.75 !important;
    }

    .modal-body {
        padding: 0;
    }

    .modal-content {
        border-width: 0;
        box-shadow: none;
        border-radius: 8px;
    }

    .modal-header{
        background-color: ${props => props.theme.colors.gray100};
        border-bottom-width: 0;
        padding: 15px 15px;
        border-bottom: 1px solid rgba(36,55,130,0.1);
        border-top-left-radius: 9px;
        border-top-right-radius: 9px;
        padding-bottom: 14px;
    }

    .modal-title {
        font-weight: ${props => props.theme.fontWeights.semibold};
        font-size: 18px !important;
        font-weight: 600 !important;
        color: ${props => props.theme.colors.colortx01} !important;
        font-family: "IBM Plex Sans",sans-serif;
    }

    input:focus {
        outline: none !important;
        color: ${props => props.theme.colors.colortx02};
    }

    input {
        color: ${props => props.theme.colors.colortx01} !important;

        &::placeholder {
            color: ${props => props.theme.colors.colortx03} !important;
        }
    }

    .template-name {
        margin-bottom: 0;
        border-radius: 0;
        border: 0;
    }

    .subject{
        width: 100%;
        height: calc(1.5em + 0.75rem + 2px);
        border: 1px solid #fff;
        padding-bottom: 10px;

        .subject__control {
            width: 100%
            height: calc(1.5em + 0.75rem + 2px);
            border-radius: 0.25rem;
        }
    }

    .subject__input {
        width: 100% !important;
        height: calc(1.5em + 0.75rem + 2px);
        border: 0;
        padding: 0px 14px;
        padding-bottom: 4px;
    }

    .close {
        font-size: 24px;
        font-weight: 400;
        line-height: 1;
        color:  ${props => props.theme.colors.grey600};
        font-family: 'remixicon' !important;
        font-style: normal;
        padding: 1rem 1rem;

        :before {
            content: "\\eb99";
        }
    }

`;

export const CustomTextEditor = styled.div`
    width: 100%;

    .cke_chrome {
        border: 0;
    }

    .cke_top {
        background: #fff;
        border-bottom: 0;
    }
`;

export const EmailInputFormGroup = styled(FormGroup)`
    display: flex;
    align-items: center;
    padding-top: 3px;
    padding-bottom: 3px;
    margin-bottom: 0;
    border-bottom: 1px solid rgba(36,55,130,0.1);
    ${props => props.isError && css`
        border: 1px solid red;
      `}
`;

export const EmailTemplateModalFooter = styled(ModalFooter)`
    border-top: 0;
    padding: 20px !important;

     .btn {
          height: ${props => props.theme.templates.heightBase} !important;
          padding: 0 15px !important;
          margin: 0;

          + .btn { margin-left: 10px; }
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

    .btn-primary {
        background-color: ${props => props.theme.colors.colorui01};
        border-color: ${props => props.theme.colors.colorui01};

        :hover {
            background-color: ${props => props.theme.colors.colorui02};
            border-color: ${props => props.theme.colors.colorui02};
        }
    }
`;
