import styled from 'styled-components';
import { Nav, Card, CardBody } from 'reactstrap';
import { hexToRgb } from 'dwell/constants';
import { PrimaryButton, Avatar as CommonAvatar, EmptyContent as CommonEmptyContent } from 'styles/common';

export const CallSourceLabel = styled.strong`
    font-size: ${props => props.theme.fontSizes.base};
    font-weight: ${props => props.theme.fontWeights.medium};
    color: ${props => props.theme.colors.colortx01};
    display: block;
`;

export const ContentHeader = styled.div`
    margin-bottom: 30px;
    display: flex;
    justify-content: space-between;
`;

export const CallStatus = styled.div`
    svg {
        opacity: unset !important;
        width: 18px;
        height: 18px;
        margin-right: 5px;
        ${props => (props.answered ? `
            color: ${props.theme.colors.colorui01};
            fill: rgba(${hexToRgb(props.theme.colors.colorui01)}, .1);
        ` : `
            color: ${props.theme.colors.red};
            fill: rgba(${hexToRgb(props.theme.colors.red)}, .1);
        `)}
    }
`;

export const CallPlay = styled.div`
    margin-right: 5px;
    display: block;
    font-size: 24px;
    color: ${props => props.theme.colors.teal};
    line-height: 1;
    outline: none;
    text-indent: -1.2px;
    cursor: pointer;

    i:first-child { display: block; }
    i:last-child { display: none; }

    ${props => props.active && `
        i:first-child { display: none; }
        i:last-child { display: block; }
    `}
`;

export const CallTime = styled.div`
    font-size: ${props => props.theme.fontSizes.sm};
    font-family: ${props => props.theme.fonts.numeric};
    color: ${props => props.theme.colors.colortx03};
`;

export const CallTranscriptionToggle = styled.div`
    font-size: 16px;
    color: ${props => props.theme.colors.colortx03};
    margin-left: 8px;
    outline: none;
    line-height: 1;
    cursor: pointer;

    &:hover, &:focus {
        color: ${props => props.theme.colors.colortx02};
    }

    ${props => props.active && `color: ${props.theme.colors.colorui01};`}
`;

export const RecordingNotExist = styled.div`
    svg {
        opacity: unset !important;
        width: 21px;
        height: 21px;
        color: ${props => props.theme.colors.colortx03};
        fill: none;
        margin-right: 5px;
    }
`;

export const MoreActionNav = styled(Nav)`
    justify-content: flex-end;

    a {
        border-radius: 3px;
        color: ${props => props.theme.colors.colortx03} !important;
        line-height: 1;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        outline: none;
        cursor: pointer;

        &:hover, &:focus {
            background-color: ${props => props.theme.colors.colorbg01};
            color: ${props => props.theme.colors.colortx02};
        }
    }
`;

export const CallTransWrapper = styled.div`
    border: 1px solid ${props => props.theme.colors.colorui01};
`;

export const CallTransCard = styled(Card)`
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-top-width: 0;
    text-align: left;
    box-shadow: none;
    position: relative;
    margin-top: -4px;
    margin-bottom: 0;
    width: ${p => (p.isCallScoring ? '50%' : '100%')};

    .card-header {
        padding: 15px 20px;
        background-color: transparent;
        border-top: 1px solid ${props => props.theme.colors.colorbg01};
        border-bottom-color: ${props => props.theme.colors.colorbg01};
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 70px;

        .card-title {
            color: ${props => props.theme.colors.colortx01};
            margin-bottom: 0;
            font-size: .875rem;
            font-weight: 500;
            line-height: 1.2;
        }
    }
    .list-group-item {
        background-color: transparent;
        padding-left: 20px;
        border-radius: 0;
        border-width: 0;
        display: flex;
        align-items: center;

        .list-item-name {
            padding-left: 15px;
        }
    }
    .list-item-time {
        display: flex;
        align-items: center;
        padding-left: 15px;
    }
    .public-DraftEditor-content {
        padding: 0 !important;
    }
    .avatar {
        width: 32px;
        height: 32px;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 100%;
        position: relative;
        span {
            font-size: 14px;
            display: block;
            text-transform: uppercase;
        }
    }
`;

export const Avatar = styled(CommonAvatar)`
    border-radius: 5px;
    background-color: ${props => props.theme.colors.colorbg01};
    color: ${props => props.theme.colors.colortx03};

    i {
        font-size: 24px;
        opacity: .5;
    }
`;

export const ArchivePrimaryBtn = styled(PrimaryButton)`
    border-width: 0;
    flex-shrink: 0;
    padding-left: 18px;
    padding-right: 18px;
    font-weight: 500;
    letter-spacing: -0.2px;
    text-transform: capitalize;
    color: rgba(255,255,255,0.85);
    height: 38px;
`;

export const ArchiveIcon = styled.i`
    margin-left: -5px;
    margin-right: 5px;
`;

export const EmptyContent = styled(CommonEmptyContent)`
  height: calc(100vh - 450px);
`;

export const PrevScore = styled.p`
  margin-top: 3px;
  margin-bottom: 0px;
  font-size: 12px;
`;

export const RescoreReason = styled.div`
  width: 100px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const CallTranscriptionContainer = styled.div`
  .public-DraftEditor-content {
    max-height: 1000px !important;
  }
`;

export const CallScoringCardBody = styled(CardBody)`
  height: 1000px !important;
  overflow: auto;
`;
