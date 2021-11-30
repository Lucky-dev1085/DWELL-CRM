import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      bodyColor: string,
      bodyBg: string,
      gray900: string,
      gray800: string,
      gray700: string,
      gray600: string,
      gray500: string,
      gray400: string,
      gray300: string,
      gray200: string,
      gray100: string,

      colorui01: string,
      colorui02: string,
      colorui03: string,

      colorlight01: string,

      colortx01: string,
      colortx02: string,
      colortx03: string,
      colortx04: string,

      colorbg01: string,
      colorbg02: string,
      colorbg03: string,

      colorbd01: string,
      colorbd02: string,

      blue: string,
      lightGreen: string,
      green: string,
      indigo: string,
      purple: string,
      violet: string,
      darkblue: string,
      lightblue: string,
      pink: string,
      red: string,
      orange: string,
      yellow: string,
      teal: string,
      cyan: string,
      white: string,
      gray: string,
      darkgray: string,
      primary: string,
      secondary: string,
      success: string,
      info: string,
      warning: string,
      danger: string,
      light: string,
      dark: string,
      lightblack: string,
      darkcyan: string,
    },
    fonts: {
      core: string[],
      primary: string[],
      secondary: string[],
      numeric: string[],
      label: string[],
      base: string[],
      default: string[],
      mainPrimary: string[],
      mainSecondary: string[],
    },
    fontWeights: {
      medium: number,
      semibold: number,
      bold: number,
    },
    fontSizes: {
      base: string,
      sm: string,
      xs: string,
      md: string,
    },
    fontColors: {
      color: string,
    },
    borders: {
      radius: string,
      radiussm: string,
      radiusmd: string,
      radiuslg: string,
    },
    input: {
      borderColor: string,
    },
    link: {
      hoverDecoration: string,
    },
    shadows: {
      base: string,
      shadow01: string,
      shadow02: string,
      shadow03: string,
      shadow04: string,
    },
    templates: {
      gutterWidth: string,

      heightBase: string,
      heightsm: string,
      heightxs: string,
      heightmd: string,
      heightlg: string,

      headerHeight: string,
      headerHeightsm: string,
      leftbarWidth: string,
      sidebarWidth: string,
      offsetmenuWidth: string,
    },
  }
}
