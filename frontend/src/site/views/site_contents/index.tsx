import React, { useEffect, useState, FC } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { ListGroup, ListGroupItem, Button } from 'reactstrap';
import NavigationPrompt from 'react-router-navigation-prompt';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { paths } from 'dwell/constants';
import { roleTypes } from 'site/constants';
import actions from 'site/actions';
import { getPropertyId } from 'src/utils';
import { SiteSideBar, SiteSavePanel, Spinner } from 'site/components/common';
import { ContentBodySite, SiteBody, ContentLabel } from 'site/views/site_contents/styles';
import { LeaveModal } from 'site/components';
import FooterPage from './footer';
import ContactPage from './contact';
import VirtualTourPage from './virtual_tour';
import SeoPage from './seo';
import DesignPage from './design';
import NeighborHood from './neighborhood';
import AmenitiesPage from './amenities';
import FloorPlansPage from './floor_plans';
import GalleryPage from './gallery';
import HomePage from './home';
import PromotionPage from './promotions';

const getTabFromRoute = (route) => {
  const routes = [
    paths.client.SITE_CONTENT.HOME,
    paths.client.SITE_CONTENT.PROMOTIONS,
    paths.client.SITE_CONTENT.GALLERY,
    paths.client.SITE_CONTENT.FLOOR_PLANS,
    paths.client.SITE_CONTENT.AMENITIES,
    paths.client.SITE_CONTENT.VIRTUAL_TOUR,
    paths.client.SITE_CONTENT.NEIGHBORHOOD,
    paths.client.SITE_CONTENT.CONTACT,
    paths.client.SITE_CONTENT.FOOTER,
    paths.client.SITE_CONTENT.DESIGN,
    paths.client.SITE_CONTENT.MISC,
  ].map(r => paths.build(r, getPropertyId()));

  return routes.indexOf(route) || 0;
};

interface SiteContentProps extends RouteComponentProps {
  location: { pathname: string, state: { tab: string }, hash: string, search: string },
  formChanged: boolean,
  setSubmissionState: (isClick: boolean) => void,
  setChangedState: (state: boolean) => void,
  submitClicked: boolean,
  currentUser: { role: string },
}

