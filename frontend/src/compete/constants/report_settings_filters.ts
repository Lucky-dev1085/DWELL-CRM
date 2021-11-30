export default {
  reportingPeriod: ['Last 4 weeks', 'This month', 'Last 3 months', 'Last 6 months', 'Last 12 months'],
  exceptPeriod: ['Last 4 weeks', 'This month'],
  reportingGroup: ['Monthly', 'Weekly'],
  showRentAs: [{ label: 'Per Unit', value: 'UNIT' }, { label: 'Per SqFt', value: 'SQFT' }],
  showRentFor: ['Combined', '1x1', '1x2', '2x2', '2x3'],
  showRentForOptions: [
    { label: 'Combined', value: 'COMBINED' }, { label: 'Studio', value: 'STUDIO' }, { label: '1 bed', value: 'ONE_BEDROOM' },
    { label: '2 bed', value: 'TWO_BEDROOM' }, { label: '3 bed', value: 'THREE_BEDROOM' }, { label: '4 bed', value: 'FOUR_BEDROOM' },
  ],
};
