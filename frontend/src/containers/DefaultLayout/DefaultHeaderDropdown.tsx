import React, { FC, useEffect, useState } from 'react';
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import actions from 'dwell/actions/index';
import { build, client } from 'dwell/constants/paths';
import AccountSwitcherModal from 'containers/AccountSwitcher';
import ReloginFlowModal from 'containers/ReLoginFlow';
import { isEmpty } from 'lodash';
import { getPropertyId } from 'src/utils';
import { platformTypes } from 'site/constants';
import Profile from 'src/dwell/views/Profile';
import { getShortName, LAST_ACTIVITY_DATE } from 'dwell/constants';
import { UserProps, DetailResponse } from 'src/interfaces';
import moment from 'moment';
import PusherManager from '../../pusher';
import { UserAccount, accountDropdownMenuStyles, AccountSwitchButton, UserAvatar,
  UserAvatarEmpty, UserSettingsAvatar, UserSettingsAvatarEmpty, UserSettingsEmail, UserSettingsHeader, UserSettingsIcon,
  UserSettingsItem, UserSettingsName, Divider } from './styles';

interface DefaultHeaderDropdownProps extends RouteComponentProps {
  logout: () => void,
  getCurrentUser: () => Promise<DetailResponse>,
  getCurrentProperty: () => Promise<null>,
  currentUser: UserProps,
  property: { external_id: string, id: number, platform: string, },
  onAvailableChange: (checked: boolean) => void,
  activeProperties: number[],
  setActiveProperties: (ids?: number[]) => void,
  isSessionTimedOut: boolean,
  sessionTimeout: () => void,
  updateUserLastProperty: (id: number, user: UserProps) => Promise<DetailResponse>,
}

