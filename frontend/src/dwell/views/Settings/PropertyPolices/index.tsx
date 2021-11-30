import React, { useEffect, useState, FC } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, Input, CustomInput, Button } from 'reactstrap';
import CurrencyInput from 'react-currency-input-field';
import Select from 'react-select';
import { isEmpty } from 'lodash';
import leaseAction from 'dwell/actions/lease';
import { ContentText, ContentTitleSm, Divider } from 'dwell/views/Settings/styles';
import { fieldChoices } from 'dwell/constants';
import { PropertyPolicy } from 'src/interfaces';
import { CheckBox } from 'site/components';
import { toast, ToastOptions } from 'react-toastify';
import { toastOptions } from 'site/constants';
import 'src/scss/pages/_assign_lead_owners.scss';
import 'src/scss/pages/_business_hours.scss';
import 'src/scss/pages/_email_template.scss';
import TimeDropdown from 'dwell/views/Settings/PropertyPolices/_timeDropdown';
import { FormLabel, SectionDivider, PolicyWrapper, FormYesNoSwitch } from './styles';

interface PropertyPolices extends RouteComponentProps {
  isSubmitting?: boolean,
}

const PropertyPolices: FC<PropertyPolices> = ({ isSubmitting }) => {
  const [formData, setFormData] = useState({
    is_cosigners_allowed: true,
    utilities: Object.keys(fieldChoices.PROPERTY_POLICY_FILED_CHOICES.utilities),
    is_dogs_acceptable: true,
    is_cats_acceptable: true,
    is_birds_acceptable: true,
    max_pets_policy_mode: 'UNIT',
    max_vehicles_policy_mode: 'UNIT',
  } as PropertyPolicy);

  const dispatch = useDispatch();
  const propertyPolicy = useSelector(state => state.lease.propertyPolicy);
  const { savePropertyPolicy } = leaseAction;

  useEffect(() => {
    if (!isEmpty(propertyPolicy)) {
      setFormData(propertyPolicy);
    }
  }, [propertyPolicy]);

  const handleSave = () => {
    dispatch(savePropertyPolicy(formData, () => toast.success('Property policies saved', toastOptions as ToastOptions)));
  };

  const handleCurrencyChange = (value, name) => {
    setFormData({ ...formData, [name]: value || null });
  };

  const handleChange = ({ target: { id, name = '', value, checked = false } }) => {
    let newValue = value;

    if (name === 'is_cosigners_allowed') {
      newValue = value === 'Yes';
      setFormData({ ...formData, [name]: newValue });
      return;
    }
    if (name === 'utilities') {
      if (checked) {
        newValue = (formData[name] || []).concat(value);
      } else {
        newValue = (formData[name] || []).filter(item => item !== value);
      }
      setFormData({ ...formData, [name]: newValue });
      return;
    }

    if (['max_pets_policy_mode', 'max_vehicles_policy_mode'].includes(name)) {
      setFormData({ ...formData, [name]: newValue });
      return;
    }

    setFormData({ ...formData, [id]: newValue });
  };

  const renderElement = (name, children, hideHr = false) => (
    <React.Fragment>
      <Row className="align-items-center m-row-10 mt-2">
        <Col sm={4} className="p-x-10">
          <FormLabel dangerouslySetInnerHTML={{ __html: name }} />
        </Col>
        <Col sm={8} className="p-x-10">
          {children}
        </Col>
      </Row>
      {!hideHr && <SectionDivider />}
    </React.Fragment>
  );

  const renderMaxPetsAndVehicles = type => (
    <Row>
      <Col sm={12}>
        <Row className="mb-20">
          <CustomInput
            value="UNIT"
            type="radio"
            className="ml-3"
            id={`max_${type}_policy_mode_on`}
            name={`max_${type}_policy_mode`}
            label={`Max ${type} ${type === 'pets' ? 'per' : 'by'} Unit`}
            checked={formData[`max_${type}_policy_mode`] === 'UNIT'}
            onChange={handleChange}
          />
          <CustomInput
            value="LEASEHOLDER"
            className="ml-3"
            type="radio"
            id={`max_${type}_policy_mode_off`}
            name={`max_${type}_policy_mode`}
            label={`Max ${type} ${type === 'pets' ? 'per' : 'by'} Leaseholder(s)`}
            checked={formData[`max_${type}_policy_mode`] === 'LEASEHOLDER'}
            onChange={handleChange}
          />
        </Row>
      </Col>
      <Col sm={12}>
        {formData[`max_${type}_policy_mode`] === 'UNIT' ? (
          <React.Fragment>
            {type === 'pets' ? (
              <CurrencyInput
                id="max_pets_per_unit"
                name="max_pets_per_unit"
                value={formData.max_pets_per_unit || undefined}
                onChange={handleCurrencyChange}
                className="form-control mb-0"
              />
            ) :
              (
                <React.Fragment>
                  <Row className="align-items-center mb-10">
                    <Col sm={6}><FormLabel>Max {type} for studio</FormLabel></Col>
                    <Col sm={6}>
                      <CurrencyInput
                        id={`max_${type}_for_studio`}
                        name={`max_${type}_for_studio`}
                        value={formData[`max_${type}_for_studio`] || undefined}
                        onChange={handleCurrencyChange}
                        className="form-control mb-0"
                      />
                    </Col>
                  </Row>
                  <Row className="align-items-center mb-10">
                    <Col sm={6}><FormLabel>Max {type} for 1 bedroom</FormLabel></Col>
                    <Col sm={6}>
                      <CurrencyInput
                        id={`max_${type}_for_one_bedroom`}
                        name={`max_${type}_for_one_bedroom`}
                        value={formData[`max_${type}_for_one_bedroom`] || undefined}
                        onChange={handleCurrencyChange}
                        className="form-control mb-0"
                      />
                    </Col>
                  </Row>
                  <Row className="align-items-center mb-10">
                    <Col sm={6}><FormLabel>Max {type} for 2 bedrooms</FormLabel></Col>
                    <Col sm={6}>
                      <CurrencyInput
                        id={`max_${type}_for_two_bedrooms`}
                        name={`max_${type}_for_two_bedrooms`}
                        value={formData[`max_${type}_for_two_bedrooms`] || undefined}
                        onChange={handleCurrencyChange}
                        className="form-control mb-0"
                      />
                    </Col>
                  </Row>
                  <Row className="align-items-center">
                    <Col sm={6}><FormLabel>Max {type} for 3 bedrooms</FormLabel></Col>
                    <Col sm={6}>
                      <CurrencyInput
                        id={`max_${type}_for_three_bedrooms`}
                        name={`max_${type}_for_three_bedrooms`}
                        value={formData[`max_${type}_for_three_bedrooms`] || undefined}
                        onChange={handleCurrencyChange}
                        className="form-control mb-0"
                      />
                    </Col>
                  </Row>
                </React.Fragment>
              )}
          </React.Fragment>
        ) :
          (
            <React.Fragment>
              <Row className="align-items-center mb-10">
                <Col sm={6}><FormLabel>Max {type} for 1 leaseholder</FormLabel></Col>
                <Col sm={6}>
                  <CurrencyInput
                    id={`max_${type}_for_one_leaseholder`}
                    name={`max_${type}_for_one_leaseholder`}
                    value={formData[`max_${type}_for_one_leaseholder`] || undefined}
                    onChange={handleCurrencyChange}
                    className="form-control mb-0"
                  />
                </Col>
              </Row>
              <Row className="align-items-center mb-10">
                <Col sm={6}><FormLabel>Max {type} for 2 leaseholders</FormLabel></Col>
                <Col sm={6}>
                  <CurrencyInput
                    id={`max_${type}_for_two_leaseholders`}
                    name={`max_${type}_for_two_leaseholders`}
                    value={formData[`max_${type}_for_two_leaseholders`] || undefined}
                    onChange={handleCurrencyChange}
                    className="form-control mb-0"
                  />
                </Col>
              </Row>
              <Row className="align-items-center mb-10">
                <Col sm={6}><FormLabel>Max {type} for 3 leaseholders</FormLabel></Col>
                <Col sm={6}>
                  <CurrencyInput
                    id={`max_${type}_for_three_leaseholders`}
                    name={`max_${type}_for_three_leaseholders`}
                    value={formData[`max_${type}_for_three_leaseholders`] || undefined}
                    onChange={handleCurrencyChange}
                    className="form-control mb-0"
                  />
                </Col>
              </Row>
              <Row className="align-items-center">
                <Col sm={6}><FormLabel>Max {type} for 4 leaseholders</FormLabel></Col>
                <Col sm={6}>
                  <CurrencyInput
                    id={`max_${type}_for_four_leaseholders`}
                    name={`max_${type}_for_four_leaseholders`}
                    value={formData[`max_${type}_for_four_leaseholders`] || undefined}
                    onChange={handleCurrencyChange}
                    className="form-control mb-0"
                  />
                </Col>
              </Row>
            </React.Fragment>
          )}
      </Col>
    </Row>
  );

  const renderPetPolicy = (label) => {
    const lowerLabel = label.toLowerCase();
    const singularLabel = lowerLabel.slice(0, -1);
    return (
      <React.Fragment>
        <Row className="align-items-center">
          <Col sm={4}><FormLabel>{label} acceptable</FormLabel></Col>
          <Col sm={8}>
            <FormYesNoSwitch
              checked={formData[`is_${lowerLabel}_acceptable`]}
              onClick={() => handleChange({ target: { id: `is_${lowerLabel}_acceptable`, value: !formData[`is_${lowerLabel}_acceptable`] } })}
            />
          </Col>
        </Row>
        {formData[`is_${lowerLabel}_acceptable`] ? (
          <React.Fragment>
            <Row className="align-items-center mt-10 mb-10" style={{ height: '41px' }}>
              <Col sm={4}><FormLabel>Size limit</FormLabel></Col>
              <Col sm={8}>
                <Row>
                  <Col sm={4} className="mt-auto mb-auto">
                    <FormYesNoSwitch
                      checked={formData[`has_${singularLabel}_size_limit`]}
                      onClick={() => handleChange({ target: { id: `has_${singularLabel}_size_limit`, value: !formData[`has_${singularLabel}_size_limit`] } })}
                    />
                  </Col>
                  <Col sm={8}>
                    {formData[`has_${singularLabel}_size_limit`] ?
                      <CurrencyInput
                        id={`${singularLabel}_size_limit`}
                        name={`${singularLabel}_size_limit`}
                        value={formData[`${singularLabel}_size_limit`] || undefined}
                        onChange={handleCurrencyChange}
                        className="form-control mb-0"
                        placeholder="lbs"
                      />
                      :
                      <FormLabel>No size limit</FormLabel>}
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className="align-items-center">
              <Col sm={4}><FormLabel className="mb-2">Breed restrictions</FormLabel></Col>
              <Col sm={8}><Input type="textarea" className="mb-0" id={`${singularLabel}_breed_restrictions`} value={formData[`${singularLabel}_breed_restrictions`]} onChange={handleChange} /></Col>
            </Row>
          </React.Fragment>
        ) : null}
      </React.Fragment>
    );
  };

  const renderCommunityDetails = (
    <React.Fragment>
      <Row className="align-items-center m-row-10 mb-3">
        <Col sm={4} className="p-x-10 mb-1"><FormLabel>Smoking allowed</FormLabel></Col>
        <Col sm={8} className="p-x-10">
          <FormYesNoSwitch checked={formData.smoking_allowed} onClick={() => handleChange({ target: { id: 'smoking_allowed', value: !formData.smoking_allowed } })} />
        </Col>
      </Row>
      {
        !!formData.smoking_allowed &&
        <Row className="align-items-center">
          <Col sm={4}><FormLabel className="mb-2">Smoking policy disclaimer</FormLabel></Col>
          <Col sm={8}>
            <Input
              type="textarea"
              className="mb-0"
              id="smoking_policy_disclaimer"
              value={formData.smoking_policy_disclaimer}
              onChange={handleChange}
            />
          </Col>
        </Row>
      }

      <SectionDivider />
      <Row className="align-items-center mb-20 m-row-10">
        <Col sm={4} className="p-x-10"><FormLabel>Apartment ceiling height (in ft)</FormLabel></Col>
        <Col sm={8} className="p-x-10">
          <CurrencyInput
            id="apartment_ceiling_height"
            name="apartment_ceiling_height"
            value={formData.apartment_ceiling_height || undefined}
            onChange={handleCurrencyChange}
            className="form-control mb-0"
          />
        </Col>
      </Row>
      <Row className="align-items-center mb-20 m-row-10">
        <Col sm={4} className="p-x-10"><FormLabel>Overnight quest stay limit (in days)</FormLabel></Col>
        <Col sm={8} className="p-x-10">
          <CurrencyInput
            id="apartment_ceiling_height"
            name="apartment_ceiling_height"
            value={formData.apartment_ceiling_height || undefined}
            onChange={handleCurrencyChange}
            className="form-control mb-0"
          />
        </Col>
      </Row>
      <Row className="align-items-center mb-20 m-row-10">
        <Col sm={4} className="p-x-10"><FormLabel>Pest control service day</FormLabel></Col>
        <Col sm={8} className="p-x-10">
          <Input
            type="select"
            id="pest_control_service_day"
            className="mb-0"
            value={formData.pest_control_service_day}
            onChange={handleChange}
          >
            <option>Select an option</option>
            {Object.keys(fieldChoices.PROPERTY_POLICY_FILED_CHOICES.pestControlServiceDay).map(key =>
              <option value={key}>{fieldChoices.PROPERTY_POLICY_FILED_CHOICES.pestControlServiceDay[key]}</option>)}
          </Input>
        </Col>
      </Row>

    </React.Fragment>
  );

  const bedroomsChoices = { studio: 'studio', one_bedroom: '1 bedroom', two_bedrooms: '2 bedrooms', three_bedrooms: '3 bedrooms' };

  return (
    <PolicyWrapper>
      <ContentTitleSm>Property Policies</ContentTitleSm>
      <ContentText>Set policy guidelines to inform applications, leasing, and property usage which apply to all leases and applicants.</ContentText>
      <Divider />
      {renderElement(
        'Household income requirements',
        <Row className="align-items-center m-0">
          <FormLabel className="mr-10">Monthly household income must be</FormLabel>
          <CurrencyInput
            id="household_income_times"
            name="household_income_times"
            value={formData.household_income_times || undefined}
            onChange={handleCurrencyChange}
            className="form-control mb-0"
            style={{ width: '50px' }}
          />
          <FormLabel className="ml-10">times monthly rent</FormLabel>
        </Row>,
      )}
      {renderElement(
        'Co-signers allowed',
        <Row className="ml-0">
          <CustomInput
            value="Yes"
            type="radio"
            id="is_cosigners_allowed_yes"
            name="is_cosigners_allowed"
            label="Yes, allow co-signers"
            checked={formData.is_cosigners_allowed}
            onChange={handleChange}
          />
          <CustomInput
            value="No"
            type="radio"
            id="is_cosigners_allowed_no"
            name="is_cosigners_allowed"
            label="No, do not allow co-signers"
            checked={!formData.is_cosigners_allowed}
            onChange={handleChange}
            className="ml-19"
          />
        </Row>,
      )}
      {renderElement(
        'Utilities resident is responsible for',
        Object.keys(fieldChoices.PROPERTY_POLICY_FILED_CHOICES.utilities).map(key => (
          <Row className="ml-0">
            <CheckBox
              name="utilities"
              id={`utilities-${key}`}
              value={key}
              label={fieldChoices.PROPERTY_POLICY_FILED_CHOICES.utilities[key]}
              checked={(formData.utilities || []).includes(key)}
              onChange={handleChange}
              labelClassName="label-checkbox"
            />
          </Row>
        )),
        true,
      )}
      {renderElement(
        'Avg. monthly utility bill (estimate)',
        <CurrencyInput id="monthly_utility_bill" name="monthly_utility_bill" value={formData.monthly_utility_bill || undefined} onChange={handleCurrencyChange} className="form-control mb-0" prefix="$" placeholder="$" />,
      )}
      {renderElement(
        'Acceptable forms of payment',
        <Select
          id="acceptable_forms_of_payment"
          isMulti
          options={Object.keys(fieldChoices.PROPERTY_POLICY_FILED_CHOICES.paymentForms).map(i => ({ value: i, label: fieldChoices.PROPERTY_POLICY_FILED_CHOICES.paymentForms[i] }))}
          className="basic-multi-select"
          classNamePrefix="select"
          placeholder="Select payment method"
          onChange={v => handleChange({ target: { id: 'acceptable_forms_of_payment', value: v.map(item => item.value) } })}
          value={(formData.acceptable_forms_of_payment || []).map(i => ({ label: fieldChoices.PROPERTY_POLICY_FILED_CHOICES.paymentForms[i], value: i }))}
        />,
      )}
      {renderElement(
        'Checks paid to',
        <Input id="checks_paid_to" className="mb-0" value={formData.checks_paid_to} onChange={handleChange} />,
      )}
      {renderElement(
        'Waitlist fee',
        <CurrencyInput id="waitlist_fee" name="waitlist_fee" value={formData.waitlist_fee || undefined} onChange={handleCurrencyChange} className="form-control mb-0" prefix="$" placeholder="$" />,
      )}
      {renderElement(
        'Required days notice to vacate',
        <React.Fragment>
          <Row className="align-items-center mb-20">
            <Col sm={6}>
              <FormLabel>Standard lease</FormLabel>
            </Col>
            <Col sm={6}>
              <Input
                type="select"
                id="notice_to_vacate_prior_days"
                className="mb-0"
                value={formData.notice_to_vacate_prior_days}
                onChange={handleChange}
              >
                <option>Select an option</option>
                {[30, 45, 60, 90].map(v => <option value={v}>{v} days prior</option>)}
              </Input>
            </Col>
          </Row>
          <Row className="align-items-center">
            <Col sm={6}>
              <FormLabel>Month-to-month</FormLabel>
            </Col>
            <Col sm={6}>
              <Input
                type="select"
                id="notice_to_vacate_month_to_month_days"
                className="mb-0"
                value={formData.notice_to_vacate_month_to_month_days}
                onChange={handleChange}
              >
                <option>Select an option</option>
                {[15, 30, 45, 60, 90].map(v => <option value={v}>{v} days prior</option>)}
              </Input>
            </Col>
          </Row>
        </React.Fragment>,
      )}
      {renderElement(
        'Apartment hold length (after first application)',
        <Input type="select" id="apartment_hold_expiration" className="mb-0" value={formData.apartment_hold_expiration} onChange={handleChange}>
          <option>Select an option</option>
          {Object.keys(fieldChoices.PROPERTY_POLICY_FILED_CHOICES.apartmentHoldExpiration).map(key =>
            <option value={key}>{fieldChoices.PROPERTY_POLICY_FILED_CHOICES.apartmentHoldExpiration[key]}</option>)}
        </Input>,
        true,
      )}
      {renderElement(
        'Requirements to hold unit',
        <Input type="textarea" className="mb-0" id="requirements_to_hold_unit" value={formData.requirements_to_hold_unit || undefined} onChange={handleChange} />,
      )}
      {
        renderElement(
          'Parking',
          <>
            {renderElement(
              'Resident parking type',
              <Input
                type="select"
                id="resident_parking_type"
                className="mb-0"
                value={formData.resident_parking_type}
                onChange={handleChange}
              >
                <option>Select an option</option>
                {Object.keys(fieldChoices.PROPERTY_POLICY_FILED_CHOICES.residentParkingType).map(key =>
                  <option value={key}>{fieldChoices.PROPERTY_POLICY_FILED_CHOICES.residentParkingType[key]}</option>)}
              </Input>,
              false,
            )}
            {renderElement(
              'Guest parking allowed',
              <FormYesNoSwitch
                checked={formData.guest_parking_is_allowed}
                onClick={() => handleChange({ target: { id: 'guest_parking_is_allowed', value: !formData.guest_parking_is_allowed } })}
              />,
              !!formData.guest_parking_is_allowed,
            )}
            {
              !!formData.guest_parking_is_allowed &&
              renderElement(
                'Guest parking type',
                <Input
                  type="select"
                  id="guest_parking_type"
                  className="mb-0"
                  value={formData.guest_parking_type}
                  onChange={handleChange}
                >
                  <option>Select an option</option>
                  {Object.keys(fieldChoices.PROPERTY_POLICY_FILED_CHOICES.guestParkingTypes).map(key =>
                    <option value={key}>{fieldChoices.PROPERTY_POLICY_FILED_CHOICES.guestParkingTypes[key]}</option>)}
                </Input>,
              )}
            {renderElement(
              'Parking rent',
              <CurrencyInput id="parking_rent" name="parking_rent" value={formData.parking_rent || undefined} onChange={handleCurrencyChange} className="form-control mb-0" prefix="$" placeholder="$" />,
              true,
            )}
            {renderElement(
              'Parking permit rent',
              <CurrencyInput id="parking_permit_rent" name="parking_permit_rent" value={formData.parking_permit_rent || undefined} onChange={handleCurrencyChange} className="form-control mb-0" prefix="$" placeholder="$" />,
            )}
            {renderElement(
              'Garage door opener replacement fee',
              <CurrencyInput
                id="garage_door_opener_replacement_fee"
                name="garage_door_opener_replacement_fee"
                value={formData.garage_door_opener_replacement_fee || undefined}
                onChange={handleCurrencyChange}
                className="form-control mb-0"
                prefix="$"
                placeholder="$"
              />,
              true,
            )}
            {renderElement(
              'Garage reprogramming fee',
              <CurrencyInput
                id="garage_door_reprogramming_fee"
                name="garage_door_reprogramming_fee"
                value={formData.garage_door_reprogramming_fee || undefined}
                onChange={handleCurrencyChange}
                className="form-control mb-0"
                prefix="$"
                placeholder="$"
              />,
              true,
            )}
            {renderElement(
              'Parking identification replacement fee',
              <CurrencyInput id="parking_id_replacement" name="parking_id_replacement_fee" value={formData.parking_id_replacement_fee || undefined} onChange={handleCurrencyChange} className="form-control mb-0" prefix="$" placeholder="$" />,
              true,
            )}

          </>,
        )
      }
      {renderElement(
        'Amenities',
        <>
          <Row>
            <Col sm={4}>
              {''}
            </Col>
            <Col sm={8}>
              <Row>
                <Col sm={2}>24/7</Col>
                <Col sm={5}>Start time</Col>
                <Col sm={5}>End time</Col>
              </Row>
            </Col>
          </Row>
          {renderElement(
            'Club House hours',
            <>
              <Row className="align-items-center">
                <Col sm={2} className="mt-auto mb-auto">
                  <FormYesNoSwitch
                    checked={formData.club_house_hours_24_hr}
                    onClick={() => handleChange({ target: { id: 'club_house_hours_24_hr', value: !formData.club_house_hours_24_hr } })}
                  />
                </Col>
                {
                  !formData.club_house_hours_24_hr ?
                    <>
                      <Col sm={5} className="mt-auto mb-auto" >
                        <TimeDropdown onChange={value => handleChange({ target: { id: 'club_house_hours_start_time', value } })} value={formData.club_house_hours_start_time} />
                      </Col>
                      <Col sm={5} className="mt-auto mb-auto">
                        <TimeDropdown onChange={value => handleChange({ target: { id: 'club_house_hours_end_time', value } })} value={formData.club_house_hours_end_time} />
                      </Col>
                    </>
                    :
                    <Col sm={10} className="mt-auto mb-auto" >
                      <span>Available 24 hours, 7 days a week</span>
                    </Col>
                }

              </Row>
            </>,
            true,
          )}
          {renderElement(
            'Fitness Center hours',
            <>
              <Row className="align-items-center">
                <Col sm={2} className="mt-auto mb-auto">
                  <FormYesNoSwitch
                    checked={formData.fitness_center_hours_24_hr}
                    onClick={() => handleChange({ target: { id: 'fitness_center_hours_24_hr', value: !formData.fitness_center_hours_24_hr } })}
                  />
                </Col>
                {
                  !formData.fitness_center_hours_24_hr ?
                    <>
                      <Col sm={5} className="mt-auto mb-auto" >
                        <TimeDropdown onChange={value => handleChange({ target: { id: 'fitness_center_hours_start_time', value } })} value={formData.fitness_center_hours_start_time} />
                      </Col>
                      <Col sm={5} className="mt-auto mb-auto">
                        <TimeDropdown onChange={value => handleChange({ target: { id: 'fitness_center_hours_end_time', value } })} value={formData.fitness_center_hours_end_time} />
                      </Col>
                    </>
                    :
                    <Col sm={10} className="mt-auto mb-auto" >
                      <span>Available 24 hours, 7 days a week</span>
                    </Col>
                }

              </Row>
            </>,
            true,
          )}
          {renderElement(
            'Pool hours',
            <>
              <Row className="align-items-center">
                <Col sm={2} className="mt-auto mb-auto">
                  <FormYesNoSwitch
                    checked={formData.pool_hours_24_hr}
                    onClick={() => handleChange({ target: { id: 'pool_hours_24_hr', value: !formData.pool_hours_24_hr } })}
                  />
                </Col>
                {
                  !formData.pool_hours_24_hr ?
                    <>
                      <Col sm={5} className="mt-auto mb-auto" >
                        <TimeDropdown onChange={value => handleChange({ target: { id: 'pool_hours_start_time', value } })} value={formData.pool_hours_start_time} />
                      </Col>
                      <Col sm={5} className="mt-auto mb-auto">
                        <TimeDropdown onChange={value => handleChange({ target: { id: 'pool_hours_end_time', value } })} value={formData.pool_hours_end_time} />
                      </Col>
                    </>
                    :
                    <Col sm={10} className="mt-auto mb-auto" >
                      <span>Available 24 hours, 7 days a week</span>
                    </Col>
                }

              </Row>
            </>,
            true,
          )}
          {renderElement(
            'Community Quiet hours',
            <>
              <Row className="align-items-center">
                <Col sm={2} className="mt-auto mb-auto">
                  <FormYesNoSwitch
                    checked={formData.community_quiet_hours_24_hr}
                    onClick={() => handleChange({ target: { id: 'community_quiet_hours_24_hr', value: !formData.community_quiet_hours_24_hr } })}
                  />
                </Col>
                {
                  !formData.community_quiet_hours_24_hr ?
                    <>
                      <Col sm={5} className="mt-auto mb-auto" >
                        <TimeDropdown onChange={value => handleChange({ target: { id: 'community_quiet_hours_start_time', value } })} value={formData.community_quiet_hours_start_time} />
                      </Col>
                      <Col sm={5} className="mt-auto mb-auto">
                        <TimeDropdown onChange={value => handleChange({ target: { id: 'community_quiet_hours_end_time', value } })} value={formData.community_quiet_hours_end_time} />
                      </Col>
                    </>
                    :
                    <Col sm={10} className="mt-auto mb-auto" >
                      <span>Available 24 hours, 7 days a week</span>
                    </Col>
                }
              </Row>
            </>,
            true,
          )}
          {renderElement(
            'Moving and transfer hours',
            <>
              <Row className="align-items-center">
                <Col sm={2} className="mt-auto mb-auto">
                  <FormYesNoSwitch
                    checked={formData.moving_hours_24_hr}
                    onClick={() => handleChange({ target: { id: 'moving_hours_24_hr', value: !formData.moving_hours_24_hr } })}
                  />
                </Col>
                {
                  !formData.moving_hours_24_hr ?
                    <>
                      <Col sm={5} className="mt-auto mb-auto" >
                        <TimeDropdown onChange={value => handleChange({ target: { id: 'moving_hours_start_time', value } })} value={formData.moving_hours_start_time} />
                      </Col>
                      <Col sm={5} className="mt-auto mb-auto">
                        <TimeDropdown onChange={value => handleChange({ target: { id: 'moving_hours_end_time', value } })} value={formData.moving_hours_end_time} />
                      </Col>
                    </>
                    :
                    <Col sm={10} className="mt-auto mb-auto" >
                      <span>Available 24 hours, 7 days a week</span>
                    </Col>
                }
              </Row>
            </>,
          )}
          {renderElement(
            'Club House alarm fee',
            <CurrencyInput
              className="form-control"
              value={formData.club_house_alarm_fee || undefined}
              onChange={handleCurrencyChange}
              prefix="$"
              placeholder="$"
              id="club_house_alarm_fee"
              name="club_house_alarm_fee"
            />,
            true,
          )}
          {renderElement(
            'Fitness Center key refundable deposit',
            <CurrencyInput
              className="form-control"
              value={formData.fitness_center_key_deposit || undefined}
              onChange={handleCurrencyChange}
              prefix="$"
              placeholder="$"
              name="fitness_center_key_deposit"
            />,
            true,
          )}
        </>,
      )
      }
      {renderElement(
        'Occupancy standards',
        Object.keys(bedroomsChoices).map(item => (
          <Row className="align-items-center mb-10">
            <Col sm={6}><FormLabel>Max {bedroomsChoices[item]} occupants</FormLabel></Col>
            <Col sm={6}>
              <CurrencyInput
                id={`max_${item}_occupants`}
                name={`max_${item}_occupants`}
                value={formData[`max_${item}_occupants`] || undefined}
                onChange={handleCurrencyChange}
                className="form-control mb-0"
              />
            </Col>
          </Row>
        )),
      )}
      {renderElement(
        'Vehicle standards',
        renderMaxPetsAndVehicles('vehicles'),
      )}
      {renderElement(
        'Pet policy',
        <React.Fragment>
          {renderMaxPetsAndVehicles('pets')}
          <SectionDivider />
          {renderPetPolicy('Dogs')}
          <SectionDivider />
          {renderPetPolicy('Cats')}
          <SectionDivider />
          {renderPetPolicy('Birds')}
        </React.Fragment>,
      )}
      {renderElement(
        'Community details',
        renderCommunityDetails,
      )}
      <Button color="primary" onClick={() => handleSave()} disabled={isSubmitting}>Save Changes</Button>
    </PolicyWrapper>
  );
};

export default withRouter(PropertyPolices);
