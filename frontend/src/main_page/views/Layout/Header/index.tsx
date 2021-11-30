import React from 'react';
import { CRM_HOST } from 'main_page/constants';
import { HeaderWrapper, LoginBtn, DwellLogo } from './styles';

const Header = (): JSX.Element => {
  const handleRedirectToLogin = () => window.location.assign(`${CRM_HOST}/login`);

  return (
    <HeaderWrapper>
      <DwellLogo />
      <LoginBtn onClick={handleRedirectToLogin}>LOGIN</LoginBtn>
    </HeaderWrapper>);
};

export default Header;

