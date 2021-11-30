import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import history from 'compete/actions/historical_report';
import { Historical } from 'compete/components';
import { ReportSettings } from 'src/interfaces';

interface HistoricalReportProps extends RouteComponentProps {
  reportSettings: ReportSettings,
}

const HistoricalReport: FC<HistoricalReportProps> = ({ reportSettings }) => {
  const submarketDetail = useSelector(state => state.submarket.submarketDetail);
  const isSubmarketRentLoaded = useSelector(state => state.historicalReport.isSubmarketRentLoaded);
  const submarketRent = useSelector(state => state.historicalReport.submarketRent);
  const isSubmarketOccupancyLoaded = useSelector(state => state.historicalReport.isSubmarketOccupancyLoaded);
  const submarketOccupancy = useSelector(state => state.historicalReport.submarketOccupancy);
  const isSubmarketConcessionLoaded = useSelector(state => state.historicalReport.isSubmarketConcessionLoaded);
  const submarketConcession = useSelector(state => state.historicalReport.submarketConcession);

  const { getHistoricalSubmarketRent, getHistoricalSubmarketOccupancy, getHistoricalSubmarketConcession } = history;

  return (
    <Historical
      reportSettings={reportSettings}
      getHistoricalRent={getHistoricalSubmarketRent}
      getHistoricalOccupancy={getHistoricalSubmarketOccupancy}
      getHistoricalConcession={getHistoricalSubmarketConcession}
      isRentLoaded={isSubmarketRentLoaded}
      historicalRent={submarketRent}
      entityDetail={submarketDetail}
      isOccupancyLoaded={isSubmarketOccupancyLoaded}
      historicalOccupancy={submarketOccupancy}
      isConcessionLoaded={isSubmarketConcessionLoaded}
      historicalConcession={submarketConcession}
    />
  );
};

export default withRouter(HistoricalReport);
