import React, { FC, useEffect, useRef, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import axios, { CancelTokenStatic } from 'axios';
import { Col, Row } from 'reactstrap';
import { reportsFilterChoices } from 'dwell/constants';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { toast, ToastOptions } from 'react-toastify';
import actions from 'dwell/actions';
import { isEmpty } from 'lodash';
import moment from 'moment-timezone/builds/moment-timezone-with-data';
import { ContainerFluid } from 'styles/common';
import { ListResponse } from 'src/interfaces';
import { toastError } from 'site/constants';
import { ContentHeader, ContentText, ContentTitle, ContentTitleWrapper } from 'dwell/views/Reports/styles';
import AuditionModal from './_auditionModal';
import FilterDropdown from './_filterDropdown';
import ReportBlock from './_reportBlock';
import PropertyTypeFilter from './_propertyTypeFilter';

export interface PropertyType {
  id: number,
  type: string,
  name: string,
}

interface Unit {
  id: number,
}

interface ReportsProps extends RouteComponentProps {
  getPortfolios: ({ show_all: boolean }) => Promise<ListResponse>,
  getOverviewReports: (data: {
    id: number,
    date_period: string,
    custom_date_start: string,
    custom_date_end: string,
    type: string,
    compare_value: string,
    attribution: string,
  }, token?: CancelTokenStatic) => Promise<ListResponse>,
  getMarketingReports: (data: {
    id: number,
    date_period: string,
    custom_date_start: string,
    custom_date_end: string,
    type: string,
    compare_value: string,
    attribution: string,
    show_paid_only: boolean,
    lead_source_limit: number,
    lead_source_page: number,
    drilldown_lead_source_limit: number,
    drilldown_lead_source_page: number,
  }, token?: CancelTokenStatic) => Promise<ListResponse>,
  getOperationsReports: (data: {
    id: number,
    date_period: string,
    custom_date_start: string,
    custom_date_end: string,
    type: string,
    compare_value: string,
    unit_type?: number;
  }, token?: CancelTokenStatic) => Promise<ListResponse>,
  getSitesReports: (data: {
    id: number,
    date_period: string,
    custom_date_start: string,
    custom_date_end: string,
    type: string,
    compare_value: string,
    attribution: string,
  }, token?: CancelTokenStatic) => Promise<ListResponse>,
  clearReports: () => void,
  currentProperty: PropertyType,
  portfolios: PropertyType[],
  startDate: string,
  endDate: string,
  pushReport: { id: number } | { id: number }[],
  pusherClear: () => void,
  getLeadSourceDrilldown: (data: {
    id: number,
    date_period: string,
    custom_date_start: string,
    custom_date_end: string,
    attribution: string,
    show_paid_only: boolean,
    drilldown_lead_source_limit: number,
    drilldown_lead_source_page: number,
  }, token?: CancelTokenStatic) => Promise<ListResponse>,
  getSourcesCalls: (data: {
    id: number,
    date_period: string,
    custom_date_start: string,
    custom_date_end: string,
    type,
  }) => Promise<ListResponse>,
}

const Reports: FC<ReportsProps> = (props) => {
  const { location: { pathname }, getPortfolios, getOverviewReports, getMarketingReports, getOperationsReports, getSitesReports,
    currentProperty, portfolios, startDate = '', endDate = '', pushReport, pusherClear, clearReports,
    getLeadSourceDrilldown, getSourcesCalls } = props;
  const level = pathname.includes('/advanced-reports') ? 'portfolio' : 'property';

  const [isUpdated, setIsUpdated] = useState(false);
  const [dateRangeFilterValue, setDateRangeFilterValue] = useState(moment().isoWeekday() === 0 ? 'THIS_MONTH' : 'THIS_WEEK');
  const [compareFilterValue, setCompareFilterValue] = useState(level === 'property' ? 'PREVIOUS_PERIOD' : '');
  const [reportTypeFilterValue, setReportTypeFilterValue] = useState('OVERVIEW_REPORTS');
  const [propertyTypeFilterValue, setPropertyTypeFilterValue] = useState({} as PropertyType);
  const [customDateStart, setCustomDateStart] = useState(null);
  const [customDateEnd, setCustomDateEnd] = useState(null);
  const [type, setType] = useState(level);
  const [leadSourceSizePerPage, setLeadSourceSizePerPage] = useState(10);
  const [leadSourcePage, setLeadSourcePage] = useState(1);
  const [showPaidOnly, setShowPaidOnly] = useState(false);
  const [leadSourceDrilldownSizePerPage, setLeadSourceDrilldownSizePerPage] = useState(10);
  const [leadSourceDrilldownPage, setLeadSourceDrilldownPage] = useState(1);
  const [timePeriod, setTimePeriod] = useState('Time period: ');
  const [unitType, setUnitType] = useState({} as Unit);
  const [attribution, setAttribution] = useState('OVERALL');
  const [isAuditionOpen, setIsAuditionOpen] = useState(false);
  const [auditionModalType, setAuditionModalType] = useState('LEADS');
  const [isResetReports, setIsResetReports] = useState(false);
  const cancelToken = useRef(null);

  useEffect(() => {
    clearReports();
    setIsResetReports(true);
    if (level === 'portfolio') {
      getPortfolios({ show_all: true });
    }
  }, []);

  useEffect(() => {
    if (isEmpty(propertyTypeFilterValue) && !isEmpty(portfolios)) {
      const mtPortfolio = portfolios.find(portfolio => portfolio.type === 'MARK_TAYLOR');
      if (mtPortfolio) {
        setPropertyTypeFilterValue(mtPortfolio);
      }
    }
  }, [portfolios]);

  useEffect(() => {
    if (level === 'property') {
      setPropertyTypeFilterValue(currentProperty);
    }
  }, [currentProperty]);

  useEffect(() => {
    if (!['OVERVIEW_REPORTS', 'MARKETING_REPORTS'].includes(reportTypeFilterValue)) {
      setAttribution('OVERALL');
    }
  }, [reportTypeFilterValue]);

  useEffect(() => {
    if ((compareFilterValue === 'COMPANY_WIDE_AVERAGES' && propertyTypeFilterValue.type === 'MARK_TAYLOR')
      || (compareFilterValue === 'PREVIOUS_PERIOD' && dateRangeFilterValue === 'ALL_TIME')) {
      setCompareFilterValue('');
    }
  }, [propertyTypeFilterValue, dateRangeFilterValue]);

  useEffect(() => {
    setIsUpdated(false);
    setShowPaidOnly(false);
  }, [dateRangeFilterValue, reportTypeFilterValue, propertyTypeFilterValue]);

  useEffect(() => {
    if (startDate && endDate) {
      if (dateRangeFilterValue === 'TODAY') {
        setTimePeriod(`Time period: ${moment(startDate).tz('America/Phoenix').format('ll')}`);
      } else {
        setTimePeriod(`Time period: ${moment(startDate).tz('America/Phoenix').format('ll')} - ${moment(endDate).tz('America/Phoenix').format('ll')}`);
      }
    }
  }, [startDate, endDate]);

  const reloadReports = (lsPage = leadSourcePage, lsdPage = leadSourceDrilldownPage) => {
    if ((compareFilterValue === 'PREVIOUS_PERIOD' && dateRangeFilterValue === 'ALL_TIME') ||
      (compareFilterValue === 'COMPANY_WIDE_AVERAGES' && propertyTypeFilterValue.type === 'MARK_TAYLOR')) return;
    if (cancelToken.current) {
      cancelToken.current.cancel('Operation canceled due to new request.');
    }
    cancelToken.current = axios.CancelToken.source();
    if (reportTypeFilterValue === 'OVERVIEW_REPORTS' && propertyTypeFilterValue.id) {
      getOverviewReports({
        id: propertyTypeFilterValue.id,
        date_period: dateRangeFilterValue,
        custom_date_start: customDateStart && customDateStart.format('MM-DD-YYYY'),
        custom_date_end: customDateEnd && customDateEnd.format('MM-DD-YYYY'),
        type,
        compare_value: compareFilterValue,
        attribution,
      }, cancelToken.current.token).then(() => setIsUpdated(true))
        .catch((error) => {
          if (!axios.isCancel(error)) {
            toast.error('There was internal server error. Please contact with our admins.', toastError as ToastOptions);
            setIsUpdated(true);
          }
        });
      getSourcesCalls({
        id: propertyTypeFilterValue.id,
        date_period: dateRangeFilterValue,
        custom_date_start: customDateStart && customDateStart.format('MM-DD-YYYY'),
        custom_date_end: customDateEnd && customDateEnd.format('MM-DD-YYYY'),
        type,
      }).then(() => setIsUpdated(true));
    }
    if (reportTypeFilterValue === 'MARKETING_REPORTS' && propertyTypeFilterValue.id) {
      getMarketingReports({
        id: propertyTypeFilterValue.id,
        show_paid_only: showPaidOnly,
        date_period: dateRangeFilterValue,
        custom_date_start: customDateStart && customDateStart.format('MM-DD-YYYY'),
        custom_date_end: customDateEnd && customDateEnd.format('MM-DD-YYYY'),
        type,
        compare_value: compareFilterValue,
        lead_source_limit: leadSourceSizePerPage,
        lead_source_page: lsPage,
        drilldown_lead_source_limit: leadSourceDrilldownSizePerPage,
        drilldown_lead_source_page: lsdPage,
        attribution,
      }, cancelToken.current.token).then(() => setIsUpdated(true))
        .catch((error) => {
          if (!axios.isCancel(error)) {
            toast.error('There was internal server error. Please contact with our admins.', toastError as ToastOptions);
            setIsUpdated(true);
          }
        });
    }
    if (reportTypeFilterValue === 'OPERATIONS_REPORTS' && propertyTypeFilterValue.id) {
      getOperationsReports({
        id: propertyTypeFilterValue.id,
        date_period: dateRangeFilterValue,
        custom_date_start: customDateStart && customDateStart.format('MM-DD-YYYY'),
        custom_date_end: customDateEnd && customDateEnd.format('MM-DD-YYYY'),
        type,
        compare_value: compareFilterValue,
        unit_type: !isEmpty(unitType) ? unitType.id : null,
      }, cancelToken.current.token).then(() => setIsUpdated(true))
        .catch((error) => {
          if (!axios.isCancel(error)) {
            toast.error('There was internal server error. Please contact with our admins.', toastError as ToastOptions);
            setIsUpdated(true);
          }
        });
    }
    if (reportTypeFilterValue === 'SITES_REPORTS' && propertyTypeFilterValue.id) {
      getSitesReports({
        id: propertyTypeFilterValue.id,
        date_period: dateRangeFilterValue,
        custom_date_start: customDateStart && customDateStart.format('MM-DD-YYYY'),
        custom_date_end: customDateEnd && customDateEnd.format('MM-DD-YYYY'),
        type,
        compare_value: compareFilterValue,
        attribution,
      }, cancelToken.current.token).then(() => setIsUpdated(true))
        .catch((error) => {
          if (!axios.isCancel(error)) {
            toast.error('There was internal server error. Please contact with our admins.', toastError as ToastOptions);
            setIsUpdated(true);
          }
        });
    }
  };

  useEffect(() => {
    if (!isEmpty(pushReport)) {
      reloadReports();
      pusherClear();
    }
  }, [pushReport]);

  useEffect(() => {
    if (reportTypeFilterValue === 'MARKETING_REPORTS' && (leadSourcePage !== 1 || showPaidOnly !== false)) {
      setLeadSourcePage(1);
      setShowPaidOnly(false);
    } else {
      reloadReports();
    }
  }, [dateRangeFilterValue, propertyTypeFilterValue, reportTypeFilterValue, attribution]);

  useEffect(() => {
    reloadReports();
  }, [compareFilterValue, leadSourceSizePerPage, leadSourcePage, unitType]);

  useEffect(() => {
    if (level === 'portfolio' && type === 'portfolio' && reportTypeFilterValue === 'MARKETING_REPORTS') {
      if (cancelToken.current) {
        cancelToken.current.cancel('Operation canceled due to new request.');
      }
      cancelToken.current = axios.CancelToken.source();
      getLeadSourceDrilldown({
        id: propertyTypeFilterValue.id,
        show_paid_only: showPaidOnly,
        date_period: dateRangeFilterValue,
        custom_date_start: customDateStart && customDateStart.format('MM-DD-YYYY'),
        custom_date_end: customDateEnd && customDateEnd.format('MM-DD-YYYY'),
        drilldown_lead_source_limit: leadSourceDrilldownSizePerPage,
        drilldown_lead_source_page: leadSourceDrilldownPage,
        attribution,
      }, cancelToken.current.token);
    }
  }, [leadSourceDrilldownSizePerPage, leadSourceDrilldownPage, showPaidOnly]);

  useEffect(() => {
    if (leadSourcePage !== 1) {
      setLeadSourcePage(1);
    } else reloadReports();
  }, [showPaidOnly]);

  const handleDateRangeChange = (value) => {
    setDateRangeFilterValue(value);
    const data = {
      dateRange: value,
      customDateStart,
      customDateEnd,
      time: new Date(),
    };
    localStorage.setItem('dateFilterValue', JSON.stringify(data));
  };

  useEffect(() => {
    const data = localStorage.getItem('dateFilterValue');
    if (data) {
      const parsedData = JSON.parse(data) as {
        dateRange: string,
        customDateStart: string,
        customDateEnd: string,
        time: string
      };
      if (parsedData.time && moment().diff(moment(parsedData.time), 'minutes') <= 5) {
        if (parsedData.dateRange) {
          setDateRangeFilterValue(parsedData.dateRange);
        }
        if (parsedData.customDateStart) {
          setCustomDateStart(moment(parsedData.customDateStart));
        }
        if (parsedData.customDateEnd) {
          setCustomDateEnd(moment(parsedData.customDateEnd));
        }
      }
    }
  }, []);

  if (!isResetReports) return <></>;

  return (
    <ContainerFluid fluid>
      <Helmet>
        <title>DWELL | Reports</title>
      </Helmet>
      <ContentHeader>
        <ContentTitleWrapper>
          <ContentTitle>Reports</ContentTitle>
          <ContentText>{timePeriod}</ContentText>
        </ContentTitleWrapper>
        <FilterDropdown
          filterType="dateRange"
          icon="ri-calendar-line"
          value={dateRangeFilterValue}
          onClick={handleDateRangeChange}
          choices={reportsFilterChoices.DATE_RANGE_CHOICES}
          disableThisWeek={!isEmpty(startDate) && moment().isoWeekday() === 0}
          setCustomDateStart={setCustomDateStart}
          setCustomDateEnd={setCustomDateEnd}
          customDateStart={customDateStart}
          customDateEnd={customDateEnd}
          reloadReports={reloadReports}
        />
        <FilterDropdown
          filterType="attribution"
          icon="ri-pie-chart-line"
          disablePerformance={!['OVERVIEW_REPORTS', 'MARKETING_REPORTS'].includes(reportTypeFilterValue)}
          value={attribution}
          onClick={setAttribution}
          choices={reportsFilterChoices.ATTRIBUTION_CHOICES}
        />
        <FilterDropdown
          filterType="compare"
          icon="ri-arrow-left-right-line"
          disablePreviousPeriod={dateRangeFilterValue === 'ALL_TIME'}
          disableCompanyWideAverages={!isEmpty(propertyTypeFilterValue) && propertyTypeFilterValue.type === 'MARK_TAYLOR'}
          value={compareFilterValue}
          onClick={setCompareFilterValue}
          choices={reportsFilterChoices.COMPARE_CHOICES}
        />
        {level === 'portfolio' &&
          <PropertyTypeFilter value={propertyTypeFilterValue} onClick={setPropertyTypeFilterValue} setType={setType} />}
        <FilterDropdown
          filterType="reportType"
          icon="ri-bar-chart-fill"
          value={reportTypeFilterValue}
          onClick={setReportTypeFilterValue}
          choices={reportsFilterChoices.REPORT_TYPE_CHOICES}
        />
      </ContentHeader>
      <div>
        {reportTypeFilterValue === 'OVERVIEW_REPORTS' &&
          <React.Fragment>
            <Row>
              <Col xs={12} sm={8}>
                <ReportBlock
                  reportType={reportTypeFilterValue}
                  compareFilterValue={compareFilterValue}
                  blockType="LEAD_TO_LEASE"
                  setPropertyTypeFilterValue={setPropertyTypeFilterValue}
                  setType={setType}
                  type={type}
                  isUpdated={isUpdated}
                  portfolioName={propertyTypeFilterValue.name}
                  unitType={unitType}
                  setUnitType={setUnitType}
                  attribution={attribution}
                  setIsAuditionOpen={setIsAuditionOpen}
                  setAuditionModalType={setAuditionModalType}
                  dateRangeFilterValue={dateRangeFilterValue}
                />
                <ReportBlock
                  reportType={reportTypeFilterValue}
                  compareFilterValue={compareFilterValue}
                  blockType="TOURS"
                  setPropertyTypeFilterValue={setPropertyTypeFilterValue}
                  setType={setType}
                  type={type}
                  isUpdated={isUpdated}
                  portfolioName={propertyTypeFilterValue.name}
                  dateRangeFilterValue={dateRangeFilterValue}
                />
                <ReportBlock
                  reportType={reportTypeFilterValue}
                  compareFilterValue={compareFilterValue}
                  blockType="ACTIVITY"
                  setPropertyTypeFilterValue={setPropertyTypeFilterValue}
                  setType={setType}
                  type={type}
                  isUpdated={isUpdated}
                  portfolioName={propertyTypeFilterValue.name}
                  dateRangeFilterValue={dateRangeFilterValue}
                />
                <ReportBlock
                  reportType={reportTypeFilterValue}
                  compareFilterValue={compareFilterValue}
                  blockType="CALLS"
                  setPropertyTypeFilterValue={setPropertyTypeFilterValue}
                  setType={setType}
                  type={type}
                  isUpdated={isUpdated}
                  portfolioName={propertyTypeFilterValue.name}
                  portfolioType={propertyTypeFilterValue.type || 'PROPERTY'}
                  dateRangeFilterValue={dateRangeFilterValue}
                  customDateStart={customDateStart}
                  customDateEnd={customDateEnd}
                />
              </Col>
              <Col xs={12} sm={4}>
                <ReportBlock
                  reportType={reportTypeFilterValue}
                  compareFilterValue={compareFilterValue}
                  blockType="ENGAGEMENT"
                  setPropertyTypeFilterValue={setPropertyTypeFilterValue}
                  setType={setType}
                  type={type}
                  isUpdated={isUpdated}
                  portfolioName={propertyTypeFilterValue.name}
                  setIsAuditionOpen={setIsAuditionOpen}
                  setAuditionModalType={setAuditionModalType}
                  dateRangeFilterValue={dateRangeFilterValue}
                />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <ReportBlock
                  reportType={reportTypeFilterValue}
                  compareFilterValue={compareFilterValue}
                  blockType="CALL_SCORING"
                  setPropertyTypeFilterValue={setPropertyTypeFilterValue}
                  setType={setType}
                  type={type}
                  isUpdated={isUpdated}
                  portfolioName={propertyTypeFilterValue.name}
                  dateRangeFilterValue={dateRangeFilterValue}
                  customDateStart={customDateStart}
                  customDateEnd={customDateEnd}
                />
              </Col>
            </Row>
          </React.Fragment>}
        {reportTypeFilterValue === 'MARKETING_REPORTS' &&
          <React.Fragment>
            <Row>
              <Col xs={12}>
                <ReportBlock
                  reportType={reportTypeFilterValue}
                  compareFilterValue={compareFilterValue}
                  blockType="LEAD_SOURCE"
                  setPropertyTypeFilterValue={setPropertyTypeFilterValue}
                  setType={setType}
                  type={type}
                  isUpdated={isUpdated}
                  showPaidOnly={showPaidOnly}

                  setLeadSourceSizePerPage={setLeadSourceSizePerPage}
                  setLeadSourcePage={setLeadSourcePage}
                  setShowPaidOnly={setShowPaidOnly}
                  leadSourceSizePerPage={leadSourceSizePerPage}
                  leadSourcePage={leadSourcePage}

                  leadSourceDrilldownSizePerPage={leadSourceDrilldownSizePerPage}
                  leadSourceDrilldownPage={leadSourceDrilldownPage}
                  setLeadSourceDrilldownSizePerPage={setLeadSourceDrilldownSizePerPage}
                  setLeadSourceDrilldownPage={setLeadSourceDrilldownPage}

                  portfolioName={propertyTypeFilterValue.name}
                  dateRangeFilterValue={dateRangeFilterValue}
                  customDateStart={customDateStart}
                  customDateEnd={customDateEnd}
                  propertyTypeFilterValueId={propertyTypeFilterValue.id}
                  attribution={attribution}
                />
              </Col>
              <Col xs={12} sm={6}>
                <ReportBlock
                  reportType={reportTypeFilterValue}
                  compareFilterValue={compareFilterValue}
                  blockType="LEAD_LOST"
                  setPropertyTypeFilterValue={setPropertyTypeFilterValue}
                  setType={setType}
                  type={type}
                  isUpdated={isUpdated}
                  portfolioName={propertyTypeFilterValue.name}
                  dateRangeFilterValue={dateRangeFilterValue}
                  customDateStart={customDateStart}
                  customDateEnd={customDateEnd}
                  propertyTypeFilterValueId={propertyTypeFilterValue.id}
                  attribution={attribution}
                />
              </Col>
            </Row>
          </React.Fragment>}
        {reportTypeFilterValue === 'OPERATIONS_REPORTS' &&
          <React.Fragment>
            <Row>
              {/*  <Col xs={12}> */}
              {/*   <ReportBlock */}
              {/*     reportType={reportTypeFilterValue} */}
              {/*     compareFilterValue={compareFilterValue} */}
              {/*     blockType="OCCUPANCY_LTN" */}
              {/*     setPropertyTypeFilterValue={setPropertyTypeFilterValue} */}
              {/*     setType={setType} */}
              {/*     type={type} */}
              {/*     isUpdated={isUpdated} */}
              {/*     portfolioName={propertyTypeFilterValue.name} */}
              {/*     unitType={unitType} */}
              {/*     setUnitType={setUnitType} */}
              {/*   /> */}
              {/* </Col> */}
              <Col xs={12}>
                <ReportBlock
                  reportType={reportTypeFilterValue}
                  compareFilterValue={compareFilterValue}
                  blockType="MARKETING_COMP"
                  setPropertyTypeFilterValue={setPropertyTypeFilterValue}
                  setType={setType}
                  type={type}
                  isUpdated={isUpdated}
                  portfolioName={propertyTypeFilterValue.name}
                />
              </Col>
            </Row>
          </React.Fragment>}
        {reportTypeFilterValue === 'SITES_REPORTS' &&
          <React.Fragment>
            <Row>
              <Col xs={12} sm={7}>
                <ReportBlock
                  reportType={reportTypeFilterValue}
                  compareFilterValue={compareFilterValue}
                  blockType="SITE_VISITOR"
                  setPropertyTypeFilterValue={setPropertyTypeFilterValue}
                  setType={setType}
                  type={type}
                  isUpdated={isUpdated}
                  portfolioName={propertyTypeFilterValue.name}
                  unitType={unitType}
                  setUnitType={setUnitType}
                  attribution={attribution}
                  setIsAuditionOpen={setIsAuditionOpen}
                  setAuditionModalType={setAuditionModalType}
                  dateRangeFilterValue={dateRangeFilterValue}
                />
              </Col>
              <Col xs={12} sm={5}>
                <ReportBlock
                  reportType={reportTypeFilterValue}
                  compareFilterValue={compareFilterValue}
                  blockType="CONVERSION"
                  setPropertyTypeFilterValue={setPropertyTypeFilterValue}
                  setType={setType}
                  type={type}
                  isUpdated={isUpdated}
                  portfolioName={propertyTypeFilterValue.name}
                  unitType={unitType}
                  setUnitType={setUnitType}
                  attribution={attribution}
                  setIsAuditionOpen={setIsAuditionOpen}
                  setAuditionModalType={setAuditionModalType}
                  dateRangeFilterValue={dateRangeFilterValue}
                />
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
                <ReportBlock
                  reportType={reportTypeFilterValue}
                  compareFilterValue={compareFilterValue}
                  blockType="SOURCE_BEHAVIOR"
                  setPropertyTypeFilterValue={setPropertyTypeFilterValue}
                  setType={setType}
                  type={type}
                  isUpdated={isUpdated}
                  portfolioName={propertyTypeFilterValue.name}
                  unitType={unitType}
                  setUnitType={setUnitType}
                  attribution={attribution}
                  setIsAuditionOpen={setIsAuditionOpen}
                  setAuditionModalType={setAuditionModalType}
                  dateRangeFilterValue={dateRangeFilterValue}
                />
              </Col>
            </Row>
            <Row>
              <Col sm={8}>
                <ReportBlock
                  reportType={reportTypeFilterValue}
                  compareFilterValue={compareFilterValue}
                  blockType="DEMOGRAPHICS"
                  setPropertyTypeFilterValue={setPropertyTypeFilterValue}
                  setType={setType}
                  type={type}
                  isUpdated={isUpdated}
                  portfolioName={propertyTypeFilterValue.name}
                  unitType={unitType}
                  setUnitType={setUnitType}
                  attribution={attribution}
                  setIsAuditionOpen={setIsAuditionOpen}
                  setAuditionModalType={setAuditionModalType}
                  dateRangeFilterValue={dateRangeFilterValue}
                />
              </Col>
              <Col sm={4}>
                <ReportBlock
                  reportType={reportTypeFilterValue}
                  compareFilterValue={compareFilterValue}
                  blockType="DEVICES"
                  setPropertyTypeFilterValue={setPropertyTypeFilterValue}
                  setType={setType}
                  type={type}
                  isUpdated={isUpdated}
                  portfolioName={propertyTypeFilterValue.name}
                  unitType={unitType}
                  setUnitType={setUnitType}
                  attribution={attribution}
                  setIsAuditionOpen={setIsAuditionOpen}
                  setAuditionModalType={setAuditionModalType}
                  dateRangeFilterValue={dateRangeFilterValue}
                />
              </Col>
            </Row>
            <Row>
              <Col sm={8}>
                <ReportBlock
                  reportType={reportTypeFilterValue}
                  compareFilterValue={compareFilterValue}
                  blockType="SEO_SCORE"
                  setPropertyTypeFilterValue={setPropertyTypeFilterValue}
                  setType={setType}
                  type={type}
                  isUpdated={isUpdated}
                  portfolioName={propertyTypeFilterValue.name}
                  unitType={unitType}
                  setUnitType={setUnitType}
                  attribution={attribution}
                  setIsAuditionOpen={setIsAuditionOpen}
                  setAuditionModalType={setAuditionModalType}
                  dateRangeFilterValue={dateRangeFilterValue}
                />
              </Col>
              <Col sm={4}>
                <ReportBlock
                  reportType={reportTypeFilterValue}
                  compareFilterValue={compareFilterValue}
                  blockType="ACQUISITION_CHANNELS"
                  setPropertyTypeFilterValue={setPropertyTypeFilterValue}
                  setType={setType}
                  type={type}
                  isUpdated={isUpdated}
                  portfolioName={propertyTypeFilterValue.name}
                  unitType={unitType}
                  setUnitType={setUnitType}
                  attribution={attribution}
                  setIsAuditionOpen={setIsAuditionOpen}
                  setAuditionModalType={setAuditionModalType}
                  dateRangeFilterValue={dateRangeFilterValue}
                />
              </Col>
            </Row>
          </React.Fragment>}
        <AuditionModal show={isAuditionOpen} handleClose={() => setIsAuditionOpen(false)} type={auditionModalType} />
      </div>
    </ContainerFluid>
  );
};

const mapStateToProps = state => ({
  currentProperty: state.property.property,
  portfolios: state.portfolio.portfolios,
  startDate: state.report.startDate,
  endDate: state.report.endDate,
  pushReport: state.pusher.pushReport,
});

export default connect(
  mapStateToProps,
  {
    ...actions.portfolio,
    ...actions.report,
    ...actions.pusher,
  },
)(withRouter(Reports));
