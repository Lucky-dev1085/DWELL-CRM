import React, { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { SingleDatePicker } from 'react-dates';
import 'react-dates/initialize';
import moment from 'moment';
import { Button, ButtonDropdown, Col, CustomInput, DropdownItem, DropdownMenu, DropdownToggle, FormFeedback, FormGroup, Input, Label, Popover, PopoverBody, Row } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import Select from 'react-select';
import { isEmpty, pickBy, omit } from 'lodash';
import { fieldChoices } from 'dwell/constants';
import DatePicker from 'react-datepicker';
import momentLocalizer from 'react-widgets-moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import actions from 'dwell/actions';
import 'react-dates/lib/css/_datepicker.css';
import 'react-widgets/dist/css/react-widgets.css';
import 'src/scss/pages/_lead_creation.scss';
import { PropertyProps, FloorPlanProps, TaskProps, UserProps, ListResponse, AvailableTimesParams } from 'src/interfaces';
import { TOUR_TYPES } from 'dwell/constants/tour_types';
import { TaskModalBody, TaskModalFooter, TaskModalHeader, InlineRow, DueDateFeedback, TogglePlaceHolder } from 'dwell/components/Tasks/styles';
import { StyledModal } from 'styles/common';

moment.locale('en');
momentLocalizer();

interface ErrorsProps {
  id?: boolean,
  lead?: boolean,
  owner?: boolean,
  units?: boolean,
  tour_date?: boolean,
  due_date?: boolean,
  type?: boolean,
}

const defaultTask = {
  description: '',
  owner: undefined,
  lead: undefined,
  type: undefined,
  units: [],
  tour_confirmation_reminder_enabled: true,
};

interface CurrentLeadProps {
  id?: number,
  name: string,
}

interface TaskCreationModalProps extends RouteComponentProps {
  task: TaskProps,
  isTour: boolean,
  show: boolean,
  createTask: (currentTask: TaskProps, leadId?: number) => Promise<void>,
  updateTaskById: (id: number, currentTask: TaskProps, leadId?: number) => Promise<void>,
  currentLead: CurrentLeadProps,
  isLeadLevel: boolean,
  getLeadById: (id: number) => Promise<ListResponse>,
  handleClose: () => void,
  currentProperty: PropertyProps,
  floorPlanChoice: FloorPlanProps[],
  leadNames: {id: string}[],
  currentUser: UserProps,
  isTourTask?: boolean,
  getAvailableTourTime: (param?: AvailableTimesParams) => Promise<ListResponse>,
  availableDateTimes: any,
}

const TaskCreationModal: FC<TaskCreationModalProps> = ({ task, isTour, show, createTask, updateTaskById, currentLead, isLeadLevel, getLeadById,
  handleClose, currentProperty, floorPlanChoice, leadNames, currentUser, isTourTask, getAvailableTourTime, availableDateTimes }) => {
  const [errors, setErrors] = useState<ErrorsProps>({});
  const [planChoices, setPlanChoices] = useState(floorPlanChoice);
  const [currentTask, setCurrentTask] = useState<TaskProps | undefined>({ ...defaultTask, type: isTour ? 'TYPE_TOUR' : undefined });
  const [dueDateFocused, setDueDateFocused] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false);
  const [isShowingReminderInfo, setIsShowingReminderInfo] = useState(false);
  const [isSelfGuidedTourDisabled, setIsSelfGuidedTourDisabled] = useState(false);
  const [isSave, setIsSave] = useState(false);

  useEffect(() => {
    if (task.id) {
      setCurrentTask(task);
    }
  }, [task]);

  useEffect(() => {
    if (!currentTask.tour_date && availableDateTimes.length && currentTask.type === 'SELF_GUIDED_TOUR') {
      const times = [].concat(...availableDateTimes.map(item => item.times)).filter(time => time.available);
      if (times.length) {
        setCurrentTask({ ...currentTask, tour_date: times[0].date_time });
      }
    }
  }, [availableDateTimes]);

  useEffect(() => {
    if (!show) {
      const availableUsers = currentProperty.users || [];
      const user = availableUsers.find(u => u.id === currentUser.id);
      setCurrentTask({
        description: '',
        owner: user ? user.id : undefined,
        lead: undefined,
        type: isTour ? 'TYPE_TOUR' : undefined,
        units: [],
        tour_confirmation_reminder_enabled: true,
      });
      setErrors({});
    }
  }, [show]);

  const filterUnits = (isSelfGuided = false) => {
    const newTempArray = [];
    floorPlanChoice.forEach((data) => {
      const newTempOptions = [];
      data.units.forEach((inputData) => {
        if (isSelfGuided && (!inputData.smart_rent_unit_id || !inputData.can_be_toured)) {
          return;
        }
        newTempOptions.push({ value: inputData.unit, label: inputData.unit, id: inputData.id });
      });
      newTempArray.push({ options: newTempOptions, label: data.plan, id: data.id });
    });
    return newTempArray;
  };

  useEffect(() => {
    if (currentTask.type === 'SELF_GUIDED_TOUR' && !isEmpty(currentTask.units)) {
      getAvailableTourTime({ unit: currentTask.units.map(item => item) });
    }
  }, [currentTask.units, currentTask.type]);

  useEffect(() => {
    if (floorPlanChoice.length) {
      setPlanChoices(filterUnits(currentTask.type === 'SELF_GUIDED_TOUR'));
      setIsSelfGuidedTourDisabled(isEmpty([].concat([], ...filterUnits(true).map(item => item.options))));
    }
  }, [floorPlanChoice, currentTask.type]);

  const handleSave = () => {
    if (!Object.keys(errors).some(x => errors[x])) {
      const actionMethod = currentTask.id
        ? updateTaskById(currentTask.id, currentTask, isLeadLevel && currentLead.id)
        : createTask(currentTask, isLeadLevel && currentLead.id);
      actionMethod
        .then(() => {
          if (isLeadLevel) {
            getLeadById(currentLead.id);
          }
          setTimeout(() => {
            setIsSave(false);
            handleClose();
          }, 500);
        }).catch(() => setIsSave(false));
    } else {
      setIsSave(false);
    }
  };

  const handleOnChange = ({ target: { value, id } }) => {
    let tourDate = id === 'tour_date' ? value : currentTask.tour_date;
    if (id === 'tour_date' && currentTask.type !== 'SELF_GUIDED_TOUR') {
      let tourData = { date: moment(value).format('YYYY-MM-DD') } as AvailableTimesParams;
      if (currentTask.id) {
        tourData = { ...tourData, tour: currentTask.id };
      }
      getAvailableTourTime(tourData).then(({ result: { data } }) => {
        const date = data.times.find(time =>
          moment(time).utc().format('HH:mm') === moment(value).utc().format('HH:mm'));
        if (date) {
          tourDate = date;
        }
        setCurrentTask({ ...currentTask, tour_date: tourDate });
      });
    }
    if (id === 'units' && currentTask.type === 'SELF_GUIDED_TOUR') {
      tourDate = null;
    }
    setCurrentTask({ ...currentTask, [id]: value, tour_date: tourDate });
    setErrors({ ...errors, [id]: false });
  };

  const handleDropdownChange = (id, value) => {
    let data = { ...currentTask, [id]: value };
    if (id === 'type' && value === 'SELF_GUIDED_TOUR') {
      data = { ...data, showing_units: [], units: [], tour_date: null };
    }
    setCurrentTask(data);
    if (id === 'type') {
      if (Object.keys(TOUR_TYPES).includes(value) && !Object.keys(TOUR_TYPES).includes(currentTask.type)) {
        return setErrors({});
      } else if (!Object.keys(TOUR_TYPES).includes(value) && Object.keys(TOUR_TYPES).includes(currentTask.type)) {
        return setErrors({});
      }
    }
    return setErrors({ ...errors, [id]: false });
  };

  useEffect(() => {
    if (isSave) {
      handleSave();
    }
  }, [isSave]);

  const validateForm = () => {
    const { type, due_date: dueDate, tour_date: tourDate, owner, lead } = currentTask;
    const resultErrors = {
      type: !type,
      owner: !owner,
      due_date: !Object.keys(TOUR_TYPES).includes(type) ? !dueDate : false,
      tour_date: Object.keys(TOUR_TYPES).includes(type) ? !tourDate : false,
      units: false,
      lead: isLeadLevel ? false : !lead,
    };
    setErrors(resultErrors);
    setIsSave(true);
  };

  const formatOptionLabel = ({ label, id }) => (
    <div style={{ display: 'flex' }}>

      <div className="inputCheck">
        <input type="checkbox" checked={currentTask.units.filter(data => data === id).length > 0} />
      </div>
      <div style={{ color: 'red !important' }}>{label}</div>
    </div>
  );
  // method that allows searching with group labels
  const filterOption = ({ label, value }, string) => {
    // default search
    if (label.includes(string) || value.includes(string)) return true;
    // check if a group as the filter string as label
    const groupOptions = planChoices.filter(group =>
      group.label.toLocaleLowerCase().includes(string.toLocaleLowerCase()));

    if (groupOptions) {
      // eslint-disable-next-line no-restricted-syntax
      for (const groupOption of groupOptions) {
        // Check if current option is in group
        const option = groupOption.options.find(opt => opt.value === value);
        if (option) {
          return true;
        }
      }
    }
    return false;
  };

  const { type: typeChoices } = fieldChoices.TASK_FILED_CHOICES;
  const typeChoice = omit(typeChoices, ['TOUR', 'VIRTUAL_TOUR']);

  let filteredTypeChoices = isTourTask ? pickBy(typeChoice, value => value.includes('Tour')) : typeChoice;
  filteredTypeChoices = isTourTask === false ? pickBy(typeChoice, value => !value.includes('Tour')) : filteredTypeChoices;
  const closeBtn = <button className="close" onClick={() => handleClose()} />;
  const availableUsers = currentProperty.users || [];

  const {
    id,
    description,
    type,
    due_date: dueDate,
    owner,
    showing_units: unitFloor,
    lead: leadId,
    tour_confirmation_reminder_enabled: tourConfirmationEnabled,
  } = currentTask;
  useEffect(() => {
    if (unitFloor && unitFloor.length) {
      setCurrentTask({ ...currentTask, units: unitFloor.map(item => item.id) });
    }
  }, [unitFloor]);

  let ownerName = null;
  if (owner) {
    const ownerRecord = availableUsers.find(u => u.id === owner);
    ownerName = `${ownerRecord.first_name} ${ownerRecord.last_name}`;
  }

  const commonInputs = (
    <React.Fragment>
      <Col xs={12}>
        <InlineRow>
          <Col xs={6} className="mg-t-20">
            <FormGroup>
              <Label>Linked to:</Label>
              {isLeadLevel ? (
                <Input value={currentLead.name} disabled />
              ) : (
                <React.Fragment>
                  <Typeahead
                    id="lead"
                    labelKey="name"
                    options={leadNames}
                    selected={(leadNames || []).filter(item => item.id === leadId)}
                    onChange={e => handleOnChange({ target: { id: 'lead', value: e[0] ? e[0].id : null } })}
                    placeholder="Choose one"
                  />
                  <Input invalid={errors.lead} hidden />
                  <FormFeedback>Please choose a lead to be linked.</FormFeedback>
                </React.Fragment>
              )}
            </FormGroup>
          </Col>
          <Col xs={6} className="mg-t-20">
            <FormGroup>
              <Label>Assigned to:</Label>
              <ButtonDropdown className="owner-select" isOpen={isOwnerDropdownOpen} toggle={() => setIsOwnerDropdownOpen(!isOwnerDropdownOpen)}>
                <DropdownToggle caret className="bg-white">
                  {ownerName || 'Choose one'}
                </DropdownToggle>
                <DropdownMenu>
                  {availableUsers.map((user, index) => (
                    <React.Fragment key={index}>
                      <DropdownItem onClick={() => handleDropdownChange('owner', user.id)} className={owner === user.id ? 'selected' : ''}>
                        {`${user.first_name} ${user.last_name}`}
                      </DropdownItem>
                    </React.Fragment>
                  ))}
                </DropdownMenu>
              </ButtonDropdown>
              <Input invalid={errors.owner} hidden />
              <FormFeedback>Owner is required.</FormFeedback>
            </FormGroup>
          </Col>
        </InlineRow>
      </Col>
      <Col xs={12} className="mg-t-20">
        <FormGroup>
          <Label>Description:</Label>
          <Input
            type="textarea"
            name="description"
            rows="3"
            id="description"
            placeholder="Write some description"
            value={description}
            onChange={handleOnChange}
          />
        </FormGroup>
      </Col>
    </React.Fragment>
  );
  const tourInputs = (
    <React.Fragment>
      {commonInputs}
      <Col xs={12}>
        <InlineRow>
          <Col xs={6} className="mg-t-20">
            <FormGroup>
              <Label>Showing units:</Label>
              <Select
                defaultValue={unitFloor && unitFloor.length ? unitFloor.map(unit => ({ id: unit.id, value: unit.unit, label: unit.unit })) : []}
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                filterOption={filterOption}
                formatOptionLabel={formatOptionLabel}
                options={planChoices}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={selectedItems => handleOnChange({ target: { id: 'units', value: selectedItems && selectedItems.length ? selectedItems.map(item => item.id) : [] } })}
              />
              <Input invalid={errors.units} hidden />
              <FormFeedback>Please select at least one unit.</FormFeedback>
            </FormGroup>
          </Col>
          <Col xs={6} className="mg-t-20">
            <FormGroup>
              <Label>Tour date:</Label>
              {currentTask.type === 'SELF_GUIDED_TOUR' ?
                <DatePicker
                  showTimeSelect
                  selected={currentTask.tour_date ? new Date(currentTask.tour_date) : null}
                  onChange={date => handleOnChange({ target: { id: 'tour_date', value: date } })}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  placeholderText="Select date"
                  includeDates={availableDateTimes.map(item => item.times).reduce((a, b) => a.concat(b), [])
                    .filter(item => item.available)
                    .map(item => moment(item.date_time).toDate())
                  }
                  includeTimes={availableDateTimes.map(item => item.times).reduce((a, b) => a.concat(b), [])
                    .filter(item => item.available)
                    .map(item => moment(item.date_time).toDate())
                    .filter(item => moment(item).date() === moment(currentTask.tour_date).date())
                  }
                /> :
                <DatePicker
                  showTimeSelect
                  selected={currentTask.tour_date ? new Date(currentTask.tour_date) : null}
                  onChange={date => handleOnChange({ target: { id: 'tour_date', value: date } })}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  placeholderText="Select date"
                  minDate={new Date()}
                  includeTimes={availableDateTimes.map(time => moment(time).toDate())}
                />}
              <Input invalid={errors.tour_date} hidden />
              <FormFeedback>Please choose tour date.</FormFeedback>
            </FormGroup>
          </Col>
        </InlineRow>
      </Col>
      <Col xs={12} className="mg-t-20">
        <FormGroup>
          <div className="reminder-checkbox">
            <CustomInput
              type="checkbox"
              id="tour-confirmation-followup"
              label="Send tour confirmation followup"
              onChange={({ target: { checked } }) => handleOnChange({ target: { id: 'tour_confirmation_reminder_enabled', value: checked } })}
              checked={tourConfirmationEnabled}
            />
            <div className="ml-2 reminder-checkbox-popover" id="tour-popover" onMouseEnter={() => setIsShowingReminderInfo(true)} onMouseLeave={() => setIsShowingReminderInfo(false)} >
              <FontAwesomeIcon className="mr-1" icon={faInfoCircle} />
            </div>
            <Popover className="reminder-checkbox-popover-info" placement="right" isOpen={isShowingReminderInfo} target="tour-popover" toggle={() => setIsShowingReminderInfo(!isShowingReminderInfo)}>
              <PopoverBody>
                 Dwell automatically sends a followup email to confirm tour 24 hours prior to scheduled tour time.
              </PopoverBody>
            </Popover>
          </div>
        </FormGroup>
      </Col>
    </React.Fragment>
  );
  const taskInputs = (
    <React.Fragment>
      {commonInputs}
      <Col xs={5} className="mg-t-20">
        <FormGroup>
          <Label>Due date:</Label>
          <Input invalid={errors.due_date} hidden />
          <SingleDatePicker
            inputIconPosition="after"
            small
            block
            numberOfMonths={1}
            placeholder="Select date"
            isOutsideRange={() => false}
            date={dueDate ? moment(dueDate) : null}
            onDateChange={date => handleOnChange({ target: { id: 'due_date', value: date && date.format('YYYY-MM-DD') } })}
            focused={dueDateFocused}
            onFocusChange={({ focused }) => setDueDateFocused(focused)}
            openDirection="down"
            hideKeyboardShortcutsPanel
            isDayHighlighted={day => day.isSame(moment(), 'd')}
          />
          <DueDateFeedback>Please choose due date.</DueDateFeedback>
        </FormGroup>
      </Col>
    </React.Fragment>
  );
  return (
    <StyledModal
      isOpen={show}
      toggle={() => handleClose()}
      centered
      aria-labelledby="example-custom-modal-styling-title"
      className="task-creation-modal"
    >
      <TaskModalHeader close={closeBtn}>{id ? 'Edit Task' : `Add New ${isTourTask ? 'Tour' : 'Task'}`}</TaskModalHeader>
      <TaskModalBody>
        <Row>
          <Col xs="12" className="mg-t-20">
            <FormGroup>
              <Label>{isTourTask ? 'Tour' : 'Task'} type:</Label>
              <ButtonDropdown className="mr-1 type-select" isOpen={isTypeDropdownOpen} toggle={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}>
                <DropdownToggle caret className="bg-white">
                  {type ? typeChoices[type] : <TogglePlaceHolder>Choose one</TogglePlaceHolder>}
                </DropdownToggle>
                <DropdownMenu>
                  {Object.keys(filteredTypeChoices).map((key, index) => (
                    <React.Fragment key={index}>
                      <DropdownItem
                        onClick={() => handleDropdownChange('type', key)}
                        className={key === type ? 'selected' : ''}
                        disabled={isSelfGuidedTourDisabled && key === 'SELF_GUIDED_TOUR'}
                      >
                        {filteredTypeChoices[key]}
                      </DropdownItem>
                    </React.Fragment>
                  ))}
                </DropdownMenu>
              </ButtonDropdown>
              <Input invalid={errors.type} hidden />
              <FormFeedback>Please choose a {isTourTask ? 'tour' : 'task'} type.</FormFeedback>
            </FormGroup>
          </Col>
          {type && (Object.keys(TOUR_TYPES).includes(type) ? tourInputs : taskInputs)}
        </Row>
      </TaskModalBody>
      <TaskModalFooter>
        <Button color="secondary" onClick={() => handleClose()}>Cancel</Button>
        <Button color="primary" onClick={() => validateForm()} disabled={Object.keys(errors).some(x => errors[x])}>{id ? 'Save changes' : `Add ${isTourTask ? 'Tour' : 'Task'}`}</Button>
      </TaskModalFooter>
    </StyledModal>
  );
};

const mapStateToProps = state => ({
  floorPlanChoice: state.property.property.floor_plans,
  currentProperty: state.property.property,
  currentUser: state.user.currentUser,
  availableDateTimes: state.task.availableDateTimes,
});

export default connect(
  mapStateToProps,
  {
    ...actions.task,
    ...actions.property,
    ...actions.lead,
  },
)(withRouter(TaskCreationModal));
