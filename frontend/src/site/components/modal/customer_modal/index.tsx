import React, { useState, useEffect, FC } from 'react';
import { connect } from 'react-redux';
import { set, isEmpty, omit, cloneDeep } from 'lodash';
import { toast, ToastOptions } from 'react-toastify';
import { Col, Row, Input, FormFeedback, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label } from 'reactstrap';
import styled from 'styled-components';

import { statusTypes, imageCompressOption, toastError, toastOptions } from 'site/constants';
import actions from 'site/actions';
import ImageCompressor from 'image-compressor.js';
import { ImageUpload, PropertyMultiSelect } from 'site/components';

import { rules } from 'site/common/validations';

import '@kenshooui/react-multi-select/dist/style.css';
import { ModalUser as ModalCustomer, NavSteps, NavStepItem, CustomSelect, AvatarPreview } from 'site/components/common';
import { ClientProps, CustomerProps, CustomBlob, UserProps } from 'src/interfaces';

const CustomerAdminLabel = styled(Label)`
  font-size: 14px !important;
`;

const initialUser = {
  email: '',
  phone_number: '',
  first_name: '',
  last_name: '',
  password: '',
  passwordConfirm: '',
  status: statusTypes.ACTIVE,
};

const defaultFormValue = {
  user: initialUser,
  logo: null,
  logoFile: null,
  customer_name: '',
  properties: [],
  clients: [],
};

interface CustomerModalProps {
  customer: CustomerProps,
  customers: CustomerProps[],
  clients: ClientProps[],
  currentUser: UserProps,
  title: string,
  subTitle: string,
  show: boolean,
  onClose: () => null,
  reload: () => null,
  updateCustomerLogo: (id: number, data: FormData) => Promise<null>,
  createCustomer: (data: CustomerProps) => null,
  updateCustomer: (id: number, data: CustomerProps) => null,
  isSubmitting: boolean,
  editStep: number,
}

interface ErrorProps {
  email?: string, firstName?: string, lastName?: string, customerName?: string, logo?: string, password?: string,
  passwordConfirm?: string, status?: string, phone_number?: string, clients?: string,
}

