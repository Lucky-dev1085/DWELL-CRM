import React from 'react';
import { unitTypes } from 'dwell/constants';
import { formatPriceValue, formatToOneDecimal } from 'dwell/views/Reports/ReportBlocks/_utils';
import { getPropertyId } from 'src/utils';
import moment from 'moment-timezone';

interface HeaderStyle {
  width?: string,
  whiteSpace?: string,
  textAlign?: string,
}

interface style {
  backgroundColor?: string,
  fontWeight?: number,
}

interface LeadRow {
  id?: number,
  first_name?: string,
  last_name?: string,
  is_deleted_by_merging?: boolean,
  status?: string,
  owner_name?: string,
}

export default {
  REPORT_BLOCK_TYPES: {
    OVERVIEW_REPORTS: {
      LEAD_TO_LEASE: {
        id: 'lead_to_lease_report',
        name: 'Lead-to-lease Report',
        tooltip: 'Understanding how your team\'s lead-to-lease pipeline is progressing in the selected time range.',
        defaultSortField: 'leads',
        columns: [
          {
            dataField: 'property',
            text: 'Property',
            sort: true,
          },
          {
            dataField: 'leads',
            text: 'Leads',
            sort: true,
          },
          {
            dataField: 'tours',
            text: 'Tours',
            sort: true,
          },
          {
            dataField: 'leases',
            text: 'Leases',
            sort: true,
          },
          {
            dataField: 'lead_to_tour',
            text: 'Lead-to-Tour rate',
            sort: true,
            formatter: (cell: string): string => `${cell}%`,
          },
          {
            dataField: 'tour_to_lease',
            text: 'Tour-to-Lease rate',
            sort: true,
            formatter: (cell: string): string => `${cell}%`,
          },
          {
            dataField: 'leased_rate',
            text: 'Leased rate',
            sort: true,
            formatter: (cell: string): string => `${cell}%`,
          },
        ],
      },
      ACTIVITY: {
        id: 'activity_report',
        name: 'Activity Report',
        tooltip: 'Understanding how productive your team is with their lead activities in the selected time period.',
        defaultSortField: 'activities',
        columns: [
          {
            dataField: 'property',
            text: 'Property',
            sort: true,
          },
          {
            dataField: 'activities',
            text: 'Total Activity',
            sort: true,
          },
          {
            dataField: 'emails',
            text: 'Emails',
            sort: true,
          },
          {
            dataField: 'calls',
            text: 'Phone calls',
            sort: true,
          },
          {
            dataField: 'tasks',
            text: 'Tasks',
            sort: true,
          },
          {
            dataField: 'notes',
            text: 'Notes',
            sort: true,
          },
        ],
      },
      ENGAGEMENT: {
        id: 'engagement_report',
        name: 'Engagement Report',
        tooltip: 'See how fast your team is following up with leads and signing leases.',
        defaultSortField: 'average_response_time',
        columns: [
          {
            dataField: 'property',
            text: 'Property',
            sort: true,
          },
          {
            dataField: 'average_response_time',
            text: 'Avg. Lead Response time (hrs)',
            sort: true,
          },
          {
            dataField: 'average_sign_lease_time',
            text: 'Avg. Time Sign Lease (days)',
            sort: true,
          },
          {
            dataField: 'average_followups_number',
            text: 'Avg. Number of Followups Sign Lease',
            sort: true,
          },
          {
            dataField: 'followups_2_hours',
            text: 'Followup within 2 hrs',
            sort: true,
            formatter: (cell: string): string => `${cell}%`,
          },
          {
            dataField: 'followups_24_hours',
            text: 'Followup within 24 hrs',
            sort: true,
            formatter: (cell: string): string => `${cell}%`,
          },
          {
            dataField: 'followups_48_hours',
            text: 'Followup within 48 hrs',
            sort: true,
            formatter: (cell: string): string => `${cell}%`,
          },
          {
            dataField: 'followups_more_48_hours',
            text: 'Followup more than 48 hrs',
            sort: true,
            formatter: (cell: string): string => `${cell}%`,
          },
        ],
      },
      CALLS: {
        id: 'calls_report',
        name: 'Calls Report',
        tooltip: 'Understanding how your team is managing phone call leads in the selected time range.',
        defaultSortField: 'prospect_calls',
        columns: [
          {
            dataField: 'property',
            text: 'Property',
            sort: true,
          },
          {
            dataField: 'prospect_calls',
            text: 'Total prospect calls',
            sort: true,
          },
          {
            dataField: 'average_call_time',
            text: 'Avg. call time (min)',
            sort: true,
          },
          {
            dataField: 'call_answered',
            text: 'Call answered',
            sort: true,
            formatter: (cell: {percents: string}): string => `${cell.percents}%`,
          },
          {
            dataField: 'call_missed',
            text: 'Call missed',
            sort: true,
            formatter: (cell: {percents: string}): string => `${cell.percents}%`,
          },
          {
            dataField: 'call_busy',
            text: 'Call busy',
            sort: true,
            formatter: (cell: {percents: string}): string => `${cell.percents}%`,
          },
          {
            dataField: 'call_failed',
            text: 'Call failed',
            sort: true,
            formatter: (cell: {percents: string}): string => `${cell.percents}%`,
          },
        ],
      },
      TOURS: {
        id: 'tours_report',
        name: 'Tours Report',
        tooltip: 'Understanding which tour types are requested the most by prospects and how the different tour types convert to leases for a selected time period.',
        defaultSortField: 'total_tours',
        columns: [
          {
            dataField: 'property',
            text: 'Property',
            sort: true,
          },
          {
            dataField: 'total_tours',
            text: 'Total Tours',
            sort: true,
          },
          {
            dataField: 'total_leases',
            text: 'Total Leases',
            sort: true,
          },
        ],
      },
      CALL_SCORING: {
        id: 'calls_scoring_report',
        name: 'Call Scoring Report',
        tooltip: 'Understanding how productive your team is with their lead activities in the selected time period.',
        defaultSortField: 'property',
        columns: [
          {
            dataField: 'property',
            text: 'Property',
            headerStyle: (): HeaderStyle => ({ width: '14%', whiteSpace: 'break-spaces', textAlign: 'left' }),
            sort: true,
          },
          {
            dataField: 'average_call_score',
            text: 'Avg. Call Score',
            sort: true,
            headerStyle: (): HeaderStyle => ({ width: '14%', whiteSpace: 'break-spaces', textAlign: 'left' }),
            formatter: (cell: string): string => (cell === null ? '-' : `${cell}%`),
          },
          {
            dataField: 'introduction',
            text: 'Introduction and Lead Information',
            sort: true,
            headerStyle: (): HeaderStyle => ({ width: '15%', whiteSpace: 'break-spaces', textAlign: 'left' }),
            formatter: (cell: string): string => (cell === null ? '-' : `${cell}%`),
          },
          {
            dataField: 'qualifying',
            text: 'Qualifying Questions',
            sort: true,
            headerStyle: (): HeaderStyle => ({ width: '13%', whiteSpace: 'break-spaces', textAlign: 'left' }),
            formatter: (cell: string): string => (cell === null ? '-' : `${cell}%`),
          },
          {
            dataField: 'amenities',
            text: 'Amenities and Benefits',
            sort: true,
            headerStyle: (): HeaderStyle => ({ width: '14%', whiteSpace: 'break-spaces', textAlign: 'left' }),
            formatter: (cell: string): string => (cell === null ? '-' : `${cell}%`),
          },
          {
            dataField: 'closing',
            text: 'Closing',
            sort: true,
            headerStyle: (): HeaderStyle => ({ width: '13%', whiteSpace: 'break-spaces', textAlign: 'left' }),
            formatter: (cell: string): string => (cell === null ? '-' : `${cell}%`),
          },
          {
            dataField: 'overall',
            text: 'Overall Impression',
            sort: true,
            headerStyle: (): HeaderStyle => ({ width: '15%', whiteSpace: 'break-spaces', textAlign: 'left' }),
            formatter: (cell: string): string => (cell === null ? '-' : `${cell}%`),
          },
        ],
      },
    },
    MARKETING_REPORTS: {
      LEAD_SOURCE: {
        id: 'lead_source_report',
        name: 'Lead source Report',
        tooltip: 'Get a sense of how each lead source is performing for your team and generating key business outcomes.',
        defaultSortField: 'leads',
        columns: [
          {
            dataField: 'property',
            text: 'Property',
            sort: true,
            attrs: (cell: string, row: { rowspan: string }): { rowSpan: string } => ({
              rowSpan: row.rowspan,
            }),
            style: (cell: string, row: { rowspan: number }): { display: string } => ({
              display: row.rowspan === 0 ? 'none' : 'table-cell',
            }),
          },
          {
            dataField: 'source',
            text: 'Source',
            sort: true,
          },
          {
            dataField: 'type',
            text: 'Type',
            sort: true,
          },
          {
            dataField: 'leads',
            text: 'Leads',
            sort: true,
          },
          {
            dataField: 'tours',
            text: 'Tours',
            sort: true,
          },
          {
            dataField: 'leases',
            text: 'Leases',
            sort: true,
          },
          {
            dataField: 'calls',
            text: 'Calls',
            sort: true,
          },
          {
            dataField: 'leased_rate',
            text: 'Leased rate (%)',
            sort: true,
            formatter: (cell: string): string => `${cell}%`,
          },
          {
            dataField: 'tour_completed_rate',
            text: 'Tour completed rate (%)',
            sort: true,
            formatter: (cell: string): string => `${cell}%`,
          },
          {
            dataField: 'spend',
            text: 'Spend',
            sort: true,
            formatter: (cell: number): string => formatPriceValue(cell),
          },
          {
            dataField: 'cost_per_lead',
            text: 'Cost per lead',
            sort: true,
            formatter: (cell: number): string => formatPriceValue(cell),
          },
          {
            dataField: 'cost_per_tour',
            text: 'Cost per tour',
            sort: true,
            formatter: (cell: number): string => formatPriceValue(cell),
          },
          {
            dataField: 'cost_per_lease',
            text: 'Cost per lease',
            sort: true,
            formatter: (cell: number): string => formatPriceValue(cell),
          },
        ],
      },
      LEAD_LOST: {
        id: 'lead_lost_report',
        name: 'Lead lost Report',
        tooltip: 'Use this report to better understand why leads are not leasing units at your property.',
        defaultSortField: 'lost_leads',
        columns: [
          {
            dataField: 'property',
            text: 'Property',
            sort: true,
          },
          {
            dataField: 'lost_leads',
            text: 'Total Leads Lost',
            sort: true,
          },
        ],
      },
    },
    OPERATIONS_REPORTS: {
      OCCUPANCY_LTN: {
        id: 'occupancy_ltn_report',
        name: 'Occupancy & LTN Report',
        tooltip: 'Use this report to better understand occupancy rates and the forecasted LTN for the property team.',
        defaultSortField: 'units',
        columns: [
          {
            dataField: 'property',
            text: 'Property',
            sort: true,
          },
          {
            dataField: 'units',
            text: 'Total units',
            sort: true,
          },
          {
            dataField: 'occupied_units',
            text: 'Occupied units',
            sort: true,
          },
          {
            dataField: 'occupancy',
            text: 'Occupancy',
            sort: true,
            formatter: (cell: string): string => `${cell}%`,
          },
          {
            dataField: 'ltn',
            text: 'LTN',
            sort: true,
            formatter: (cell: string): string => `${cell}%`,
          },
          {
            dataField: 'units_to_hit_ltn',
            text: 'Units to hit LTN',
            sort: true,
          },
        ],
      },
      MARKETING_COMP: {
        id: 'marketing_comp_report',
        name: 'Market Comp Report',
        tooltip: 'Get an understanding on how your property rent compares to direct competitions in the market.',
        defaultSortField: 'unit_class',
        columns: [
          {
            dataField: 'name',
            text: 'Property',
            sort: true,
            style: (cell: string, row: { isProperty: boolean }): { fontWeight: string } => ({
              fontWeight: row.isProperty ? '600' : '400',
            }),
          },
          {
            dataField: 'unit_class',
            text: 'Unit class',
            sort: true,
            formatter: (cell: string): string => unitTypes.UNIT_TYPES[cell],
          },
          {
            dataField: 'market_rent_low',
            text: 'Market rent low',
            sort: true,
            formatter: (cell: number): string => formatPriceValue(cell),
          },
          {
            dataField: 'market_rent_high',
            text: 'Market rent high',
            sort: true,
            formatter: (cell: number): string => formatPriceValue(cell),
          },
          {
            dataField: 'market_rent',
            text: 'Market rent',
            sort: true,
            formatter: (cell: number): string => formatPriceValue(cell),
          },
          {
            dataField: 'effective_rent_low',
            text: 'Effective rent low',
            sort: true,
            formatter: (cell: number): string => formatPriceValue(cell),
          },
          {
            dataField: 'effective_rent_high',
            text: 'Effective rent high',
            sort: true,
            formatter: (cell: number): string => formatPriceValue(cell),
          },
          {
            dataField: 'effective_rent',
            text: 'Effective rent',
            sort: true,
            formatter: (cell: number): string => formatPriceValue(cell),
          },
        ],
      },
    },
    TEAM_REPORTS: {
      TEAM_MEMBER: {
        id: 'team_member_report',
        name: 'Team member report',
        tooltip: '',
      },
      TEAM_MEMBER_ACTIVITY: {
        id: 'team_member_activity_report',
        name: 'Team member activity report',
        tooltip: '',
      },
    },
    LEADERBOARD_REPORTS: {
      LEASED_LEADERBOARD: {
        id: 'leased_leaderboard_report',
        name: 'Leased leaderboard',
        tooltip: '',
      },
      ACTIVITY_LEADERBOARD: {
        id: 'activity_leaderboard_report',
        name: 'Activity leaderboard',
        tooltip: '',
      },
      LEAD_FOLLOWUP_LEADERBOARD: {
        id: 'lead_followup_leaderboard_report',
        name: 'Lead followup leaderboard',
        tooltip: '',
      },
    },
    LEADS: {
      name: 'Leads',
      defaultSortField: 'first_name',
      columns: [
        {
          dataField: 'first_name',
          text: 'Name',
          sort: true,
          formatter: (name: string, row: LeadRow): JSX.Element => (
            <a href={`/${getPropertyId()}/leads/${row.id}`} target="_blank">{row.first_name} {row.last_name}</a>),
          style: (cell: string, row: LeadRow): style => ({ backgroundColor: row.status === 'DELETED' ? '#f7f8fc' : '#ffffff' }),
        },
        {
          dataField: 'email',
          text: 'Email',
          sort: true,
          style: (cell: string, row: LeadRow): style => ({ backgroundColor: row.status === 'DELETED' ? '#f7f8fc' : '#ffffff' }),
        },
        {
          dataField: 'source__name',
          text: 'Source',
          sort: true,
          style: (cell: string, row: LeadRow): style => ({ backgroundColor: row.status === 'DELETED' ? '#f7f8fc' : '#ffffff' }),
        },
        {
          dataField: 'created',
          text: 'Created',
          sort: true,
          formatter: (date: string): string => (date ? moment(date).tz('America/Phoenix').format('lll') : ''),
          style: (cell: string, row: LeadRow): style => ({ backgroundColor: row.status === 'DELETED' ? '#f7f8fc' : '#ffffff' }),
        },
        {
          dataField: 'acquisition_date',
          text: 'Acquisition Date',
          sort: true,
          formatter: (date: string): string => (date ? moment(date).tz('America/Phoenix').format('lll') : ''),
          style: (cell: string, row: LeadRow): style => ({ backgroundColor: row.status === 'DELETED' ? '#f7f8fc' : '#ffffff' }),
        },
        {
          dataField: 'last_followup_date',
          text: 'Engagement Date',
          sort: true,
          formatter: (date: string): string => (date ? moment(date).tz('America/Phoenix').format('lll') : ''),
          style: (cell: string, row: LeadRow): style => ({ backgroundColor: row.status === 'DELETED' ? '#f7f8fc' : '#ffffff' }),
        },
        {
          dataField: 'owner_name',
          text: 'Property Team Owner',
          sort: true,
          formatter: (cell: string, row: LeadRow): string => {
            if (row.status === 'DELETED') {
              if (row.is_deleted_by_merging) {
                return 'MERGED';
              }
              return 'DELETED';
            }
            return row.owner_name;
          },
          style: (cell: string, row: LeadRow): style => ({
            backgroundColor: row.status === 'DELETED' ? '#f7f8fc' : '#ffffff',
            fontWeight: row.status === 'DELETED' ? 500 : 400 }),
        },
      ],
    },
    TOURS: {
      name: 'Tours',
      defaultSortField: 'first_name',
      columns: [
        {
          dataField: 'first_name',
          text: 'Name',
          sort: true,
          formatter: (name: string, row: LeadRow): JSX.Element => (
            <a href={`/${getPropertyId()}/leads/${row.id}`} target="_blank">{row.first_name} {row.last_name}</a>),
        },
        {
          dataField: 'email',
          text: 'Email',
          sort: true,
        },
        {
          dataField: 'source__name',
          text: 'Source',
          sort: true,
        },
        {
          dataField: 'tour_completed_date',
          text: 'Tour Date',
          sort: true,
          formatter: (date: string): string => (date ? moment(date).tz('America/Phoenix').format('lll') : ''),
        },
        {
          dataField: 'owner_name',
          text: 'Property Team Owner',
          sort: true,
        },
        {
          dataField: 'tour_type',
          text: 'Tour type',
          sort: true,
        },
        {
          dataField: 'floor_plan_type',
          text: 'Floor plan type',
          sort: true,
        },
      ],
    },
    LEASES: {
      name: 'Leases',
      defaultSortField: 'first_name',
      columns: [
        {
          dataField: 'first_name',
          text: 'Name',
          sort: true,
          formatter: (name: string, row: LeadRow): JSX.Element => (
            <a href={`/${getPropertyId()}/leads/${row.id}`} target="_blank">{row.first_name} {row.last_name}</a>),
        },
        {
          dataField: 'email',
          text: 'Email',
          sort: true,
        },
        {
          dataField: 'source__name',
          text: 'Source',
          sort: true,
        },
        {
          dataField: 'acquisition_date',
          text: 'Acquisition Date',
          sort: true,
          formatter: (date: string): string => (date ? moment(date).tz('America/Phoenix').format('lll') : ''),
        },
        {
          dataField: 'closed_status_date',
          text: 'Lease Date',
          sort: true,
          formatter: (date: string): string => (date ? moment(date).tz('America/Phoenix').format('lll') : ''),
        },
        {
          dataField: 'owner_name',
          text: 'Property Team Owner',
          sort: true,
        },
      ],
    },
    RESPONSES: {
      name: 'Engagement report',
      defaultSortField: 'acquisition_date',
      columns: [
        {
          dataField: 'first_name',
          text: 'Name',
          sort: true,
          formatter: (name: string, row: LeadRow): JSX.Element => (
            <a href={`/${getPropertyId()}/leads/${row.id}`} target="_blank">{row.first_name} {row.last_name}</a>),
          headerStyle: (): HeaderStyle => ({ width: '15%', whiteSpace: 'pre' }),
        },
        {
          dataField: 'email',
          text: 'Email',
          sort: true,
          headerStyle: (): HeaderStyle => ({ width: '15%' }),
        },
        {
          dataField: 'created',
          text: 'Created',
          sort: true,
          formatter: (date: string): string => (date ? moment(date).tz('America/Phoenix').format('lll') : ''),
          headerStyle: (): HeaderStyle => ({ width: '10%' }),
        },
        {
          dataField: 'acquisition_date',
          text: 'Acquisition Date',
          sort: true,
          formatter: (date: string): string => (date ? moment(date).tz('America/Phoenix').format('lll') : ''),
          headerStyle: (): HeaderStyle => ({ width: '10%' }),
        },
        {
          dataField: 'first_followup_date',
          text: 'First Engagement Date',
          sort: true,
          formatter: (date: string): string => (date ? moment(date).tz('America/Phoenix').format('lll') : ''),
          headerStyle: (): HeaderStyle => ({ width: '10%' }),
        },
        {
          dataField: 'first_followup_type',
          text: 'Source',
          sort: true,
          headerStyle: (): HeaderStyle => ({ width: '10%' }),
        },
        {
          dataField: 'last_followup_date',
          text: 'Last Engagement Date',
          sort: true,
          formatter: (date: string): string => (date ? moment(date).tz('America/Phoenix').format('lll') : ''),
          headerStyle: (): HeaderStyle => ({ width: '10%' }),
        },
        {
          dataField: 'response_time_business',
          text: 'Response Time\n(business hours)',
          sort: true,
          formatter: (cell: number): number | string => formatToOneDecimal(cell / 60),
          headerStyle: (): HeaderStyle => ({ width: '5%', whiteSpace: 'pre' }),
        },
        {
          dataField: 'response_time_overall',
          text: 'Response Time\n(overall)',
          sort: true,
          formatter: (cell: number): number | string => formatToOneDecimal(cell / 60),
          headerStyle: (): HeaderStyle => ({ width: '5%', whiteSpace: 'pre' }),
        },
      ],
    },
    SITES_REPORTS: {
      SITE_VISITOR: {
        id: 'site_visitor',
        name: 'Site Visitor Report',
        tooltip: 'Understand the behaviors of users that visit your site within the selected time frame.',
        defaultSortField: 'leads',
        columns: [
          {
            dataField: 'property',
            text: 'Property',
            sort: true,
          },
          {
            dataField: 'leads',
            text: 'Leads',
            sort: true,
          },
          {
            dataField: 'tours',
            text: 'Tours',
            sort: true,
          },
          {
            dataField: 'leases',
            text: 'Leases',
            sort: true,
          },
          {
            dataField: 'lead_to_tour',
            text: 'Lead-to-Tour rate',
            sort: true,
            formatter: (cell: string): string => `${cell}%`,
          },
          {
            dataField: 'tour_to_lease',
            text: 'Tour-to-Lease rate',
            sort: true,
            formatter: (cell: string): string => `${cell}%`,
          },
          {
            dataField: 'leased_rate',
            text: 'Leased rate',
            sort: true,
            formatter: (cell: string): string => `${cell}%`,
          },
        ],
      },
      CONVERSION: {
        id: 'conversion',
        name: 'Conversion Report',
        tooltip: 'Understand how well your site converts visitors.',
        defaultSortField: 'leads',
        columns: [
          {
            dataField: 'property',
            text: 'Property',
            sort: true,
          },
        ],
      },
      SOURCE_BEHAVIOR: {
        id: 'source_behavior',
        name: 'Source Behavior Report',
        tooltip: 'Understand the behaviors of site visitors by source within the selected time frame.',
        defaultSortField: 'leads',
        columns: [
          {
            dataField: 'property',
            text: 'Property',
            sort: true,
          },
        ],
      },
      DEMOGRAPHICS: {
        id: 'demographics',
        name: 'Demographics',
        tooltip: 'Understand the age and gender demographics of site visitors.',
        defaultSortField: 'leads',
        columns: [
          {
            dataField: 'property',
            text: 'Property',
            sort: true,
          },
        ],
      },
      DEVICES: {
        id: 'devices',
        name: 'Devices',
        tooltip: 'Understand what devices your visitors are using to access your site.',
        defaultSortField: 'leads',
        columns: [
          {
            dataField: 'property',
            text: 'Property',
            sort: true,
          },
        ],
      },
      SEO_SCORE: {
        id: 'seo_score',
        name: 'SEO Score',
        tooltip: 'Understand how accessible, performant and SEO optimized your site is according to Google.',
        defaultSortField: 'leads',
        columns: [
          {
            dataField: 'property',
            text: 'Property',
            sort: true,
          },
        ],
      },
      ACQUISITION_CHANNELS: {
        id: 'acquisition_channels',
        name: 'Acquisition Channels',
        tooltip: 'Understand which sources drive site traffic.',
        defaultSortField: 'leads',
        columns: [
          {
            dataField: 'property',
            text: 'Property',
            sort: true,
          },
        ],
      },
    },
  },
};
