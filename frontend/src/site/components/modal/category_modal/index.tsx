import React, { useState, useEffect, FC } from 'react';
import { connect } from 'react-redux';
import { Button, FormFeedback, Input, ModalBody, ModalFooter, ModalHeader, FormGroup } from 'reactstrap';
import { isEmpty } from 'lodash';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { rules } from 'site/common/validations';
import actions from 'site/actions';
import { ModalWindow, ModalFormLabel } from 'site/components/common';

const basicSubcategory = {
  seo: {
    title: '',
    description: '',
  },
  path: '',
  text: '',
  image: '',
  title: '',
  pageTitle: '',
  firstRibbon: {
    tags: [],
    text: '',
    image: '',
    title: '',
  },
};

interface FormError {
  name?: string
}

interface Category {
  pageTitle: string,
  id?: string
}

interface CategoryModalProps extends RouteComponentProps {
  isSubmitting: boolean,
  title: string,
  category?: Category,
  removable: boolean,
  show: boolean,
  onClose: () => void,
  handleSubCategories: (action: string, id: string, category?: Category) => void
}

const CategoryModal: FC<CategoryModalProps> = ({ isSubmitting, title, category, removable, show, onClose, handleSubCategories }) => {
  const [name, updateName] = useState('');
  const [submitIsClicked, updateSubmitIsClicked] = useState(false);
  const [formErrors, updateErrors] = useState({} as FormError);

  useEffect(() => {
    updateName(category ? category.pageTitle : '');
    updateSubmitIsClicked(false);
    updateErrors({});
  }, [category]);

  const handleInputChange = ({ target: { value } }) => {
    updateName(value);
  };

  const validate = () => {
    const errors = {} as FormError;

    if (rules.isEmpty(name)) {
      errors.name = 'Please provide an name';
    }

    updateErrors(errors);
    return errors;
  };

  useEffect(() => {
    validate();
  }, [name]);

  const handleSubmit = (event) => {
    event.preventDefault();

    updateSubmitIsClicked(true);
    if (isEmpty(validate())) {
      if (category) {
        handleSubCategories('edit', category.id, { ...category, pageTitle: name });
      } else {
        handleSubCategories('create', null, { ...basicSubcategory, pageTitle: name });
      }
      onClose();
    }
  };

  const deleteCategory = () => {
    if (!category || !removable) return;

    handleSubCategories('remove', category.id);
    onClose();
  };

  return (
    <React.Fragment>
      <ModalWindow isOpen={show} size="md" toggle={onClose} centered>
        <ModalHeader toggle={onClose}>{title}</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <ModalFormLabel>
                Category Name
              </ModalFormLabel>
              <Input
                type="text"
                className="mt-1"
                value={name}
                onChange={handleInputChange}
                invalid={submitIsClicked && formErrors.name}
              />
              <FormFeedback>{formErrors.name}</FormFeedback>

            </FormGroup>
          </form>
        </ModalBody>
        <ModalFooter>
          {removable && category ? <Button color="danger" onClick={deleteCategory} disabled={isSubmitting}>Delete</Button> : null}
          <Button color="white" onClick={onClose}>Cancel</Button>
          <Button color="primary" onClick={handleSubmit} disabled={isSubmitting}>Save</Button>
        </ModalFooter>
      </ModalWindow>
    </React.Fragment>
  );
};

CategoryModal.defaultProps = {
  category: {
    pageTitle: '',
  },
};

const mapStateToProps = state => ({
  isSubmitting: state.pageData.isSubmitting,
});

export default connect(
  mapStateToProps,
  {
    ...actions.pageData,
  },
)(withRouter(CategoryModal));
