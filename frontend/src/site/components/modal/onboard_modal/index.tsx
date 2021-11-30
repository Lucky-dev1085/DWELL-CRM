import React, { useState, useEffect, FC } from 'react';
import { connect } from 'react-redux';
import { set, isEmpty, cloneDeep, isEqual } from 'lodash';
import { toast, ToastOptions } from 'react-toastify';
import { Button, ModalBody, ModalFooter, ModalHeader, Row, Col, Label } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop } from '@fortawesome/free-solid-svg-icons/faDesktop';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import actions from 'site/actions';
import { roleTypes, toastError, toastOptions } from 'site/constants';
import { ModalClient, NavSteps } from 'site/components/common';
import { UserProps, PropertyProps, CustomerProps, ClientProps, OnboardResponse } from 'src/interfaces';
import CustomerForm from './_customerForm';
import ClientForm from './_clientForm';
import UserForm from './_userForm';
import PropertyForm from './_propertyForm';
import ConfirmationForm from './_confirmationForm';
import { NavStepItem, ModalSubTitle } from './styles';

const initialValue = {
  customer: {
    id: null,
  },
  client: {
    useExisting: 'true',
    id: null,
    name: '',
    status: 'ACTIVE',
  },
  property: {
    domain: '',
    name: '',
    status: 'ACTIVE',
  },
  user: {
    ids: [],
  },
};

interface OnboardModalProps {
  customers: UserProps[],
  clients: Array<ClientProps>,
  currentUser: UserProps,
  title: string,
  subTitle: string,
  source: string,
  show: boolean,
  onClose: () => null,
  reload: () => null,
  onboard: (data: { property: PropertyProps, customer: CustomerProps, client: ClientProps, user: { ids: number[] } }) => OnboardResponse,
  getCustomers: (data: { show_all: boolean }) => null,
  updateCustomerLogo: (id: number, data: FormData) => null,
  onChange: (data: { target: { id: string, value: string | number } }) => null,
}

