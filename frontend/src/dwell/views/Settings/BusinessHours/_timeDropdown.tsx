import React, { FC, useState } from 'react';
import moment from 'moment';
import { SelectButton, SelectToggle, SelectMenu, SelectItem } from 'styles/common';
import styled from 'styled-components';

const TimeSelectButton = styled(SelectButton)`
      width: 100%;
      padding-left: 20px;
      .dropdown-toggle {
        height: 36px;
        padding: 8px 16px;
        background: #fff url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5' viewBox='0 0 4 5'%3e%3cpath fill='%2315274d' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e") no-repeat right 15px center/8px 10px;
        :after {
          border: none;
        }
      }
`;

const TimeSelectMenu = styled(SelectMenu)`
      width: 93%;
`;

const CloseOfficeMessage = styled.div`
    padding-top: 7.5px;
    padding-bottom: 7.5px;
    padding-left: 20px;
`;

interface TimeDropdown {
  weekday: { weekday: number, start_time: string, end_time: string, is_workday: boolean },
  onClick: (dayName: number, time: string, field: string) => void,
  field: string,
  checked: boolean,
}

const TimeDropdown: FC<TimeDropdown> = ({ weekday, onClick, field, checked }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const time = field === 'start_time' ? weekday.start_time : weekday.end_time;

  const generateArrayOfTimes = (step) => {
    const dt = new Date(1970, 0, 1);
    const times = [];
    while (dt.getDate() === 1) {
      times.push(dt.toLocaleTimeString('it-IT'));
      dt.setMinutes(dt.getMinutes() + step);
    }
    return times;
  };

  const content = (
    <React.Fragment>
      <TimeSelectButton isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)} isEmpty={!time}>
        <SelectToggle caret isEmpty={!time}>
          {time ? moment(time, 'h:mm A').format('h:mm A') : 'Select time'}
        </SelectToggle>
        <TimeSelectMenu>
          {generateArrayOfTimes(30).map((t, i) => (
            <React.Fragment key={i}>
              <SelectItem onClick={() => onClick(weekday.weekday, t, field)}>
                {moment(t, 'h:mm A').format('h:mm A')}
              </SelectItem>
            </React.Fragment>
          ))}
        </TimeSelectMenu>
      </TimeSelectButton>
    </React.Fragment>
  );

  const getContent = () => {
    if (checked) {
      return content;
    } else if (field === 'start_time') {
      return (<React.Fragment><CloseOfficeMessage>Office is closed</CloseOfficeMessage></React.Fragment>);
    }
    return '';
  };

  return (
    <React.Fragment >
      { getContent() }
    </React.Fragment>
  );
};

export default TimeDropdown;
