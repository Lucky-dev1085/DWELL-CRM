import React from 'react';
import Icon from './Icon';

/* eslint-disable max-len */
interface IconProps {
  color: string,
}

const IconBank = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <g id="icon-active-parking" transform="translate(-10.279 -10.872)">
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
        id="icon-parking"
        d="M158.567,100H146v28.006h3.59V117.953h8.976a8.976,8.976,0,1,0,0-17.953Zm0,14.362h-8.976V103.591h8.976a5.386,5.386,0,0,1,0,10.772Z"
        transform="translate(-113.139 -72.79)"
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </g>
  </Icon>
);

export default IconBank;
