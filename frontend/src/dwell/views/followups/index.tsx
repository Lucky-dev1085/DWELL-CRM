import React, { FC, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import actions from 'dwell/actions';
import 'src/scss/pages/_leads_list.scss';
import 'src/scss/pages/_followups.scss';
import 'spinkit/css/spinkit.css';
import { EmptyContent, PrimaryButton } from 'styles/common';
import { FollowUpsPanel } from 'dwell/views/followups/styles';
import Sidebar from './_sidebar';
import EmailDetails from './_details';

interface FollowupsProps extends RouteComponentProps{
  property: { nylas_status: string, external_id: string },
  isLoaded: boolean,
}

const Followups: FC<FollowupsProps> = ({ history: { push }, property,
  isLoaded }) => {
  const [activeMessageId, setActiveMessageId] = useState(null);

  return (
    <React.Fragment>
      <Helmet>
        <title>DWELL | Followups</title>
      </Helmet>
      {(property.nylas_status === '') ?
        <EmptyContent>
          <i className="ri-team-line" />
          <h5><span>Enable Dwell Followups</span></h5>
          <p className="text-center">When you sync your work email account with Dwell, you can use our inbox to send emails to leads <br />
            and automatically link conversations to leads directly from Dwell.
          </p>
          <PrimaryButton onClick={() => push(`/${property.external_id}/settings`, { tab: 2 })}>
            <span>+</span> Get started
          </PrimaryButton>
        </EmptyContent> :
        <React.Fragment>
          <FollowUpsPanel>
            <Sidebar activeMessageId={activeMessageId} setActiveMessageId={setActiveMessageId} />
            {activeMessageId || !isLoaded ? <EmailDetails activeMessageId={activeMessageId} setActiveMessageId={setActiveMessageId} /> : null}
          </FollowUpsPanel>
        </React.Fragment>
      }
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  isLoaded: state.emailMessage.isLoaded,
  property: state.property.property,
});

export default connect(
  mapStateToProps,
  {
    ...actions.emailMessage,
    ...actions.user,
    ...actions.lead,
    ...actions.nylas,
    ...actions.property,
    ...actions.pusher,
  },
)(withRouter(Followups));
