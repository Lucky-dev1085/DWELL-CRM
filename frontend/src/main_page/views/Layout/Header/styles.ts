import styled from 'styled-components';
import Logo from 'images/dwell-logo.svg';

export const HeaderWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    @media (max-width: 767px) {
          padding: 0 15px;
          height: 64px;
          width: 100%;
          margin: 0 auto;
          top: 0;
          left: 0;
          //position: fixed;
          //z-index: 1002;
          // background-color: ${props => props.theme.colors.darkcyan};
          //box-shadow: 0 7px 28px #00000029;
    }
`;

export const LoginBtn = styled.button`
      border-width: 2px;
      border-color: #344563;
      border-radius: 6px;
      color: #0b2151;
      font-weight: 600;
      font-size: 13px;
      letter-spacing: .5px;
      text-transform: uppercase;
      min-width: 100px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
    &:focus {
      outline: none;
    }
    &:hover {
      background-color: #0b2151;
      color: #fff;
    }

`;

export const DwellLogo = styled.div`
   background-repeat: no-repeat;
   width: 100px;
   height: 22px;
   background-image: url(${Logo});
`;
