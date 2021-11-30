import React, { FC } from 'react';
import Dropzone from 'react-dropzone';
import { toast } from 'react-toastify';
import { MAX_IMG_SIZE } from 'dwell/constants';

const DZContainer = () => <div className="image-upload__container align-self-center" />;

interface ImageUploadProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDropAccepted: (file: File) => void,
  title: string,
  disabled?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dropzoneContainer?: any,
  dropzoneClassname?: string,
}

const ImageUpload: FC<ImageUploadProps> = ({ onDropAccepted, disabled, dropzoneContainer: DropzoneContainer, dropzoneClassname }) => {
  const onDropRejected = () => {
    toast.warn('Maximum image size is 10 MB.');
  };

  return (
    <Dropzone
      className={dropzoneClassname}
      disabled={disabled}
      disabledClassName="image-upload--disabled"
      accept="image/*"
      multiple={false}
      onDropAccepted={onDropAccepted}
      maxSize={MAX_IMG_SIZE}
      onDropRejected={() => onDropRejected()}
    >
      {
        (...props) => <DropzoneContainer {...props} />
      }
    </Dropzone>
  );
};

ImageUpload.defaultProps = {
  disabled: false,
  dropzoneContainer: DZContainer,
  dropzoneClassname: 'image-upload d-flex p-3 image-preview',
};

export default ImageUpload;
