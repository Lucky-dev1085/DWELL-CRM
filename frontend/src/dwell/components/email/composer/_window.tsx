import React, { useEffect, FC } from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import actions from 'dwell/actions';
import { EmailMessageProps } from 'src/interfaces';
import 'src/scss/pages/_task_list.scss';
import 'src/scss/pages/_quick_actions.scss';
import EmailCompose from './_compose';

interface Lead {
  id: number,
  first_name: string,
  last_name: string,
}

interface EmailWindowProps extends RouteComponentProps {
  lead?: Lead,
  message?: EmailMessageProps,
  isEmailComposerOpened?: boolean,
  prevLeadId?: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleClose?: (isClose?: boolean) => void,
  isReply?: boolean,
  clearEmailContent?: () => void,
  setEmailLeadId?: (id: number) => void,
  isCommunicationReply?: boolean,
}

const EmailWindow: FC<EmailWindowProps> = ({ lead, handleClose, message, isEmailComposerOpened, isReply, prevLeadId, clearEmailContent, setEmailLeadId, isCommunicationReply }) => {
  useEffect(() => {
    if (isEmailComposerOpened && (!lead || prevLeadId !== lead.id || isCommunicationReply)) {
      clearEmailContent();
      if (lead) {
        setEmailLeadId(lead.id);
      }
    }
  }, [isEmailComposerOpened]);

  return (
    <Modal
      size="lg"
      isOpen={isEmailComposerOpened}
      toggle={() => handleClose(false)}
      aria-labelledby="example-custom-modal-styling-title"
      modalClassName="email-composer"
      className="composer-modal"
      centered
    >
      <ModalHeader>
        {lead ? `${lead.first_name} ${lead.last_name}` : 'Compose Mail'}
        <button className="close" onClick={(e) => { handleClose(false); e.stopPropagation(); }}>
          <i className="ri-close-line" />
        </button>
      </ModalHeader>
      <ModalBody>
        <EmailCompose lead={lead} message={message} handleClose={handleClose} isReply={isReply} isCommunicationReply={isCommunicationReply} />
      </ModalBody>
    </Modal>
  );
};

const mapStateToProps = state => ({
  isEmailComposerOpened: state.nylas.isEmailComposerOpened,
  prevLeadId: state.emailMessage.leadId,
});

EmailWindow.defaultProps = {
  lead: {} as Lead,
  message: {},
};

export default connect(
  mapStateToProps,
  {
    ...actions.lead,
    ...actions.nylas,
    ...actions.prospectChat,
    ...actions.emailMessage,
  },
)(withRouter(EmailWindow));
