import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Calls from 'dwell/views/calls';
import { EmptyContent } from 'styles/common';
import { isEmpty } from 'lodash';

const LeadCalls: FC<RouteComponentProps> = ({ location: { pathname } }) => {
  const [leadId, setLeadId] = useState(null);

  const calls = useSelector(state => state.call.calls);

  useEffect(() => {
    const pathItems = pathname.split('/');
    setLeadId(parseInt(pathItems[pathItems.length - 2], 10));
  }, []);

  const emptyContent = (
    <React.Fragment>
      <EmptyContent>
        <i className="ri-phone-line" />
        <h5><span>No calls activity yet</span></h5>
        <p>When leads make calls to your property, we'll show the call details here.</p>
      </EmptyContent>
    </React.Fragment>
  );

  return (
    <>
      {leadId && !isEmpty(calls) && <Calls leadId={leadId} />}
      {leadId && isEmpty(calls) && emptyContent}
    </>
  );
};

export default withRouter(LeadCalls);
