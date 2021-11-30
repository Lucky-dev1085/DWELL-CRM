/* eslint-disable jsx-a11y/label-has-for */
import React, { FC, useEffect, useState } from 'react';
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import actions from 'dwell/actions/index';
import DefaultHeaderDropdown from 'containers/DefaultLayout/DefaultHeaderDropdown';
import Notifications from 'dwell/components/notifications';
import RecentMessages from 'dwell/components/messages';
import { isEmpty } from 'lodash';
import { getPropertyId } from 'src/utils';
import styled, { css } from 'styled-components';
import caret from 'src/assets/img/icons/arrow-down-s-line.svg';
import { platformTypes } from 'site/constants';
import { CustomerProps, PropertyProps } from 'src/interfaces';

const Logo = styled.a`
    align-items: center;
    height: 32px;
    position: relative;
    outline: none;
    display: ${props => (props.displayLogo ? 'flex' : 'none')};
    cursor: pointer;

    &:focus, &:hover {
      text-decoration: none;
    }
`;

const LogoImg = styled.img`
    width: auto;
    height: 100%;
    margin-right: 10px;
    background: #ccc;
`;

const Header = styled.div`
    background-color: #fff;
    position: relative;
    height: ${props => props.theme.templates.headerHeight};
    border-bottom: 1px solid ${props => props.theme.colors.colorbg02};
    ${props => !props.hideSwitcher && css`margin-left: 64px;`}
`;

const Container = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 20px;
    width: 100%;
    margin-right: auto;
    margin-left: auto;
`;

const Caret = styled.img`
    height: 14px;
    margin-left: 1px;
    margin-bottom: 1px;
    filter: invert(11%) sepia(74%) saturate(1483%) hue-rotate(203deg) brightness(89%) contrast(93%);
    &:hover {
      filter: invert(41%) sepia(93%) saturate(1646%) hue-rotate(201deg) brightness(104%) contrast(97%);
    }
`;

const Nav = styled.ul`
    margin: 0 auto;
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    list-style: none;
    position: relative;
`;

const NavItem = styled.li`
    color: ${props => (props.active ? props.theme.colors.colorui01 : props.theme.colors.colortx01)};
    margin-right: 20px;
    position: relative;
    padding: 0 10px;
    font-weight: ${props => props.theme.fontWeights.medium};
    outline: none;
    text-decoration: none;
    &:before {
      display: ${props => (props.active ? 'block' : 'none')};
      content: '';
      position: absolute;
      bottom: -22px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: ${props => props.theme.colors.colorui01};
    }
    &:hover {
        color: ${props => props.theme.colors.colorui01};
        ${Caret} {
            filter: invert(41%) sepia(93%) saturate(1646%) hue-rotate(201deg) brightness(104%) contrast(97%);
        }
    }
    &:focus {
        color: ${props => props.theme.colors.colorui01};
        ${Caret} {
            filter: invert(41%) sepia(93%) saturate(1646%) hue-rotate(201deg) brightness(104%) contrast(97%);
        }
    }
    cursor: pointer;
`;

const NavDropdownItem = styled.button`
    outline: none;
    padding: 8px 10px;
    color: ${props => props.theme.colors.colortx02};
    border-radius: 3px;
    border: none;
    width: 100%;
    text-align: start;
    background-color: white;
    font-weight: 400;
    &:hover {
        background-color: ${props => props.theme.colors.colorbg01};
        color: #15274d;
    }
    &:focus {
        outline: none;
    }
`;

const PropertyName = styled.div`
  font-family: 'Yellowtail';
  font-size: 35px;
  color: ${props => props.theme.colors.gray800};
`;

const NavLink = styled.div`
  color: ${props => (props.active ? props.theme.colors.colorui01 : '#15274d')};
  font-weight: ${props => props.theme.fontWeights.medium};
  outline: none;
  text-decoration: none;
  &:hover {
        color: ${props => props.theme.colors.colorui01} !important;
    }
