// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { FC, useEffect, useState } from 'react';
import { Redirect, Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';
import { Container } from 'reactstrap';
import styled, { css } from 'styled-components';
import { isEmpty } from 'lodash';
import cn from 'classnames';
import { connect } from 'react-redux';
import {
  AppBreadcrumb,
} from '@coreui/react';
import { ToastContainer } from 'react-toastify';

import routes, { manageRoutes, siteRoutes } from 'src/routes';

import { LOGGED_ACCOUNT, RECENT_PROPERTY_HYPHENS, REDIRECT_PATH, redirectPaths } from 'dwell/constants';

import DefaultHeader from 'containers/DefaultLayout/DefaultHeader';
import PropertySwitcher from 'containers/PropertySwitcher';
import CallScorerPropertySwitcher from 'containers/CallScorerPropertySwitcher';
import 'spinkit/css/spinkit.css';
import { build, client } from 'dwell/constants/paths';
import { getPropertyId } from 'src/utils';
import Chat from 'dwell/views/chat/single_chat';
import actions from 'dwell/actions';
import LeadDetailLayout from 'dwell/views/lead/layout';
import DefaultAside from 'containers/DefaultLayout/DefaultAside';
import { platformTypes, roleTypes } from 'site/constants';
import { PropertyProps } from 'src/interfaces';
import SkeletonLoader from 'site/views/skeleton_loader';

const Main = styled.main`
  margin-left: ${props => props.theme.templates.leftbarWidth};
  flex: 1;
  min-width: 0;
  background-color: #f7f8fc;

  ${props => (!props.isViewSideBar ? css`
      margin-left: 0;
    ` : '')}
`;

const ContainerFluid = styled(Container)`
  padding: 0;
`;

interface DefaultLayoutProps extends RouteComponentProps {
  logout: () => void,
  currentUser: {
    has_advanced_reports_access: boolean,
    is_call_scorer: boolean,
    is_chat_reviewer: boolean,
    role: string,
  },
  property: {
    platform: string,
  },
  properties: PropertyProps[],
  isSessionTimedOut: boolean,
}

const DefaultLayout: FC<DefaultLayoutProps> = ({ currentUser, property, properties, location, history: { push }, isSessionTimedOut, logout }) => {
  const [isSwitcherOpen, switcherToggle] = useState<boolean>(false);
  const [adminCallsAndChats, setAdminCallsAndChats] = useState<boolean>(false);

  useEffect(() => {
    const redirectPath = localStorage.getItem(REDIRECT_PATH);
    const loggedAccount = localStorage.getItem(LOGGED_ACCOUNT);

    if (!loggedAccount) {
      if (location.pathname.includes(redirectPaths)) {
        localStorage.setItem(REDIRECT_PATH, location.pathname);
      }
      logout();
    }

    if (redirectPath && loggedAccount) {
      push(redirectPath);
      localStorage.removeItem(REDIRECT_PATH);
    }
  }, []);

  useEffect(() => {
    const isAdminCallsAndChats = currentUser.is_call_scorer || currentUser.is_chat_reviewer;
    if (isAdminCallsAndChats) {
      document.body.classList.add('aside-menu-show');
    }
    setAdminCallsAndChats(isAdminCallsAndChats);
  }, [currentUser]);

  const isDisablePropertySwitcher = !adminCallsAndChats && currentUser.role === roleTypes.GENERIC_ADMIN && properties.length === 1;
  const isViewSideBar = property.platform !== 'DWELL' && !isDisablePropertySwitcher;

  const breadcrumbRoutes = location.pathname === build(client.FOLLOWUPS.DETAILS, location.pathname.split('/')[1], location.pathname.split('/').pop())
      && <AppBreadcrumb appRoutes={routes} />;

  const propertyId = localStorage.getItem(RECENT_PROPERTY_HYPHENS);
  const redirectRoutes = propertyId && (
    <Route
      exact
      path="/"
      render={() => {
        push(build(
          // eslint-disable-next-line no-nested-ternary
          currentUser.is_call_scorer
            ? client.CALLS
            : currentUser.is_chat_reviewer
              ? client.CHATS.OVERVIEW
              : client.LEADS.VIEW
          , propertyId,
        ));
      }}
    />
  );

  if (location.pathname.split('/')[1] === 'compete') {
    push(`/${propertyId}${location.pathname}`);
  }

  const pageRoutes = routes.map((route, idx) => {
    const ParentComp = route.leadDetail ? LeadDetailLayout : React.Fragment;
    let redirectPath = null;
    if (currentUser.is_chat_reviewer && !currentUser.is_call_scorer && !route.path.startsWith(client.CHATS.OVERVIEW)) redirectPath = build(client.CHATS.OVERVIEW, getPropertyId());
    else if (currentUser.is_call_scorer && route.path !== client.CALLS && !route.path.startsWith(client.CHATS.OVERVIEW)) redirectPath = build(client.CALLS, getPropertyId());
    else if (route.path === client.REPORTS.ADVANCED && !currentUser.has_advanced_reports_access) redirectPath = build(client.LEADS.VIEW, getPropertyId());
    else if (property.platform === platformTypes.SITE_ONLY && route.isDwell) redirectPath = build(client.SITE_CONTENT.HOME, getPropertyId());
    else if (property.platform === platformTypes.DWELL_ONLY && route.isSite) redirectPath = build(client.LEADS.VIEW, getPropertyId());
    else if (currentUser.role !== roleTypes.LIFT_LYTICS_ADMIN && route.path === client.MANAGE_CUSTOMERS) {
      redirectPath = build(client.SITE_CONTENT.HOME, getPropertyId());
    } else if (currentUser.role === roleTypes.GENERIC_ADMIN && siteRoutes.concat(manageRoutes).map(i => i.path).includes(route.path)) {
      redirectPath = build(client.LEADS.VIEW, getPropertyId());
    } else if ([roleTypes.GENERIC_ADMIN, roleTypes.PROPERTY_ADMIN].includes(currentUser.role) && route.path === client.HOBBES_SETTINGS) {
      redirectPath = build(client.LEADS.VIEW, getPropertyId());
    }
    return (
      <Route
        key={idx}
        path={route.path}
        exact={route.exact}
        render={props => (redirectPath ? <Redirect to={redirectPath} /> : <ParentComp><Switch><route.component {...props} /></Switch></ParentComp>)}
      />
    );
  });

  return (
    <div className={cn('app', { 'aside-menu-show': adminCallsAndChats })}>
      {currentUser.id && (adminCallsAndChats
        ? <CallScorerPropertySwitcher show={isSwitcherOpen} propertySwitcherToggle={switcherToggle} disable={isDisablePropertySwitcher} />
        : <PropertySwitcher show={isSwitcherOpen} propertySwitcherToggle={switcherToggle} disable={isDisablePropertySwitcher} />
      )}
      <DefaultAside propertySwitcherToggle={switcherToggle} isViewSideBar={isViewSideBar} />
      <DefaultHeader hideSwitcher={isDisablePropertySwitcher} />
      <div className="app-body">
        {!isSessionTimedOut ?
          <Main isViewSideBar={isViewSideBar}>
            {breadcrumbRoutes}
            {!isEmpty(currentUser) && !isEmpty(property) &&
              <ContainerFluid fluid className={cn({ profile_page: location.pathname === client.PROFILE })}>
                <Switch>
                  {pageRoutes}
                  {redirectRoutes}
                </Switch>
              </ContainerFluid>}
          </Main>
          :
          <Main isViewSideBar={isViewSideBar}>
            <SkeletonLoader />
          </Main>
        }
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} style={{ zIndex: 1999 }} />
      {(!adminCallsAndChats && !location.pathname.includes(build(client.MULTI_CHAT, getPropertyId()))) ? <Chat /> : null}
    </div>
  );
};

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  property: state.property.property,
  properties: state.property.properties,
  isSessionTimedOut: state.authentication.isSessionTimedOut,
});

export default connect(
  mapStateToProps,
  {
    ...actions.authentication,
  },
)(withRouter(DefaultLayout));
