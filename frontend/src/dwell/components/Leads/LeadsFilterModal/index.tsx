import React, { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button, FormFeedback, FormGroup, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { cloneDeep, set } from 'lodash';
import moment from 'moment';
import actions from 'dwell/actions';
import 'src/scss/pages/_leads_filter.scss';
import { ConditionsRadio, ConditionsSelectGroup, FilterNameInput, InputLabel, ModalSubtitle } from 'dwell/components/Leads/LeadsFilterModal/styles';
import { DetailResponse, SuccessResponse } from 'src/interfaces';
import LeadsFilter from './_leadsFilter';

const defaultLeadsFilter = {
  name: '',
  filter_items: [{ compare_field: 'created', compare_operator: 'IS_ON', compare_value: [moment().format('YYYY-MM-DD')] }],
  filter_type: 'ALL',
  focused: false,
  id: 0,
};

interface Filter {
  name: string,
  filter_items: { compare_field: string, compare_operator: string, compare_value: string[] }[],
  filter_type: string,
  focused: boolean,
  id: number,
}

interface LeadsFilterModalProps {
  leadsFilter: Filter,
  show: boolean,
  createLeadsFilter: (data: Filter) => Promise<DetailResponse>,
  updateLeadsFilter: (id: number, leadsFilter: Filter) => Promise<DetailResponse>,
  deleteLeadsFilter: (id: number) => Promise<SuccessResponse>,
  onApply: (id: number) => void,
  onDelete: (id: number) => void,
  onCancel: () => void,
  isSubmitting: boolean
}

const LeadsFilterModal: FC<LeadsFilterModalProps> = ({ leadsFilter: filter, show, createLeadsFilter, updateLeadsFilter, deleteLeadsFilter, onApply, onDelete, onCancel, isSubmitting }) => {
  const [leadsFilter, setLeadsFilter] = useState(defaultLeadsFilter);
  const [isNameTouched, setIsNameTouched] = useState(false);

  useEffect(() => {
    setIsNameTouched(false);
    if (filter.id) {
      setLeadsFilter(filter);
    }
  }, [filter, show]);

  useEffect(() => {
    if (!show) {
      setLeadsFilter(defaultLeadsFilter);
      setIsNameTouched(false);
    }
  }, [show]);

  const handleAddCondition = () => {
    setLeadsFilter({ ...leadsFilter, filter_items: [...leadsFilter.filter_items, { compare_field: 'created', compare_operator: 'IS_ON', compare_value: [''] }] });
  };

  const handleDeleteCondition = (deleteIndex) => {
    setLeadsFilter({ ...leadsFilter, filter_items: leadsFilter.filter_items.filter((item, index) => index !== deleteIndex) });
  };

  const updateFilterType = (type) => {
    let newLeadsFilter = { ...cloneDeep(leadsFilter) };
    newLeadsFilter = set(newLeadsFilter, 'filter_type', type);
    setLeadsFilter(newLeadsFilter);
  };

  const handleInputChange = ({ target: { id, value } }, compareValueId = '', compareOperatorId = '') => {
    let newLeadsFilter = { ...cloneDeep(leadsFilter) };
    newLeadsFilter = set(newLeadsFilter, id, value);
    if (compareValueId) {
      newLeadsFilter = set(newLeadsFilter, compareValueId, '');
    }
    if (compareOperatorId) {
      newLeadsFilter = set(
        newLeadsFilter, compareOperatorId,
        ['created', 'updated', 'move_in_date', 'pms_sync_date', 'next_task_due_date', 'last_activity_date', 'last_followup_date'].includes(value) ? 'IS_ON' : 'IS',
      );
    }
    if (id === 'name') {
      setIsNameTouched(true);
    }
    setLeadsFilter(newLeadsFilter);
  };

  const handleMultiSelectChange = (selectedOptions, id) => {
    let newLeadsFilter = { ...cloneDeep(leadsFilter) };
    newLeadsFilter = set(newLeadsFilter, id, selectedOptions ? selectedOptions.map(option => option.value) : []);
    setLeadsFilter(newLeadsFilter);
  };

  const handleSaveSuccess = ({ result: { data: { id } } }) => {
    setTimeout(() => {
      onApply(id);
    }, 1000);
  };

  const handleDeleteSuccess = (id) => {
    setTimeout(() => {
      onDelete(id);
    }, 1000);
  };

  const handleSave = () => {
    if (leadsFilter.id) {
      updateLeadsFilter(leadsFilter.id, leadsFilter)
        .then(handleSaveSuccess);
    } else {
      createLeadsFilter(leadsFilter)
        .then(handleSaveSuccess);
    }
  };

  const handleDelete = () => {
    deleteLeadsFilter(leadsFilter.id)
      .then(() => handleDeleteSuccess(leadsFilter.id));
  };

  const { id, name, filter_items: filterItems, filter_type: filterType } = leadsFilter;
  const closeBtn = <button className="close" onClick={onCancel}><i className="ri-close-line" /></button>;
  const title = id ? 'Edit Filter' : 'Add New Filter';
  const emptyFilterItemsCount = filterItems.filter(item => item.compare_operator !== 'IS_NOT_SET' && item.compare_value[0] === '').length;
  return (
    <Modal
      isOpen={show}
      size="lg"
      toggle={onCancel}
      centered
      aria-labelledby="example-custom-modal-styling-title"
      className="leads-filter-modal"
    >
      <ModalHeader toggle={onCancel} close={closeBtn} tag="div" className="mb-4">
        {title}
        <ModalSubtitle>Fill in one or more conditions with the desired settings.</ModalSubtitle>
      </ModalHeader>
      <ModalBody>
        <FormGroup>
          <InputLabel>Filter Name</InputLabel>
          <FilterNameInput type="text" id="name" invalid={isNameTouched && !name} onChange={handleInputChange} value={name || ''} required placeholder="Enter name of filter" />
          <FormFeedback>Filter title is required.</FormFeedback>
        </FormGroup>
        <ConditionsSelectGroup>
          <span className="mr-3">Show leads that match the following conditions:</span>
          <ConditionsRadio type="radio" id="all" name="all" label="All" onClick={() => updateFilterType('ALL')} checked={filterType === 'ALL'} />
          <ConditionsRadio type="radio" id="any" name="any" label="Any" onClick={() => updateFilterType('ANY')} checked={filterType === 'ANY'} />
        </ConditionsSelectGroup>
        <LeadsFilter
          filterItems={filterItems}
          handleAddCondition={handleAddCondition}
          handleDeleteCondition={handleDeleteCondition}
          handleInputChange={handleInputChange}
          handleMultiSelectChange={handleMultiSelectChange}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          className="mr-1"
          color="primary"
          onClick={handleSave}
          disabled={isSubmitting || emptyFilterItemsCount > 0 || name.replace(/\s/g, '').length === 0}
        >
          {id ? 'Save changes' : 'Save & Apply'}
        </Button>{' '}
        {id ? (
          <Button className="mr-2 float-right" color="danger" onClick={handleDelete} disabled={isSubmitting}>Delete filter</Button>
        ) : (
          <Button className="mr-2 float-right" color="white" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

const mapStateToProps = state => ({
  isSubmitting: state.leadsFilter.isSubmitting,
});

export default connect(
  mapStateToProps,
  {
    ...actions.leadsFilter,
  },
)(LeadsFilterModal);
