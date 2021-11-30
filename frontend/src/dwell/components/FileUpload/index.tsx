import React, { useState, FC } from 'react';
import Dropzone from 'react-dropzone';
import { MAX_FILE_SIZE } from 'dwell/constants';
import LargeFileWarningModal from './_warningModal';

const DZContainer = () => <div className="file-upload__container align-self-center" />;

interface FileUploadProps {
  onDropAccepted: (file: File) => void,
  title: string,
  disabled?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dropzoneContainer?: any,
  dropzoneClassname?: string,
}

const FileUpload: FC<FileUploadProps> = ({ onDropAccepted, disabled, dropzoneContainer: DropzoneContainer, dropzoneClassname }) => {
  const [showModal, setShowModal] = useState(false);

  const onDropRejected = () => {
    setShowModal(true);
  };

  return (
    <React.Fragment>
      <LargeFileWarningModal show={showModal} handleClose={() => setShowModal(false)} />
      <Dropzone
        className={dropzoneClassname}
        disabled={disabled}
        disabledClassName="file-upload--disabled"
        multiple
        onDropAccepted={onDropAccepted}
        maxSize={MAX_FILE_SIZE}
        onDropRejected={() => onDropRejected()}
      >
        {
          (...props) => <DropzoneContainer {...props} />
        }
      </Dropzone>
    </React.Fragment>
  );
};

FileUpload.defaultProps = {
  disabled: false,
  dropzoneContainer: DZContainer,
  dropzoneClassname: 'file-upload d-flex p-3 file-preview',
};

export default FileUpload;
