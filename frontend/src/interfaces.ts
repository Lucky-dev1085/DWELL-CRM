import { AxiosInstance } from 'axios';

export interface DetailResponse {
  result: {
    data: {
      id: number,
      count?: number,
      is_cancelled?: boolean,
      date?: string,
    }
  }
}

export interface ListResponse {
  result: {
    data: {
      count: number,
      results: { id: number }[],
      times?: string[],
    }
  }
}

export interface SuccessResponse {
  success: boolean,
}

export interface OnboardResponse {
  result: {
    data: { customer: CustomerProps }
  }
}

export interface ClientProps {
  id?: number,
  name?: string,
  status?: string,
  customers?: number[],
  properties?: PropertyProps[],
  customer?: number,
  useExisting?: string, // it's used for onboard FE only
}

export interface PropertyProps {
  id?: number,
  name?: string,
  domain?: string,
  status?: string,
  useExisting?: string, // it's used for onboard FE only
  users?: UserProps[],
  external_id?: string,
  logo?: string,
  is_email_blast_disabled?: boolean,
  platform?: string,
  client_id?: string,
  customer?: number,
  phone_number?: string,
  tracking_number?: string,
  agent_chat_enabled?: boolean,
  is_call_rescore_required_today?: boolean,
  has_scored_calls_today?: boolean,
  not_scored_calls_count?: number,
  is_call_scoring_submitted_today?: boolean,
  unread_count?: number,
  town?: string,
  city?: string,
  shared_email?: string,
  nylas_status?: string,
  is_booking_enabled?: boolean,
  bedroom_types?: string[],
  tour_types?: string[],
  competitors?: number[],
  market?: number,
  submarket?: number,
  competitor_property?: number,
}

export interface CustomBlob extends Blob {
  name?: string,
  preview?: string,
  lastModifiedDate?: Date,
}

export interface CustomerProps {
  id?: number,
  customer_name?: string,
  logo?: string | CustomBlob,
  logoFile?: CustomBlob,
  useExisting?: string, // it's used for onboard FE only
  user?: UserProps,
  clients?: number[],
  properties?: number[],
  admins?: UserProps[],
  employee?: UserProps[],
  active_properties?: number,
}

export interface PromotionProps {
  id?: number,
  name?: string,
  promotion_text?: string,
  promotion_html?: string,
  button_label?: string,
  is_active?: boolean,
  image?: string,
  lease_duration?: number,
  lease_duration_modifier?: string,
  dollar_value?: number,
  seo_title?: string,
  seo_description?: string,
  floor_plans?: { id: number | string, plan: string }[],
  restriction?: string,
  promotion_title?: string,
  unit_types?: string[] | { label: string, value: string }[],
}

export interface UserProps {
  id?: number,
  first_name?: string,
  last_name?: string,
  phone_number?: string,
  password?: string,
  passwordConfirm?: string,
  email?: string,
  status?: string,
  role?: string,
  clients?: number[],
  properties?: number[],
  client?: string,
  customer?: string,
  customer_admin?: string
  customer_name?: string,
  avatar?: string,
  is_super_customer?: boolean,
  has_advanced_reports_access?: boolean,
  is_call_scorer?: boolean,
  is_chat_reviewer?: boolean,
  is_team_account?: boolean,
  last_property?: number,
}

export interface ScoredCallProps {
  id: number,
  call: number,
  questions: number[],
  omitted_questions: number[]
  agent: number,
  property: number,
}

export interface LostReason {
  external_id: string,
  id?: number,
  name: string,
  property: number,
}

export interface EmailMessageProps {
  id?: number;
  receiver_name?: string,
  receiver_email?: string,
  sender_name?: string,
  sender_email?: string,
  snippet?: string,
  subject?: string,
  is_unread?: boolean,
  lead?: number,
  date?: string,
  body?: string,
  subjectSnippet?: { subject?: string, snippet?: string },
  attachments?: string[]
}

export interface NoteProps {
  id?: number,
  text?: string,
  lead?: number,
  owner?: number,
  mentions?: string[],
  is_followup_note?: boolean,
  transformed_text?: string,
  updated?: Date,
  created?: Date,
  is_follow_up?: boolean,
}

export interface Prospect {
  id?: number,
  active_agent?: number,
  is_mute?: boolean,
  is_archived?: boolean,
  unread_count?: number,
  last_message_date?: string,
  property?: number,
  name?: string,
  last_message?: string,
  external_id?: string,
  last_prospect_message?: string,
  last_prospect_formatted_message?: string,
  has_not_seen_new_message?: number,
  last_prospect_message_date?: string
  lead?: number,
  guest_card?: number,
  tour_scheduling_in_progress?: boolean,
  is_online?: boolean,
}

export interface UnitProps {
  id: number,
  unit: string,
  can_be_toured: boolean,
  smart_rent_unit_id?: string,
}

export interface FloorPlanProps {
  id: string,
  units: UnitProps[],
  plan: string,
  options: { id?: string, value: string }[],
  label: string,
}

export interface TaskProps {
  id?: number,
  description: string,
  owner: number,
  lead: string,
  type: string,
  units: number[],
  tour_confirmation_reminder_enabled: boolean,
  due_date?: Date,
  tour_date?: Date,
  showing_units?: UnitProps[],
  updated?: Date,
  status?: string,
  is_cancelled?: boolean,
}

export interface AgentRequestProps {
  is_active?: boolean,
  created?: string,
  prospect?: number,
  is_declined?: boolean,
  property?: number,
  id?: number
}

export interface FormError {
  seoTitle: string,
  seoDescription: string,
}

export interface FontOption {
  family: string,
  isCustom: boolean,
  path: string,
  files: {
    regular: string,
    italic: string,
  }
}

export interface Seo {
  title?: string,
  description?: string,
}

export interface FirstRibbon {
  text: string,
  title: string
}

export interface Color {
  name: string,
  label: string,
}

export interface Images {
  src?: string,
  title?: string,
  category?: string,
  displayOnHomepage?: boolean,
  videoUrl?: string,
}

export interface Location {
  name?: string,
  image?: string,
  category?: number[],
  addressGeoPosition?: { lat?: number, lng?: number },
  address?: string,
  phone?: string,
  website?: string,
  isPropertyLocation?: boolean,
}

export interface Category {
  id?: number,
  name?: string,
  iconName?: string,
  createdDate?: string,
  activeIcon?: string,
  inactiveIcon?: string,
}

export interface Subcategories {
  seo?: Seo,
  path?: string,
  text?: string,
  image?: string,
  title?: string,
  pageTitle?: string,
  firstRibbon?: { tags: string[], image: string, title: string },
}