const CustomerModal: FC<CustomerModalProps> = ({ createCustomer, updateCustomerLogo, updateCustomer, isSubmitting, clients, customer, title,
  show, onClose, editStep, currentUser, reload }) => {
  const [formValues, setFormValues] = useState<CustomerProps>(defaultFormValue);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [errors, setErrors] = useState<ErrorProps>({});
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!isEmpty(customer)) {
      setFormValues({ ...customer, user: customer.user.id ? customer.user : initialUser });
    } else {
      setFormValues(cloneDeep(defaultFormValue));
    }
    if (show) {
      setErrors({});
    }
  }, [customer, show]);

  const onCheckboxChange = ({ target: { checked } }) => {
    setPasswordChanged(checked);
  };

  const handleInputChange = ({ target: { id, value } }) => {
    setFormValues(set({ ...formValues }, id, value));
  };

  const validate = () => {
    const { user: { id, email, first_name: firstName, last_name: lastName, password, passwordConfirm, status },
      customer_name: customerName, logo } = formValues;

    const formErrors = {} as ErrorProps;

    if (currentStep === 1) {
      if (rules.isEmpty(email)) {
        formErrors.email = 'Please provide an Email';
      } else if (!rules.isEmpty(email)) {
        if (!rules.isValidEmail(email)) {
          formErrors.email = 'Email address is invalid';
        }
      }

      if (rules.isEmpty(firstName)) {
        formErrors.firstName = 'Please provide a First Name';
      } else if (!rules.isValidName(firstName)) {
        formErrors.firstName = 'First Name is invalid';
      }

      if (rules.isEmpty(lastName)) {
        formErrors.lastName = 'Please provide a Last Name';
      } else if (!rules.isEmpty(lastName)) {
        if (!rules.isValidName(lastName)) {
          formErrors.lastName = 'Last Name is invalid';
        }
      }

      if (rules.isEmpty(customerName)) {
        formErrors.customerName = 'Please provide a Customer Name.';
      }

      if (!logo) {
        formErrors.logo = 'Please upload a Customer Logo.';
      }

      if (!id || passwordChanged) {
        if (rules.isEmpty(password)) {
          formErrors.password = 'Please provide a Password';
        } else if (password !== passwordConfirm) {
          formErrors.passwordConfirm = 'Password is not matching, please check again!';
        }
      }

      if (rules.isEmpty(status)) {
        formErrors.status = 'Please provide a Status';
      }
    }

    setErrors(formErrors);
    return formErrors;
  };

  useEffect(() => {
    if (Object.keys(errors).length) validate();
  }, [formValues]);

  const handleSuccess = () => {
    onClose();
    reload();
    setCurrentStep(1);
  };

  const handleUploadLogo = ({ result: { data: { id } } }) => {
    const { logoFile } = formValues;
    if (logoFile) {
      const formData = new FormData();
      formData.append('logo', logoFile, logoFile.name);
      updateCustomerLogo(id, formData).then(() => handleSuccess());
    }
    handleSuccess();
  };

  const handleSuccessToast = () => {
    toast.success('Managed properties updated', toastOptions as ToastOptions);
  };

  const handleSubmit = () => {
    if (isEmpty(validate())) {
      const logoChanged = formValues.logoFile;
      const newUser = formValues.user ? omit(formValues.user, 'avatar') : null;
      let newCustomer = { ...formValues, user: newUser } as CustomerProps;
      if (logoChanged) {
        newCustomer = { ...newCustomer, logo: formValues.logoFile };
      }
      newCustomer = omit(newCustomer, ['passwordConfirm', 'logoFile', 'logo']);
      if (!passwordChanged && formValues.id) {
        newCustomer = omit(newCustomer, 'password');
      }
      if (formValues.id) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        updateCustomer(formValues.id, newCustomer, editStep === 2 ? handleSuccessToast : null)
          .then((result) => {
            handleUploadLogo(result);
          });
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        createCustomer(newCustomer)
          .then((result) => {
            handleUploadLogo(result);
          });
      }
    }
  };

  const handleFileUpload = (file) => {
    const imageCompressor = new ImageCompressor();
    const blob = new Blob([file[0]], { type: file[0].type }) as CustomBlob;
    blob.name = file[0].name;
    imageCompressor.compress(blob, imageCompressOption)
      .then((result) => {
        setFormValues({ ...formValues, logo: file[0].preview, logoFile: result });
      })
      .catch(() => toast.error('Sorry but we could not compress given image.', toastError as ToastOptions));
  };

  const handleBack = () => {
    if (currentStep === 1 || editStep) {
      onClose();
    } else {
      setCurrentStep(1);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !editStep) {
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

  const dropzoneContainer = () => (
    <div>
      <p>{formValues.logo ? 'Choose another image' : 'Choose image'}</p>
      <p>required formats: png, jpg, gif</p>
    </div>
  );

  const renderCustomerInformation = () => (
    <React.Fragment>
      <Row>
        <Col xs="12">
          <FormGroup>
            <Label for="customer_name">Customer Name</Label>
            <Input
              type="text"
              id="customer_name"
              aria-describedby="customer_name"
              placeholder="Enter name of customer"
              value={formValues.customer_name}
              onChange={handleInputChange}
              invalid={errors.customerName}
            />
            <FormFeedback>{errors.customerName}</FormFeedback>
          </FormGroup>
        </Col>
      </Row>
      <Row><Col xs="12"><hr /></Col></Row>
      <Row><Col xs="12"><CustomerAdminLabel>Customer Admin Account</CustomerAdminLabel></Col></Row>
      <Row>
        <Col xs="6" className="pr-10">
          <FormGroup>
            <Label for="user.first_name">Firstname</Label>
            <Input
              type="text"
              id="user.first_name"
              aria-describedby="first_name"
              placeholder="Enter firstname"
              value={formValues.user.first_name}
              onChange={handleInputChange}
              invalid={errors.firstName}
            />
            <FormFeedback>{errors.firstName}</FormFeedback>
          </FormGroup>
        </Col>
        <Col xs="6" className="pl-10">
          <FormGroup>
            <Label for="user.last_name">Lastname</Label>
            <Input
              type="text"
              id="user.last_name"
              aria-describedby="last_name"
              placeholder="Enter lastname"
              value={formValues.user.last_name}
              onChange={handleInputChange}
              invalid={errors.lastName}
            />
            <FormFeedback>{errors.lastName}</FormFeedback>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col xs="6" className="pr-10">
          <FormGroup>
            <Label for="user.email">Email address</Label>
            <Input
              type="text"
              id="user.email"
              aria-describedby="email"
              placeholder="Enter email address"
              value={formValues.user.email}
              onChange={handleInputChange}
              invalid={errors.email}
            />
            <FormFeedback>{errors.email}</FormFeedback>
          </FormGroup>
        </Col>
        <Col xs="6" className="pl-10">
          <FormGroup>
            <Label for="user.phone_number">Phone number</Label>
            <Input
              type="text"
              id="user.phone_number"
              aria-describedby="phone_number"
              placeholder="Enter phone number"
              value={formValues.user.phone_number}
              onChange={handleInputChange}
            />
            <FormFeedback>{errors.phone_number}</FormFeedback>
          </FormGroup>
        </Col>
      </Row>
      {!formValues.user.id && (
        <Row>
          <Col xs="6" className="pr-10">
            <FormGroup>
              <Label for="user.password">Password</Label>
              <Input
                type="password"
                id="user.password"
                aria-describedby="password"
                placeholder="Enter password"
                value={formValues.user.password}
                onChange={handleInputChange}
                invalid={errors.password}
              />
              <FormFeedback>{errors.password}</FormFeedback>
            </FormGroup>
          </Col>
          <Col xs="6" className="pl-10">
            <FormGroup>
              <Label for="user.passwordConfirm">Password Confirmation</Label>
              <Input
                type="password"
                id="user.passwordConfirm"
                aria-describedby="password_confirm"
                placeholder="Re-enter password"
                value={formValues.user.passwordConfirm}
                onChange={handleInputChange}
                invalid={errors.passwordConfirm}
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
            <CustomSelect
              value={formValues.user.status}
              id="user.status"
              onChange={handleInputChange}
              className={errors.status ? 'is-invalid form-control' : ''}
            >
              {Object.keys(statusTypes).map((type, key) => <option key={key} value={type} defaultValue={formValues.user.status}>{type.toLowerCase().replace(/_/ig, ' ')}</option>)}
            </CustomSelect>
            <FormFeedback>{errors.status}</FormFeedback>
          </FormGroup>
        </Col>
        <Col xs="6 d-flex align-items-center" className="pl-10">
          <FormGroup>
            <Label htmlFor="status">
              Customer logo
            </Label>
            <Row className="mt-0">
              <AvatarPreview>
                <img src={formValues.logo as string || '/static/images/no-image.jpg'} alt="breadcrumbs" />
              </AvatarPreview>
              <ImageUpload onDropAccepted={e => handleFileUpload(e)} title="Upload Image" dropzoneClassname="image-uploader image-uploader-avatar" dropzoneContainer={dropzoneContainer} />
              <Col xs="12">
                <Input invalid={errors.logo} hidden />
                <FormFeedback>{errors.logo}</FormFeedback>
              </Col>
            </Row>
          </FormGroup>
        </Col>
      </Row>
      {formValues.user.id && (
        <FormGroup className="mt-0 mb-0">
          <input checked={passwordChanged} type="checkbox" id="checkbox" onChange={onCheckboxChange} className="mr-2" />
          <span className="w-100 uppercase">Change Password</span>
        </FormGroup>
      )}
      {passwordChanged && (
        <Row className="mt-3">
          <Col xs="6" className="pr-10">
            <FormGroup>
              <Label for="user.password">Password</Label>
              <Input
                type="password"
                id="user.password"
                aria-describedby="password"
                placeholder="Enter password"
                value={formValues.user.password}
                onChange={handleInputChange}
                invalid={errors.password}
              />
              <FormFeedback>{errors.password}</FormFeedback>
            </FormGroup>
          </Col>
          <Col xs="6" className="pl-10">
            <FormGroup>
              <Label for="user.passwordConfirm">Password Confirmation</Label>
              <Input
                type="password"
                id="user.passwordConfirm"
                aria-describedby="password_confirm"
                placeholder="Re-enter password"
                value={formValues.user.passwordConfirm}
                onChange={handleInputChange}
                invalid={errors.passwordConfirm}
              />
              <FormFeedback>{errors.passwordConfirm}</FormFeedback>
            </FormGroup>
          </Col>
        </Row>)
      }
    </React.Fragment>
  );

  let filteredClients = [];
  if (formValues.id) {
    filteredClients = clients.filter(client => !client.customer || client.customer === formValues.id);
  } else {
    filteredClients = clients.filter(client => !client.customer);
  }

  const renderCustomerAccessRights = () => (
    <Row>
      <Col xs="12">
        <PropertyMultiSelect
          handleInputChange={data => setFormValues({ ...formValues, ...data })}
          clients={filteredClients}
          record={formValues}
          isMyAccount={currentUser.id === formValues.user.id}
          isCustomer
        />
        <Input invalid={errors.clients} hidden />
        <FormFeedback>{errors.clients}</FormFeedback>
      </Col>
    </Row>
  );

  const content = (
    <React.Fragment>
      {!editStep &&
        <NavSteps className="mb-4">
          <NavStepItem done={currentStep > 1} active={currentStep === 1}>
            <span>1</span>
            Customer Information
          </NavStepItem>
          <NavStepItem active={currentStep === 2}>
            <span>2</span>
            Customer Access Rights
          </NavStepItem>
        </NavSteps>}
      {currentStep === 1 && editStep !== 2 ? renderCustomerInformation() : renderCustomerAccessRights()}
    </React.Fragment>
  );
  const hasErrorsOnFirstStep = Object.keys(errors).filter(i => ['clients', 'properties'].includes(i)).includes[''];
  const hasErrorsOnSecondStep = Object.keys(errors).filter(i => ['clients', 'properties'].includes(i)).includes[''];
  const hasError = currentStep === 1 ? hasErrorsOnFirstStep : hasErrorsOnSecondStep;

  const closeBtn = <button className="close" onClick={onClose}><i className="ri-close-line" /></button>;
  return (
    <React.Fragment>
      <ModalCustomer isOpen={show} size="lg" toggle={handleClose} step={currentStep} centered>
        <ModalHeader toggle={handleClose} close={closeBtn}>{title}</ModalHeader>
        <ModalBody>
          {content}
        </ModalBody>
        <ModalFooter>
          <Button color="white" onClick={handleBack}>{currentStep === 1 || editStep ? 'Cancel' : 'Back'}</Button>
          <Button color="primary" onClick={handleNext} disabled={hasError || isSubmitting}>{currentStep === 1 && !editStep ? 'Save and Continue' : 'Save Customer'}</Button>
        </ModalFooter>
      </ModalCustomer>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  isSubmitting: state.customer.isSubmitting,
  clients: state.client.clients,
  currentUser: state.user.currentUser,
  customers: state.customer.customers,
});

export default connect(
  mapStateToProps,
  {
    ...actions.customer,
  },
)(CustomerModal);
