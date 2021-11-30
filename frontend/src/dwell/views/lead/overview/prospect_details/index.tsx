import React, { FC, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import callAction from 'dwell/actions/call';
import { FormFeedback, Input } from 'reactstrap';
import { clone, set, isEmpty } from 'lodash';
import moment from 'moment';
import PhoneInput from 'react-phone-input-2';
import Select from 'react-select';
import { SingleDatePicker } from 'react-dates';
import { fieldChoices } from 'dwell/constants';
import { getLeadId } from 'dwell/views/lead/layout/utils';
import 'react-phone-input-2/lib/style.css';
import DetailDropdown from 'dwell/views/lead/layout/key_info/_detail_dropdown';
import { CardWidget, CardWidgetBody, CardWidgetHeader, CardWidgetTitle, FormCol, FormDataWrapper, FormGroup, FormIcon, FormInput, FormLabel, LeadDetailGroup,
  LeadEdit, Divider, PropertyItemsList, DatePickerWrapper } from 'dwell/views/lead/overview/styles';
import { DetailResponse, Lead } from 'src/interfaces';
import { LineSkeleton } from 'src/utils';
import LeadRoommates from './roommates';

interface ProspectDetailsProps extends RouteComponentProps {
  isShared: boolean,
  onSave: (params: {
    [key: string]: number | string,
  }) => Promise<DetailResponse>,
}

const ProspectDetails: FC<ProspectDetailsProps> = ({ onSave, location: { pathname }, isShared }) => {
  const dispatch = useDispatch();
  const sourceChoices = useSelector(state => state.property.property.sources);
  const movingReasonsChoices = useSelector(state => state.property.property.reason_for_moving);
  const realPagePmcId = useSelector(state => state.property.property.real_page_pmc_id);
  const petWeightChoices = useSelector(state => state.property.property.pet_weights);
  const priceRangeChoices = useSelector(state => state.property.property.price_ranges);
  const petTypeChoices = useSelector(state => state.property.property.pet_types);
  const floorPlansChoices = useSelector(state => state.property.property.floor_plans);
  const unitsChoices = useSelector(state => state.property.property.units);
  const oldLead = useSelector(state => state.lead.lead);
  const { getCalls } = callAction;

  const [lead, setLead] = useState<Lead>(clone(oldLead) || {} as Lead);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [dateFocused, setDateFocused] = useState(false);

  const moveDate = useRef(null);

  useEffect(() => {
    setLead(clone(oldLead));
  }, [oldLead]);

  const handleScroll = () => {
    const datepicker = document.getElementById('date-picker-move');
    if (datepicker) {
      datepicker.blur();
      setDateFocused(false);
    }
  };

  useEffect(() => {
    document.getElementById('lead-sidebar').addEventListener('scroll', handleScroll);
    return () => {
      document.getElementById('lead-sidebar').removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSave = () => {
    const params = {};
    Object.keys(oldLead).forEach((key) => {
      if (lead[key] !== oldLead[key]) params[key] = lead[key];
    });
    if (Object.keys(params).length) {
      onSave(params)
        .then(() => {
          if (Object.keys(params).includes('phone_number')) {
            dispatch(getCalls({ lead_id: getLeadId(pathname) }));
          }
          setIsEditing(false);
        })
        .catch(({ response: { data } }) => {
          setErrors(data);
        });
    } else {
      setIsEditing(false);
    }
  };

  const handleInputChange = ({ target: { id, value } }) => {
    let resultLead = set(lead, id, value || null);
    if (id === 'floor_plan') {
      resultLead = set(lead, 'units', unitsChoices.filter(choice => lead.units.includes(choice.id) && value.includes(choice.floor_plan)).map(item => item.id));
    }
    setLead(resultLead);
    setErrors({});
  };

  const handleDropdownChange = (id, value) => {
    const resultLead = set(lead, id, value);
    setLead(resultLead);
    setErrors({});
  };

  const { email, secondary_email: secondaryEmail, phone_number: phoneNumber, secondary_phone_number: secondaryPhoneNumber, best_contact_method: bestContactMethod,
    best_contact_time: bestContactTime, occupants, move_in_date: moveInDate, days_to_move_in: daysToMoveIn, desired_rent: desiredRent, origin, source, moving_reason: movingReason,
    real_page_pet_weight: realPagePetWeight, price_range: priceRange, lease_term: leaseTerm, vehicles, beds, baths, pets, pet_type: petType, res_man_pet_weight: resManPetWeight,
    washer_dryer_method: washerDryerMethod, units, floor_plan: floorPlan, created: createdDate } = lead;
  const { contactMethod: contactMethodChoices, contactTime: contactTimeChoices, origin: originChoices, washerDryerMethod: washerDryerMethodChoices } = fieldChoices.LEAD_FILED_CHOICES;
  const convertedSourceChoices = {};
  sourceChoices.forEach(choice => (convertedSourceChoices[choice.id] = choice.name));
  const convertedMovingReasonChoices = {};
  movingReasonsChoices.forEach(choice => (convertedMovingReasonChoices[choice.id] = choice.reason));
  const convertedWeightChoices = {};
  petWeightChoices.forEach(choice => (convertedWeightChoices[choice.id] = choice.name));
  const convertedPriceRangeChoices = {};
  priceRangeChoices.forEach(choice => (convertedPriceRangeChoices[choice.id] = choice.name));
  const convertedPetTypesChoices = {};
  petTypeChoices.forEach(choice => (convertedPetTypesChoices[choice.id] = choice.name));

  let floorPlanChoices = [];
  if (!isEmpty(floorPlansChoices)) {
    floorPlanChoices = floorPlansChoices.map(plan => ({ value: plan.id, label: plan.plan }));
  }

  let unitChoices = [];
  if (!isEmpty(unitsChoices)) {
    unitChoices = unitsChoices.map(unit => ({ value: unit.id, label: unit.unit }));
  }
  const selectableUnits = floorPlan ? unitsChoices.filter(unit => floorPlan.includes(unit.floor_plan)).map(item => item.id) : [];
  const floorPlansValues = floorPlansChoices.filter(choice => (floorPlan || []).includes(choice.id)).map(item => item.plan).join(', ');
  const unitTypeValues = unitsChoices.filter(choice => (units || []).includes(choice.id)).map(item => item.unit).join(', ');

  const formatOptionLabel = ({ value, label }, isUnit = true) => (
    <div style={{ display: 'flex' }}>
      <div className="inputCheck">
        <input
          type="checkbox"
          defaultChecked={!isUnit ? floorPlan && floorPlan.includes(value) : units && units.includes(value)}
          checked={!isUnit ? floorPlan && floorPlan.includes(value) : units && units.includes(value)}
        />
      </div>
      <div style={{ color: 'red !important' }}>{label}</div>
    </div>
  );

  const inputElement = (value, id, fieldName, icon, choices = {}, isReadOnly = false) => {
    if (!value && isReadOnly && !isEmpty(oldLead)) return null;
    let element;
    if (id === 'phone_number') {
      element = (
        <PhoneInput
          country="us"
          onlyCountries={['us']}
          value={phoneNumber || ''}
          placeholder="(702) 123-4567"
          onChange={phone => handleInputChange({ target: { id: 'phone_number', value: phone } })}
          disableDropdown
          disableCountryCode
          disabled={isReadOnly}
        />
      );
    } else if (id === 'move_in_date') {
      const positionTop = moveDate.current && moveDate.current.getBoundingClientRect().top;
      const isTop = positionTop && positionTop <= 700;
      element = (
        <React.Fragment>
          <div className="move-in-date" ref={moveDate}>
            <Input invalid={errors[id]} hidden />
            {isReadOnly ?
              <FormInput id={id} value={value || ''} invalid={errors[id]} onChange={handleInputChange} readOnly /> :
              <DatePickerWrapper top={positionTop && (isTop ? positionTop : positionTop - 350)}>
                <SingleDatePicker
                  inputIconPosition="after"
                  small
                  block
                  numberOfMonths={1}
                  date={value ? moment(value) : null}
                  isOutsideRange={() => false}
                  onDateChange={date => handleInputChange({ target: { id, value: date && date.format('YYYY-MM-DD') } })}
                  focused={dateFocused}
                  onFocusChange={({ focused }) => setDateFocused(focused)}
                  openDirection="up"
                  hideKeyboardShortcutsPanel
                  isDayHighlighted={day => day.isSame(moment(), 'd')}
                  disabled={isReadOnly}
                  id="date-picker-move"
                />
              </DatePickerWrapper>}
          </div>
          <FormFeedback>{errors[id] ? errors[id][0] : 'This field is invalid'}</FormFeedback>
        </React.Fragment>
      );
    } else if (['floor_plan', 'units'].includes(id)) {
      const isUnits = id === 'units';
      element = !isReadOnly ? (
        <Select
          menuPlacement="auto"
          defaultValue={value}
          isMulti
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          formatOptionLabel={({ value: val, label }) => formatOptionLabel({ value: val, label }, isUnits)}
          options={choices}
          className="basic-multi-select"
          classNamePrefix="select"
          placeholder={`Select ${id.replace('_', ' ')}`}
          onChange={selectedItems => handleInputChange({ target: { id, value: selectedItems && selectedItems.length ? selectedItems.map(item => item.value) : [] } })}
          isOptionDisabled={isUnits ? item => !selectableUnits.includes(item.value) : null}
        />
      ) : (
        <PropertyItemsList>{value}</PropertyItemsList>
      );
    } else {
      element = (
        <React.Fragment>
          {!isEmpty(choices) ?
            <DetailDropdown id={id} value={value} onClick={handleDropdownChange} choices={choices} disabled={isReadOnly} className="" /> :
            <FormInput id={id} value={value || ''} invalid={errors[id]} onChange={handleInputChange} readOnly={isReadOnly} />
          }
          <FormFeedback>{errors[id] ? errors[id][0] : 'This field is invalid'}</FormFeedback>
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <FormCol xs={12}>
          <FormGroup>
            <FormIcon>
              <i className={icon} />
            </FormIcon>
            <FormDataWrapper isEditing={!isReadOnly}>
              <FormLabel>{fieldName}</FormLabel>
              {!isEmpty(oldLead) ? element : <div><LineSkeleton width={120} height={12} /></div>}
            </FormDataWrapper>
          </FormGroup>
        </FormCol>
      </React.Fragment>
    );
  };

  return (
    <CardWidget className="mb-0">
      <CardWidgetHeader className="d-flex align-items-center justify-content-between">
        <CardWidgetTitle $small>Prospect Details</CardWidgetTitle>
        {!isShared && !isEmpty(oldLead) &&
        <LeadEdit>
          {isEditing ?
            <span onClick={handleSave} ><i className="ri-save-line" /> Save changes</span> :
            <span onClick={() => setIsEditing(true)}><i className="ri-edit-2-line" /> Edit</span>
          }
        </LeadEdit>}
      </CardWidgetHeader>
      <CardWidgetBody>
        <LeadDetailGroup>
          {inputElement(email, 'email', 'Email address', 'ri-mail-line', {}, !isEditing)}
          {secondaryEmail && inputElement(secondaryEmail, 'secondary_email', 'Secondary email address', 'ri-mail-line', {}, !isEditing)}
          {inputElement(phoneNumber, 'phone_number', 'Phone Number', 'ri-phone-line', {}, !isEditing)}
          {secondaryPhoneNumber && inputElement(secondaryPhoneNumber, 'secondary_phone_number', 'Secondary Phone Number', 'ri-phone-line', {}, !isEditing)}
          {inputElement(bestContactMethod, 'best_contact_method', 'Contact preference', 'ri-contacts-book-line', contactMethodChoices, !isEditing)}
          {inputElement(bestContactTime, 'best_contact_time', 'Best time to contact', 'ri-time-line', contactTimeChoices, !isEditing)}
          {inputElement(origin, 'origin', 'Origin', 'ri-compass-line', originChoices, !isEditing)}
          {inputElement(source, 'source', 'Source', 'ri-earth-line', convertedSourceChoices, !isEditing)}
          {inputElement(createdDate ? moment(createdDate).format('LL') : null, 'created', 'Create Date', 'ri-calendar-line', null, true)}
          {inputElement(movingReason, 'moving_reason', 'Reason for moving', 'ri-truck-line', convertedMovingReasonChoices, !isEditing)}
        </LeadDetailGroup>
        <Divider />
        <LeadDetailGroup>
          {inputElement(moveInDate ? moment(moveInDate).format('LL') : null, 'move_in_date', 'Move-in date', 'ri-calendar-line', null, !isEditing)}
          {inputElement(daysToMoveIn, 'days_to_move_in', 'Days to move-in', 'ri-calendar-line', null, true)}
          {realPagePmcId ? inputElement(priceRange, 'price_range', 'Price range', 'ri-bank-card-line', convertedPriceRangeChoices, !isEditing)
            : inputElement(!isEditing ? `$${desiredRent || 0}/month` : desiredRent, 'desired_rent', 'Desired rent', 'ri-bank-card-line', null, !isEditing)}
          {inputElement(leaseTerm, 'lease_term', 'Desired lease term', 'ri-calendar-todo-line', null, !isEditing)}
          {inputElement(occupants, 'occupants', 'Occupants', 'ri-parent-line', null, !isEditing)}
          {inputElement(vehicles, 'vehicles', 'Vehicles', 'ri-roadster-line', null, !isEditing)}
          {inputElement(beds, 'beds', 'Beds', 'ri-hotel-bed-line', null, !isEditing)}
          {inputElement(baths, 'baths', 'Baths', 'ri-bubble-chart-line', null, !isEditing)}
          {inputElement(pets, 'pets', 'Pets', 'ri-baidu-line', null, !isEditing)}
          {inputElement(petType, 'pet_type', 'Pet type', 'ri-baidu-line', convertedPetTypesChoices, !isEditing)}
          {realPagePmcId ? inputElement(realPagePetWeight, 'real_page_pet_weight', 'Pet weight', 'ri-baidu-line', convertedWeightChoices, !isEditing)
            : inputElement(resManPetWeight, 'res_man_pet_weight', 'Pet weight', 'ri-baidu-line', null, !isEditing)}
          {inputElement(washerDryerMethod, 'washer_dryer_method', 'Washer/Dryer', 'ri-shirt-line', washerDryerMethodChoices, !isEditing)}
        </LeadDetailGroup>
        <Divider hidden={!isEditing && !floorPlansValues && !unitTypeValues} />
        <LeadDetailGroup>
          {inputElement(isEditing ? floorPlanChoices.filter(option => (floorPlan || []).includes(option.value))
            : floorPlansValues, 'floor_plan', 'Floor Plan', 'ri-bank-card-line', floorPlanChoices, !isEditing)}
          {inputElement(isEditing ? unitChoices.filter(option => (units || []).includes(option.value))
            : unitTypeValues, 'units', 'Property Units', 'ri-calendar-line', unitChoices, !isEditing)}
        </LeadDetailGroup>
      </CardWidgetBody>
      <LeadRoommates isShared={isShared} />
    </CardWidget>
  );
};

export default withRouter(ProspectDetails);
