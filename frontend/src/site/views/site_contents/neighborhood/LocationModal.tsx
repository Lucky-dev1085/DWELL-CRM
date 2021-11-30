import React, { useState, useEffect, FC } from 'react';
import { ModalBody, ModalHeader, ModalFooter, Button, FormGroup, Input, Row, Col, FormFeedback } from 'reactstrap';
import Select from 'react-select';
import isEmpty from 'lodash/isEmpty';
import { Geolocation } from 'site/components';
import { ModalFormLabel } from 'site/components/common';
import { rules } from 'site/common/validations';
import { DetailResponse, Location } from 'src/interfaces';
import { ModalWindow } from 'site/views/site_contents/neighborhood/styles';
import ImageUpload from './ImageUpload';

interface FormError {
  image?: string,
  name?: string,
  address?: string,
}

interface LocationModalProps {
  isModalOpen?: boolean,
  onModalToggle: () => void,
  onSubmit: (data: Location) => Promise<DetailResponse>,
  isEdit?: boolean,
  submitting?: boolean,
  data?: Location,
  categories?: {
    id?: string | number,
    name?: string,
    iconName?: string,
    createdDate?: string,
  }[],
}

const LocationModal: FC<LocationModalProps> = ({ isModalOpen, onModalToggle, isEdit, onSubmit, submitting, data, categories }) => {
  const [locationModalState, updateLocationModal] = useState({
    image: isEdit ? data.image : null,
    name: isEdit ? data.name : '',
    address: isEdit ? data.address : '',
    phone: isEdit ? data.phone : '',
    website: isEdit ? data.website : '',
    category: isEdit ? data.category : [],
    isPropertyLocation: isEdit ? data.isPropertyLocation : false,
  });
  const [formErrors, setErrors] = useState({} as FormError);
  const [submitIsClicked, updateSubmitIsClicked] = useState(false);

  useEffect(() => {
    if (!isEmpty(data)) {
      updateLocationModal({
        ...locationModalState,
        image: data.image,
        name: data.name,
        address: data.address,
        phone: data.phone,
        website: data.website,
        category: data.category,
        isPropertyLocation: data.isPropertyLocation,
      });
    }
  }, [data]);

  const validate = () => {
    const { image, name, address } = locationModalState;

    const errors = {} as FormError;

    if (!image) {
      errors.image = 'Please upload a location image.';
    }

    if (rules.isEmpty(name)) {
      errors.name = 'Please provide a location name';
    }

    if (rules.isEmpty(address)) {
      errors.address = 'Please provide address ';
    }

    setErrors(errors);
    return errors;
  };

  useEffect(() => {
    validate();
  }, [locationModalState.name, locationModalState.image, locationModalState.address]);

  const handleChange = (key, value) => {
    updateLocationModal({ ...locationModalState, [key]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { image, name, address, phone = '', website = '', isPropertyLocation, category } = locationModalState;

    updateSubmitIsClicked(true);

    if (isEmpty(validate())) {
      onSubmit({ image, name, address, phone, website, category, isPropertyLocation }).then(() => {
        if (!isEdit) {
          updateLocationModal({
            ...locationModalState,
            image: null,
            name: '',
            address: '',
            phone: '',
            website: '',
            isPropertyLocation: false,
            category: [],
          });
        }
        onModalToggle();
      });
    }
  };

  const handleAddressChange = (location) => {
    const address = location[0].formatted_address;
    updateLocationModal({ ...locationModalState, address });
  };

  const { image, name, address, phone, website, category } = locationModalState;
  return (
    <ModalWindow isOpen={isModalOpen} toggle={onModalToggle} keyboard={!submitting} centered>
      <ModalHeader toggle={onModalToggle}>
        {isEdit ? 'Edit Location' : 'Add Location'}
      </ModalHeader>
      <ModalBody>
        <ImageUpload
          buttonText="Upload Image"
          value={image}
          onChange={v => handleChange('image', v)}
          disabled={submitting}
          invalid={submitIsClicked && formErrors.image}
          type="location"
        />
        <FormGroup>
          <ModalFormLabel for="locationName">Name</ModalFormLabel>
          <Input
            id="locationName"
            placeholder="Name"
            value={name}
            onChange={e => handleChange('name', e.target.value)}
            disabled={submitting}
            invalid={submitIsClicked && formErrors.name}
          />
          <FormFeedback>{submitIsClicked && formErrors.name}</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Geolocation
            label="Address"
            inputProps={{
              placeholder: 'Search address',
              disabled: submitting,
              onChange: e => handleChange('address', e.target.value),
              defaultValue: address,
            }}
            invalid={submitIsClicked && formErrors.address}
            setLocation={handleAddressChange}
            hideTooltip
          />
        </FormGroup>
        <Row>
          <Col className="pr-10">
            <FormGroup>
              <ModalFormLabel for="locationPhone">Phone Number</ModalFormLabel>
              <Input
                id="locationPhone"
                placeholder="Enter number"
                value={phone}
                onChange={e => handleChange('phone', e.target.value)}
                disabled={submitting}
              />
            </FormGroup>
          </Col>
          <Col className="pl-10">
            <FormGroup>
              <ModalFormLabel for="locationWebsite">Website</ModalFormLabel>
              <Input
                type="url"
                id="locationWebsite"
                placeholder="http://"
                value={website}
                onChange={e => handleChange('website', e.target.value)}
                disabled={submitting}
                style={{ height: '42px' }}
              />
            </FormGroup>
          </Col>
        </Row>
        <FormGroup className="mb-0">
          <ModalFormLabel for="locationCategory">Select Category</ModalFormLabel>
          <Select
            id="locationCategory"
            isMulti
            name="categories"
            options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select category"
            onChange={v => handleChange('category', v ? v.map(item => item.value) : [])}
            value={category.filter(id => categories.map(cat => cat.id).includes(id)).map(id => ({ value: id, label: categories.filter(cat => cat.id === id)[0].name }))}
            isDisabled={submitting}
          />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="white" type="button" onClick={onModalToggle} disabled={submitting}>
          Cancel
        </Button>
        <Button color="primary" type="submit" disabled={submitting} onClick={handleSubmit}>
          {isEdit ? 'Save changes' : 'Add Location'}
        </Button>
      </ModalFooter>
    </ModalWindow>
  );
};

LocationModal.defaultProps = {
  isModalOpen: false,
  isEdit: false,
  submitting: false,
  data: {},
  categories: [],
};

export default LocationModal;
