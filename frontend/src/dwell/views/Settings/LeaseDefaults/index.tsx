import React, { useEffect, useState, FC } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { Col, Row, Input, Button, FormFeedback } from 'reactstrap';
import CurrencyInput from 'react-currency-input-field';
import { isEmpty } from 'lodash';
import actions from 'dwell/actions';
import styled from 'styled-components';
import cn from 'classnames';
import { ContentText, ContentTitleSm, Divider, CustomFormInput } from 'dwell/views/Settings/styles';
import { DetailResponse } from 'src/interfaces';
import { toast, ToastOptions } from 'react-toastify';
import { toastOptions } from 'site/constants';
import 'src/scss/pages/_assign_lead_owners.scss';
import 'src/scss/pages/_business_hours.scss';
import 'src/scss/pages/_email_template.scss';
import { rules } from 'src/site/common/validations';

const SubLabel = styled.span`
  font-size: 12px;
  font-style: italic;
`;

const FormLabel = styled.label`
  font-size: 13px;
  font-weight: 400;
`;

const SectionDivider = styled.hr`
  margin: 30px 0;
  border-color: #eaedf5;
`;
const SmallSectionDivider = styled.hr`
  margin: 30px 0;
  border-color: #eaedf5;
  width: 60%;
  margin-right: 0;
  margin-left: auto;
`;

const LeaseWrapper = styled.div`
  .form-control {
    color: #233457;
    border-radius: 5px;
    height: 36px;
    border: 1px solid #d9def0;
    font-size: 13px;

    &:focus {
      box-shadow: none;
      border-color: #b4bfe2;
    }
  }

  textarea {
    height: auto !important;
    font-size: 14px !important;
  }

  .btn-primary {
    padding: 0 15px;
    height: 38px;
    border-radius: 5px;
  }
`;

interface Lease {
  approved_security_deposit?: string,
  approved_non_refundable_premium_fee?: string,
  conditionally_approved_security_deposit?: string,
  conditionally_approved_non_refundable_premium_fee?: string,
  sales_tax?: string,
  pet_rent?: string,
  pet_fee?: string,
  pet_deposit?: string,
  pet_non_refundable_deposit?: string,
  valet_waste?: string,
  facilities_fee?: string,
  non_refundable_administration_fee?: string,
  guarantor_application_fee?: string,
  document_update_change?: string,
  application_fee?: string,
  replacement_key_fee?: string,
  corporate_application_fee?: string,
  month_to_month_fee?: string,
  month_to_month_fee_mode?: string,
  early_termination_fee?: string,
  early_termination_fee_mode?: string,
  apartment_transfer_fee?: string,
  late_charges?: string,
  late_charges_mode?: string,
  late_charges_after_days?: string,
  late_charges_per_day?: string,
  dishonored_funds_charge?: string,
  insurance_coverage_minimum?: string,
  storage_unit_late_fee?: string,
  storage_unit_late_fee_mode?: string,
  storage_unit_late_fee_after_days?: string,
  electric_company_website?: string,
  electric_company_name?: string,
  electric_company_phone_number?: string,
  gas_company_website?: string,
  gas_company_phone_number?: string,
  gas_company_name?: string,
  special_provisions?: string,
  community_manager_name?: string,
  no_lease_first_violation_fee?: string,
  no_lease_subsequent_violation_fee?: string,
  pet_waste_first_violation_fee?: string,
  pet_waste_subsequent_violation_fee?: string,
  trash_left_out_fee?: string,
  trash_container_replacement_fee?: string,
  unlock_after_hours_fee?: string,
  facilities_late_fee?: string,
  fob_replacement_fee?: string,
  towing_company_website?: string,
  towing_company_phone_number?: string,
  towing_company_name?: string,
  management_fax_number?: string,
}
interface LeaseDefaultErrors {
  gas_company_website?:boolean,
  gas_company_phone_number?: boolean,
  towing_company_website?:boolean,
  towing_company_phone_number?: boolean,
  electric_company_website?:boolean,
  electric_company_phone_number?: boolean,
}

interface RenderEl {
  type: string,
  id?: string,
  name?: string,
  moreFields?: {id: string, name: string, placeholder: string}[],
  showDays?: boolean,
  defaultValue?: string,
  placeholder?: string,
}

