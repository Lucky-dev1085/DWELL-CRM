import styled from 'styled-components';
import { CardBody } from 'reactstrap';

export const EmailSyncHeader = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    .connect-action {
        padding-bottom: 10px;
    }

    .btn-outline-primary {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      background-color: #fff;
      font-weight: 500;
      border: 2px solid ${props => props.theme.colors.colorui01};
      color: ${props => props.theme.colors.colorui01};

      :hover {
         border: 2px solid ${props => props.theme.colors.colorui01};
         background-color: ${props => props.theme.colors.colorui01};
         color: #fff;
      }
      i {
        padding-right: 5px;
      }
    }

`;

export const EmailMedia = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 20px;
`;

export const EmailMediaIcon = styled.div`
    width: 60px;
    height: 60px;
    background-color: #f7f8fc;
    border: 2px solid #e9eaf0;
    margin-right: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    border-radius: 4px;
    color: #dfe1e8;
`;

export const EmailMediaBody = styled.div`

    .description.connected, .description.syncing {
        color: #24ba7b ;
    }

    .description.disconnected {
        color: #FDA600;
    }

    span {
        display: flex;
        align-items: center;
        font-size: 12px;

        svg {
            padding-right: 3px;
            font-size: 13px;
        }
    }

`;

export const SyncEmailCalendar = styled.div``;

export const TextMuted = styled.small`
    font-size: 11px;
    display: block;
    margin-bottom: 2px;
    color: #657697 !important;
`;

export const CardSync = styled(CardBody)`
    padding: 0;

    .custom-control-label {
        font-size: .875rem;
        font-weight: 400;
        line-height: 1.5;
        color: #344563;
        text-align: left;
    }
`;

export const SyncTitle = styled.label`
    font-size: 11px;
    font-weight: 500;
    color: #657697;
    margin-bottom: 10px;
    line-height: 1;
    letter-spacing: .5px;
    text-transform: uppercase;
`;
