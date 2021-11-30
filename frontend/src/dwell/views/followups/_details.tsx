import React, { FC, useEffect, useState } from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import CKEditor from 'ckeditor4-react';
import moment from 'moment';
import { isEmpty } from 'codemirror/src/util/misc';
import { EmailMessageProps, ListResponse } from 'src/interfaces';
import actions from 'dwell/actions';
import LeadCreationModal from 'dwell/components/Leads/LeadCreationModal';
import LeadLinkingModal from 'dwell/components/Leads/LeadLinkingModal';
import { getPropertyId, LineSkeleton } from 'src/utils';
import { WhiteButton } from 'src/styles/common';
import { Alert, UncontrolledTooltip, NavLink } from 'reactstrap';
import { paths } from 'dwell/constants';
import EmailWindow from 'dwell/components/email/composer/_window';
import Skeleton from 'react-loading-skeleton';
import { getInitials, getColor } from './utils';
import MessageBody from './_messageBody';
import EmailSent from './_emailSent';
import {
  EmailPanel,
  EmailPanelBody,
  EmailPanelItem,
  EmailHeader,
  MediaMailForm,
  MediaAvatar,
  MediaBody,
  DropdownLinkedLead,
  DropdownLink,
  DropdownLinkedLeadMenu,
  EmailBody,
  EmailBodySubject,
  EmailBodyText,
  DropdownMenuHeader,
  DropdownMenuLink,
  LeadLinkActionNav,
  ArchiveButton,
} from './styles';

interface LeadProps {
  first_name: string,
  last_name: string,
  email: string,
  stage: string,
  id: number,
}

interface EmailDetailsProps extends RouteComponentProps {
  handleUnlinkLead: () => void,
  getLeadById: (id: number) => void,
  updateMessageById: (id: number, data: { lead: null }) => Promise<null>,
  lead: LeadProps,
  isLoaded: boolean,
  isArchiving: boolean,
  activeMessageId: number,
  messagesCount: number,
  property: { nylas_status: string, external_id: string },
  messages: EmailMessageProps[],
  conversations: EmailMessageProps[],
  getEmailConversations: (data: { lead_id: number }) => void,
  getMessages: ({ offset, limit }: { offset: number, limit: number }) => Promise<ListResponse>,
  archiveMessage: (id: number) => void,
  setActiveMessageId: (activeId: number) => unknown,
  setEmailOpenStatus: (isSet: boolean) => null,
  isLeadPage: boolean,
  isMessageLoaded: boolean,
}

