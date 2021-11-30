import { Modal } from 'reactstrap';
import styled from 'styled-components';

export const ModalAlert = styled(Modal)`
  max-width: 500px;

  .modal-body {
    padding: 0 30px 15px;
  }

  .btn {
    height: 38px !important;
  }

  .btn-primary:hover {
    color: #fff;
    background-color: #0158d4;
    border-color: #0153c7;
  }

  .form-control {
    color: ${props => props.theme.colors.colortx02};
    font-size: .875rem;
    border-radius: 4px;
    border-color: #d9def0 !important;
    transition: all 0.25s;
  }

  .is-invalid {
    background-image: none !important;
  }

  .custom-control-label {
    color: ${props => props.theme.colors.bodyColor} !important;
  }
  .css-yk16xz-control, .css-1pahdxg-control {
    border-color: #d9def0 !important;
    outline: none !important;
    box-shadow: none !important;
  }

  .css-1hwfws3 {
    padding: 0 8px !important;
  }

  .css-b8ldur-Input, .css-1g6gooi {
    margin: 0 !important;
    padding: 0 !important;
    height: 23px;
  }

  .css-xb97g8 {
    font-size: 14px;
    font-weight: 400;
    display: inline-block;
    background-color: ${props => props.theme.colors.colorui01} !important;
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;

    svg {
      opacity: .5;
      color: #fff !important;
      cursor: pointer;

      &:hover {
        color: #333 !important;
        background-color: ${props => props.theme.colors.colorui01} !important;
      }
    }
  }

  .css-12jo7m5 {
    color: #fff !important;
    background-color: ${props => props.theme.colors.colorui01} !important;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .percent-input {
    width: 60px;
  }
`;

export const FormLabel = styled.label`
  font-size: 13px;
  margin-bottom: 5px;
  letter-spacing: .2px;
  color: ${props => props.theme.colors.colortx03} !important;
`;

export const AlertStatusText = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.colortx02};
  padding-left: 24px;
  padding-bottom: 5px;
  position: relative;
  top: -3px;
`;

export const AlertTypeWrapper = styled.div`
  display: flex !important;
  align-items: center;
  border: 1px solid ${props => props.theme.colors.colorbd02};
  padding: 18px 20px 20px;
  border-radius: 5px;
`;

export const ErrorMessage = styled.p`
  width: 100%;
  margin-top: 0.25rem;
  font-size: 80%;
  color: #f86c6b;
`;

