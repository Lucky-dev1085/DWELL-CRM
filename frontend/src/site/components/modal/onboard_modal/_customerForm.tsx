import React, { FC } from 'react';
import { connect } from 'react-redux';
import { FormFeedback, FormGroup } from 'reactstrap';
import { CustomerProps } from 'src/interfaces';
import { CustomSelect } from './styles';

interface CustomerFormProps {
  customers: Array<CustomerProps>,
  customer: CustomerProps,
  errors: { id: number },
  onChange: (data: { target: { id: string, value: string | number } }) => null,
}

const CustomerForm: FC<CustomerFormProps> = ({ customers, onChange, customer, errors }) => {
  const customerOptions = customers.map((item, key) => (<option key={key} value={item.id}>{item.customer_name}</option>));
  return (
    <React.Fragment>
      <FormGroup className="mb-15">
        <CustomSelect type="select" value={customer.id} id="id" onChange={onChange} invalid={errors.id}>
          <option value="0">Please choose the customer</option>
          {customerOptions}
        </CustomSelect>
        <FormFeedback>{errors.id}</FormFeedback>
      </FormGroup>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  customers: state.customer.customers,
});

export default connect(
  mapStateToProps,
  null,
)(CustomerForm);
