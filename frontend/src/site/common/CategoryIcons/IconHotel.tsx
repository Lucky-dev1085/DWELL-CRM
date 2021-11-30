import React from 'react';
import Icon from './Icon';

/* eslint-disable max-len */
interface IconProps {
  color: string,
}

const IconBank = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <g id="icon-active-hotels" transform="translate(-10.279 -10.872)">
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
        id="icon-hotel"
        d="M29.451,12.164V10.782A3.565,3.565,0,0,0,25.89,7.221H12.023V5.956A2.651,2.651,0,0,0,9.375,3.308H6.582a2.636,2.636,0,0,0-.832.135V0H0V21.558H1.816V17.892H29.169v3.666h1.815V12.164ZM25.89,9.037a1.748,1.748,0,0,1,1.746,1.746v1.381H5.749V9.037ZM6.582,5.123H9.375a.833.833,0,0,1,.832.832V7.221H5.749V5.956A.833.833,0,0,1,6.582,5.123ZM1.816,1.815H3.934V12.164H1.816Zm0,12.164H29.169v2.1H1.816Zm0,0"
        transform="translate(25.545 29.293)"
        fill="white"
      />
    </g>
  </Icon>
);

export default IconBank;
