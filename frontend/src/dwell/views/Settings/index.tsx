import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { client, build } from 'dwell/constants/paths/index';
import { getPropertyId } from 'src/utils';
import { connect } from 'react-redux';
import { ContainerFluid } from 'styles/common';
import {
  ContentBody,
  ContentHeader,
  ContentLabel,
  ContentTitle, MainDivider, MenuIcon, SettingsBody,
  SettingsNav, SettingsNavItem,
  SettingsSidebar,
} from 'dwell/views/Settings/styles';
import { roleTypes } from 'site/constants';
import CommonTemplateSettings from './Templates';
import AssignLeadOwners from './AssignLeadOwners';
import EmailSettings from './EmailSettings/index';
import PaidSources from './PaidSources';
import Competitor from './Competitors';
import PaidSourcesBudget from './PaidSourcesBudget';
import RentSurvey from './RentSurveys';
import BusinessHours from './BusinessHours';
import LeaseDefaults from './LeaseDefaults';
import PropertyPolices from './PropertyPolices';
import RentableItems from './RentableItems';
import TourOptions from './TourOptions';
import DurationPricing from './DurationPricing';

const getTabFromRoute = (route) => {
  const routes = [
    client.SETTINGS.ASSIGN_LEAD_OWNERS,
    client.SETTINGS.LIST_TEMPLATE,
    client.SETTINGS.EMAIL_SYNC,
    client.SETTINGS.PAID_SOURCES,
    client.SETTINGS.COMPETITORS,
    client.SETTINGS.BUSINESS_HOURS,
    client.SETTINGS.LIST_RENT_SURVEY,
    client.SETTINGS.LIST_PAID_SOURCE_BUDGET,
    client.SETTINGS.LEASE_DEFAULTS,
    client.SETTINGS.PROPERTY_POLICIES,
    client.SETTINGS.RENTABLE_ITEMS,
    client.SETTINGS.TOUR_OPTIONS,
    client.SETTINGS.CHAT_LIST_TEMPLATE,
    client.SETTINGS.DURATION_PRICING,
  ].map(r => build(r, getPropertyId()));

  return routes.indexOf(route) || 0;
};

interface RouteProps {
  tab?: string,
  isNewPaidSource?: boolean,
  isNewCompetitor?: boolean,
}

interface SettingsProps extends RouteComponentProps<unknown, unknown, RouteProps> {
  currentUser: { role: string },
}

