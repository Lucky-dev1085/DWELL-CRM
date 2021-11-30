/* eslint-disable jsx-a11y/label-has-for */
import React, { useState, useEffect, FC } from 'react';
import { connect } from 'react-redux';
import { isEmpty, omit } from 'lodash';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { toast, ToastOptions } from 'react-toastify';
import { Input, FormFeedback, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Col, Row } from 'reactstrap';

import { statusTypes, roleTypes, toastOptions, roleChoices } from 'site/constants';
import actions from 'site/actions';
import dwellActions from 'dwell/actions';
import { PropertyMultiSelect, SelectCustom } from 'site/components';
import { rules } from 'site/common/validations';
import { DetailResponse, UserProps, ClientProps, CustomerProps } from 'src/interfaces';

import '@kenshooui/react-multi-select/dist/style.css';

import { ModalUser, NavSteps, NavStepItem } from 'site/components/common';

const initialUser = {
  client: '',
  email: '',
  phone_number: '',
  first_name: '',
  last_name: '',
  password: '',
  passwordConfirm: '',
  role: roleTypes.GENERIC_ADMIN,
  status: statusTypes.ACTIVE,
  customer: null,
  clients: [],
  properties: [],
};

interface FormError {
  firstName?: string,
  email?: string,
  lastName?: string,
  password?: string,
  passwordConfirm?: string,
  status?: string,
  role?: string,
  clients?: string,
  customer?: string,
  phone_number?: string,
}

interface UserModal extends RouteComponentProps {
  createUser: (data: UserProps) => Promise<DetailResponse>,
  isSubmitting: boolean,
  clients: ClientProps[],
  customers?: CustomerProps[],
  currentUser?: UserProps,
  user: UserProps,
  reload: () => void,
  title: string,
  show: boolean,
  onClose: () => void,
  editStep?: number,
  updateUser: (id: number, data: UserProps, func: () => void) => Promise<DetailResponse>,
}

