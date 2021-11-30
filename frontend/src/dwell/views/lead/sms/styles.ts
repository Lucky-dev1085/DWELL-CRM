import styled, { css } from 'styled-components';

export const Scroll = css`
  overflow: hidden;
  overflow-y: auto;

  &:hover {
    &::-webkit-scrollbar-thumb {
      background-color: ${props => props.theme.colors.colorbg03};
    }
  }

  &::-webkit-scrollbar {
    width: 2px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: transparent;
  }
`;

export const SideBarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 10px 12px;
  border-bottom: 1px solid ${props => props.theme.colors.colorbd02};
`;

export const HeaderLabel = styled.label`
  margin-bottom: 0;
  font-weight: 600;
  font-size: 15px;
  color: ${props => props.theme.colors.colortx01};
  display: flex;
  align-items: center;
  line-height: 1;

  span {
    color: ${props => props.theme.colors.colortx03};
    font-weight: 400;
    font-size: 11px;
    width: 20px;
    height: 20px;
    background-color: ${props => props.theme.colors.colorbg01};
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100%;
    margin-left: 5px;
  }
`;

export const SideBarContent = styled.div`
  height: calc(100% - 64px);
  position: relative;

  ${Scroll}
  &::-webkit-scrollbar {
    width: 1px;
  }
`;

export const TimeWrapper = styled.div`
  margin-top: -1px;
  small:nth-child(2) {
    display: none;
  }
`;

export const ChatItem = styled.div`
  display: flex;
  padding: 12px 15px;
  border-bottom: 1px solid ${props => props.theme.colors.colorbg01};
  position: relative;
  cursor: pointer;

  ${props => props.selected && `
    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      border-left: 1.5px solid ${props.theme.colors.colorui01};
    }
  `}

  &:hover {
    ${TimeWrapper} {
      small:nth-child(1) {
        display: none;
      }

      small:nth-child(2) {
        display: block;
      }
    }
  }
`;

export const ChatAvatar = styled.div`
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  font-size: ${props => (props.lg ? 14 : 13)}px;
  text-transform: uppercase;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  background-color: ${props => props.theme.colors.colorbg03};

  ${props => props.color && `
    background-color: ${props.color};
  `}
`;

export const ChatItemBody = styled.div`
  flex: 1;
  padding-left: 12px;
`;

export const ChatBodyHeader = styled.div`
  margin-bottom: 3px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h6 {
    font-size: 13px;
    color: ${props => props.theme.colors.colortx01};
    margin-bottom: 5px;
  }

  small {
    font-size: 11px;
    color: ${props => props.theme.colors.colortx03};
  }
`;

export const ChatText = styled.p`
  font-size: 12px;
  color: ${props => props.theme.colors.colortx03};
  margin-bottom: 0;
`;

export const SmsContentContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 320px;
  right: 0;
  padding: 0;

  ${Scroll}
`;

export const MessageHeader = styled.div`
  height: 64px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.colors.colorbg02};

  h5 {
    font-size: 18px;
    margin-bottom: 0;
    margin-left: 10px;
  }

  span {
    margin-left: auto;
    font-size: 13px;
    color: ${props => props.theme.colors.colortx02};
  }
`;

export const MessageBody = styled.div`
  position: relative;
  padding: 10px;
  height: calc(100% - 64px);

  ${Scroll}
`;

export const MessageItem = styled.div`
  display: flex;
  flex-direction: ${props => (props.reverse ? 'row-reverse' : 'row')};
  padding: 10px;
`;

export const MessageItemBody = styled.div`
  padding-left: 15px;
  padding-right: 0;
  ${props => props.reverse && `
    padding-right: 15px;
  `}
`;

export const MessageBox = styled.div`
  border-radius: 4px;
  padding: 8px 15px;
  background-color: ${props => props.theme.colors.gray300};
  color: ${props => props.theme.colors.colortx02};
  ${props => props.reverse && `
    background-color: ${props.theme.colors.green};
    color: #fff;
  `}
`;

export const MessageDate = styled.div`
  color: ${props => props.theme.colors.colortx03};
  font-size: 12px;
  margin-top: 5px;

  strong {
    font-weight: 500;
    color: ${props => props.theme.colors.colortx01};
    padding-right: 5px;
  }
`;
