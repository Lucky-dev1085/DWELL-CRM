import React from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { Helmet } from 'react-helmet';
import { SiteSideBar } from 'site/components/common';
import { ContentBodySite, SiteBody, ContentLabel } from 'site/views/site_contents/styles';
import CompanyPolicies from './company_policies';

const HobbesSettings = (): JSX.Element => (
  <ContentBodySite>
    <Helmet>
      <title>DWELL | Hobbes Settings</title>
    </Helmet>
    <SiteSideBar>
      <ContentLabel>Hobbes Settings</ContentLabel>
      <ListGroup id="list-tab" role="tablist">
        <ListGroupItem action active>
          <i className="ri-home-4-fill" />
          Company Policies
        </ListGroupItem>
      </ListGroup>
    </SiteSideBar>
    <SiteBody>
      <CompanyPolicies />
    </SiteBody>
  </ContentBodySite>
);

export default HobbesSettings;
