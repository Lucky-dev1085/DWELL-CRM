import React, { FC, useState } from 'react';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { SelectButton, SelectToggle, SelectMenu, SelectItem } from 'styles/common';
import { PropertyProps } from 'src/interfaces';

interface UsersDropdownProps {
  currentProperty: PropertyProps,
  dayName: string,
  onClick: (id: string, value: number) => void,
  weekdays: {
    Monday: { user: number },
    Tuesday: { user: number },
    Wednesday: { user: number },
    Thursday: { user: number },
    Friday: { user: number },
    Saturday: { user: number },
    Sunday: { user: number },
  }
}

const UsersDropdown: FC<UsersDropdownProps> = ({ currentProperty, weekdays, dayName, onClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const currentUser = !isEmpty(currentProperty) ? currentProperty.users.find(u => u.id === weekdays[dayName].user) : {};

  return (
    <SelectButton isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)} isEmpty={isEmpty(currentUser)}>
      <SelectToggle caret isEmpty={isEmpty(currentUser)}>
        {!isEmpty(currentUser) ? currentUser.email : 'Unassigned'}
      </SelectToggle>
      <SelectMenu>
        <SelectItem onClick={() => onClick(dayName, null)}>
          Unassigned
        </SelectItem>
        {!isEmpty(currentProperty) && currentProperty.users.map((user, i) => (
          <React.Fragment key={i}>
            <SelectItem onClick={() => onClick(dayName, user.id)}>
              {user.email}
            </SelectItem>
          </React.Fragment>
        ))}
      </SelectMenu>
    </SelectButton>
  );
};

const mapStateToProps = state => ({
  currentProperty: state.property.property,
});

export default connect(mapStateToProps)(UsersDropdown);