const DefaultHeaderDropdown: FC<DefaultHeaderDropdownProps> = ({ history: { push }, location, logout, getCurrentUser, getCurrentProperty,
  currentUser, property: currentProperty = {}, activeProperties, setActiveProperties, isSessionTimedOut, sessionTimeout, updateUserLastProperty }) => {
  const [dropdownOpen, setDropDownOpen] = useState(false);
  const [isShowingModal, setIsShowingModal] = useState(false);
  const [isShowingProfile, setIsShowProfile] = useState(false);

  const siteId = getPropertyId() || currentProperty.external_id;

  const handleGetCurrentUser = (isRepeat = false) => {
    getCurrentUser().then(() => {
      getCurrentProperty();
    }).catch(() => {
      if (isRepeat) setTimeout(handleGetCurrentUser, 1000);
    });
  };

  useEffect(() => {
    if (!isEmpty(currentUser) && !isEmpty(currentProperty) && currentUser.last_property !== currentProperty.id) {
      updateUserLastProperty(currentUser.id, { last_property: currentProperty.id });
    }
  }, [currentProperty]);

  useEffect(() => {
    handleGetCurrentUser(true);
  }, []);

  useEffect(() => {
    setInterval(() => {
      const lastActivityDate = localStorage.getItem(LAST_ACTIVITY_DATE) || '';
      if (lastActivityDate) {
        if (moment(lastActivityDate).add(1, 'hours').diff(moment()) < 0) {
          sessionTimeout();
        }
      }
    }, 15 * 60 * 1000);
  }, []);

  useEffect(() => {
    if (!location.pathname.includes(build(client.MULTI_CHAT, getPropertyId())) && !isEmpty(currentProperty) && !activeProperties.includes(currentProperty.id)) {
      setActiveProperties(activeProperties.concat([currentProperty.id]));
    }
  }, [currentProperty]);

  useEffect(() => {
    if (!isEmpty(currentUser)) {
      const { id } = currentUser;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { crmApp: { config } } = window;
      if (config.pusherKey && config.pusherCluster) {
        const pusher = new PusherManager(config.pusherKey, config.pusherCluster);
        pusher.initializePusher(['notification', 'agentrequest', 'typing'], id);
      }
    }
  }, [currentUser]);

  const onSettingsClick = () => {
    push(build(client.SETTINGS.ASSIGN_LEAD_OWNERS, siteId));
  };

  const toggle = () => {
    setDropDownOpen(!dropdownOpen);
  };

  const navigateAdvancedReports = () => {
    push(build(client.REPORTS.ADVANCED, siteId));
  };

  const navigateCompete = () => {
    push(build(client.COMPETE.HOME, siteId));
  };

  const { first_name: firstName, last_name: lastName, avatar, email, has_advanced_reports_access: hasAdvancedReportAccess } = currentUser;
  const siteProperty = currentProperty.platform ? platformTypes.SITE_ONLY === currentProperty.platform : true;

  return (
    <React.Fragment>
      {isShowingModal && <AccountSwitcherModal currentUser={currentUser} show={isShowingModal} handleClose={() => setIsShowingModal(!isShowingModal)} />}
      {isSessionTimedOut && <ReloginFlowModal currentUser={currentUser} show={isSessionTimedOut} />}
      <Profile show={isShowingProfile} handleClose={() => setIsShowProfile(false)} />
      <Dropdown isOpen={dropdownOpen} toggle={toggle}>
        <UserAccount>
          <DropdownToggle
            tag="span"
            data-toggle="dropdown"
            aria-expanded={dropdownOpen}
          >
            {(avatar || !(firstName && lastName)) ? (
              <UserAvatarEmpty>
                <UserAvatar src={avatar || '/static/images/default-avatar.gif'} alt="avatar" />
              </UserAvatarEmpty>
            ) : (
              <UserAvatarEmpty>
                {getShortName(`${firstName} ${lastName}`)}
              </UserAvatarEmpty>
            )}
          </DropdownToggle>
        </UserAccount>
        <DropdownMenu
          modifiers={{
            setWidth: {
              enabled: true,
              fn: data => ({ ...data, styles: { ...data.styles, ...accountDropdownMenuStyles } }),
            },
          }}
          right
        >
          <UserSettingsHeader>
            {(avatar || !(firstName && lastName)) ? (
              <UserSettingsAvatarEmpty>
                <UserSettingsAvatar src={avatar || '/static/images/default-avatar.gif'} alt="avatar" />
              </UserSettingsAvatarEmpty>
            ) : (
              <UserSettingsAvatarEmpty>
                {getShortName(`${firstName} ${lastName}`)}
              </UserSettingsAvatarEmpty>
            )}
            <UserSettingsName>{firstName} {lastName}</UserSettingsName>
            <UserSettingsEmail>{email}</UserSettingsEmail>
            {!currentUser.is_call_scorer && !siteProperty && <AccountSwitchButton onClick={() => { setIsShowingModal(true); setDropDownOpen(false); }}>Switch account</AccountSwitchButton>}
          </UserSettingsHeader>
          {!currentUser.is_call_scorer &&
              <React.Fragment>
                <UserSettingsItem onClick={() => { setIsShowProfile(true); setDropDownOpen(false); }} ><UserSettingsIcon className="ri-user-settings-line" /> My Profile</UserSettingsItem>
                {!siteProperty && <UserSettingsItem onClick={onSettingsClick} ><UserSettingsIcon className="ri-settings-4-line" /> Settings</UserSettingsItem>}
                <Divider />
                {hasAdvancedReportAccess && !siteProperty && <UserSettingsItem onClick={navigateAdvancedReports} ><UserSettingsIcon className="ri-pie-chart-line" /> Advanced Reports</UserSettingsItem>}
                {!siteProperty && <UserSettingsItem onClick={navigateCompete} ><UserSettingsIcon className="ri-bar-chart-2-line" /> Compete</UserSettingsItem>}
                <Divider />
                {!siteProperty && <UserSettingsItem onClick={() => window.open('https://www.notion.so/Help-Support-ac701af2ceaf4fedb1163dd5af6800e5')} ><UserSettingsIcon className="ri-question-line" /> Help & support</UserSettingsItem>}
              </React.Fragment>}
          <UserSettingsItem onClick={logout}><UserSettingsIcon className="ri-logout-box-r-line" /> Logout</UserSettingsItem>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  property: state.property.property,
  activeProperties: state.prospectChat.activeProperties,
  isSessionTimedOut: state.authentication.isSessionTimedOut,
});

export default connect(
  mapStateToProps,
  {
    ...actions.authentication,
    ...actions.user,
    ...actions.property,
    ...actions.prospectChat,
  },
)(withRouter(DefaultHeaderDropdown));
