import React, { FC } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { isEmpty } from 'lodash';

interface PreviewModalProps {
  file: { name?: string, attachment?: string, content_type?: string },
  show: boolean,
  handleClose: () => void,
  attachmentType: string,
}

const PreviewModal: FC<PreviewModalProps> = ({ file, show, handleClose, attachmentType }): JSX.Element => {
  const closeBtn = <button className="close" onClick={() => handleClose()}>&times;</button>;
  return (
    <Modal
      isOpen={show}
      size="xl"
      toggle={() => handleClose()}
      centered
      aria-labelledby="example-custom-modal-styling-title"
      className="preview-mode"
    >
      <ModalHeader close={closeBtn}>{file ? file.name : '+'}</ModalHeader>
      <ModalBody className="d-flex align-items-center justify-content-center" style={{ height: '80vh' }}>
        {!isEmpty(file) && attachmentType !== 'document' &&
        <object aria-label={file.name} data={file.attachment} style={attachmentType === 'image' ? { maxHeight: '100%', maxWidth: '100%' } : { height: '100%', width: '100%' }}><embed src={file.attachment} type={file.content_type} /></object>}
        {!isEmpty(file) && attachmentType === 'document' && <iframe src={`https://docs.google.com/gview?url=${file.attachment}&embedded=true`} title={file.name} style={{ height: '100%', width: '100%', border: '0' }} />}
      </ModalBody>
    </Modal>);
};

export default PreviewModal;
