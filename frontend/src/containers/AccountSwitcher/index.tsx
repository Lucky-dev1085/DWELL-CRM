import React, { useEffect, useState, FC } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { FormFeedback, FormGroup, Input, ModalBody, ModalHeader } from 'reactstrap';
import actions from 'dwell/actions';
import { isEmpty } from 'lodash';
import { paths } from 'dwell/constants';
import { getPropertyId } from 'src/utils';
import { getColorFromString } from 'site/common/getColor';
import { DetailResponse } from 'src/interfaces';
import { ModalWindow, ModalSubtitle, MediaBody, Avatar, ContentLabel, EmptyList, Media, AvailableAccounts, PasswordContainer } from './styles';

interface UserProps {
  id?: number,
  first_name?: string,
  last_name?: string,
  email?: string
}
interface AccountSwitcherProps extends RouteComponentProps {
  show: boolean,
  handleClose: () => null,
  login: (data: { email: string, password: string }) => Promise<DetailResponse>,
  resetLoginState: () => null,
  getTeamMates: () => void,
  currentUser: { id: number, first_name: string, last_name: string, email: string },
  teamUsers: { id: number, first_name: string, last_name: string, email: string }[],
  isFormInvalid: boolean,
}

const AccountSwitcherModal: FC<AccountSwitcherProps> = ({ show, handleClose, currentUser, teamUsers, login, isFormInvalid,
  resetLoginState, history: { push }, getTeamMates }) => {
  const [selectedUser, setSelectedUser] = useState<UserProps>({});
  const [password, setPassword] = useState('');
  const closeBtn = <button className="close" onClick={() => handleClose()}><i className="ri-close-line" /></button>;

  useEffect(() => {
    if (!teamUsers.length) getTeamMates();
  }, []);

  useEffect(() => {
    setTimeout(() => setSelectedUser({}), 1000);
  }, [show]);

  const handlePasswordChange = (value) => {
    if (isFormInvalid) {
      resetLoginState();
    }
    setPassword(value);
  };

  const loginUser = (user) => {
    login({ email: user.email, password })
      .then((response) => {
        if (response) {
          const externalId = getPropertyId();
          if (externalId) {
            push(`/${externalId}/leads`);
          } else {
            push(paths.client.BASE);
          }
          window.location.reload();
        }
      });
  };

  const handleKeyPress = ({ key }) => {
    if (key === 'Enter') {
      loginUser(selectedUser);
    }
  };

  const changeAccount = (user) => {
    // if (moment().diff(user.last_activity, 'hours') <= 24) {
    //   loginUser(user);
    // }
    setSelectedUser(user);
  };

  const UserAvatar = ({ user }) => (
    <React.Fragment>
      {(user.avatar || !(user.first_name && user.last_name)) ? (
        <Avatar>
          <img src={user.avatar || '/static/images/default-avatar.gif'} alt="avatar" />
        </Avatar>
      ) :
        (
          <Avatar style={{ backgroundColor: getColorFromString(user.last_name) }}>
            {user.first_name[0]}{user.last_name[0]}
          </Avatar>
        )}
    </React.Fragment>
  );

  return (
    <ModalWindow isOpen={show} toggle={() => handleClose()} centered>
      <ModalHeader close={closeBtn}>Switch Accounts</ModalHeader>
      <ModalBody>
        {!isEmpty(selectedUser) ?
          <React.Fragment>
            <div>
              <Media active>
                <UserAvatar user={selectedUser} />
                <MediaBody>
                  <h6>{selectedUser.first_name} {selectedUser.last_name}</h6>
                  <p>{selectedUser.email}</p>
                </MediaBody>
              </Media>
              <PasswordContainer className="mt-5">
                <FormGroup>
                  <Input
                    type="password"
                    id="password"
                    placeholder="Enter account password"
                    value={password}
                    onChange={({ target: { value } }) => handlePasswordChange(value)}
                    onKeyPress={handleKeyPress}
                    invalid={isFormInvalid}
                  />
                  <FormFeedback>The password you entered is invalid. Please try again.</FormFeedback>
                </FormGroup>
                <div className="d-flex">
                  <button className="btn btn-primary flex-fill justify-content-center" onClick={() => loginUser(selectedUser)}>Switch Account</button>
                  <button className="btn btn-white flex-fill justify-content-center ml-3" onClick={() => setSelectedUser({})}>
                    Cancel
                  </button>
                </div>
              </PasswordContainer>
            </div>
          </React.Fragment> :
          <React.Fragment>
            <ModalSubtitle>You&#39;re currently logged in as:</ModalSubtitle>
            <Media className="my-4" active>
              <UserAvatar user={currentUser} />
              <MediaBody>
                <h6>{currentUser.first_name} {currentUser.last_name}</h6>
                <p>{currentUser.email}</p>
              </MediaBody>
            </Media>
            <ContentLabel>Switch account to:</ContentLabel>
            <AvailableAccounts>
              {isEmpty(teamUsers.filter(user => user.id !== currentUser.id)) ?
                <EmptyList>
                  <p>There are no available accounts to switch to.</p>
                </EmptyList> :
                teamUsers.filter(user => user.id !== currentUser.id).map((user, index) => (
                  <Media isSwitch key={index} onClick={() => changeAccount(user)}>
                    <UserAvatar user={user} />
                    <MediaBody>
                      <h6>{user.first_name} {user.last_name}</h6>
                      <p>{user.email}</p>
                    </MediaBody>
                  </Media>
                ))}
            </AvailableAccounts>
          </React.Fragment>}
      </ModalBody>
    </ModalWindow>
  );
};

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  teamUsers: state.user.teamUsers,
  isFormInvalid: state.authentication.isFormInvalid,
});

export default connect(
  mapStateToProps,
  {
    ...actions.authentication,
    ...actions.user,
    ...actions.property,
  },
)(withRouter(AccountSwitcherModal));
