import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'codemirror/src/util/misc';
import { cloneDeep } from 'lodash';
import CustomInput from 'reactstrap/es/CustomInput';
import RemotePagination from 'dwell/components/remote_pagination';
import Loader from 'dwell/components/Loader';
import 'src/scss/pages/_reports.scss';
import { LineSkeleton } from 'src/utils';
import { TableCompare, ReportCompareValue, ComparePeriodLabel } from 'dwell/views/Reports/ReportBlocks/styles';
import {
  getTotalSpends,
  sortColumns,
  formatCompareValue,
  getCompareIcon,
  formatPriceValue,
  getCompareColor, getCompareValue,
  defaultLeadSourceColumns,
  defaultLeadSourceData,
} from './_utils';

interface LeadSourceReportProps extends RouteComponentProps {
  type: string,
  isUpdated: boolean,
  isLoaded: boolean,
  marketingReports: {
    lead_source_report: {
      results: {
        id: number,
        spends: { date: string, price: number }[],
        leads: number,
        leases: number,
        tours: number,
        compare_leads?: number,
        compare_leases?: number,
        compare_tours?: number,
        compare_calls?: number
      }[],
      count: number,
    },
    aggregated: {
      results: {
        id: number,
        spends: { date: string, price: number }[],
        leads: number,
        leases: number,
        tours: number,
        compare_leads: number,
        compare_leases: number,
        compare_tours: number,
        compare_calls: number
      }[],
      count: number
    },
    compare_values: {
      lead_source_report: {
        [key: number]: {
          leads: number | string | number[],
          tours: number | string | number[],
          leases: number | string | number[],
          calls: number | string | number[],
        }},
      aggregated: { spends: { date: string, price: number }[]}[] }
    chart_values: { [key: string]: { effective_rent_avg: { value: number, label: string }[], market_rent_avg: { value: number, label: string }[]}},
  },
  setLeadSourceSizePerPage: (pages: number) => void,
  setLeadSourcePage: (page: number) => void,
  sizePerPage: number,
  page: number,
  startDate: string,
  endDate: string,
  setShowPaidOnly: (show: boolean) => void,
  showPaidOnly: boolean,
}

