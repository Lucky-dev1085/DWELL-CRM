import React, { useEffect, useState, FC } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import { SingleDatePicker } from 'react-dates';
import moment from 'moment';
import 'react-dates/initialize';
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import actions from 'dwell/actions';
import { LeadCreationDialog } from 'dwell/components';
import 'src/scss/pages/_lead_creation.scss';
import { isEmpty } from 'lodash';
import 'react-dates/lib/css/_datepicker.css';
import 'react-phone-input-2/lib/style.css';
import Select from 'react-select';
import { getPropertyId } from 'src/utils';
import { DetailResponse, OwnerProps } from 'src/interfaces';
import { StyledModal } from 'styles/common';

interface LeadProps {
  first_name: string | null,
  last_name: string | null,
  source: string | null,
  email: string | null,
  phone_number: string | null,
  allow_duplication: boolean,
  floor_plan: number[] | [],
  move_in_date: string | null,
  has_followup: boolean,
  owner?: number,
}

interface LeadCreationModalProps extends RouteComponentProps {
  sender: { firstName: string, lastName: string, email: string, source: string | null, allow_duplication: boolean },
  call: { source: string, prospect_phone_number: string, id: number, call_result: string },
  prospectSources: { id: number, name: string, source: string }[],
  floorPlans: { id: number, plan: string }[],
  messageId: number,
  show: boolean,
  createLead: (lead: LeadProps) => Promise<DetailResponse>,
  handleClose: (id?: number) => null,
  updateMessageById: (id: number, data: { lead: number }) => Promise<DetailResponse>,
  getLeadById: (id: number) => null,
  updateCallLead: (id: number, data: { lead: number }) => null,
  shouldNotRedirect: boolean,
  owners: { id: number, email: string }[],
  getCurrentAssignLeadOwner: () => Promise<DetailResponse>,
  currentAssignedOwner: OwnerProps,
  getLeadNames: () => void,
}

const defaultLeadValue = {
  first_name: '',
  last_name: '',
  source: null,
  email: '',
  phone_number: '',
  allow_duplication: false,
  floor_plan: [],
  move_in_date: null,
  owner: null,
};

