import React, { FC } from 'react';

interface Icon {
  color: string,
}

const Icon: FC<Icon> = props => (
  <svg
    style={{ color: `${props.color}` }}
    xmlns="http://www.w3.org/2000/svg"
    width="61.388"
    height="61.388"
    viewBox="0 0 61.388 61.388"
  >
    {props.children}
  </svg>
);

export default Icon;
