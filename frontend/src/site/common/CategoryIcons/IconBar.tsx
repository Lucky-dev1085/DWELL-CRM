import React from 'react';
import Icon from './Icon';

/* eslint-disable max-len */
interface IconProps {
  color: string,
}

const IconBank = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <g id="icon-active-bars" transform="translate(-10.279 -10.872)">
      <path
        id="Path_2"
        data-name="Path 2"
        d="M147.694,71.9a30.694,30.694,0,1,0,30.694,30.694A30.694,30.694,0,0,0,147.694,71.9Z"
        transform="translate(-106.721 -61.028)"
        fill="currentColor"
      />
      <g
        id="Path_2-2"
        data-name="Path 2"
        transform="translate(-102.084 -56.391)"
      >
        <path
          id="Path_9"
          data-name="Path 9"
          d="M143.057,125.014a26.978,26.978,0,1,1,10.532-2.127A26.891,26.891,0,0,1,143.057,125.014Z"
          fill="currentColor"
        />
        <path
          id="Path_10"
          data-name="Path 10"
          d="M143.057,71.9h0a26.057,26.057,0,1,0,26.057,26.057A26.057,26.057,0,0,0,143.057,71.9m0-2a27.973,27.973,0,1,1-10.925,2.206A27.932,27.932,0,0,1,143.06,69.9h0Z"
          fill="white"
        />
      </g>
      <path
        id="icon-bars"
        d="M26.511,0a4.913,4.913,0,0,0-4.827,4.038H2.784a.868.868,0,0,0-.651,1.441L12.987,17.808a.867.867,0,0,0,.651.294h.144c.008,3.3.008,6.654,0,10H10.4a.868.868,0,1,0,0,1.735h8.5a.868.868,0,1,0,0-1.735H15.518c.008-3.342.008-6.7,0-10h.139a.868.868,0,0,0,.651-.294L23.972,9.1a4.9,4.9,0,0,0,2.538.708h0a4.906,4.906,0,1,0,0-9.811Zm-1.92,5.773-1.4,1.588h0v0l-.626.711H6.731L4.7,5.773ZM15.265,16.367H14.031L8.259,9.811H21.037ZM26.511,8.076h0a3.167,3.167,0,0,1-1.363-.308l2.015-2.289a.868.868,0,0,0-.651-1.441H23.463a3.17,3.17,0,1,1,3.049,4.038Z"
        transform="translate(25.836 27.039)"
        fill="white"
        stroke="white"
        strokeWidth="0.3"
      />
    </g>
  </Icon>
);

export default IconBank;
