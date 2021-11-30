import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import leadAction from 'dwell/actions/lead';
import taskAction from 'dwell/actions/task';
import { getLeadId } from 'dwell/views/lead/layout/utils';
import { LeadOverviewBody, LeadOverviewBodyContainer, LeadOverviewSidebar } from 'dwell/views/lead/overview/styles';
import TasksList from 'dwell/views/lead/overview/tasks';
import ProspectDetails from 'dwell/views/lead/overview/prospect_details';
import LeadBodyContent from 'dwell/views/lead/overview/lead_body_content';

interface LeadOverviewProps extends RouteComponentProps {
  location: {pathname: string, state: { alreadyLoaded: boolean }, hash: string, search: string },
}

const LeadOverview: FC<LeadOverviewProps> = ({ location: { pathname, hash, state } }) => {
  const [leadId, setLeadId] = useState(null);
  const [isShared, setIsShared] = useState(false);

  const dispatch = useDispatch();
  const { updateLeadById, getLeadById } = leadAction;
  const { getLeadTasks } = taskAction;

  useEffect(() => {
    const id = getLeadId(pathname);
    if (id !== leadId) {
      setLeadId(id);
      setIsShared(hash.includes('shared') || hash.includes('transferred'));
      dispatch(getLeadById(id));
    }
  }, [pathname]);

  useEffect(() => {
    if (leadId && (!state || !state.alreadyLoaded)) {
      dispatch(getLeadTasks(leadId));
    }
  }, [leadId]);

  const handleSave = params => dispatch(updateLeadById(leadId, params));

  return (
    <LeadOverviewBodyContainer>
      <LeadOverviewBody>
        <LeadBodyContent isShared={isShared} />
      </LeadOverviewBody>
      <LeadOverviewSidebar id="lead-sidebar">
        <TasksList isShared={isShared} />
        <ProspectDetails onSave={handleSave} isShared={isShared} />
      </LeadOverviewSidebar>
    </LeadOverviewBodyContainer>);
};

export default withRouter(LeadOverview);
