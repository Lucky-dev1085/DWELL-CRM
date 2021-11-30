import React, { useState, useEffect, FC } from 'react';
import { useSelector } from 'react-redux';
import { CardHeader, CardBody, Row, Col, DropdownMenu, DropdownToggle } from 'reactstrap';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import marketAction from 'compete/actions/market';
import { CardTitle, ItemLabel, ItemValue } from 'compete/views/styles';
import { CardBasic, TableWrapper, Dropdown } from 'compete/components/common';
import { CustomTable, RemotePaginationTable, CompeteEmpty } from 'compete/components';
import { unitTypes, currencyFormat, RENT_COMPS, percentFormat, filteredUnitType } from 'compete/constants';
import { CustomSelect } from 'src/common';
import { unitTypeOverviewColumns, submarketBreakdownColumns, defaultUnitTypeData, defaultUnitTypeColumns, defaultRentCompsColumns, rentCompsColumns,
  defaultMarketPropertiesData, defaultMarketSubmarketsColumns, defaultRentCompsData, defaultGroupBreakdownData, defaultGroupBreakdownColumns, groupBreakdownColumns } from './utils';

const GeneralReport: FC<RouteComponentProps> = ({ location: { pathname } }) => {
  const [rentCompsFilter, setFilter] = useState(JSON.parse(localStorage.getItem(RENT_COMPS)) || unitTypes[2]);
  const [rentCompsDropdown, toggleDropdownRentComps] = useState(false);

  const isMarketDetailLoaded = useSelector(state => state.market.isMarketDetailLoaded);
  const isMarketSubmarketsLoaded = useSelector(state => state.market.isMarketSubmarketsLoaded);
  const marketDetail = useSelector(state => state.market.marketDetail);
  const marketSubmarkets = useSelector(state => state.market.marketSubmarkets);
  const isRentCompsLoaded = useSelector(state => state.market.isRentCompsLoaded);
  const countRentComps = useSelector(state => state.market.countRentComps);
  const rentComps = useSelector(state => state.market.rentComps);
  const isMTRBreakdownLoaded = useSelector(state => state.market.isMTRBreakdownLoaded);
  const mtrGroupBreakdown = useSelector(state => state.market.mtrGroupBreakdown);
  const marketSubmarketsCount = useSelector(state => state.market.marketSubmarketsCount);
  const mtrGroupBreakdownCount = useSelector(state => state.market.mtrGroupBreakdownCount);

  const { getMarketSubmarkets, getMarketRentComp, getMTRGroupBreakdown } = marketAction;

  useEffect(() => {
    localStorage.setItem(RENT_COMPS, JSON.stringify(rentCompsFilter));
  }, [rentCompsFilter]);

  const renderEmpty = type => (
    <CompeteEmpty
      title={type === 'available' ? 'No available units' : 'No concessions'}
      text={type === 'available' ? 'This property has no available units.' : 'This property is not offering concessions.'}
    />
  );

  const filterUnitType = isMarketDetailLoaded ? filteredUnitType(marketDetail) : [];
  const marketId = pathname.split('/').pop();

  return (
    <React.Fragment>
      <CardBasic>
        <CardHeader>
          <CardTitle xs>Unit Type Overview</CardTitle>
        </CardHeader>
        <CardBody>
          <TableWrapper paginationHidden>
            <CustomTable
              tableData={isMarketDetailLoaded ? filterUnitType : defaultUnitTypeData()}
              tableColumns={isMarketDetailLoaded ? unitTypeOverviewColumns(filterUnitType) : defaultUnitTypeColumns}
            />
          </TableWrapper>
        </CardBody>
      </CardBasic>
      <CardBasic className="mt-20">
        <CardHeader>
          <CardTitle xs>Available Units Overview</CardTitle>
        </CardHeader>
        <CardBody>
          {isMarketDetailLoaded && !marketDetail.units_count ?
            renderEmpty('available') :
            <Row className="m-row-10">
              <Col xs="3" className="p-x-10">
                <ItemLabel>Number of Available Units</ItemLabel>
                {isMarketDetailLoaded ?
                  <ItemValue>{marketDetail.available_units_count}</ItemValue> :
                  <Skeleton width={150} height={12} style={{ borderRadius: '6px' }} />}
              </Col>
              <Col xs="3" className="p-x-10">
                <ItemLabel>Number of units in Market</ItemLabel>
                {isMarketDetailLoaded ?
                  <ItemValue>{marketDetail.units_count}</ItemValue> :
                  <Skeleton width={50} height={12} style={{ borderRadius: '6px' }} />}
              </Col>
              <Col xs="3" className="p-x-10">
                <ItemLabel>Market LTN Occupancy Rate</ItemLabel>
                {isMarketDetailLoaded ?
                  <ItemValue>{percentFormat(marketDetail.ltn_occupancy)}%</ItemValue> :
                  <Skeleton width={50} height={12} style={{ borderRadius: '6px' }} />}
              </Col>
            </Row>
          }
        </CardBody>
      </CardBasic>
      <CardBasic className="mt-20">
        <CardHeader>
          <CardTitle xs>Concessions Overview</CardTitle>
        </CardHeader>
        <CardBody>
          {isMarketDetailLoaded && !marketDetail.properties_offering_concession ?
            renderEmpty('concessions') :
            <Row className="m-row-10">
              <Col className="p-x-10">
                <ItemLabel>Properties Offering Concession</ItemLabel>
                {isMarketDetailLoaded ?
                  <ItemValue>{marketDetail.properties_offering_concession}</ItemValue> :
                  <Skeleton width={150} height={12} style={{ borderRadius: '6px' }} />}
              </Col>
              <Col xs="3" className="p-x-10">
                <ItemLabel>Average Concession Amount</ItemLabel>
                {isMarketDetailLoaded ?
                  <ItemValue>${currencyFormat(marketDetail.avg_concession)}</ItemValue> :
                  <Skeleton width={50} height={12} style={{ borderRadius: '6px' }} />}
              </Col>
              <Col className="p-x-10">
                <ItemLabel>Concession Amount Range</ItemLabel>
                {isMarketDetailLoaded ?
                  <ItemValue>${currencyFormat(marketDetail.min_concession)} - ${currencyFormat(marketDetail.max_concession)}</ItemValue> :
                  <Skeleton width={50} height={12} style={{ borderRadius: '6px' }} />}
              </Col>
              <Col className="p-x-10">
                <ItemLabel>As % of Average Rent</ItemLabel>
                {isMarketDetailLoaded ?
                  <ItemValue>{currencyFormat((marketDetail.avg_concession / (12 * marketDetail.avg_rent)) * 100)}%</ItemValue> :
                  <Skeleton width={50} height={12} style={{ borderRadius: '6px' }} />}
              </Col>
            </Row>
          }
        </CardBody>
      </CardBasic>
      <CardBasic className="mt-20">
        <CardHeader>
          <CardTitle xs>Submarket Breakdown</CardTitle>
        </CardHeader>
        <CardBody>
          <TableWrapper paginationHidden={marketSubmarketsCount < 20}>
            <RemotePaginationTable
              data={isMarketSubmarketsLoaded ? marketSubmarkets : defaultMarketPropertiesData()}
              totalSize={marketSubmarketsCount}
              columns={isMarketSubmarketsLoaded ? submarketBreakdownColumns() : defaultMarketSubmarketsColumns}
              getData={getMarketSubmarkets}
              id={marketId}
              hideSizePerPage
            />
          </TableWrapper>
        </CardBody>
      </CardBasic>
      <CardBasic className="mt-20">
        <CardHeader>
          <CardTitle xs>MTR Group Breakdown</CardTitle>
        </CardHeader>
        <CardBody>
          <TableWrapper paginationHidden={mtrGroupBreakdownCount < 20}>
            <RemotePaginationTable
              data={isMTRBreakdownLoaded ? mtrGroupBreakdown : defaultGroupBreakdownData()}
              totalSize={mtrGroupBreakdownCount}
              columns={isMTRBreakdownLoaded ? groupBreakdownColumns() : defaultGroupBreakdownColumns}
              getData={getMTRGroupBreakdown}
              id={marketId}
              hideSizePerPage
            />
          </TableWrapper>
        </CardBody>
      </CardBasic>
      <CardBasic className="mt-20">
        <CardHeader>
          <CardTitle xs>Rent Comps</CardTitle>
          <Dropdown isOpen={rentCompsDropdown} toggle={() => toggleDropdownRentComps(!rentCompsDropdown)} $setting>
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
                    selected={rentCompsFilter}
                    optionList={unitTypes.filter(el => el.label !== 'All')}
                    onChange={selected => setFilter(selected)}
                    fieldName="label"
                  />
                </Col>
              </Row>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody>
          <TableWrapper paginationHidden={countRentComps < 20}>
            <RemotePaginationTable
              data={isRentCompsLoaded ? rentComps : defaultRentCompsData()}
              totalSize={countRentComps}
              columns={isRentCompsLoaded ? rentCompsColumns : defaultRentCompsColumns}
              filters={rentCompsFilter.value}
              filterField="unit_type"
              getData={getMarketRentComp}
              hideSizePerPage
              id={marketId}
            />
          </TableWrapper>
        </CardBody>
      </CardBasic>
    </React.Fragment>
  );
};

export default withRouter(GeneralReport);
