import { DefaultTheme, createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
@import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;500;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Unica+One&display=swap');

body {
    margin: 0;
    font-family: "IBM Plex Sans",sans-serif;
    font-size: .875rem;
    font-weight: 400;
    line-height: 1.5;
    color: #344563;
    text-align: left;
    background-color: #fff;
}

.app-body {
    display: flex;
    min-height: calc(100vh - 64px);
    background-color: #f7f8fc;
    background-image: linear-gradient(to bottom, #f7f8fc 0%, #fff 100%);
    background-repeat: repeat-x;
}
`;

const theme: DefaultTheme = {
  colors: {
    bodyColor: '#344563',
    bodyBg: '#f7f8fc',
    gray900: '#091534',
    gray800: '#15274d',
    gray700: '#233457',
    gray600: '#657697',
    gray500: '#a0a6bd',
    gray400: '#ccced9',
    gray300: '#dfe1e8',
    gray200: '#e9eaf0',
    gray100: '#f7f8fc',

    colorui01: '#0168fa',
    colorui02: '#243782',
    colorui03: '#09a8fa',

    colorlight01: '#ebf2fe',

    colortx01: '#0b2151',
    colortx02: '#4a5e8a',
    colortx03: '#929eb9',
    colortx04: '#c0ccda',

    colorbg01: '#f0f2f9',
    colorbg02: '#e1e6f7',
    colorbg03: '#c1c8de',

    colorbd01: '#eef1f9',
    colorbd02: '#e2e7f4',

    blue: '#0168fa',
    lightGreen: '#70c4c2',
    green: '#24ba7b',
    indigo: '#5e2fc6',
    purple: '#6c4cd6',
    violet: '#9000ff',
    lightblue: '#0562ed',
    darkblue: '#2d3c68',
    pink: '#e83e8c',
    red: '#f3505c',
    orange: '#fd7e14',
    yellow: '#ffc107',
    teal: '#20c997',
    white: '#fff',
    gray: '#657697',
    darkgray: '#15274d',
    primary: '#448dfb',
    secondary: '#657697',
    success: '#24ba7b',
    info: '#17a2b8',
    warning: '#ffc107',
    danger: '#dc3545',
    light: '#f7f8fc',
    dark: '#15274d',
    lightblack: '#0b2151',
    cyan: '#09a8fa',
    darkcyan: '#5999f0',
  },
  fonts: {
    core: ["'IBM Plex Sans', sans-serif"],
    primary: ["'IBM Plex Sans', sans-serif"],
    secondary: ["'GT Walsheim Pro', sans-serif"],
    numeric: ["'Rubik', sans-serif"],
    label: ["'Helvetica Neue', 'Public Sans', sans-serif"],
    base: ["'IBM Plex Sans', sans-serif"],
    default: ['-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"'],
    mainPrimary: ["'Open Sans', sans-serif"],
    mainSecondary: ["'Poppins', sans-serif"],
  },
  fontWeights: {
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  fontSizes: {
    base: '.875rem',
    sm: '13px',
    xs: '12px',
    md: '15px',
  },
  fontColors: {
    color: 'darken(#243782, 15%)',
  },
  borders: {
    radius: '6px',
    radiussm: '5px',
    radiusmd: '8px',
    radiuslg: '10px',
  },
  input: {
    borderColor: '#d5dcf4',
  },
  link: {
    hoverDecoration: 'none',
  },
  shadows: {
    base: '0 3px 10px rgba(#243782, .06)',
    shadow01: '1px 2px 8px rgba(#243782, 0.06)',
    shadow02: '1px 2px 25px rgba(#243782, 0.04)',
    shadow03: '2px 5px 45px rgba(#243782, .12)',
    shadow04: '4px 5px 10px rgba(#243782, .07)',
  },
  templates: {
    gutterWidth: '30px',

    heightBase: '38px',
    heightsm: '36px',
    heightxs: '34px',
    heightmd: '40px',
    heightlg: '42px',

    headerHeight: '64px',
    headerHeightsm: '60px',
    leftbarWidth: '64px',
    sidebarWidth: '260px',
    offsetmenuWidth: '280px',
  },
};

export { theme };
