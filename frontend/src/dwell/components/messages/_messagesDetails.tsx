import React, { FC } from 'react';
import TimeAgo from 'react-timeago';
import moment from 'moment';
import styled from 'styled-components';
import cn from 'classnames';
import { getAvatarColor, getInitials } from 'dwell/views/chat/common/utils';
import { Prospect } from 'src/interfaces';

const Message = styled.div`
  display: flex;
  cursor: pointer;
  width: 100%;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 20px;
    right: 20px;
    border-top: 1px solid #f0f2f9;
  }
`;

const MessageBody = styled.div`
  margin-left: 12px;
  flex: 1;
  overflow: hidden;
`;

const MessageTime = styled.span`
  font-size: 11px;
  font-weight: 400;
  font-family: "Helvetica Neue",Arial,sans-serif;
  color: ${props => props.theme.colors.colortx03};
`;

const MessageTitle = styled.h6`
  font-weight: 500;
  font-size: 13px;
  color: ${props => props.theme.colors.colortx01};
  margin-bottom: 3px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NotificationMessage = styled.p`
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0;
  color: ${props => props.theme.colors.colortx03};
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 12px;
  color: #929eb9;
  line-height: 1.4;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  background-color: ${props => props.theme.colors.colorbg02};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  position: relative;
  font-family: "Helvetica Neue",Arial,sans-serif;
  font-size: 12px;
  text-transform: uppercase;

  i {
    font-size: 20px;
    line-height: 1;
    color: ${props => props.theme.colors.colortx02};
  }
`;

interface MessageDetail {
  onClick: () => void,
  prospect: Prospect,
}

const MessageDetail: FC<MessageDetail> = (props) => {
  const { onClick, prospect } = props;
  return (
    <Message onClick={onClick}>
      <Avatar
        className={cn(`${getAvatarColor(prospect.name, prospect.id)}`)}
      >
        {!prospect.name.toLowerCase().includes('prospect') ?
          <>{getInitials(prospect.name)}</> :
          <i className="ri-message-2-line" />
        }
      </Avatar>
      <MessageBody>
        <MessageTitle>
          {prospect.name}
          <MessageTime><TimeAgo date={moment(prospect.last_message_date).local()} /></MessageTime>
        </MessageTitle>
        <NotificationMessage dangerouslySetInnerHTML={{ __html: prospect.last_message }} />
      </MessageBody>
    </Message>
  );
};

export default MessageDetail;
