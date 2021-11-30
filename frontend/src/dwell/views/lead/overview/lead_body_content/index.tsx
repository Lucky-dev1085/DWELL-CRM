import React, { FC } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getPropertyId } from 'src/utils';
// TODO Delete this later and related stuff
// import LeadNotes from 'dwell/views/lead/notes';
// import LeadEmails from 'dwell/views/lead/emails';
// import LeadChats from 'dwell/views/lead/chats';
// import LeadCalls from 'dwell/views/lead/calls';
// import LeadSms from 'dwell/views/lead/sms';
import { LeadPanel, NavLine, NavLink, NavLeadTab } from './styles';
import LeadCommunication from './_lead_communication';

interface LeadBodyContentProps extends RouteComponentProps {
  isShared: boolean,
}

const navLinks = [
  { label: 'Activity', path: 'overview' },
  // TODO remove routes
  // { label: 'Notes', path: 'notes' },
  // { label: 'SMS', path: 'sms' }, { label: 'Emails', path: 'emails' },
  // { label: 'Calls', path: 'calls' }, { label: 'Chats', path: 'chats' },
];

const LeadBodyContent: FC<LeadBodyContentProps> = ({ location: { pathname }, history: { push }, isShared }) => {
  const lead = useSelector(state => state.lead.lead);

  const redirect = (tab) => {
    const siteId = getPropertyId();
    push({ pathname: tab === 'overview' ? `/${siteId}/leads/${lead.id}` : `/${siteId}/leads/${lead.id}/${tab}`, state: { alreadyLoaded: true } });
  };

  const isStartedApplication = false; // TODO add logic for start lease applicant for view tabs

  const renderCurrentPage = () => {
    const path = pathname.split('/').pop();
    const tab = Number(path) ? 'Communication' : (navLinks.find(el => el.path === path) || {}).label;
    switch (tab) {
      case 'Communication':
        return <LeadCommunication isShared={isShared} isLeaseStart={isStartedApplication} />;
      // TODO Delete this later and related stuff
      // case 'Notes':
      //   return <LeadNotes />;
      // case 'Emails':
      //   return <LeadEmails />;
      // case 'Chats':
      //   return <LeadChats />;
      // case 'Calls':
      //   return <LeadCalls />;
      // case 'SMS':
      //   return <LeadSms />;
      default:
        return null;
    }
  };
  const routes = pathname.split('/');

  return (
    <LeadPanel>
      <NavLeadTab hidden={!isStartedApplication}>
        <NavLine >
          {navLinks.map((item, index) => (
            <NavLink
              key={index}
              onClick={() => redirect(item.path)}
              className={item.path === pathname.split('/').pop() || (item.path === 'overview' && routes[routes.length - 2] === 'leads') ? 'active' : ''}
            >
              {item.label}
            </NavLink>
          ))}
        </NavLine>
      </NavLeadTab>
      {renderCurrentPage()}
    </LeadPanel>
  );
};

export default withRouter(LeadBodyContent);