export interface AmenitiesPageData {
  subCategories?: Subcategories[],
  showCategories?: boolean,
  amenities?: { leftColumn: string[], middleColumn: string[], rightColumn: string[], image: string },
  community?: { leftColumn: string[], middleColumn: string[], rightColumn: string[], image: string },
  map?: { list: { text: string, class: string }[], image: string, title: string }
}

export interface FloorPlanPageData {
  seo?: Seo,
  allPlans?: {
    images?: { src: string }[], available?: number, bathrooms?: number, bedrooms?: number, description?: number,
    squareFootage?: number, minRent?: number, maxRent?: number, isVisible?: boolean, show_sqft?: boolean, isNew?: boolean
  }[],
  propertyIds?: string[],
  feedSourceType?: string,
  breadcrumbsBar?: { image?: string },
  firstRibbon?: FirstRibbon,
  pageTitle?: string,
}

export interface ContactPageData {
  pageTitle?: string,
  seo?: Seo,
  hours?: {
    sunday: string,
    saturday: string,
    mondayToFriday: string,
  },
  address?: {
    city: string,
    town: string,
    email: string,
    phone: string,
  },
  firstRibbon?: FirstRibbon,
  breadcrumbsBar?: { image: string },
}

export interface DesignPageData {
  siteTemplate?: string,
  labels?: Color[],
  customColors?: { V1: Color[], V2: Color[] },
  customCssCodes?: { V1: Color[], V2: Color[] },
  comingSoonImage?: { src: string, title: string, location: string, category: string },
  imageCategories?: string[],
  exTextFont?: { txt: string, customFonts: string },
}

export interface FooterPageData {
  links?: {
    twitter: string,
    youtube: string,
    facebook: string,
    instagram: string,
    propertyUrl: string,
    residentPortal: string,
  }
  rightFooter?: {
    imageUrl?: string,
    imageClickUrl?: string,
  }
}

export interface GalleryPageData {
  seo?: Seo,
  pageTitle?: string,
  images?: Images[],
  imageCategories?: string[],
  firstRibbon?: FirstRibbon,
  breadcrumbsBar?: { image: string },
}

export interface HomePageData {
  seo?: Seo,
  map?: { marker: { lat: number, lng: number, icon: string }, zoom: number, styles: string, address: string },
  images?: { src: string, useGradient?: boolean }[],
  logo?: { src: string },
  quote?: {
    text: string
    author: string,
    details: string,
  },
  carousel?: {
    subTitle: string,
    mainTitle: string,
    buttonText: string,
    subTitleColor: string,
    mainTitleColor: string,
    backgroundColor?: string,
  },
  amenities?: { leftList: string[], image: string },
  community?: { leftList: string[], image: string },
  firstRibbon?: FirstRibbon,
}

export interface NeighborHoodPageData {
  seo?: Seo,
  firstRibbon?: FirstRibbon,
  pageTitle?: string,
  propertyIcon?: string,
  breadcrumbsBar?: { image: string },
  locations?: Location[],
  categories?: Category[],
  displayNeighborhoodPage?: boolean,
}

export interface SeoPageData {
  gtmId?: string,
  generalData?: {
    icon: string,
    mask: { icon: string, color: string },
    title: string,
    favicon: string,
    subject: string,
    description: string,
  },
  customColors?: Color[],
  aditionalScript?: string,
  google_ownership?: string,
  analyticsDashboard?: string,
  payPerClickDashboard?: string,
}

export interface VirtualTourPageData {
  seo?: Seo,
  firstRibbon?: FirstRibbon,
  pageTitle?: string,
  tours?: { title: string, link: string }[],
  is_visible?: boolean,
  breadcrumbsBar?: { image: string },
}

export type PageData = AmenitiesPageData | FloorPlanPageData | ContactPageData | DesignPageData | FooterPageData | GalleryPageData | HomePageData |
  NeighborHoodPageData | SeoPageData | VirtualTourPageData;

export type CallBackFunction = (data?: { message: string }) => void | number;

export interface ActionType {
  [action: string]: {
    types: string[],
    promise: (axios: AxiosInstance) => void,
    sections?: string,
    successCB?: CallBackFunction,
    failureCB?: CallBackFunction,
    unitType?: string,
  }
}

export interface ManageRequestProps {
  search?: string,
  status?: string,
  offset?: number,
  limit?: number,
  page?: number,
  ordering?: string,
  show_all?: boolean,
  type?: string,
  keyword?: string,
  record_limit?: number,
  field?: string,
  order?: string,
  on_market?: boolean,
  lead_id?: number,
}

export interface TableColumn {
  dataField?: string,
  text?: string,
  sort?: boolean,
  classes?: string,
  headerStyle?: () => { [style: string]: string }
  formatter?: () => React.ReactNode,
  headerFormatter?: () => React.ReactNode,
  footer?: () => React.ReactNode,
  footerAlign?: () => string,
  headerClasses?: string,
}

export interface LeadData {
  name: string,
  stage: string,
  owner?: number,
  move_in_date: string,
  moveInDate?: string,
  next_task: string,
  next_task_date: string,
  source: string,
  created: string,
  page: number,
  id?: number,
  status?: string,
  first_name?: string,
  firstName?: string,
  lastName?: string,
  last_name?: string,
  email?: string,
  chat_prospects?: { id: number }[],
}

export interface NeighborHooadDesignData {
  values?: {
    customColors: { V1: Color[], V2: Color[] },
    siteTemplate: string,
  }
}

export interface ActiveNote {
  id: number,
  isClick: boolean,
  isLast?: boolean,
}

export interface CompanyPolicyProps {
  basic_qualification_requirements: string,
  accept_section_eight: boolean,
  section_eight_disclaimer: string,
  accept_unemployment_as_income: boolean,
  unemployment_income_disclaimer: string,
  accept_applicant_without_ssn: boolean,
  ssn_disclaimer: string,
  accept_applicant_with_misdemeanors_or_felonies: boolean,
  misdemeanor_or_felony_disclaimer: string,
  is_hard_inquiry_on_credit_report: boolean,
  screening_process_time: string,
  is_valet_waste_service_optional: boolean,
  is_alley_waste_service_optional: boolean,
  application_refund_policy: string,
  package_policy: string,
  lease_break_policy: string,
  transfer_policy: string,
}

