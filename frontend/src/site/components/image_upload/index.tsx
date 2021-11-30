import React, { FC } from 'react';
import Dropzone from 'react-dropzone';
import { toast, ToastOptions } from 'react-toastify';
import { get } from 'lodash';
import styled from 'styled-components';
import { MAX_IMG_SIZE, toastWarning } from 'site/constants';

const UploadContainer = styled.div`
  margin: auto;
  background: url(/static/images/image-add.svg);
  width: 18px;
  height: 18px;
  background-size: cover;
  align-self: center;
`;

const DZContainer = () => <UploadContainer />;

interface ImageUploadProps {
  title: string,
  disabled?: boolean,
  dropzoneClassname?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dropzoneContainer?: any,
  onDropAccepted: (file: File) => void
}

const ImageUpload: FC<ImageUploadProps> = ({ onDropAccepted, disabled, dropzoneContainer: DropzoneContainer, dropzoneClassname }) => {
  const onDropRejected = (file) => {
    const message = get(file, '[0].type', '').includes('image') ? 'Maximum image size is 10 MB.' : 'Incorrect media type. Please use image.';
    toast.warn(message, toastWarning as ToastOptions);
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
      onDropRejected={file => onDropRejected(file)}
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
  dropzoneClassname: 'd-flex p-2',
};

export default ImageUpload;
