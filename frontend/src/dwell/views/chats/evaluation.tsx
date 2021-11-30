import React, { FC, useEffect, useState, useRef } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { AppBreadcrumb } from '@coreui/react';
import moment from 'moment';

import { chatsRoutes } from 'src/routes';
import {
  ChatReportConversationMessage,
  ChatReportMessageStatus,
  ChatReportConversation,
  ChatReportMessageSupportStatus,
  CombinedMessageStatus,
} from 'src/interfaces';
import chatEvaluationActions from 'dwell/actions/chat_evaluation';
import { ContentHeader, ContentTitle, PrimaryButton } from 'styles/common';
import { CHAT_MESSAGE_STATUSES, CHAT_MESSAGE_SUPPORT_STATUSES } from 'dwell/constants/chat_evaluations';
import Loader from 'dwell/components/Loader';

import {
  Avatar, FormSwitcher, CustomControlLabel, ContentChatEvaluation, ChatsPanel,
  ChatsPanelSidebar, ChatsPanelSidebarHeaderBadge, ChatsPanelSidebarHeader, ChatsPanelSidebarBody,
  ChatsPanelBody, ChatsPanelBodyHeader, ChatsPanelBodyContent, ChatsItemInfo, ChatsItems, ChatItem, ChatItemBody,
  NavLinkWithIcon, MessageItem, MessageItemBody, MessageWrapper, DividerDot, NoChatsWithErrors,
} from './styles';
import { Nav } from '../utils';

const errorsStatuses = ['INCORRECT', 'NOT_SUPPORTED'];

const Action = ({ active, status, onClick, ...props }) => (
  <NavLinkWithIcon {...props} status={status} active={active === status} onClick={onClick(status)} />
);

interface MessageProps {
  name: string,
  reverse: boolean,
  message: string,
  status: ChatReportMessageStatus,
  support_status: ChatReportMessageSupportStatus,
  setMessageStatus: (newStatus: ChatReportMessageStatus) => React.MouseEventHandler<HTMLButtonElement>
  setMessageSupportStatus: (newSupportStatus: ChatReportMessageSupportStatus) => React.MouseEventHandler<HTMLButtonElement>
}

const Message: FC<MessageProps> = ({ name, reverse, message, status, support_status, setMessageStatus, setMessageSupportStatus }) => (
  <MessageItem reverse={reverse}>
    <Avatar text={name} />
    <MessageItemBody status={status} support_status={support_status} >
      <MessageWrapper dangerouslySetInnerHTML={{ __html: message }} />
      {!reverse &&
            <Nav>
              {CHAT_MESSAGE_STATUSES.map(messageStatus => (
                <Action key={messageStatus.status} active={status} status={status} onClick={setMessageStatus} {...messageStatus} />
              ))}
              <DividerDot />
              {CHAT_MESSAGE_SUPPORT_STATUSES.map(messageStatus => (
                <Action key={messageStatus.status} active={support_status} status={support_status} onClick={setMessageSupportStatus} {...messageStatus} />
              ))}
            </Nav>
      }
    </MessageItemBody>
  </MessageItem>
);

type ChatEvaluationProps = RouteComponentProps<{ id: string }>;

