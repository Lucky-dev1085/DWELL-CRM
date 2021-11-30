import React, { useEffect, useState, FC } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import BootstrapTable from 'react-bootstrap-table-next';
import { Col, Modal, ModalBody, ModalHeader, Row, Dropdown, UncontrolledTooltip } from 'reactstrap';
import { cloneDeep, groupBy, isEmpty } from 'lodash';
import CustomInput from 'reactstrap/es/CustomInput';
import RemotePagination from 'dwell/components/remote_pagination';
import Loader from 'dwell/components/Loader';
import { reportTypes, unitTypes } from 'dwell/constants';
import { PropertyProps, Report } from 'src/interfaces';
import 'src/scss/pages/_reports.scss';
import 'src/scss/pages/_leads_list.scss';
import {
  DropdownButton,
  DropdownWrapper,
  SelectItem,
  SelectMenu,
  Separator,
} from 'dwell/views/Reports/ReportBlocks/styles';
import { DownloadIcon } from 'dwell/views/Reports/styles';
import {
  exportCallScoringDrilldownToXls, formatToOneDecimal,
  getTotalSpends,
  sortColumns,
} from './ReportBlocks/_utils';

interface DrilldownProps extends RouteComponentProps {
  setPropertyTypeFilterValue?: (property: PropertyProps) => void,
  reportType: string,
  blockType: string,
  handleClose: () => void,
  show: boolean,
  operationsReports?: Report,
  overviewReports?: Report,
  properties?: PropertyProps[],
  setType: (type: string) => void,
  setSizePerPage?: (size: number) => void,
  setPage?: (page: number) => void,
  page?: number,
  sizePerPage?: number,
  portfolioName?: string,
  startDate?: string,
  endDate?: string,
  isLoaded?: boolean,
  setShowPaidOnly?: (isShow: boolean) => void,
  showPaidOnly?: boolean,
  isBusinessHours: boolean,
  leadSourceDrilldown: {
    count: number,
    results: [
      {calls: number,
        id: number,
        leads: number,
        leased_rate: number,
        leases: number,
        property: string | number,
        source: string,
        spends: []
        tour_completed_rate: number,
        tours: number,
        propertyId: number | string;
        rowspan: number,
        type: string,
        spend: number,
        cost_per_lead:number,
        cost_per_lease:number,
        cost_per_tour:number,
      }
    ]
  },
  leadLostDrilldown: [{
    [key: string]: { name: string, value: number },
  }],
  isLoadedDrilldown: boolean,
}