interface LeaseDefaults extends RouteComponentProps {
  leaseDefault?: Lease,
  saveLeaseDefault: (data: Lease, msg: () => void) => Promise<DetailResponse>,
  isSubmitting: boolean,
  currentProperty: { id: number, city: string, town: string, phone_number: string },
}

const LeaseDefaults: FC<LeaseDefaults> = ({ leaseDefault, saveLeaseDefault, isSubmitting, currentProperty }) => {
  const [formData, setFormData] = useState({} as Lease);
  const [errors, setErrors] = useState({} as LeaseDefaultErrors);
  const disableStyleCenter = ['currency_with_option', 'pet'];

  useEffect(() => {
    if (!isEmpty(leaseDefault)) {
      setFormData(leaseDefault);
    }
  }, [leaseDefault]);

  const validate = () => {
    let formErrors = {};
    const error = {} as LeaseDefaultErrors;

    if (!isEmpty(formData.electric_company_website) && !rules.isValidWebsite(formData.electric_company_website)) {
      error.electric_company_website = true;
    }
    if (!isEmpty(formData.electric_company_phone_number) && !rules.isPhoneNumber(formData.electric_company_phone_number)) {
      error.electric_company_phone_number = true;
    }
    if (!isEmpty(formData.gas_company_website) && !rules.isValidWebsite(formData.gas_company_website)) {
      error.gas_company_website = true;
    }
    if (!isEmpty(formData.gas_company_phone_number) && !rules.isPhoneNumber(formData.gas_company_phone_number)) {
      error.gas_company_phone_number = true;
    }
    if (!isEmpty(formData.towing_company_website) && !rules.isValidWebsite(formData.towing_company_website)) {
      error.towing_company_website = true;
    }
    if (!isEmpty(formData.towing_company_phone_number) && !rules.isPhoneNumber(formData.towing_company_phone_number)) {
      error.towing_company_phone_number = true;
    }

    if (!isEmpty(error)) formErrors = error;
    setErrors(error);
    return formErrors;
  };

  const handleSave = () => {
    if (isEmpty(validate())) {
      saveLeaseDefault(formData, () => toast.success('Lease defaults saved', toastOptions as ToastOptions));
    }
  };

  const handleCurrencyChange = (value, name) => {
    setFormData({ ...formData, [name]: value || null });
  };

  const handleChange = ({ target: { id, value } }) => {
    setFormData({ ...formData, [id]: value || null });
  };

  const renderElement = ({ id, name, type = 'currency', showDays = false, defaultValue = null, moreFields = [], placeholder = '' }: RenderEl) => {
    let element = null;
    switch (type) {
      case 'currency':
      default:
        element = <CurrencyInput id={id} name={id} value={formData[id] || undefined} onChange={handleCurrencyChange} className="form-control mb-0" prefix="$" placeholder={placeholder} />;
        break;
      case 'currency_with_option':
        element = (
          <React.Fragment>
            <Row className="m-row-10">
              <Col className="p-x-10">
                {formData[`${id}_mode`] === 'FIXED' ? (
                  <CurrencyInput id={id} name={id} value={formData[id] || undefined} onChange={handleCurrencyChange} className="form-control mb-0" prefix="$" />
                ) :
                  (
                    <CurrencyInput id={id} name={id} value={formData[id] || undefined} onChange={handleCurrencyChange} className="form-control mb-0" />
                  )}
              </Col>
              <Col xs="5" className="p-x-10">
                <Input className="mb-0" type="select" id={`${id}_mode`} value={formData[`${id}_mode`]} onChange={handleChange}>
                  {id === 'early_termination_fee' ? <option value="MONTHLY_RENT_TIMES">times monthly rent</option> : null}
                  <option value="PERCENT">% of rent</option>
                  <option value="FIXED">fixed $ amount</option>
                </Input>
              </Col>
            </Row>
            {showDays ? (
              <Row className="align-items-center m-0 mt-20">
                <FormLabel className="mb-0 mr-10">after</FormLabel>
                <CurrencyInput
                  id={`${id}_after_days`}
                  name={`${id}_after_days`}
                  value={formData[`${id}_after_days`] || undefined}
                  onChange={handleCurrencyChange}
                  className="form-control mb-0"
                  style={{ width: '100px' }}
                />
                <FormLabel className="ml-10 mb-0">days</FormLabel>
              </Row>
            ) : null}
          </React.Fragment>
        );
        break;
      case 'text':
        element = <Input id={id} value={formData[id] || defaultValue} placeholder={placeholder} onChange={handleChange} className="mb-0" />;
        break;
      case 'number':
        element = <CurrencyInput id={id} name={id} value={formData[id] || undefined} onChange={handleCurrencyChange} placeholder={placeholder} className="form-control mb-0" />;
        break;
      case 'textarea':
        element = <Input id={id} value={formData[id] || defaultValue} type="textarea" onChange={handleChange} className="mb-0" />;
        break;
    }
    if (type === 'pet') {
      element = (
        <Row className="m-row-10" > {moreFields.map(field =>
          (
            <Col xs="6" className="p-0 mb-15" >
              <Col xs="12" className="p-x-10"><FormLabel className="mb-0">{field.name}</FormLabel></Col>
              <Col xs="12" className="p-x-10" style={{ marginTop: '8px' }}>
                <CurrencyInput id={field.id} name={field.id} value={formData[field.id] || undefined} onChange={handleCurrencyChange} className="form-control mb-0" prefix="$" placeholder={field.placeholder} />
              </Col>
            </Col>))
        }
        </Row>);
    }
    if (type === 'valet_waste') {
      element = (
        <Row className="m-row-10" > {moreFields.map((field, index) =>
          (
            <Col xs={index === 0 ? '12' : '6'} className="p-0 mb-15" >
              <Col xs="12" className="p-x-10"><FormLabel className="mb-0">{field.name}</FormLabel></Col>
              <Col xs="12" className="p-x-10" style={{ marginTop: '8px' }}>
                <CurrencyInput id={field.id} name={field.id} value={formData[field.id] || undefined} onChange={handleCurrencyChange} className="form-control mb-0" prefix="$" placeholder={field.placeholder} />
              </Col>
            </Col>))
        }
        </Row>);
    }
    if (type === 'electric_company') {
      element = (
        <Row className="m-row-10"> {moreFields.map(field =>
          (
            <Col xs="4" className="p-0">
              <Col xs="12" className="p-x-10"><FormLabel className="mb-0">{field.name}</FormLabel></Col>
              <Col xs="12" className="p-x-10" style={{ marginTop: '9px' }}>
                <CustomFormInput
                  invalid={errors[field.id]}
                  id={field.id}
                  name={field.id}
                  value={formData[field.id] || undefined}
                  onChange={handleChange}
                  className="form-control mb-0"
                  placeholder={field.placeholder}
                />
                <FormFeedback>{field.name} is invalid</FormFeedback>
              </Col>
            </Col>))
        }
        </Row>);
    }
    if (type === 'gas_company') {
      element = (
        <Row className="m-row-10"> {moreFields.map(field =>
          (
            <Col xs="4" className="p-0">
              <Col xs="12" className="p-x-10"><FormLabel className="mb-0">{field.name}</FormLabel></Col>
              <Col xs="12" className="p-x-10" style={{ marginTop: '9px' }}>
                <CustomFormInput
                  invalid={errors[field.id]}
                  id={field.id}
                  name={field.id}
                  value={formData[field.id] || undefined}
                  onChange={handleChange}
                  className="form-control mb-0"
                  placeholder={field.placeholder}
                />
                <FormFeedback>{field.name} is invalid</FormFeedback>
              </Col>
            </Col>))
        }
        </Row>);
    }
    if (type === 'towing_company') {
      element = (
        <Row className="m-row-10"> {moreFields.map(field =>
          (
            <Col xs="4" className="p-0">
              <Col xs="12" className="p-x-10"><FormLabel className="mb-0">{field.name}</FormLabel></Col>
              <Col xs="12" className="p-x-10" style={{ marginTop: '9px' }}>
                <CustomFormInput
                  invalid={errors[field.id]}
                  id={field.id}
                  name={field.id}
                  value={formData[field.id] || undefined}
                  onChange={handleChange}
                  className="form-control mb-0"
                  placeholder={field.placeholder}
                />
                <FormFeedback>{field.name} is invalid</FormFeedback>
              </Col>
            </Col>))
        }
        </Row>);
    }
    return <>
      {type === 'divider' && <SectionDivider />}
      {type === 'smallDivider' && <SmallSectionDivider />}
      {!['divider', 'smallDivider'].includes(type) &&
      <Col className="mt-20 p-0">
        <Row className={cn('m-row-10', { 'align-items-center': disableStyleCenter.includes(type) })}>
          <Col sm={5} className="p-x-10">
            <FormLabel className="mb-0" style={type === 'currency_with_option' ? { marginTop: '9px' } : {}}>{type === 'gas_company' ? <>{name}<br /><SubLabel>(if applicable)</SubLabel></> : name}</FormLabel>
          </Col>
          <Col sm={7} className="pr-0 p-x-10" style={type === 'pet' ? { marginTop: '-1px' } : {}}>
            {element}
          </Col>
        </Row>
      </Col>}
    </>;
  };

  const elements = [
    { type: 'divider' },
    { id: 'sales_tax', name: 'Sales Tax (%)', type: 'number', placeholder: '%' },
    { type: 'divider' },
    { name: 'Pet',
      type: 'pet',
      moreFields: [
        { id: 'pet_rent', name: 'Rent', placeholder: '$' },
        { id: 'pet_fee', name: 'Fee', placeholder: '$' }, { id: 'pet_deposit', name: 'Refundable Deposit', placeholder: '$' },
        { id: 'pet_non_refundable_deposit', name: 'Non-refundable Deposit', placeholder: '$' },
        { id: 'no_lease_first_violation_fee', name: 'No Lease First Violation fee', placeholder: '$' },
        { id: 'no_lease_subsequent_violation_fee', name: 'No Lease Subsequent Violation Fee', placeholder: '$' },
        { id: 'pet_waste_first_violation_fee', name: 'Pet Waste First Violation Fee', placeholder: '$' },
        { id: 'pet_waste_subsequent_violation_fee', name: 'Pet Waste Subsequent Violation Fee', placeholder: '$' },
      ],
    },
    { type: 'divider' },
    { name: 'Valet Waste',
      type: 'valet_waste',
      moreFields: [
        { id: 'valet_waste_rent', name: 'Rent', placeholder: '$' },
        { id: 'trash_left_out_fee', name: 'Trash Left Out Violation Fee', placeholder: '$' },
        { id: 'trash_container_replacement_fee', name: 'Trash Container Replacement Fee', placeholder: '$' },
      ],
    },
    { type: 'divider' },
    { id: 'facilities_fee', name: 'Building & Facilities Fee', type: 'currency', placeholder: '$' },
    { id: 'facilities_late_fee', name: 'Building & Facilities Late Fee', type: 'currency', placeholder: '$' },
    { id: 'non_refundable_administration_fee', name: 'Non-Refundable Administration Fee', type: 'currency', placeholder: '$' },
    { id: 'application_fee', name: 'Application Fee', type: 'currency', placeholder: '$' },
    { id: 'guarantor_application_fee', name: 'Guarantor Application Fee', type: 'currency', placeholder: '$' },
    { id: 'document_update_change', name: 'Document Update Charge', type: 'currency', placeholder: '$' },
    { id: 'corporate_application_fee', name: 'Corporate Application Fee', type: 'currency', placeholder: '$' },
    { id: 'replacement_key_fee', name: 'Apartment Key Not Returned Fee', type: 'currency', placeholder: '$' },
    { id: 'unlock_after_hours_fee', name: 'Unlock Apartment After Hours Fee', type: 'currency', placeholder: '$' },
    { id: 'fob_replacement_fee', name: 'Gate Entry Fob Replacement Fee', type: 'currency', placeholder: '$' },
    { id: 'month_to_month_fee', name: 'Month-to-Month Fee', type: 'currency_with_option' },
    { id: 'early_termination_fee', name: 'Early Termination Fee', type: 'currency_with_option' },
    { id: 'apartment_transfer_fee', name: 'Apartment Transfer Fee', type: 'currency', placeholder: '$' },
    { id: 'late_charges', name: 'First Late Charge', type: 'currency_with_option', showDays: true },
    { id: 'late_charges_per_day', name: 'Subsequent Late Charges per Day', type: 'currency', placeholder: '$' },
    { id: 'dishonored_funds_charge', name: 'Dishonored Funds Charge', type: 'currency', placeholder: '$' },
    { id: 'insurance_coverage_minimum', name: 'Insurance Coverage Minimum', type: 'currency', placeholder: '$' },
    { id: 'storage_unit_late_fee', name: 'Storage Unit Late Fee', type: 'currency_with_option', showDays: true },
    { type: 'divider' },
    { name: 'Electric Company',
      type: 'electric_company',
      moreFields: [{ id: 'electric_company_name', name: 'Name', placeholder: '' },
        { id: 'electric_company_website', name: 'Website', placeholder: 'www' }, { id: 'electric_company_phone_number', name: 'Phone Number', placeholder: '' }] },
    { type: 'smallDivider' },
    { name: 'Gas Company',
      type: 'gas_company',
      moreFields: [{ id: 'gas_company_name', name: 'Name', placeholder: '' },
        { id: 'gas_company_website', name: 'Website', placeholder: 'www' }, { id: 'gas_company_phone_number', name: 'Phone Number', placeholder: '' }] },
    { type: 'smallDivider' },
    { name: 'Towing company',
      type: 'towing_company',
      moreFields: [{ id: 'towing_company_name', name: 'Name', placeholder: '' },
        { id: 'towing_company_website', name: 'Website', placeholder: 'www' }, { id: 'towing_company_phone_number', name: 'Phone Number', placeholder: '' }] },
    { type: 'divider' },
    { id: 'special_provisions', name: 'Special Provisions', type: 'textarea' },
    { type: 'divider' },
    { id: 'community_manager_name', name: 'Community Manager Name', type: 'text' },
    { id: 'management_office_phone', name: 'Management Office Phone', type: 'text', defaultValue: currentProperty.phone_number },
    { id: 'management_fax_number', name: 'Management Fax Number', type: 'text' },
    {
      id: 'management_office_address',
      name: 'Management Office Address',
      type: 'textarea',
      defaultValue: currentProperty.id ? `${currentProperty.city}, ${currentProperty.town}` : '',
    },
    { type: 'divider' },
  ] as RenderEl[];

  const renderApprovedApplicationContent = (isCondition = false) => {
    const securityDepositId = `${isCondition ? 'conditionally_' : ''}approved_security_deposit`;
    const premiumFeeId = `${isCondition ? 'conditionally_' : ''}approved_non_refundable_premium_fee`;
    return (
      <Row className="mt-20 align-items-center m-row-10">
        <Col xs="5" className="p-x-10"><FormLabel className="mb-0">{isCondition ? 'Conditionally' : ''} Approved Application</FormLabel></Col>
        <Col className="p-x-10 pr-0">
          <CurrencyInput
            id={securityDepositId}
            name={securityDepositId}
            value={formData[securityDepositId] || undefined}
            onChange={handleCurrencyChange}
            className="form-control mb-0"
            prefix="$"
            placeholder="$"
          />
        </Col>
        <Col xs="1" className="text-center p-x-10"><FormLabel className="mb-0">or</FormLabel></Col>
        <Col className="p-x-10 pl-0">
          <CurrencyInput
            id={premiumFeeId}
            name={premiumFeeId}
            value={formData[premiumFeeId] || undefined}
            onChange={handleCurrencyChange}
            className="form-control mb-0"
            prefix="$"
            placeholder="$"
          />
        </Col>
      </Row>
    );
  };

  return (
    <LeaseWrapper>
      <ContentTitleSm>Lease Defaults</ContentTitleSm>
      <ContentText>Set default values to automatically populate common property lease fields.</ContentText>
      <Divider />
      <Row className="m-row-10" style={{ marginTop: '-1px' }}>
        <Col xs="5" className="p-x-10" />
        <Col className="p-x-10"><FormLabel>Security Deposit</FormLabel></Col>
        <Col xs="1" className="p-x-10" />
        <Col className="p-x-10"><FormLabel>Non-refundable Premium Fee</FormLabel></Col>
      </Row>
      {renderApprovedApplicationContent()}
      {renderApprovedApplicationContent(true)}
      {elements.map((e: RenderEl, key) => <React.Fragment key={key}>{renderElement(e)}</React.Fragment>)}
      <Button color="primary" onClick={() => handleSave()} disabled={isSubmitting}>Save Changes</Button>
    </LeaseWrapper>
  );
};

const mapStateToProps = state => ({
  leaseDefault: state.lease.leaseDefault,
  currentProperty: state.property.property,
});

export default connect(
  mapStateToProps,
  {
    ...actions.lease,
  },
)(withRouter(LeaseDefaults));