export interface SmsMessageConversations {
  lead?: number,
  is_team_message?: boolean,
  message?: string,
  date?: string,
  status?: string,
  is_read?: boolean,
  id?: number,
  params?: { offset?: number, limit?: number },
  agent_name?: string,
  agent_avatar?: string,
  lead_name?: string,
}

export interface AssignLeadOwnerProps {
  id?: number
  monday: number,
  tuesday: number,
  wednesday: number,
  thursday: number,
  friday: number,
  saturday: number,
  sunday: number,
  is_enabled: boolean,
}

export interface OwnerProps {
  id: number,
  email: string,
}

export interface AssignLeadOwnersState {
  isSubmitting: boolean,
  errorMessage: string,
  assignLeadOwners: AssignLeadOwnerProps,
  currentAssignedOwner: OwnerProps,
}

export interface AssignLeadOwnersActionTypes {
  type: string,
  result: { data: { results: AssignLeadOwnerProps[] } },
  error: { response: { status: string } },
}

export interface AuthenticationState {
  isSubmitting: boolean,
  isFormInvalid: boolean,
  isSessionTimedOut: boolean,
}

export interface AuthenticationActionTypes {
  type: string,
  error: { response: { status: string } },
  result: { data: { access: string, is_superuser: boolean, role: string } },
}

export interface BusinessHoursState {
  isSubmitting: boolean,
  errorMessage: string,
  businessHours: { weekday: number, start_time: string, end_time: string, is_workday: boolean }[],
}

export interface BusinessHoursActionTypes {
  type: string,
  result: { data: { results: { weekday: number, start_time: string, end_time: string, is_workday: boolean }[] } },
  error: { response: { status: string } },
}

export interface CalendarState {
  isGettingCalendars: boolean,
  errorMessage: string,
  calendars: { id: string, name: string }[],
}

export interface CalendarActionTypes {
  type: string,
  result: { data: { results: { id: string, name: string }[] } },
  error: { response: { status: string } },
}

export interface CallScoringQuestionsState {
  isSubmitting: boolean,
  errorMessage: string,
  questions: { id: number, weight: number, order: number, question: string }[],
}

export interface CallScoringQuestionsActionTypes {
  type: string,
  result: { data: { results: { id: number, weight: number, order: number, question: string }[] } },
  error: { response: { status: string } },
}

export interface CallState {
  isSubmitting: boolean,
  errorMessage: string,
  calls: { id: number, name: string, lead?: number }[],
  call: { id: number, name: string, lead?: number },
  count: number,
  isLoaded: boolean,
  isArchiving: boolean,
}

export interface CallActionTypes {
  type: string,
  result: { data: { results: { id: number, name: string, lead?: number }[] } },
  error: { response: { status: string } },
  pusherModel: string,
  row: { id: number, name: string, lead?: number },
}

// eslint-disable-next-line no-shadow

export type ChatReportMessageStatus = 'CORRECT' | 'INCORRECT';
export type ChatReportMessageSupportStatus = 'SUPPORTED' | 'NOT_SUPPORTED';
export type CombinedMessageStatus = {
  status: ChatReportMessageStatus,
  support_status: ChatReportMessageSupportStatus
}


export interface ChatReportConversationMessageWithStatus {
  id: number,
  status: ChatReportMessageStatus,
  support_status: ChatReportMessageSupportStatus
}

export interface ChatReportConversationMessage extends ChatReportConversationMessageWithStatus {
  message: string,
  type: 'BOT' | 'PROSPECT',
}

export type ChatReportStatus = 'PENDING' | 'PROGRESS' | 'COMPLETED';

export interface ChatReportStats {
  id: number,
  session_date: string | Date,
  status: ChatReportStatus,
  conversations?: { total: number, avg: number },
  responses?: { [key: string]: { count: number, percent: number } } & { total: number },
}

export interface ChatReportConversation {
  id: number,
  index?: number,
  reviewed: boolean,
  date?: string | Date,
}

export interface ChatReportConversationData {
  type: string,
  data: ChatReportConversation
}

export interface ChatReportState {
  isSubmitting: boolean,
  errorMessage: string,
  chats_list: ChatReportStats[],
  chats: ChatReportConversation[],
  chat: ChatReportConversation,
  current_messages: ChatReportConversationData[],
  data?: never,
  isLoaded: boolean,
  isExported: boolean,
  isChatLoaded: boolean,
  selected_chat_messages: ChatReportConversationMessageWithStatus[],
}

export interface ChatReportActionTypes {
  type: string,
  result: { data: { results: ChatReportConversation[] } },
  error: { response: { status: string } },
  pusherModel: string,
  row: { id: number, name: string, lead?: number },
}

export interface ColumnProps {
  position: number,
  is_visible: boolean,
  name: string
}

export interface ColumnSettingsState {
  isSubmitting: boolean,
  errorMessage: string,
  columns: ColumnProps[],
}

export interface ColumnSettingsActionTypes {
  type: string,
  result: { data: { results: ColumnProps[] } },
  error: { response: { status: string } },
  pusherModel: string,
  row: ColumnProps[],
}

export interface CompetitorState {
  isSubmitting: boolean,
  errorMessage: string,
  competitors: { id: number, name: string }[],
}

export interface CompetitorActionTypes {
  type: string,
  result: { data: { results: { id: number, name: string }[] } },
  error: { response: { status: string } },
}

export interface EmailLabelState {
  isGettingLabels: boolean,
  errorMessage: string,
  labels: string[],
}

export interface EmailLabelActionTypes {
  type: string,
  result: { data: { results: string[] } },
  error: { response: { status: string } },
}

export interface EmailMessageState {
  isSubmitting: boolean,
  errorMessage: string,
  messages: EmailMessageProps[],
  message: EmailMessageProps,
  messagesCount: number,
  isLoaded: boolean,
  isFollowupMessagesLoaded: boolean,
  conversations: EmailMessageProps[],
  leadId: string,
  data: string,
  subject: string,
  cc: string,
  selectedTemplateId: string,
  subjectVariables: string[],
  files: string[],
  isShowingCc: boolean,
}

export interface EmailMessageActionTypes {
  type: string,
  result: { data: { results: EmailMessageProps[] } },
  error: { response: { status: string } },
  pusherModel: string,
  row: EmailMessageProps,
  leadId: string,
  data: string,
  subject: string,
  selectedTemplateId: string,
  subjectVariables: string[],
  files: string[],
  isShowingCc: boolean,
  cc: string,
}

export interface EmailTemplateProps {
  id?: number,
  text: string,
  type?: string,
  subject: string,
  name: string,
  variables: string[],
  subject_variables: string[],
}

