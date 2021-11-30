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
  const isMarketRentLoaded = useSelector(state => state.historicalReport.isMarketRentLoaded);
  const marketRent = useSelector(state => state.historicalReport.marketRent);
  const marketDetail = useSelector(state => state.market.marketDetail);
  const isMarketOccupancyLoaded = useSelector(state => state.historicalReport.isMarketOccupancyLoaded);
  const marketOccupancy = useSelector(state => state.historicalReport.marketOccupancy);
  const isMarketConcessionLoaded = useSelector(state => state.historicalReport.isMarketConcessionLoaded);
  const marketConcession = useSelector(state => state.historicalReport.marketConcession);

  const { getHistoricalMarketRent, getHistoricalMarketOccupancy, getHistoricalMarketConcession } = history;

  return (
    <Historical
      reportSettings={reportSettings}
      getHistoricalRent={getHistoricalMarketRent}
      getHistoricalOccupancy={getHistoricalMarketOccupancy}
      getHistoricalConcession={getHistoricalMarketConcession}
      isRentLoaded={isMarketRentLoaded}
      historicalRent={marketRent}
      entityDetail={marketDetail}
      isOccupancyLoaded={isMarketOccupancyLoaded}
      historicalOccupancy={marketOccupancy}
      isConcessionLoaded={isMarketConcessionLoaded}
      historicalConcession={marketConcession}
    />
  );
};

export default withRouter(HistoricalReport);
