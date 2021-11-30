import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getLeadId } from 'dwell/views/lead/layout/utils';
import nylasAction from 'dwell/actions/nylas';
import Sidebar from 'dwell/views/followups/_sidebar';
import EmailDetails from 'dwell/views/followups/_details';
import EmailWindow from 'dwell/components/email/composer/_window';
import { FollowUpsPanel } from 'dwell/views/followups/styles';
import { EmptyContent, PrimaryButton } from 'styles/common';

interface StateProps {
  activeEmail: string,
}

const LeadEmails: FC<RouteComponentProps> = ({ history: { push }, location: { state } }) => {
  const [activeMessageId, setActiveMessageId] = useState(null);
  const leadId = getLeadId(window.location.pathname);

  const dispatch = useDispatch();
  const conversations = useSelector(states => states.emailMessage.conversations);
  const property = useSelector(states => states.property.property);
  const lead = useSelector(states => states.lead.lead);
  const { setEmailOpenStatus } = nylasAction;

  useEffect(() => {
    const { activeEmail } = state as StateProps;
    if (activeEmail) setActiveMessageId(parseInt(activeEmail, 10));
  }, []);

  const openEmailWindow = () => {
    dispatch(setEmailOpenStatus(true));
  };

  const emptyContent = (
    <EmptyContent>
      <i className="ri-mail-unread-line" />
      <h5><span>No email activity yet</span></h5>
      <p>When you send emails to leads, we'll show the email conversations here</p>
      <PrimaryButton onClick={openEmailWindow}>
        <span><i className="ri-mail-unread-line" /></span> Send Email
      </PrimaryButton>
    </EmptyContent>
  );
  const settingNotReady = (
    <EmptyContent>
      <i className="ri-mail-unread-line" />
      <h5><span>Enable Dwell Followups</span></h5>
      <p className="text-center">When you sync your work email account with Dwell, you can use our inbox to send emails to leads and automatically link conversations to leads directly from Dwell.</p>
      <PrimaryButton onClick={() => push(`/${property.external_id}/settings`, { tab: 2 })}>
        <span>+</span> Get started
      </PrimaryButton>
    </EmptyContent>
  );
  return (
    <React.Fragment>
      {property.nylas_status === '' ? settingNotReady : (
        <React.Fragment>
          {conversations.filter(i => i.lead === leadId).length ? (
            <FollowUpsPanel isLeadPage>
              <Sidebar activeMessageId={activeMessageId} setActiveMessageId={setActiveMessageId} isLeadPage />
              {activeMessageId ? <EmailDetails activeMessageId={activeMessageId} setActiveMessageId={setActiveMessageId} isLeadPage /> : null}
            </FollowUpsPanel>
          ) : emptyContent}
        </React.Fragment>
      )}
      <EmailWindow
        handleClose={() => dispatch(setEmailOpenStatus(false))}
        lead={lead}
      />
    </React.Fragment>
  );
};

export default withRouter(LeadEmails);
