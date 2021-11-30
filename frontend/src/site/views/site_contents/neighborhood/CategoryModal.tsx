import React, { useState, useEffect, FC } from 'react';
import { ModalBody, ModalHeader, ModalFooter, Button, FormGroup, Input, Row, Col, FormFeedback } from 'reactstrap';
import isEmpty from 'lodash/isEmpty';
import { ModalFormLabel } from 'site/components/common';
import { rules } from 'site/common/validations';
import { ModalWindow } from 'site/views/site_contents/neighborhood/styles';
import { Category } from 'src/interfaces';
import ImageUpload from './ImageUpload';

interface FormError {
  name?: string
}

interface VideoModalProps {
  isModalOpen?: boolean,
  onModalToggle: () => void,
  onSubmit: (data: Category) => Promise<void>,
  isEdit?: boolean,
  submitting?: boolean,
  data?: Category,
  isCategoryNameExist: (name: string) => boolean,
}

const CategoryModal: FC<VideoModalProps> = ({ isModalOpen, onModalToggle, isEdit, onSubmit, submitting, data, isCategoryNameExist }) => {
  const [categoryModalState, updateCategoryModalState] = useState({
    activeIcon: isEdit ? data.activeIcon : null,
    inactiveIcon: isEdit ? data.inactiveIcon : null,
    name: isEdit ? data.name : '',
  });

  const [error, setError] = useState({} as FormError);
  const [submitIsClicked, updateSubmitIsClicked] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      updateCategoryModalState({
        ...categoryModalState,
        activeIcon: data.activeIcon,
        inactiveIcon: data.inactiveIcon,
        name: data.name,
      });
    }
  }, [data]);

  const validate = () => {
    const { name } = categoryModalState;

    const errors = {} as FormError;

    if (rules.isEmpty(name)) {
      errors.name = 'Please provide a Category name';
    }

    if (isCategoryNameExist(name)) {
      errors.name = 'Category name already exist!';
    }

    setError(errors);
    return errors;
  };

  useEffect(() => {
    validate();
  }, [categoryModalState.name]);

  const handleChange = (key, value) => {
    updateCategoryModalState({ ...categoryModalState, [key]: value });
  };

  const onClose = () => {
    setError({});
    updateCategoryModalState({
      ...categoryModalState,
      activeIcon: null,
      inactiveIcon: null,
      name: '',
    });
    updateSubmitIsClicked(false);
    onModalToggle();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { activeIcon, inactiveIcon, name } = categoryModalState;

    updateSubmitIsClicked(true);

    if (isEmpty(validate())) {
      onSubmit({ activeIcon, inactiveIcon, name }).then(() => {
        onClose();
      });
    }
  };

  const { activeIcon, inactiveIcon, name } = categoryModalState;
  return (
    <ModalWindow isOpen={isModalOpen} toggle={onClose} keyboard={!submitting} centered>
      <ModalHeader toggle={onClose}>
        {isEdit ? 'Edit Category' : 'Add Category'}
      </ModalHeader>
      <ModalBody>
        <FormGroup>
          <ModalFormLabel for="categoryName">Name</ModalFormLabel>
          <Input
            id="categoryName"
            placeholder="Enter name of category"
            value={name}
            onChange={e => handleChange('name', e.target.value)}
            disabled={submitting}
            invalid={submitIsClicked && error.name}
          />
          <FormFeedback>{submitIsClicked && error.name}</FormFeedback>
        </FormGroup>
        <FormGroup className="mb-0">
          <ModalFormLabel>Upload icons</ModalFormLabel>
          <Row className="mt-0">
            <Col xs="6" className="pr-10">
              <ImageUpload
                buttonText="Select Active Icon"
                value={activeIcon}
                onChange={v => handleChange('activeIcon', v)}
                disabled={submitting}
                type="category"
              />
            </Col>
            <Col xs="6" className="pl-10">
              <ImageUpload
                buttonText="Select Inactive Icon"
                value={inactiveIcon}
                onChange={v => handleChange('inactiveIcon', v)}
                disabled={submitting}
                type="category"
              />
            </Col>
          </Row>
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="white" type="button" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button color="primary" type="submit" disabled={submitting} onClick={handleSubmit}>
          {isEdit ? 'Save changes' : 'Add Category'}
        </Button>
      </ModalFooter>
    </ModalWindow>
  );
};

CategoryModal.defaultProps = {
  isModalOpen: false,
  isEdit: false,
  submitting: false,
  data: {},
};

export default CategoryModal;