const SiteContent: FC<SiteContentProps> = ({ location: { state, pathname }, history: { push }, formChanged, submitClicked, setSubmissionState, setChangedState, currentUser }) => {
  const [activeTab, setActiveTab] = useState(getTabFromRoute(pathname));
  const [clickedType, updateClickType] = useState({ type: '' });
  const [isError, toggleError] = useState(false);
  const isPropertyManager = currentUser.role === roleTypes.PROPERTY_ADMIN;

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  useEffect(() => {
    if (state && state.tab !== undefined) {
      toggle(state.tab);
    }
    setChangedState(false);
    setSubmissionState(false);

    if (isPropertyManager) {
      setActiveTab(1);
    }
  }, []);

  const redirect = (view, tab) => {
    const siteId = getPropertyId();
    push({ pathname: paths.build(view, siteId), state: { tab } });
  };

  const handleClick = (type) => {
    updateClickType({ type });
    if (type === 'submit') {
      setSubmissionState(true);
    }
  };

  const handleError = (error) => {
    toggleError(error);
  };

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 0:
        return <HomePage clickedType={clickedType} handleError={handleError} />;
      case 1:
        return <PromotionPage />;
      case 2:
        return <GalleryPage clickedType={clickedType} handleError={handleError} />;
      case 3:
        return <FloorPlansPage clickedType={clickedType} handleError={handleError} />;
      case 4:
        return <AmenitiesPage clickedType={clickedType} handleError={handleError} />;
      case 5:
        return <VirtualTourPage clickedType={clickedType} handleError={handleError} />;
      case 6:
        return <NeighborHood clickedType={clickedType} handleError={handleError} />;
      case 7:
        return <ContactPage clickedType={clickedType} handleError={handleError} />;
      case 8:
        return <FooterPage clickedType={clickedType} />;
      case 9:
        return <DesignPage clickedType={clickedType} />;
      case 10:
        return <SeoPage clickedType={clickedType} handleError={handleError} />;
      default:
        return null;
    }
  };

  return (
    <ContentBodySite>
      <Helmet>
        <title>DWELL | Site Contents</title>
      </Helmet>
      {!isPropertyManager &&
        <SiteSideBar>
          <ContentLabel>Site Contents</ContentLabel>
          <ListGroup id="list-tab" role="tablist">
            <ListGroupItem
              onClick={() => redirect(paths.client.SITE_CONTENT.HOME, 0)}
              action
              active={activeTab === 0}
            >
              <i className={`ri-home-4-${activeTab === 0 ? 'fill' : 'line'}`} />
              Home
            </ListGroupItem>
            <ListGroupItem
              onClick={() => redirect(paths.client.SITE_CONTENT.PROMOTIONS, 1)}
              action
              active={activeTab === 1}
            >
              <i className={`ri-award-${activeTab === 1 ? 'fill' : 'line'}`} />
              Promotions
            </ListGroupItem>
            <ListGroupItem
              onClick={() => redirect(paths.client.SITE_CONTENT.GALLERY, 2)}
              action
              active={activeTab === 2}
            >
              <i className={`ri-image-${activeTab === 2 ? 'fill' : 'line'}`} />
              Gallery
            </ListGroupItem>
            <ListGroupItem
              onClick={() => redirect(paths.client.SITE_CONTENT.FLOOR_PLANS, 3)}
              action
              active={activeTab === 3}
            >
              <i className={`ri-stack-${activeTab === 3 ? 'fill' : 'line'}`} />
              Floor Plans
            </ListGroupItem>
            <ListGroupItem
              onClick={() => redirect(paths.client.SITE_CONTENT.AMENITIES, 4)}
              action
              active={activeTab === 4}
            >
              <i className={`ri-home-gear-${activeTab === 4 ? 'fill' : 'line'}`} />
              Amenities
            </ListGroupItem>
            <ListGroupItem
              onClick={() => redirect(paths.client.SITE_CONTENT.VIRTUAL_TOUR, 5)}
              action
              active={activeTab === 5}
            >
              <i className={`ri-computer-${activeTab === 5 ? 'fill' : 'line'}`} />
              Virtual Tour
            </ListGroupItem>
            <ListGroupItem
              onClick={() => redirect(paths.client.SITE_CONTENT.NEIGHBORHOOD, 6)}
              action
              active={activeTab === 6}
            >
              <i className={`ri-home-smile-2-${activeTab === 6 ? 'fill' : 'line'}`} />
              Neighborhood
            </ListGroupItem>
            <ListGroupItem
              onClick={() => redirect(paths.client.SITE_CONTENT.CONTACT, 7)}
              action
              active={activeTab === 7}
            >
              <i className={`ri-contacts-book-${activeTab === 7 ? 'fill' : 'line'}`} />
              Contact
            </ListGroupItem>
            <ListGroupItem
              onClick={() => redirect(paths.client.SITE_CONTENT.FOOTER, 8)}
              action
              active={activeTab === 8}
            >
              <i className={`ri-layout-bottom-${activeTab === 8 ? 'fill' : 'line'}`} />
              Footer
            </ListGroupItem>
            <ListGroupItem
              onClick={() => redirect(paths.client.SITE_CONTENT.DESIGN, 9)}
              action
              active={activeTab === 9}
            >
              <i className={`ri-brush-4-${activeTab === 9 ? 'fill' : 'line'}`} />
              Design
            </ListGroupItem>
            <ListGroupItem
              onClick={() => redirect(paths.client.SITE_CONTENT.MISC, 10)}
              action
              active={activeTab === 10}
            >
              <i className={`ri-file-list-${activeTab === 10 ? 'fill' : 'line'}`} />
              MISC
            </ListGroupItem>
          </ListGroup>
        </SiteSideBar>}
      <SiteBody>
        {formChanged && (
          <NavigationPrompt when beforeConfirm={() => handleClick('submit')}>
            {({ onConfirm, onCancel }) => (
              <LeaveModal
                onConfirm={onConfirm}
                onCancel={onCancel}
              />
            )}
          </NavigationPrompt>
        )}
        {renderCurrentPage()}
        <SiteSavePanel show={formChanged}>
          <Button color="primary" onClick={() => handleClick('submit')} disabled={submitClicked && !isError}>
            <span>Save changes</span>
            <span>
              <Spinner role="status" aria-hidden="true" /> Saving...
            </span>
            <span><i className="ri-checkbox-circle-fill" /> Saved</span>
          </Button>
          <Button color="secondary" onClick={() => handleClick('discard')}>
            Discard
          </Button>
        </SiteSavePanel>
      </SiteBody>
    </ContentBodySite>
  );
};

const mapStateToProps = state => ({
  formChanged: state.pageData.formChanged,
  submitClicked: state.pageData.submitClicked,
  currentUser: state.user.currentUser,
});

export default connect(mapStateToProps, { ...actions.pageData, ...actions.tooltips })(withRouter(SiteContent));
