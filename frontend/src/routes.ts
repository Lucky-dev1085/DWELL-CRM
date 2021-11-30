import loadable from '@loadable/component';
import Loader from 'dwell/components/Loader';

import { paths } from 'dwell/constants';

const LeadsTable = loadable(() =>
  import('./dwell/views/pipeline'), {
  fallback: Loader,
});

const LeadOverview = loadable(() =>
  import('./dwell/views/lead/overview'), {
  fallback: Loader,
});

const TasksList = loadable(() =>
  import('./dwell/views/tasks'), {
  fallback: Loader,
});

const Settings = loadable(() =>
  import('./dwell/views/Settings'), {
  fallback: Loader,
});

const TemplateCreation = loadable(() =>
  import('./dwell/views/Settings/Templates/TemplateCreation'), {
  fallback: Loader,
});

const TemplateEditing = loadable(() =>
  import('./dwell/views/Settings/Templates/TemplateEditing'), {
  fallback: Loader,
});

const NylasIntegration = loadable(() =>
  import('./dwell/views/nylas_integration'), {
  fallback: Loader,
});

const Followups = loadable(() =>
  import('./dwell/views/followups'), {
  fallback: Loader,
});

const BulkEmail = loadable(() =>
  import('./dwell/views/bulk_email'), {
  fallback: Loader,
});

const Reports = loadable(() =>
  import('./dwell/views/Reports'), {
  fallback: Loader,
});

const Calls = loadable(() =>
  import('./dwell/views/calls'), {
  fallback: Loader,
});

const Chats = loadable(() =>
  import('./dwell/views/chats'), {
  fallback: Loader,
});

const ChatEvaluation = loadable(() =>
  import('./dwell/views/chats/evaluation'), {
  fallback: Loader,
});

const ChatEvaluationReport = loadable(() =>
  import('./dwell/views/chats/report'), {
  fallback: Loader,
});

const RentSurvey = loadable(() =>
  import('./dwell/views/Settings/RentSurveys/RentSurveysForm'), {
  fallback: Loader,
});

const PaidSourceBudget = loadable(() =>
  import('./dwell/views/Settings/PaidSourcesBudget/PaidSourcesBudgetForm'), {
  fallback: Loader,
});

const MultiChat = loadable(() =>
  import('./dwell/views/chat/multi_chat'), {
  fallback: Loader,
});

const SiteContent = loadable(() =>
  import('./site/views/site_contents'), {
  fallback: Loader,
});

const Users = loadable(() =>
  import('./site/views/users'), {
  fallback: Loader,
});

const Customers = loadable(() =>
  import('./site/views/customers'), {
  fallback: Loader,
});

const Clients = loadable(() =>
  import('./site/views/clients'), {
  fallback: Loader,
});

const Properties = loadable(() =>
  import('./site/views/properties'), {
  fallback: Loader,
});

const HobbesSettings = loadable(() =>
  import('./site/views/hobbes_settings'), {
  fallback: Loader,
});

const CompeteHome = loadable(() =>
  import('./compete/views/home'), {
  fallback: Loader,
});

const CompetePropertyReport = loadable(() =>
  import('./compete/views/property_report'), {
  fallback: Loader,
});

const CompeteSubmarketReport = loadable(() =>
  import('./compete/views/submarket_report'), {
  fallback: Loader,
});

const CompeteMarketReport = loadable(() =>
  import('./compete/views/market_report'), {
  fallback: Loader,
});

const CompeteComparisonReport = loadable(() =>
  import('./compete/views/comparison_report'), {
  fallback: Loader,
});

const CompeteAlertsSubscriptions = loadable(() =>
  import('./compete/views/alerts_subscriptions'), {
  fallback: Loader,
});

const CompeteAlertsSummary = loadable(() =>
  import('./compete/views/alerts_summary'), {
  fallback: Loader,
});

const CompeteAlertsLog = loadable(() =>
  import('./compete/views/alert_log'), {
  fallback: Loader,
});