const EmailDetails: FC<EmailDetailsProps> = ({ history: { push }, updateMessageById, archiveMessage, isArchiving, property,
  getLeadById, lead, isLoaded, activeMessageId, messages: followupMessages, conversations, getEmailConversations, setActiveMessageId,
  isLeadPage, getMessages, setEmailOpenStatus, isMessageLoaded, messagesCount }) => {
  CKEditor.editorUrl = `${window.location.origin}/static/ckeditor/ckeditor.js`;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isShowingLeadCreationModal, showLeadCreationModal] = useState(false);
  const [isShowingLeadLinkingModal, showLeadLinkingModal] = useState(false);

  const messages = isLeadPage ? conversations : followupMessages;
  const message = messages.find(i => i.id === activeMessageId) || {};

  useEffect(() => {
    if (message.id && message.lead && message.lead !== -1 && !isLeadPage) {
      getLeadById(message.lead);
      getEmailConversations({ lead_id: message.lead });
    }
  }, [message.lead]);

  const handleArchiveMessage = () => {
    const index = messages.findIndex(i => i.id === activeMessageId);
    if (index + 1 < messages.length) {
      setActiveMessageId(messages[index + 1].id);
      archiveMessage(message.id);
    } else {
      // getMessages({ offset: messages.length, limit })
      if (!isLeadPage && messagesCount !== messages.length) {
        getMessages({ offset: messages.length, limit: 10 }).then(({ result: { data } }) => {
          if (data.results.length) setActiveMessageId(data.results[messages.length + 1].id);
        });
      }
      archiveMessage(message.id);
      setActiveMessageId(messages[0].id);
    }
  };

  const handleUnlinkLead = () => {
    updateMessageById(message.id, { lead: null }).then(() => {
      getMessages({ offset: 0, limit: messages.length });
    });
  };

  const handleRedirectToLeadPage = () => {
    const siteId = getPropertyId();
    push(`/${siteId}/leads/${message.lead}`);
  };

  const openEmailWindow = () => {
    setEmailOpenStatus(true);
  };

  let actionButtons = null;
  if (isLoaded && lead && isMessageLoaded) {
    actionButtons = message.lead ? (
      <DropdownLinkedLead isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
        <DropdownLink caret><i className="ri-check-line" /> Linked lead</DropdownLink>
        <DropdownLinkedLeadMenu right>
          <span className={`${lead.stage} badge`}>{ lead.stage }</span>
          <DropdownMenuHeader>{lead.first_name }  {lead.last_name }</DropdownMenuHeader>
          <p>{ lead.email }</p>
          <DropdownMenuLink
            className="btn btn-success btn-block"
            onClick={() => {
              handleRedirectToLeadPage();
              setDropdownOpen(!dropdownOpen);
            }}
          >
            Go to lead details
          </DropdownMenuLink>
          <WhiteButton
            className="btn btn-white btn-block"
            onClick={() => {
              handleUnlinkLead();
              setDropdownOpen(!dropdownOpen);
            }}
          >
            Unlink lead
          </WhiteButton>
        </DropdownLinkedLeadMenu>
      </DropdownLinkedLead>
    ) : (
      <div className="d-flex">
        <LeadLinkActionNav className="nav-icon">
          <NavLink id="add-new-lead" onClick={() => showLeadCreationModal(true)} className="mr-2">
            <span>
              <i className="ri-user-add-line" />
            </span>
          </NavLink>
          <UncontrolledTooltip target="add-new-lead">Add as new lead</UncontrolledTooltip>
          <NavLink id="link-existing-lead" onClick={() => showLeadLinkingModal(true)}>
            <span data-title="Link to existing lead">
              <i className="ri-links-line" />
            </span>
          </NavLink>
          <UncontrolledTooltip target="link-existing-lead">Link to existing lead</UncontrolledTooltip>
        </LeadLinkActionNav>
      </div>
    );
    actionButtons = (
      <div className="d-flex">
        <ArchiveButton
          className="btn mr-2"
          onClick={openEmailWindow}
          disabled={isArchiving || ['DISCONNECTED', 'AUTH_REQUIRED'].includes(property.nylas_status)}
          heightUnset
        >
          <i className="ri-reply-all-fill" /> Reply
        </ArchiveButton>
        <ArchiveButton
          className="btn mr-2"
          onClick={handleArchiveMessage}
          disabled={isArchiving || ['DISCONNECTED', 'AUTH_REQUIRED'].includes(property.nylas_status)}
          heightUnset
        >
          <i className="ri-inbox-archive-line" /> Archive
        </ArchiveButton>
        {actionButtons}
      </div>
    );
  }

  if (isEmpty(message)) return <></>;

  const senderName = message.sender_name || '';
  const sender = isEmpty(message) ? null : { firstName: senderName.split(' ')[0], lastName: senderName.split(' ')[1], email: message.sender_email };

  return (
    <React.Fragment>
      <EmailPanel isLeadPage={isLeadPage}>
        {['DISCONNECTED', 'AUTH_REQUIRED'].includes(property.nylas_status) && (
          <Alert className="m-3">
            {property.nylas_status === 'DISCONNECTED' ? 'Your email account is no longer connected. ' : 'Your email account is no longer authorized. '}
            <Link to={paths.build(paths.client.SETTINGS.EMAIL_SYNC, getPropertyId())} >Go to email settings</Link>
          </Alert>
        )}
        <EmailPanelBody className="pb-0">
          <EmailPanelItem hideBorder>
            <EmailHeader>
              <MediaMailForm>
                {!isLeadPage && isMessageLoaded && <MediaAvatar className={getColor(message.sender_email)}>{getInitials(message.sender_name)}</MediaAvatar>}
                {!isLeadPage && !isMessageLoaded && <Skeleton circle height={40} width={40} />}
                <MediaBody>
                  <p>{isMessageLoaded ? <>From: <strong>{message.sender_name} </strong> ({message.sender_email})</> :
                    <LineSkeleton height={9} width={200} />}
                  </p>
                  <p>{isMessageLoaded ? <>To: <strong>{message.receiver_name}</strong> ({message.receiver_email})</> :
                    <LineSkeleton height={9} width={150} />}
                  </p>
                  <p>{isMessageLoaded ? <>{moment(message.date).format('LLL')}</> :
                    <LineSkeleton height={9} width={100} />}
                  </p>
                </MediaBody>
              </MediaMailForm>
              {!isLeadPage && actionButtons}
            </EmailHeader>
            <EmailBody isLeadPage={isLeadPage}>
              <EmailBodySubject>{isMessageLoaded ? message.subject : <LineSkeleton height={24} width={500} />}</EmailBodySubject>
              <EmailBodyText>
                {isMessageLoaded ?
                  <MessageBody messageBody={message.body} attachments={message.attachments} /> :
                  <LineSkeleton height={10} count={4} />
                }
              </EmailBodyText>
              <hr />
            </EmailBody>
          </EmailPanelItem>
        </EmailPanelBody>
        {!isLeadPage && (
          <EmailPanelBody className="pt-0">
            {conversations.filter(i => i.lead === message.lead).map(email => <EmailSent email={email} key={email.id} />)}
          </EmailPanelBody>
        )}
      </EmailPanel>
      <LeadCreationModal
        sender={sender}
        messageId={message.id}
        show={isShowingLeadCreationModal}
        handleClose={() => showLeadCreationModal(false)}
      />
      <LeadLinkingModal
        show={isShowingLeadLinkingModal}
        email={message.sender_email}
        handleClose={(leadId) => {
          if (leadId) {
            updateMessageById(message.id, { lead: leadId }).then(() => {
              getMessages({ offset: 0, limit: messages.length });
            });
          }
          showLeadLinkingModal(false);
        }}
      />
      {!isLeadPage &&
        <EmailWindow
          handleClose={() => setEmailOpenStatus(false)}
          lead={message.lead ? lead : null}
          message={message}
          isReply
        />}
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  lead: state.lead.lead,
  isLoaded: state.lead.isLoaded,
  messages: state.emailMessage.messages,
  conversations: state.emailMessage.conversations,
  isArchiving: state.nylas.isArchiving,
  property: state.property.property,
  isMessageLoaded: state.emailMessage.isLoaded,
  messagesCount: state.emailMessage.messagesCount,
});

export default connect(
  mapStateToProps,
  {
    ...actions.emailMessage,
    ...actions.prospectChat,
    ...actions.nylas,
    ...actions.lead,
    ...actions.property,
  },
)(withRouter(EmailDetails));
