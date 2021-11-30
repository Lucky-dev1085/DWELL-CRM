import React, { useState, useEffect, FC } from 'react';
import { connect } from 'react-redux';
import { map, isEmpty } from 'lodash';
import { Button, FormFeedback, Input, ModalBody, ModalFooter, ModalHeader, FormGroup, Label } from 'reactstrap';

import { statusTypes, roleTypes } from 'site/constants';
import actions from 'site/actions';
import { rules } from 'site/common/validations';
import { CustomSelect } from 'site/components/common';
import { CustomerProps, ClientProps, UserProps } from 'src/interfaces';
import { ModalWindow } from 'site/components/modal/client_modal/styles';

const initialState = {
  name: '',
  status: 'ACTIVE',
  customer: null,
};

interface ClientModalProps {
  client: ClientProps,
  customers: CustomerProps[],
  currentUser: UserProps,
  title: string,
  show: boolean,
  onClose: () => null,
  reload: () => null,
  updateCustomerLogo: (id: number, data: FormData) => Promise<null>,
  createClient: (data: ClientProps) => null,
  updateClient: (id: number, data: ClientProps) => null,
  getCustomers: (data: { show_all: boolean }) => null,
  isSubmitting: boolean,
}

interface ErrorProps {
  customer?: string,
  name?: string,
  status?: string,
}

const ClientModal: FC<ClientModalProps> = ({ getCustomers, createClient, updateClient, currentUser, customers, isSubmitting, reload, client, title, show, onClose }) => {
  const [formValues, setFormValues] = useState<ClientProps>(initialState);
  const [errors, setErrors] = useState<ErrorProps>({});

  const isLLAdmin = currentUser.role === roleTypes.LIFT_LYTICS_ADMIN;

  useEffect(() => {
    if (isLLAdmin) {
      getCustomers({ show_all: true });
    }
  }, []);

  useEffect(() => {
    if (client.id) {
      setFormValues({ ...client });
    } else {
      setFormValues(initialState);
    }
    setErrors({});
  }, [client]);

  const handleInputChange = ({ target: { id, value } }) => {
    setFormValues({ ...formValues, [id]: id === 'customer' ? parseInt(value, 10) : value });
  };

  const validate = () => {
    const formErrors = {} as ErrorProps;
    if ((rules.isEmpty(formValues.customer) || formValues.customer === 0) && isLLAdmin) {
      formErrors.customer = 'Please provide a Customer';
    }

    if (rules.isEmpty(formValues.name)) {
      formErrors.name = 'Please provide an Name';
    }

    if (rules.isEmpty(formValues.status)) {
      formErrors.status = 'Please provide an status';
    }

    setErrors(formErrors);

    return formErrors;
  };

  useEffect(() => {
    if (!isEmpty(errors)) validate();
  }, [formValues]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isEmpty(validate())) {
      if (formValues.id) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        updateClient(formValues.id, formValues).then(() => reload());
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        createClient(formValues).then(() => reload());
      }
    }
  };

  const content = (
    <React.Fragment>
      {isLLAdmin && (
        <FormGroup>
          <Label htmlFor="role">Customer</Label>
          <CustomSelect
            id="customer"
            value={formValues.customer}
            invalid={errors.customer}
            onChange={handleInputChange}
          >
            <option value={0}>Please choose the customer</option>
            {customers.map((item, key) => (<option key={key} value={item.id}>{item.customer_name}</option>))}
          </CustomSelect>
          <Input hidden invalid={errors.customer} />
          <FormFeedback>{errors.customer}</FormFeedback>
        </FormGroup>
      )}
      <FormGroup>
        <Label htmlFor="name">Client Name</Label>
        <Input
          type="text"
          id="name"
          aria-describedby="name"
          value={formValues.name}
          onChange={handleInputChange}
          invalid={errors.name}
        />
        <FormFeedback>{errors.name}</FormFeedback>
      </FormGroup>
      <FormGroup className="mb-0">
        <Label htmlFor="role">Status</Label>
        <div className="w-25">
          <CustomSelect
            value={formValues.status}
            id="status"
            onChange={handleInputChange}
            invalid={errors.status}
          >
            {map(statusTypes, (option, key) => <option key={key} value={option}>{option.toLowerCase().replace(/_/ig, ' ')}</option>)}
          </CustomSelect>
          <FormFeedback>{errors.status}</FormFeedback>
        </div>
      </FormGroup>
    </React.Fragment>
  );

  const closeBtn = <button className="close" onClick={onClose}><i className="ri-close-line" /></button>;
  return (
    <React.Fragment>
      <ModalWindow isOpen={show} size="md" toggle={onClose} centered>
        <ModalHeader toggle={onClose} close={closeBtn}>{title}</ModalHeader>
        <ModalBody>
          {content}
        </ModalBody>
        <ModalFooter>
          <Button color="white" onClick={onClose}>Cancel</Button>
          <Button color="primary" onClick={handleSubmit} disabled={isSubmitting}>Save changes</Button>
        </ModalFooter>
      </ModalWindow>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  isSubmitting: state.client.isSubmitting,
  customers: state.customer.customers,
  currentUser: state.user.currentUser,
});

export default connect(
  mapStateToProps,
  {
    ...actions.client,
    ...actions.customer,
  },
)(ClientModal);
