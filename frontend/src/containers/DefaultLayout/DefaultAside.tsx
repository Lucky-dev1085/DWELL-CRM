import React, { useState, useEffect, FC } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { connect } from 'react-redux';
import { Tooltip } from 'reactstrap';
import { FlexCenter } from 'styles/common';
import { paths } from 'dwell/constants';
import { getPropertyId } from 'src/utils';
import { platformTypes, roleTypes } from 'site/constants';
import { UserProps } from 'src/interfaces';

const Leftbar = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: ${props => props.theme.templates.leftbarWidth};
    background-color: #fff;
    border-right: 1px solid ${props => props.theme.colors.colorbg02};

    ${props => (props.hiddenSideBar ? css`
      display: none;
    ` : '')}
`;

const LeftbarHeader = styled.div`
    height: ${props => props.theme.templates.headerHeight};
    ${FlexCenter}
    cursor: pointer;
`;

const LeftbarBody = styled.div`
    height: calc(100vh - ${props => props.theme.templates.headerHeight});
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 30px 0 20px;
`;

const LeftbarLogo = styled.span`
    display: flex;
    align-items: flex-end;
    justify-content: center;
    position: relative;

    i {
      font-size: 24px;
      color: ${props => props.theme.colors.colortx02};
    }

    i:hover {
      color: ${props => props.theme.colors.colortx01};
    }
`;

const Nav = styled.nav`
    flex-direction: column;
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
`;

const NavItem = styled.div`
  margin-bottom: 15px;
  position: relative;
  outline: none;
  padding: 0;
  font-size: 22px;
  font-weight: 400;
  width: ${props => props.theme.templates.heightBase};
  height: ${props => props.theme.templates.heightBase};
  ${FlexCenter}
  cursor: pointer;
  color: ${props => (props.active ? props.theme.colors.colorui01 : 'rgba(74,94,138,0.75)')};

  i:hover {
    color: ${props => props.theme.colors.colorui01};
  }

  .ri-group-fill {
    font-size: 21px;
  }
}
`;

const NavItemTooltip = styled(Tooltip)`
  .tooltip-inner {
    border-radius: 3px;
    white-space: nowrap;
    padding: 0 12px;
    height: 34px;
    display: flex;
    align-items: center;
    font-size: 13px;
    background-color: rgba(0, 0, 0, 0.95);
  }
