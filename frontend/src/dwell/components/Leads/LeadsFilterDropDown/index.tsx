import React, { FC, useState } from 'react';
import { Dropdown } from 'reactstrap';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { leadsFilterChoices } from 'dwell/constants';
import {
  CollapseIcon,
  FiltersDropdownButton,
  FiltersDropdownItem,
  FiltersDropdownItemIcon,
  FiltersDropdownLabel,
  FiltersDropdownMenu,
  FiltersNavLink,
  NavFiltersGroup,
  NewFilterButton,
  NewFilterIcon,
} from 'dwell/components/Leads/LeadsFilterDropDown/styles';

interface LeadsFilterDropDownProps {
  leadsFilters: { id: number | string, name: string }[],
  onClickFilter: (id: string | number) => void,
  onNewFilter: () => void,
  onEditFilter: (id: string | number) => void,
  filterId: string | number,
  activeLeadsCount: number,
  totalLeadsCount: number,
  myLeadsCount: number,
  filteredLeadsCount: number,
}

const LeadsFilterDropDown: FC<LeadsFilterDropDownProps> = ({ leadsFilters, filterId, onClickFilter, onNewFilter,
  onEditFilter, activeLeadsCount, totalLeadsCount, myLeadsCount, filteredLeadsCount }) => {
  const [dropdownOpen, setDropdownState] = useState(false);

  const onClickItem = (id) => {
    onClickFilter(id);
    setDropdownState(!dropdownOpen);
  };

  const onAddNewFilter = () => {
    onNewFilter();
    setDropdownState(!dropdownOpen);
  };

  const onFilterEdit = (event, id) => {
    onEditFilter(id);
    event.stopPropagation();
    setDropdownState(!dropdownOpen);
  };

  const allLeadsFilters = leadsFilters;
  const currentFilter = leadsFilterChoices.DEFAULT_FILTERS.concat(allLeadsFilters).find(filter => filter.id === filterId);
  const defaultKeys = leadsFilterChoices.DEFAULT_FILTERS.map(item => item.id);
  const leadsCount = { 'All Leads': totalLeadsCount, 'Active Leads': activeLeadsCount, 'My Active Leads': myLeadsCount };

  return (
    <React.Fragment>
      <NavFiltersGroup>
        {leadsFilterChoices.DEFAULT_FILTERS.map(filter => (
          <FiltersNavLink key={filter.id} onClick={() => onClickFilter(filter.id)} active={filterId === filter.id}>
            <span>
              {filter.name}
              <small>{leadsCount[filter.name]}</small>
            </span>
          </FiltersNavLink>
        ))}
        <Dropdown isOpen={dropdownOpen} toggle={() => setDropdownState(!dropdownOpen)}>
          <FiltersDropdownButton active={currentFilter && !defaultKeys.includes(filterId as string)}>
            {currentFilter && !defaultKeys.includes(filterId as string) ? (
              <span>{currentFilter.name} <small>{filteredLeadsCount}</small></span>
            ) : (
              <span>More Filters</span>
            )}
            <CollapseIcon className="ri-code-line" />
          </FiltersDropdownButton>
          <FiltersDropdownMenu>
            <FiltersDropdownLabel>Saved Filters</FiltersDropdownLabel>
            {allLeadsFilters.map(filter => (
              <React.Fragment key={filter.id}>
                <FiltersDropdownItem onClick={() => onClickItem(filter.id)}>
                  <span>{filter.name}</span>
                  <FiltersDropdownItemIcon className="ri-pencil-fill" onClick={e => onFilterEdit(e, filter.id)} />
                </FiltersDropdownItem>
              </React.Fragment>))}
            <NewFilterButton onClick={onAddNewFilter} ><NewFilterIcon className="ri-add-circle-line" />Add New Filter</NewFilterButton>
          </FiltersDropdownMenu>
        </Dropdown>
      </NavFiltersGroup>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  filteredLeadsCount: state.lead.count,
  totalLeadsCount: state.lead.totalLeadsCount,
  activeLeadsCount: state.lead.activeLeadsCount,
  myLeadsCount: state.lead.myLeadsCount,
});

export default withRouter(connect(
  mapStateToProps,
  {},
)(LeadsFilterDropDown));
