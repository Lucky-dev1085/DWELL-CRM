import React, { FC, useEffect, useRef, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import actions from 'dwell/actions/index';
import ModalNotification from 'dwell/views/chat/single_chat/_modalNotification';
import newAgentRequestSound from 'src/assets/audio/agent-transfer.mp3';
import { NotificationsWrapper } from 'dwell/views/chat/single_chat/styles';
import { PropertyProps, UserProps, AgentRequestProps, Prospect, DetailResponse } from 'src/interfaces';
import { isMostRecentTab } from 'dwell/views/chat/common/utils';

const newAgentRequestSoundPlayer = new Audio(newAgentRequestSound);

interface ChatNotificationsProps extends RouteComponentProps {
  prospects: Prospect[],
  currentUser: UserProps,
  currentProperty: PropertyProps,
  prospectsRequestedAgents: AgentRequestProps[],
  chatType: string,
  isChatMinimized: boolean,
  setChatType: (type: string) => void,
  setChatMinimiseStatus: (minimized: boolean) => void,
  joinProspect: (data: { prospect: number, body: { type: string, agent: number } }) => Promise<DetailResponse>,
  updateCurrentProspect: (prospect: number) => void,
  readAll: (prospect: number) => null,
  dismissNewMessage: (prospect: number) => null,
  updateAgentRequest: (id: number, data: { is_declined?: boolean, is_active?: boolean }) => null,
  removeFromProspectsRequestedAgent: (id: number) => void,
  reorderActiveChats: (contact: { id: number, isSMS: boolean, isSingleChat: boolean, minimized: boolean }) => void,
  setCurrentTab: (tab: string) => void,
  currentTab: string,
}

const ChatNotifications: FC<ChatNotificationsProps> = ({ prospects, prospectsRequestedAgents, joinProspect, readAll,
  setChatMinimiseStatus, setChatType, isChatMinimized, chatType, removeFromProspectsRequestedAgent, updateAgentRequest,
  currentUser, currentProperty, reorderActiveChats, dismissNewMessage, setCurrentTab, currentTab }) => {
  const [showNotification, setShowNotification] = useState({});
  const [showTransferNotification, setShowTransferNotification] = useState({});
  const playAgentRequestSoundInterval = useRef(null);

  const filteredJoinRequests = prospectsRequestedAgents.filter(i => i.property === currentProperty.id);

  useEffect(() => {
    const tabs = Object.keys(localStorage).filter(key => key.startsWith('tab')).sort((a, b) => a.localeCompare(b));
    const tabNumber = !isEmpty(tabs) ? Number(tabs[tabs.length - 1].replace('tab', '')) + 1 : 1;
    const tabKey = `tab${tabNumber}`;
    localStorage.setItem(tabKey, new Date().toISOString());
    setCurrentTab(tabKey);

    const removeTabKey = () => {
      localStorage.removeItem(tabKey);
    };

    window.addEventListener('beforeunload', removeTabKey);
    return () => {
      window.removeEventListener('beforeunload', removeTabKey);
    };
  }, []);

  const clearAgentSound = () => {
    if (playAgentRequestSoundInterval.current) {
      clearInterval(playAgentRequestSoundInterval.current);
      playAgentRequestSoundInterval.current = null;
    }
  };

  useEffect(() => {
    if (!isEmpty(prospects)) {
      let showNotificationResult = { ...showNotification };
      prospects.forEach((prospect) => {
        showNotificationResult = {
          ...showNotificationResult,
          [prospect.external_id]: prospect.active_agent === currentUser.id && prospect.unread_count > 0 && prospect.has_not_seen_new_message,
        };
      });
      setShowNotification(showNotificationResult);

      let showTransferNotificationResult = { ...showTransferNotification };
      prospects.forEach((prospect) => {
        showTransferNotificationResult = {
          ...showTransferNotificationResult,
          [prospect.external_id]: true,
        };
      });
      setShowTransferNotification(showTransferNotificationResult);
    }
  }, [prospects]);

  useEffect(() => {
    const prospectIds = prospects.map(p => p.id);
    const isActiveRequests = filteredJoinRequests.some(request => request.is_active && !request.is_declined && prospectIds.includes(request.prospect));
    if (isActiveRequests) {
      if (!playAgentRequestSoundInterval.current && isMostRecentTab(currentTab)) {
        playAgentRequestSoundInterval.current = setInterval(() => {
          newAgentRequestSoundPlayer.play();
        }, 1000);
      }

      setTimeout(() => {
        if (playAgentRequestSoundInterval.current) {
          clearInterval(playAgentRequestSoundInterval.current);
          playAgentRequestSoundInterval.current = null;
        }
      }, 30000);
    } else {
      // if agent request is handled on other tab or user, we should stop audio
      clearAgentSound();
    }
  }, [filteredJoinRequests, prospects]);

  const viewMessage = (prospect) => {
    setChatMinimiseStatus(false);
    setChatType('chat');
    reorderActiveChats({ id: prospect.id, isSMS: false, isSingleChat: true, minimized: false });
  };

  const joinChat = (prospectId, prospectExternalId) => {
    setChatMinimiseStatus(false);
    setChatType('chat');
    clearAgentSound();
    joinProspect({ prospect: prospectId, body: { type: 'JOINED', agent: currentUser.id } }).then(() => {
      const prospect = prospects.find(p => p.id === prospectId);
      if (prospect) reorderActiveChats({ id: prospect.id, isSMS: false, isSingleChat: true, minimized: false });
      readAll(prospectId);
      removeFromProspectsRequestedAgent(prospectId);
      setShowTransferNotification({ ...showTransferNotification, [prospectExternalId]: false });
    });
  };

  const decline = (prospectId, prospectExternalId, requestId) => {
    updateAgentRequest(requestId, { is_declined: true });
    setShowTransferNotification({ ...showTransferNotification, [prospectExternalId]: false }); // hide
    clearAgentSound(); // mute
    removeFromProspectsRequestedAgent(prospectId); // remove from requested
  };

  const handleCloseTransferRequest = (prospectId, prospectExternalId, requestId) => {
    updateAgentRequest(requestId, { is_active: false });
    clearAgentSound(); // mute
    setShowTransferNotification({ ...showTransferNotification, [prospectExternalId]: false });
  };

  return (
    <NotificationsWrapper>
      <div>
        {prospects.filter(prospect => !prospect.is_archived).map((prospect, index) => (
          <React.Fragment key={index}>
            {showNotification[prospect.external_id] ?
              <ModalNotification
                showingNotification={showNotification[prospect.external_id] && (isChatMinimized || chatType === 'sms')}
                type="NEW_MESSAGE"
                message={prospect.last_prospect_formatted_message}
                messageDate={prospect.last_prospect_message_date}
                handleClose={() => dismissNewMessage(prospect.id)}
                unreadCount={prospect.unread_count}
                prospectName={prospect.name}
                prospectId={prospect.external_id}
                viewMessage={() => viewMessage(prospect)}
                timeout={15}
              /> : null}
          </React.Fragment>))}
        {filteredJoinRequests.filter(request => request.is_active && !request.is_declined).map((request, index) => {
          const prospect = prospects.find(p => p.id === request.prospect);
          return (prospect && !isEmpty(prospect) ?
            <ModalNotification
              key={index}
              showingNotification={showTransferNotification[prospect.external_id] && (isChatMinimized || chatType === 'sms')}
              type="NEW_AGENT_REQUEST"
              messageDate={request.created}
              handleClose={() => handleCloseTransferRequest(prospect.id, prospect.external_id, request.id)}
              prospectName={prospect.name}
              prospectId={prospect.external_id}
              joinChat={() => joinChat(prospect.id, prospect.external_id)}
              decline={() => decline(prospect.id, prospect.external_id, request.id)}
            /> : null);
        })
        }
      </div>
    </NotificationsWrapper>);
};

const mapStateToProps = state => ({
  properties: state.property.properties,
  property: state.property.property,
  activeProperties: state.prospectChat.activeProperties,
  currentUser: state.user.currentUser,
  currentProperty: state.property.property,
  prospects: state.prospectChat.prospects.filter(p => p.should_display_in_chat),
  prospectsRequestedAgents: state.prospectChat.prospectsRequestedAgents,
  isChatMinimized: state.prospectChat.isChatMinimized,
  chatType: state.prospectChat.chatType,
  currentTab: state.prospectChat.currentTab,
});

export default connect(
  mapStateToProps,
  {
    ...actions.prospectChat,
  },
)(withRouter(ChatNotifications));
