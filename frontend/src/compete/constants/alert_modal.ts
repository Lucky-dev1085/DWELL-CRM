import { reportSettingsFilters } from 'compete/constants';

export const conditionList = ['Rent', 'Occupancy', 'Concession'];
export const thresholdTypeList = ['Increases', 'Decreases', 'Increases or decreases'];

export const trackedAssets = {
  MARKETS: 'ASSETS_IN_MARKETS',
  CUSTOM: 'CUSTOM_ASSETS',
  SUBMARKETS: 'ASSETS_IN_SUB_MARKETS',
};

export const alertTypes = {
  THRESHOLD: 'THRESHOLD',
  BENCHMARK: 'BENCHMARK',
};

export const baselineItems = {
  PREVIOUS_DAY: 'PREVIOUS_DAY',
  LAST_WEEK: 'LAST_WEEK',
  LAST_4_WEEKS: 'LAST_4_WEEKS',
};

export const initialState = {
  id: '',
  name: '',
  trackedAssets: trackedAssets.MARKETS,
  status: 'ACTIVE',
  condition: 'Occupancy',
  thresholdType: 'Increases',
  thresholdPercent: null,
  baseline: baselineItems.PREVIOUS_DAY,
  unitTypes: [reportSettingsFilters.showRentForOptions[0]],
};

export const baselineList = [
  { label: 'Previous day', value: baselineItems.PREVIOUS_DAY },
  { label: 'Last week', value: baselineItems.LAST_WEEK },
  { label: 'Last 4 weeks', value: baselineItems.LAST_4_WEEKS },
];
