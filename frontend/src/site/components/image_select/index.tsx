import React, { Fragment, useState, useEffect, useRef, FC } from 'react';
import { Button } from 'reactstrap';
import { FileInput } from 'site/components/common';

interface ImageSelectProps {
  buttonText?: string,
  value: string,
  disabled?: boolean,
  onChange: (file: string) => void,
}

const ImageSelect: FC<ImageSelectProps> = ({ buttonText, value, onChange, disabled }) => {
  const [imageSelectState, updateImageSelect] = useState({
    showFileInput: !value,
    imageUrl: value,
  });
  const fileInputEl = useRef(null);

  useEffect(() => {
    if (value) {
      updateImageSelect({
        showFileInput: !value,
        imageUrl: value,
      });
    }
  }, [value]);

  const open = () => {
    fileInputEl.current.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file.type.includes('image')) {
      window.alert('Sorry only image files are supported'); // eslint-disable-line no-alert
      return;
    }

    updateImageSelect({ showFileInput: false, imageUrl: file });
    onChange(file);
  };

  const handleClose = () => {
    updateImageSelect({ showFileInput: true, imageUrl: '' });
  };

  const { showFileInput, imageUrl } = imageSelectState;

  return (
    <div className="d-flex">
      {showFileInput ? (
        <Fragment>
          <Button
            color="primary"
            onClick={open}
            disabled={disabled}
          >
            {buttonText}
          </Button>
          <FileInput
            ref={fileInputEl}
            type="file"
            onChange={handleFileUpload}
            disabled={disabled}
            required
          />
        </Fragment>
      ) :
        (
          <Fragment>
            <button
              type="button"
              className="close"
              onClick={handleClose}
            >
              x
            </button>
            <img
              src={
                typeof imageUrl === 'object'
                  ? URL.createObjectURL(imageUrl)
                  : imageUrl
              }
              className="image"
              alt=""
            />
          </Fragment>
        )}
    </div>
  );
};

ImageSelect.defaultProps = {
  buttonText: 'Upload image',
  disabled: false,
};

export default ImageSelect;
