import React, { FC } from 'react';
import { ModalBody, ModalHeader, ModalFooter, Button } from 'reactstrap';
import { ModalWindow, ModalText } from 'site/components/common';

interface LeaveModalProps {
  onCancel?: () => void,
  onConfirm: () => void,
}

const LeaveModal: FC<LeaveModalProps> = ({ onConfirm, onCancel }) => (
  <ModalWindow isOpen toggle={onCancel} centered>
    <ModalHeader toggle={onCancel}>
      Leave Page?
    </ModalHeader>
    <ModalBody>
      <ModalText>
        Your edits have not been saved. Please save your edits before leaving the page or they will be lost.
      </ModalText>
    </ModalBody>
    <ModalFooter>
      <Button color="white" onClick={onCancel}>
        Keep Editing
      </Button>
      <Button color="primary" onClick={onConfirm}>
        Save changes
      </Button>
    </ModalFooter>
  </ModalWindow>
);

export default LeaveModal;
