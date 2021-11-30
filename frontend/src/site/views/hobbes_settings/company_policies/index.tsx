import { Row, Col, CardHeader, CardBody, CustomInput, DropdownToggle, DropdownMenu, DropdownItem, ButtonDropdown, Button } from 'reactstrap';
import React, { useState, useEffect, FC } from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { get, isEmpty } from 'lodash';
import { toast, ToastOptions } from 'react-toastify';
import { toastOptions } from 'site/constants';
import actions from 'site/actions';
import { CardBasic, CardTitle, CardText } from 'site/components/common';
import { DetailResponse, CompanyPolicyProps } from 'src/interfaces';
import { FormLabel, FormRow, FormControl, Divider, FormSwitch, DropdownWrapper, CardFooter } from 'site/views/hobbes_settings/styles';

interface CompanyPoliciesProps extends RouteComponentProps {
  saveCompanyPolicies: (data: CompanyPolicyProps, msg: () => void) => Promise<DetailResponse>,
  isSubmitting: boolean,
  companyPolicy: CompanyPolicyProps,
  customerName: string,
}

const otherPolicies = [
  { label: 'Application refund policy', key: 'application_refund_policy' },
  { label: 'Package policy', key: 'package_policy' },
  { label: 'Lease break policy', key: 'lease_break_policy' },
  { label: 'Transfer policy', key: 'transfer_policy' },
];

const processTimeItems = {
  '24_HOURS': '24 hours',
  '48_HOURS': '48 hours',
  '72_HOURS': '72 hours',
};

