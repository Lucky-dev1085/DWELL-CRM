import React, { FC, useEffect, useState } from 'react';
import 'react-dates/initialize';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import actions from 'dwell/actions';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Col,
  Row,
  Input, FormGroup, Label, FormFeedback,
} from 'reactstrap';
import { CompetitorsModal, AddressFormGroup } from 'dwell/components/Settings/Competitors/styles';
import { SettingsPrimaryButton } from 'dwell/views/Settings/styles';
import { DetailResponse, CompetitorProps } from 'src/interfaces';
import { rules } from 'site/common/validations';

interface FormError {
  name?: string,
}

interface CompetitorsModalWindowProps extends RouteComponentProps {
  handleClose: () => void,
  show: boolean,
  currentCompetitor: CompetitorProps,
  createCompetitor: (data: CompetitorProps) => Promise<DetailResponse>,
  updateCompetitorById: (competitorId: number, data: CompetitorProps) => Promise<DetailResponse>,
}

const CompetitorsModalWindow: FC<CompetitorsModalWindowProps> = ({
  handleClose,
  show,
  currentCompetitor,
  updateCompetitorById,
  createCompetitor,
}) => {
  const [name, setName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [faxNumber, setFaxNumber] = useState('');
  const [id, setId] = useState(null);
  const [error, setError] = useState({} as FormError);
  const [submitIsClicked, updateSubmitIsClicked] = useState(false);

  const validate = () => {
    const errors = {} as FormError;

    if (rules.isEmpty(name)) {
      errors.name = 'Please input competitor name.';
    }

    setError(errors);
    return errors;
  };

  useEffect(() => {
    validate();
  }, [name]);

  useEffect(() => {
    if (currentCompetitor) {
      setId(currentCompetitor.id);
      setName(currentCompetitor.name || '');
      setAddressLine1(currentCompetitor.address_line_1 || '');
      setAddressLine2(currentCompetitor.address_line_2 || '');
      setCity(currentCompetitor.city || '');
      setState(currentCompetitor.state || '');
      setZipCode(currentCompetitor.zip_code || '');
      setPhoneNumber(currentCompetitor.phone_number || '');
      setFaxNumber(currentCompetitor.fax_number || '');
    }
  }, [currentCompetitor]);

  const handleCloseModal = () => {
    updateSubmitIsClicked(false);
    handleClose();
  };

  const closeBtn = <button className="close" onClick={() => handleCloseModal()} />;

  const handleCreate = () => {
    const data = {
      name,
      address_line_1: addressLine1,
      address_line_2: addressLine2,
      city,
      state,
      zip_code: zipCode,
      phone_number: phoneNumber,
      fax_number: faxNumber,
    };

    updateSubmitIsClicked(true);

    if (isEmpty(validate())) {
      const actionMethod = id ? updateCompetitorById(id, data) : createCompetitor(data);
      actionMethod.then(() => {
        handleCloseModal();
      });
    }
  };

  return (
    <CompetitorsModal
      isOpen={show}
      toggle={() => handleCloseModal()}
      centered
    >
      <ModalHeader close={closeBtn}>{currentCompetitor.id ? 'Edit competitor' : 'Add New Competitor'}</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label>Competitor Name</Label>
          <Input
            name="name"
            id="name"
            placeholder="Enter name of competitor"
            value={name}
            onChange={({ target: { value } }) => { setName(value); }}
            invalid={submitIsClicked && error.name}
            required
          />
          <FormFeedback>{submitIsClicked && error.name}</FormFeedback>
        </FormGroup>
        <AddressFormGroup className="mt-3">
          <Label>Competitor Address</Label>
          <Row className="mt-0">
            <Col xs={12} className="mb-5">
              <Input
                name="addressLine1"
                id="addressLine1"
                placeholder="Address line 1"
                value={addressLine1}
                onChange={({ target: { value } }) => setAddressLine1(value)}
              />
            </Col>
            <Col xs={12} className="mb-5">
              <Input
                name="addressLine2"
                id="addressLine2"
                placeholder="Address line 2"
                value={addressLine2}
                onChange={({ target: { value } }) => setAddressLine2(value)}
              />
            </Col>
            <Row className="mt-0 mr-10 ml-10">
              <Col className="p-x-5">
                <Input
                  name="city"
                  id="city"
                  placeholder="City"
                  value={city}
                  onChange={({ target: { value } }) => setCity(value)}
                />
              </Col>
              <Col className="p-x-5" >
                <Input
                  name="state"
                  id="state"
                  placeholder="State"
                  value={state}
                  onChange={({ target: { value } }) => setState(value)}
                />
              </Col>
              <Col xs={3} className="p-x-5">
                <Input
                  name="zipCode"
                  id="zip-code"
                  placeholder="Zip Code"
                  value={zipCode}
                  onChange={({ target: { value } }) => setZipCode(value)}
                />
              </Col>
            </Row>
          </Row>
        </AddressFormGroup>
        <Row style={{ marginTop: '11px' }}>
          <Col xs={6} className="pr-10">
            <FormGroup>
              <Label>Phone Number</Label>
              <Input
                name="phoneNumber"
                id="phoneNumber"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={({ target: { value } }) => setPhoneNumber(value)}
              />
            </FormGroup>
          </Col>
          <Col xs={6} className="pl-10">
            <FormGroup>
              <Label>Fax Number</Label>
              <Input
                name="faxNumber"
                id="faxNumber"
                placeholder="Enter fax number"
                value={faxNumber}
                onChange={({ target: { value } }) => setFaxNumber(value)}
              />
            </FormGroup>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button className="btn-secondary" onClick={() => handleCloseModal()} >Cancel</Button>
        <SettingsPrimaryButton className="btn btn-primary" onClick={handleCreate}>{currentCompetitor.id ? 'Save changes' : 'Add Competitor'}</SettingsPrimaryButton>
      </ModalFooter>
    </CompetitorsModal>

  );
};

export default connect(
  null,
  {
    ...actions.competitor,
  },
)(withRouter(CompetitorsModalWindow));