export interface ChatTemplateProps {
  id?: number,
  text: string,
  type?: string,
  name: string,
  variables: string[],
}

export interface ChatTemplateState {
  isSubmitting: boolean,
  errorMessage: string,
  chatTemplates: ChatTemplateProps[],
  chatTemplate: ChatTemplateProps,
}

export interface ChatTemplateActionTypes {
  type: string,
  result: { data: { results: ChatTemplateProps[] } },
  error: { response: { status: string } },
}

export interface EmailTemplateState {
  isSubmitting: boolean,
  errorMessage: string,
  emailTemplates: EmailTemplateProps[],
  emailTemplate: EmailTemplateProps,
}

export interface EmailTemplateActionTypes {
  type: string,
  result: { data: { results: EmailTemplateProps[] } },
  error: { response: { status: string } },
}

export interface LeadState {
  isSubmitting: boolean,
  isLoaded: boolean,
  errorMessage: string,
  leads: LeadData[],
  lead: LeadData,
  leadProspect: LeadData,
  leadNames: { id?: number, external_id: string }[],
  count: number,
  filteredCount: number,
  pmsData: {
    pms_sync_status: string,
    pms_sync_date: string,
    pms_sync_condition_lack_reason: string,
  },
  totalLeadsCount: number,
  activeLeadsCount: number,
  myLeadsCount: number,
  isCommunicationLoaded: boolean,
  communications: Communication[],
  communicationCount: number,
  isCommunicationUpdate: boolean,
  isChatPusher: boolean,
  communicationSearchKeyword: string,
  communicationFilterType: string,
}

export interface LeadActionTypes {
  type: string,
  result: { data: { results?: LeadData[], prospect?: number } },
  error: { response: { status: string } },
  pusherModel: string,
  row: LeadData,
  keyword: string,
  filterType: string,
}

export interface LeadFilterState {
  isSubmitting: boolean,
  errorMessage: string,
  leadsFilters: { id: number | string, name: string }[],
  leadsFilter: { id: number | string, name: string },
  activeFilter: string,
}

export interface LeadFilterActionTypes {
  type: string,
  result: { data: { results: { id: number | string, name: string }[] } },
  error: { response: { status: string } },
  row: { id: number | string, name: string },
  pusherModel: string,
}

export interface TermPremium {
  month: number,
  base_rent: number,
  base_rent_type: 'PLUS' | 'NO_PREMIUM' | 'MINUS',
  base_rent_measurement: 'FIXED' | 'PERCENT',
}

export interface DurationPricing {
  id?: number,
  shortest_lease_term: number,
  is_offer_month_to_month: boolean,
  base_rent: number,
  base_rent_type: 'PLUS' | 'NO_PREMIUM' | 'MINUS',
  base_rent_measurement: 'FIXED' | 'PERCENT',
  longest_lease_term: number,
  pricing_term: 'DYNAMIC' | 'MANUAL',
  avg_turnover_time: number,
  avg_turnover_costs: number,
  is_offer_discounts: boolean,
  term_premiums: TermPremium[],
}

export interface LeaseState {
  isSubmitting: boolean,
  errorMessage: string,
  leaseDefault: { approved_security_deposit: string },
  propertyPolicy: { is_cosigners_allowed?: boolean, utilities?: string[] },
  rentableItems: { id: number, name: string }[],
  durationPricing: DurationPricing,
}

export interface LeaseActionTypes {
  type: string,
  result: { data: { results: { approved_security_deposit: string }[] } },
  error: { response: { status: string } },
}

export interface NoteState {
  isSubmitting: boolean,
  errorMessage: string,
  notes: NoteProps[],
  leadNotes: NoteProps[],
  note: NoteProps,
  count: number,
}

export interface NoteActionTypes {
  type: string,
  result: { data: { results: NoteProps[] } },
  id: number,
  error: { response: { status: string } },
  row: NoteProps,
  pusherModel: string,
}

export interface NotificationState {
  isSubmitting: boolean,
  errorMessage: string,
  notifications: { is_read: boolean, id: number }[],
  notification: { is_read: boolean, id: number },
}

export interface NotificationActionTypes {
  type: string,
  result: { data: { results: { is_read: boolean, id: number }[] } },
  error: { response: { status: string } },
}

export interface NylasState {
  isSubmitting: boolean,
  errorMessage: string,
  authUrl: string,
  token: string,
  isTokenObtained: boolean,
  isArchiving: boolean,
  isSendingEmail: boolean,
  isEmailComposerOpened: boolean,
}

export interface NylasActionTypes {
  type: string,
  result: { data: { auth_url: string } },
  error: { response: { status: string } },
  data: boolean,
}

export interface PortfolioState {
  isSubmitting: boolean,
  errorMessage: string,
  portfolios: { id: number, name: string, type: string }[],
}

export interface PortfolioActionTypes {
  type: string,
  result: { data: { results: { id: number, name: string, type: string }[] } },
  error: { response: { status: string } },
}

export interface PropertyState {
  isSubmitting: boolean,
  errorMessage: string,
  properties: PropertyProps[],
  property: PropertyProps,
  isUpdatingStatus: boolean,
  allPropertiesScored: boolean,
  isPropertyDataLoaded: boolean,
}

export interface PropertyActionTypes {
  type: string,
  result: { data: { results: PropertyProps[] } },
  id: number,
  error: { response: { status: string } },
}

export interface ProspectChatState {
  isSubmitting: boolean,
  isProspectsLoading: boolean,
  isProspectsLoaded: boolean,
  errorMessage: string,
  isSendingText: boolean,
  newAgentRequest: boolean,
  isChatMinimized: boolean,
  conversations: { prospect: number, type: string }[],
  suggestions: [],
  prospects: Prospect[],
  leadProspects: [],
  newMessage: { prospect: number, type: string },
  prospectsRequestedAgents: AgentRequestProps[],
  availableAgentsCount: number,
  chatType: string,
  activeChats: { id: number, isSMS: boolean }[],
  activeProperties: number[],
  activeSlide: number,
  currentTab: string,
  typingData: { isTyping: boolean, prospect: number },
  tour_scheduling_in_progress?: boolean,
}

export interface ProspectChatActionTypes {
  type: string,
  result: { data: { results: Prospect[] } },
  id: number,
  error: { response: { status: string } },
  pusherModel: string,
  row: Prospect,
  tabKey: string,
  activeSlide: number,
  ids: number[],
  data: string,
  contact: { id: number, isSMS: boolean }[],
}

export interface SourceProps {
  id?: string,
  name?: string,
  spends?: { date: string, price: number },
  is_paid?: boolean,
}

