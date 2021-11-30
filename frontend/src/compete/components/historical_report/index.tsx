import React, { useState, useEffect, FC } from 'react';
import { useDispatch } from 'react-redux';
import Charts from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'fusioncharts/react-fusioncharts';
import FusionCharts from 'fusioncharts/fusioncharts';
import { asAmountRent, filtersFormat, reportSettingsFilters, HISTORICAL_FILTERS } from 'compete/constants';
import { ReportSettings, HistoricalRequestProps, HistoricalChart, SubmarketDetail } from 'src/interfaces';
import RentHistory from './rent_history';
import OccupancyHistory from './occupancy_history';
import ConcessionHistory from './concession_history';
import RentCompare from './rent_compared';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface HistoricalReportProps {
  reportSettings: ReportSettings,
  getHistoricalRent: (id: number, params?: HistoricalRequestProps) => void,
  getHistoricalOccupancy: (id: number, params?: HistoricalRequestProps) => void,
  getHistoricalConcession: (id: number, params?: HistoricalRequestProps) => void,
  isRentLoaded: boolean,
  historicalRent: HistoricalChart,
  entityDetail: SubmarketDetail,
  isOccupancyLoaded: boolean,
  historicalOccupancy: HistoricalChart,
  isConcessionLoaded: boolean,
  historicalConcession: HistoricalChart,
  isProperty?: boolean,
}

const defaultFilters = { rentHistory: { label: 'Combined', value: 'COMBINED' }, concessionsHistory: asAmountRent[0], showRentAs: reportSettingsFilters.showRentAs[0] };

const Historical: FC<HistoricalReportProps> = ({ reportSettings, getHistoricalRent, isRentLoaded, historicalRent, entityDetail, getHistoricalOccupancy,
  isOccupancyLoaded, historicalOccupancy, getHistoricalConcession, isConcessionLoaded, historicalConcession, isProperty }) => {
  const [filters, setFilters] = useState(JSON.parse(localStorage.getItem(HISTORICAL_FILTERS)) || defaultFilters);
  const isDisabledReportingGroup = reportSettingsFilters.exceptPeriod.includes(reportSettings.reportingPeriod);

  const dispatch = useDispatch();

  const commonParams = {
    period: filtersFormat(reportSettings.reportingPeriod),
    group: filtersFormat(isDisabledReportingGroup ? 'Weekly' : reportSettings.reportingGroup),
  };

  useEffect(() => {
    dispatch(getHistoricalRent(entityDetail.id, {
      ...commonParams,
      unit_type: filters.rentHistory.value,
      rent_as: filters.showRentAs.value,
    }));
  }, [reportSettings, filters.rentHistory, filters.showRentAs]);

  useEffect(() => {
    dispatch(getHistoricalOccupancy(entityDetail.id, {
      ...commonParams,
    }));
  }, [reportSettings]);

  useEffect(() => {
    dispatch(getHistoricalConcession(entityDetail.id, {
      ...commonParams,
      show_as: filters.concessionsHistory.value,
    }));
  }, [reportSettings, filters.concessionsHistory]);

  useEffect(() => {
    localStorage.setItem(HISTORICAL_FILTERS, JSON.stringify(filters));
  }, [filters]);

  const isMonthlyReport = !isDisabledReportingGroup && reportSettings.reportingGroup === 'Monthly';
  const isRotateLabel = !isDisabledReportingGroup && !isMonthlyReport;

  return (
    <React.Fragment>
      <RentHistory
        isRentLoaded={isRentLoaded}
        historicalRent={historicalRent}
        filters={filters}
        setFilters={setFilters}
        isMonthlyReport={isMonthlyReport}
        isRotateLabel={isRotateLabel}
      />
      {isProperty &&
        <RentCompare
          reportSettings={reportSettings}
          isMonthlyReport={isMonthlyReport}
          isRotateLabel={isRotateLabel}
          id={entityDetail.id}
          commonParams={commonParams}
        />
      }
      <OccupancyHistory
        isOccupancyLoaded={isOccupancyLoaded}
        historicalOccupancy={historicalOccupancy}
        isMonthlyReport={isMonthlyReport}
        isRotateLabel={isRotateLabel}
      />
      <ConcessionHistory
        isConcessionLoaded={isConcessionLoaded}
        historicalConcession={historicalConcession}
        filters={filters}
        setFilters={setFilters}
        isMonthlyReport={isMonthlyReport}
        isRotateLabel={isRotateLabel}
      />
    </React.Fragment>
  );
};

export default Historical;
