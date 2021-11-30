import React, { useState, FC } from 'react';
import { useSelector } from 'react-redux';
import { CardHeader, CardBody, DropdownMenu, DropdownToggle, Row, Col } from 'reactstrap';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { get } from 'lodash';
import comparisonAction from 'compete/actions/comparison';
import { CardTitle, CardSubTitle } from 'compete/views/styles';
import { CardBasic, TableWrapper, Dropdown } from 'compete/components/common';
import { RemotePaginationTable } from 'compete/components';
import { reportSettingsFilters } from 'compete/constants';
import { CustomSelect } from 'src/common';
import { SubjectAsset } from 'src/interfaces';
import { averageRentsColumns, highestOccupancyRates, defaultRentData, defaultRentColumns, defaultOccupancyData, defaultOccupancyColumns } from './utils';
import { ComparisonWelcome } from './styles';

const selectedRow = {
  hideSelectColumn: true,
  classes: 'selected-row',
  mode: 'checkbox',
};

interface RankingProps extends RouteComponentProps {
  subjectAsset: SubjectAsset,
}

const Ranking: FC<RankingProps> = ({ subjectAsset }) => {
  const [rentDropdown, toggleRentDropdown] = useState(false);
  const [showRentFor, setShowRent] = useState(reportSettingsFilters.showRentForOptions[0]);

  const comparison = useSelector(state => state.comparison.comparison);
  const isHighestRentLoaded = useSelector(state => state.comparison.isHighestRentLoaded);
  const highestRent = useSelector(state => state.comparison.highestRent);
  const isHighestOccupancyLoaded = useSelector(state => state.comparison.isHighestOccupancyLoaded);
  const highestOccupancy = useSelector(state => state.comparison.highestOccupancy);
  const errorMessage = useSelector(state => state.comparison.errorMessage);
  const highestOccupancyCount = useSelector(state => state.comparison.highestOccupancyCount);
  const highestRentCount = useSelector(state => state.comparison.highestRentCount);
  const subjectName = useSelector(state => state.comparison.subjectName);
  const subjectRentRank = useSelector(state => state.comparison.subjectRentRank);
  const subjectOccupancyRank = useSelector(state => state.comparison.subjectOccupancyRank);
  const subjectType = useSelector(state => state.comparison.subjectType) === 'PROPERTY' ? 'property' : 'submarket';
  const rentReportLabel = `Subject ${subjectType} ${subjectName} ranks #${subjectRentRank} of #${highestRentCount}`;
  const occupancyReportLabel = `Subject ${subjectType} ${subjectName} ranks #${subjectOccupancyRank} of #${highestRentCount}`;

  const { getHighestAvgRent, getHighestOccupancy } = comparisonAction;

  const handleClick = (id) => {
    // eslint-disable-next-line no-console
    console.log('click id: ', id);
  };

  const renderError = () => (
    <ComparisonWelcome>
      <i className="ri-line-chart-line" />
      <h5>Ranking comparison error</h5>
      <p>{errorMessage && errorMessage[0]}</p>
    </ComparisonWelcome>
  );

  const rentRank = isHighestRentLoaded ? highestRent.find(el => el.id === Number(subjectAsset.value.id)) : '';
  const occupancyRank = isHighestOccupancyLoaded ? highestOccupancy.find(el => el.id === Number(subjectAsset.value.id)) : '';

  return (
    errorMessage ?
      renderError() : (
        <React.Fragment>
          <CardBasic>
            <CardHeader>
              <div className="mr-auto">
                <CardTitle className="mb-5" xs>Highest Average Rents</CardTitle>
                {isHighestRentLoaded ?
                  <CardSubTitle>{rentReportLabel}</CardSubTitle> :
                  <Skeleton width={300} style={{ borderRadius: '6px' }} />}
              </div>
              <Dropdown isOpen={rentDropdown} toggle={() => toggleRentDropdown(!rentDropdown)} $setting>
                <DropdownToggle>
                  <i className="ri-settings-fill" />
                </DropdownToggle>
                <DropdownMenu right>
                  <h6 className="mb-15">Report Settings</h6>
                  <Row className="m-row-5 align-items-center">
                    <Col xs="5" className="p-x-5">
                      Show rent for
                    </Col>
                    <Col xs="7" className="p-x-5">
                      <CustomSelect
                        selected={showRentFor}
                        optionList={reportSettingsFilters.showRentForOptions}
                        onChange={selected => setShowRent(selected)}
                        fieldName="label"
                      />
                    </Col>
                  </Row>
                </DropdownMenu>
              </Dropdown>
            </CardHeader>
            <CardBody>
              <TableWrapper paginationHidden={highestRentCount < 20}>
                <RemotePaginationTable
                  data={isHighestRentLoaded ? highestRent : defaultRentData()}
                  totalSize={highestRentCount}
                  columns={isHighestRentLoaded ? averageRentsColumns(handleClick) : defaultRentColumns}
                  filters={showRentFor.value}
                  filterField="unit_type"
                  getData={getHighestAvgRent}
                  selectRow={{ ...selectedRow, selected: [get(rentRank, 'id', 0)] }}
                  hideSizePerPage
                  id={comparison.id}
                />
              </TableWrapper>
            </CardBody>
          </CardBasic>
          <CardBasic className="mt-20">
            <CardHeader>
              <div className="mr-auto">
                <CardTitle className="mb-5" xs>Highest Occupancy Rates</CardTitle>
                {isHighestOccupancyLoaded ?
                  <CardSubTitle>{occupancyReportLabel}</CardSubTitle> :
                  <Skeleton width={300} style={{ borderRadius: '6px' }} />}
              </div>
            </CardHeader>
            <CardBody>
              <TableWrapper paginationHidden={highestOccupancyCount < 20}>
                <RemotePaginationTable
                  data={isHighestOccupancyLoaded ? highestOccupancy : defaultOccupancyData()}
                  totalSize={highestOccupancyCount}
                  columns={isHighestOccupancyLoaded ? highestOccupancyRates(handleClick) : defaultOccupancyColumns}
                  getData={getHighestOccupancy}
                  selectRow={{ ...selectedRow, selected: [get(occupancyRank, 'id', 0)] }}
                  hideSizePerPage
                  id={comparison.id}
                />
              </TableWrapper>
            </CardBody>
          </CardBasic>
        </React.Fragment>)
  );
};

export default withRouter(Ranking);
