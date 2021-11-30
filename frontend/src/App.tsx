import 'babel-polyfill';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Provider from 'react-redux/es/components/Provider';
import 'react-toastify/dist/ReactToastify.css';
import 'react-perfect-scrollbar/dist/css/styles.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Styles
// CoreUI Icons Set
import '@coreui/icons/css/coreui-icons.min.css';
// Import Font Awesome Icons Set
import 'font-awesome/css/font-awesome.min.css';
// Import Simple Line Icons Set
import 'simple-line-icons/css/simple-line-icons.css';
// Import remixicon Icons Set
import 'remixicon/fonts/remixicon.css';
// Import Main styles for this application
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { GlobalStyles, theme } from 'styles/theme';
import { ThemeProvider } from 'styled-components';
import { SkeletonTheme } from 'react-loading-skeleton';

// Containers
import Login from 'dwell/views/login';
import ResetPassword from 'dwell/views/reset_password';
import { paths } from 'dwell/constants';
import { DefaultLayout } from './containers';
import store from './store';
import './scss/style.scss';

const App = (): JSX.Element => (
  <ThemeProvider theme={theme}>
    <SkeletonTheme color="#f0f2f9" highlightColor="#fff">
      <GlobalStyles />
      <Provider store={store}>
        <BrowserRouter>
          <Switch>
            <Route exact path={paths.client.LOGIN} component={() => <Login />} />
            <Route exact path={paths.client.SEND_PASSWORD_RESET_EMAIL} component={() => <ResetPassword />} />
            <Route exact path={paths.client.PASSWORD_RESET} component={() => <ResetPassword />} />
            <Route path={paths.client.BASE} component={() => <DefaultLayout />} />
          </Switch>
        </BrowserRouter>
      </Provider>
    </SkeletonTheme>
  </ThemeProvider>
);

export default App;
