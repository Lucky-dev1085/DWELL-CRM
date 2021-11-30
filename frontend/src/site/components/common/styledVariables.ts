import darken from '@bit/styled-components.polished.color.darken';
import { parseColor } from './mixin';

export const bodyColor = '#344563';

// Border
export const borderColor = '#d5dcf4';
export const borderRadius = '6px';
export const borderRadiusSm = '5px';
export const borderRadiusMd = '8px';
export const borderRadiusLg = '10px';

// Colors
export const gray900 = '#091534';
export const gray800 = '#15274d';
export const gray700 = '#233457';
export const gray600 = '#657697';
export const gray500 = '#a0a6bd';
export const gray400 = '#ccced9';
export const gray300 = '#dfe1e8';
export const gray200 = '#e9eaf0';
export const gray100 = '#f7f8fc';

export const colorUi01 = '#0168fa';
export const colorUi02 = '#243782';
export const colorUi03 = '#09a8fa';

export const colorLight01 = '#ebf2fe';

export const colorTx01 = '#0b2151';
export const colorTx02 = '#4a5e8a';
export const colorTx03 = '#929eb9';
export const colorTx04 = '#c0ccda';

export const colorBg01 = '#f0f2f9';
export const colorBg02 = '#e1e6f7';
export const colorBg03 = '#c1c8de';

export const blue = colorUi01;
export const green = '#24ba7b';
export const indigo = '#5e2fc6';
export const purple = '#6c4cd6';
export const red = '#f3505c';

// Fonts
export const fontFamilyPrimary = "'IBM Plex Sans', sans-serif";
export const fontFamilySecondary = "'GT Walsheim Pro', sans-serif";
export const fontFamilyNumeric = "'Rubik', sans-serif";
export const fontFamilyLabel = fontFamilyPrimary;
export const fontFamilyBase = fontFamilyPrimary;

export const fontWeightMedium = 500;
export const fontWeightSemibold = 600;
export const fontWeightBold = 700;

export const fontSizeBase = '.875rem';
export const fontSizeSm = '13px';
export const fontSizeXs = '12px';
export const fontSizeMd = '15px';

export const fontColor = `${darken('0.15', colorUi02)}`;

// Input
export const inputBorderColor = '#d5dcf4';

// Links
export const linkHoverDecoration = 'none';

// Shadow
export const shadowBase = `0 3px 10px rgba(${parseColor(colorUi02).toString()}, .06)`;
export const shadow01 = `1px 2px 8px rgba(${parseColor(colorUi02).toString()}, 0.06)`;
export const shadow02 = `1px 2px 25px rgba(${parseColor(colorUi02).toString()}, 0.04)`;
export const shadow03 = `2px 5px 45px rgba(${parseColor(colorUi02).toString()}, .12)`;
export const shadow04 = `4px 5px 10px rgba(${parseColor(colorUi02).toString()}, .07)`;

// Template Variables
export const gutterWidth = '30px';

export const heightBase = '36px';
export const heightSm = '34px';
export const heightXs = '32px';
export const heightMd = '38px';
export const heightLg = '40px';

export const headerHeight = '64px';
export const headerHeightSm = '60px';
export const leftbarWidth = '60px';
export const sidebarWidth = '260px';
export const offsetmenuWidth = '280px';