export interface ProspectSourceState {
  isSubmitting: boolean,
  errorMessage: string,
  sources: SourceProps[],
}

export interface ProspectSourceActionTypes {
  type: string,
  result: { data: { results: SourceProps[] } },
  error: { response: { status: string } },
}

export interface PusherState {
  pusherModel: string,
  pushNotification: { type: string, lead_owner: string },
  pushLead: { id: number }[],
  pushEmail: { id: number }[],
  pushReport: { id: number }[],
}

export interface PusherActionTypes {
  type: string,
  pusherModel: string,
  row: { type: string, lead_owner: string },
}

export interface LeadLostData {
  [key: string]: {
    name: string,
    value: number,
  } | number,
}

export interface MarketingReportsProps {
  lead_source_report: any,
  lead_lost_report: LeadLostData,
  portfolio: { lead_lost_report: LeadLostData },
  compare_values: { lead_lost_report: { lost_leads: number } },
}

export interface Report {
  chart_values: {
    prospect_calls: number[],
    average_call_time: number[],
    average_call_score: number[],
  },
}

export interface ReportState {
  isSubmitting: boolean,
  isLoaded: boolean,
  errorMessage: string,
  overviewReports: Report,
  marketingReports: MarketingReportsProps,
  operationsReports: Report,
  sitesReports: Report,
  startDate: string,
  endDate: string,
  leadSourceDrilldown: any,
  leadLostDrilldown: any,
  isLoadedDrilldown: boolean,
  sourcesCalls: { calls: number, percents: number, source: string }[],
  isSourcesCallsLoaded: boolean,
}

export interface ReportActionTypes {
  type: string,
  result: { data: { results: Report[] } },
  error: { response: { status: string } },
}

export interface ResetPasswordState {
  isSubmitting: boolean,
  isFormInvalid: boolean,
  isTokenInvalid: boolean,
}

export interface ResetPasswordActionTypes {
  type: string,
  error: { response: { status: string } },
}

export interface RoommateProps {
  id?: number,
  first_name?: string,
  last_name?: string,
  email?: string,
  phone_number?: string,
  relationship?: number,
}

export interface RoommateState {
  isSubmitting: boolean,
  errorMessage: string,
  roommates: RoommateProps[],
  roommate: RoommateProps,
}

export interface RoommateActionTypes {
  type: string,
  pusherModel: string,
  result: { data: { results: RoommateProps[] } },
  error: { response: { status: string } },
  row: string,
}

export interface CallRescoresMeta {
  required_call_rescores_count: number,
  has_scored_calls_today: number,
}

export interface CallsState {
  isSubmitting: boolean,
  errorMessage: string,
  scoredCalls: ScoredCallProps[],
  scoredCall: ScoredCallProps,
  isLoaded: boolean,
  callRescoresMeta: CallRescoresMeta,
}

export interface CallsActionTypes {
  type: string,
  result: { data: { results: ScoredCallProps[] } },
  error: { response: { status: string } },
}

export interface MessageState {
  isSubmitting: boolean,
  isContactsLoading: boolean,
  isContactsLoaded: boolean,
  isConversationsLoaded: boolean,
  errorMessage: string,
  conversations: SmsMessageConversations[],
  count: number,
  unread: number,
  contacts: { id: number }[],
  isSendingText: boolean,
  activeChat: { id: number },
  isNotificationRedirection: false,
}

export interface MessageActionTypes {
  type: string,
  result: { data: SmsMessageConversations | { results: SmsMessageConversations[] } };
  id: number,
  error: { response: { status: string } },
  pusherModel: string,
  contact: { id: number },
  row: { is_read: boolean, id: number, message: string, date: string },
  data: { id: number }[],
}

export interface SurveyProps {
  surveyId: number;
  id: number;
  market_rent: number;
  effective_rent: number;
  concession_amount: number,
  competitor: string,
  isTemplate: boolean,
  is_first: boolean,
  date: Date,
}

export interface updateSurveysProps {
  updated_surveys: { date: string }[],
  created_surveys: { date: string }[],
  deleted_surveys: { date: string }[],
  date: Date | string,
}

export interface SurveyState {
  isSubmitting: boolean,
  errorMessage: string,
  surveys: SurveyProps[],
}

export interface SurveyActionTypes {
  type: string,
  result: { data: { results: SurveyProps[] } },
  error: { response: { status: string } },
}

export interface TaskState {
  isSubmitting: boolean,
  errorMessage: string,
  isLoaded: boolean,
  tasks: TaskProps[],
  leadTasks: TaskProps[],
  task: TaskProps,
  count: number,
  availableDateTimes: { date: string, times: { available: boolean, date_time: string }[] }[] | string[],
}

export interface TaskActionTypes {
  type: string,
  pusherModel: string,
  result: { data: TaskProps | { results: TaskProps[] } },
  error: { response: { status: string } },
  row: string,
}

export interface UserState {
  currentUser: UserProps,
  users: UserProps[],
  teamUsers: UserProps[],
  isSubmitting: boolean,
  isUpdatingStatus: boolean,
  isUsersLoaded: boolean,
}

export interface UserActionTypes {
  type: string,
  result: { data: { results: UserProps[] } },
  error: { response: { status: string } },
}

export interface ClientState {
  isSubmitting: boolean,
  client: ClientProps,
  isClientLoaded: boolean,
  isClientsLoaded: boolean,
  clients: ClientProps[],
}

export interface ClientActionTypes {
  type: string,
  result: { data: ClientProps | { results: ClientProps[] } }
}

export interface CustomerState {
  isSubmitting: boolean,
  customer: CustomerProps,
  customerDetails: {
    id?: number,
    employee?: { id: number, first_name: string, last_name: string, role: string }[]
  },
  isCustomerLoaded: boolean,
  isCustomersLoaded: boolean,
  customers: CustomerProps[],
}

export interface CustomerActionTypes {
  type: string,
  result: { data: CustomerProps | { results: CustomerProps[] } }
}

export interface HobbesState {
  isSubmitting: boolean,
  errorMessage: string,
  companyPolicy: CompanyPolicyProps,
  isCategoryLoaded: boolean,
  amenityCategories: { id: number, name: string }[],
}

export interface HobbesActionTypes {
  type: string,
  result: { data: CompanyPolicyProps },
  error: { response: { status: string } },
}

