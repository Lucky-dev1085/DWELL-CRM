import styled, { css } from 'styled-components';
import { FlexCenter } from 'styles/common';

export const UserAccount = styled.div`
  margin-left: 20px;
  cursor: pointer;
`;

export const UserAvatarShared = css`
    ${FlexCenter}
    width: ${props => props.theme.templates.heightsm};
    height: ${props => props.theme.templates.heightsm};
    border-radius: 100%;
    background-color: ${props => props.theme.colors.colorui02};
    color: #fff;
    font-size: 16px;
`;

export const UserAvatar = styled.img`
    ${UserAvatarShared}
`;

export const UserAvatarEmpty = styled.div`
    ${UserAvatarShared}
`;

export const UserSettingsHeader = styled.div`
    padding: 10px 0 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const UserSettingsAvatar = styled(UserAvatar)`
    width: 72px;
    height: 72px;
`;

export const UserSettingsAvatarEmpty = styled(UserAvatarEmpty)`
    width: 72px;
    height: 72px;
    font-size: 32px;
    font-weight: 300;
    margin-bottom: 15px;
`;

export const UserSettingsName = styled.h6`
    margin-bottom: 5px;
    font-size: ${props => props.theme.fontSizes.md};
    font-weight: ${props => props.theme.fontWeights.medium};
`;

export const UserSettingsEmail = styled.small`
    font-size: 12px;
    color: ${props => props.theme.colors.gray500};
`;

export const AccountSwitchButton = styled.button`
    margin-top: 15px;
    letter-spacing: 1.5px;
    font-weight: 400;
    font-size: 11px;
    text-transform: uppercase;
    align-self: stretch;
    ${FlexCenter}
    padding: 9px 0;
    background-color: ${props => props.theme.colors.colorui01};
    background-repeat: repeat-x;
    color: #fff;
    border-radius: 4px;
    border: none;
    &:focus {
        outline: none;
    }
`;

export const UserSettingsItem = styled.div`
    outline: none;
    padding: 8px;
    color: ${props => props.theme.colors.colortx02};
    display: flex;
    align-items: center;
    border-radius: 4px;
    width: 100%;
    clear: both;
    font-weight: 400;
    text-align: inherit;
    white-space: nowrap;
    background-color: transparent;
    border: 0;

    &:hover {
        background-color: ${props => props.theme.colors.colorbg01};
        color: ${props => props.theme.colors.colortx01};
    }
    cursor: pointer;
`;

export const UserSettingsIcon = styled.i`
    font-size: 21px;
    margin-right: 15px;
    line-height: .7;
    width: 18px;
`;

export const UserAvailableSwitchWrapper = styled.div`
    display: flex;
    align-items: center;
    font-size: 10px;
    font-weight: ${props => props.theme.fontWeights.medium};
    letter-spacing: .5px;
    text-transform: uppercase;
    color: ${props => props.theme.colors.gray500};
    padding-top: 20px;
    padding-bottom: 10px;
`;

export const UserAvailableSwitch = styled.div`
    margin-left: 10px;
    margin-bottom: 0;
    width: 30px;
    height: 14px;
    background-color: ${props => (props.available ? props.theme.colors.green : props.theme.colors.gray400)};
    border-radius: 10px;
    position: relative;
    transition: background-color 0.25s;
    cursor: pointer;
    &:before {
      content: '';
      width: 10px;
      height: 10px;
      background-color: #fff;
      border-radius: 100%;
      position: absolute;
      top: 2px;
      left: ${props => (props.available ? '18px' : '2px')};
      transition: left 0.25s;
    }
`;

export const DropdownMenuStyles = {
  color: '#344563',
  border: 'none',
  borderRadius: '8px',
  boxShadow: '2px 5px 45px rgba(36,55,130,0.12), ' +
  '0 1px 2px rgba(225,230,247,0.07), ' +
  '0 2px 4px rgba(225,230,247,0.07), ' +
  '0 4px 8px rgba(225,230,247,0.07), ' +
  '0 8px 16px rgba(225,230,247,0.07), ' +
  '0 16px 32px rgba(225,230,247,0.07), ' +
  '0 32px 64px rgba(225,230,247,0.07)',
};

export const accountDropdownMenuStyles = {
  ...DropdownMenuStyles,
  width: '240px',
  minHeight: '200px',
  borderWidth: '0',
  padding: '15px',
  maxHeight: '500px',
  top: '-30px',
  left: '-36px',
  zIndex: 1020,
};

export const Divider = styled.div`
    height: 0;
    margin: .5rem 0;
    overflow: hidden;
    border-top: 1px solid #e9eaf0;
`;
