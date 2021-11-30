import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import alertAction from 'compete/actions/alert';
import { getPropertyId } from 'src/utils';
import { ModalDelete } from './styles';

interface DeleteAlertModalProps extends RouteComponentProps {
  show: boolean,
  handleClose: () => void,
  alertName: string,
}

const DeleteAlertModal: FC<DeleteAlertModalProps> = ({ show, handleClose, alertName, location: { pathname }, history: { push } }) => {
  const dispatch = useDispatch();
  const { deleteAlert } = alertAction;

  const closeBtn = <button className="close" onClick={handleClose}><i className="ri-close-line" /></button>;

  const handleSubmit = () => {
    dispatch(deleteAlert(Number(pathname.split('/').pop()))).then(() => {
      push(`/${getPropertyId()}/compete/alerts`);
    });
  };

  return (
    <ModalDelete isOpen={show} toggle={handleClose} centered>
      <ModalHeader toggle={handleClose} close={closeBtn}>
        Delete Alert
      </ModalHeader>
      <ModalBody>
        <p>
          Do you want to delete alert <strong>{alertName}</strong>?
        </p>
        <p className="mb-0">
          Deleting an alert will remove all associated alert logs and data. If you
          want to retain this data, but stop receiving alert notifications, we
          recommend pausing the alert and not deleting it.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="white" onClick={handleClose}>Cancel</Button>
        <Button color="danger"disabled={false} onClick={handleSubmit}>
          Confirm Delete
        </Button>
      </ModalFooter>
    </ModalDelete>
  );
};

export default withRouter(DeleteAlertModal);