export const dwellRoutes = [
  { path: paths.client.LEADS.VIEW, name: 'Leads', component: LeadsTable, exact: true },
  { path: paths.client.LEADS.OVERVIEW, name: 'Lead Overview', component: LeadOverview, exact: true, leadDetail: true },
  { path: paths.client.LEADS.NOTES, name: 'Lead  Note', component: LeadOverview, exact: true, leadDetail: true },
  { path: paths.client.LEADS.CALLS, name: 'Lead Calls', component: LeadOverview, exact: true, leadDetail: true },
  { path: paths.client.LEADS.EMAILS, name: 'Lead Emails', component: LeadOverview, exact: true, leadDetail: true },
  { path: paths.client.LEADS.CHATS, name: 'Lead Chats', component: LeadOverview, exact: true, leadDetail: true },
  { path: paths.client.LEADS.SMS, name: 'Lead SMS', component: LeadOverview, exact: true, leadDetail: true },
  { path: paths.client.TASKS, name: 'Tasks', component: TasksList, exact: true },
  { path: paths.client.SETTINGS.VIEW, name: 'Settings', component: Settings, exact: true },
  { path: paths.client.SETTINGS.ASSIGN_LEAD_OWNERS, name: 'Assign Lead Owners', component: Settings, exact: true },
  { path: paths.client.SETTINGS.LIST_TEMPLATE, name: 'Email Templates', component: Settings, exact: true },
  { path: paths.client.SETTINGS.NEW_TEMPLATE, name: 'New Template', component: TemplateCreation, exact: true },
  { path: paths.client.SETTINGS.EDIT_TEMPLATE, name: 'Edit Template', component: TemplateEditing, exact: true },
  { path: paths.client.SETTINGS.CHAT_LIST_TEMPLATE, name: 'Chat Templates', component: Settings, exact: true },
  { path: paths.client.SETTINGS.EMAIL_SYNC, name: 'Email Sync', component: Settings, exact: true },
  { path: paths.client.SETTINGS.PAID_SOURCES, name: 'Paid Sources', component: Settings, exact: true },
  { path: paths.client.SETTINGS.COMPETITORS, name: 'Competitors', component: Settings, exact: true },
  { path: paths.client.SETTINGS.BUSINESS_HOURS, name: 'Business Hours', component: Settings, exact: true },
  { path: paths.client.SETTINGS.LEASE_DEFAULTS, name: 'Lease Defaults', component: Settings, exact: true },
  { path: paths.client.SETTINGS.PROPERTY_POLICIES, name: 'Property Polices', component: Settings, exact: true },
  { path: paths.client.SETTINGS.RENTABLE_ITEMS, name: 'Rentable Items', component: Settings, exact: true },
  { path: paths.client.SETTINGS.TOUR_OPTIONS, name: 'Tour Options', component: Settings, exact: true },
  { path: paths.client.SETTINGS.DURATION_PRICING, name: 'Duration Pricing', component: Settings, exact: true },
  { path: paths.client.NYLAS_INTEGRATION, name: 'Nylas Integration', component: NylasIntegration },
  { path: paths.client.FOLLOWUPS.VIEW, name: 'Followups', component: Followups, exact: true },
  { path: paths.client.BULK_EMAIL, name: 'Bulk Email', component: BulkEmail, exact: true },
  { path: paths.client.REPORTS.BASIC, name: 'Reports', component: Reports, exact: true },
  { path: paths.client.REPORTS.ADVANCED, name: 'Reports', component: Reports, exact: true },
  { path: paths.client.CALLS, name: 'Calls', component: Calls, exact: true },
  { path: paths.client.SETTINGS.LIST_PAID_SOURCE_BUDGET, name: 'Paid Source Budgets', component: Settings, exact: true },
  { path: paths.client.SETTINGS.NEW_PAID_SOURCE_BUDGET, name: 'New Paid Source Budget', component: PaidSourceBudget, exact: true },
  { path: paths.client.SETTINGS.EDIT_PAID_SOURCE_BUDGET, name: 'Edit Paid Source Budget', component: PaidSourceBudget, exact: true },
  { path: paths.client.SETTINGS.LIST_RENT_SURVEY, name: 'Rent Surveys', component: Settings, exact: true },
  { path: paths.client.SETTINGS.NEW_RENT_SURVEY, name: 'New Rent Survey', component: RentSurvey, exact: true },
  { path: paths.client.SETTINGS.EDIT_RENT_SURVEY, name: 'Edit Rent Survey', component: RentSurvey, exact: true },
  { path: paths.client.MULTI_CHAT, name: 'Multi Chat', component: MultiChat, exact: true },
];