export interface PageDataState {
  isSubmitting: boolean,
  isPageDataLoaded: boolean,
  homePageData: HomePageData,
  galleryPageData: GalleryPageData,
  floorPlansPageData: FloorPlanPageData,
  amenitiesPageData: AmenitiesPageData,
  neighborhoodPageData: NeighborHoodPageData,
  virtualTourPageData: VirtualTourPageData,
  contactPageData: ContactPageData,
  footerPageData: FooterPageData,
  designPageData: DesignPageData,
  seoPageData: SeoPageData,
  formChanged: boolean,
  submitClicked: boolean,
}

export interface PageDataActionTypes {
  type: string,
  result: { data: PageData },
  sections: string,
  changed: boolean,
  clicked: boolean,
}

export interface PromotionState {
  isSubmitting: boolean,
  isPromotionsLoaded: boolean,
  promotions: PromotionProps[],
}

export interface PromotionActionTypes {
  type: string,
  result: { data: { results: PromotionProps[] } }
}

export interface Tooltip {
  section?: string,
  elements?: { selector: string, value: string }[]
}
export interface TooltipState {
  isSubmitting: boolean,
  isTooltipItemsLoaded: boolean,
  tooltipItems: Tooltip[],
}

export interface TooltipActionTypes {
  type: string,
  result: { data: Tooltip[] }
}

export interface CompetitorProps {
  id?: number,
  name: string,
  address_line_1: string,
  address_line_2: string,
  city: string,
  state: string,
  zip_code: string,
  phone_number: string,
  fax_number: string,
}

export interface ExploreMarket {
  id: number,
  name: string,
  is_stored: boolean,
}

export interface ExploreMarketsList {
  markets?: ExploreMarket[],
  submarkets?: ExploreMarket[],
  properties?: ExploreMarket[],
  comparisons?: ExploreMarket[],
}

export interface ExploreMarketsState {
  isExploreMarketsLoaded: false,
  exploreMarketsList: ExploreMarketsList,
}

export interface ExploreMarketsActionTypes {
  type: string,
  result: { data: ExploreMarketsList }
}

export interface WatchListUpdate {
  object_type?: string,
  object_id?: number,
  is_stored?: boolean,
}

export interface HistoricalRequestProps {
  period?: string,
  group?: string,
  unit_type?: string,
  show_as?: string,
  rent_as?: string,
}

export interface ReportSettings {
  expressRentAs?: string,
  reportingPeriod?: string,
  reportingGroup?: string,
}

export interface MarketEnvironment {
  market: number,
  submarket: number,
  competitors: number[],
}

export interface RentComps {
  property?: string,
  market?: string,
  name?: string,
  average_rent?: number,
  average_size?: number,
  average_rent_sqft?: number,
  available_units_count?: number,
  units_count?: number,
  unit_occupancy?: number,
  rank?: number,
  id: number,
}

export interface UnitType {
  id?: number,
  unit_type?: string,
  beds?: number,
  min_baths?: number,
  available_units_count?: number,
  units_count?: number,
  unit_occupancy?: number,
  avg_size?: number,
  min_size?: number,
  max_size?: number,
  avg_rent?: number,
  avg_rent_sqft?: number,
  min_rent?: number,
  max_rent?: number,
  name?: string,
  baths?: number,
  average_size?: number,
  average_rent?: number,
  property?: string,
  market?: string,
  rank?: number,
}

export type CallBackId = (id?: number, flag?: boolean) => void;

export interface PropertiesBreakdown {
  id?: number,
  name?: string,
  units_count?: number,
  min_unit_size?: number,
  avg_unit_size?: number,
  avg_rent?: number,
}

export interface AvailableUnit {
  id?: number,
  number?: number,
  unit_type?: string,
  floor_plan_name?: string,
  beds?: number,
  baths?: number,
  unit_size?: number,
  rent?: number,
  avg_rent_per_sqft?: number,
  available_date?: number,
}

export interface Properties {
  id?: number,
  name?: string,
}

export interface PropertiesCompetitor {
  id?: number,
  name?: string,
  submarket?: string,
  units_count?: number,
  min_unit_size?: number,
  min_rent?: number,
  occupancy?: number,
  rent?: number,
}

export interface ChartData {
  start_date?: string,
  date?: string,
  value?: number,
  end_date?: string,
}

export interface HistoricalChart {
  chart_values: ChartData[],
  net_absorption_unit_change?: number,
  net_absorption_percent_change?: number,
  net_rent?: number,
  net_rent_change?: number,
  net_concession?: number,
  net_concession_rent?: number,
}

export interface SubmarketDetail {
  id: number,
  name?: string,
  unit_types?: UnitType[],
  properties_count?: number,
  units_count?: number,
  available_units_count?: number,
  avg_occupancy?: number,
  avg_rent?: number,
  properties_offering_concession?: number,
  avg_concession?: number,
  min_concession?: number,
  max_concession?: number,
  submarkets_count?: number,
  ltn_occupancy?: number,
  is_mtr_group?: boolean,
}

export interface PropertyDetail {
  id: number,
  name?: string,
  unit_types?: UnitType[],
  concession_avg_rent_percent?: number,
  submarket?: string,
  market?: string,
  address?: string,
  phone_number?: string,
  website?: string,
  units_count?: number,
  concession_description?: string,
  concession_amount?: number,
  amenities?: string[],
  communities?: string[],
  average_rent?: number,
  average_rent_per_sqft?: number,
  occupancy?: number,
  competitors?: number[],
  is_lease_up?: boolean,
}

export interface AlertLog {
  id?: number,
  sent_on?: string,
  start?: string,
  end?: string,
}
export interface PropertyAlert {
  id: number,
  name?: string,
  logs?: AlertLog[],
  alertId?: number,
  sent_on?: string,
}

export interface ComparisonReport {
  id?: number,
  subject_asset_name?: string,
  compared_asset_name?: string,
  subject_asset_type?: string,
  compared_asset_type?: string,
  market?: number,
  submarket?: number,
  subject_property?: number,
  compared_property?: number,
  subject_sub_market?: number,
  compared_sub_market?: number,
  competitor_property?: number,
}

export interface HighestRent {
  id: number,
  name?: string,
  rank?: number,
  average_rent?: number,
  average_rent_per_sqft?: number,
  units_count?: number,
}

export interface HighestOccupancy {
  id: number,
  name?: string,
  rank?: number,
  occupancy?: number,
  units_count?: number,
}

export interface SubjectAsset {
  type: string,
  value: { name: string, id: number },
}

export interface AlertInfo {
  sent_on: string,
  id: number,
  start?: string,
  end?: string,
  baseline?: string,
  condition_subject?: string,
  condition_unit_types?: string[],
}

