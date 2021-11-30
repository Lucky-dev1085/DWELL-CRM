import { ModalWindow as Modal } from 'site/components/common';
import styled, { css } from 'styled-components';
import PerfectScrollbar from 'react-perfect-scrollbar';

export const ModalWindow = styled(Modal)`
  max-width: 400px;

  .modal-title {
    font-size: 20px !important;
  }

  .modal-header {
    padding: 20px 30px 25px 30px;
  }
`;

export const ModalSubtitle = styled.p`
  color: ${props => props.theme.colors.gray600};
  margin-bottom: 0;
  margin-top: -21px;
`;

export const Media = styled.div`
  display: flex;
  padding: 10px 15px;
  align-items: center;
  border-radius: 6px;
  transition: all 0.2s;
  background-color: rgba(233,234,240,0.6);

  ${props => props.active && css`
    background-color: ${props.theme.colors.colorlight01};
    box-shadow: 0 0 0 1.5px ${props.theme.colors.colorui01};
  `}

  ${props => props.isSwitch && css`
    &:hover {
      cursor: pointer;
      background-color: ${props.theme.colors.gray100};
      box-shadow: 0 0 0 1.5px ${props.theme.colors.colorui01};
    }
  `}

  ${props => props.isClick && css`
    cursor: pointer;
  `}

  & + & {
    margin-top: 10px;
  }
`;

export const MediaBody = styled.div`
  flex: 1;
  padding-left: 15px;

  h6 {
    font-weight: 500;
    margin-bottom: 3px;
    color: ${props => props.theme.colors.gray800};
  }

  p {
    font-size: 13px;
    margin-bottom: 0;
    color: ${props => props.theme.colors.gray600};
  }

  i {
    font-size: 13px;
    color: ${props => props.theme.colors.gray600};
    opacity: .5;
  }
`;

export const Avatar = styled.div`
  width: 48px;
  height: 48px;
  background-color: ${props => props.theme.colors.colortx03};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  position: relative;
  font-size: 20px;
  text-transform: uppercase;

  img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }
`;

export const SelectedUser = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
`;

export const UserName = styled.div`
  font-size: 14px;
  color: #23282c;
  font-weight: 600;
`;

export const UserEmail = styled.div`
  font-size: 14px;
  opacity: 0.5;
`;

export const PasswordContainer = styled.div`
  .form-group { margin-bottom: 10px; }
  .form-control {
    height: 40px;
    border-color: #d9def0 !important;
  }

  .btn {
    height: 40px;
    border-radius: 5px;
  }

  .btn-white: hover {
    border-color: #c1c8de;
  }
`;

export const LinkForgot = styled.a`
    font-size: ${props => props.theme.fontSizes.sm};
    color: #0168fa !important;
    text-decoration: none;
    background-color: transparent;
    cursor: pointer;

    &:hover {
      color: #0148ae !important;
    }
`;

export const ContentLabel = styled.label`
  letter-spacing: .5px;
  text-transform: uppercase;
  font-weight: 500 !important;
  font-size: 10px;
  color: #a0a9bd !important;
  margin-bottom: 12px;
  line-height: 1;
  margin-bottom: 6px;
`;

export const AvailableAccounts = styled(PerfectScrollbar)`
  max-height: 385px;
  margin-left: -9px;
  margin-right: -9px;
  padding: 9px;

  .ps__thumb-y {
    width: 2px;
  }

  .ps__rail-y {
    width: 4px;
    &:hover {
      .ps__thumb-y {
        width: 4px;
      }
    }
  }
`;

export const EmptyList = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 120px;

  p {
    width: 200px;
    text-align: center;
    margin-bottom: 0;
  }
`;
