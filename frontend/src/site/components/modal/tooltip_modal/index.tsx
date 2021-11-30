import React, { useState, useEffect, FC } from 'react';
import { connect } from 'react-redux';
import { Button, ModalBody, ModalHeader, FormGroup } from 'reactstrap';
import { statusCheckItems, toastError, toastOptions } from 'site/constants';
import { get, isEmpty } from 'lodash';
import { toast, ToastOptions } from 'react-toastify';
import { rules } from 'site/common/validations';
import actions from 'site/actions';
import { FormItem } from 'site/components';
import { ModalWindow } from 'site/components/common';
import { ListResponse, DetailResponse } from 'src/interfaces';

interface FormError {
  value?: string
}

interface CurrentSelector {
  name?: string,
}

interface TooltipModalProps {
  title: string,
  section: string,
  selector: string,
  value: string,
  show: boolean,
  isSubmitting: boolean,
  updateTooltipItem: (data: { sectionString: string, selectorString: string, valueString: string }) => Promise<DetailResponse>,
  onClose: () => void,
  getTooltipItems: () => Promise<ListResponse>
}

const TooltipModal: FC<TooltipModalProps> = ({ title, section, selector, value, show, isSubmitting, onClose, updateTooltipItem, getTooltipItems }) => {
  const [tooltipModalState, updateTooltip] = useState({
    sectionString: section,
    selectorString: selector,
  });
  const [submitIsClicked, updateSubmitIsClicked] = useState(false);
  const [valueString, updateValue] = useState(value);
  const [errors, setErrors] = useState({} as FormError);

  useEffect(() => {
    if (value) {
      updateValue(value);
    }
  }, [value]);

  // eslint-disable-next-line
  const handleInputChange = ({ target: { id, value } }) => {
    if (id === 'selector') {
      const params = value.split(' ');

      return updateTooltip({ ...tooltipModalState, sectionString: params[0], selectorString: params[1] });
    }

    return updateValue(value);
  };

  const validate = () => {
    const formErrors = {} as FormError;

    if (rules.isEmpty(valueString)) {
      formErrors.value = 'Please provide an tooltip text';
    }

    setErrors(formErrors);
    return formErrors;
  };

  const successCB = () => {
    getTooltipItems();
    toast.success('Success!', toastOptions as ToastOptions);
    onClose();
  };

  const failureCB = ({ response: { data } }) => {
    const errorMessage = get(data, 'message', 'Something went wrong!');
    toast.error(errorMessage, toastError as ToastOptions);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const { sectionString, selectorString } = tooltipModalState;

    updateSubmitIsClicked(true);
    onClose();
    if (isEmpty(validate()) && null) { // TODO this later
      updateTooltipItem({ sectionString, selectorString, valueString })
        .then(successCB)
        .catch(failureCB);
    }
  };

  const { sectionString, selectorString } = tooltipModalState;

  if (!sectionString) return <div />;
  const filteredSelectors = statusCheckItems.find(item => item.name === sectionString).elements;
  const currentSelector = filteredSelectors.find(item => item.selector === selectorString) || {} as CurrentSelector;
  return (
    <React.Fragment>
      <ModalWindow isOpen={show} size="md" toggle={onClose} centered>
        <ModalHeader toggle={onClose}>{title}</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <FormItem
                id="valueString"
                name="valueString"
                title={currentSelector.name || 'Tooltip'}
                value={valueString}
                placeholder="Enter tooltip Text"
                handleOnChange={handleInputChange}
                invalid={submitIsClicked && errors.value}
                isTextArea
                textAreaRow={3}
              />
            </FormGroup>
            <div className="text-right">
              <Button color="primary" onClick={handleSubmit} disabled={isSubmitting}>Save</Button>
            </div>
          </form>
        </ModalBody>
      </ModalWindow>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  isSubmitting: state.tooltips.isSubmitting,
});

export default connect(
  mapStateToProps,
  {
    ...actions.tooltips,
  },
)(TooltipModal);
