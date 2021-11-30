import React, { FC, useState } from 'react';
import connect from 'react-redux/es/connect/connect';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { paths } from 'dwell/constants';
import actions from 'dwell/actions';
import {
  FormGroupLabel,
  FormControl,
  LinkForgot,
  FormGroupLogin,
} from 'dwell/views/login/styles';
import { ResetPasswordInfo, ResetPasswordTitle } from 'dwell/views/reset_password/styles';

interface ResponseProps {
  result: {
    data: {
      status: string;
    }
  }
}

interface LoginProps extends RouteComponentProps {
  sendResetPasswordEmail: ({ email: string }) => Promise<ResponseProps>,
  resetChangePasswordState: () => void,
  isFormInvalid: boolean,
  isSubmitting: boolean,
}

const SendResetPasswordEmail: FC<LoginProps> = ({ sendResetPasswordEmail, history: { push }, resetChangePasswordState, isFormInvalid }) => {
  const [email, setEmail] = useState('');
  const [isEmailSending, setEmailSending] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    sendResetPasswordEmail({ email: email.trim() }).then(() => {
      setEmailSending(true);
    });
  };

  const handleInputChange = ({ target: { id, value } }) => {
    setFocused(true);
    if (isFormInvalid) {
      resetChangePasswordState();
    }
    if (id === 'email') {
      setEmail(value);
    }
  };

  const handleFocusChange = ({ target: { value } }, isFocused) => {
    setFocused(isFocused || value);
  };

  const content = (
    <>
      <ResetPasswordInfo className={isFormInvalid ? 'error' : ''} >
        {isFormInvalid ? 'You provided an invalid email, please change the email to correct.'
          : 'Enter your email address and a password reset link will be sent to your inbox'}
      </ResetPasswordInfo>
      <hr className="op-0 mg-y-10" />
      <form onSubmit={handleSubmit}>
        <FormGroupLogin className="form-group">
          <FormControl
            type="text"
            id="email"
            className={[focused ? 'focused' : '', isFormInvalid ? 'is-invalid' : '']}
            value={email}
            onChange={handleInputChange}
            onBlur={e => handleFocusChange(e, false)}
            onFocus={e => handleFocusChange(e, true)}
          />
          <FormGroupLabel>Enter email address</FormGroupLabel>
        </FormGroupLogin>

        <div className="text-right"><LinkForgot onClick={() => push(paths.client.LOGIN)}>Back to login</LinkForgot></div>

        <hr className="op-0" />

        <button className="btn btn-primary btn-block btn-login">Reset Password</button>
      </form>
    </>
  );

  const emailSendingContent = (
    <>
      <ResetPasswordInfo >Check your email for a link to reset your password. If it doesn’t appear within a few minutes, check your spam folder.</ResetPasswordInfo>
      <div className="text-right"><LinkForgot onClick={() => push(paths.client.LOGIN)}>Back to login</LinkForgot></div>
    </>
  );

  return (
    <>
      <ResetPasswordTitle>Forgot password</ResetPasswordTitle>
      {isEmailSending ? emailSendingContent : content}
    </>
  );
};

const mapStateToProps = state => ({
  isFormInvalid: state.resetPassword.isFormInvalid,
});

export default connect(
  mapStateToProps,
  {
    ...actions.resetPassword,
  },
)(withRouter(SendResetPasswordEmail));
