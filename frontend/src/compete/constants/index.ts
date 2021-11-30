import { capitalize } from 'lodash';
import moment from 'moment';
import { ChartData, ExploreMarket } from 'src/interfaces';
import { toast, ToastOptions } from 'react-toastify';
import { toastOptions } from 'site/constants';
import searchFilters from './search_filters';
import reportSettingsFilters from './report_settings_filters';
import { chartConfigs, chartCompareConfigs } from './chart';
import { chartTableViewColumns, chartCompareTableViewColumns } from './tableViewColumns';
import paths from './paths/index';
import actions from './actions';
import calculateBreakdown from './calculate_breakdown';
import assetTypes from './asset_type';
import filteredUnitType from './filter_unit_type';

interface PrepareDate {
  chart_values: ChartData[],
}

export {
  searchFilters,
  reportSettingsFilters,
  chartTableViewColumns,
  chartConfigs,
  chartCompareConfigs,
  chartCompareTableViewColumns,
  paths,
  actions,
  calculateBreakdown,
  assetTypes,
  filteredUnitType,
};

export const unitTypes = [
  { label: 'All', value: '' }, { label: 'Studio', value: 'STUDIO' },
  { label: '1 bed', value: 'ONE_BEDROOM' }, { label: '2 bed', value: 'TWO_BEDROOM' },
  { label: '3 bed', value: 'THREE_BEDROOM' }, { label: '4 bed', value: 'FOUR_BEDROOM' },
];
export const asAmountRent = [{ label: '$ amount', value: 'AMOUNT' }, { label: 'As % of Rent', value: 'RATE' }];
export const currencyFormat = (number: number): string => (number || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
export const currencyRoundedFormat = (number: number): string => new Intl.NumberFormat().format(Math.round(number || 0));
export const percentFormat = (value: number): string => (Number(value || 0)).toFixed(1);
export const filtersFormat = (value: string): string => value.toUpperCase().replace(/\s/g, '_');
export const stringToCapitalize = (value: string): string => capitalize(value).replace(/_/g, ' ');
export const comparisonFieldName = {
  competitor: 'competitor_property',
  market: 'market',
  submarket: 'subject_sub_market',
  property: 'subject_property',
  compared_property: 'compared_property',
  compared_submarket: 'compared_sub_market',
};
export const assetTypeUpper = {
  COMPETITORS: 'competitor',
  MARKET: 'market',
  SUB_MARKET: 'submarket',
  PROPERTY: 'property',
  COMPARED_PROPERTY: 'compared_property',
  COMPARED_SUB_MARKET: 'compared_sub_market',
};
export const compareValue = (value = 1, comparedValue = 1): string => (((value / comparedValue) - 1) * 100).toFixed(1);
export const filterUnitTypeMap = {
  STUDIO: 1,
  ONE_BEDROOM: 2,
  TWO_BEDROOM: 3,
  THREE_BEDROOM: 4,
  FOUR_BEDROOM: 5,
};

export const successCallback = (): number => toast.success('Watchlist updated', toastOptions as ToastOptions);
export const REPORT_SETTINGS = 'compete-report-settings';
export const HISTORICAL_FILTERS = 'compete-historical';
export const RENT_COMPARE = 'rent-compare';
export const RENT_COMPS = 'rent-comps';
export const AVAILABLE_UNIT = 'available-unit';
export const ALERT_RENT = 'alert-rent';
export const ALERT_CONCESSION = 'alert-concession';
export const ALERT_TAB = 'alert-log-tab';

export const prepareLastDate = (chart: PrepareDate): PrepareDate => {
  const newChart = chart.chart_values;
  newChart[newChart.length - 1].end_date = moment().format('YYYY-MM-DD');

  return { ...chart, chart_values: newChart };
};
export const multiSelectProps = {
  closeMenuOnSelect: false,
  isMulti: true,
  hideSelectedOptions: false,
  backspaceRemovesValue: false,
  getOptionLabel: (option: ExploreMarket): string => option.name,
  getOptionValue: (option: ExploreMarket): number => option.id,
  className: 'mb-5 ml-25',
};
export const unitTypeLabels = {
  COMBINED: 'Combined',
  STUDIO: 'Studio',
  ONE_BEDROOM: '1 bed',
  TWO_BEDROOM: '2 bed',
  THREE_BEDROOM: '3 bed',
  FOUR_BEDROOM: '4 bed',
  FIVE_BEDROOM: '5 bed',
};
