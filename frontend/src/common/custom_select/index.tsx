import { DropdownToggle, DropdownMenu, DropdownItem, ButtonDropdown } from 'reactstrap';
import React, { useState, FC } from 'react';
import { DropdownWrapper, Divider } from './styles';

interface CustomSelectProps {
  selected?: string | { name?: string, label?: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  optionList: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (selected: any) => void,
  fieldName?: string,
  className?: string,
  isSelectSearch?: boolean,
  disabled?: boolean,
  noScroll?: boolean,
}

const CustomSelect: FC<CustomSelectProps> = ({ selected, optionList, onChange, fieldName, className = '', isSelectSearch, disabled, noScroll }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <DropdownWrapper isOpen={isDropdownOpen} isSearch={isSelectSearch} className={className} disabled={disabled} $noScroll={noScroll}>
      <ButtonDropdown className="mr-1 select-input" isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(!isDropdownOpen)}>
        <DropdownToggle caret className="bg-white">
          {fieldName ? selected[fieldName] : selected || 'Select item'}
        </DropdownToggle>
        <DropdownMenu>
          {optionList.map((option, index) => (
            <React.Fragment>
              {(fieldName ? option[fieldName] : option) === 'divider' ?
                <Divider key={index} /> :
                <DropdownItem onClick={() => onChange(option)} key={index}>
                  {fieldName ? option[fieldName] : option}
                </DropdownItem>}
            </React.Fragment>
          ))}
        </DropdownMenu>
      </ButtonDropdown>
    </DropdownWrapper>
  );
};

export default CustomSelect;
