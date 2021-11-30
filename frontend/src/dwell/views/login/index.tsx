import React, { FC, useState } from 'react';
import connect from 'react-redux/es/connect/connect';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { IS_BEEN_LOGGED, RECENT_PROPERTY_HYPHENS, paths } from 'dwell/constants';
import actions from 'dwell/actions';
import { DetailResponse } from 'src/interfaces';
import {
  LoginWrapper,
  LoginBox,
  LoginLogo,
  LoginTitle,
  LoginText,
  FormGroupLogin,
  FormGroupLabel,
  FormControl,
  LinkForgot,
} from './styles';

interface LoginProps extends RouteComponentProps{
  login: ({ email, password, last_login_property }) => Promise<DetailResponse>,
  resetLoginState: () => void,
  isFormInvalid: boolean,
  isSubmitting: boolean,
}

interface LoginResponseProps {
  last_login_property: { name: string, platform: string },
  id: number,
}

const Login: FC<LoginProps> = ({ login, history: { push }, resetLoginState, isFormInvalid, isSubmitting }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState({ email: false, password: false });

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    localStorage.removeItem('site-id');

    login({ email: email.trim(), password: password.trim(), last_login_property: localStorage.getItem(RECENT_PROPERTY_HYPHENS) })
      .then((response) => {
        if (response) {
          const { result: { data } } = response;
          const { last_login_property: { name, platform } } = data as LoginResponseProps;
          localStorage.setItem(IS_BEEN_LOGGED, 'true');
          localStorage.setItem(RECENT_PROPERTY_HYPHENS, name);
          if (platform === 'SITE') {
            push(`/${name}/users`);
          } else {
            push(`/${name}/leads`);
          }
        }
      });
  };

  const handleInputChange = ({ target: { id, value } }) => {
    setFocused({ ...focused, [id]: true });
    if (isFormInvalid) {
      resetLoginState();
    }
    if (id === 'password') {
      setPassword(value);
    }
    if (id === 'email') {
      setEmail(value);
    }
  };

  const handleFocusChange = ({ target: { id, value } }, isFocused) => {
    setFocused({ ...focused, [id]: isFocused || value });
  };

  const enterKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSubmit(event);
    }
  };

  const getLogInText = () => {
    if (isFormInvalid) {
      return 'Email or password are invalid';
    }
    return `${localStorage.getItem(IS_BEEN_LOGGED) ? 'Welcome back! ' : ''}Please sign in to continue`;
  };

  return (
    <LoginWrapper>
      <LoginBox>
        <LoginLogo><span /></LoginLogo>
        <hr className="op-0" />
        <LoginTitle>Sign in</LoginTitle>
        <LoginText className={isFormInvalid ? 'error' : ''}>{getLogInText()}</LoginText>
        <hr className="op-0 mg-y-10" />
        <form onSubmit={handleSubmit}>
          <FormGroupLogin className="form-group">
            <FormControl
              type="text"
              id="email"
              className={[focused.email ? 'focused' : 'form-group', isFormInvalid ? 'is-invalid' : '']}
              value={email}
              onChange={handleInputChange}
              onBlur={e => handleFocusChange(e, false)}
              onFocus={e => handleFocusChange(e, true)}
            />
            <FormGroupLabel>Enter email address</FormGroupLabel>
            <i className="ri-account-circle-line" />
          </FormGroupLogin>
          <FormGroupLogin className="form-group">
            <FormControl
              type="password"
              id="password"
              className={[focused.password ? 'focused' : 'form-group', isFormInvalid ? 'is-invalid' : '']}
              value={password}
              onChange={handleInputChange}
              onKeyPress={enterKeyPress}
              onBlur={e => handleFocusChange(e, false)}
              onFocus={e => handleFocusChange(e, true)}
            />
            <FormGroupLabel>Enter password</FormGroupLabel>
            <i className="ri-door-lock-line" />
          </FormGroupLogin>
          <div className="text-right"><LinkForgot onClick={() => push(paths.client.SEND_PASSWORD_RESET_EMAIL)}>Forgot password?</LinkForgot></div>
          <hr className="op-0" />
          <button className="btn btn-primary btn-block btn-login" disabled={isSubmitting}>Login</button>
        </form>
      </LoginBox>
    </LoginWrapper>
  );
};

const mapStateToProps = state => ({
  isSubmitting: state.authentication.isSubmitting,
  isFormInvalid: state.authentication.isFormInvalid,
});

export default connect(
  mapStateToProps,
  { ...actions.authentication,
  },
)(withRouter(Login));
