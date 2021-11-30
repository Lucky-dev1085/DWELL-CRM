import React from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { Helmet } from 'react-helmet';
import { ContentBodySite, SiteBody } from 'site/views/site_contents/styles';
import { SiteSideBarSkeleton, CardSkeleton } from './styles';

const SkeletonLoader = (): JSX.Element => (
  <ContentBodySite>
    <Helmet>
      <title>DWELL | Site Contents</title>
    </Helmet>
    <SiteSideBarSkeleton>
      <ListGroup>
        {new Array(11).fill('').map((i, key) => (<ListGroupItem key={key} />))}
      </ListGroup>
    </SiteSideBarSkeleton>
    <SiteBody>
      {new Array(4).fill('').map((i, key) => (<CardSkeleton key={key} />))}
    </SiteBody>
  </ContentBodySite>
);

export default SkeletonLoader;
