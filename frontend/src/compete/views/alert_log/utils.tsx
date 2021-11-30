import React, { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import { TableColumn, ThresholdLog } from 'src/interfaces';
import { currencyFormat, percentFormat, currencyRoundedFormat } from 'compete/constants';
import { Link, LeaseUp } from 'compete/views/styles';
import { getPropertyId } from 'src/utils';
import { TextStatus } from './styles';

interface RentData {
  id: number,
  property: string,
  combined_rent: number,
  combined_rent_last_week_diff: number,
  combined_rent_last_4_weeks_diff: number,
}

interface OccupancyData {
  id: number,
  property: string,
  occupancy: number,
  occupancy_last_week_diff: number,
  occupancy_last_4_weeks_diff: number,
}

interface ConcessionData {
  id: number,
  property: string,
  is_offering_concession: boolean,
  concession_amount: number,
  concession_amount_last_week_diff: number,
  concession_amount_last_4_weeks_diff: number,
}

interface AlertDelta {
  value: number,
  diff: number,
  delta: number,
  isCurrency?: boolean,
}

const CellSkeleton: FC<{ width: number }> = ({ width }) =>
  (<Skeleton width={width} height={9} style={{ borderRadius: '6px' }} />);

const AlertLogDelta: FC<AlertDelta> = ({ value, diff, delta, isCurrency = false }) => {
  const isNumber = !!Number(diff);
  const isPositiveValue = diff > 0;
  return (
    <div className="text-center">
      <span className="text-muted">{isCurrency ? `$${currencyRoundedFormat(value)}` : `${percentFormat(value)}%`}</span>
      <br />
      <TextStatus className={isNumber && (isPositiveValue ? 'text-success' : 'text-danger')}>
        {!!Number(delta) && (isCurrency ? (`${delta > 0 ? '+' : '-'}`) : (`${delta > 0 ? '+' : ''}`))}
        {isCurrency ? `$${currencyRoundedFormat(Math.abs(delta))}` : `${percentFormat(delta)}%`}
        &nbsp;({isNumber && (isPositiveValue ? '+' : '')}{diff}%)
        {isNumber && (isPositiveValue ? <i className="ri-arrow-up-line" /> : <i className="ri-arrow-down-line" />)}
      </TextStatus>
    </div>);
};

export const defaultRentData = (): RentData[] => new Array(3).fill({
  property: '',
  property_name: '',
  combined_rent: '',
  combined_rent_last_week_diff: '',
  combined_rent_last_4_weeks_diff: '',
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultRentLogColumns = ([
  {
    dataField: 'property_name',
    text: 'Property',
    sort: true,
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'combined_rent',
    text: 'Avg. Combined Rent',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'combined_rent_last_week_diff',
    text: 'Avg. Combined Rent vs Last Week',
    headerClasses: 'text-center',
    sort: true,
    formatter: () => <div className="text-center"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'combined_rent_last_4_weeks_diff',
    text: 'Avg. Combined Rent vs Last 4 weeks',
    headerClasses: 'text-center',
    sort: true,
    formatter: () => <div className="text-center"><CellSkeleton width={50} /></div>,
  },
] as TableColumn[]);

export const rentLogColumns = (rentFor: string, isUnit: boolean): TableColumn[] => ([
  {
    dataField: 'property_name',
    text: 'Property',
    sort: true,
    formatter: (value, row) => (
      <div className="d-flex align-items-center">
        <Link className="text-nowrap" href={`/${getPropertyId()}/compete/property-report/${row.property}`}>{value}</Link>
        {row.is_lease_up_property && <LeaseUp small>L</LeaseUp>}
      </div>),
  },
  {
    dataField: isUnit ? 'average_rent' : 'average_rent_per_sqft',
    text: `Avg. ${rentFor} Rent`,
    headerClasses: 'text-right',
    sort: true,
    formatter: (value, row) => <div className="text-right">${currencyRoundedFormat(row.combined_rent)}</div>,
  },
  {
    dataField: isUnit ? 'average_rent_last_week' : 'average_rent_per_sqft_last_week',
    text: `Avg. ${rentFor} Rent vs Last Week`,
    headerClasses: 'text-center',
    sort: true,
    formatter: (value, row) => <AlertLogDelta value={row.combined_rent_last_week} diff={row.combined_rent_last_week_diff} delta={row.combined_rent_last_week_delta} isCurrency />,
  },
  {
    dataField: isUnit ? 'average_rent_last_4_weeks' : 'average_rent_per_sqft_last_4_weeks',
    text: `Avg. ${rentFor} Rent vs Last 4 weeks`,
    headerClasses: 'text-center',
    sort: true,
    formatter: (value, row) => <AlertLogDelta value={row.combined_rent_last_4_weeks} diff={row.combined_rent_last_4_weeks_diff} delta={row.combined_rent_last_4_weeks_delta} isCurrency />,
  },
] as TableColumn[]);

export const defaultOccupancyData = (): OccupancyData[] => new Array(3).fill({
  property: '',
  property_name: '',
  occupancy: '',
  occupancy_last_week_diff: '',
  occupancy_last_4_weeks_diff: '',
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultOccupancyColumns = ([
  {
    dataField: 'property_name',
    text: 'Property',
    sort: true,
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'occupancy',
    text: 'Occupancy',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'occupancy_last_week_diff',
    text: 'Occupancy vs Last Week',
    headerClasses: 'text-center',
    sort: true,
    formatter: () => <div className="text-center"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'occupancy_last_4_weeks_diff',
    text: 'Occupancy vs Last 4 weeks',
    headerClasses: 'text-center',
    sort: true,
    formatter: () => <div className="text-center"><CellSkeleton width={50} /></div>,
  },
] as TableColumn[]);

export const occupancyLogColumns = ([
  {
    dataField: 'property_name',
    text: 'Property',
    sort: true,
    formatter: (value, row) => (
      <div className="d-flex align-items-center">
        <Link className="text-nowrap" href={`/${getPropertyId()}/compete/property-report/${row.property}`}>{value}</Link>
        {row.is_lease_up_property && <LeaseUp small>L</LeaseUp>}
      </div>),
  },
  {
    dataField: 'occupancy',
    text: 'Occupancy',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{percentFormat(value)}%</div>,
  },
  {
    dataField: 'occupancy_last_week',
    text: 'Occupancy vs Last Week',
    headerClasses: 'text-center',
    sort: true,
    formatter: (value, row) => <AlertLogDelta value={row.occupancy_last_week} diff={row.occupancy_last_week_diff} delta={row.occupancy_last_week_delta} />,
  },
  {
    dataField: 'occupancy_last_4_weeks',
    text: 'Occupancy vs Last 4 weeks',
    headerClasses: 'text-center',
    sort: true,
    formatter: (value, row) => <AlertLogDelta value={row.occupancy_last_4_weeks} diff={row.occupancy_last_4_weeks_diff} delta={row.occupancy_last_4_weeks_delta} />,
  },
] as TableColumn[]);

export const defaultConcessionsData = (): ConcessionData[] => new Array(3).fill({
  property: '',
  property_name: '',
  is_offering_concession: '',
  concession_amount: '',
  concession_amount_last_week_diff: '',
  concession_amount_last_4_weeks_diff: '',
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultConcessionColumns = ([
  {
    dataField: 'property_name',
    text: 'Property',
    sort: true,
    headerStyle: () => ({ width: '20%' }),
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'is_offering_concession',
    text: 'Offering Concession',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'concession_amount',
    text: 'Concession Amount',
    headerClasses: 'text-right',
    sort: true,
    formatter: () => <div className="text-right"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'concession_amount_last_week_diff',
    text: 'Concession Amount vs Last Week',
    headerClasses: 'text-center',
    sort: true,
    formatter: () => <div className="text-center"><CellSkeleton width={50} /></div>,
  },
  {
    dataField: 'concession_amount_last_4_weeks_diff',
    text: 'Concession Amount vs Last 4 weeks',
    headerClasses: 'text-center',
    sort: true,
    formatter: () => <div className="text-center"><CellSkeleton width={50} /></div>,
  },
] as TableColumn[]);

export const concessionLogColumns = (isCurrency: boolean): TableColumn[] => ([
  {
    dataField: 'property_name',
    text: 'Property',
    sort: true,
    formatter: (value, row) => (
      <div className="d-flex align-items-center">
        <Link className="text-nowrap" href={`/${getPropertyId()}/compete/property-report/${row.property}`}>{value}</Link>
        {row.is_lease_up_property && <LeaseUp small>L</LeaseUp>}
      </div>),
  },
  {
    dataField: 'is_offering_concession',
    text: 'Offering Concession',
    sort: true,
    formatter: value => <TextStatus className={value ? 'text-success' : 'text-danger'} lg><i className={value ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'} />{value ? 'Yes' : 'No'}</TextStatus>,
  },
  {
    dataField: 'concession_amount',
    text: 'Concession Amount',
    headerClasses: 'text-right',
    sort: true,
    formatter: value => <div className="text-right">{isCurrency ? `$${currencyFormat(value)}` : `${currencyFormat(value)}%`}</div>,
  },
  {
    dataField: isCurrency ? 'concession_amount_last_week' : 'concession_avg_rent_percent_last_week',
    text: 'Concession Amount vs Last Week',
    headerClasses: 'text-center',
    sort: true,
    formatter: (value, row) => <AlertLogDelta value={row.concession_amount_last_week} diff={row.concession_amount_last_week_diff} delta={row.concession_amount_last_week_delta} isCurrency={isCurrency} />,
  },
  {
    dataField: isCurrency ? 'concession_amount_last_4_weeks' : 'concession_avg_rent_percent_last_4_weeks',
    text: 'Concession Amount vs Last 4 weeks',
    headerClasses: 'text-center',
    sort: true,
    formatter: (value, row) => <AlertLogDelta value={row.concession_amount_last_4_weeks} diff={row.concession_amount_last_4_weeks_diff} delta={row.concession_amount_last_4_weeks_delta} isCurrency={isCurrency} />,
  },
] as TableColumn[]);

export const defaultThresholdData = (): ThresholdLog[] => new Array(3).fill({
  property: '',
  property_name: '',
  previous_value: '',
  new_value: '',
  movement: '',
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultThresholdColumns = ([
  {
    dataField: 'property_name',
    text: 'Asset',
    sort: true,
    headerStyle: () => ({ width: '20%' }),
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'previous_value',
    text: 'Previous day\'s Rent baseline',
    sort: true,
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'new_value',
    text: 'New Rent',
    sort: true,
    formatter: () => <CellSkeleton width={50} />,
  },
  {
    dataField: 'movement',
    text: 'Movement',
    sort: true,
    formatter: () => <CellSkeleton width={50} />,
  },
] as TableColumn[]);

export const thresholdColumns = (baselineColumnName: string, baseline: string): TableColumn[] => ([
  {
    dataField: 'property_name',
    text: 'Asset',
    sort: true,
    formatter: (value, row) => (
      <div className="d-flex align-items-center">
        <Link className="text-nowrap" href={`/${getPropertyId()}/compete/property-report/${row.property}`}>{value}</Link>
        {row.is_lease_up_property && <LeaseUp small>L</LeaseUp>}
      </div>),
  },
  {
    dataField: 'previous_value',
    text: baselineColumnName,
    sort: true,
    formatter: (value, row) => (row.condition_subject === 'OCCUPANCY' ? `${(value || 0).toFixed(1)}%` : `$${currencyRoundedFormat(value)}`),
  },
  {
    dataField: 'new_value',
    text: `New ${baseline}`,
    sort: true,
    formatter: (value, row) => (row.condition_subject === 'OCCUPANCY' ? `${(value || 0).toFixed(1)}%` : `$${currencyRoundedFormat(value)}`),
  },
  {
    dataField: 'movement',
    text: 'Movement',
    sort: true,
    formatter: (value, row) => {
      let emptyMovement;
      if (!row.new_value && !row.previous_value) return '-';
      if (!row.new_value || !row.previous_value) {
        emptyMovement = (row.new_value || 0) > (row.previous_value || 0) ? 100 : -100;
      }
      const movement = emptyMovement || (((row.new_value / row.previous_value) - 1) * 100).toFixed(1);
      const rentDelta = (row.new_value || 0) - (row.previous_value || 0);
      const isPercent = row.condition_subject === 'OCCUPANCY';
      return (
        <TextStatus className={movement > 0 ? 'text-success' : 'text-danger'}>
          {!!Number(rentDelta) && (isPercent ? `${rentDelta > 0 ? '+' : ''}` : `${rentDelta > 0 ? '+' : '-'}`)}
          {isPercent ? `${percentFormat(rentDelta)}%` : `$${currencyRoundedFormat(Math.abs(rentDelta))}`}
          &nbsp;({movement > 0 && '+'}{movement}%)
        </TextStatus>
      );
    },
  },
] as TableColumn[]);
