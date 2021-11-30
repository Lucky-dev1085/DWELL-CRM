import React, { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import moment from 'moment';
import { sum, mean, maxBy, min } from 'lodash';
import { TableColumn, UnitType, CallBackId, AvailableUnit, PropertiesCompetitor } from 'src/interfaces';
import { DropdownFilter } from 'compete/components';
import { Link, LeaseUp, LinkText } from 'compete/views/styles';
import { stringToCapitalize, currencyFormat, percentFormat, currencyRoundedFormat } from 'compete/constants';
import { Badge, BadgeWrapper } from './styles';

export const skeletonFeatureWidth = [100, 60, 80, 100, 70];

const CellSkeleton: FC<{ width: number }> = ({ width }) =>
  (<Skeleton width={width} height={9} style={{ borderRadius: '6px' }} />);

export const defaultUnitTypeData = (): UnitType[] => new Array(3).fill({
  name: '',
  beds: '',
  baths: '',
  available_units_count: '',
  units_count: '',
  average_size: '',
  min_size: '',
  avg_rent_sqft: '',
  min_rent: '',
  unit_occupancy: '',
  average_rent: '',
  distribution: '',
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultUnitTypeColumns = [
  {
    dataField: 'name',
    text: 'Unit Type',
    headerClasses: 'text-nowrap',
    sort: true,
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'beds',
    text: 'Number of Beds',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'baths',
    text: 'Number of Baths',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'available_units_count',
    text: 'Number of Available Units',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'units_count',
    text: 'Number of Units',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'distribution',
    text: 'Unit Type Distribution',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'unit_occupancy',
    text: 'Unit Type LTN Occupancy',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'average_size',
    text: 'Unit Size Average (SqFt)',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'min_size',
    text: 'Unit Size Range (SqFt)',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'average_rent',
    text: 'Average Rent',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'avg_rent_sqft',
    text: 'Average Rent/SqFt',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'min_rent',
    text: 'Rent Range',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
] as TableColumn[];

export const unitTypesColumns = (isLeaseUp = false, data: UnitType[]): TableColumn[] => [
  {
    dataField: 'unit_type_index',
    text: 'Unit Type',
    headerClasses: 'text-nowrap',
    sort: true,
    formatter: (value, row) => <div className="text-nowrap">{stringToCapitalize(row.name)}</div>,
    footer: () => 'Summary',
    footerClasses: 'font-weight-bold',
  },
  {
    dataField: 'beds',
    text: 'Number of Beds',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? value : '-'}</div>,
    footerAlign: () => 'right',
    footer: columnData => `${Math.round(mean(columnData.filter(el => el)) || 0)}`,
  },
  {
    dataField: 'baths',
    text: 'Number of Baths',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? value : '-'}</div>,
    footerAlign: () => 'right',
    footer: columnData => `${Math.round(mean(columnData.filter(el => el)) || 0)}`,
  },
  {
    dataField: 'available_units_count',
    text: 'Number of Available Units',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? value : '-'}</div>,
    footerAlign: () => 'right',
    footer: columnData => sum(columnData),
  },
  {
    dataField: 'units_count',
    text: isLeaseUp ? 'Number of Currently Completed Units' : 'Number of Units',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? value : '-'}</div>,
    footerAlign: () => 'right',
    footer: columnData => sum(columnData),
  },
  {
    dataField: 'distribution',
    text: 'Unit Type Distribution',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? `${percentFormat(value)}%` : '-'}</div>,
    footerAlign: () => 'right',
    footer: columnData => `${percentFormat(sum(columnData))}%`,
  },
  {
    dataField: 'ltn_occupancy',
    text: 'Unit Type LTN Occupancy',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{percentFormat(value)}%</div>,
    footerAlign: () => 'right',
    footer: columnData => `${percentFormat(mean(columnData.filter(el => el)))}%`,
  },
  {
    dataField: 'average_size',
    text: 'Unit Size Average (SqFt)',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? Math.round(value) : '-'}</div>,
    footerAlign: () => 'right',
    footer: columnData => Math.round(mean(columnData.filter(el => el))),
  },
  {
    dataField: 'min_size',
    text: 'Unit Size Range (SqFt)',
    sort: true,
    formatter: (value, row) => <div className="text-right">{value !== null ? `${Math.round(value)}-${Math.round(row.max_size)}` : '-'}</div>,
    footerAlign: () => 'right',
    footer: (columnData) => {
      const maxValue = maxBy(data, 'max_size') || {};
      const minValue = Number(min(columnData));

      return `${Math.round(minValue || 0)}-${Math.round(maxValue.max_size)}`;
    },
  },
  {
    dataField: 'average_rent',
    text: 'Average Rent',
    sort: true,
    formatter: value => <div className="text-right">${currencyRoundedFormat(value)}</div>,
    footerAlign: () => 'right',
    footer: columnData => `$${currencyFormat(mean(columnData.filter(el => el)))}`,
  },
  {
    dataField: 'avg_rent_sqft',
    text: 'Average Rent/SqFt',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">${currencyFormat(value)}</div>,
    footerAlign: () => 'right',
    footer: columnData => `$${currencyFormat(mean(columnData.filter(el => el)))}`,
  },
  {
    dataField: 'min_rent',
    text: 'Rent Range',
    sort: true,
    formatter: (value, row) => <div className="text-right">${currencyRoundedFormat(value)}-${currencyRoundedFormat(row.max_rent)}</div>,
    footerAlign: () => 'right',
    footer: (columnData) => {
      const maxValue = maxBy(data, 'max_rent') || {};
      const minValue = Number(min(columnData));

      return `$${currencyRoundedFormat(minValue || 0)}-$${currencyRoundedFormat(maxValue.max_rent)}`;
    },
  },
] as TableColumn[];

