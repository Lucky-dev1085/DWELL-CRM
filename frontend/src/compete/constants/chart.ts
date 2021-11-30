import moment from 'moment';
import { currencyFormat } from 'compete/constants';
import { ChartData } from 'src/interfaces';

interface CommonSetting {
  theme?: string,
  usePlotGradientColor?: string,
  plotGradientColor?: string,
  plotFillAngle?: string,
  plotFillAlpha?: string,
  plotFillRatio?: string,
  showPlotBorder?: string,
  drawFullAreaBorder?: string,
  plotBorderColor?: string,
  anchorAlpha?: string,
  anchorBgColor?: string,
  anchorBorderColor?: string,
  plotFillColor?: string,
  plotBorderAlpha?: string,
  maxLabelHeight?: number,
  drawCrossLine?: number,
  crossLineAlpha?: number,
  labelDisplay?: string,
  labelFont?: string,
  labelFontColor?: string,
  labelFontSize?: string,
  numberPrefix?: string,
  outCnvBaseFont?: string,
  outCnvBaseFontColor?: string,
  outCnvBaseFontSize?: string,
  toolTipBorderColor?: string,
  toolTipBgColor?: string,
  toolTipBgAlpha?: string,
  yAxisMaxValue?: number,
  numberSuffix?: string,
  formatNumberScale?: number,
  bgColor?: string,
}

interface CompareDataset {
  value: number,
  color: string,
  label: string,
  anchorBgColor: string,
  anchorBorderColor: string,
  tooltext: string,
}

interface ChartConfig {
  type: string,
  width: string,
  height: number,
  containerBackgroundOpacity?: string,
  dataFormat: string,
  dataSource: {
    chart: CommonSetting,
    data?: {
      value: number,
      color: string,
      label: string,
      tooltext: string,
    },
    categories?: { category: { label: string }[] }[],
    dataset?: { data: CompareDataset[] }[],
  },
}

const chartCommonSetting = (colors, type: string, isRotate = false, isUnitPricing: boolean): CommonSetting => ({
  labelFont: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
  labelFontColor: '6b7280',
  labelFontSize: '10',
  theme: 'fusion',
  usePlotGradientColor: '1',
  plotGradientColor: '#ffffff',
  plotFillAngle: '90',
  plotFillAlpha: '20',
  plotFillRatio: '10,100',
  showPlotBorder: '1',
  drawFullAreaBorder: '0',
  plotBorderColor: colors.primaryColor,
  anchorAlpha: '100',
  anchorBgColor: colors.secondaryColor,
  anchorBorderColor: colors.primaryColor,
  plotFillColor: colors.primaryColor,
  plotBorderAlpha: '100',
  maxLabelHeight: 150,
  drawCrossLine: 1,
  crossLineAlpha: 70,
  labelDisplay: isRotate ? 'rotate' : 'none',
  numberPrefix: type === 'currency' ? '$' : null,
  outCnvBaseFont: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
  outCnvBaseFontColor: '6b7280',
  outCnvBaseFontSize: '10',
  toolTipBorderColor: '#0b2151',
  toolTipBgColor: 'rgba(0, 0, 0, 0);',
  toolTipBgAlpha: '80',
  yAxisMaxValue: type === 'percent' ? 100 : null,
  numberSuffix: type === 'percent' ? '%' : null,
  formatNumberScale: 0,
  bgColor: isUnitPricing ? '#f7f8fc' : '#ffffff',
});

const tooltipHeader = (value: number, date: string, colors, isCurrency: boolean, isMonthlyFormat: boolean, end_date: string, isUnitPricing): string =>
  `<div style="background-color:rgba(0, 0, 0, 0.1);color:#fff;border-radius: 4px;padding: 5px 5px 0 5px;margin: -6px;text-align: left;">
    <h6 style="font-weight:600;margin-bottom:3px;font-size:12px;font-family:'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;">
      ${isMonthlyFormat ? moment(date).format(isUnitPricing ? 'll' : 'MMM YYYY') : `${moment(date).format('ll')} - ${moment(end_date).format('ll')}`}
    </h6>
    <div style="display:flex;align-items:center;">
      <div style="width:13px;height:13px;border:1px solid ${colors.primaryColor};background-color:${colors.secondaryColor};margin-right:2px;"></div>
      <span style="font-size:12px;font-family:'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;">${value > 0 ? '' : '-'}${isCurrency ? '$' : ''}${currencyFormat(Math.abs(value))}${!isCurrency ? '%' : ''}</span>
    </div>
  </div>`;

