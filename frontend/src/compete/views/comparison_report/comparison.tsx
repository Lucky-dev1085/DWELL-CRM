import React, { useState, useEffect, FC } from 'react';
import { useDispatch } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Charts from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'fusioncharts/react-fusioncharts';
import FusionCharts from 'fusioncharts/fusioncharts';
import historicalReportActions from 'compete/actions/historical_report';
import { asAmountRent, reportSettingsFilters, filtersFormat, HISTORICAL_FILTERS } from 'compete/constants';
import { ReportSettings, SubjectAsset } from 'src/interfaces';
import RentComparison from './_rent_comparison';
import OccupancyComparison from './_occupancy_comparison';
import ConcessionComparison from './_concession_comparison';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface ComparisonChartsProps extends RouteComponentProps {
  reportSettings: ReportSettings,
  subjectAsset: SubjectAsset,
  comparedAgainst: SubjectAsset,
  comparisonId: number,
  includeSubject: boolean,
}

const defaultFilters = { rentHistory: { label: 'Combined', value: 'COMBINED' }, concessionsHistory: asAmountRent[0], showRentAs: reportSettingsFilters.showRentAs[0] };

const ComparisonCharts: FC<ComparisonChartsProps> = ({ subjectAsset, comparedAgainst, reportSettings, comparisonId, includeSubject }) => {
  const [filters, setFilters] = useState(JSON.parse(localStorage.getItem(HISTORICAL_FILTERS)) || defaultFilters);
  const [rentAssetData, setRentAsset] = useState(null);
  const [rentComparedData, setRentCompared] = useState(null);
  const [occupancyAssetData, setOccupancyAsset] = useState(null);
  const [occupancyComparedData, setOccupancyCompared] = useState(null);
  const [concessionAssetData, setConcessionAsset] = useState(null);
  const [concessionComparedData, setConcessionCompared] = useState(null);

  const dispatch = useDispatch();
  const { getHistoricalMarketRent, getHistoricalPropertyRent, getHistoricalSubmarketRent, getHistoricalPropertyOccupancy, getHistoricalSubmarketOccupancy,
    getHistoricalMarketOccupancy, getHistoricalPropertyConcession, getHistoricalSubmarketConcession, getHistoricalMarketConcession } = historicalReportActions;

  const isDisabledReportingGroup = reportSettingsFilters.exceptPeriod.includes(reportSettings.reportingPeriod);
  const commonParams = {
    period: filtersFormat(reportSettings.reportingPeriod),
    group: filtersFormat(isDisabledReportingGroup ? 'Weekly' : reportSettings.reportingGroup),
    comparison: comparisonId,
    include_subject_asset: includeSubject,
  };

  const getHistoricalRentData = (type, id) => {
    const payload = {
      ...commonParams,
      unit_type: filters.rentHistory.value,
      rent_as: filters.showRentAs.value,
    };

    switch (type) {
      case 'property':
      case 'competitor':
        return dispatch(getHistoricalPropertyRent(id, payload));
      case 'market':
        return dispatch(getHistoricalMarketRent(id, payload));
      case 'submarket':
        return dispatch(getHistoricalSubmarketRent(id, payload));
      default:
        return null;
    }
  };

  const getHistoricalOccupancyData = (type, id) => {
    switch (type) {
      case 'property':
      case 'competitor':
        return dispatch(getHistoricalPropertyOccupancy(id, commonParams));
      case 'market':
        return dispatch(getHistoricalMarketOccupancy(id, commonParams));
      case 'submarket':
        return dispatch(getHistoricalSubmarketOccupancy(id, commonParams));
      default:
        return null;
    }
  };

  const getHistoricalConcessionData = (type, id) => {
    const payload = {
      ...commonParams,
      show_as: filters.concessionsHistory.value,
    };

    switch (type) {
      case 'property':
      case 'competitor':
        return dispatch(getHistoricalPropertyConcession(id, payload));
      case 'market':
        return dispatch(getHistoricalMarketConcession(id, payload));
      case 'submarket':
        return dispatch(getHistoricalSubmarketConcession(id, payload));
      default:
        return null;
    }
  };

  useEffect(() => {
    getHistoricalRentData(subjectAsset.type, subjectAsset.value.id).then(({ result: { data } }) => setRentAsset(data));
    getHistoricalRentData(comparedAgainst.type, comparedAgainst.value.id).then(({ result: { data } }) => setRentCompared(data));
  }, [reportSettings, filters.rentHistory, filters.showRentAs, includeSubject]);

  useEffect(() => {
    getHistoricalOccupancyData(subjectAsset.type, subjectAsset.value.id).then(({ result: { data } }) => setOccupancyAsset(data));
    getHistoricalOccupancyData(comparedAgainst.type, comparedAgainst.value.id).then(({ result: { data } }) => setOccupancyCompared(data));
  }, [reportSettings, includeSubject]);

  useEffect(() => {
    getHistoricalConcessionData(subjectAsset.type, subjectAsset.value.id).then(({ result: { data } }) => setConcessionAsset(data));
    getHistoricalConcessionData(comparedAgainst.type, comparedAgainst.value.id).then(({ result: { data } }) => setConcessionCompared(data));
  }, [reportSettings, filters.concessionsHistory, includeSubject]);

  useEffect(() => {
    localStorage.setItem(HISTORICAL_FILTERS, JSON.stringify(filters));
  }, [filters]);

  const isMonthlyReport = !isDisabledReportingGroup && reportSettings.reportingGroup === 'Monthly';
  const isRotateLabel = !isDisabledReportingGroup && !isMonthlyReport;

  return (
    <React.Fragment>
      <RentComparison
        rentAssetData={rentAssetData}
        filters={filters}
        setFilters={setFilters}
        subjectAsset={subjectAsset}
        comparedAgainst={comparedAgainst}
        rentComparedData={rentComparedData}
        isMonthlyReport={isMonthlyReport}
        isRotateLabel={isRotateLabel}
      />
      <OccupancyComparison
        occupancyAssetData={occupancyAssetData}
        subjectAsset={subjectAsset}
        comparedAgainst={comparedAgainst}
        occupancyComparedData={occupancyComparedData}
        isMonthlyReport={isMonthlyReport}
        isRotateLabel={isRotateLabel}
      />
      <ConcessionComparison
        concessionAssetData={concessionAssetData}
        filters={filters}
        setFilters={setFilters}
        subjectAsset={subjectAsset}
        comparedAgainst={comparedAgainst}
        concessionComparedData={concessionComparedData}
        isMonthlyReport={isMonthlyReport}
        isRotateLabel={isRotateLabel}
      />
    </React.Fragment>
  );
};

export default withRouter(ComparisonCharts);
