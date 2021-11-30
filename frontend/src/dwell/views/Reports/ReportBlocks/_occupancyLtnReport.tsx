import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'codemirror/src/util/misc';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

import Charts from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'fusioncharts/react-fusioncharts';
import FusionCharts from 'fusioncharts/fusioncharts';

import Loader from 'dwell/components/Loader';
import 'src/scss/pages/_reports.scss';
import { addLabelSetting, formatCompareValue, getCompareClass, getCompareIcon } from './_utils';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface OccupancyLTN {
  ltn: number,
  occupancy: number,
  occupied_units: number,
  units: number,
  units_to_hit_ltn: number,
}

interface OccupancyLTNReportProps extends RouteComponentProps {
  type: string,
  isUpdated: boolean,
  isLoaded: boolean,
  operationsReports: {
    occupancy_ltn_report: OccupancyLTN,
    portfolio: { occupancy_ltn_report: OccupancyLTN },
    compare_values: { occupancy_ltn_report: OccupancyLTN }
    chart_values: { ltn: [], occupancy: [], occupied_units: [] },
    floor_plans: { id: number }[],
  },
  compareFilterValue: string,
  unitType: { id: number, plan: string },
  setUnitType: (type: { id?: number, plan?: string }) => void,
}

const OccupancyLTNReport: FC<OccupancyLTNReportProps> = ({ operationsReports, compareFilterValue, type, isUpdated, unitType, setUnitType }) => {
  const [ltn, setLtn] = useState(0);
  const [occupancy, setOccupancy] = useState(0);
  const [occupiedUnits, setOccupiedUnits] = useState(0);
  const [units, setUnits] = useState(0);
  const [unitsToHitLtn, setUnitsToHitLtn] = useState(0);
  const [chartValues, setChartValues] = useState({ ltn: [], occupancy: [], occupied_units: [] });
  const [compareValues, setCompareValues] = useState({ ltn: 0, occupancy: 0, occupied_units: 0, units: 0, units_to_hit_ltn: 0 });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [floorPlans, setFloorPlans] = useState([]);

  const setLeadToLeaseData = (data) => {
    setLtn(data.ltn);
    setOccupancy(data.occupancy);
    setOccupiedUnits(data.occupied_units);
    setUnits(data.units);
    setUnitsToHitLtn(data.units_to_hit_ltn);
  };

  useEffect(() => {
    if (!isEmpty(operationsReports)) {
      const { occupancy_ltn_report: occupancyLTNReport, chart_values: operationsChartValues, portfolio } = operationsReports;
      const reportData = type === 'portfolio' && !isEmpty(portfolio) ? portfolio.occupancy_ltn_report : occupancyLTNReport;
      setLeadToLeaseData(reportData);

      setChartValues({ ltn: operationsChartValues.ltn, occupancy: operationsChartValues.occupancy, occupied_units: operationsChartValues.occupied_units });
      if (!isEmpty(operationsReports.compare_values)) {
        const { compare_values: { occupancy_ltn_report: leadToLeaseCompareValues } } = operationsReports;
        setCompareValues(leadToLeaseCompareValues);
      }

      if (!isEmpty(operationsReports.floor_plans)) {
        setFloorPlans(operationsReports.floor_plans);
      }
    }
  }, [operationsReports]);

  const tooltipHeader = label => `<div class="tooltip-header"><span style="text-align: center; width: 100%">${label}</span></div>`;
  const dataSource = {
    chart: {
      drawCrossLine: '1',
      crossLineAlpha: '40',
      showvalues: '0',
      theme: 'fusion',
      plothighlighteffect: 'fadeout',
      labelDisplay: 'none',
      snumbersuffix: '%',
    },
    categories: [{ category: addLabelSetting(chartValues.occupied_units.map(unit => ({ label: moment(unit.label).format('ll') }))) }],
    dataset: [
      {
        seriesname: 'Occupied units',
        color: '#73d998',
        data: chartValues.occupied_units.map(({ value, label }) =>
          ({ value, tooltext: `${tooltipHeader(moment(label).format('ll'))} <br> <br><div style="min-width: 70px;">Occupied units: ${value}</div>` })),
      },
      {
        seriesname: 'Occupancy',
        parentyaxis: 'S',
        renderas: 'line',
        showvalues: '0',
        anchorBgColor: '#ffec8c',
        anchorBorderColor: '#ffec8c',
        color: '#ffec8c',
        data: chartValues.occupancy.map(({ value }) => ({ value, tooltext: `Occupancy: ${value}%` })),
      },
      {
        seriesname: 'LTN',
        parentyaxis: 'S',
        renderas: 'line',
        showvalues: '0',
        anchorBgColor: '#f7c079',
        anchorBorderColor: '#f7c079',
        color: '#f7c079',
        data: chartValues.ltn.map(({ value }) => ({ value, tooltext: `LTN: ${value}%` })),
      },
    ],
  };

  const chartConfigs = {
    type: 'mscombidy2d',
    width: '100%',
    height: 450,
    dataFormat: 'json',
    dataSource,
  };

  return (
    <React.Fragment>
      {type === 'property' &&
        <div className="mb-1 d-flex align-items-center">Showing unit type:&nbsp;
          <ButtonDropdown className="mr-1 reports-filter" isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)} >
            <DropdownToggle caret className="bg-white" style={{ padding: '2px 5px', border: 0, color: '#73818f' }}>
              <span style={{ color: '#0096FF' }}>{isEmpty(unitType) ? 'Overall' : unitType.plan}</span>
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => setUnitType({})}>Overall</DropdownItem>
              {floorPlans.map((plan, i) => (
                <React.Fragment key={i}>
                  <DropdownItem onClick={() => setUnitType(plan)} className={plan.id === unitType.id ? 'selected' : ''}>{plan.plan}</DropdownItem>
                </React.Fragment>))}
            </DropdownMenu>
          </ButtonDropdown>
        </div>
      }
      <div>
        {isUpdated ?
          <ReactFC
            {...chartConfigs}
          /> : <div style={{ height: '410px' }}><Loader /></div>}
      </div>
      <hr />
      <div className="occupancy-ltn-totals">
        <div className="total"><div>TOTAL UNITS</div><div className="count">{units}</div>
          <div className={getCompareClass(compareValues.units)} style={{ display: compareFilterValue ? 'block' : 'none' }}>
            {getCompareIcon(compareValues.units)} {formatCompareValue(compareValues.units)}
          </div>
        </div>
        <div className="total"><div>OCCUPIED UNITS</div><div className="count">{occupiedUnits}</div>
          <div className={getCompareClass(compareValues.occupied_units)} style={{ display: compareFilterValue ? 'block' : 'none' }}>
            {getCompareIcon(compareValues.occupied_units)} {formatCompareValue(compareValues.occupied_units)}
          </div>
        </div>
        <div className="total"><div>OCCUPANCY</div><div className="count">{`${occupancy}%`}</div>
          <div className={getCompareClass(compareValues.occupancy)} style={{ display: compareFilterValue ? 'block' : 'none' }}>
            {getCompareIcon(compareValues.occupancy)} {formatCompareValue(compareValues.occupancy)}
          </div>
        </div>
        <div className="total"><div>LTN</div><div className="count">{`${ltn}%`}</div>
          <div className={getCompareClass(compareValues.ltn)} style={{ display: compareFilterValue ? 'block' : 'none' }}>
            {getCompareIcon(compareValues.ltn)} {formatCompareValue(compareValues.ltn)}
          </div>
        </div>
        <div className="total"><div>UNITS TO HIT LTN</div><div className="count">{unitsToHitLtn}</div>
          <div className={getCompareClass(compareValues.units_to_hit_ltn)} style={{ display: compareFilterValue ? 'block' : 'none' }}>
            {getCompareIcon(compareValues.units_to_hit_ltn)} {formatCompareValue(compareValues.units_to_hit_ltn)}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  operationsReports: state.report.operationsReports,
  currentProperty: state.property.property,
});

export default connect(mapStateToProps)(withRouter(OccupancyLTNReport));
