import React, { FC } from 'react';
import { connect } from 'react-redux';
import { FormFeedback, Input, Label, FormGroup } from 'reactstrap';
import { CustomSwitch, SwitchInput, SwitchLabel } from 'site/components/common';
import { PropertyProps } from 'src/interfaces';

interface PropertyFormProps {
  property: PropertyProps,
  errors: PropertyProps,
  onChange: (data: { target: { id: string, value: string | number } }) => null,
}

const PropertyForm: FC<PropertyFormProps> = ({ onChange, property, errors }) => (
  <React.Fragment>
    <FormGroup className="mb-20">
      <Label htmlFor="domain">Domain name:</Label>
      <Input
        type="text"
        id="domain"
        aria-describedby="domain"
        placeholder="http://"
        value={property.domain}
        onChange={onChange}
        invalid={errors.domain}
      />
      <FormFeedback>{errors.domain}</FormFeedback>
    </FormGroup>
    <FormGroup>
      <Label htmlFor="name">Property name:</Label>
      <Input
        type="text"
        id="name"
        aria-describedby="name"
        placeholder="Enter name of property"
        value={property.name}
        onChange={onChange}
        invalid={errors.name}
      />
      <FormFeedback>{errors.name}</FormFeedback>
    </FormGroup>
    <CustomSwitch>
      <SwitchInput
        type="checkbox"
        id="status"
        checked={property.status === 'ACTIVE'}
        onChange={e => onChange({ target: { id: 'status', value: e.target.checked ? 'ACTIVE' : 'INACTIVE' } })}
      />
      <SwitchLabel htmlFor="status">Active State</SwitchLabel>
    </CustomSwitch>
  </React.Fragment>
);

const mapStateToProps = state => ({
  isSubmitting: state.property.isSubmitting || state.pageData.isSubmitting,
  clients: state.client.clients,
  customers: state.customer.customers,
  isClientDataLoaded: state.property.isPropertyDataLoaded,
});

export default connect(
  mapStateToProps,
  null,
)(PropertyForm);
