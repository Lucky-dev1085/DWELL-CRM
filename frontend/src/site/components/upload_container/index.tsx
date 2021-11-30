import React, { FC } from 'react';
import { ContainerUploadImage } from 'site/components/common';

interface ContainerProps {
  label?: string,
}

const UploadContainer: FC<ContainerProps> = ({ label }) => (
  <ContainerUploadImage>
    <i className="ri-image-line" />
    <span>{label}</span>
  </ContainerUploadImage>
);

UploadContainer.defaultProps = {
  label: 'Upload Image',
};

export default UploadContainer;
