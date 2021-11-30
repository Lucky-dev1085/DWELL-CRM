import React, { useState, useEffect, FC } from 'react';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { statusTypes } from 'site/constants';
import dwellActions from 'dwell/actions';
import actions from 'site/actions';
import { Button, FormFeedback, Input, ModalBody, ModalFooter, ModalHeader, FormGroup, Label, Col, Row } from 'reactstrap';
import { rules } from 'site/common/validations';
import { AvatarPreview } from 'site/components/common';
import { ImageUpload, SelectCustom } from 'site/components';
import { DetailResponse, ClientProps, CustomerProps, PropertyProps } from 'src/interfaces';
import { ModalWindow, UploadImageText } from 'site/components/modal/property_modal/styles';
import { handleFileUpload } from 'site/common/fileUpload';

const initialState = {
  domain: '',
  name: '',
  client: '',
  status: 'ACTIVE',
  client_id: null,
  oldDomain: '',
  logo: '',
};

interface FormError {
  domain?: string,
  name?: string,
  status?: string,
  client?: string,
  logo?: string,
}

interface PropertyModal extends RouteComponentProps {
  createProperty: (data: PropertyProps) => Promise<DetailResponse>,
  isSubmitting: boolean,
  clients: ClientProps[],
  customers?: CustomerProps[],
  reload: () => void,
  title: string,
  show: boolean,
  isClientDataLoaded: boolean,
  onClose: () => void,
  uploadImage: (image: Blob, successCB?: (response: { data: { url } }) => void) => void,
  updateProperty: (id: number, data: PropertyProps) => Promise<DetailResponse>,
  property: PropertyProps,
}

const PropertyModal: FC<PropertyModal> = ({ createProperty, isSubmitting, property, customers, clients, isClientDataLoaded, updateProperty, reload, title,
  show, onClose, uploadImage }) => {
  const [formValues, setFormValues] = useState(initialState as PropertyProps);
  const [errors, setErrors] = useState({} as FormError);

  useEffect(() => {
    if (!isEmpty(property)) {
      setFormValues({ ...property });
    } else {
      setFormValues(initialState);
    }
  }, [property]);

  const handleInputChange = ({ target: { id, value } }) => {
    setFormValues({ ...formValues, [id]: value });
  };

  const validate = () => {
    const { domain, name, status, client_id: clientId } = formValues;

    const formErrors = {} as FormError;

    if (rules.isEmpty(domain)) {
      formErrors.domain = 'Please provide an Domain';
    }
    if (rules.isEmpty(name)) {
      formErrors.name = 'Please provide an Name';
    }
    if (rules.isEmpty(status)) {
      formErrors.status = 'Please provide an status';
    }
    if (rules.isEmpty(clientId)) {
      formErrors.client = 'Please provide an client';
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
        updateProperty(formValues.id, formValues).then(reload);
      } else {
        createProperty(formValues).then(reload);
      }
    }
  };

  const fileUploadSuccessCB = ({ data: { url } }) => {
    setFormValues({ ...formValues, logo: url });
  };

  const dropzoneContainer = () => (
    <div>
      <UploadImageText>{formValues.logo ? 'Choose another image' : 'Choose image'}</UploadImageText>
      <p>required formats: png, jpg, gif</p>
    </div>
  );

  const availableClients = (customers.find(i => i.id === formValues.customer) || {}).clients || [];
  let clientSelect = null;

  if (isClientDataLoaded || !formValues.id) {
    clientSelect = (
      <FormGroup>
        <Label htmlFor="client">Client</Label>
        <SelectCustom
          value={formValues.client_id}
          optionValue="id"
          optionLabel="name"
          options={clients.filter(i => availableClients.includes(i.id))}
          id="client_id"
          placeholderDisplay={!formValues.id}
          handleInputChange={handleInputChange}
          errorMsg={errors.client}
        />
      </FormGroup >
    );
  }

  const content = (
    <form onSubmit={handleSubmit}>
      <FormGroup>
        <Label htmlFor="domain">Domain</Label>
        <Input
          type="text"
          id="domain"
          aria-describedby="domain"
          value={formValues.domain}
          onChange={handleInputChange}
          invalid={errors.domain}
        />
        <FormFeedback>{errors.domain}</FormFeedback>
      </FormGroup>
      {clientSelect}
      <FormGroup>
        <Label htmlFor="name">Property Name</Label>
        <Input
          type="text"
          id="name"
          aria-describedby="name"
          value={formValues.name}
          invalid={errors.name}
          onChange={handleInputChange}
        />
        <FormFeedback>{errors.name}</FormFeedback>
      </FormGroup>
      <Row>
        <Col xs="6" className="pr-10">
          <FormGroup className="mb-0">
            <Label htmlFor="role">Status </Label>
            <SelectCustom
              value={formValues.status}
              options={statusTypes}
              id="status"
              placeholderDisplay={!formValues.id}
              handleInputChange={handleInputChange}
              errorMsg={errors.status}
            />
          </FormGroup>
        </Col>
        <Col xs="6" className="pl-10">
          <FormGroup>
            <Label htmlFor="status">
              Property logo
            </Label>
            <Row className="mt-0">
              <AvatarPreview>
                <img src={formValues.logo || '/static/images/no-image.jpg'} alt="breadcrumbs" />
              </AvatarPreview>
              <ImageUpload
                onDropAccepted={e => handleFileUpload(uploadImage, e, '', fileUploadSuccessCB)}
                title="Upload Image"
                dropzoneClassname="image-uploader image-uploader-avatar"
                dropzoneContainer={dropzoneContainer}
              />
              <Col xs="12">
                <Input invalid={errors.logo} hidden />
                <FormFeedback>{errors.logo}</FormFeedback>
              </Col>
            </Row>
          </FormGroup>
        </Col>
      </Row>
    </form >
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
  isSubmitting: state.property.isSubmitting || state.pageData.isSubmitting,
  clients: state.client.clients,
  customers: state.customer.customers,
  isClientDataLoaded: state.property.isPropertyDataLoaded,
});

export default connect(
  mapStateToProps,
  {
    ...dwellActions.property,
    ...actions.pageData,
  },
)(withRouter(PropertyModal));