export const defaultAvailableUnitData = (): AvailableUnit[] => new Array(3).fill({
  number: '',
  unit_type: '',
  floor_plan_name: '',
  beds: '',
  baths: '',
  unit_size: '',
  rent: '',
  avg_rent_per_sqft: '',
  available_date: '',
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultAvailableColumns = [
  {
    dataField: 'number',
    text: 'Unit Number',
    headerClasses: 'text-nowrap',
    sort: true,
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'unit_type',
    text: 'Unit Type',
    sort: true,
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'floor_plan_name',
    text: 'Floor Plan Name',
    sort: true,
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'beds',
    text: 'Number of Beds',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'baths',
    text: 'Number of Baths',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'unit_size',
    text: 'Unit Size (SqFt)',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'rent',
    text: 'Rent',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'avg_rent_per_sqft',
    text: 'Rent/SqFt',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'available_date',
    text: 'Available Date',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
] as TableColumn[];

export const availableUnitsColumns = (handleClick: CallBackId): TableColumn[] => ([
  {
    dataField: 'number',
    text: 'Unit Number',
    headerClasses: 'text-nowrap',
    sort: true,
    formatter: (value, row) => <LinkText className="text-nowrap" onClick={() => handleClick(value, row.unit_sessions)}>{value}</LinkText>,
  },
  {
    dataField: 'unit_type',
    text: 'Unit Type',
    sort: true,
  },
  {
    dataField: 'floor_plan_name',
    text: 'Floor Plan Name',
    sort: true,
  },
  {
    dataField: 'beds',
    text: 'Number of Beds',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? value : '-'}</div>,
  },
  {
    dataField: 'baths',
    text: 'Number of Baths',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? value : '-'}</div>,
  },
  {
    dataField: 'unit_size',
    text: 'Unit Size (SqFt)',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? value : '-'}</div>,
  },
  {
    dataField: 'rent',
    text: 'Rent',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">${currencyRoundedFormat(value)}</div>,
  },
  {
    dataField: 'avg_rent_per_sqft',
    text: 'Rent/SqFt',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? `$${currencyFormat(value)}` : '-'}</div>,
  },
  {
    dataField: 'available_date',
    text: 'Available Date',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{ value ? moment(value).format('MMM Do YYYY') : '-'}</div>,
  },
] as TableColumn[]);

