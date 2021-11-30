import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { SMS_LOAD_MORE_OFFSET } from 'dwell/constants';
import Loader from 'dwell/components/Loader';
import { isEmpty } from 'lodash';
import prospectChatAction from 'dwell/actions/prospect_chat';
import { getAvatarColor, getInitials } from 'dwell/views/chat/common/utils';
import { AgentJoinedText } from 'dwell/views/chat/multi_chat/styles';
import { quote, prospectTemplateMessage } from 'dwell/views/lead/overview/lead_body_content/utils';
import { Prospect } from 'src/interfaces';
import { ConversationAvatar, ConversationBody, ConversationItem, ConversationItemBody, ConversationItemBox,
  ConversationItemDate, AvatarImg,
} from './styles';

interface LeadChatsProps extends RouteComponentProps{
  prospect: Prospect,
}

const ChatConversations: FC<LeadChatsProps> = ({ prospect }) => {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversation] = useState([]);
  const [isScrollLoading, setIsScrollLoading] = useState(false);
  const [oldScrollPosition, setOldScrollPosition] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const dispatch = useDispatch();
  const { getConversations } = prospectChatAction;

  const { name, id } = prospect;

  useEffect(() => {
    if (id) {
      setConversation([]);
      setLoading(true);
      dispatch(getConversations({ prospect: id, params: { offset: 0, limit: SMS_LOAD_MORE_OFFSET } }))
        .then(({ result }) => {
          setLoading(false);
          setConversation(result.data.results.reverse());
          setTotalCount(result.data.count);
        }).catch(() => {
          setLoading(false);
        });
    }
  }, [prospect]);

  const onscroll = ({ target }) => {
    if (totalCount === conversations.length) return;
    if (target && target.scrollTop === 0) {
      setIsScrollLoading(true);
      setOldScrollPosition(target.scrollHeight - target.clientHeight);
      setTimeout(() => {
        if (id) {
          dispatch(getConversations({ prospect: id, params: { offset: conversations.length, limit: SMS_LOAD_MORE_OFFSET } }))
            .then(({ result }) => {
              setIsScrollLoading(false);
              setConversation(result.data.results.reverse().concat(conversations));
            }).catch(() => {
              setIsScrollLoading(false);
            });
        }
      }, 1000);
    }
  };

  useEffect(() => {
    if (conversations.length) {
      setTimeout(() => {
        const container = document.getElementById('conversations');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 100);
    }
  }, [conversations]);

  useEffect(() => {
    const container = document.getElementById(`chats-card-${id}`);
    if (container) {
      const newScroll = container.scrollHeight - container.clientHeight;
      container.scrollTop += (newScroll - oldScrollPosition);
    }
  }, [conversations, totalCount]);

  const getIconAndLabel = ({ type, message, date, agent_name, agent_avatar }, i) => {
    let icon = <></>;
    let label = '';
    let color = 'bg-dark';
    let isReversed = false;
    let joinedText = null;
    let isQuote = false;
    if (['BOT', 'GREETING'].includes(type)) {
      icon = <i className="ri-rocket-2-fill" />;
      label = 'Hobbes';
    }
    if (type === 'PROSPECT') {
      icon = <span>{getInitials(name)}</span>;
      label = name;
      isReversed = true;
      color = getAvatarColor(prospect.name, prospect.id);
      isQuote = !message.startsWith('<div') && !prospectTemplateMessage.includes(message);
    }
    if (['AGENT', 'DATA_CAPTURE', 'TEMPLATE'].includes(type)) {
      icon = agent_avatar ? <AvatarImg src={agent_avatar} alt="avatar" /> : <span>{getInitials(agent_name)}</span>;
      label = agent_name;
      isQuote = type !== 'DATA_CAPTURE' && !message.startsWith('<div');
    }
    if (type === 'JOINED') {
      icon = <i className="ri-group-line" />;
      joinedText = (
        <AgentJoinedText>
          {agent_name} has entered the chat.
          <small>&nbsp;&nbsp;({moment(date).format('MMM DD, hh:mma')})</small>
        </AgentJoinedText>
      );
    }
    return (
      <ConversationItem key={i} reversed={isReversed} agentJoined={type === 'JOINED'}>
        {type !== 'JOINED' && <ConversationAvatar reversed={isReversed} className={color}>{icon}</ConversationAvatar>}
        <ConversationItemBody reversed={isReversed}>
          {joinedText || (
            <>
              <ConversationItemBox reversed={isReversed} isBot={['BOT', 'GREETING', 'DATA_CAPTURE'].includes(type)} dangerouslySetInnerHTML={{ __html: isQuote ? `${quote} ${message}` : message }} />
              <ConversationItemDate>
                <strong>{label}</strong>
                {moment(date).format('MMM DD, hh:mm A')}
              </ConversationItemDate>
            </>
          )}
        </ConversationItemBody>
      </ConversationItem>
    );
  };

  return (
    <ConversationBody onScroll={e => onscroll(e)} id="conversations">
      <div className="d-flex flex-column justify-content-end">
        {loading && <Loader />}
        {isScrollLoading && <Loader className="chatLoader" />}
        {!loading && !isEmpty(conversations) && conversations.filter(c => c.type !== 'AGENT_REQUEST').map((item, i) => getIconAndLabel(item, i))}
        {!loading && isEmpty(conversations) && <p className="text-center">Transcription for this chat is not made yet.</p>}
      </div>
    </ConversationBody>
  );
};

export default withRouter(ChatConversations);