`;

const getTabFromRoute = (route) => {
  const propertyId = getPropertyId();
  const routesSiteContent = [
    paths.client.SITE_CONTENT.HOME,
    paths.client.SITE_CONTENT.GALLERY,
    paths.client.SITE_CONTENT.FLOOR_PLANS,
    paths.client.SITE_CONTENT.AMENITIES,
    paths.client.SITE_CONTENT.NEIGHBORHOOD,
    paths.client.SITE_CONTENT.VIRTUAL_TOUR,
    paths.client.SITE_CONTENT.CONTACT,
    paths.client.SITE_CONTENT.FOOTER,
    paths.client.SITE_CONTENT.DESIGN,
    paths.client.SITE_CONTENT.MISC,
    paths.client.SITE_CONTENT.PROMOTIONS,
  ].map(r => paths.build(r, propertyId));

  const routesHobbesSettings = paths.build(paths.client.HOBBES_SETTINGS, propertyId);
  const routesManageUsers = paths.build(paths.client.MANAGE_USERS, propertyId);
  const routesManageCustomers = paths.build(paths.client.MANAGE_CUSTOMERS, propertyId);
  const routesManageClients = paths.build(paths.client.MANAGE_CLIENTS, propertyId);
  const routesManageProperties = paths.build(paths.client.MANAGE_PROPERTIES, propertyId);

  if (routesSiteContent.includes(route)) return 'Site Contents';

  if (routesHobbesSettings === route) return 'Hobbes Settings';

  if (routesManageUsers === route || paths.client.MANAGE_USERS.replace('/:propertyHyphens?', '') === route) return 'Users';

  if (routesManageCustomers === route || paths.client.MANAGE_CUSTOMERS.replace('/:propertyHyphens?', '') === route) return 'Customers';

  if (routesManageClients === route || paths.client.MANAGE_CLIENTS.replace('/:propertyHyphens?', '') === route) return 'Clients';

  if (routesManageProperties === route || paths.client.MANAGE_PROPERTIES.replace('/:propertyHyphens?', '') === route) return 'Properties';

  return null;
};

interface DefaultAsideProps extends RouteComponentProps {
  propertySwitcherToggle: (updateToggle: boolean) => void,
  isViewSideBar: boolean,
  property: { platform: string, },
  currentUser: UserProps,
}

const DefaultAside: FC<DefaultAsideProps> = ({ location: { state, pathname }, history: { push }, propertySwitcherToggle, isViewSideBar,
  property: currentProperty = {}, currentUser }) => {
  const [active, setActive] = useState(getTabFromRoute(pathname));
  const [tooltipOpen, setTooltipOpen] = useState(Array(5).fill(false));

  let navItems = [
    { name: 'Properties', icon: 'ri-home-7-fill', path: paths.client.MANAGE_PROPERTIES },
    { name: 'Clients', icon: 'ri-home-smile-2-fill', path: paths.client.MANAGE_CLIENTS },
    { name: 'Customers', icon: 'ri-team-fill', path: paths.client.MANAGE_CUSTOMERS },
    { name: 'Users', icon: 'ri-group-fill', path: paths.client.MANAGE_USERS },
    { name: 'Site Contents', icon: 'ri-settings-fill', path: paths.client.SITE_CONTENT.HOME },
    { name: 'Hobbes Settings', icon: 'ri-rocket-fill', path: paths.client.HOBBES_SETTINGS },
  ];

  const toggle = (id) => {
    const tooltipState = [...tooltipOpen];
    tooltipState[id] = !tooltipState[id];
    setTooltipOpen(tooltipState);
  };

  const toggleSideBar = (tab) => {
    if (active !== tab) {
      setActive(tab);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (state && state.sideTab !== undefined) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      toggleSideBar(state.sideTab);
    } else {
      toggleSideBar(getTabFromRoute(pathname));
    }
  }, [pathname]);

  const redirect = (tab) => {
    push({ pathname: paths.build(tab.path, getPropertyId()), state: { sideTab: tab.name } });
    toggleSideBar(tab.name);
  };

  if (!currentProperty.platform || currentProperty.platform === platformTypes.DWELL_ONLY) {
    navItems = navItems.filter(item => item.name !== 'Site Contents');
  }

  if (currentUser.role !== roleTypes.LIFT_LYTICS_ADMIN) {
    navItems = navItems.filter(item => item.name !== 'Customers');
  }

  if (currentUser.role === roleTypes.PROPERTY_ADMIN) {
    navItems = navItems.filter(item => item.name !== 'Hobbes Settings');
  }

  if (currentUser.role === roleTypes.GENERIC_ADMIN || currentUser.is_call_scorer) {
    navItems = [];
  }

  return (
    <Leftbar hiddenSideBar={!isViewSideBar}>
      <LeftbarHeader onClick={() => propertySwitcherToggle(true)}>
        <LeftbarLogo>
          <i className="ri-menu-2-line" />
        </LeftbarLogo>
      </LeftbarHeader>
      {isViewSideBar && (
        <LeftbarBody>
          <Nav>
            {navItems.map((item, index) => (
              <React.Fragment key={index}>
                <NavItem
                  onClick={() => redirect(item)}
                  active={active === item.name}
                  id={item.name.replace(/ /g, '')}
                >
                  <i className={item.icon} />
                </NavItem>
                <NavItemTooltip
                  placement="top"
                  isOpen={tooltipOpen[index]}
                  target={item.name.replace(/ /g, '')}
                  toggle={() => toggle(index)}
                >
                  {item.name}
                </NavItemTooltip>
              </React.Fragment>
            ))}
          </Nav>
        </LeftbarBody>)
      }
    </Leftbar>);
};

const mapStateToProps = state => ({
  property: state.property.property,
  currentUser: state.user.currentUser,
});

export default connect(mapStateToProps)(withRouter(DefaultAside));