export const defaultCompetitorsData = (): PropertiesCompetitor[] => new Array(3).fill({
  name: '',
  submarket: '',
  units_count: '',
  min_unit_size: '',
  min_rent: '',
  occupancy: '',
  rent: '',
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultCompetitorsColumns = [
  {
    dataField: 'name',
    text: 'Property',
    sort: true,
    formatter: () => <CellSkeleton width={100} />,
  },
  {
    dataField: 'submarket',
    text: 'Submarket',
    sort: true,
    formatter: () => <CellSkeleton width={100} />,
  },
  {
    dataField: 'units_count',
    text: 'Number of Units',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'min_unit_size',
    text: 'Unit Size Range (SqFt)',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'min_rent',
    text: 'Rent Range',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'occupancy',
    text: 'LTN Occupancy',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'id',
    text: '',
    formatter: () => <CellSkeleton width={25} />,
  },
] as TableColumn[];

export const competitorsColumns = (handleClick: CallBackId): TableColumn[] => ([
  {
    dataField: 'name',
    sort: true,
    text: 'Property',
    formatter: (value, row) => (
      <div className="d-flex align-items-center">
        <Link className="text-nowrap" href={row.id}>{value}</Link>
        {row.is_lease_up && <LeaseUp small>L</LeaseUp>}
      </div>),
  },
  {
    dataField: 'submarket',
    text: 'Submarket',
    sort: true,
  },
  {
    dataField: 'units_count',
    text: 'Number of Units',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? value : '-'}</div>,
  },
  {
    dataField: 'min_unit_size',
    text: 'Unit Size Range (SqFt)',
    headerClasses: 'text-right',
    sort: true,
    formatter: (value, row) => <div className="text-right">{value !== null ? `${Math.round(value)}-${Math.round(row.max_unit_size)}` : '-'}</div>,
  },
  {
    dataField: 'min_rent',
    text: 'Rent Range',
    headerClasses: 'text-right',
    sort: true,
    formatter: (value, row) => <div className="text-right">${currencyRoundedFormat(value)}-${currencyRoundedFormat(row.max_rent)}</div>,
  },
  {
    dataField: 'occupancy',
    text: 'LTN Occupancy',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? `${percentFormat(value)}%` : '-'}</div>,
  },
  {
    dataField: 'id',
    text: '',
    formatter: value => (
      <DropdownFilter
        optionList={['Run Comparison Report']}
        onChange={() => handleClick(value)}
        isComparisonMenu
      />
    ),
  },
] as TableColumn[]);

export const defaultPricingHistoryData = (): AvailableUnit[] => new Array(3).fill({
  number: '',
  unit_sessions: '',
  on_market: '',
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultPricingHistoryColumns = [
  {
    dataField: 'number',
    text: 'Unit Number',
    headerClasses: 'text-nowrap',
    sort: true,
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'unit_sessions',
    text: 'Session Count',
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'on_market',
    text: 'Status',
    headerClasses: 'text-right',
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
] as TableColumn[];

export const pricingHistoryColumns = (handleClick: CallBackId): TableColumn[] => ([
  {
    dataField: 'number',
    text: 'Unit Number',
    headerClasses: 'text-nowrap',
    sort: true,
    formatter: (value, row) => <LinkText className="text-nowrap" onClick={() => handleClick(value, row.unit_sessions)}>{value}</LinkText>,
  },
  {
    dataField: 'unit_sessions',
    text: 'Session Count',
    formatter: value => value.length,
  },
  {
    dataField: 'on_market',
    text: 'Status',
    headerClasses: 'text-right',
    formatter: () => <BadgeWrapper><Badge>Off market <i className="ri-close-circle-fill" /></Badge></BadgeWrapper>,
  },
] as TableColumn[]);
