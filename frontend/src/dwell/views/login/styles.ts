import styled from 'styled-components';
import BackgroundDemo from 'images/background-demo.png';

export const LoginWrapper = styled.div`
  width: 100vw;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url(${BackgroundDemo}) repeat center center fixed;
  background-size: 60%;
  padding: 40px 0;
`;

export const LoginBox = styled.div`
  background-color: ${props => props.theme.colors.gray100};
  width: 375px;
  padding: 40px;
  border-radius: 10px;
  box-shadow:   2px 5px 45px rgba(36,55,130,0.12),
  0 1px 2px rgba(225,230,247,0.07),
  0 2px 4px rgba(225,230,247,0.07),
  0 4px 8px rgba(225,230,247,0.07),
  0 8px 16px rgba(225,230,247,0.07),
  0 16px 32px rgba(225,230,247,0.07),
  0 32px 64px rgba(225,230,247,0.07);

  .op-0 {
    opacity: 0;
  }

  .mg-y-10 {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  i {
      font-size: 20px;
      line-height: 1;
      position: absolute;
      bottom: 11px;
      right: 0;
      color: ${props => props.theme.colors.colortx03};
  }

  input:focus{
    outline: none;
  }

   .btn-primary {
        background-color: #0168fa !important;
        height: ${props => props.theme.templates.heightlg} !important;
        justify-content: center;

        :hover {
            background-color: ${props => props.theme.colors.colorui02} !important;
        }
    }

   .is-invalid {
        border-bottom-color: rgba(255,10,10,0.8);
   }

   .input-error {
      display: flex;
      flex-direction: row;
      position: relative;
      i {
        position: relative;
        bottom: 0;
        padding-right: 1rem;
      }
   }

   .error {
      color: rgba(255,10,10,0.8);
   }

`;

export const LoginLogo = styled.a`
  display: flex;
  align-items: flex-end;
  position: relative;
  outline: none;

  &:before {
    content: '';
    display: block;
    width: 4px;
    height: 10px;
    background-color: ${props => props.theme.colors.colorui03};
    border-radius: 1px;
  }

  span {
    width: 4px;
    height: 16px;
    background-color: ${props => props.theme.colors.colorui01};
    display: block;
    margin: 0 3px;
    border-radius: 1px;
  }

  &:after {
    content: '';
    display: block;
    width: 4px;
    height: 22px;
    background-color: ${props => props.theme.colors.colorui02};
    border-radius: 1px;
  }
`;

export const LoginTitle = styled.h4`
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.colortx01};
  letter-spacing: -.5px;
`;

export const LoginText = styled.h6``;

export const FormGroupLogin = styled.div`
    height: 60px;
    position: relative;
    padding-top: 25px;
    margin-bottom: 5px;

    + .form-group { margin-top: 20px; }
`;

export const FormControl = styled.input`
    border-radius: 0;
    border-width: 0;
    border-bottom-width: 1.5px;
    border-bottom-color: rgba(36,55,130,0.1);
    padding: 0 0 8px;
    background-color: transparent;
    height: auto;
    width: 100%;
    font-size: 16px;
    font-weight: ${props => props.theme.fontWeights.medium};
    color: ${props => props.theme.colors.colortx01};

    &:focus {
      box-shadow: none;
    }
`;

export const FormGroupLabel = styled.label`
    margin-bottom: 0;
    position: absolute;
    pointer-events: none;
    top: 25px;
    left: 0;
    color: #4a5e8a;
    font-size: 16px;
    font-weight: 400;
    line-height: 1.5;
    transition: all 0.25s;
    opacity: 0.6;

    ${FormControl}:focus ~ & {
        top: 0px;
        font-weight: 400;
        color: ${props => props.theme.colors.colortx03};
        font-size: ${props => props.theme.fontSizes.sm};
        opacity: 0.6;
    }

    ${FormControl}.focused ~ &, input:-webkit-autofill ~ & {
        top: 0px;
        font-weight: 400;
        color: ${props => props.theme.colors.colortx03};
        font-size: ${props => props.theme.fontSizes.sm};
        opacity: 0.6;
    }

    ${FormControl}.is-invalid ~ &{
        color: rgba(255,10,10,0.8) !important;
    }
`;

export const LinkForgot = styled.a`
    font-size: ${props => props.theme.fontSizes.sm};
    color: #0168fa !important;
    text-decoration: none;
    background-color: transparent;
    cursor: pointer;
`;

export const LoginButton = styled.button``;
