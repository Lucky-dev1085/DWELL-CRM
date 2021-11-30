import React, { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { FormFeedback, Label, FormGroup, Row, Col } from 'reactstrap';
import Select from 'react-select';
import { CustomerProps, UserProps } from 'src/interfaces';
import { roleTypes } from 'site/constants';
import actions from 'site/actions';

interface UserFormProps {
  customers: CustomerProps[],
  users: UserProps[],
  customerId: number,
  user: { ids: number[] },
  errors: { ids: number[] },
  onChange: (data: { target: { id: string, value: string | number } }) => null,
  getCustomerDetails: (id: number) => Promise<CustomerDetailResponse>,
}

interface CustomerDetailResponse {
  result: {
    data: {
      id: number,
      employee: { id: number, first_name: string, last_name: string, role: string }[],
    }
  }
}

const customStyles = {
  control: base => ({
    ...base,
    height: 42,
  }),
  valueContainer: provided => ({
    ...provided,
    height: 42,
  }),
  placeholder: provided => ({
    ...provided,
    top: '55%',
  }),
};

const UserForm: FC<UserFormProps> = ({ onChange, errors, customerId, getCustomerDetails, user }) => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    getCustomerDetails(customerId).then(({ result: { data } }) => {
      setUsers(data.employee.filter(i => i.role !== roleTypes.CUSTOMER_ADMIN).map(i => ({ ...i, name: `${i.first_name} ${i.last_name}` })));
    });
  }, []);

  return (
    <React.Fragment>
      <Row>
        <Col xs="12" className="pr-10">
          <FormGroup>
            <Label htmlFor="users">Available Users</Label>
            <Select
              id="locationCategory"
              isMulti
              name="categories"
              options={users.map(cat => ({ value: cat.id, label: cat.name }))}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Select user"
              onChange={v => onChange({ target: { id: 'ids', value: (v || []).map(item => item.value) } })}
              value={users.filter(i => user.ids.includes(i.id)).map(cat => ({ value: cat.id, label: cat.name }))}
              styles={customStyles}
            />
            <FormFeedback>{errors.ids}</FormFeedback>
          </FormGroup>
        </Col>
      </Row>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  isSubmitting: state.property.isSubmitting || state.pageData.isSubmitting,
  clients: state.client.clients,
  customers: state.customer.customers,
  users: state.user.users,
  isClientDataLoaded: state.property.isPropertyDataLoaded,
});

export default connect(
  mapStateToProps,
  {
    ...actions.customer,
  },
)(UserForm);
