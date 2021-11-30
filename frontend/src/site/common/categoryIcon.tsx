import React from 'react';
import ReactDOMServer from 'react-dom/server';
import svgToMiniDataURI from 'mini-svg-data-uri';
import IconBank from 'site/common/CategoryIcons/IconBank';
import IconBar from 'site/common/CategoryIcons/IconBar';
import IconCafe from 'site/common/CategoryIcons/IconCafe';
import IconEntertainment from 'site/common/CategoryIcons/IconEntertainment';
import IconGasStation from 'site/common/CategoryIcons/IconGasStation';
import IconGroceryStore from 'site/common/CategoryIcons/IconGroceryStore';
import IconGym from 'site/common/CategoryIcons/IconGym';
import IconHospital from 'site/common/CategoryIcons/IconHospital';
import IconHotel from 'site/common/CategoryIcons/IconHotel';
import IconMuseum from 'site/common/CategoryIcons/IconMuseum';
import IconOutdoorActivity from 'site/common/CategoryIcons/IconOutdoorActivity';
import IconPark from 'site/common/CategoryIcons/IconPark';
import IconParking from 'site/common/CategoryIcons/IconParking';
import IconPostOffice from 'site/common/CategoryIcons/IconPostOffice';
import IconRestaurant from 'site/common/CategoryIcons/IconRestaurant';
import IconSchool from 'site/common/CategoryIcons/IconSchool';
import IconShopping from 'site/common/CategoryIcons/IconShopping';
import IconTheater from 'site/common/CategoryIcons/IconTheater';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCategoryIconComponentByName = (name: string): any => {
  switch (name) {
    case 'icon-bank':
      return IconBank;
    case 'icon-bar':
      return IconBar;
    case 'icon-cafe':
      return IconCafe;
    case 'icon-entertainment':
      return IconEntertainment;
    case 'icon-gas-station':
      return IconGasStation;
    case 'icon-grocery-store':
      return IconGroceryStore;
    case 'icon-gym':
      return IconGym;
    case 'icon-hospital':
      return IconHospital;
    case 'icon-hotel':
      return IconHotel;
    case 'icon-museum':
      return IconMuseum;
    case 'icon-outdoor-activity':
      return IconOutdoorActivity;
    case 'icon-park':
      return IconPark;
    case 'icon-parking':
      return IconParking;
    case 'icon-post-office':
      return IconPostOffice;
    case 'icon-restaurant':
      return IconRestaurant;
    case 'icon-school':
      return IconSchool;
    case 'icon-shopping':
      return IconShopping;
    case 'icon-theater':
      return IconTheater;
    default:
      return null;
  }
};

export const createIconUrl = (iconName: string, iconProps: { color: string }): string => {
  const IconComp = getCategoryIconComponentByName(iconName);
  if (!IconComp) return null;
  const iconString = ReactDOMServer.renderToStaticMarkup(<IconComp {...iconProps} />);
  return `${svgToMiniDataURI(iconString)}`;
};
