import styled from 'styled-components';
import { Modal } from 'reactstrap';

export const EditButton = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.theme.colors.colorui01};
  cursor: pointer;

  i {
    margin-right: 5px;
  }

  &:hover {
    color: #0148ae;
  }
`;

export const RemoveButton = styled.div`
  width: 38px;
  height: 38px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 1px solid ${props => props.theme.input.borderColor};
  color: ${props => props.theme.colors.colortx02};
  cursor: pointer;
  border-radius: 5px;

  i {
    font-size: 18px;
    line-height: 1;
    transition: all 0.25s;
  }

  &:hover {
    border-color: ${props => props.theme.colors.colorbg03};
  }
`;

export const ModalDelete = styled(Modal)`
  max-width: 500px;

  .modal-header {
    padding: 15px 20px;
  }

  .modal-title {
    font-weight: 600 !important;
  }

  .modal-body {
    padding: 0 20px 20px;
  }

  .modal-footer {
    padding: 0 20px 20px;
  }

  .btn {
    height: 38px !important;
    padding: 0 15px !important;
    margin: 4px !important;
  }

  .btn-danger {
    color: #fff;
    background-color: ${props => props.theme.colors.red};
    border-color: ${props => props.theme.colors.red};

    &:hover {
      background-color: #f12c3b;
      border-color: #f02030;
    }
  }
`;