const LeadSourceReport: FC<LeadSourceReportProps> = ({ marketingReports, type, setLeadSourceSizePerPage, setLeadSourcePage, sizePerPage, page, isUpdated, isLoaded, startDate, endDate, setShowPaidOnly, showPaidOnly }) => {
  const [leadSourceReportData, setLeadSourceReportData] = useState([]);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    if (!isEmpty(marketingReports)) {
      const { lead_source_report: leadSourceReport, aggregated } = marketingReports;
      let reportData = type === 'portfolio' && !isEmpty(aggregated) ? aggregated.results : leadSourceReport.results;
      setTotalSize(type === 'portfolio' && !isEmpty(aggregated) ? aggregated.count : leadSourceReport.count);

      reportData = reportData.map((item) => {
        const totalSpends = getTotalSpends(item.spends || [], startDate, endDate);
        return {
          ...item,
          type: totalSpends ? 'Paid' : 'Non-paid',
          spend: totalSpends,
          cost_per_lead: !item.leads ? 0 : totalSpends / item.leads,
          cost_per_lease: !item.leases ? 0 : totalSpends / item.leases,
          cost_per_tour: !item.tours ? 0 : totalSpends / item.tours,
        };
      });
      if (!isEmpty(marketingReports.compare_values)) {
        const { compare_values: { lead_source_report: leadSourceCompareValues, aggregated: aggregatedCompareValues } } = marketingReports;
        const compareValues = type === 'portfolio' && !isEmpty(aggregatedCompareValues) ? aggregatedCompareValues : leadSourceCompareValues;

        reportData = reportData.map((item) => {
          const newItem = item;
          newItem.compare_leads = compareValues[item.id.toString()].leads;
          newItem.compare_tours = compareValues[item.id.toString()].tours;
          newItem.compare_leases = compareValues[item.id.toString()].leases;
          newItem.compare_calls = compareValues[item.id.toString()].calls;
          return newItem;
        });
      }
      setLeadSourceReportData(reportData.sort((a, b) => b.leads - a.leads));
    }
  }, [marketingReports]);

  useEffect(() => {
    if (!isLoaded) {
      setLeadSourceReportData(defaultLeadSourceData());
    }
  }, [isLoaded]);

  const columns = [
    {
      dataField: 'source',
      text: 'Source',
      sort: true,
      headerStyle: () => ({ width: '20%' }),
    },
    {
      dataField: 'type',
      text: 'Type',
      sort: true,
      headerStyle: () => ({ width: 'calc(80% / 11)' }),
    },
    {
      dataField: 'leads',
      text: 'Leads',
      sort: true,
      headerStyle: () => ({ width: 'calc(80% / 11)' }),
      formatter: (cell, row) => (
        <React.Fragment>
          <div className="percent-bar">
            <div>{cell}</div>
            {row.compare_leads !== undefined && (
              <TableCompare compareFilterValue={row.compare_leads !== undefined}>
                <ReportCompareValue color={getCompareColor(getCompareValue(row.compare_leads))}>
                  {formatCompareValue(getCompareValue(row.compare_leads))} {getCompareIcon(getCompareValue(row.compare_leads))}
                  {!['n/a', 0].includes(row.compare_leads) && <ComparePeriodLabel>{`(${row.compare_leads[1]})`}</ComparePeriodLabel>}
                </ReportCompareValue>
              </TableCompare>
            )}
          </div>
        </React.Fragment>
      ),
    },
    {
      dataField: 'tours',
      text: 'Tours',
      sort: true,
      headerStyle: () => ({ width: 'calc(80% / 11)' }),
      formatter: (cell, row) => (
        <React.Fragment>
          <div className="percent-bar">
            <div>{cell}</div>
            {row.compare_leads !== undefined && (
              <TableCompare compareFilterValue={row.compare_tours !== undefined}>
                <ReportCompareValue color={getCompareColor(getCompareValue(row.compare_tours))}>
                  {formatCompareValue(getCompareValue(row.compare_tours))} {getCompareIcon(getCompareValue(row.compare_tours))}
                  {!['n/a', 0].includes(row.compare_tours) && <ComparePeriodLabel>{`(${row.compare_tours[1]})`}</ComparePeriodLabel>}
                </ReportCompareValue>
              </TableCompare>
            )}
          </div>
        </React.Fragment>
      ),
    },
    {
      dataField: 'leases',
      text: 'Leases',
      sort: true,
      headerStyle: () => ({ width: 'calc(80% / 11)' }),
      formatter: (cell, row) => (
        <React.Fragment>
          <div className="percent-bar">
            <div>{cell}</div>
            {row.compare_leads !== undefined && (
              <TableCompare compareFilterValue={row.compare_leases !== undefined}>
                <ReportCompareValue color={getCompareColor(getCompareValue(row.compare_leases))}>
                  {formatCompareValue(getCompareValue(row.compare_leases))} {getCompareIcon(getCompareValue(row.compare_leases))}
                  {!['n/a', 0].includes(row.compare_leases) && <ComparePeriodLabel>{`(${row.compare_leases[1]})`}</ComparePeriodLabel>}
                </ReportCompareValue>
              </TableCompare>
            )}
          </div>
        </React.Fragment>
      ),
    },
    {
      dataField: 'calls',
      text: 'Calls',
      sort: true,
      headerStyle: () => ({ width: 'calc(80% / 11)' }),
      formatter: (cell, row) => (
        <React.Fragment>
          <div className="percent-bar">
            <div>{cell}</div>
            {row.compare_leads !== undefined && (
              <TableCompare compareFilterValue={row.compare_calls !== undefined}>
                <ReportCompareValue color={getCompareColor(getCompareValue(row.compare_calls))}>
                  {formatCompareValue(getCompareValue(row.compare_calls))} {getCompareIcon(getCompareValue(row.compare_calls))}
                  {!['n/a', 0].includes(row.compare_calls) && <ComparePeriodLabel>{`(${row.compare_calls[1]})`}</ComparePeriodLabel>}
                </ReportCompareValue>
              </TableCompare>
            )}
          </div>
        </React.Fragment>
      ),
    },
    {
      dataField: 'leased_rate',
      text: 'Leased rate (%)',
      sort: true,
      headerStyle: () => ({ width: 'calc(80% / 11)' }),
      formatter: cell => `${cell}%`,
    },
    {
      dataField: 'tour_completed_rate',
      text: 'Tour completed rate (%)',
      headerStyle: () => ({ width: 'calc(80% / 11)' }),
      formatter: cell => `${cell}%`,
      sort: true,
    },
    {
      dataField: 'spend',
      text: 'Spend',
      sort: true,
      headerStyle: () => ({ width: 'calc(80% / 11)' }),
      formatter: cell => formatPriceValue(cell),
    },
    {
      dataField: 'cost_per_lead',
      text: 'Cost per lead',
      sort: true,
      headerStyle: () => ({ width: 'calc(80% / 11)' }),
      formatter: cell => formatPriceValue(cell),
    },
    {
      dataField: 'cost_per_tour',
      text: 'Cost per tour',
      sort: true,
      headerStyle: () => ({ width: 'calc(80% / 11)' }),
      formatter: cell => formatPriceValue(cell),
    },
    {
      dataField: 'cost_per_lease',
      text: 'Cost per lease',
      sort: true,
      headerStyle: () => ({ width: 'calc(80% / 11)' }),
      formatter: cell => formatPriceValue(cell),
    },
  ];

  const handleTableChange = (changeType, { page: tablePage, sizePerPage: tableSizePerPage, sortField, sortOrder, data: tableData }) => {
    if (changeType === 'sort') {
      const result = sortColumns(sortOrder, sortField, cloneDeep(tableData));
      setLeadSourceReportData(result);
    }
    if (changeType === 'pagination') {
      setTimeout(() => {
        setLeadSourcePage(tablePage);
        setLeadSourceSizePerPage(tableSizePerPage);
      }, 300);
      setLeadSourceReportData([]);
    }
  };

  const indication = () => (
    <React.Fragment>
      <div className="empty-table">
        {/* eslint-disable-next-line jsx-a11y/heading-has-content */}
        <div style={{ height: '30px' }}>{!isUpdated || !isLoaded ? <Loader /> : <h5>No results found</h5>}</div>
      </div>
    </React.Fragment>);

  return (
    <React.Fragment>
      <div className="lead-source-report">
        <div className="mb-3 mt-2">
          {isLoaded && isUpdated ?
            <CustomInput id="show_paid_only" type="checkbox" onChange={() => setShowPaidOnly(!showPaidOnly)} checked={showPaidOnly} label="Show paid source only" /> :
            <LineSkeleton width={100} height={10} />}
        </div>
        <RemotePagination
          wrapperClasses="table-responsive"
          data={isEmpty(leadSourceReportData) ? [] : leadSourceReportData}
          page={page}
          sizePerPage={sizePerPage}
          totalSize={totalSize}
          onTableChange={handleTableChange}
          columns={isLoaded && isUpdated ? columns : defaultLeadSourceColumns()}
          keyField="id"
          indication={indication}
        />
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  marketingReports: state.report.marketingReports,
  currentProperty: state.property.property,
  isLoaded: state.report.isLoaded,
  startDate: state.report.startDate,
  endDate: state.report.endDate,
});

export default connect(mapStateToProps)(withRouter(LeadSourceReport));