const CompanyPolicies: FC<CompanyPoliciesProps> = ({ saveCompanyPolicies, isSubmitting, companyPolicy, customerName }) => {
  const [formValues, setFormValues] = useState({
    basic_qualification_requirements: '',
    accept_section_eight: false,
    section_eight_disclaimer: '',
    accept_unemployment_as_income: true,
    unemployment_income_disclaimer: '',
    accept_applicant_without_ssn: true,
    ssn_disclaimer: '',
    accept_applicant_with_misdemeanors_or_felonies: true,
    misdemeanor_or_felony_disclaimer: '',
    is_hard_inquiry_on_credit_report: false,
    screening_process_time: '48_HOURS',
    is_valet_waste_service_optional: true,
    is_alley_waste_service_optional: true,
    application_refund_policy: '',
    package_policy: '',
    lease_break_policy: '',
    transfer_policy: '',
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isEmpty(companyPolicy)) {
      setFormValues(companyPolicy);
    }
  }, [companyPolicy]);

  const handleChange = ({ target: { id, name = '', value } }) => {
    if (['is_valet_waste_service_optional', 'is_hard_inquiry_on_credit_report', 'is_alley_waste_service_optional'].includes(name)) {
      setFormValues({ ...formValues, [name]: value === 'Yes' });
      return;
    }

    setFormValues({ ...formValues, [id]: value });
  };

  const handleSave = () => {
    saveCompanyPolicies(formValues, () => toast.success('Company policies saved', toastOptions as ToastOptions));
  };

  const renderElement = (name, children) => (
    <CardBody>
      <Row className="align-items-center m-row-10">
        <Col sm="4" className="p-x-10">
          <FormLabel>{name}</FormLabel>
        </Col>
        <Col sm="8" className="p-x-10">
          {children}
        </Col>
      </Row>
    </CardBody>
  );

  const renderToggleSection = (switchId, disclaimerId, labelAccept, labelDisclaimer) => (
    <React.Fragment>
      <FormRow>
        <Col sm="5" className="p-x-5">{labelAccept}</Col>
        <Col sm="7" className="p-x-5">
          <FormSwitch
            checked={get(formValues, switchId)}
            onClick={() => handleChange({ target: { id: switchId, value: !formValues[switchId] } })}
          />
        </Col>
      </FormRow>
      <FormRow className="mt-20">
        <Col sm="5" className="p-x-5">{labelDisclaimer}</Col>
        <Col sm="7" className="p-x-5">
          <FormControl id={disclaimerId} value={get(formValues, disclaimerId, '')} onChange={handleChange} type="textarea" />
        </Col>
      </FormRow>
    </React.Fragment>
  );

  const renderRadioSection = (id, label, radioLabel1, radioLabel2) => (
    <FormRow>
      <Col sm="5" className="p-x-5">{label}</Col>
      <Col sm="7" className="p-x-5">
        <CustomInput
          value="Yes"
          type="radio"
          id={`${id}_yes`}
          name={id}
          label={radioLabel1}
          checked={formValues[id]}
          onChange={handleChange}
        />
        <CustomInput
          value="No"
          type="radio"
          id={`${id}_no`}
          name={id}
          label={radioLabel2}
          checked={!formValues[id]}
          onChange={handleChange}
        />
      </Col>
    </FormRow>
  );

  const renderApplicationCriteria = (
    <React.Fragment>
      <FormRow>
        <Col sm="5" className="p-x-5">Basic qualification requirements</Col>
        <Col sm="7" className="p-x-5">
          <FormControl id="basic_qualification_requirements" value={get(formValues, 'basic_qualification_requirements', '')} onChange={handleChange} type="textarea" />
        </Col>
      </FormRow>
      <Divider />
      {renderToggleSection('accept_section_eight', 'section_eight_disclaimer', 'Accept section 8', 'Section 8 disclaimer')}
      <Divider />
      {renderToggleSection('accept_unemployment_as_income', 'unemployment_income_disclaimer', 'Accept unemployment as income', 'Unemployment income disclaimer')}
      <Divider />
      {renderToggleSection('accept_applicant_without_ssn', 'ssn_disclaimer', 'Accept applicant without SSN', 'SSN disclaimer')}
      <Divider />
      {renderToggleSection('accept_applicant_with_misdemeanors_or_felonies', 'misdemeanor_or_felony_disclaimer', 'Accept applicant with misdemeanors or felonies', 'Misdemeanor or felony disclaimer')}
    </React.Fragment>
  );

  const renderScreening = (
    <React.Fragment>
      {renderRadioSection('is_hard_inquiry_on_credit_report', 'Credit inquiry on screening shows as', 'Hard inquiry on credit report', 'Soft inquiry on credit report')}
      <Divider />
      <FormRow>
        <Col sm="5" className="p-x-5">Screening process time</Col>
        <Col sm="7" className="p-x-5">
          <DropdownWrapper>
            <ButtonDropdown className="mr-1 select-input" isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(!isDropdownOpen)}>
              <DropdownToggle caret className="bg-white">
                {formValues.screening_process_time ? processTimeItems[formValues.screening_process_time] : 'Select time'}
              </DropdownToggle>
              <DropdownMenu>
                {Object.keys(processTimeItems).map((key, index) => (
                  <React.Fragment key={index}>
                    <DropdownItem onClick={() => setFormValues({ ...formValues, screening_process_time: key })}>
                      {processTimeItems[key]}
                    </DropdownItem>
                  </React.Fragment>
                ))}
              </DropdownMenu>
            </ButtonDropdown>
          </DropdownWrapper>
        </Col>
      </FormRow>
    </React.Fragment>
  );

  const renderUtilities = (
    <React.Fragment>
      {renderRadioSection('is_valet_waste_service_optional', 'Valet Waste optional', 'Yes, Valet Waste service is optional', 'No, Valet Waste service is not optional')}
      <Divider />
      {renderRadioSection('is_alley_waste_service_optional', 'Alley Waste optional', 'Yes, Alley Waste service is optional', 'No, Alley Waste service is not optional')}
    </React.Fragment>
  );

  const renderOtherPolicies = (
    <React.Fragment>
      {otherPolicies.map((policy, index) => (
        <React.Fragment key={index}>
          <FormRow>
            <Col sm="5" className="p-x-5">{policy.label}</Col>
            <Col sm="7" className="p-x-5">
              <FormControl id={policy.key} value={get(formValues, policy.key, '')} onChange={handleChange} type="textarea" />
            </Col>
          </FormRow>
          { (index < otherPolicies.length - 1) && <Divider />}
        </React.Fragment>
      ))}
    </React.Fragment>
  );

  const renderAbout = (
    <React.Fragment>
      <FormRow>
        <Col sm="5" className="p-x-5">Who is {customerName}</Col>
        <Col sm="7" className="p-x-5">
          <FormControl id="about_customer" value={get(formValues, 'about_customer', '')} onChange={handleChange} type="textarea" />
        </Col>
      </FormRow>
    </React.Fragment>
  );

  return (
    <Row>
      <Col xs="12">
        <CardBasic>
          <CardHeader>
            <CardTitle className="mb-10">Company Policies</CardTitle>
            <CardText>
              Set policy guidelines to inform applicants and prospective residents about application and leasing expectations.
              This information will be used by Hobbes to surface answers during prospect chat sessions.
            </CardText>
          </CardHeader>
          {renderElement('Application criteria', renderApplicationCriteria)}
          {renderElement('Screening', renderScreening)}
          {renderElement('Utilities', renderUtilities)}
          {renderElement('Other Policies', renderOtherPolicies)}
          {renderElement('About', renderAbout)}
          <CardFooter>
            <Button color="primary" onClick={handleSave} disabled={isSubmitting}>Save Changes</Button>
          </CardFooter>
        </CardBasic>
      </Col>
    </Row>
  );
};

const mapStateToProps = state => ({
  isSubmitting: state.hobbes.isSubmitting,
  companyPolicy: state.hobbes.companyPolicy,
  customerName: state.property.property.customer_name,
});

export default connect(
  mapStateToProps,
  {
    ...actions.hobbes,
  },
)(withRouter(CompanyPolicies));
