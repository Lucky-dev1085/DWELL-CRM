import React from 'react';
import Icon from './Icon';

/* eslint-disable max-len */
interface IconProps {
  color: string,
}

const IconBank = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <g id="icon-active-hospitals" transform="translate(-10.279 -10.872)">
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
        id="icon-hospital"
        d="M95.188,79.692H88.808V73.312A.908.908,0,0,0,87.9,72.4H80.6a.908.908,0,0,0-.912.912v6.381H73.312a.908.908,0,0,0-.912.912V87.9a.908.908,0,0,0,.912.912h6.381v6.381a.908.908,0,0,0,.912.912H87.9a.908.908,0,0,0,.912-.912V88.808h6.381A.908.908,0,0,0,96.1,87.9V80.6A.979.979,0,0,0,95.188,79.692Zm-.861,7.292H87.9a.908.908,0,0,0-.912.912v6.381H81.515V87.9a.908.908,0,0,0-.912-.912H74.223V81.515H80.6a.908.908,0,0,0,.912-.912V74.223h5.52V80.6a.908.908,0,0,0,.912.912h6.381Z"
        transform="translate(-43.221 -42.228)"
        fill="white"
      />
    </g>
  </Icon>
);

export default IconBank;
