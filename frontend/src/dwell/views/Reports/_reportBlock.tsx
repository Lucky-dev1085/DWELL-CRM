import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import * as m from 'moment';
import actions from 'dwell/actions';
import { reportTypes, reportsFilterChoices } from 'dwell/constants';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { PropertyType } from 'dwell/views/Reports/index';
import { Tooltip } from 'reactstrap';
import {
  DrilldownIcon,
  ReportCard,
  ReportCardBody,
  ReportCardHeader,
  ReportCardText,
  ReportCardTitle,
} from 'dwell/views/Reports/styles';
import { LineSkeleton } from 'src/utils';
import CallsScoringReport from 'dwell/views/Reports/ReportBlocks/_callScoringReport';
import LeadToLeaseReport from './ReportBlocks/_leadToLeaseReport';
import ActivityReport from './ReportBlocks/_activityReport';
import EngagementReport from './ReportBlocks/_engagementReport';
import CallsReport from './ReportBlocks/_callsReport';
import Drilldown from './_drilldownView';
import LeadSourceReport from './ReportBlocks/_leadSourceReport';
import LeadLostReport from './ReportBlocks/_leadLostReport';
import OccupancyLTNReport from './ReportBlocks/_occupancyLtnReport';
import MarketingCompReport from './ReportBlocks/_marketingCompReport';
import ToursReport from './ReportBlocks/_toursReport';
import SiteVisitorReport from './ReportBlocks/_siteVisitorReport';
import ConversionReport from './ReportBlocks/_conversionReport';
import { ListResponse } from '../../../interfaces';
import SourceBehaviorReport from './ReportBlocks/_sourceBehaviorReport';
import DemographicsReport from './ReportBlocks/_demographicsReport';
import DevicesReport from './ReportBlocks/_devicesReport';
import SeoScoreReport from './ReportBlocks/_seoScoreReport';
import AcquisitionChannelsReport from './ReportBlocks/_acquisitionChannelsReport';
import FilterDropdown from './_filterDropdown';

interface ReportBlockProps extends RouteComponentProps {
  reportType: string,
  blockType: string,
  compareFilterValue: string,
  setPropertyTypeFilterValue: (property: PropertyType) => void,
  setType: () => void,
  type: string,
  isUpdated: boolean,
  setLeadSourceSizePerPage: (size: number) => void,
  setLeadSourcePage: (page: number) => void,
  setShowPaidOnly: (show: boolean) => void,
  leadSourcePage: number,
  leadSourceSizePerPage: number,
  leadSourceDrilldownSizePerPage: number,
  leadSourceDrilldownPage: number,
  setLeadSourceDrilldownSizePerPage: (size: number) => void,
  setLeadSourceDrilldownPage: (page: number) => void,
  portfolioName: string,
  showPaidOnly: boolean,
  unitType: { id: number },
  setUnitType: () => void,
  attribution: string,
  portfolioType: string,
  setIsAuditionOpen: (show: boolean) => void,
  setAuditionModalType: (type: string) => void,
  overviewReports: { responses: [] },
  dateRangeFilterValue: string,
  isLoaded: boolean,
  customDateStart: m.Moment,
  customDateEnd: m.Moment,
  getLeadSourceDrilldown: (data: {
    id: number,
    date_period: string,
    custom_date_start: string,
    custom_date_end: string,
    attribution: string,
    show_paid_only: boolean,
    drilldown_lead_source_limit: number,
    drilldown_lead_source_page: number,
  }) => Promise<ListResponse>,
  getLeadLostDrilldown: (data: {
    id: number,
    date_period: string,
    custom_date_start: string,
    custom_date_end: string,
    attribution: string,
  }) => Promise<ListResponse>,
  propertyTypeFilterValueId: number,
}