export const siteRoutes = [
  { path: paths.client.SITE_CONTENT.HOME, name: 'Home', component: SiteContent, exact: true },
  { path: paths.client.SITE_CONTENT.GALLERY, name: 'Gallery', component: SiteContent, exact: true },
  { path: paths.client.SITE_CONTENT.FLOOR_PLANS, name: 'Floor Plans', component: SiteContent, exact: true },
  { path: paths.client.SITE_CONTENT.AMENITIES, name: 'Amenities', component: SiteContent, exact: true },
  { path: paths.client.SITE_CONTENT.NEIGHBORHOOD, name: 'Neighborhood', component: SiteContent, exact: true },
  { path: paths.client.SITE_CONTENT.VIRTUAL_TOUR, name: 'Virtual Tour', component: SiteContent, exact: true },
  { path: paths.client.SITE_CONTENT.CONTACT, name: 'Contact', component: SiteContent, exact: true },
  { path: paths.client.SITE_CONTENT.FOOTER, name: 'Footer', component: SiteContent, exact: true },
  { path: paths.client.SITE_CONTENT.DESIGN, name: 'Design', component: SiteContent, exact: true },
  { path: paths.client.SITE_CONTENT.MISC, name: 'MISC', component: SiteContent, exact: true },
  { path: paths.client.SITE_CONTENT.PROMOTIONS, name: 'Promotions', component: SiteContent, exact: true },
];

export const manageRoutes = [
  { path: paths.client.MANAGE_USERS, name: 'Manage Users', component: Users, exact: true },
  { path: paths.client.MANAGE_CUSTOMERS, name: 'Manage Customers', component: Customers, exact: true },
  { path: paths.client.MANAGE_CLIENTS, name: 'Manage Clients', component: Clients, exact: true },
  { path: paths.client.MANAGE_PROPERTIES, name: 'Manage Properties', component: Properties, exact: true },
];

export const hobbesSettings = [
  { path: paths.client.HOBBES_SETTINGS, name: 'Hobbes Settings', component: HobbesSettings, exact: true },
];

export const compete = [
  { path: paths.client.COMPETE.HOME, name: 'Compete', component: CompeteHome, exact: true },
  { path: paths.client.COMPETE.PROPERTY_REPORT, name: 'Property Report', component: CompetePropertyReport, exact: true },
  { path: paths.client.COMPETE.SUBMARKET_REPORT, name: 'Submarket Report', component: CompeteSubmarketReport, exact: true },
  { path: paths.client.COMPETE.MARKET_REPORT, name: 'Market Report', component: CompeteMarketReport, exact: true },
  { path: paths.client.COMPETE.COMPARISON_REPORT, name: 'Comparison', component: CompeteComparisonReport, exact: true },
  { path: paths.client.COMPETE.COMPARISON_REPORT_ID, name: 'Report', component: CompeteComparisonReport, exact: true },
  { path: paths.client.COMPETE.ALERTS_SUBSCRIPTIONS, name: 'Alerts', component: CompeteAlertsSubscriptions, exact: true },
  { path: paths.client.COMPETE.ALERTS_SUMMARY, name: 'Summary', component: CompeteAlertsSummary, exact: true },
  { path: paths.client.COMPETE.ALERTS_LOG, name: 'Log', component: CompeteAlertsLog, exact: true },
];

export const chatsRoutes = [
  { path: paths.client.CHATS.OVERVIEW, name: 'Chats Overview', component: Chats, exact: true },
  { path: paths.client.CHATS.EVALUATION, name: 'Evaluation', component: ChatEvaluation, exact: true },
  { path: paths.client.CHATS.REPORT, name: 'Report', component: ChatEvaluationReport, exact: true },
];

const routes = [
  ...dwellRoutes.map(i => ({ ...i, isDwell: true })),
  ...siteRoutes.map(i => ({ ...i, isSite: true })),
  ...manageRoutes,
  ...hobbesSettings,
  ...compete,
  ...chatsRoutes,
];

export default routes;