export interface Alert {
  id?: any,
  geo?: string[],
  tracked_assets?: number,
  last_sent?: string,
  logs?: AlertInfo[],
  name?: string,
  type?: string,
  baseline?: string,
  condition_subject?: string,
  condition_type?: string,
  condition_value?: number,
  condition_unit_types?: string[],
  track_assets_mode?: string,
  status?: string,
  properties?: number[],
  markets?: number[],
  submarkets?: number[],
  trackedAssets?: string,
  condition?: string,
  thresholdType?: string,
  thresholdPercent?: number,
  unitTypes: { label: string, value: string }[],
}

export interface ThresholdLog {
  id: number,
  property: string,
  previous_value: number,
  new_value: number,
}

export interface AlertUnitLog {
  id: number,
  unit_type?: string,
  average_rent?: number,
  average_rent_last_day?: number,
  average_rent_last_week?: number,
  average_rent_last_4_weeks?: number,
  average_rent_per_sqft?: number,
  average_rent_per_sqft_last_day?: number,
  average_rent_per_sqft_last_week?: number,
  average_rent_per_sqft_last_4_weeks?: number,
}

export interface AlertLogs {
  id: number,
  alert_unit_rent_logs?: AlertUnitLog[],
  property?: string,
  occupancy?: number,
  occupancy_last_day?: number,
  occupancy_last_week?: number,
  occupancy_last_4_weeks?: number,
  concession_amount?: number,
  concession_amount_last_day?: number,
  concession_amount_last_week?: number,
  concession_amount_last_4_weeks?: number,
  concession_avg_rent_percent?: number,
  concession_avg_rent_percent_last_day?: number,
  concession_avg_rent_percent_last_week?: number,
  concession_avg_rent_percent_last_4_weeks?: number,
  is_offering_concession?: boolean,
}

export interface AlertLogsDetail {
  results: AlertLogs[],
}

export interface AlertState {
  isSubmitting: boolean,
  errorMessage: string,
  isAlertSubscriptionsLoaded: boolean,
  isAlertLoaded: boolean,
  countAlerts: number,
  alertLogCount: number,
  alertSubscriptions: Alert[],
  alert: Alert,
  isAlertLogLoaded: boolean,
  alertLog: AlertLogs,
  isUnitTypesLogLoaded: {
    [unit: string]: boolean,
  },
  unitTypesLog: {
    [unit: string]: AlertLogs,
  },
  unitTypesLogCount: {
    [unit: string]: number,
  },
}

export interface AlertActionTypes {
  type: string,
  result: { data: { results: Alert[], count: number } },
  error: { response: { status: string } },
  unitType: string,
}

export interface ComparisonState {
  isSubmitting: boolean,
  errorMessage: string,
  isComparisonListLoaded: boolean,
  isComparisonLoaded: boolean,
  comparisonList: ComparisonReport[],
  comparison: ComparisonReport,
  isHighestRentLoaded: boolean,
  highestRent: HighestRent,
  isHighestOccupancyLoaded: boolean,
  highestOccupancy: HighestOccupancy,
  highestOccupancyCount: number,
  highestRentCount: number,
  subjectName: string,
  subjectRentRank: number,
  subjectOccupancyRank: number,
  subjectType: string,
}

export interface ComparisonActionTypes {
  type: string,
  result: { data: { results: ComparisonReport[] } },
  error: { response: { status: string, data: string } },
}

export interface HistoricalReportState {
  errorMessage: string,
  isHistoricalPropertyRentLoaded: boolean,
  historicalPropertyRent: HistoricalChart,
  isHistoricalPropertyOccupancyLoaded: boolean,
  historicalPropertyOccupancy: HistoricalChart,
  isPropertyConcessionLoaded: boolean,
  propertyConcession: HistoricalChart,
  isSubmarketRentLoaded: boolean,
  submarketRent: HistoricalChart,
  isSubmarketOccupancyLoaded: boolean,
  submarketOccupancy: HistoricalChart,
  isSubmarketConcessionLoaded: boolean,
  submarketConcession: HistoricalChart,
  isMarketRentLoaded: boolean,
  marketRent: HistoricalChart,
  isMarketOccupancyLoaded: boolean,
  marketOccupancy: HistoricalChart,
  isMarketConcessionLoaded: boolean,
  marketConcession: HistoricalChart,
  isRentCompareLoaded: boolean,
  rentCompare: HistoricalChart,
}

export interface HistoricalReportActionTypes {
  type: string,
  result: { data: { results: HistoricalChart } },
  error: { response: { status: string } },
}

export interface MarketState {
  isSubmitting: boolean,
  errorMessage: string,
  isMarketDetailLoaded: boolean,
  isMarketPropertiesLoaded: boolean,
  isMarketSubmarketsLoaded: boolean,
  isRentCompsLoaded: boolean,
  isMTRBreakdownLoaded: boolean,
  countMarketProperties: number,
  countRentComps: number,
  marketDetail: SubmarketDetail,
  marketProperties: PropertiesBreakdown,
  rentComps: RentComps,
  marketSubmarkets: PropertiesBreakdown,
  mtrGroupBreakdown: PropertiesBreakdown,
  marketSubmarketsCount: number,
  mtrGroupBreakdownCount: number,
}

export interface MarketActionTypes {
  type: string,
  result: { data: { results: SubmarketDetail, count: number } },
  error: { response: { status: string } },
}

export interface PropertiesState {
  isSubmitting: boolean,
  errorMessage: string,
  isAvailableUnitsLoaded: boolean,
  isPropertiesDetailLoaded: boolean,
  isPropertiesCompetitorsLoaded: boolean,
  isCompetitorListLoaded: boolean,
  isAlertLoaded: boolean,
  countAvailableUnit: number,
  countCompetitors: number,
  availableUnits: AvailableUnit,
  propertiesDetail: PropertyDetail,
  propertiesCompetitors: PropertiesCompetitor,
  competitorList: ExploreMarket,
  alertSubscriptions: PropertyAlert,
  isSessionLoaded: boolean,
  sessionInfo: AvailableUnit,
  properties: Properties[],
}

export interface PropertiesActionTypes {
  type: string,
  result: { data: { results: PropertyDetail, count: number } },
  error: { response: { status: string } },
}

export interface SubmarketState {
  isSubmitting: boolean,
  errorMessage: string,
  isSubmarketPropertiesLoaded: boolean,
  isSubmarketDetailLoaded: boolean,
  isRentCompsLoaded: boolean,
  isSubmarketBreakdownLoaded: boolean,
  countSubmarketProperties: number,
  countRentComps: number,
  countSubmarketBreakdown: number,
  submarketProperties: PropertiesBreakdown,
  submarketDetail: SubmarketDetail,
  rentComps: RentComps,
  submarketBreakdown: PropertiesBreakdown,
}