const ReportBlock: FC<ReportBlockProps> = (props) => {
  const { reportType, blockType, compareFilterValue, location: { pathname }, setPropertyTypeFilterValue, setType, type, isUpdated, portfolioName,
    setLeadSourceSizePerPage, setLeadSourcePage, leadSourceSizePerPage = 10, leadSourcePage = 1, setShowPaidOnly, showPaidOnly,
    leadSourceDrilldownSizePerPage = 10, leadSourceDrilldownPage = 1, setLeadSourceDrilldownSizePerPage, setLeadSourceDrilldownPage, unitType, setUnitType, attribution = 'PERFORMANCE',
    portfolioType = 'PROPERTY', setIsAuditionOpen, setAuditionModalType, overviewReports, dateRangeFilterValue, isLoaded, customDateStart, customDateEnd,
    getLeadSourceDrilldown, getLeadLostDrilldown, propertyTypeFilterValueId } = props;
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);
  const [isBusinessHours, setIsBusinessHours] = useState(true);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [deviceFilterValue, setDeviceFilterValue] = useState('ALL_DEVICES');

  const openAuditionModal = (auditionType) => {
    setAuditionModalType(auditionType);
    setIsAuditionOpen(true);
  };

  useEffect(() => {
    if (isDrilldownOpen) {
      if (blockType === 'LEAD_SOURCE') {
        getLeadSourceDrilldown({
          id: propertyTypeFilterValueId,
          show_paid_only: showPaidOnly,
          date_period: dateRangeFilterValue,
          custom_date_start: customDateStart && customDateStart.format('MM-DD-YYYY'),
          custom_date_end: customDateEnd && customDateEnd.format('MM-DD-YYYY'),
          drilldown_lead_source_limit: leadSourceDrilldownSizePerPage,
          drilldown_lead_source_page: leadSourceDrilldownPage,
          attribution,
        });
      }
      if (blockType === 'LEAD_LOST') {
        getLeadLostDrilldown({
          id: propertyTypeFilterValueId,
          date_period: dateRangeFilterValue,
          custom_date_start: customDateStart && customDateStart.format('MM-DD-YYYY'),
          custom_date_end: customDateEnd && customDateEnd.format('MM-DD-YYYY'),
          attribution,
        });
      }
    }
  }, [isDrilldownOpen]);

  const level = pathname.includes('/advanced-reports') ? 'portfolio' : 'property';
  return (
    <ReportCard
      className="animated fadeIn"
      style={{ height: (blockType === 'SITE_VISITOR' || blockType === 'CONVERSION' || blockType === 'DEMOGRAPHICS' || blockType === 'DEVICES' || blockType === 'SEO_SCORE' || blockType === 'ACQUISITION_CHANNELS') ? '100%' : 'auto',
        marginTop: (blockType === 'SOURCE_BEHAVIOR' || blockType === 'SEO_SCORE' || blockType === 'ACQUISITION_CHANNELS') ? '1.5rem' : '0px' }}
    >
      <ReportCardHeader show={!['MARKETING_COMP'].includes(blockType)}>
        <div>
          <ReportCardTitle
            active={type === 'property' && blockType === 'ENGAGEMENT' && overviewReports && !isEmpty(overviewReports.responses)}
            onClick={() => (type === 'property' && blockType === 'ENGAGEMENT' && overviewReports && !isEmpty(overviewReports.responses) ? openAuditionModal('RESPONSES') : null)}
          >
            {isLoaded && isUpdated ? reportTypes.REPORT_BLOCK_TYPES[reportType][blockType].name : <LineSkeleton width={200} height={16} />}
          </ReportCardTitle>
          <ReportCardText>{isLoaded && isUpdated ? reportTypes.REPORT_BLOCK_TYPES[reportType][blockType].tooltip : <LineSkeleton height={9} />}</ReportCardText>
        </div>
        {level === 'portfolio' && type === 'portfolio' && isLoaded && isUpdated &&
          <>
            <DrilldownIcon className="ri-fullscreen-fill" onClick={() => setIsDrilldownOpen(true)} id={reportTypes.REPORT_BLOCK_TYPES[reportType][blockType].id} />
            {document.getElementById(reportTypes.REPORT_BLOCK_TYPES[reportType][blockType].id) &&
              <Tooltip trigger="hover" placement="top" isOpen={tooltipOpen} target={reportTypes.REPORT_BLOCK_TYPES[reportType][blockType].id} toggle={() => setTooltipOpen(!tooltipOpen)}>
                {reportTypes.REPORT_BLOCK_TYPES[reportType][blockType].name.substring(0, reportTypes.REPORT_BLOCK_TYPES[reportType][blockType].name.lastIndexOf(' '))} Drilldown
              </Tooltip>}
          </>
        }
        {(blockType === 'SITE_VISITOR' || blockType === 'CONVERSION' || blockType === 'SOURCE_BEHAVIOR' || blockType === 'DEMOGRAPHICS') &&
          <FilterDropdown
            filterType="dateRange"
            icon="ri-calendar-line"
            value={deviceFilterValue}
            onClick={setDeviceFilterValue}
            choices={reportsFilterChoices.DEVICE_TYPE}
          />
        }
      </ReportCardHeader>
      <ReportCardBody upperPadding={['MARKETING_COMP'].includes(blockType)}>
        {blockType === 'LEAD_TO_LEASE' &&
          <LeadToLeaseReport compareFilterValue={compareFilterValue} type={type} isUpdated={isUpdated} attribution={attribution} setIsAuditionOpen={setIsAuditionOpen} setAuditionModalType={setAuditionModalType} period={dateRangeFilterValue} />}
        {blockType === 'ACTIVITY' && <ActivityReport compareFilterValue={compareFilterValue} type={type} isUpdated={isUpdated} period={dateRangeFilterValue} />}
        {blockType === 'TOURS' && <ToursReport compareFilterValue={compareFilterValue} type={type} isUpdated={isUpdated} period={dateRangeFilterValue} />}
        {blockType === 'ENGAGEMENT' && <EngagementReport compareFilterValue={compareFilterValue} type={type} isUpdated={isUpdated} isBusinessHours={isBusinessHours} setIsBusinessHours={setIsBusinessHours} period={dateRangeFilterValue} />}
        {blockType === 'CALLS' && <CallsReport compareFilterValue={compareFilterValue} type={type} isUpdated={isUpdated} portfolioType={portfolioType} period={dateRangeFilterValue} />}
        {blockType === 'LEAD_SOURCE' &&
          <LeadSourceReport
            compareFilterValue={compareFilterValue}
            type={type}
            isUpdated={isUpdated}

            setLeadSourceSizePerPage={setLeadSourceSizePerPage}
            setLeadSourcePage={setLeadSourcePage}
            setShowPaidOnly={setShowPaidOnly}
            showPaidOnly={showPaidOnly}
            sizePerPage={leadSourceSizePerPage}
            page={leadSourcePage}
          />}
        {blockType === 'LEAD_LOST' && <LeadLostReport compareFilterValue={compareFilterValue} type={type} isUpdated={isUpdated} period={dateRangeFilterValue} />}
        {blockType === 'OCCUPANCY_LTN' && <OccupancyLTNReport compareFilterValue={compareFilterValue} type={type} isUpdated={isUpdated} unitType={unitType} setUnitType={setUnitType} period={dateRangeFilterValue} />}
        {blockType === 'MARKETING_COMP' && <MarketingCompReport compareFilterValue={compareFilterValue} type={type} isUpdated={isUpdated} setIsDrilldownOpen={setIsDrilldownOpen} period={dateRangeFilterValue} />}
        {blockType === 'CALL_SCORING' && <CallsScoringReport compareFilterValue={compareFilterValue} type={type} isUpdated={isUpdated} period={dateRangeFilterValue} customDateStart={customDateStart} customDateEnd={customDateEnd} />}
        {blockType === 'SITE_VISITOR' &&
          <SiteVisitorReport compareFilterValue={compareFilterValue} type={type} isUpdated={isUpdated} attribution={attribution} period={dateRangeFilterValue} />}
        {blockType === 'CONVERSION' &&
          <ConversionReport compareFilterValue={compareFilterValue} type={type} isUpdated={isUpdated} attribution={attribution} period={dateRangeFilterValue} />}
        {/* {blockType === 'SOURCE_BEHAVIOR' &&
          <SourceBehaviorReport compareFilterValue={compareFilterValue} type={type} isUpdated={isUpdated} attribution={attribution} period={dateRangeFilterValue} />} */}
        {blockType === 'DEMOGRAPHICS' &&
          <DemographicsReport compareFilterValue={compareFilterValue} type={type} isUpdated={isUpdated} attribution={attribution} period={dateRangeFilterValue} />}
        {/* {blockType === 'DEVICES' &&
          <DevicesReport compareFilterValue={compareFilterValue} type={type} isUpdated={isUpdated} attribution={attribution} period={dateRangeFilterValue} />}
        {blockType === 'SEO_SCORE' &&
          <SeoScoreReport compareFilterValue={compareFilterValue} type={type} isUpdated={isUpdated} attribution={attribution} period={dateRangeFilterValue} />}
        {blockType === 'ACQUISITION_CHANNELS' &&
          <AcquisitionChannelsReport compareFilterValue={compareFilterValue} type={type} isUpdated={isUpdated} attribution={attribution} period={dateRangeFilterValue} />} */}
      </ReportCardBody>
      {level === 'portfolio' && type === 'portfolio' &&
        <Drilldown
          show={isDrilldownOpen}
          type={type}
          reportType={reportType}
          blockType={blockType}
          portfolioName={portfolioName}
          handleClose={() => setIsDrilldownOpen(false)}
          setPropertyTypeFilterValue={setPropertyTypeFilterValue}
          setType={setType}

          sizePerPage={leadSourceDrilldownSizePerPage}
          page={leadSourceDrilldownPage}
          setSizePerPage={setLeadSourceDrilldownSizePerPage}
          setPage={setLeadSourceDrilldownPage}
          setShowPaidOnly={setShowPaidOnly}
          showPaidOnly={showPaidOnly}
          isBusinessHours={isBusinessHours}
        />}
    </ReportCard>
  );
};

const mapStateToProps = state => ({
  overviewReports: state.report.overviewReports,
  isLoaded: state.report.isLoaded,
});

export default connect(mapStateToProps, {
  ...actions.report,
})(withRouter(ReportBlock));