const responseTimeDataSource = (dataset, type, colors, isMonthlyFormat, isRotate, isUnitPricing) => ({
  chart: chartCommonSetting(colors, type, isRotate, isUnitPricing),
  data: dataset.map(({ value, end_date, start_date }) =>
    ({
      value,
      color: colors.primaryColor,
      label: isMonthlyFormat ? moment(start_date).format(isUnitPricing ? 'll' : 'MMM YYYY') : `${moment(start_date).format('ll')} - ${moment(end_date).format('ll')}`,
      tooltext: `${tooltipHeader(value, start_date, colors, type === 'currency', isMonthlyFormat, end_date, isUnitPricing)}`,
    })),
});

const defaultColors = { primaryColor: '#2E75F9', secondaryColor: '#dceafe' };
const defaultMultiColors = { primaryColor1: '#2E75F9', secondaryColor1: '#dceafe', primaryColor2: '#21c6b7', secondaryColor2: '#21c6b7' };

export const chartConfigs = (dataset: ChartData[], isMonthlyFormat: boolean, isRotate: boolean, type = 'currency', isUnitPricing = false, colors = defaultColors): ChartConfig => ({
  type: 'area2d',
  width: '100%',
  height: 350,
  containerBackgroundOpacity: '0',
  dataFormat: 'json',
  dataSource: responseTimeDataSource(dataset, type, colors, isMonthlyFormat, isRotate, isUnitPricing),
});

const dataSourceMulti = (dataset1, dataset2, type, colors, isMonthlyFormat, isRotate) => ({
  chart: {
    labelFont: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
    labelFontColor: '6b7280',
    labelFontSize: '10',
    theme: 'fusion',
    maxLabelHeight: 150,
    drawCrossLine: 1,
    crossLineAlpha: 70,
    labelDisplay: isRotate ? 'rotate' : 'none',
    numberPrefix: type === 'currency' ? '$' : null,
    outCnvBaseFont: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
    outCnvBaseFontColor: '6b7280',
    outCnvBaseFontSize: '10',
    toolTipBorderColor: '#0b2151',
    toolTipBgColor: 'rgba(0, 0, 0, 0);',
    toolTipBgAlpha: '80',
    tooltipColor: '#ffffff',
    yAxisMaxValue: type === 'percent' ? 100 : null,
    numberSuffix: type === 'percent' ? '%' : null,
    formatNumberScale: 0,
  },
  categories: [{
    category: dataset1.map(({ end_date, start_date }) => ({
      label: isMonthlyFormat ? moment(start_date).format('MMM YYYY') : `${moment(start_date).format('ll')} - ${moment(end_date).format('ll')}`,
    })),
  }],
  dataset: [{
    data: dataset1.map(({ value, end_date, start_date }) => ({
      value,
      color: colors.primaryColor1,
      label: isMonthlyFormat ? moment(start_date).format('MMM YYYY') : `${moment(start_date).format('ll')} - ${moment(end_date).format('ll')}`,
      anchorBgColor: colors.secondaryColor1,
      anchorBorderColor: colors.primaryColor1,
      tooltext: `${isMonthlyFormat ? moment(start_date).format('MMM YYYY') : `${moment(start_date).format('ll')} - ${moment(end_date).format('ll')}`}, ${type === 'currency' ? '$' : ''}${currencyFormat(value)}${type !== 'currency' ? '%' : ''}`,
    })),
  },
  {
    data: dataset2.map(({ value, end_date, start_date }) => ({
      value,
      color: colors.primaryColor2,
      label: isMonthlyFormat ? moment(start_date).format('MMM YYYY') : `${moment(start_date).format('ll')} - ${moment(end_date).format('ll')}`,
      anchorBgColor: colors.secondaryColor2,
      anchorBorderColor: colors.primaryColor2,
      tooltext: `${isMonthlyFormat ? moment(start_date).format('MMM YYYY') : `${moment(start_date).format('ll')} - ${moment(end_date).format('ll')}`}, ${type === 'currency' ? '$' : ''}${currencyFormat(value)}${type !== 'currency' ? '%' : ''}`,
    })),
  },
  ],
});

export const chartCompareConfigs = (dataset1: ChartData[], dataset2: ChartData[], isMonthlyFormat: boolean, isRotate: boolean, type = 'currency', colors = defaultMultiColors): ChartConfig => ({
  type: 'msline',
  width: '100%',
  height: 350,
  dataFormat: 'json',
  dataSource: dataSourceMulti(dataset1, dataset2, type, colors, isMonthlyFormat, isRotate),
});
