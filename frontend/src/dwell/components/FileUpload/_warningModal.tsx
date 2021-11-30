import React, { FC } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';

interface LargeFileWarningModalProps {
  handleClose: () => void,
  show: boolean,
}

const LargeFileWarningModal: FC<LargeFileWarningModalProps> = ({ show, handleClose }) => {
  const closeBtn = <button className="close" onClick={() => handleClose()}>&times;</button>;
  return (
    <Modal
      isOpen={show}
      size="md"
      toggle={() => handleClose()}
      centered
      aria-labelledby="example-custom-modal-styling-title"
      className="preview-mode"
    >
      <ModalHeader close={closeBtn}><FontAwesomeIcon icon={faExclamationTriangle} style={{ color: 'red', marginRight: '0.5rem' }} /> File size is too large</ModalHeader>
      <ModalBody>
        This file is too large to send as an attachment. The largest file you can send is 25MB. Try reducing the size of the file or consider uploading it as a link via a cloud provider like OneDrive or GoogleDrive.
      </ModalBody>
      <ModalFooter>
        <Button className="bg-white" onClick={() => handleClose()} >Got it</Button>
      </ModalFooter>
    </Modal>);
};

export default LargeFileWarningModal;