const UserModal: FC<UserModal> = ({ user: userProps, clients, customers, currentUser, isSubmitting, onClose, title, show, updateUser, createUser, reload, editStep }) => {
  const [user, setUser] = useState(initialUser as UserProps);
  const [errors, setErrors] = useState({} as FormError);
  const [passwordChange, setPasswordChange] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  let availableRole = Object.keys(roleTypes);
  if (currentUser.role === roleTypes.CUSTOMER_ADMIN) availableRole = [roleTypes.PROPERTY_ADMIN, roleTypes.GENERIC_ADMIN, roleTypes.CUSTOMER_ADMIN];
  if (currentUser.role === roleTypes.PROPERTY_ADMIN) availableRole = [roleTypes.PROPERTY_ADMIN, roleTypes.GENERIC_ADMIN];
  if (currentUser.role === roleTypes.GENERIC_ADMIN) availableRole = [roleTypes.GENERIC_ADMIN];
  const availableRoles = availableRole.map(type => ({ value: type, label: roleChoices[type] }));

  let availableClients = clients;
  if (currentUser.role === roleTypes.LIFT_LYTICS_ADMIN && user.role !== roleTypes.LIFT_LYTICS_ADMIN) {
    const customer = customers.find(item => item.id.toString() === (user.customer && user.customer.toString()));
    availableClients = customer ? clients.filter(client => customer.clients.includes(client.id)) : [];
  }
  let properties = [];
  const enableSecondStep = ![roleTypes.LIFT_LYTICS_ADMIN, roleTypes.CUSTOMER_ADMIN].includes(user.role);

  availableClients.forEach((client) => {
    properties = properties.concat(client.properties);
  });

  useEffect(() => {
    if (!isEmpty(userProps)) {
      setUser({ ...userProps });
    } else {
      setPasswordChange(false);
      setUser(initialUser as UserProps);
      setErrors({});
    }
  }, [userProps, customers, clients]);

  const customerFieldRequired = [roleTypes.GENERIC_ADMIN, roleTypes.CUSTOMER_ADMIN, roleTypes.PROPERTY_ADMIN].includes(user.role)
    && currentUser.role === roleTypes.LIFT_LYTICS_ADMIN;

  const validate = () => {
    const { email, first_name: firstName, last_name: lastName, password, passwordConfirm, status, role, id, customer } = user;

    const errorValues = {} as FormError;

    if (currentStep === 1) {
      if (rules.isEmpty(email)) {
        errorValues.email = 'Please provide an Email';
      } else if (!rules.isEmpty(email)) {
        if (!rules.isValidEmail(email)) {
          errorValues.email = 'Email address is invalid';
        }
      }

      if (rules.isEmpty(firstName)) {
        errorValues.firstName = 'Please provide a First Name';
      } else if (!rules.isValidName(firstName)) {
        errorValues.firstName = 'First Name is invalid';
      }

      if (rules.isEmpty(lastName)) {
        errorValues.lastName = 'Please provide a Last Name';
      } else if (!rules.isEmpty(lastName)) {
        if (!rules.isValidName(lastName)) {
          errorValues.lastName = 'Last Name is invalid';
        }
      }

      if (passwordChange || !id) {
        if (rules.isEmpty(password)) {
          errorValues.password = 'Please provide a password';
        } else if (password !== passwordConfirm) {
          errorValues.passwordConfirm = 'Password is not matching, please check again!';
        }
      }

      if (rules.isEmpty(status)) {
        errorValues.status = 'Please provide a Status';
      }

      if (rules.isEmpty(role)) {
        errorValues.role = 'Please provide a Role';
      }

      if (customerFieldRequired && rules.isEmpty(customer) && role === roleTypes.CUSTOMER_ADMIN) {
        errorValues.customer = 'Please choose a customer';
      }
    } else {
      if (!user.clients.length || !user.properties.length) {
        errorValues.clients = 'Please choose at least one Client and Property';
      }

      if (customerFieldRequired && rules.isEmpty(customer)) {
        errorValues.customer = 'Please choose a customer';
      }
    }

    setErrors(errorValues);
    return errorValues;
  };

  useEffect(() => {
    if (!isEmpty(errors)) validate();
  }, [user]);

  const handleInputChange = ({ target: { id, value } }) => {
    let newUser = { ...user };
    if (id === 'customer') {
      newUser = { ...newUser, clients: [], properties: [] };
    }
    setUser({ ...newUser, [id]: value });
  };

  const handleSuccessToast = () => {
    toast.success('User access rights updated', toastOptions as ToastOptions);
  };

  const handleSubmit = () => {
    if (isEmpty(validate())) {
      let newUser = { ...user };
      newUser = omit(newUser, ['passwordConfirm', 'avatar']);
      if (!passwordChange && user.id) {
        newUser = omit(newUser, ['password', 'passwordConfirm']);
      }
      if (currentUser.role !== roleTypes.LIFT_LYTICS_ADMIN) {
        newUser = { ...newUser, customer: currentUser.customer };
      }

      if (user.id) {
        if (user.role === roleTypes.GENERIC_ADMIN) {
          const availableClientIds = availableClients.map(i => i.id);
          const availablePropertyIds = properties.map(i => i.id);
          newUser = {
            ...newUser,
            clients: newUser.clients.filter(i => availableClientIds.includes(i)),
            properties: newUser.properties.filter(i => availablePropertyIds.includes(i)),
          };
        }
        updateUser(user.id, newUser, editStep === 2 ? handleSuccessToast : null)
          .then(() => {
            reload();
            setCurrentStep(1);
          });
      } else {
        createUser(newUser)
          .then(() => {
            reload();
            setCurrentStep(1);
          });
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 1 || editStep) {
      onClose();
    } else {
      setCurrentStep(1);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !editStep && enableSecondStep) {
      if (isEmpty(validate())) {
        setCurrentStep(2);
      }
    } else {
      handleSubmit();
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    onClose();
  };

  const renderUserInformation = () => (
    <React.Fragment>
      <Row>
        <Col xs="6" className="pr-10">
          <FormGroup>
            <Label for="first_name">Firstname</Label>
            <Input
              type="text"
              id="first_name"
              aria-describedby="first_name"
              placeholder="Enter firstname"
              value={user.first_name}
              invalid={errors.firstName}
              onChange={handleInputChange}
            />
            <FormFeedback>{errors.firstName}</FormFeedback>
          </FormGroup>
        </Col>
        <Col xs="6" className="pl-10">
          <FormGroup>
            <Label for="last_name">Lastname</Label>
            <Input
              type="text"
              id="last_name"
              aria-describedby="last_name"
              placeholder="Enter lastname"
              value={user.last_name}
              invalid={errors.lastName}
              onChange={handleInputChange}
            />
            <FormFeedback>{errors.lastName}</FormFeedback>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col xs="6" className="pr-10">
          <FormGroup>
            <Label for="email">Email address</Label>
            <Input
              type="text"
              id="email"
              aria-describedby="email"
              placeholder="Enter email address"
              value={user.email}
              invalid={errors.email}
              onChange={handleInputChange}
              disabled={editStep && user.role === roleTypes.LIFT_LYTICS_ADMIN}
            />
            <FormFeedback>{errors.email}</FormFeedback>
          </FormGroup>
        </Col>
        <Col xs="6" className="pl-10">
          <FormGroup>
            <Label for="phone_number">Phone number</Label>
            <Input
              type="text"
              id="phone_number"
              aria-describedby="phone_number"
              placeholder="Enter phone number"
              value={user.phone_number}
              invalid={errors.phone_number}
              onChange={handleInputChange}
            />
            <FormFeedback>{errors.phone_number}</FormFeedback>
          </FormGroup>
        </Col>
      </Row>

      {!user.id && (
        <Row>
          <Col xs="6" className="pr-10">
            <FormGroup>
              <Label for="password">Password</Label>
              <Input
                type="password"
                id="password"
                aria-describedby="password"
                placeholder="Enter password"
                value={user.password}
                invalid={errors.password}
                onChange={handleInputChange}
              />
              <FormFeedback>{errors.password}</FormFeedback>
            </FormGroup>
          </Col>
          <Col xs="6" className="pl-10">
            <FormGroup>
              <Label for="passwordConfirm">Password Confirmation</Label>
              <Input
                type="password"
                id="passwordConfirm"
                aria-describedby="password_confirm"
                placeholder="Re-enter password"
                value={user.passwordConfirm}
                invalid={errors.passwordConfirm}
                onChange={handleInputChange}
              />
              <FormFeedback>{errors.passwordConfirm}</FormFeedback>
            </FormGroup>
          </Col>
        </Row>)
      }
      <Row>
        <Col xs="6" className="pr-10">
          <FormGroup className="mb-0">
            <Label>Status</Label>
            <SelectCustom
              value={user.status}
              options={statusTypes}
              id="status"
              placeholderDisplay={!user.id && !user.status}
              handleInputChange={handleInputChange}
              errorMsg={errors.status}
            />
          </FormGroup>
        </Col>
        <Col xs="6" className="pl-10">
          <FormGroup className="mb-0">
            <Label>Role</Label>
            <SelectCustom
              value={user.role}
              options={availableRoles}
              optionValue="value"
              optionLabel="label"
              id="role"
              placeholderDisplay={!user.id && !user.role}
              handleInputChange={handleInputChange}
              errorMsg={errors.role}
            />
          </FormGroup>
        </Col>
      </Row>
      {currentUser.role === roleTypes.LIFT_LYTICS_ADMIN && user.role === roleTypes.CUSTOMER_ADMIN && (
        <Row className="mb-5">
          <Col xs="6" className="pr-10">
            <FormGroup>
              <Label>Customer</Label>
              {currentUser.role === roleTypes.LIFT_LYTICS_ADMIN ?
                <SelectCustom
                  value={user.customer}
                  optionValue="id"
                  optionLabel="customer_name"
                  options={customers}
                  id="customer"
                  handleInputChange={handleInputChange}
                  errorMsg={errors.customer}
                  placeholderLabel="-- Select A Customer -- "
                  placeholderDisplay
                />
                :
                <Input value={user.id ? user.customer_name : currentUser.customer_name} disabled />
              }
            </FormGroup>
          </Col>
        </Row>
      )}
      <Row className="mb-5">
        <Col xs="12">
          {user.id && (
            <FormGroup className="mt-3 mb-0">
              <input checked={passwordChange} type="checkbox" id="checkbox" onChange={({ target: { checked } }) => setPasswordChange(checked)} className="mr-2" />
              <span className="w-100 uppercase">Change Password</span>
            </FormGroup>
          )}
        </Col>
      </Row>
      {passwordChange && (
        <Row>
          <Col xs="6" className="pr-10">
            <FormGroup>
              <Label for="password">Password</Label>
              <Input
                type="password"
                id="password"
                aria-describedby="password"
                placeholder="Enter password"
                value={user.password}
                invalid={errors.password}
                onChange={handleInputChange}
              />
              <FormFeedback>{errors.password}</FormFeedback>
            </FormGroup>
          </Col>
          <Col xs="6" className="pl-10">
            <FormGroup>
              <Label for="passwordConfirm">Password Confirmation</Label>
              <Input
                type="password"
                id="passwordConfirm"
                aria-describedby="password_confirm"
                placeholder="Re-enter password"
                value={user.passwordConfirm}
                invalid={errors.passwordConfirm}
                onChange={handleInputChange}
              />
              <FormFeedback>{errors.passwordConfirm}</FormFeedback>
            </FormGroup>
          </Col>
        </Row>)
      }
    </React.Fragment>);

  const renderUserAccessRights = () => (
    <Row>
      <Col xs="12">
        <FormGroup>
          <Label>Customer</Label>
          {currentUser.role === roleTypes.LIFT_LYTICS_ADMIN ?
            <SelectCustom
              value={user.customer}
              optionValue="id"
              optionLabel="customer_name"
              options={customers}
              id="customer"
              handleInputChange={handleInputChange}
              errorMsg={errors.customer}
              placeholderLabel="-- Select A Customer -- "
              placeholderDisplay
            />
            :
            <Input value={user.id ? user.customer_name : currentUser.customer_name} disabled />
          }
        </FormGroup>
      </Col>
      <Col xs="12">
        <PropertyMultiSelect
          handleInputChange={data => setUser({ ...user, ...data })}
          clients={availableClients}
          record={{ clients: user.clients, properties: user.properties }}
          isMyAccount={currentUser.id === user.id}
        />
        <Input invalid={errors.clients} hidden />
        <FormFeedback>{errors.clients}</FormFeedback>
      </Col>
    </Row>
  );

  const content = (
    <React.Fragment>
      {!editStep && enableSecondStep &&
        <NavSteps className="mb-4">
          <NavStepItem done={currentStep > 1} active={currentStep === 1}>
            <span>1</span>
            User Information
          </NavStepItem>
          <NavStepItem active={currentStep === 2}>
            <span>2</span>
            User Access Rights
          </NavStepItem>
        </NavSteps>
      }
      {currentStep === 1 && editStep !== 2 ? renderUserInformation() : renderUserAccessRights()}
    </React.Fragment>
  );

  const closeBtn = <button className="close" onClick={onClose}><i className="ri-close-line" /></button>;
  return (
    <React.Fragment>
      <ModalUser isOpen={show} toggle={handleClose} step={editStep || currentStep} centered>
        <ModalHeader toggle={handleClose} close={closeBtn}>
          {title}
        </ModalHeader>
        <ModalBody>
          {content}
        </ModalBody>
        <ModalFooter>
          <Button color="white" onClick={handleBack}>{currentStep === 1 || editStep ? 'Cancel' : 'Back'}</Button>
          <Button color="primary" onClick={handleNext} disabled={isSubmitting}>
            {currentStep === 1 && !editStep && enableSecondStep ? 'Save and Continue' : 'Save User'}
          </Button>
        </ModalFooter>
      </ModalUser>
    </React.Fragment>
  );
};

UserModal.defaultProps = {
  customers: [],
  currentUser: {},
  editStep: null,
};

const mapStateToProps = state => ({
  isSubmitting: state.user.isSubmitting,
  clients: state.client.clients,
  currentUser: state.user.currentUser,
  customers: state.customer.customers,
});

export default connect(
  mapStateToProps,
  {
    ...actions.client,
    ...dwellActions.user,
    ...actions.customer,
  },
)(withRouter(UserModal));
