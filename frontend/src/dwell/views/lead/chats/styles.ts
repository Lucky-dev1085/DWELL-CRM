import styled, { css } from 'styled-components';

export const Container = styled.div`
    position: relative;
    min-height: calc(100vh - 260px);
`;

export const ContactBar = styled.div`
    width: 320px;
    border-right: 1px solid ${props => props.theme.colors.colorbg02};
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 320px;
`;

export const ContactBarHeader = styled.div`
    height: ${props => props.theme.templates.headerHeight};
    padding: 0 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid ${props => props.theme.colors.colorbg02};

    div {
      color: ${props => props.theme.colors.colortx01};
      font-weight: ${props => props.theme.fontWeights.semibold};
      font-size: ${props => props.theme.fontSizes.md};
      margin-bottom: 0;
      display: flex;
      align-items: center;

      span {
        margin-left: 8px;
        padding: 0 5px;
        font-weight: 400;
        font-size: 11px;
        color: ${props => props.theme.colors.colortx03};
        min-width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background-color: ${props => props.theme.colors.colorbg01};
      }
    }
`;

export const ContactBarBody = styled.div`
    height: calc(100% - ${props => props.theme.templates.headerHeight});
    overflow-y: auto;
    background-color: rgba(247,248,252,0.6);
`;

export const TimeWrapper = styled.div`
  small:nth-child(2) {
    display: none;
  }
  margin-top: -2px;
`;

export const ChatContactItem = styled.div`
    display: flex;
    padding: 12px 15px;
    border-bottom: 1px solid ${props => props.theme.colors.colorbg01};

    &:hover {
      cursor: pointer;

      ${TimeWrapper} {
        margin-top: 0;
        small:nth-child(1) {
            display: none;
        }

        small:nth-child(2) {
            display: block;
        }
    }
    }

    &.active {
      background-color: #fff;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: -1px;
        right: 0;
        bottom: -1px;
        border-right: 1.5px solid ${props => props.theme.colors.colorui01};
      }
    }
`;

export const ChatContactIcon = styled.div`
    flex-shrink: 0;
    width: ${props => props.theme.templates.heightBase};
    height: ${props => props.theme.templates.heightBase};
    font-size: 13px;
    text-transform: uppercase;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100%;

    i {
      font-size: 21px;
      line-height: 0;
    }
`;

export const ChatContactBody = styled.div`
    flex: 1;
    padding-left: 12px;
`;

export const ChatContactName = styled.h6`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.colortx01};
    margin-bottom: 5px;

    small {
      color: ${props => props.theme.colors.colortx03};
      font-size: 11px;
    }
`;

export const ChatShortText = styled.p`
    font-size: ${props => props.theme.fontSizes.xs};
    color: ${props => props.theme.colors.colortx03};
    margin-bottom: 0;
`;

export const Conversation = styled.div`
    position: absolute;
    top: 0;
    left: 320px;
    right: 0;
    bottom: 0;
`;

export const ConversationHeader = styled.div`
    height: 96px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid ${props => props.theme.colors.colorbg02};

    div.contact-name {
        font-size: 18px;
        margin-bottom: 0;
        margin-left: 10px;
        font-weight: 500;
        display: flex;
        flex-direction: column;

        small {
            font-size: 12px;
            color: 1px solid ${props => props.theme.colors.colortx03};
        }
    }
    > span {
        margin-left: auto;
        font-size: ${props => props.theme.fontSizes.sm};
        color:  ${props => props.theme.colors.colortx02};
    }

    .chat-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        @media (max-width: 1300px) {
            width: 20vw;
        }
        @media (max-width: 1500px) {
            width: 25vw;
        }
        @media (min-width: 1501px) {
            width: 30vw;
        }
    }
`;

export const ConversationBody = styled.div`
    position: relative;
    padding: 10px;
    height: calc(100% - ${props => props.theme.templates.headerHeight});
    overflow-y: auto;
`;

export const ConversationItem = styled.div`
    display: flex;
    flex-direction: ${props => (props.reversed ? 'row' : 'row-reverse')};
    padding: 10px;


    ${props => props.agentJoined && css`
        justify-content: center;
    `};
`;

export const ConversationAvatar = styled.div`
    min-width: ${props => props.theme.templates.heightBase};
    width: ${props => props.theme.templates.heightBase};
    height: ${props => props.theme.templates.heightBase};
    border-radius: 100%;
    background-color: ${props => (props.reversed ? props.theme.colors.colorui01 : props.theme.colors.colortx01)};
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;

    i {
        font-size: 18px;
        line-height: 1;
    }
`;

export const ConversationItemBody = styled.div`
    padding-right: ${props => (props.reversed ? '0px' : '15px')};
    padding-left: ${props => (props.reversed ? '15px' : '0px')};
`;

export const ConversationItemBox = styled.div`
    border-radius: 4px;
    padding: 8px 15px;
    background-color: ${props => (props.reversed ? props.theme.colors.gray300 : props.theme.colors.colorui01)};
    ${props => props.isBot && css`background-color: #73818f;`}
    color: ${props => (props.reversed ? props.theme.colors.colortx02 : props.theme.colors.white)};

    i {
        font-size: 16px;
    }
`;

export const ConversationItemDate = styled.div`
    color: ${props => props.theme.colors.colortx03};
    font-size: ${props => props.theme.fontSizes.xs};
    margin-top: 5px;

    strong {
        font-weight: ${props => props.theme.fontWeights.medium};
        color: ${props => props.theme.colors.colortx01};
        padding-right: 5px;
    }
`;

export const AvatarImg = styled.img`
    min-width: 38px;
    width: 38px;
    height: 38px;
    border-radius: 50%;
`;