const LeadCreationModal : FC<LeadCreationModalProps> = ({ sender, call = {}, prospectSources = [], createLead, handleClose, messageId, updateMessageById, getLeadById,
  updateCallLead, show, history: { push }, floorPlans, shouldNotRedirect = false, owners, getCurrentAssignLeadOwner, currentAssignedOwner, getLeadNames }) => {
  const [isDuplicated, setIsDuplicated] = useState(false);
  const [errorData, setErrorData] = useState({});
  const [fields, setFields] = useState(defaultLeadValue);
  const [focused, setFocused] = useState(false);
  const [errors, setErrors] = useState({ source: false, firstName: false });
  const [owner, setOwner] = useState({} as OwnerProps);

  let floorPlanChoices = [];
  let convertedSourceChoices = [];
  let ownersChoices = [];

  useEffect(() => {
    getCurrentAssignLeadOwner();
  }, []);

  useEffect(() => {
    if (isEmpty(currentAssignedOwner)) {
      setOwner({ id: null, email: 'Unassigned' });
    } else {
      setOwner(currentAssignedOwner);
    }
  }, [currentAssignedOwner]);

  useEffect(() => {
    if (!show) {
      setFields(defaultLeadValue);
    }
  }, [show]);

  useEffect(() => {
    if (show && !isEmpty(call)) {
      const source = prospectSources.find(s => s.name === call.source);
      setFields({ ...fields, phone_number: call.prospect_phone_number || '', source: !isEmpty(source) ? source.id : '' });
    }
  }, [call]);

  useEffect(() => {
    if (show && !isEmpty(sender)) {
      setFields({ ...fields, first_name: sender.firstName || '', last_name: sender.lastName || '', email: sender.email || '' });
    }
  }, [sender]);

  const hideModal = (shouldSave = false) => {
    setIsDuplicated(false);
    if (shouldSave) {
      setFields({ ...fields, allow_duplication: true });
    }
  };

  const handleSaveSuccess = (e) => {
    getLeadNames();
    handleClose(e.result.data.id);
    if (shouldNotRedirect) return;
    if (messageId) {
      updateMessageById(messageId, { lead: e.result.data.id })
        .then(() => {
          getLeadById(e.result.data.id);
        });
    } else if (!isEmpty(call)) {
      updateCallLead(call.id, e.result.data.id);
    } else {
      const siteId = getPropertyId();
      push(`/${siteId}/leads/${e.result.data.id}`);
    }
  };

  const handleSaveFailure = ({ response: { data } }) => {
    if (data.id) {
      setIsDuplicated(true);
      setErrorData(data);
    }
  };

  const validate = () => ({ source: !fields.source, firstName: !fields.first_name });

  const handleSave = () => {
    let hasFollowUp = true;
    if (call.id && call.call_result === 'no-answer') {
      hasFollowUp = false;
    }
    const newErrors = validate();
    setErrors(newErrors);
    if (!Object.values(newErrors).filter(i => i).length) {
      createLead({ ...fields, has_followup: hasFollowUp, first_name: fields.first_name || '-', last_name: fields.last_name || '-', owner: owner.id })
        .then(handleSaveSuccess)
        .catch(error => handleSaveFailure(error));
    }
  };

  useEffect(() => {
    if (fields.allow_duplication) {
      handleSave();
    }
  }, [fields.allow_duplication]);

  const handleOnChange = ({ target: { value, id } }) => {
    setFields({ ...fields, [id]: value });
  };

  const handleOwnerChange = ({ target: { value, id } }) => {
    handleOnChange({ target: { value, id } });
    setOwner(owners.find(o => o.id === value) || { id: null, email: 'Unassigned' });
  };

  useEffect(() => {
    if (Object.values(errors).filter(i => i).length) setErrors(validate());
  }, [fields.source, fields.first_name]);

  const closeBtn = <button className="close" onClick={() => handleClose()}><i className="ri-close-line" /></button>;

  if (!isEmpty(floorPlans)) {
    floorPlanChoices = floorPlans.map(floorPlan => ({ value: floorPlan.id, label: floorPlan.plan }));
  }

  if (!isEmpty(prospectSources)) {
    convertedSourceChoices = prospectSources.map(source => ({ value: source.id, label: source.name }));
  }

  if (!isEmpty(owners)) {
    ownersChoices = owners.map(o => ({ value: o.id, label: o.email }));
  }

  const formatOptionLabel = ({ label, value }) => (
    <div style={{ display: 'flex' }}>
      <div className="inputCheck">
        <input type="checkbox" defaultChecked={fields.floor_plan && fields.floor_plan.includes(value)} />
      </div>
      <div style={{ color: 'red !important' }}>{label}</div>
    </div>
  );

  return (
    <StyledModal
      isOpen={show}
      toggle={() => handleClose()}
      centered
      aria-labelledby="example-custom-modal-styling-title"
    >
      <ModalHeader close={closeBtn}>Add New Lead</ModalHeader>
      <ModalBody>
        {isDuplicated && <LeadCreationDialog
          handleClose={hideModal}
          show={isDuplicated}
          newLeadData={{ firstName: fields.first_name, lastName: fields.last_name, email: fields.email, moveInDate: fields.move_in_date }}
          errorData={errorData}
        />}
        <Row>
          <Col xs="12">
            <Form>
              <Row>
                <Col xs="6">
                  <FormGroup>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      type="text"
                      name="first_name"
                      id="first_name"
                      placeholder="Enter first name"
                      value={fields.first_name || ''}
                      onChange={handleOnChange}
                      invalid={errors.firstName}
                    />
                    <FormFeedback>First Name is required.</FormFeedback>
                  </FormGroup>
                </Col>
                <Col xs="6">
                  <FormGroup>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      type="text"
                      name="last_name"
                      id="last_name"
                      placeholder="Enter last name"
                      value={fields.last_name || ''}
                      onChange={handleOnChange}
                    />
                    <FormFeedback>Last Name is required.</FormFeedback>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col xs="12">
                  <FormGroup>
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      type="text"
                      name="email"
                      id="email"
                      placeholder="Enter email address"
                      value={fields.email || ''}
                      onChange={handleOnChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col xs="12">
                  <FormGroup>
                    <Label htmlFor="phone_number">Phone number</Label>
                    <PhoneInput
                      country="us"
                      onlyCountries={['us']}
                      id="phone_number"
                      placeholder="Enter phone number"
                      inputClass="phone-number-input"
                      value={fields.phone_number || ''}
                      onChange={phone => handleOnChange({ target: { id: 'phone_number', value: phone } })}
                      disableDropdown
                      disableCountryCode
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col xs="7">
                  <FormGroup>
                    <Label htmlFor="source">Source</Label>
                    <Select
                      defaultValue={convertedSourceChoices.find(i => i.value === fields.source)}
                      options={convertedSourceChoices}
                      classNamePrefix="select"
                      placeholder="Select source"
                      onChange={item => handleOnChange({ target: { id: 'source', value: item.value } })}
                    />
                    <Input invalid={errors.source} hidden />
                    <FormFeedback>Source is required.</FormFeedback>
                  </FormGroup>
                </Col>
                <Col xs="5">
                  <FormGroup>
                    <Label>Move-in-date</Label>
                    <SingleDatePicker
                      inputIconPosition="after"
                      small
                      block
                      numberOfMonths={1}
                      placeholder="Select date"
                      isOutsideRange={() => false}
                      date={fields.move_in_date ? moment(fields.move_in_date) : null}
                      onDateChange={date => handleOnChange({ target: { id: 'move_in_date', value: date && date.format('YYYY-MM-DD') } })}
                      focused={focused}
                      onFocusChange={e => setFocused(e.focused)}
                      openDirection="down"
                      hideKeyboardShortcutsPanel
                      isDayHighlighted={day => day.isSame(moment(), 'd')}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col xs="7">
                  <FormGroup>
                    <Label htmlFor="floorplan">Floorplan(s)</Label>
                    <Select
                      defaultValue={isEmpty(fields.floor_plan) ? null : floorPlanChoices.filter(option => fields.floor_plan.includes(option.value))}
                      isMulti
                      closeMenuOnSelect={false}
                      hideSelectedOptions={false}
                      formatOptionLabel={formatOptionLabel}
                      options={floorPlanChoices}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      placeholder="Select floor plan"
                      onChange={selectedItems => handleOnChange({ target: { id: 'floor_plan', value: selectedItems && selectedItems.length ? selectedItems.map(item => item.value) : [] } })}
                    />
                  </FormGroup>
                </Col>
                <Col xs="5">
                  <FormGroup>
                    <Label htmlFor="owner">Owner</Label>
                    <Select
                      options={[{ value: null, label: 'Unassigned' }].concat(ownersChoices)}
                      classNamePrefix="select"
                      placeholder="Select owner"
                      value={{ value: owner.id, label: owner.email }}
                      onChange={({ value }) => handleOwnerChange({ target: { value, id: 'owner' } })}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="white" onClick={() => handleClose()} >Cancel</Button>
        <Button color="primary" onClick={handleSave} disabled={Object.keys(errors).some(x => errors[x])}>Add Lead</Button>
      </ModalFooter>
    </StyledModal>
  );
};

const mapStateToProps = state => ({
  prospectSources: state.property.property.sources,
  floorPlans: state.property.property.floor_plans,
  owners: state.property.property.users,
  currentAssignedOwner: state.assignLeadOwners.currentAssignedOwner,
});

export default connect(
  mapStateToProps,
  {
    ...actions.lead,
    ...actions.emailMessage,
    ...actions.call,
    ...actions.assignLeadOwners,
  },
)(withRouter(LeadCreationModal));
