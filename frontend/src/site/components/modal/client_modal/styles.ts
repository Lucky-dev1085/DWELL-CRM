import styled from 'styled-components';
import { ModalWindow as Modal } from 'site/components/common';

export const ModalWindow = styled(Modal)`
  max-width: 640px;

  .modal-body {
    padding: 0 30px 15px;
  }

  label {
    font-size: 13px;
    margin-bottom: 5px;
    letter-spacing: .2px;
    color: #929eb9;
  }

  .modal-title {
    font-size: 20px !important;
  }

  .form-control {
    color: #4a5e8a;
  }
`;
