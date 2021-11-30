import styled from 'styled-components';
import { ModalWindow as Modal } from 'site/components/common';

export const ModalWindow = styled(Modal)`
  max-width: 500px;

  .modal-header {
    padding: 20px 25px 15px;
  }

  .modal-body {
    padding: 0 25px;
  }

  .modal-footer {
    padding: 20px 25px 25px;
  }

  .modal-title {
    color: #0b2151 !important;
  }
`;