const Drilldown: FC<DrilldownProps> = (props) => {
  const { reportType, blockType, setPropertyTypeFilterValue, handleClose, show, overviewReports, properties, setType, portfolioName,
    setSizePerPage, setPage, page, sizePerPage, startDate, endDate, isLoaded, setShowPaidOnly, showPaidOnly, operationsReports,
    isBusinessHours, leadSourceDrilldown, leadLostDrilldown, isLoadedDrilldown } = props;
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [unitSize, setUnitSize] = useState('STUDIO');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const closeBtn = <button className="close" onClick={() => handleClose()}>&times;</button>;
  const currentReport = reportTypes.REPORT_BLOCK_TYPES[reportType][blockType];
  const currentDefaultSortField = currentReport.defaultSortField;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getOverviewReportsData = (reports: any) => {
    if (!isEmpty(reports) && !isEmpty(properties) && !isEmpty(reports.portfolio)) {
      if (blockType === 'MARKETING_COMP') {
        const mtRents = reports[currentReport.id].mt_rents.map((rent) => {
          const newRent = { ...rent };
          newRent.isProperty = true;
          newRent.propertyId = newRent.id;
          return newRent;
        });
        const competitorRents = reports[currentReport.id].competitor_rents.map((rent) => {
          const newRent = { ...rent };
          newRent.isProperty = false;
          return newRent;
        });
        const reportData = mtRents.concat(competitorRents).map((rent, index) => {
          const newRent = { ...rent };
          newRent._id = index;
          return newRent;
        });
        setData(reportData);
      } else {
        const reportId = currentReport.id === 'calls_scoring_report' ? 'calls_report' : currentReport.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let reportData = Object.entries(reports[reportId]).map(([key, value]: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newValue = { ...value } as any;
          newValue.property = properties.find(property => property.id === Number(key)).name;
          newValue.propertyId = Number(key);
          if (blockType === 'ENGAGEMENT') {
            newValue.average_response_time = formatToOneDecimal((isBusinessHours ? value.average_response_time_business : value.average_response_time_non_business) / 60);
            newValue.followups_2_hours = value.followups_2_hours[isBusinessHours ? 0 : 1];
            newValue.followups_24_hours = value.followups_24_hours[isBusinessHours ? 0 : 1];
            newValue.followups_48_hours = value.followups_48_hours[isBusinessHours ? 0 : 1];
            newValue.followups_more_48_hours = value.followups_more_48_hours[isBusinessHours ? 0 : 1];
          }
          return newValue;
        });
        if (currentReport.id === 'calls_scoring_report') reportData = reportData.filter(property => property.average_call_score !== null);
        setData(reportData.sort((a, b) => b[currentDefaultSortField] - a[currentDefaultSortField]));
      }
    }
  };

  const getMarketingReportsData = () => {
    if (blockType === 'LEAD_SOURCE' && !isEmpty(leadSourceDrilldown)) {
      setTotalSize(leadSourceDrilldown.count);
      const groupedReportData = groupBy(leadSourceDrilldown.results, 'property');
      const reportData = Object.values(groupedReportData).map((value) => {
        let newValue = cloneDeep(value);
        newValue = newValue.map((item, index) => {
          const totalSpends = getTotalSpends(item.spends || [], startDate, endDate);
          const newItem = { ...item };
          newItem.propertyId = item.property;
          newItem.property = properties.find(property => property.id === item.property).name;
          newItem.rowspan = index === 0 ? newValue.length : 0;
          newItem.type = totalSpends ? 'Paid' : 'Non-paid';
          newItem.spend = totalSpends;
          newItem.cost_per_lead = !item.leads ? 0 : totalSpends / item.leads;
          newItem.cost_per_lease = !item.leases ? 0 : totalSpends / item.leases;
          newItem.cost_per_tour = !item.tours ? 0 : totalSpends / item.tours;
          return newItem;
        });
        return newValue;
      });
      if (!isEmpty(reportData.reduce((acc, val) => acc.concat(val), []))) {
        reportData.sort((a, b) => b[0].leads - a[0].leads);
      }
      setData(reportData.reduce((acc, val) => acc.concat(val), []));
    }
    if (blockType === 'LEAD_LOST' && !isEmpty(leadLostDrilldown)) {
      const newColumns = cloneDeep(columns);
      const report = Object.values(leadLostDrilldown);
      if (!isEmpty(report)) {
        const reportItem = Object.values(leadLostDrilldown)[0];
        Object.entries(reportItem).filter(e => !['property', 'lost_leads'].includes(e[0])).forEach(([key, value]) => {
          if (!newColumns.some(e => e.dataField === key)) {
            newColumns.push({ dataField: key, text: value.name, sort: true });
          }
        });
      }
      setColumns(newColumns);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reportData = report.map((value: any) => {
        const newValue = { ...value };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.entries(newValue).filter(e => !['property', 'lost_leads'].includes(e[0])).forEach(([key, val]: any) => {
          newValue[key] = val.value;
        });
        newValue.propertyId = Number(newValue.property);
        newValue.property = (properties.find(property => property.id === Number(newValue.property)) || {}).name;
        return newValue;
      }).filter(value => !!value.property);
      setData(reportData.sort((a, b) => b[currentDefaultSortField] - a[currentDefaultSortField]));
    }
  };

  useEffect(() => {
    switch (reportType) {
      case 'OVERVIEW_REPORTS': {
        getOverviewReportsData(overviewReports);
        break;
      }
      case 'OPERATIONS_REPORTS': {
        getOverviewReportsData(operationsReports);
        break;
      }
      default: break;
    }
  }, [overviewReports, operationsReports, isBusinessHours]);

  useEffect(() => {
    getMarketingReportsData();
  }, [leadSourceDrilldown, leadLostDrilldown]);

  useEffect(() => {
    if (currentReport.columns) {
      const newColumns = currentReport.columns.map((column) => {
        if (column.dataField === 'property' || column.dataField === 'name') {
          // eslint-disable-next-line no-param-reassign
          column.events = {
            onClick: (e, col, columnIndex, row) => {
              if (row.isProperty) {
                const selectedProperty = properties.find(property => property.id === row.propertyId);
                setType('property');
                setPropertyTypeFilterValue(selectedProperty);
                handleClose();
              }
            },
          };
        }
        return column;
      });
      setColumns(newColumns);
    }
  }, [reportType, blockType]);

  const onTableChange = (changeType, { page: tablePage, sizePerPage: tableSizePerPage, sortField, sortOrder, data: tableData }) => {
    let result = cloneDeep(tableData);
    if (changeType === 'sort') {
      result = sortColumns(sortOrder, sortField, result);
      if (['LEAD_SOURCE'].includes(blockType)) {
        const groupedResult = groupBy(result, 'property');
        result = Object.values(groupedResult).map((value) => {
          const newValue = cloneDeep(value);
          return newValue.map((item, index) => {
            const newItem = { ...item };
            newItem.rowspan = index === 0 ? newValue.length : 0;
            return newItem;
          });
        });
        result = result.reduce((acc, val) => acc.concat(val), []);
      }
      setData(result);
    }

    if (changeType === 'pagination') {
      setTimeout(() => {
        setPage(tablePage);
        setSizePerPage(tableSizePerPage);
      }, 300);
      setData([]);
    }
  };

  const indication = () => (
    <React.Fragment>
      <div className="empty-table">
        <div>{!isLoaded || !isLoadedDrilldown ? <Loader /> : <h4>No results found</h4>}</div>
      </div>
    </React.Fragment>);

  return (
    <Modal
      isOpen={show}
      centered
      toggle={() => handleClose()}
      size="xl"
      aria-labelledby="example-custom-modal-styling-title"
      className="drilldown reports"
    >
      <ModalHeader close={closeBtn}>
        <span>{`${currentReport.name.substring(0, currentReport.name.lastIndexOf(' '))} drilldown `}</span>
        <div className="dot" />
        <span>{portfolioName}</span>
        {blockType === 'CALL_SCORING' && !isEmpty(data) &&
          <React.Fragment>
            <Separator>|</Separator>
            <DownloadIcon
              className="ri-download-fill"
              id="export-call-scoring-drilldown"
              onClick={() => exportCallScoringDrilldownToXls(data)}
            />
            <UncontrolledTooltip trigger="hover" placement="top" target="export-call-scoring-drilldown" fade={false}>
            Download data
            </UncontrolledTooltip>
          </React.Fragment>}
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col xs={12} style={{ paddingBottom: '1em' }}>
            {blockType === 'MARKETING_COMP' &&
              <DropdownWrapper><span>Showing unit class:</span>
                <Dropdown isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(!isDropdownOpen)} >
                  <DropdownButton
                    caret
                    tag="div"
                    data-toggle="dropdown"
                    aria-expanded={isDropdownOpen}
                  >
                    {unitTypes.UNIT_TYPES[unitSize]}
                  </DropdownButton>
                  <SelectMenu>
                    {Object.keys(unitTypes.UNIT_TYPES).map((key, index) => <SelectItem key={index} onClick={() => setUnitSize(key)}>{unitTypes.UNIT_TYPES[key]}</SelectItem>)}
                  </SelectMenu>
                </Dropdown>
              </DropdownWrapper>}
            {blockType === 'LEAD_SOURCE' ?
              <div>
                <div className="mb-3 mt-1 ml-3">
                  <CustomInput id="show_paid_only_drilldown" type="checkbox" onChange={() => setShowPaidOnly(!showPaidOnly)} checked={showPaidOnly} label="Show paid source only" />
                </div>
                <RemotePagination
                  data={isEmpty(data) || !isLoadedDrilldown ? [] : data}
                  page={page}
                  sizePerPage={sizePerPage}
                  totalSize={totalSize}
                  onTableChange={onTableChange}
                  columns={columns}
                  keyField="id"
                  indication={indication}
                  wrapperClasses="drilldown-table table-responsive table-alpha"
                />
              </div> :
              <BootstrapTable
                remote={{ sort: true }}
                keyField={blockType === 'MARKETING_COMP' ? '_id' : 'propertyId'}
                data={blockType === 'MARKETING_COMP' ? data.filter(rent => rent.unit_class === unitSize) : data}
                columns={columns}
                wrapperClasses="drilldown-table table-responsive table-alpha"
                onTableChange={onTableChange}
                noDataIndication={indication}
                bordered={false}
              /> }
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
};

Drilldown.defaultProps = {
  overviewReports: {} as Report,
  operationsReports: {} as Report,
  properties: [],
  setPropertyTypeFilterValue: null,
  portfolioName: '',
  setSizePerPage: null,
  setPage: null,
  page: 1,
  sizePerPage: 10,
  startDate: '',
  endDate: '',
  isLoaded: true,
  showPaidOnly: false,
  setShowPaidOnly: null,
};

const mapStateToProps = state => ({
  operationsReports: state.report.operationsReports,
  overviewReports: state.report.overviewReports,
  currentProperty: state.property.property,
  properties: state.property.properties,
  startDate: state.report.startDate,
  endDate: state.report.endDate,
  isLoaded: state.report.isLoaded,
  leadSourceDrilldown: state.report.leadSourceDrilldown,
  leadLostDrilldown: state.report.leadLostDrilldown,
  isLoadedDrilldown: state.report.isLoadedDrilldown,
});

export default connect(mapStateToProps)(withRouter(Drilldown));
