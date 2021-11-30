import React, { FC, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import * as m from 'moment';
import moment from 'moment-timezone/builds/moment-timezone-with-data';
import { DropdownToggle, DropdownWrapper, FilterDropdownItem, FilterDropdownMenu, Icon } from 'dwell/views/Reports/styles';
import CustomDateDialog from './_customDateDialog';

interface FilterDropdownProps extends RouteComponentProps {
  choices: { [key: string]: string },
  value: string,
  filterType: string,
  onClick: (value: string) => void,
  disableCompanyWideAverages?: boolean,
  disablePreviousPeriod?: boolean,
  icon: string,
  setCustomDateStart?: (date: m.Moment) => void,
  setCustomDateEnd?: (date: m.Moment) => void,
  customDateStart?: m.Moment,
  customDateEnd?: m.Moment,
  reloadReports?: () => void,
  disableThisWeek?: boolean,
  disablePerformance?: boolean,
}

const disablePeriod = period => moment(moment().tz('America/Phoenix').startOf(period)).isSame(moment().tz('America/Phoenix'), 'day');

const FilterDropdown: FC<FilterDropdownProps> = (props) => {
  const { location: { pathname }, choices, value, filterType, onClick,
    disableCompanyWideAverages = false, disablePreviousPeriod = false, icon,
    setCustomDateStart, setCustomDateEnd, customDateStart, customDateEnd, reloadReports,
    disableThisWeek = false, disablePerformance = false } = props;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCustomDateDialog, setShowCustomDateDialog] = useState(false);
  const level = pathname.includes('/advanced-reports') ? 'portfolio' : 'property';

  const handleCustomDateDialogClose = (isUpdated = false) => {
    if (isUpdated) {
      onClick('CUSTOM_RANGE');
      if (value === 'CUSTOM_RANGE') reloadReports();
    }
    setShowCustomDateDialog(false);
  };

  return (
    <React.Fragment>
      <CustomDateDialog
        show={showCustomDateDialog}
        handleClose={handleCustomDateDialogClose}
        setCustomDateStart={setCustomDateStart}
        setCustomDateEnd={setCustomDateEnd}
        customDateStart={customDateStart}
        customDateEnd={customDateEnd}
      />
      <DropdownWrapper isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
        <DropdownToggle>
          <Icon className={icon} />
          <span>{!value && filterType === 'compare' ? 'Compare to' : choices[value]}</span>
        </DropdownToggle>
        <FilterDropdownMenu>
          {value && filterType === 'compare' &&
          <FilterDropdownItem onClick={() => onClick('')}>Reset “Сompare to” filter</FilterDropdownItem>}
          {Object.keys(choices).map((key, i) =>
            (level === 'property' && key === 'LEADERBOARD_REPORTS' ? null : (
              <React.Fragment key={i}>
                <FilterDropdownItem
                  onClick={() => (key === 'CUSTOM_RANGE' ? setShowCustomDateDialog(true) : onClick(key))}
                  className={key === value ? 'selected' : ''}
                  disabled={(key === 'COMPANY_WIDE_AVERAGES' && disableCompanyWideAverages) || (key === 'PREVIOUS_PERIOD' && disablePreviousPeriod) || (key === 'THIS_WEEK' && disableThisWeek)
                 || (key === 'PERFORMANCE' && disablePerformance) || (key === 'THIS_MONTH' && disablePeriod('month')) || (key === 'THIS_YEAR' && disablePeriod('year'))
                 || (key === 'THIS_QUARTER' && disablePeriod('quarter')) || (key === value && key !== 'CUSTOM_RANGE')}
                >
                  {choices[key]}
                </FilterDropdownItem>
              </React.Fragment>)))}
        </FilterDropdownMenu>
      </DropdownWrapper>
    </React.Fragment>
  );
};

export default withRouter(FilterDropdown);
