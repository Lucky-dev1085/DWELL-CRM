import React, { FC } from 'react';
import connect from 'react-redux/es/connect/connect';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import actions from 'dwell/actions';
import ChangePassword from './_changePassword';
import SendResetPasswordEmail from './_resetEmail';
import {
  ResetPasswordBox,
  ResetPasswordWrapper,
  ResetPasswordLogo,
} from './styles';

const ResetPassword: FC<RouteComponentProps> = ({ location: { pathname } }) => (
  <ResetPasswordWrapper >
    <ResetPasswordBox>
      <ResetPasswordLogo><span /></ResetPasswordLogo>
      <hr className="op-0" />
      {pathname.split('/').pop() === 'password-reset-email' ? <SendResetPasswordEmail /> : <ChangePassword /> }
    </ResetPasswordBox>
  </ResetPasswordWrapper>
);

export default connect(
  null,
  { ...actions.resetPassword,
  },
)(withRouter(ResetPassword));
