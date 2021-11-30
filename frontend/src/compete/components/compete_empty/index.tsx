import React, { FC } from 'react';
import { EmptyProp } from 'compete/views/styles';

interface CompeteEmptyProps {
  icon?: string,
  title?: string,
  text?: string,
  isCenter?: boolean,
}

const CompeteEmpty: FC<CompeteEmptyProps> = ({ icon = 'ri-list-check-2', title, text, isCenter = false }) => (
  <EmptyProp>
    <i className={icon} />
    {title && <h5 className={isCenter ? 'text-center' : ''}>{title}</h5>}
    {text && <p className={isCenter ? 'text-center' : ''}>{text}</p>}
  </EmptyProp>
);

export default CompeteEmpty;