const OnboardModal: FC<OnboardModalProps> = ({ getCustomers, title, show, onClose, source, subTitle, currentUser, onboard, reload, customers, clients }) => {
  const isLLAdmin = [roleTypes.LIFT_LYTICS_ADMIN].includes(currentUser.role);
  let stepsList = ['Customer', 'Client', 'Property', 'User', 'Confirmation'];
  if (!isLLAdmin) stepsList = stepsList.slice(1, 5);

  const [formValues, setFormValues] = useState<{ customer: CustomerProps, user: { ids: number[] }, property: PropertyProps, client: ClientProps}>({ ...initialValue });
  const [errors, setErrors] = useState({});
  const [userSkipped, setUserSkip] = useState(false);
  const [propertySkipped, setPropertySkip] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    let customerId = null;
    if (isLLAdmin) {
      getCustomers({ show_all: true });
    }
    if ([roleTypes.CUSTOMER_ADMIN].includes(currentUser.role)) {
      customerId = currentUser.customer;
    }
    setFormValues({ ...initialValue, customer: { id: customerId } });
    setStep(0);
  }, []);

  const validateField = (field, value) => {
    let error = null;
    const domainReg = new RegExp(/^((?:(?:(?:\w[.\-+]?)*)\w)+)((?:(?:(?:\w[.\-+]?){0,62})\w)+)\.(\w{2,6})$/);
    switch (field) {
      case 'id':
        // eslint-disable-next-line
        if (!parseInt(value, 0)) error = 'Please choose the value.';
        break;
      case 'domain':
        if (!value) {
          error = 'Please provide an value';
        } else if (!value.match(domainReg)) {
          error = 'Domain name is invalid';
        }
        break;
      default:
        if (!value) error = 'Please provide an value';
        break;
    }
    return error;
  };

  const handleInputChange = ({ target: { id, value } }, type) => {
    const { customer, client, user, property } = formValues;
    let newState;
    switch (type) {
      case 'customer':
      default:
        newState = { customer: set(cloneDeep(customer), id, parseInt(value, 10)) };
        break;
      case 'client':
        newState = { client: set(cloneDeep(client), id, value) };
        break;
      case 'user':
        newState = { user: set(cloneDeep(user), id, value) };
        break;
      case 'property':
        newState = { property: set(cloneDeep(property), id, value) };
        break;
    }
    setFormValues({ ...formValues, ...newState });
  };

  const validate = () => {
    const { customer, client, user, property } = formValues;

    let formErrors: { [p: string]: string } = {
      id: undefined,
    };

    switch (stepsList[step]) {
      case 'Customer':
      default:
        formErrors.id = validateField('id', customer.id);
        break;
      case 'Client':
        if (client.useExisting === 'true' && source !== 'client' && customer.id) {
          formErrors.id = validateField('id', client.id);
        } else {
          Object.keys(client).forEach((field) => {
            if (field !== 'id') formErrors[field] = validateField(field, client[field]);
          });
        }
        break;
      case 'User':
        formErrors.ids = !user.ids.length && 'Please choose the users.';
        break;
      case 'Property':
        Object.keys(property).forEach((field) => {
          formErrors[field] = validateField(field, property[field]);
        });
        break;
      case 'Confirmation':
        break;
    }
    formErrors = Object.keys(formErrors).filter(item => !!formErrors[item]).reduce((prev, item) => ({ ...prev, [item]: formErrors[item] }), {});
    setErrors(formErrors);

    return formErrors;
  };

  const handleSubmit = async () => {
    try {
      await onboard(formValues);
      toast.success('Onboarded', toastOptions as ToastOptions);
      setIsSubmitting(false);
      reload();
      onClose();
    } catch (e) {
      toast.error('Sorry! Something wrong happened. Please try again.', toastError as ToastOptions);
      setIsSubmitting(false);
    }
  };

  const handleNext = (event, skip = false) => {
    event.preventDefault();

    if (stepsList[step] === 'User' && skip) setUserSkip(true);
    if (stepsList[step] === 'Property' && skip) setPropertySkip(true);
    let valid = true;
    if (!skip) {
      valid = isEmpty(validate());
    }
    if (valid) {
      if (step === stepsList.length - 1) {
        setIsSubmitting(true);
        setTimeout(handleSubmit, 1500);
      } else {
        setFormValues({ ...formValues });
        setStep(step + 1);
      }
    }
  };

  const handleBack = (event) => {
    event.preventDefault();
    setStep(step - 1);
  };

  const Stepper = s => (
    <Row>
      <Col xs="12">
        <NavSteps className="my-3">
          {isLLAdmin ? <NavStepItem done={step > 0} active={s === 0}><span>1</span>Customer</NavStepItem> : null}
          <NavStepItem done={s > 1} active={s === 1}>
            <span>{2 - Number(!isLLAdmin)}</span>
            Client
          </NavStepItem>
          <NavStepItem done={s > 2} active={s === 2}>
            <span>{3 - Number(!isLLAdmin)}</span>
            Property
          </NavStepItem>
          <NavStepItem done={s > 3} active={s === 3}>
            <span>{4 - Number(!isLLAdmin)}</span>
            User
          </NavStepItem>
          <NavStepItem done={s > 4} active={s === 4}>
            <span>{5 - Number(!isLLAdmin)}</span>
            Confirmation
          </NavStepItem>
        </NavSteps>
      </Col>
    </Row>
  );

  const { customer, client, user, property } = formValues;

  let content = <CustomerForm customer={customer} errors={errors} onChange={data => handleInputChange(data, 'customer')} />;
  let hasChanged = false;
  let stepDescription = '';
  switch (stepsList[step]) {
    case 'Customer':
    default:
      stepDescription = 'Please provide customer information';
      hasChanged = !isEqual(customer, initialValue.customer);
      content = <CustomerForm customer={customer} errors={errors} onChange={data => handleInputChange(data, 'customer')} />;
      break;
    case 'Client':
      stepDescription = 'Please provide client information';
      hasChanged = !isEqual(client, initialValue.client);
      content = (<ClientForm
        client={client}
        errors={errors}
        onChange={data => handleInputChange(data, 'client')}
        shouldNotAllowExisting={source === 'client' || !customer.id}
        whitelistClients={isLLAdmin ? (customers.find(i => i.id === customer.id).clients || []) : clients.map(i => i.id)}
        hasChanged={hasChanged}
      />);
      break;
    case 'User':
      stepDescription = 'Select users who will have access to this property';
      hasChanged = !isEqual(user, initialValue.user);
      content = <UserForm user={user} customerId={customer.id} errors={errors} onChange={data => handleInputChange(data, 'user')} />;
      break;
    case 'Property':
      stepDescription = 'Please provide new property information';
      hasChanged = !isEqual(property, initialValue.property);
      content = <PropertyForm property={property} errors={errors} onChange={data => handleInputChange(data, 'property')} hasChanged={hasChanged} />;
      break;
    case 'Confirmation':
      hasChanged = true;
      content = <ConfirmationForm customer={customer} property={property} user={user} client={client} source={source} userSkipped={userSkipped} propertySkipped={propertySkipped} />;
      break;
  }

  const closeBtn = <button className="close" onClick={onClose}><i className="ri-close-line" /></button>;
  return (
    <React.Fragment>
      <ModalClient isOpen={show} size="md" toggle={onClose} centered id="onboard-modal">
        {isSubmitting ? (
          <ModalBody className="text-center p-5">
            <div style={{ color: 'gray' }} className="mt-1 mb-5">
              <FontAwesomeIcon icon={faDesktop} size="3x" />
            </div>
            <div className="font-2xl mt-2 mb-1">Getting your environment ready</div>
            <div style={{ color: 'gray' }}>Just a moment while we create and populate your new property.</div>
            <div style={{ color: '#0096FF' }} className="mt-5 mb-5">
              <FontAwesomeIcon icon={faSpinner} size="2x" spin />
            </div>
          </ModalBody>
        ) :
          (
            <React.Fragment>
              <ModalHeader toggle={onClose} close={closeBtn}>{title}</ModalHeader>
              <ModalBody>
                <ModalSubTitle>{subTitle}</ModalSubTitle>
                {Stepper(isLLAdmin ? step : step + 1)}
                {(step === stepsList.length - 1) ? <div className="mt-3">{content}</div> : (
                  <div className="mt-3">
                    <Label>{stepDescription}</Label>
                    {content}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                {((source === 'client' && ['User', 'Property'].includes(stepsList[step])) || (source === 'property' && stepsList[step] === 'User')) ? (
                  <Button color="white" style={{ marginRight: 'auto' }} onClick={event => handleNext(event, true)}>Skip</Button>
                ) : null}
                {step !== 0 ? (
                  <Button color="white" onClick={handleBack}>Back</Button>
                ) : <Button color="white" onClick={onClose}>Cancel</Button>
                }
                <Button color={hasChanged ? 'primary' : 'secondary'} disabled={!hasChanged} onClick={handleNext}>
                  {(step === stepsList.length - 1) ? 'Submit' : 'Save and Continue'}
                </Button>
              </ModalFooter>
            </React.Fragment>
          )}
      </ModalClient>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  clients: state.client.clients,
  users: state.client.users,
  customers: state.customer.customers,
  isClientDataLoaded: state.property.isPropertyDataLoaded,
  currentUser: state.user.currentUser,
});

export default connect(
  mapStateToProps,
  {
    ...actions.customer,
  },
)(OnboardModal);
