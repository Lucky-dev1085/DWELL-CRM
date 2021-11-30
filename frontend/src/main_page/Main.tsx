import 'babel-polyfill';
import 'src/polyfill';
import React from 'react';
import { theme } from 'styles/theme';
import { ThemeProvider } from 'styled-components';
import store from 'store/index';
import Provider from 'react-redux/es/components/Provider';
import 'remixicon/fonts/remixicon.css';
import DemoLayout from 'main_page/views/Layout';
import { GlobalStyles } from './styles';

const Main = (): JSX.Element => (
  <ThemeProvider theme={theme}>
    <GlobalStyles />
    <Provider store={store}>
      <DemoLayout />
    </Provider>
  </ThemeProvider>
);

export default Main;
