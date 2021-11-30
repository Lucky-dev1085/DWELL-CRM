import React, { FC, useState } from 'react';
import { SelectItem } from 'styles/common';
import { DetailDropdownToggle, OverviewDropdown, OverviewDropdownMenu } from 'dwell/views/lead/layout/key_info/style';

interface DetailDropdownProps {
  choices: {
    [key: string]: string,
  },
  onClick: (id: number, value?: string) => void,
  value: string | number,
  id: number,
  className: string,
  disabled: boolean,
}

const DetailDropdown: FC<DetailDropdownProps> = ({ choices, onClick, value, id, className, disabled }) => {
  const [dropdownOpen, setDropdownState] = useState(false);

  const defaultValue = disabled ? ' ' : 'Select an option';
  return (
    <OverviewDropdown className={className} isOpen={dropdownOpen} toggle={() => setDropdownState(!dropdownOpen)}>
      <DetailDropdownToggle caret={!disabled} disabled={disabled}>
        {value ? choices[value] : defaultValue}
      </DetailDropdownToggle>
      <OverviewDropdownMenu>
        <SelectItem onClick={() => onClick(id, null)}>
            Select an option
        </SelectItem>
        {Object.keys(choices).map((key, index) => (
          <React.Fragment key={index}>
            <SelectItem onClick={() => onClick(id, key)} selected={key === value}>
              {choices[key]}
            </SelectItem>
          </React.Fragment>
        ))}
      </OverviewDropdownMenu>
    </OverviewDropdown>
  );
};

export default DetailDropdown;
