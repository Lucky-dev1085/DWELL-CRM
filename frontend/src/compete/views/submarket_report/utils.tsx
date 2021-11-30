import React, { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import { sum, mean, maxBy, min } from 'lodash';
import { TableColumn, RentComps, UnitType, PropertiesBreakdown } from 'src/interfaces';
import { Link, LeaseUp } from 'compete/views/styles';
import { stringToCapitalize, currencyFormat, percentFormat, currencyRoundedFormat } from 'compete/constants';
import { getPropertyId } from 'src/utils';

const CellSkeleton: FC<{ width: number }> = ({ width }) =>
  (<Skeleton width={width} height={9} style={{ borderRadius: '6px' }} />);

export const defaultUnitTypeData = (): UnitType[] => new Array(3).fill({
  unit_type: '',
  beds: '',
  min_baths: '',
  available_units_count: '',
  units_count: '',
  unit_occupancy: '',
  avg_size: '',
  min_size: '',
  avg_rent: '',
  avg_rent_sqft: '',
  min_rent: '',
  distribution: '',
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultUnitTypeColumns = [
  {
    dataField: 'unit_type',
    text: 'Unit Type',
    headerClasses: 'text-nowrap',
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
    dataField: 'min_baths',
    text: 'Number of Baths',
    headerClasses: 'text-right',
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
    headerClasses: 'text-right',
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
    dataField: 'avg_size',
    text: 'Unit Size Average (SqFt)',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'min_size',
    text: 'Unit Size Range (SqFt)',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'avg_rent',
    text: 'Average Rent',
    headerClasses: 'text-right',
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
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
] as TableColumn[];

export const unitTypeOverviewColumns = (data: UnitType[]): TableColumn[] => ([
  {
    dataField: 'unit_type_index',
    text: 'Unit Type',
    headerClasses: 'text-nowrap',
    sort: true,
    formatter: (value, row) => <div className="text-nowrap">{stringToCapitalize(row.unit_type)}</div>,
    footer: () => 'Summary',
    footerClasses: 'font-weight-bold',
  },
  {
    dataField: 'beds',
    text: 'Number of Beds',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? value : '-'}</div>,
    footerAlign: () => 'right',
    footer: columnData => `${Math.round(mean(columnData.filter(el => el)) || 0)}`,
  },
  {
    dataField: 'max_baths',
    text: 'Number of Baths',
    headerClasses: 'text-right',
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
    text: 'Number of Units',
    headerClasses: 'text-right',
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
    dataField: 'avg_size',
    text: 'Unit Size Average (SqFt)',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{Math.round(value)}</div>,
    footerAlign: () => 'right',
    footer: columnData => Math.round(mean(columnData.filter(el => el))),
  },
  {
    dataField: 'min_size',
    text: 'Unit Size Range (SqFt)',
    headerClasses: 'text-right',
    sort: true,
    formatter: (value, row) => <div className="text-right">{value !== null ? `${value} - ${row.max_size}` : '-'}</div>,
    footerAlign: () => 'right',
    footer: (columnData) => {
      const maxValue = maxBy(data, 'max_size') || {};
      const minValue = Number(min(columnData));

      return `${Math.round(minValue || 0)}-${Math.round(maxValue.max_size)}`;
    },
  },
  {
    dataField: 'avg_rent',
    text: 'Average Rent',
    headerClasses: 'text-right',
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
    headerClasses: 'text-right',
    sort: true,
    formatter: (value, row) => <div className="text-right">{value !== null ? `$${currencyRoundedFormat(value)} - $${currencyRoundedFormat(row.max_rent)}` : '-'}</div>,
    footerAlign: () => 'right',
    footer: (columnData) => {
      const maxValue = maxBy(data, 'max_rent') || {};
      const minValue = Number(min(columnData));

      return `$${currencyRoundedFormat(minValue || 0)}-$${currencyRoundedFormat(maxValue.max_rent)}`;
    },
  },
] as TableColumn[]);

export const defaultRentCompsData = (): RentComps[] => new Array(3).fill({
  property: '',
  name: '',
  average_rent: '',
  average_size: '',
  average_rent_sqft: '',
  available_units_count: '',
  units_count: '',
  unit_occupancy: '',
  rank: '',
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultRentCompsColumns = [
  {
    dataField: 'property',
    text: 'Property Name',
    headerClasses: 'text-nowrap',
    sort: true,
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'name',
    text: 'Unit Type',
    sort: true,
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'rank',
    text: 'Rank',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'average_rent',
    text: 'Average Rent',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'average_size',
    text: 'Unit Size Average (SqFt)',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'average_rent_sqft',
    text: 'Average Rent/SqFt',
    headerClasses: 'text-right',
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
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'unit_occupancy',
    text: 'Unit Type LTN Occupancy Rate',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
] as TableColumn[];

export const rentCompsColumns = [
  {
    dataField: 'property',
    text: 'Property Name',
    headerClasses: 'text-nowrap',
    sort: true,
    formatter: value => <div className="text-nowrap">{stringToCapitalize(value)}</div>,
  },
  {
    dataField: 'name',
    text: 'Unit Type',
    sort: true,
    formatter: value => stringToCapitalize(value),
  },
  {
    dataField: 'rank',
    text: 'Rank',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? `#${value}` : '-'}</div>,
  },
  {
    dataField: 'average_rent',
    text: 'Average Rent',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? `$${currencyRoundedFormat(value)}` : '-'}</div>,
  },
  {
    dataField: 'average_size',
    text: 'Unit Size Average (SqFt)',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? Math.round(value) : '-'}</div>,
  },
  {
    dataField: 'average_rent_sqft',
    text: 'Average Rent/SqFt',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">${currencyFormat(value)}</div>,
  },
  {
    dataField: 'available_units_count',
    text: 'Number of Available Units',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? value : '-'}</div>,
  },
  {
    dataField: 'units_count',
    text: 'Number of Units',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{value !== null ? value : '-'}</div>,
  },
  {
    dataField: 'ltn_occupancy',
    text: 'Unit Type LTN Occupancy Rate',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{percentFormat(value)}%</div>,
  },
] as TableColumn[];

export const defaultSubmarketPropertiesData = (): PropertiesBreakdown[] => new Array(3).fill({
  name: '',
  units_count: '',
  min_unit_size: '',
  avg_unit_size: '',
  avg_rent: '',
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultSubmarketPropertiesColumns = [
  {
    dataField: 'name',
    sort: true,
    text: 'Property',
    formatter: () => <CellSkeleton width={50} />,
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
    dataField: 'avg_unit_size',
    text: 'Unit Size Average (SqFt)',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'avg_rent',
    text: 'Average Rent',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
] as TableColumn[];

export const propertyBreakdownColumns = (): TableColumn[] => ([
  {
    dataField: 'name',
    text: 'Property',
    sort: true,
    formatter: (value, row) => (
      <div className="d-flex align-items-center">
        <Link className="text-nowrap" href={`/${getPropertyId()}/compete/property-report/${row.id}`}>{value}</Link>
        {row.is_lease_up && <LeaseUp small>L</LeaseUp>}
      </div>),
  },
  {
    dataField: 'units_count',
    text: 'Number of Units',
    headerClasses: 'text-right',
    formatter: value => <div className="text-right">{value !== null ? value : '-'}</div>,
    sort: true,
  },
  {
    dataField: 'min_unit_size',
    text: 'Unit Size Range (SqFt)',
    headerClasses: 'text-right',
    sort: true,
    formatter: (value, row) => <div className="text-right">{value !== null ? `${Math.round(value)}-${Math.round(row.max_unit_size)}` : '-'}</div>,
  },
  {
    dataField: 'avg_unit_size',
    text: 'Unit Size Average (SqFt)',
    headerClasses: 'text-right',
    formatter: value => <div className="text-right">{value !== null ? Math.round(value) : '-'}</div>,
    sort: true,
  },
  {
    dataField: 'avg_rent',
    text: 'Average Rent',
    headerClasses: 'text-right',
    formatter: value => <div className="text-right">${currencyRoundedFormat(value)}</div>,
    sort: true,
  },
] as TableColumn[]);
