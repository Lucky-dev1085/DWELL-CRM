import React, { useEffect, useState, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { CardHeader, CardBody, Row, Col, DropdownMenu, DropdownToggle } from 'reactstrap';
import { CustomSelect } from 'src/common';
import { Historical, RemotePaginationTable, CompeteEmpty } from 'compete/components';
import propertiesActions from 'compete/actions/properties';
import historyActions from 'compete/actions/historical_report';
import { ReportSettings, UnitInfo } from 'src/interfaces';
import { CardBasic, TableWrapper, Dropdown } from 'compete/components/common';
import { CardTitle } from 'compete/views/styles';
import { unitTypes, AVAILABLE_UNIT } from 'compete/constants';
import { pricingHistoryColumns, defaultPricingHistoryData, defaultPricingHistoryColumns } from './utils';
import UnitPricingModal from './unit_pricing_modal';

interface HistoricalReportProps extends RouteComponentProps {
  reportSettings: ReportSettings,
}

const HistoricalReport: FC<HistoricalReportProps> = ({ location: { pathname }, reportSettings }) => {
  const [availableUnitsFilter, setFilters] = useState(JSON.parse(localStorage.getItem(AVAILABLE_UNIT)) || unitTypes[0]);
  const [availableUnitDropdown, toggleDropdownAvailable] = useState(false);
  const [unitInfo, setUnitInfo] = useState({} as UnitInfo);
  const [isModalOpen, toggleModal] = useState(false);

  const dispatch = useDispatch();
  const propertiesDetail = useSelector(state => state.properties.propertiesDetail);
  const isAvailableUnitsLoaded = useSelector(state => state.properties.isAvailableUnitsLoaded);
  const countAvailableUnit = useSelector(state => state.properties.countAvailableUnit);
  const availableUnits = useSelector(state => state.properties.availableUnits);
  const isHistoricalPropertyRentLoaded = useSelector(state => state.historicalReport.isHistoricalPropertyRentLoaded);
  const historicalPropertyRent = useSelector(state => state.historicalReport.historicalPropertyRent);
  const isHistoricalPropertyOccupancyLoaded = useSelector(state => state.historicalReport.isHistoricalPropertyOccupancyLoaded);
  const historicalPropertyOccupancy = useSelector(state => state.historicalReport.historicalPropertyOccupancy);
  const isPropertyConcessionLoaded = useSelector(state => state.historicalReport.isPropertyConcessionLoaded);
  const propertyConcession = useSelector(state => state.historicalReport.propertyConcession);

  const { getHistoricalPropertyRent, getHistoricalPropertyOccupancy, getHistoricalPropertyConcession } = historyActions;
  const { getAvailableUnits, setAvailableLoaded } = propertiesActions;

  useEffect(() => {
    dispatch(setAvailableLoaded(false));
    localStorage.setItem(AVAILABLE_UNIT, JSON.stringify(availableUnitsFilter));
  }, [availableUnitsFilter]);

  const handleClickAvailableUnit = (id, session) => {
    setUnitInfo({ id, session });
    toggleModal(true);
  };

  const getPricingHistory = (id, params) => getAvailableUnits(id, { ...params, on_market: false });

  return (
    <React.Fragment>
      <Historical
        reportSettings={reportSettings}
        getHistoricalRent={getHistoricalPropertyRent}
        getHistoricalOccupancy={getHistoricalPropertyOccupancy}
        getHistoricalConcession={getHistoricalPropertyConcession}
        isRentLoaded={isHistoricalPropertyRentLoaded}
        historicalRent={historicalPropertyRent}
        entityDetail={propertiesDetail}
        isOccupancyLoaded={isHistoricalPropertyOccupancyLoaded}
        historicalOccupancy={historicalPropertyOccupancy}
        isConcessionLoaded={isPropertyConcessionLoaded}
        historicalConcession={propertyConcession}
        isProperty
      />
      <CardBasic className="mt-20">
        <CardHeader>
          <CardTitle xs>Unit Pricing History</CardTitle>
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
            <CompeteEmpty
              title="No Unit Pricing History"
              text="This property has no units pricing history."
            /> :
            <TableWrapper paginationHidden={countAvailableUnit < 20}>
              <RemotePaginationTable
                data={isAvailableUnitsLoaded ? availableUnits : defaultPricingHistoryData()}
                totalSize={countAvailableUnit}
                columns={isAvailableUnitsLoaded ? pricingHistoryColumns(handleClickAvailableUnit) : defaultPricingHistoryColumns}
                filters={availableUnitsFilter.value}
                getData={getPricingHistory}
                hideSizePerPage
                filterField="unit_type"
                id={pathname.split('/').pop()}
              />
            </TableWrapper>
          }
        </CardBody>
      </CardBasic>
      {isModalOpen &&
        <UnitPricingModal
          isModalOpen={isModalOpen}
          unitInfo={unitInfo}
          handleClose={() => toggleModal(false)}
        />}
    </React.Fragment>
  );
};

export default withRouter(HistoricalReport);
