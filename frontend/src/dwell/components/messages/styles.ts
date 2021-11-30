import styled from 'styled-components';
import { FlexCenter } from 'styles/common';

export const MessageIcon = styled.div`
    position: relative;
    font-size: 20px;
    color: ${props => props.theme.colors.colortx01};
    outline: none;
    text-decoration: none;
    cursor: pointer;
    margin-top: 5px;
    display: block;

    &:after {
      content: '';
      position: absolute;
      top: 5px;
      right: 0;
      width: 7px;
      height: 7px;
      border-radius: 100%;
      background-color: ${props => (props.unread ? '#dc3545' : 'transparent')};
      box-shadow: ${props => (props.unread ? '0 0 0 2px #f7f8fc' : 'none')};
    }
`;

export const DropdownMenuStyles = {
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

export const notifDropdownMenuStyles = {
  ...DropdownMenuStyles,
  overflowY: 'hidden',
  maxHeight: 'none',
  width: '320px',
  marginTop: '11px',
  left: '10px',
  paddingTop: '.5rem',
  zIndex: 1020,
};

export const MessagesDropdownHeader = styled.div`
  padding: 7px 0 15px;
  margin-left: 20px;
  margin-right: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const MessagesDropdownTitle = styled.h6`
  margin-bottom: 0;
  font-weight: 600;
  font-size: 15px;
  color: ${props => props.theme.colors.colortx01};
`;

export const MessagesDropdownActions = styled.div`
  margin: 0 20px;
  border-top: 1px solid ${props => props.theme.colors.colorbg01};
  padding: 10px 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const LinkButton = styled.span`
  text-decoration: none;
  background-color: transparent;
  color: ${props => props.theme.colors.colorui01};
  font-size: 13px;
  cursor: pointer;

  &:hover {
    color: ${props => props.theme.colors.colorui02};
    box-shadow: none;
  }
`;

export const MessageList = styled.div`
    max-height: 500px;
    overflow-y: auto;
`;

export const MessageWrapper = styled.div`
  outline: none;
  border-width: 0;
  padding: 10px 20px;
  border-radius: 0;
  display: flex;
  position: relative;
  background-color: #fff;

  &:hover {
    background-color: ${props => props.theme.colors.bodyBg};
  }
`;

export const MessagesEmpty = styled.div`
    background: white;
    ${FlexCenter}
    font-size: 14px;
    min-height: 150px;
    color: ${props => props.theme.colors.gray800};
`;
