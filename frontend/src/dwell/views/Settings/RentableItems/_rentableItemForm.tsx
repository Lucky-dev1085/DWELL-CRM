import React, { useEffect, useState, FC } from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import CurrencyInput from 'react-currency-input-field';
import { isEmpty } from 'lodash';
import { Col, Row, Input, FormGroup, Label, FormFeedback, ModalBody, ModalFooter, ModalHeader, Button } from 'reactstrap';
import { DetailResponse } from 'src/interfaces';
import actions from 'dwell/actions';
import { SettingsPrimaryButton } from 'dwell/views/Settings/styles';
import { PaidSourcesModal as RentableModal } from 'dwell/components/Settings/PaidSources/styles';
import { rules } from 'site/common/validations';
import { toast, ToastOptions } from 'react-toastify';
import { toastOptions } from 'site/constants';
import 'src/scss/pages/_competitor.scss';

interface Rentable {
  id?: number,
  name?: string,
  description?: string,
  deposit?: string,
  fee?: string,
  monthly_rent?: string,
}

interface RentableItemForm extends RouteComponentProps {
  currentRentableItem?: Rentable,
  updateRentableItem: (id: number, data: Rentable, msg: () => void) => Promise<DetailResponse>,
  createRentableItem: (data: Rentable, msg: () => void) => Promise<DetailResponse>,
  handleClose: () => void,
  show: boolean,
}

const RentableItemForm: FC<RentableItemForm> = ({ currentRentableItem, updateRentableItem, createRentableItem, handleClose, show }) => {
  const [formData, setFormData] = useState({ name: '', description: '', deposit: null, fee: null, monthly_rent: null } as Rentable);
  const [error, setError] = useState({} as Rentable);
  const [submitIsClicked, updateSubmitIsClicked] = useState(false);

  const validate = () => {
    const { name } = formData;

    const errors = {} as Rentable;

    if (rules.isEmpty(name)) {
      errors.name = 'Please input name.';
    }

    setError(errors);
    return errors;
  };

  useEffect(() => {
    validate();
  }, [formData.name]);

  useEffect(() => {
    if (!isEmpty(currentRentableItem)) {
      setFormData(currentRentableItem);
    } else {
      setFormData({ name: '', description: '', deposit: null, fee: null, monthly_rent: null });
    }
  }, [currentRentableItem]);

  const onClose = () => {
    updateSubmitIsClicked(false);
    handleClose();
  };

  const handleCreate = () => {
    updateSubmitIsClicked(true);

    if (isEmpty(validate())) {
      const actionMethod = formData.id ?
        updateRentableItem(formData.id, formData, () => toast.success('Rentable item updated', toastOptions as ToastOptions)) :
        createRentableItem(formData, () => toast.success('New rentable item added', toastOptions as ToastOptions));
      actionMethod.then(() => {
        onClose();
      });
    }
  };

  const handleChange = ({ target: { id, value } }) => {
    setFormData({ ...formData, [id]: value });
  };

  const handleCurrencyChange = (value, name) => {
    setFormData({ ...formData, [name]: value });
  };

  const closeBtn = <button className="close" onClick={() => onClose()} />;

  return (
    <RentableModal
      isOpen={show}
      toggle={() => onClose()}
      centered
    >
      <ModalHeader close={closeBtn}>{currentRentableItem.id ? 'Edit Rentable Item' : 'Add Rentable Item'}</ModalHeader>
      <ModalBody>
        <div className="animated fadeIn">
          <Row>
            <Col xs="12">
              <FormGroup className="mb-3">
                <Label>Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  invalid={submitIsClicked && error.name}
                  required
                />
                <FormFeedback>{submitIsClicked && error.name}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label>Description</Label>
                <Input
                  id="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                  type="textarea"
                />
              </FormGroup>
              <Row className="m-row-5">
                <Col xs="4" className="p-x-5">
                  <FormGroup>
                    <Label>Monthly Rent</Label>
                    <CurrencyInput
                      name="monthly_rent"
                      id="monthly_rent"
                      placeholder="$"
                      value={formData.monthly_rent || ''}
                      onChange={handleCurrencyChange}
                      className="form-control mb-0"
                      prefix="$"
                      allowDecimals
                      decimalsLimit={2}
                    />
                  </FormGroup>
                </Col>
                <Col xs="4" className="p-x-5">
                  <FormGroup>
                    <Label>Deposit</Label>
                    <CurrencyInput
                      name="deposit"
                      id="deposit"
                      placeholder="$"
                      value={formData.deposit || ''}
                      onChange={handleCurrencyChange}
                      className="form-control mb-0"
                      prefix="$"
                      allowDecimals
                      decimalsLimit={2}
                    />
                  </FormGroup>
                </Col>
                <Col xs="4" className="p-x-5">
                  <FormGroup>
                    <Label>Fee</Label>
                    <CurrencyInput
                      name="fee"
                      id="fee"
                      placeholder="$"
                      value={formData.fee || ''}
                      onChange={handleCurrencyChange}
                      className="form-control mb-0"
                      prefix="$"
                    />
                  </FormGroup>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button className="btn-secondary" onClick={onClose} >Cancel</Button>
        <SettingsPrimaryButton className="btn btn-primary" onClick={handleCreate}>{currentRentableItem.id ? 'Save changes' : 'Add Item'}</SettingsPrimaryButton>
      </ModalFooter>
    </RentableModal>
  );
};

export default connect(
  null,
  {
    ...actions.lease,
  },
)(withRouter(RentableItemForm));
