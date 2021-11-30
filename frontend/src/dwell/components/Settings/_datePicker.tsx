import React, { FC } from 'react';
import 'react-dates/initialize';
import 'src/scss/pages/_email_template.scss';
import { getUTCDate } from 'dwell/views/Settings/utils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface CustomDatePickerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleAMonthChange?: (date: any) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  curDate?: any,
  disabledDates?: string[],
  isNew?: boolean,
}

const CustomDatePicker: FC<CustomDatePickerProps> = ({
  handleAMonthChange,
  curDate,
  disabledDates,
  isNew,
}) => (
  <React.Fragment>
    <DatePicker
      selected={getUTCDate(curDate)}
      onChange={date => handleAMonthChange(date)}
      dateFormat="MMMM yyyy"
      minDate={getUTCDate('2019-01-01')}
      excludeDates={disabledDates.map(date => getUTCDate(date))}
      showMonthYearPicker
      disabled={!isNew}
    />
  </React.Fragment>
);

export default CustomDatePicker;
