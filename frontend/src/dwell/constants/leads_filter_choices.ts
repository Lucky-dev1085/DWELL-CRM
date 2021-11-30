import fieldChoices from './field_choices';

const getStatusChoices = () => {
  const data = { ...fieldChoices.LEAD_FILED_CHOICES.status };
  Object.keys(data).forEach(key => data[key] = data[key].title);
  return data;
};

export default {
  FILTER_CHOICES: {
    created: {
      name: 'Created At',
      isDate: true,
    },
    updated: {
      name: 'Updated At',
      isDate: true,
    },
    first_name: {
      name: 'First Name',
      isText: true,
    },
    last_name: {
      name: 'Last Name',
      isText: true,
    },
    email: {
      name: 'Email Address',
      isText: true,
    },
    phone_number: {
      name: 'Phone Number',
      isText: true,
    },
    // source: 'Source',
    origin: {
      name: 'Origin',
      choices: fieldChoices.LEAD_FILED_CHOICES.origin,
    },
    last_followup_date: {
      name: 'Last Followup Date',
      isDate: true,
    },
    move_in_date: {
      name: 'Move In Date',
      isDate: true,
    },
    days_move_in: {
      name: 'Days to move-in',
      isNumber: true,
    },
    desired_rent: {
      name: 'Desired Rent',
      isNumber: true,
    },
    lease_term: {
      name: 'Lease Term',
      isNumber: true,
    },
    moving_reason: {
      name: 'Moving Reason',
      choices: fieldChoices.LEAD_FILED_CHOICES.movingReason,
    },
    best_contact_method: {
      name: 'Best Contact Method',
      choices: fieldChoices.LEAD_FILED_CHOICES.contactMethod,
    },
    best_contact_time: {
      name: 'Best Contact Time',
      choices: fieldChoices.LEAD_FILED_CHOICES.contactTime,
    },
    occupants: {
      name: 'Occupants',
      isNumber: true,
    },
    beds: {
      name: 'Beds',
      isNumber: true,
    },
    baths: {
      name: 'Baths',
      isNumber: true,
    },
    pets: {
      name: 'Pets',
      isNumber: true,
    },
    pet_type: {
      name: 'Pet Type',
      choices: fieldChoices.LEAD_FILED_CHOICES.petType,
    },
    vehicles: {
      name: 'Vehicles',
      isNumber: true,
    },
    washer_dryer_method: {
      name: 'Washer Dryer Method',
      choices: fieldChoices.LEAD_FILED_CHOICES.washerDryerMethod,
    },
    stage: {
      name: 'Stage',
      choices: fieldChoices.LEAD_FILED_CHOICES.stage,
    },
    status: {
      name: 'Status',
      choices: getStatusChoices(),
    },
    pms_sync_date: {
      name: 'PMS Sync Date',
      isDate: true,
    },
    pms_sync_status: {
      name: 'PMS Sync Status',
      choices: fieldChoices.LEAD_FILED_CHOICES.pmsSyncStatus,
    },
    owner: {
      name: 'Owner',
    },
    last_activity_date: {
      name: 'Last Activity Date',
      isDate: true,
    },
    next_task_due_date: {
      name: 'Next Task Due Date',
      isDate: true,
    },
    floor_plan: {
      name: 'Floor Plan',
    },
  },
  OPERATOR_CHOICES: {
    text: {
      IS: 'Is',
      IS_NOT: 'Is not',
      STARTS_WITH: 'Starts with',
      ENDS_WITH: 'Ends with',
    },

    number: {
      IS: 'Is',
      IS_BETWEEN: 'Is between',
      IS_LESS_THAN: 'Is less than',
      IS_GREATER_THAN: 'Is greater than',
      IS_NOT_SET: 'Is not set',
    },

    date: {
      IS_ON: 'Is on',
      IS_BETWEEN: 'Is between',
      IS_ON_OR_BEFORE: 'Is on or before',
      IS_ON_OR_AFTER: 'Is on or after',
      IS_NOT_SET: 'Is not set',
    },

    selection: {
      IS: 'Is',
      IS_NOT: 'Is not',
      IS_ONE_OF: 'Is one of',
      IS_NOT_SET: 'Is not set',
    },
  },
  DEFAULT_FILTERS: [
    { id: 'all_leads' || 0, name: 'All Leads' },
    { id: 'active_leads', name: 'Active Leads' },
    { id: 'my_leads', name: 'My Active Leads' },
  ],
};
