import React, { useState, useEffect, FC } from 'react';
import { AppBreadcrumb } from '@coreui/react';
import { useDispatch, useSelector } from 'react-redux';
import { CardHeader, CardBody, DropdownMenu, DropdownToggle, Row, Col } from 'reactstrap';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import propertiesAction from 'compete/actions/properties';
import comparisonAction from 'compete/actions/comparison';
import watchlistAction from 'compete/actions/watchlist';
import { compete } from 'src/routes';
import { ContentTitle, ContentContainer, ContentHeader, TabGroup, TabButton, CompeteStar } from 'compete/views/styles';
import { SearchInput } from 'compete/components';
import { Dropdown } from 'compete/components/common';
import { reportSettingsFilters, assetTypes, comparisonFieldName, assetTypeUpper, REPORT_SETTINGS } from 'compete/constants';
import { CustomSelect } from 'src/common';
import { getPropertyId } from 'src/utils';
import { ComparisonReport } from 'src/interfaces';
import { FormLabel, CardTitle, CardBasic, ButtonPrimary, InvalidFeedback, ComparisonWelcome, ToggleWrapper, FormSwitch } from './styles';
import ComparisonCharts from './comparison';
import Ranking from './ranking';

const ComparisonReport: FC<RouteComponentProps> = ({ location: { pathname }, history: { push } }) => {
  const [activeTab, setActiveTab] = useState('Comparison');
  const [dropdownOpen, setDropDownOpen] = useState(false);
  const [reportSettings, setReportSettings] = useState({ reportingPeriod: 'Last 12 months', reportingGroup: 'Monthly' });
  const [subjectAsset, setSubjectAsset] = useState({ type: '', value: { name: '', id: null } });
  const [comparedAgainst, setComparedAgainst] = useState({ type: '', value: { name: '', id: null } });
  const [isGenerateReport, setGenerateReport] = useState(false);
  const [assetSwitch, toggleAsset] = useState(true);
  const [isStarActive, toggleStar] = useState(false);

  const dispatch = useDispatch();
  const competitorList = useSelector(state => state.properties.competitorList);
  const isCompetitorListLoaded = useSelector(state => state.properties.isCompetitorListLoaded);
  const isSubmitting = useSelector(state => state.comparison.isSubmitting);
  const isComparisonLoaded = useSelector(state => state.comparison.isComparisonLoaded);
  const watchlist = useSelector(state => state.watchlist.watchlist);
  const isSubmitList = useSelector(state => state.watchlist.isSubmitting);
  const isWatchlistLoaded = useSelector(state => state.watchlist.isWatchlistLoaded);

  const { getCompetitorSet } = propertiesAction;
  const { getComparisonById, createComparison } = comparisonAction;
  const { getWatchlist, updateWatchlist } = watchlistAction;

  const comparisonId = Number(pathname.split('/').pop());

  useEffect(() => {
    if (comparisonId) {
      dispatch(getComparisonById(comparisonId)).then(({ result: { data } }) => {
        const assetType = assetTypeUpper[data.subject_asset_type];
        const comparedType = assetTypeUpper[data.compared_asset_type];
        const compareId = ['PROPERTY', 'SUB_MARKET'].includes(data.compared_asset_type) ? `compared_${comparedType}` : comparedType;

        setGenerateReport(true);
        setSubjectAsset({ type: assetType, value: { name: data.subject_asset_name, id: data[comparisonFieldName[assetType]] } });
        setComparedAgainst({ type: comparedType, value: { name: data.compared_asset_name, id: data[comparisonFieldName[compareId]] } });
      });
    }
    dispatch(getCompetitorSet());
    dispatch(getWatchlist());

    const storageFilter = JSON.parse(localStorage.getItem(REPORT_SETTINGS));
    if (storageFilter) {
      setReportSettings(storageFilter);
    }
  }, [pathname]);

  useEffect(() => {
    localStorage.setItem(REPORT_SETTINGS, JSON.stringify(reportSettings));
  }, [reportSettings]);

  useEffect(() => {
    if (isWatchlistLoaded && isComparisonLoaded) {
      const isWatchlist = watchlist.comparisons.find(el => el.id === comparisonId && el.is_stored);
      toggleStar(!!isWatchlist);
    }
  }, [isWatchlistLoaded, isComparisonLoaded]);

  const handleToggleStar = () => {
    toggleStar(!isStarActive);
    dispatch(updateWatchlist({ object_type: 'comparison', object_id: comparisonId, is_stored: !isStarActive }));
  };

  const handleSearchAsset = (type = '', value = { name: '', id: null }) => {
    setSubjectAsset({ type: type.replace('-report', ''), value });
  };

  const renderTab = () => (activeTab === 'Comparison' ?
    <ComparisonCharts
      subjectAsset={subjectAsset}
      comparedAgainst={comparedAgainst}
      reportSettings={reportSettings}
      comparisonId={comparisonId}
      includeSubject={assetSwitch}
    /> :
    <Ranking subjectAsset={subjectAsset} />);

  const isCriteriaChosen = subjectAsset.value.name && comparedAgainst.value.name;
  const isViewReport = isGenerateReport && isCriteriaChosen;

  const renderEmpty = () => (
    isViewReport && !isComparisonLoaded ?
      <Skeleton height={287} style={{ borderRadius: '6px' }} /> :
      <ComparisonWelcome>
        <i className="ri-line-chart-line" />
        <h5>Select Comparison Criteria</h5>
        <p>Once you select the comparison criteria, the associated reports will display here.</p>
      </ComparisonWelcome>
  );

  const handleGenerateReport = () => {
    if (isCriteriaChosen) {
      const assetType = subjectAsset.type;
      const comparedType = comparedAgainst.type;
      const comparedId = ['property', 'submarket'].includes(comparedType) ? `compared_${comparedType}` : comparedType;
      dispatch(createComparison({
        subject_asset_type: assetTypes[assetType],
        [comparisonFieldName[assetType]]: subjectAsset.value.id,
        compared_asset_type: assetTypes[comparedType],
        [comparisonFieldName[comparedId]]: comparedAgainst.value.id,
      })).then(({ result: { data } }) => {
        push(`/${getPropertyId()}/compete/comparison/report/${data.id}`);
      });
    } else {
      setGenerateReport(true);
    }
  };

  const isHiddenTab = subjectAsset.type === comparedAgainst.type;
  const isDisabledReportingGroup = reportSettingsFilters.exceptPeriod.includes(reportSettings.reportingPeriod);

  const renderContentHeader = () => (
    <ContentHeader>
      <div className="mr-auto">
        <AppBreadcrumb appRoutes={compete} />
        <div className="d-flex align-items-center">
          <ContentTitle className="mr-5">{isViewReport ? `${subjectAsset.value.name} vs ${comparedAgainst.value.name}` : 'Comparison Reporting'}</ContentTitle>
          {isViewReport && <CompeteStar isActive={isStarActive} disabled={isSubmitList}><i className={isStarActive ? 'ri-star-fill' : 'ri-star-line'} onClick={handleToggleStar} /></CompeteStar>}
        </div>
      </div>
      {isViewReport && (
        <React.Fragment>
          {!isHiddenTab &&
            <TabGroup className="mr-10">
              <TabButton active={activeTab === 'Comparison'} onClick={() => setActiveTab('Comparison')}>
                Comparison
              </TabButton>
              <TabButton active={activeTab === 'Ranking'} onClick={() => setActiveTab('Ranking')}>
                Ranking
              </TabButton>
            </TabGroup>}
          {activeTab === 'Comparison' &&
            <Dropdown isOpen={dropdownOpen} toggle={() => setDropDownOpen(!dropdownOpen)}>
              <DropdownToggle>
                <i className="ri-list-settings-line" />
              </DropdownToggle>
              <DropdownMenu right>
                <h6 className="mb-15">Report Settings</h6>
                <Row className="m-row-5 align-items-center">
                  <Col xs="5" className="p-x-5">
                    Reporting period
                  </Col>
                  <Col xs="7" className="p-x-5">
                    <CustomSelect
                      selected={reportSettings.reportingPeriod}
                      optionList={reportSettingsFilters.reportingPeriod}
                      onChange={selected => setReportSettings({ ...reportSettings, reportingPeriod: selected })}
                    />
                  </Col>
                </Row>
                <Row className="m-row-5 align-items-center mt-10">
                  <Col xs="5" className="p-x-5">
                    Reporting group
                  </Col>
                  <Col xs="7" className="p-x-5">
                    <CustomSelect
                      selected={isDisabledReportingGroup ? 'Weekly' : reportSettings.reportingGroup}
                      optionList={reportSettingsFilters.reportingGroup}
                      onChange={selected => setReportSettings({ ...reportSettings, reportingGroup: selected })}
                      disabled={isDisabledReportingGroup}
                    />
                  </Col>
                </Row>
                {!isHiddenTab &&
                  <ToggleWrapper>
                    <span>Include Subject asset in Comparison set</span>
                    <FormSwitch
                      checked={assetSwitch}
                      onClick={() => toggleAsset(!assetSwitch)}
                    />
                  </ToggleWrapper>}
              </DropdownMenu>
            </Dropdown>}
        </React.Fragment>)}
    </ContentHeader>
  );

  return (
    <ContentContainer>
      {renderContentHeader()}
      <Row className="m-row-10">
        <Col xs="3" className="p-x-10">
          <CardBasic>
            <CardHeader>
              <CardTitle>Comparison Criteria</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="mb-20">
                <FormLabel>Subject Asset</FormLabel>
                <SearchInput
                  handleSearch={handleSearchAsset}
                  subject={subjectAsset}
                  fieldName="name"
                  isSubjectAsset
                  small
                />
              </div>
              <div className="mb-20">
                <FormLabel>Compared Against</FormLabel>
                <SearchInput
                  competitorsList={isCompetitorListLoaded ? competitorList : []}
                  handleSearch={(type = '', value = { name: '', id: null }) => setComparedAgainst({ type: type.replace('-report', ''), value })}
                  subject={comparedAgainst}
                  fieldName="name"
                  small
                />
              </div>
              {!isCriteriaChosen && isGenerateReport && <InvalidFeedback>Please select both criteria</InvalidFeedback>}
              <ButtonPrimary color="primary" onClick={handleGenerateReport} disabled={isSubmitting}>Generate Report</ButtonPrimary>
            </CardBody>
          </CardBasic>
        </Col>
        <Col xs="9" className="p-x-10">
          {isViewReport && isComparisonLoaded ? renderTab() : renderEmpty()}
        </Col>
      </Row>
    </ContentContainer>
  );
};

export default withRouter(ComparisonReport);
