import React, { Fragment, useState, useEffect, useRef, FC } from 'react';
import { Button } from 'reactstrap';
import { ContainerUploadImage, ErrorMessage, FileInput } from 'site/components/common';
import { RemoveImage, ImageWrapper } from 'site/views/site_contents/neighborhood/styles';

interface ImageUploadProps {
  buttonText?: string,
  value?: string,
  onChange?: (file: string) => void,
  disabled?: boolean,
  required?: boolean,
  type: string,
  invalid?: string,
}

const ImageUpload: FC<ImageUploadProps> = ({ buttonText, value, onChange, disabled, required, type, invalid }) => {
  const [imageUploadState, updateImageUpload] = useState({
    showFileInput: !value,
    imageUrl: value,
  });
  const fileInputEl = useRef(null);

  useEffect(() => {
    updateImageUpload({
      ...imageUploadState,
      showFileInput: !value,
      imageUrl: value,
    });
  }, [value]);

  const openFileDialog = () => {
    fileInputEl.current.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file.type.includes('image')) {
      window.alert('Sorry only image files are supported'); // eslint-disable-line no-alert
      return;
    }
    updateImageUpload({ ...imageUploadState, showFileInput: false, imageUrl: file });
    onChange(file);
  };

  const handleClose = () => {
    updateImageUpload({ ...imageUploadState, showFileInput: true, imageUrl: '' });
    onChange(null);
  };

  const renderImageUpload = () => {
    if (type === 'location') {
      return (
        <div>
          <Button
            color="white"
            onClick={openFileDialog}
            disabled={disabled}
            className={!invalid ? 'mb-3' : ''}
          >
            <i className="ri-image-line mr-1" />
            {buttonText}
          </Button>
          <FileInput
            ref={fileInputEl}
            type="file"
            onChange={handleFileUpload}
            disabled={disabled}
          />
          {invalid && <ErrorMessage>{invalid}</ErrorMessage>}
        </div >
      );
    }
    return (
      <Fragment>
        <ContainerUploadImage onClick={openFileDialog} style={{ height: '100px', width: '100%' }}>
          <i className="ri-image-line" />
          <span>{buttonText}</span>
        </ContainerUploadImage>
        <FileInput
          ref={fileInputEl}
          type="file"
          onChange={handleFileUpload}
          disabled={disabled}
          required={required}
        />
      </Fragment>
    );
  };

  const { showFileInput, imageUrl } = imageUploadState;

  return (
    <div className="d-flex h-100">
      {showFileInput ? renderImageUpload()
        :
        (
          <div className="position-relative">
            <RemoveImage onClick={handleClose} >
              <i className="ri-close-circle-fill" />
            </RemoveImage>
            <ImageWrapper>
              <img
                src={
                  typeof imageUrl === 'object'
                    ? URL.createObjectURL(imageUrl)
                    : imageUrl
                }
                alt=""
              />
            </ImageWrapper>
          </div>
        )}
    </div>
  );
};

ImageUpload.defaultProps = {
  buttonText: 'Upload image',
  value: '',
  disabled: false,
  required: false,
  invalid: '',
};

export default ImageUpload;
