import React, { FC, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { intersectionBy } from 'lodash';
import prospectChatAction from 'dwell/actions/prospect_chat';
import nylasAction from 'dwell/actions/nylas';
import { TaskCreationModal } from 'dwell/components';
import EmailWindow from 'dwell/components/email/composer/_window';
import { Prospect } from 'src/interfaces';
import { ButtonWhite, LeadContentFooter, ButtonGroup } from './styles';
import NoteModal from './_note_modal';

interface LeadContentFooterProps extends RouteComponentProps {
  stateDetail: { openComposer?: boolean },
  isShared: boolean,
}

const LeadContentsFooter: FC<LeadContentFooterProps> = ({ stateDetail, isShared }) => {
  const [isEmailDisabled, setIsEmailDisabled] = useState(true);
  const [isTextDisabled, setIsTextDisabled] = useState(true);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isTourTask, setTourTask] = useState(false);
  const [isNoteModalOpen, setNoteModalOpen] = useState(false);
  const [isEmailOpen, setEmailOpen] = useState(false);

  const dispatch = useDispatch();
  const currentProperty = useSelector(state => state.property.property);
  const lead = useSelector(state => state.lead.lead);
  const isChatMinimized = useSelector(state => state.prospectChat.isChatMinimized);
  const prospects = useSelector(state => state.prospectChat.prospects.filter(p => p.should_display_in_chat));

  const { setChatType, setChatMinimiseStatus, setChatAsActive } = prospectChatAction;
  const { setEmailOpenStatus } = nylasAction;

  useEffect(() => {
    if (currentProperty) {
      setIsEmailDisabled(!lead.email || currentProperty.nylas_status !== 'CONNECTED' || isShared);
      setIsTextDisabled(!lead.lead_can_text || isShared);
    }
  }, [lead, currentProperty]);

  useEffect(() => {
    if (stateDetail.openComposer) {
      dispatch(setChatType('sms'));
      dispatch(setChatMinimiseStatus(false));
    }
  }, [stateDetail.openComposer]);

  const openTextWindow = () => {
    dispatch(setChatAsActive({ id: lead.id, isSMS: true, isSingleChat: true }));
  };

  const toggleEmailWindow = (isOpen = false) => {
    dispatch(setEmailOpenStatus(isOpen));
    setEmailOpen(isOpen);
  };

  const openQuickChat = () => {
    if (isChatMinimized) {
      dispatch(setChatMinimiseStatus(false));
    }
    dispatch(setChatType('chat'));
  };

  const { id, first_name: firstName, last_name: lastName, chat_prospects } = lead;
  const prospect = intersectionBy(prospects, chat_prospects, 'id') as Prospect[];
  const isProspectOnline = (prospect || []).filter(el => el.is_online).length;

  return (
    <React.Fragment>
      <LeadContentFooter>
        <ButtonGroup>
          {/* <ButtonWhite className="btn" right><i className="ri-phone-line" /> Calls</ButtonWhite> */}
          <ButtonWhite
            className="btn"
            disabled={isTextDisabled}
            onClick={() => (!isTextDisabled ? openTextWindow() : null)}
            title={isTextDisabled && 'Prospect does not have a phone number'}
            right
          >
            <i className="ri-message-2-line" /> SMS
          </ButtonWhite>
          <ButtonWhite
            className="btn"
            disabled={isEmailDisabled}
            onClick={() => (!isEmailDisabled ? toggleEmailWindow(true) : null)}
            title={isEmailDisabled && 'Prospect does not have an email address'}
            right
          >
            <i className="ri-mail-line" /> Email
          </ButtonWhite>
          <ButtonWhite
            className="btn"
            disabled={!isProspectOnline}
            blue={isProspectOnline}
            onClick={openQuickChat}
            title={!isProspectOnline && 'Prospect is not online to chat'}
            right
          >
            <i className="ri-chat-1-line" /> Chat
          </ButtonWhite>
        </ButtonGroup>
        <ButtonGroup>
          <ButtonWhite className="btn" right onClick={() => setNoteModalOpen(true)}><i className="ri-sticky-note-line" /> Note</ButtonWhite>
          <ButtonWhite className="btn" right onClick={() => setTaskModalOpen(true)}><i className="ri-task-line" /> Task</ButtonWhite>
          <ButtonWhite className="btn" right onClick={() => { setTaskModalOpen(true); setTourTask(true); }}><i className="ri-calendar-todo-line" /> Tour</ButtonWhite>
        </ButtonGroup>
      </LeadContentFooter>
      {isEmailOpen && <EmailWindow
        handleClose={() => toggleEmailWindow(false)}
        lead={lead}
      />}
      <TaskCreationModal
        show={isTaskModalOpen}
        task={{}}
        currentLead={{ id, name: `${firstName} ${lastName}` }}
        handleClose={() => { setTaskModalOpen(false); setTourTask(false); }}
        isTourTask={isTourTask}
        isLeadLevel
      />
      <NoteModal
        show={isNoteModalOpen}
        handleClose={() => setNoteModalOpen(false)}
      />
    </React.Fragment>
  );
};

export default withRouter(LeadContentsFooter);