const Settings: FC<SettingsProps> = ({ location: { state, pathname }, history: { push }, currentUser }) => {
  const [activeTab, setActiveTab] = useState(getTabFromRoute(pathname));
  const [isShowPaidSource, setIsShowPaidSource] = useState(false);
  const [isShowCompetitor, setIsShowCompetitor] = useState(false);

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  useEffect(() => {
    if (state && state.tab !== undefined) {
      toggle(state.tab);
      if (state.isNewPaidSource) {
        setIsShowPaidSource(true);
      }
      if (state.isNewCompetitor) {
        setIsShowCompetitor(true);
      }
    }
  }, []);

  const redirect = (view, tab) => {
    const siteId = getPropertyId();
    push({ pathname: build(view, siteId), state: { tab } });
  };
  const isGenericAdmin = currentUser.role === roleTypes.GENERIC_ADMIN;
  return (
    <React.Fragment>
      <ContainerFluid fluid>
        <Helmet>
          <title>DWELL | Settings</title>
        </Helmet>
        <ContentHeader><ContentTitle> Property Settings </ContentTitle></ContentHeader>
        <ContentBody>
          <SettingsSidebar>
            <ContentLabel>General Settings</ContentLabel>
            <SettingsNav>
              <SettingsNavItem onClick={() => redirect(client.SETTINGS.ASSIGN_LEAD_OWNERS, 0)} active={activeTab === 0} ><MenuIcon className="ri-shield-user-line" /> Assign lead owners</SettingsNavItem>
              <SettingsNavItem onClick={() => redirect(client.SETTINGS.LIST_TEMPLATE, 1)} active={activeTab === 1} ><MenuIcon className="ri-mail-line" /> Email templates</SettingsNavItem>
              <SettingsNavItem onClick={() => redirect(client.SETTINGS.CHAT_LIST_TEMPLATE, 12)} active={activeTab === 12} ><MenuIcon className="ri-chat-4-line" /> Chat templates</SettingsNavItem>
              <SettingsNavItem onClick={() => redirect(client.SETTINGS.EMAIL_SYNC, 2)} active={activeTab === 2} ><MenuIcon className="ri-calendar-todo-line" /> Email & Calendar sync</SettingsNavItem>
              <SettingsNavItem onClick={() => redirect(client.SETTINGS.BUSINESS_HOURS, 5)} active={activeTab === 5} ><MenuIcon className="ri-time-line" /> Business hours</SettingsNavItem>
              <SettingsNavItem className="mb-0" onClick={() => redirect(client.SETTINGS.TOUR_OPTIONS, 11)} active={activeTab === 11} ><MenuIcon className="ri-home-4-line" /> Tour Options</SettingsNavItem>
            </SettingsNav>
            <MainDivider />
            <ContentLabel>Report Settings</ContentLabel>
            <SettingsNav>
              {/* <SettingsNavItem onClick={() => redirect(client.SETTINGS.LIST_RENT_SURVEY, 6)} active={activeTab === 6} ><MenuIcon className="ri-survey-line" />Rent surveys</SettingsNavItem> */}
              <SettingsNavItem onClick={() => redirect(client.SETTINGS.COMPETITORS, 4)} active={activeTab === 4} ><MenuIcon className="ri-group-line" /> Market Environment</SettingsNavItem>
              <SettingsNavItem onClick={() => redirect(client.SETTINGS.PAID_SOURCES, 3)} active={activeTab === 3} ><MenuIcon className="ri-wallet-3-line" /> Paid sources</SettingsNavItem>
              <SettingsNavItem className="mb-0" onClick={() => redirect(client.SETTINGS.LIST_PAID_SOURCE_BUDGET, 7)} active={activeTab === 7} ><MenuIcon className="ri-bank-card-2-line" />Paid source budgets</SettingsNavItem>
            </SettingsNav>
            <MainDivider />
            {!isGenericAdmin && (
              <React.Fragment>
                <ContentLabel>Leasing</ContentLabel>
                <SettingsNav>
                  <SettingsNavItem onClick={() => redirect(client.SETTINGS.LEASE_DEFAULTS, 8)} action active={activeTab === 8}><MenuIcon className="ri-community-line" />Lease Defaults</SettingsNavItem>
                  <SettingsNavItem onClick={() => redirect(client.SETTINGS.PROPERTY_POLICIES, 9)} action active={activeTab === 9}><MenuIcon className="ri-article-line" />Property Policies</SettingsNavItem>
                  <SettingsNavItem onClick={() => redirect(client.SETTINGS.RENTABLE_ITEMS, 10)} action active={activeTab === 10}><MenuIcon className="ri-handbag-line" />Rentable Items</SettingsNavItem>
                  <SettingsNavItem className="mb-0" onClick={() => redirect(client.SETTINGS.DURATION_PRICING, 14)} action active={activeTab === 14}><MenuIcon className="ri-community-line" />Duration Pricing</SettingsNavItem>
                </SettingsNav>
              </React.Fragment>
            )}
          </SettingsSidebar>
          <SettingsBody>
            {activeTab === 0 && <AssignLeadOwners />}
            {activeTab === 1 && <CommonTemplateSettings templateType="Email" />}
            {activeTab === 2 && <EmailSettings />}
            {activeTab === 3 && <PaidSources isShow={isShowPaidSource} setIsShow={setIsShowPaidSource} settingsActiveTab={activeTab} tab={3} />}
            {activeTab === 4 && <Competitor isShow={isShowCompetitor} setIsShow={setIsShowCompetitor} settingsActiveTab={activeTab} tab={4} />}
            {activeTab === 5 && <BusinessHours />}
            {activeTab === 6 && <RentSurvey />}
            {activeTab === 7 && <PaidSourcesBudget />}
            {!isGenericAdmin && activeTab === 8 && <LeaseDefaults />}
            {!isGenericAdmin && activeTab === 9 && <PropertyPolices />}
            {!isGenericAdmin && activeTab === 10 && <RentableItems />}
            {activeTab === 11 && <TourOptions />}
            {activeTab === 12 && <CommonTemplateSettings templateType="Chat" />}
            {!isGenericAdmin && activeTab === 14 && <DurationPricing />}
          </SettingsBody>
        </ContentBody>
      </ContainerFluid>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
});

export default connect(
  mapStateToProps,
  {},
)(withRouter(Settings));