export interface SubmarketActionTypes {
  type: string,
  result: { data: { results: SubmarketDetail, count: number } },
  error: { response: { status: string } },
}

export interface WatchlistState {
  isSubmitting: boolean,
  errorMessage: string,
  isWatchlistLoaded: boolean,
  watchlist: ExploreMarketsList,
}

export interface WatchlistActionTypes {
  type: string,
  result: { data: { results: ExploreMarketsList[] } },
  error: { response: { status: string } },
}

export interface Filters {
  [key: string]: { label: string, value: string },
}

export interface DemoTourTimesParams {
  date: string,
  demo?: number,
}

export interface DemoTourProps {
  date?: string,
  is_cancelled?: boolean,
  first_name?: string,
  last_name?: string,
  email?: string,
  phone_number?: string,
  company?: string,
  timezone?: string,
  external_id?: string,
  id?: number,
}

export interface DemoTourActionTypes {
  type: string,
  result: { data: { results: DemoTourProps[] } },
  error: { response: { status: string } },
}

export interface DemoTourState {
  isSubmitting: boolean,
  errorMessage: string,
  demoTour: DemoTourProps,
  availableTimes: string[],
  availableDates: string[],
}

export interface AvailableTimesParams { unit?: number[], date?: string, tour?: number, tz_difference?: number }
export interface EmailAttachments {
  id?: number,
  attachment?: string,
  name?: string,
  size?: number,
  content_type?: string,
  email_message?: number,
}

export interface CommunicationObject {
  id: number,
  date?: string,
  agent_name?: string,
  type?: string,
  lead_name?: string,
  message?: string,
  call_result?: string,
  sender_name?: string,
  receiver_name?: string,
  formatted_sender_name?: string,
  formatted_receiver_name?: string
  subject?: string,
  body?: string,
  content?: string,
  attachments?: EmailAttachments[],
  transformed_content?: string,
  creator?: string,
  agent_avatar?: string,
  tour?: {
    owner: string,
    units: number[],
    tour_date: string,
    description: string,
  },
  is_auto_generated?: boolean,
  text?: string,
}

export interface Communication {
  type: string,
  date: string,
  is_property_communication?: boolean,
  object: CommunicationObject,
}

export interface Lead {
  id: number,
  email: string,
  secondary_email: string,
  phone_number: string,
  secondary_phone_number: string,
  best_contact_method: string,
  moving_reason: string,
  best_contact_time: string,
  source: string,
  occupants: number,
  move_in_date: Date,
  days_to_move_in: number,
  desired_rent: number,
  origin: string,
  acquisition_date: string,
  acquisition_history: { date: string, source: string }[],
  lease_term: number,
  beds: number,
  baths: number,
  pets: number,
  pet_type: string,
  vehicles: number,
  washer_dryer_method: string,
  res_man_pet_weight: number,
  real_page_pet_weight: number,
  price_range: string,
  floor_plan: number[],
  units: number[],
  first_name: string,
  last_name: string,
  stage: string,
  owner: string,
  status: string,
  last_followup_date: string,
  last_activity_date: string,
  created: string,
  next_lead: Lead,
  prev_lead: Lead,
  lead_can_text: boolean,
  chat_prospects: { id: number, is_online: boolean }[],
}

export interface UnitSession {
  id: number,
  unit_type: string,
  unit_size: string,
  days_on_market: number,
  start_listing_date: string,
  end_listing_date: string,
  unit: number,
  unit_pricing: { scrapping_date: string, rent: number }[],
}

export interface UnitInfo {
  id: number,
  session: UnitSession[],
}

export interface Call {
  id: number,
  name: string,
  lead?: number,
  property?: number,
  transcription: string,
  expanded?: boolean,
  recording: string,
  duration: number,
}

export interface PropertyPolicy {
  is_cosigners_allowed?: boolean,
  utilities?: string[],
  is_dogs_acceptable?: boolean,
  is_cats_acceptable?: boolean,
  is_birds_acceptable?: boolean,
  max_pets_policy_mode?: string,
  max_vehicles_policy_mode?: string,
  household_income_times?: string,
  acceptable_forms_of_payment?: string[],
  checks_paid_to?: string,
  waitlist_fee?: string,
  notice_to_vacate_prior_days?: string,
  notice_to_vacate_month_to_month_days?: string,
  apartment_hold_expiration?: string,
  guest_parking_is_allowed?: boolean,
  max_studio_occupants?: string,
  max_one_bedroom_occupants?: string,
  max_two_bedrooms_occupants?: string,
  max_three_bedrooms_occupants?: string,
  max_vehicles_for_studio?: string,
  max_vehicles_for_one_bedroom?: string,
  max_vehicles_for_two_bedrooms?: string,
  max_vehicles_for_three_bedrooms?: string,
  max_pets_for_one_leaseholder?: string,
  dog_breed_restrictions?: string,
  cat_breed_restrictions?: string,
  bird_breed_restrictions: string,
  monthly_utility_bill?: number,
  requirements_to_hold_unit?: string,
  max_pets_per_unit?: number,
  resident_parking_type?: string,
  apartment_ceiling_height?: string,
  smoking_policy_disclaimer?: string,
  smoking_allowed?: boolean,
  club_house_hours_24_hr?: boolean,
  club_house_hours_start_time?: string,
  club_house_hours_end_time?: string,
  fitness_center_hours_24_hr?: boolean,
  fitness_center_hours_start_time?: string,
  fitness_center_hours_end_time?: string,
  pool_hours_24_hr?: boolean,
  pool_hours_start_time?: string,
  pool_hours_end_time?: string,
  community_quiet_hours_24_hr?: boolean,
  community_quiet_hours_start_time?: string,
  community_quiet_hours_end_time?: string,
  moving_hours_24_hr?: boolean,
  moving_hours_start_time?: string,
  moving_hours_end_time?: string,
  club_house_alarm_fee?: string,
  fitness_center_key_deposit?: string,
  overnight_guest_stay_limit?: number,
  pest_control_service_day?: string,
  garage_door_opener_replacement_fee?: string,
  garage_door_reprogramming_fee?: string,
  parking_rent?: string,
  parking_permit_rent?: string,
  parking_id_replacement_fee?: string,
  guest_parking_type?: string
}

export interface paginationData {
  offset: number,
  limit: number,
  page: number,
}