const ChatEvaluation: FC<ChatEvaluationProps> = ({ location: { pathname } }) => {
  const dispatch = useDispatch();
  const chats = useSelector(state => state.chats_evaluation.chats);
  const data = useSelector(state => state.chats_evaluation.data);
  const isLoaded = useSelector(state => state.chats_evaluation.isLoaded);
  const selected_chat_messages = useSelector(state => state.chats_evaluation.selected_chat_messages);
  const [statusIsUpdated, setStatusIsUpdated] = useState(false);
  const {
    getChatReportForEvaluationById,
    setChatReportStatusById,
    updateConversationStatusesById,
    getSingleConversationMessagesById,
    updateMessageStatusesById,
    getSingleChatReport,
    updateChatReportStatusById,
  } = chatEvaluationActions;

  const [isSaved, setSaved] = useState<boolean>(true);
  const [filterConversationsWithErrors, setFilterConversationsWithErrors] = useState<boolean>(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatItem, setSelectedChatItem] = useState<ChatReportConversation | null>(null);
  const [reviewedChatItems, setReviewedChatItems] = useState<{ [id: string]: boolean }>({});
  const [submitIsDisabled, setSubmitIsDisabled] = useState<boolean>(true);
  const [messagesStatuses, setMessagesStatuses] = useState<{ [id: string]: { [id: string]: CombinedMessageStatus } }>({});

  const componentWillUnmount = useRef(false);
  const myData = useRef({ chats: [], reviewedChatItems: {}, messagesStatuses: {} });

  const reportId = Number(pathname.split('/').pop());

  function checkChatHasErrors(messagesStatusesList: { [id: string]: CombinedMessageStatus }, messagesToCheck: ChatReportConversationMessage[]): boolean {
    return messagesToCheck.some(message =>
      errorsStatuses.includes(messagesStatusesList[message.id]?.status));
  }

  const submitEvaluation = () => {
    if (isSaved) return;

    setSaved(true);
    dispatch(setChatReportStatusById(
      reportId,
      {
        type: 'submit',
        status: 'COMPLETED',
      },
    ));
  };

  const isSubmitButtonDisabled = () => {
    const chatsNotReviewed = chats.filter(element => element.some_not_associtated || !reviewedChatItems[element.id]);
    setSubmitIsDisabled(Boolean(chatsNotReviewed.length) || isSaved);
  };

  useEffect(() => {
    myData.current = { chats, reviewedChatItems, messagesStatuses };
    isSubmitButtonDisabled();
  }, [chats, reviewedChatItems, messagesStatuses, isSaved]);

  useEffect(() => {
    dispatch(getChatReportForEvaluationById(reportId));
    dispatch(getSingleChatReport((reportId)));
    if (data && data?.status !== 'COMPLETED' && isSaved && isLoaded) {
      setSaved(false);
    }
    return () => {
      componentWillUnmount.current = true;
    };
  }, []);

  const updateAllAssociated = () => {
    const allAssoc = !selected_chat_messages.filter(message => !message.status || !message.support_status).length;
    const someHaveErrors = Boolean(selected_chat_messages.filter(message => message.status === 'INCORRECT').length);
    chats.forEach((chat, index) => {
      if (chat.id === selectedChatId) {
        chats[index].some_not_associated = allAssoc && false;
        chats[index].has_errors = someHaveErrors;
      }
    });
  };

  useEffect(() => {
    if (statusIsUpdated) {
      updateAllAssociated();
      if (data.status === 'PENDING' || data.status === 'COMPLETED') {
        dispatch(updateChatReportStatusById(reportId, { status: 'PROGRESS' }));
        data.status = 'PROGRESS';
      }
      setStatusIsUpdated(false);
    }
  }, [statusIsUpdated]);

  useEffect(() => {
    if (chats.length && selectedChatId) {
      const selectedChat = chats.find(chat => chat.id === selectedChatId);
      setSelectedChatItem(selectedChat);
    }
    if (!Number.isNaN(parseInt(selectedChatId, 10))) {
      dispatch(getSingleConversationMessagesById(parseInt(selectedChatId, 10)));
    }
  }, [selectedChatId]);

  useEffect(() => {
    if (chats.length) {
      const tempMessagesStatuses = {};
      const tempChatsHaveErrors = {};
      const tempReviewedChatItems = {};

      // eslint-disable-next-line no-restricted-syntax
      for (const chat of chats) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        tempMessagesStatuses[chat.id] = [];
        tempChatsHaveErrors[chat.id] = checkChatHasErrors(tempMessagesStatuses[chat.id], []);
        tempReviewedChatItems[chat.id] = chat.reviewed;
      }
      setMessagesStatuses(tempMessagesStatuses);
      setReviewedChatItems(tempReviewedChatItems);
      setSelectedChatId(chats[0].id);
    } else {
      setMessagesStatuses({});
      setSelectedChatId(null);
    }
  }, [chats]);

  const toggleMarkAsReviewed = () => {
    if (selectedChatItem.reviewed) {
      setSubmitIsDisabled(true);
    }
    dispatch(updateConversationStatusesById(reportId, { ...selectedChatItem, reviewed: !selectedChatItem.reviewed }));
    setSelectedChatItem({ ...selectedChatItem, reviewed: !selectedChatItem.reviewed });
    setReviewedChatItems({ ...reviewedChatItems, [selectedChatId]: !reviewedChatItems[selectedChatId] });
    setSaved(false);
  };

  const setMessageSupportStatusById = (id, status) => {
    // todo change the handling of message has error
    selected_chat_messages.forEach((element, index) => {
      if (element.id === id) {
        if (selected_chat_messages[index].support_status !== status) {
          selected_chat_messages[index].support_status = status;
          setSaved(false);
          dispatch(updateMessageStatusesById(parseInt(selectedChatId, 10), selected_chat_messages[index]));
          setStatusIsUpdated(true);
        }
      }
    });
  };

  const setMessageStatusById = (id, status) => {
    // todo change the handling of message has error
    selected_chat_messages.forEach((element, index) => {
      if (element.id === id) {
        if (selected_chat_messages[index].status !== status) {
          selected_chat_messages[index].status = status;
          setSaved(false);
          dispatch(updateMessageStatusesById(parseInt(selectedChatId, 10), selected_chat_messages[index]));
          setStatusIsUpdated(true);
        }
      }
    });
  };

  const toggleFilterConversationWithErrors = () => {
    if (!filterConversationsWithErrors) {
      const chatsWithErrors = chats.filter(chat => chat.has_errors);
      if (chatsWithErrors.length) {
        setSelectedChatId(chatsWithErrors[0].id);
        setSelectedChatItem(chatsWithErrors[0]);
      } else {
        setSelectedChatId(null);
        setSelectedChatItem(null);
      }
    } else {
      setSelectedChatId(chats[0].id);
      setSelectedChatItem(chats[0]);
    }
    setFilterConversationsWithErrors(!filterConversationsWithErrors);
  };
  return (
    <ContentChatEvaluation>
      <Helmet>
        <title>DWELL | Chat Evaluation</title>
      </Helmet>
      <ContentHeader>
        <div className="mr-auto">
          <AppBreadcrumb appRoutes={chatsRoutes} />
          <div className="d-flex align-items-center">
            <ContentTitle className="mr-5">Evaluation</ContentTitle>
          </div>
          <p className="mg-b-0">
            {data ? moment(data.session_date).format('MMMM YYYY [Session]') : ''}
          </p>
        </div>
        <div className="d-flex align-items-center">
          <span style={{ paddingRight: 10 }}>Only show conversations with errors</span>
          <FormSwitcher
            inactive={!filterConversationsWithErrors}
            onClick={toggleFilterConversationWithErrors}
          />
          <PrimaryButton
            disabled={submitIsDisabled}
            onClick={() => submitEvaluation()}
          >
            Submit Evaluation
          </PrimaryButton>
        </div>
      </ContentHeader>
      { !isLoaded ? <Loader /> :
        <ChatsPanel>
          <ChatsPanelSidebar>
            <ChatsPanelSidebarHeader>
              <h6 className="tx-16 mg-b-0">Chats</h6>
              <ChatsPanelSidebarHeaderBadge>
                {(
                  filterConversationsWithErrors
                    ? chats.filter(chat => chat.has_errors)
                    : chats
                ).filter(c => reviewedChatItems[c.id]).length}/{
                  (
                    filterConversationsWithErrors
                      ? chats.filter(chat => chat.has_errors)
                      : chats
                  ).length}
              </ChatsPanelSidebarHeaderBadge>
            </ChatsPanelSidebarHeader>
            <ChatsPanelSidebarBody>
              <ChatsItems>
                {(
                  filterConversationsWithErrors
                    ? chats.filter(chat => chat.has_errors)
                    : chats
                ).map(({ id, date, index }) => (
                  <ChatItem
                    key={id}
                    selected={id === selectedChatId}
                    checked={reviewedChatItems[id]}
                    onClick={() => setSelectedChatId(id)}
                  >
                    <Avatar icon="check-fill" />
                    <ChatItemBody>
                      <h6>#{index }</h6>
                      <p>{moment(date).format('MMMM Do, YYYY h:mm a')}</p>
                    </ChatItemBody>
                  </ChatItem>
                ))}
              </ChatsItems>
            </ChatsPanelSidebarBody>
          </ChatsPanelSidebar>
          <ChatsPanelBody>
            <ChatsPanelBodyHeader>
              <ChatsItemInfo>
                {selectedChatItem && <>
                  <h6>#{selectedChatItem.index}</h6>
                  <p>{moment(selectedChatItem.date).format('MMMM Do, YYYY h:mm a')}</p>
                </>}
              </ChatsItemInfo>
              <div className="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id={selectedChatId}
                  name={selectedChatId}
                  checked={reviewedChatItems[selectedChatId]}
                  onChange={toggleMarkAsReviewed}
                />
                <CustomControlLabel htmlFor={selectedChatId}>
                    Mark as reviewed
                </CustomControlLabel>
              </div>
            </ChatsPanelBodyHeader>
            <ChatsPanelBodyContent>
              { selectedChatId ?
                selected_chat_messages?.map(({ id, type, message, status: current_status, support_status }) => (
                  <Message
                    key={id}
                    name={type === 'PROSPECT' ? 'P' : 'H'}
                    message={message}
                    status={current_status}
                    support_status={support_status}
                    reverse={type === 'PROSPECT'}
                    setMessageStatus={status => () => setMessageStatusById(id, status)}
                    setMessageSupportStatus={status => () => setMessageSupportStatusById(id, status)}
                  />
                )) :
                <NoChatsWithErrors>
                    No chat conversations with errors
                </NoChatsWithErrors>
              }
            </ChatsPanelBodyContent>
          </ChatsPanelBody>
        </ChatsPanel>
      }
    </ContentChatEvaluation>
  );
};

export default withRouter(ChatEvaluation);
