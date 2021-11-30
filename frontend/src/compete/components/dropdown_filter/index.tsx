import { DropdownToggle, DropdownMenu, DropdownItem, Dropdown } from 'reactstrap';
import React, { useState, FC } from 'react';
import { DropdownWrapper } from './styles';

interface DropdownFilterProps {
  selected?: string,
  optionList: string[],
  onChange?: (selected: string) => void,
  isComparisonMenu?: boolean,
}

const DropdownFilter: FC<DropdownFilterProps> = ({ selected, optionList, onChange, isComparisonMenu }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <DropdownWrapper isMenu={isComparisonMenu}>
      <Dropdown isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(!isDropdownOpen)}>
        <DropdownToggle tag="span">
          {isComparisonMenu ? <i className="ri-more-2-fill" /> :
            <React.Fragment>
              {selected || 'Select item'}<i className="ri-arrow-down-s-line" />
            </React.Fragment>
          }
        </DropdownToggle>
        <DropdownMenu right>
          {optionList.map((option, index) => (
            <React.Fragment key={index}>
              <DropdownItem className={option === selected ? 'active' : ''} onClick={() => onChange(option)}>
                {option}
              </DropdownItem>
            </React.Fragment>
          ))}
        </DropdownMenu>
      </Dropdown>
    </DropdownWrapper>
  );
};

export default DropdownFilter;
