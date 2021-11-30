import React, { useEffect, useState, FC } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { FormFeedback, FormGroup, Input, ModalBody, ModalHeader } from 'reactstrap';
import actions from 'dwell/actions';
import { isEmpty } from 'lodash';
import { paths } from 'dwell/constants';
import { getColorFromString } from 'site/common/getColor';
import { DetailResponse } from 'src/interfaces';
import { getPropertyId } from 'src/utils';
import { ModalWindow, ModalSubtitle, MediaBody, Avatar, Media, PasswordContainer, LinkForgot, ContentLabel, AvailableAccounts, EmptyList } from './styles';

interface ReloginFlowProps extends RouteComponentProps {
  show: boolean,
  login: (data: { email: string, password: string }) => Promise<DetailResponse>,
  resetLoginState: () => null,
  getTeamMates: () => void,
  currentUser: { id: number, first_name: string, last_name: string, email: string },
  teamUsers: { id: number, first_name: string, last_name: string, email: string }[],
  isFormInvalid: boolean,
  logout: () => void,
}

const ReloginFlowModal: FC<ReloginFlowProps> = ({ show, currentUser, login, isFormInvalid, resetLoginState, history: { push }, logout, getTeamMates,
  teamUsers }) => {
  const [selectedUser, setSelectedUser] = useState(currentUser);
  const [password, setPassword] = useState('');
  const [reloginStep, setStep] = useState(1);

  useEffect(() => {
    if (!teamUsers.length) getTeamMates();
  }, []);

  useEffect(() => {
    if (isEmpty(currentUser)) {
      logout();
    }
  }, [currentUser]);

  const handlePasswordChange = (value) => {
    if (isFormInvalid) {
      resetLoginState();
    }
    setPassword(value);
  };

  useEffect(() => {
    handlePasswordChange('');
  }, [selectedUser]);

  const loginUser = (user) => {
    login({ email: user.email, password })
      .then((response) => {
        if (response) {
          if (user.email !== currentUser.email) {
            const externalId = getPropertyId();
            if (externalId) {
              push(`/${externalId}/leads`);
            } else {
              push(paths.client.BASE);
            }
            window.location.reload();
          }
        }
      });
  };

  const handleKeyPress = ({ key }) => {
    if (key === 'Enter') {
      loginUser(selectedUser);
    }
  };

  const changeAccount = (user) => {
    setSelectedUser(user);
    setStep(3);
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

  const switchAccount = reloginStep === 3;

  return (
    <ModalWindow isOpen={show} centered>
      <ModalHeader>{[2, 3].includes(reloginStep) ? 'Switch Accounts' : 'Enter Password'}</ModalHeader>
      <ModalBody>
        {[1, 3].includes(reloginStep) &&
          <ModalSubtitle className="mb-30">
            { !switchAccount ? `Due to inactivity, your Dwell session has ended.
            Please log back in below` : 'Enter account password:' }
          </ModalSubtitle>}
        {!isEmpty(selectedUser) && reloginStep !== 2 ?
          <React.Fragment>
            <div>
              <Media active>
                <UserAvatar user={selectedUser} />
                <MediaBody>
                  <h6>{selectedUser.first_name} {selectedUser.last_name}</h6>
                  <p>{selectedUser.email}</p>
                </MediaBody>
              </Media>
              <PasswordContainer className="mt-4">
                <FormGroup className="mb-4">
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
                  {!switchAccount &&
                    <div className="text-right" style={{ marginTop: '-2px' }}>
                      <LinkForgot onClick={() => push(paths.client.SEND_PASSWORD_RESET_EMAIL)}>Forgot password?</LinkForgot>
                    </div>}
                </FormGroup>
                <div className="d-flex">
                  <button className="btn btn-primary flex-fill justify-content-center" onClick={() => loginUser(selectedUser)}>
                    {switchAccount ? 'Switch Account' : 'Login'}
                  </button>
                  <button className="btn btn-white flex-fill justify-content-center ml-10" onClick={() => setStep(2)}>
                    {switchAccount ? 'Cancel' : 'Switch Account'}
                  </button>
                </div>
              </PasswordContainer>
            </div>
          </React.Fragment> :
          <React.Fragment>
            <Media className="mb-4" active isClick onClick={() => { setStep(1); setSelectedUser(currentUser); }}>
              <UserAvatar user={currentUser} />
              <MediaBody>
                <h6>{currentUser.first_name} {currentUser.last_name}</h6>
                <p>{currentUser.email}</p>
                <i>Logged out due to inactivity</i>
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
          </React.Fragment>
        }
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
)(withRouter(ReloginFlowModal));
