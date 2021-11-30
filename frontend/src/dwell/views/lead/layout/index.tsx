import React, { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import actions from 'dwell/actions';
import { Helmet } from 'react-helmet';
import 'src/scss/pages/_lead_details.scss';
import { isEmpty } from 'codemirror/src/util/misc';
import { getPropertyId } from 'src/utils';
// import LeadNavBar from './nav';
import { LeadDetailMain, LeadDetailHeader } from './styles';
import KeyInfo from './key_info';
import { getLeadId } from './utils';

interface LeadProps {
  id: number,
  first_name: string,
  last_name: string,
  stage: string,
  owner: string,
  move_in_date: Date,
  status: string,
  next_lead: LeadProps,
  prev_lead: LeadProps
}

interface UserProps {
  id: number,
  first_name: string,
  last_name: string,
}

interface PropertyProps {
  id: number,
  users: Array<UserProps>
  external_id: string,
}

interface LeadDetailLayoutProps extends RouteComponentProps {
  lead: LeadProps,
  location: {pathname: string, state: string, hash: string, search: string }
  getLeadById: (leadId: number, shared: {shared: boolean}) => void,
  updateLeadById: (leadId: number, params: LeadProps) => Promise<void>,
  deleteLeadById: (leadId: number) => null,
  children: React.ReactNode,
  property: PropertyProps,
}

interface StateProps {
  alreadyLoaded: boolean,
}

const LeadDetailLayout: FC<LeadDetailLayoutProps> = ({ location: { pathname, hash, state }, getLeadById, updateLeadById,
  lead, property, children }) => {
  const [isShared, setIsShared] = useState(false);
  const [label, setLabel] = useState('shared');
  const loadLeadDetails = () => {
    setIsShared(hash.includes('shared') || hash.includes('transferred'));
    if (hash.includes('transferred')) {
      setLabel('transferred');
    }

    const { alreadyLoaded } = (state || {}) as StateProps;
    if (!lead.id || !alreadyLoaded) {
      getLeadById(getLeadId(pathname), { shared: hash.includes('shared') || hash.includes('transferred') });
    }
  };

  useEffect(() => {
    if (pathname.split('/')[1] === getPropertyId()) {
      loadLeadDetails();
    }
  }, [pathname]);

  const handleSave = (params) => {
    updateLeadById(lead.id, params);
  };

  // const handleDelete = () => deleteLeadById(lead.id);

  return (
    <LeadDetailMain className="lead-details">
      <Helmet>
        <title>{!isEmpty(lead) ? `DWELL | Prospect - ${lead.first_name} ${lead.last_name}` : 'DWELL'}</title>
      </Helmet>
      <LeadDetailHeader>
        <KeyInfo
          lead={lead}
          onSave={handleSave}
          availableOwners={property.users}
          isShared={isShared}
          label={label}
        />
      </LeadDetailHeader>
      {/* TODO move this logic */}
      {/* <LeadNavBar lead={lead} handleSave={handleSave} getLeadById={getLeadById} isShared={isShared} availableOwners={property.users} onDelete={handleDelete} /> */}
      {children}
    </LeadDetailMain>
  );
};

const mapStateToProps = state => ({
  lead: state.lead.lead,
  properties: state.property.properties,
  property: state.property.property,
});

export default connect(
  mapStateToProps,
  {
    ...actions.lead,
    ...actions.pusher,
  },
)(withRouter(LeadDetailLayout));
