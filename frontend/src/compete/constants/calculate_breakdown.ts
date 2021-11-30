import { maxBy, minBy, meanBy, get } from 'lodash';
import moment from 'moment';
import { currencyFormat, compareValue } from 'compete/constants';

interface BreakdownData {
  date?: string,
  start_date?: string,
  end_date?: string,
  value?: number,
  type?: string,
  infoType?: string,
  info?: string,
}

const calculateDiff = (value: number, dataDiff: BreakdownData[], type: string, isPercent = false) => {
  if (dataDiff) {
    switch (type) {
      case 'high': {
        const maxValue = maxBy(dataDiff, 'value') || {};
        const diffHigh = value - get(maxValue, 'value', 0);
        const diffPercentHigh = get(maxValue, 'value') ? compareValue(value, get(maxValue, 'value')) : 0;
        return {
          infoType: value > get(maxValue, 'value', 0) ? 'success' : 'danger',
          info: !isPercent ? `${diffHigh > 0 ? '+' : '-'}$${currencyFormat(Math.abs(diffHigh))} (${diffPercentHigh}%)` : `${diffHigh > 0 ? '+' : ''}${currencyFormat(diffHigh)}% (${diffPercentHigh}%)`,
        };
      }
      case 'low': {
        const minValue = minBy(dataDiff.filter(el => el.value), 'value') || {};
        const diff = value - get(minValue, 'value', 0);
        const diffPercent = get(minValue, 'value') ? compareValue(value, get(minValue, 'value')) : 0;
        return {
          infoType: value > get(minValue, 'value', 0) ? 'success' : 'danger',
          info: !isPercent ? `${diff > 0 ? '+' : '-'}$${currencyFormat(Math.abs(diff))} (${diffPercent}%)` : `${diff > 0 ? '+' : ''}${currencyFormat(diff)}% (${diffPercent}%)`,
        };
      }
      case 'avg': {
        const avgValue = meanBy(dataDiff.filter(el => el.value), 'value');
        const diffAvg = value - avgValue;
        const diffPercentAvg = avgValue ? compareValue(value, avgValue) : 0;
        return {
          infoType: value > avgValue ? 'success' : 'danger',
          info: !isPercent ? `${diffAvg > 0 ? '+' : '-'}$${currencyFormat(Math.abs(diffAvg))} (${diffPercentAvg}%)` : `${diffAvg > 0 ? '+' : ''}${currencyFormat(diffAvg)}% (${diffPercentAvg}%)`,
        };
      }
      default:
        return null;
    }
  }
  return {};
};

export default (type: string, data: BreakdownData[], isMonthlyFormat: boolean, dataDiff = null, isPercent = false): BreakdownData[] => {
  const maxValue = maxBy(data, 'value') || {};
  const minValue = minBy(data, 'value') || { value: 0 };
  const avgValue = meanBy(data, 'value');

  return [
    {
      date: isMonthlyFormat ? moment(maxValue.start_date).format('MMM YYYY') : `${moment(maxValue.start_date).format('ll')} - ${moment(maxValue.end_date).format('ll')}`,
      value: maxValue.value,
      type: `${type} HIGH`,
      ...calculateDiff(maxValue.value, dataDiff, 'high', isPercent),
    },
    {
      date: isMonthlyFormat ? moment(minValue.start_date).format('MMM YYYY') : `${moment(minValue.start_date).format('ll')} - ${moment(minValue.end_date).format('ll')}`,
      value: minValue.value,
      type: `${type} LOW`,
      ...calculateDiff(minValue.value, dataDiff, 'low', isPercent),
    },
    { date: 'Entire Period', value: avgValue || 0, type: `AVG ${type}`, ...calculateDiff(avgValue || 0, dataDiff, 'avg', isPercent) },
  ];
};
