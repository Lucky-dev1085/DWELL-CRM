import React, { FC } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import 'src/scss/pages/_lead_share.scss';

interface ConfirmModalProps {
  lead: { first_name: string, last_name: string },
  property: { name: string },
  onCancel: () => void,
  onConfirm: () => void,
  show: boolean,
}

const ConfirmModal: FC<ConfirmModalProps> = ({ lead, property, onCancel, onConfirm, show }) => {
  const closeBtn = <button className="close" onClick={() => onCancel()}>&times;</button>;

  return (
    <Modal
      isOpen={show}
      toggle={() => onCancel()}
      centered
      aria-labelledby="example-custom-modal-styling-title"
      className="confirm-modal"
      size="sm"
    >
      <ModalHeader close={closeBtn}>Remove Lead</ModalHeader>
      <ModalBody>
        <p>Do you want to remove lead {lead.first_name} {lead.last_name} from the leads list of {property.name}?</p>
      </ModalBody>
      <ModalFooter>
        <Button className="btn" color="secondary" onClick={() => onCancel()} >Cancel</Button>
        <Button className="btn" color="primary" onClick={() => onConfirm()}>Yes</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmModal;
