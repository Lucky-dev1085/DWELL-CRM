import React, { FC, useState } from 'react';
import connect from 'react-redux/es/connect/connect';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { paths } from 'dwell/constants';
import actions from 'dwell/actions';
import { DetailResponse } from 'src/interfaces';
import {
  FormGroupLabel,
  FormControl,
  LinkForgot,
  FormGroupLogin,
} from 'dwell/views/login/styles';
import { ResetPasswordText, ResetPasswordTitle } from 'dwell/views/reset_password/styles';

interface LoginProps extends RouteComponentProps{
  resetPassword: ({ password, token: string }) => Promise<DetailResponse>,
  resetChangePasswordState: () => void,
  isTokenInvalid: boolean,
  isSubmitting: boolean,
}

const ChangePassword: FC<LoginProps> = ({ resetPassword, history: { location: { pathname }, push }, resetChangePasswordState, isTokenInvalid }) => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
      if (password === passwordConfirm) {
        resetPassword({ password: password.trim(), token: pathname.split('/').pop() }).then(() => setIsPasswordReset(true));
      } else {
        setError('Password and Confirm password do not match');
      }
    }
  };

  const handleInputChange = ({ target: { id, value } }) => {
    if (error) {
      setError('');
    }
    if (isTokenInvalid) {
      resetChangePasswordState();
    }
    if (id === 'password') {
      setPassword(value);
    }
    if (id === 'password-confirm') {
      setPasswordConfirm(value);
    }
  };

  const getResetPasswordText = () => {
    if (isTokenInvalid) {
      return 'Provided reset link is not valid, please try resent new link.';
    }
    return error || 'Please, change your password';
  };

  const content = (
    <>
      <ResetPasswordTitle>Password Reset</ResetPasswordTitle>
      <ResetPasswordText className={error || isTokenInvalid ? 'error' : ''}> {getResetPasswordText()}</ResetPasswordText>
      <hr className="op-0 mg-y-10" />
      <form onSubmit={handleSubmit}>
        <FormGroupLogin className="form-group">
          <FormControl
            type="password"
            id="password"
            className={[password ? 'focused' : '', error ? 'is-invalid' : '']}
            value={password}
            onChange={handleInputChange}
          />
          <FormGroupLabel>Enter password</FormGroupLabel>
          <i className="ri-door-lock-line" />
        </FormGroupLogin>

        <FormGroupLogin className="form-group">
          <FormControl
            type="password"
            id="password-confirm"
            className={[passwordConfirm ? 'focused' : '', error ? 'is-invalid' : '']}
            value={passwordConfirm}
            onChange={handleInputChange}
          />
          <FormGroupLabel>Confirm password</FormGroupLabel>
          <i className="ri-door-lock-fill" />
        </FormGroupLogin>

        <div className="text-right"><LinkForgot onClick={() => push(paths.client.LOGIN)}>Back to login</LinkForgot></div>

        <hr className="op-0" />

        <button className="btn btn-primary btn-block btn-login" >Change password</button>
      </form>
    </>
  );

  const passwordChangingContent = (
    <>
      <ResetPasswordTitle>Password Reset</ResetPasswordTitle>
      <ResetPasswordText >Congratulations!</ResetPasswordText>
      <ResetPasswordText >Your password has been changed successfully!</ResetPasswordText>
      <div className="text-right"><LinkForgot onClick={() => push(paths.client.LOGIN)}>Back to login</LinkForgot></div>
    </>
  );

  return (
    <>
      {isPasswordReset ? passwordChangingContent : content}
    </>
  );
};

const mapStateToProps = state => ({
  isTokenInvalid: state.resetPassword.isTokenInvalid,
});

export default connect(
  mapStateToProps,
  { ...actions.resetPassword,
  },
)(withRouter(ChangePassword));
