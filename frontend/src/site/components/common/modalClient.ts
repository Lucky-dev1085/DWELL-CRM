import styled from 'styled-components';
import * as variables from './styledVariables';
import { ModalUser } from './modalUser';

export const ModalClient = styled(ModalUser)`
.modal-body {
  color: ${variables.colorTx02};

  .nav { padding-top: 10px; }
}

.modal-footer {
  justify-content: flex-end;
}

label {
  font-size: 13px;
  margin-bottom: 5px;
  letter-spacing: .2px;
  color: #4a5e8a;
}

.card {
  background-color: ${variables.colorBg01};
  border-width: 0;
  border-radius: 4px;

  &.card-body { padding: 15px; }

  .form-label {
    line-height: 1;
    color: ${variables.colorTx02};
    margin-bottom: 10px;
  }

  h6 {
    margin-bottom: 0;
    color: ${variables.colorTx01};
  }
}
`;
