import React, { useState, useEffect, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CardHeader, CardBody, Row, Col, DropdownMenu, DropdownToggle } from 'reactstrap';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { get } from 'lodash';
import propertiesAction from 'compete/actions/properties';
import comparisonAction from 'compete/actions/comparison';
import { CardTitle, ItemLabel, ItemValue, FeatureList } from 'compete/views/styles';
import { CardBasic, TableWrapper, Dropdown } from 'compete/components/common';
import { CustomTable, RemotePaginationTable, CompeteEmpty } from 'compete/components';
import { unitTypes, currencyFormat, AVAILABLE_UNIT, filteredUnitType } from 'compete/constants';
import { CustomSelect } from 'src/common';
import { UnitInfo } from 'src/interfaces';
import { getPropertyId } from 'src/utils';
import { unitTypesColumns, availableUnitsColumns, competitorsColumns, skeletonFeatureWidth, defaultAvailableUnitData, defaultAvailableColumns,
  defaultCompetitorsData, defaultCompetitorsColumns, defaultUnitTypeData, defaultUnitTypeColumns } from './utils';
import UnitPricingModal from './unit_pricing_modal';

const GeneralReport: FC<RouteComponentProps> = ({ location: { pathname }, history: { push } }) => {
  const [availableUnitsFilter, setFilters] = useState(JSON.parse(localStorage.getItem(AVAILABLE_UNIT)) || unitTypes[0]);
  const [availableUnitDropdown, toggleDropdownAvailable] = useState(false);
  const [unitInfo, setUnitInfo] = useState({} as UnitInfo);
  const [isModalOpen, toggleModal] = useState(false);

  const dispatch = useDispatch();
  const isAvailableUnitsLoaded = useSelector(state => state.properties.isAvailableUnitsLoaded);
  const isPropertiesCompetitorsLoaded = useSelector(state => state.properties.isPropertiesCompetitorsLoaded);
  const countAvailableUnit = useSelector(state => state.properties.countAvailableUnit);
  const countCompetitors = useSelector(state => state.properties.countCompetitors);
  const availableUnits = useSelector(state => state.properties.availableUnits);
  const propertiesCompetitors = useSelector(state => state.properties.propertiesCompetitors);
  const isPropertiesDetailLoaded = useSelector(state => state.properties.isPropertiesDetailLoaded);
  const propertiesDetail = useSelector(state => state.properties.propertiesDetail);

  const { getAvailableUnits, getPropertiesCompetitors, setAvailableLoaded, setCompetitorsLoaded } = propertiesAction;
  const { createComparison } = comparisonAction;

  useEffect(() => {
    dispatch(setCompetitorsLoaded(false));
  }, []);

  useEffect(() => {
    dispatch(setAvailableLoaded(false));
    localStorage.setItem(AVAILABLE_UNIT, JSON.stringify(availableUnitsFilter));
  }, [availableUnitsFilter]);

  const filterUnitType = isPropertiesDetailLoaded ? filteredUnitType(propertiesDetail, true) : [];

  const propertyId = pathname.split('/').pop();
  const isLeaseUpProperty = isPropertiesDetailLoaded && propertiesDetail.is_lease_up;

  const renderEmpty = type => (
    <CompeteEmpty
      title={type === 'available' ? 'No available units' : 'No concessions'}
      text={type === 'available' ? 'This property has no available units.' : 'This property is not offering concessions.'}
    />
  );

  const renderEmptyFeature = type => (
    <CompeteEmpty
      title={type === 'communities' ? 'No Community Features' : 'No Apartment Features'}
      text={type === 'communities' ? 'This property has no community features listed yet.' : 'This property is no apartment features listed yet.'}
    />
  );

  const renderFeatureCard = (header, key) => (
    <CardBasic className="h-100">
      <CardHeader>
        <CardTitle xs>{header}</CardTitle>
      </CardHeader>
      <CardBody>
        {isPropertiesDetailLoaded && !get(propertiesDetail, key, []).length ?
          renderEmptyFeature(key) :
          <React.Fragment>
            <ItemLabel>Features List</ItemLabel>
            <FeatureList>
              {isPropertiesDetailLoaded ?
                propertiesDetail[key].map((item, index) => (
                  <li key={index}>{item}</li>
                )) :
                <div className="d-flex flex-column">
                  {skeletonFeatureWidth.map((width, index) => (
                    <Skeleton key={index} width={width} height={8} style={{ borderRadius: '6px' }} />
                  ))}
                </div>
              }
            </FeatureList>
          </React.Fragment>}
      </CardBody>
    </CardBasic>
  );

  const handleClickCompetitors = (id) => {
    dispatch(createComparison({
      subject_asset_type: 'PROPERTY',
      subject_property: Number(propertyId),
      compared_asset_type: 'PROPERTY',
      compared_property: id,
    })).then(({ result: { data } }) => {
      push(`/${getPropertyId()}/compete/comparison/report/${data.id}`);
    });
  };

  const handleClickAvailableUnit = (id, session) => {
    setUnitInfo({ id, session });
    toggleModal(true);
  };

  return (
    <React.Fragment>
      <CardBasic>
        <CardHeader>
          <CardTitle xs>Unit Types</CardTitle>
        </CardHeader>
        <CardBody>
          <TableWrapper paginationHidden>
            <CustomTable
              tableData={isPropertiesDetailLoaded ? filterUnitType : defaultUnitTypeData()}
              tableColumns={isPropertiesDetailLoaded ? unitTypesColumns(isLeaseUpProperty, filterUnitType) : defaultUnitTypeColumns}
            />
          </TableWrapper>
        </CardBody>
      </CardBasic>
      <CardBasic className="mt-20">
        <CardHeader>
          <CardTitle xs>Available Units ({countAvailableUnit})</CardTitle>
          <Dropdown isOpen={availableUnitDropdown} toggle={() => toggleDropdownAvailable(!availableUnitDropdown)} $setting>
            <DropdownToggle>
              <i className="ri-settings-fill" />
            </DropdownToggle>
            <DropdownMenu right>
              <h6 className="mb-15">Report Settings</h6>
              <Row className="m-row-5 align-items-center">
                <Col xs="5" className="p-x-5">
                  Show unit type
                </Col>
                <Col xs="7" className="p-x-5">
                  <CustomSelect
                    selected={availableUnitsFilter}
                    optionList={unitTypes}
                    onChange={selected => setFilters(selected)}
                    fieldName="label"
                  />
                </Col>
              </Row>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody>
          {isAvailableUnitsLoaded && !countAvailableUnit ?
            renderEmpty('available') :
            <TableWrapper paginationHidden={countAvailableUnit < 20}>
              <RemotePaginationTable
                data={isAvailableUnitsLoaded ? availableUnits : defaultAvailableUnitData()}
                totalSize={countAvailableUnit}
                columns={isAvailableUnitsLoaded ? availableUnitsColumns(handleClickAvailableUnit) : defaultAvailableColumns}
                filters={availableUnitsFilter.value}
                getData={getAvailableUnits}
                hideSizePerPage
                filterField="unit_type"
                id={propertyId}
              />
            </TableWrapper>
          }
        </CardBody>
      </CardBasic>
      <CardBasic className="mt-20">
        <CardHeader>
          <CardTitle xs>Concessions</CardTitle>
        </CardHeader>
        <CardBody>
          {isPropertiesDetailLoaded && !propertiesDetail.concession_amount ?
            renderEmpty('concessions') :
            <Row className="m-row-10">
              <Col className="p-x-10">
                <ItemLabel>Description</ItemLabel>
                {isPropertiesDetailLoaded ?
                  <ItemValue>{propertiesDetail.concession_description}</ItemValue> :
                  <Skeleton width={150} height={12} style={{ borderRadius: '6px' }} />}
              </Col>
              <Col xs="3" className="p-x-10">
                <ItemLabel>Amount</ItemLabel>
                {isPropertiesDetailLoaded ?
                  <ItemValue>${currencyFormat(propertiesDetail.concession_amount || 0)}</ItemValue> :
                  <Skeleton width={80} height={12} style={{ borderRadius: '6px' }} />}
              </Col>
              <Col className="p-x-10">
                <ItemLabel>As % of Average Rent</ItemLabel>
                {isPropertiesDetailLoaded ?
                  <ItemValue>{propertiesDetail.concession_avg_rent_percent}%</ItemValue> :
                  <Skeleton width={80} height={12} style={{ borderRadius: '6px' }} />}
              </Col>
            </Row>
          }
        </CardBody>
      </CardBasic>
      <CardBasic className="mt-20">
        <CardHeader>
          <CardTitle xs>Competitors</CardTitle>
        </CardHeader>
        <CardBody>
          {isPropertiesCompetitorsLoaded && !countCompetitors ?
            <CompeteEmpty
              icon="ri-building-4-line"
              title="No Competitors"
              text="This property has no competitors listed yet."
            /> :
            <TableWrapper paginationHidden={countCompetitors < 20}>
              <RemotePaginationTable
                data={isPropertiesCompetitorsLoaded ? propertiesCompetitors : defaultCompetitorsData()}
                totalSize={countCompetitors}
                columns={isPropertiesCompetitorsLoaded ? competitorsColumns(handleClickCompetitors) : defaultCompetitorsColumns}
                getData={getPropertiesCompetitors}
                id={propertyId}
                scrollClass="overflow-visible"
                hideSizePerPage
                hideScrollbars
              />
            </TableWrapper>}
        </CardBody>
      </CardBasic>
      <Row className="mt-20 m-row-10">
        <Col xs="6" className="p-x-10">
          {renderFeatureCard('Community Features', 'communities')}
        </Col>
        <Col xs="6" className="p-x-10">
          {renderFeatureCard('Apartment Features', 'amenities')}
        </Col>
      </Row>
      {isModalOpen &&
        <UnitPricingModal
          isModalOpen={isModalOpen}
          unitInfo={unitInfo}
          handleClose={() => toggleModal(false)}
          isOnMarket
        />}
    </React.Fragment>
  );
};

export default withRouter(GeneralReport);
