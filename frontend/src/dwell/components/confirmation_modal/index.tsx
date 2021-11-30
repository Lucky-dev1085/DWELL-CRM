import React, { FC } from 'react';
import { Button, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { StyledModal } from 'styles/common';

interface ConfirmationModalProps {
  operationType: string,
  instanceType: string,
  onConfirm: () => void,
  onCancel: () => void,
  show: boolean,
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({ instanceType, onCancel, onConfirm, operationType, show }) => {
  const closeBtn = <button className="close" onClick={() => onCancel()}>&times;</button>;

  return (
    <section>
      <StyledModal
        isOpen={show}
        toggle={() => onCancel()}
        centered
        aria-labelledby="example-custom-modal-styling-title"
        className="confirmation-modal"
      >
        <ModalHeader close={closeBtn}>{operationType.charAt(0).toUpperCase() + operationType.slice(1)} Confirmation</ModalHeader>
        <ModalBody>
          Do you want to {operationType} {instanceType}?
        </ModalBody>
        <ModalFooter>
          <Button color="white" onClick={() => onCancel()} >Cancel</Button>
          <Button color="primary" onClick={onConfirm}>Yes</Button>
        </ModalFooter>
      </StyledModal>
    </section>
  );
};

export default ConfirmationModal;