`;

const DropdownMenuStyles = {
  border: 'none',
  borderRadius: '6px',
  boxShadow: '0 1px 2px rgba(152,164,193,0.07), ' +
      '0 2px 4px rgba(152,164,193,0.07), ' +
      '0 4px 8px rgba(152,164,193,0.07), ' +
      '0 8px 16px rgba(152,164,193,0.07), ' +
      '0 16px 32px rgba(152,164,193,0.07), ' +
      '0 32px 64px rgba(152,164,193,0.07)',
};

const navDropdownMenuStyles = {
  ...DropdownMenuStyles,
  padding: '8px',
  marginTop: '10px',
  minWidth: '160px',
  marginLeft: '-10px',
};

interface DefaultHeaderProps extends RouteComponentProps {
  currentUser: {
    id: number,
    is_call_scorer: boolean,
    is_chat_reviewer: boolean,
    role: string,
    logo: string,
    customer_name: string,
  };
  currentProperty: PropertyProps,
  hideSwitcher: boolean,
  customers: CustomerProps[],
}

const DefaultHeader: FC<DefaultHeaderProps> = ({ history: { listen, push },
  currentUser, currentProperty = {}, hideSwitcher, customers, location }) => {
  const [activeLink, setActiveLink] = useState<string>(window.location.pathname);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerProps>(null);
  const [isAdvancedReports, setIsAdvancedReports] = useState<boolean>(false);

  const isCallScorer = currentUser.is_call_scorer;
  const isChatReviewer = currentUser.is_chat_reviewer;
  const adminCallsAndChats = isCallScorer || isChatReviewer;

  useEffect(() => {
    const unlisten = listen(loc => setActiveLink(loc.pathname));
    return () => { unlisten(); };
  }, []);

  useEffect(() => {
    if (currentUser.role === 'CUSTOMER_ADMIN') {
      setCurrentCustomer({ logo: currentUser.logo, customer_name: currentUser.customer_name });
    } else if (!isEmpty(customers) && !isEmpty(currentProperty)) {
      setCurrentCustomer(customers.find(c => c.id === currentProperty.customer));
    }
  }, [customers, currentProperty]);

  useEffect(() => {
    setIsAdvancedReports(location.pathname === `/${getPropertyId() || currentProperty.external_id}/advanced-reports`);
  }, [location]);

  const siteId = getPropertyId() || currentProperty.external_id;

  function setActiveAndPush(link: string) {
    setActiveLink(link);
    push(link);
  }

  function NavBarItem({ route, title, startsWith = false }: { route: string, title: string, startsWith?: boolean }) {
    const link = `/${siteId}/${route}`;
    const active = startsWith ? activeLink.startsWith(link) : activeLink === link;
    return (
      <NavItem active={active} onClick={() => setActiveAndPush(link)}>
        <NavLink active={active}>{title}</NavLink>
      </NavItem>
    );
  }

  return (
    <Header hideSwitcher={hideSwitcher}>
      <Container>
        <Logo displayLogo={siteId && !isEmpty(currentProperty)} href={`http://${currentProperty.domain}`} target="_blank">
          {/* eslint-disable-next-line no-nested-ternary */}
          {isAdvancedReports
            ? !isEmpty(currentCustomer) && currentCustomer.logo
              ? <LogoImg src={currentCustomer.logo} alt="PLogo" />
              : <PropertyName>{currentCustomer ? currentCustomer.customer_name : ''}</PropertyName>
            : currentProperty.logo
              ? <LogoImg src={currentProperty.logo} alt="PLogo" />
              : <PropertyName>{currentProperty.name}</PropertyName>
          }
        </Logo>
        {currentProperty.platform && platformTypes.SITE_ONLY !== currentProperty.platform ?
          <>
            <Nav navbar>
              {currentUser.id && (
                adminCallsAndChats
                  ? (isCallScorer && isChatReviewer && <>
                    <NavBarItem route="calls" title="Calls" />
                    <NavBarItem route="chats" title="Chats" startsWith />
                  </>)
                  : <>
                    <NavBarItem route="leads" title="Pipeline" />
                    <NavBarItem route="tasks" title="Tasks" />
                    <Dropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
                      <NavItem active={activeLink === `/${siteId}/followups` || activeLink === `/${siteId}/bulk_email`}>
                        <DropdownToggle tag="span" data-toggle="dropdown" aria-expanded={dropdownOpen}>
                          Emails
                          <Caret src={caret} alt="caret" />
                        </DropdownToggle>
                      </NavItem>
                      <DropdownMenu style={navDropdownMenuStyles}>
                        <NavDropdownItem onClick={() => setActiveAndPush(`/${siteId}/followups`)}>
                                Followups
                        </NavDropdownItem>
                        <NavDropdownItem onClick={() => setActiveAndPush(`/${siteId}/bulk_email`)} disabled={currentProperty && currentProperty.is_email_blast_disabled}>
                          Bulk email
                        </NavDropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                    <NavBarItem route="calls" title="Calls" />
                    <NavBarItem route="reports" title="Reports" />
                  </>
              )}
            </Nav>
            {!adminCallsAndChats && currentProperty.agent_chat_enabled && <RecentMessages />}
            {!adminCallsAndChats && <Notifications />}
          </>
          : <Nav navbar />
        }
        <DefaultHeaderDropdown />
      </Container>
    </Header>);
};

const mapStateToProps = state => ({
  currentProperty: state.property.property,
  currentUser: state.user.currentUser,
  customers: state.customer.customers,
});

export default connect(mapStateToProps, { ...actions.user })(withRouter(DefaultHeader));
