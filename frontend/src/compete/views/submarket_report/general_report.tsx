import React, { useState, useEffect, FC } from 'react';
import { useSelector } from 'react-redux';
import { CardHeader, CardBody, Row, Col, DropdownMenu, DropdownToggle } from 'reactstrap';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import submarketAction from 'compete/actions/submarket';
import { CardTitle, ItemLabel, ItemValue } from 'compete/views/styles';
import { CardBasic, TableWrapper, Dropdown } from 'compete/components/common';
import { CustomTable, RemotePaginationTable, CompeteEmpty } from 'compete/components';
import { unitTypes, currencyFormat, filteredUnitType, RENT_COMPS, percentFormat } from 'compete/constants';
import { CustomSelect } from 'src/common';
import { unitTypeOverviewColumns, propertyBreakdownColumns, defaultUnitTypeData, defaultUnitTypeColumns, defaultSubmarketPropertiesData,
  defaultSubmarketPropertiesColumns, defaultRentCompsData, defaultRentCompsColumns, rentCompsColumns } from './utils';

const GeneralReport: FC<RouteComponentProps> = ({ location: { pathname } }) => {
  const [rentCompsFilter, setFilter] = useState(JSON.parse(localStorage.getItem(RENT_COMPS)) || unitTypes[2]);
  const [rentCompsDropdown, toggleDropdownRentComps] = useState(false);

  const submarketDetail = useSelector(state => state.submarket.submarketDetail);
  const isSubmarketDetailLoaded = useSelector(state => state.submarket.isSubmarketDetailLoaded);
  const isSubmarketPropertiesLoaded = useSelector(state => state.submarket.isSubmarketPropertiesLoaded);
  const countSubmarketProperties = useSelector(state => state.submarket.countSubmarketProperties);
  const submarketProperties = useSelector(state => state.submarket.submarketProperties);
  const isRentCompsLoaded = useSelector(state => state.submarket.isRentCompsLoaded);
  const countRentComps = useSelector(state => state.submarket.countRentComps);
  const rentComps = useSelector(state => state.submarket.rentComps);
  const isSubmarketBreakdownLoaded = useSelector(state => state.submarket.isSubmarketBreakdownLoaded);
  const submarketBreakdown = useSelector(state => state.submarket.submarketBreakdown);
  const countSubmarketBreakdown = useSelector(state => state.submarket.countSubmarketBreakdown);

  const { getSubmarketProperties, getSubmarketRentComp, getSubmarketMTRBreakdown } = submarketAction;

  useEffect(() => {
    localStorage.setItem(RENT_COMPS, JSON.stringify(rentCompsFilter));
  }, [rentCompsFilter]);

  const renderEmpty = type => (
    <CompeteEmpty
      title={type === 'available' ? 'No available units' : 'No concessions'}
      text={type === 'available' ? 'This property has no available units.' : 'This property is not offering concessions.'}
    />
  );

  const filterUnitType = isSubmarketDetailLoaded ? filteredUnitType(submarketDetail) : [];
  const submarketId = pathname.split('/').pop();

  return (
    <React.Fragment>
      <CardBasic>
        <CardHeader>
          <CardTitle xs>Unit Type Overview</CardTitle>
        </CardHeader>
        <CardBody>
          <TableWrapper paginationHidden>
            <CustomTable
              tableData={isSubmarketDetailLoaded ? filterUnitType : defaultUnitTypeData()}
              tableColumns={isSubmarketDetailLoaded ? unitTypeOverviewColumns(filterUnitType) : defaultUnitTypeColumns}
            />
          </TableWrapper>
        </CardBody>
      </CardBasic>
      <CardBasic className="mt-20">
        <CardHeader>
          <CardTitle xs>Available Units Overview</CardTitle>
        </CardHeader>
        <CardBody>
          {isSubmarketDetailLoaded && !submarketDetail.units_count ?
            renderEmpty('available') :
            <Row className="m-row-10">
              <Col xs="3" className="p-x-10">
                <ItemLabel>Number of Available Units</ItemLabel>
                {isSubmarketDetailLoaded ?
                  <ItemValue>{submarketDetail.available_units_count}</ItemValue> :
                  <Skeleton width={150} height={12} style={{ borderRadius: '6px' }} />}
              </Col>
              <Col xs="3" className="p-x-10">
                <ItemLabel>Number of units in Submarket</ItemLabel>
                {isSubmarketDetailLoaded ?
                  <ItemValue>{submarketDetail.units_count}</ItemValue> :
                  <Skeleton width={50} height={12} style={{ borderRadius: '6px' }} />}
              </Col>
              <Col xs="3" className="p-x-10">
                <ItemLabel>Submarket LTN Occupancy Rate</ItemLabel>
                {isSubmarketDetailLoaded ?
                  <ItemValue>{percentFormat(submarketDetail.ltn_occupancy)}%</ItemValue> :
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
          {isSubmarketDetailLoaded && !submarketDetail.properties_offering_concession ?
            renderEmpty('concessions') :
            <Row className="m-row-10">
              <Col className="p-x-10">
                <ItemLabel>Properties Offering Concession</ItemLabel>
                {isSubmarketDetailLoaded ?
                  <ItemValue>{submarketDetail.properties_offering_concession}</ItemValue> :
                  <Skeleton width={150} height={12} style={{ borderRadius: '6px' }} />}
              </Col>
              <Col xs="3" className="p-x-10">
                <ItemLabel>Average Concession Amount</ItemLabel>
                {isSubmarketDetailLoaded ?
                  <ItemValue>${currencyFormat(submarketDetail.avg_concession)}</ItemValue> :
                  <Skeleton width={50} height={12} style={{ borderRadius: '6px' }} />}
              </Col>
              <Col className="p-x-10">
                <ItemLabel>Concession Amount Range</ItemLabel>
                {isSubmarketDetailLoaded ?
                  <ItemValue>${currencyFormat(submarketDetail.min_concession)} - ${currencyFormat(submarketDetail.max_concession)}</ItemValue> :
                  <Skeleton width={50} height={12} style={{ borderRadius: '6px' }} />}
              </Col>
              <Col className="p-x-10">
                <ItemLabel>As % of Average Rent</ItemLabel>
                {isSubmarketDetailLoaded ?
                  <ItemValue>{currencyFormat((submarketDetail.avg_concession / (12 * submarketDetail.avg_rent)) * 100)}%</ItemValue> :
                  <Skeleton width={50} height={12} style={{ borderRadius: '6px' }} />}
              </Col>
            </Row>
          }
        </CardBody>
      </CardBasic>
      {isSubmarketDetailLoaded && !!submarketDetail.submarkets_count &&
        <CardBasic className="mt-20">
          <CardHeader>
            <CardTitle xs>Submarket Breakdown</CardTitle>
          </CardHeader>
          <CardBody>
            <TableWrapper paginationHidden={countSubmarketBreakdown < 20}>
              <RemotePaginationTable
                data={isSubmarketBreakdownLoaded ? submarketBreakdown : defaultSubmarketPropertiesData()}
                totalSize={countSubmarketBreakdown}
                columns={isSubmarketBreakdownLoaded ? propertyBreakdownColumns() : defaultSubmarketPropertiesColumns}
                getData={getSubmarketMTRBreakdown}
                hideSizePerPage
                id={submarketId}
              />
            </TableWrapper>
          </CardBody>
        </CardBasic>}
      <CardBasic className="mt-20">
        <CardHeader>
          <CardTitle xs>Property Breakdown</CardTitle>
        </CardHeader>
        <CardBody>
          <TableWrapper paginationHidden={countSubmarketProperties < 20}>
            <RemotePaginationTable
              data={isSubmarketPropertiesLoaded ? submarketProperties : defaultSubmarketPropertiesData()}
              totalSize={countSubmarketProperties}
              columns={isSubmarketPropertiesLoaded ? propertyBreakdownColumns() : defaultSubmarketPropertiesColumns}
              getData={getSubmarketProperties}
              hideSizePerPage
              id={submarketId}
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
              getData={getSubmarketRentComp}
              hideSizePerPage
              id={submarketId}
            />
          </TableWrapper>
        </CardBody>
      </CardBasic>
    </React.Fragment>
  );
};

export default withRouter(GeneralReport);
