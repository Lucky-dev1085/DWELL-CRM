import React, { useEffect, useState, FC } from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { Button, Col, FormFeedback, FormGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import actions from 'dwell/actions';
import { fieldChoices } from 'dwell/constants';
import 'src/scss/pages/_lead_creation.scss';
import { FormLabel } from './styles';

interface FormError {
  status?: string,
  reason?: string,
  stage?: string
  owner?: string,
  compare_field?: string,
}

interface BulkEditDialogProps extends RouteComponentProps {
  show: boolean,
  handleClose: () => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleSave: (data: any) => void,
  prospectLostReasons: { id: number, name: string }[],
  selectedRows?: number[],
  ownerDetails?: { id: number, first_name: string, last_name: string, email: string }[],
}

const BulkEditDialog: FC<BulkEditDialogProps> = ({ prospectLostReasons, handleSave, handleClose, show, selectedRows, ownerDetails }) => {
  const closeBtn = <button className="close" onClick={() => handleClose()}>&times;</button>;
  const [formValues, setFormValues] = useState({ compare_field: 'stage' } as FormError);
  const [errors, setErrors] = useState({} as FormError);
  const leadStatus = fieldChoices.LEAD_FILED_CHOICES.status;

  const validateForm = () => {
    const newErrors = {} as FormError;
    const compareField = formValues.compare_field;
    if (compareField === 'status' && !formValues.status) {
      newErrors.status = 'Please choose the status.';
    }
    if (compareField === 'status' && formValues.status === 'LOST' && !formValues.reason) {
      newErrors.reason = 'Please choose the status.';
    }
    if (compareField === 'stage' && !formValues.stage) {
      newErrors.stage = 'Please choose the stage.';
    }
    if (compareField === 'owner' && !formValues.owner) {
      newErrors.owner = 'Please choose the owner.';
    }
    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = () => {
    if (isEmpty(validateForm())) {
      const fields = {
        ids: selectedRows,
        compare_field: formValues.compare_field,
        [formValues.compare_field]: formValues[formValues.compare_field],
      };
      if (formValues.compare_field === 'status' && formValues.status === 'LOST') {
        fields.lost_reason = formValues.reason;
      }
      handleSave(fields);
    }
  };

  useEffect(() => {
    if (!isEmpty(errors)) validateForm();
  }, [formValues]);

  const inputChangeHandler = ({ target: { id, value } }) => {
    setFormValues({ ...formValues, [id]: value });
  };

  return (
    <div>
      <Modal
        isOpen={show}
        toggle={handleClose}
        centered
        aria-labelledby="example-custom-modal-styling-title"
        className="lead-creation-dialog"
      >
        <ModalHeader close={closeBtn}>Bulk Edit {selectedRows.length > 1 ? 'Leads' : 'Lead'} ({selectedRows.length > 0 ? selectedRows.length : ''})</ModalHeader>
        <ModalBody>
          <Row>
            <Col xs="12">
              <FormGroup>
                <FormLabel>Lead property to update</FormLabel>
                <Input
                  type="select"
                  id="compare_field"
                  value={formValues.compare_field}
                  onChange={inputChangeHandler}
                  invalid={errors.compare_field}
                >
                  <option value="stage">Stage</option>
                  <option value="status">Status</option>
                  <option value="owner">Owner</option>
                </Input>
                <FormFeedback>Please select a property to edit.</FormFeedback>
              </FormGroup>
            </Col>
          </Row>
          {formValues.compare_field === 'stage' &&
            <Row>
              <Col xs="12">
                <FormGroup>
                  <FormLabel>Stage value</FormLabel>
                  <Input
                    type="select"
                    id="stage"
                    value={formValues.stage}
                    onChange={inputChangeHandler}
                    invalid={errors.stage}
                  >
                    <option value={null}>Select</option>
                    {Object.keys(fieldChoices.LEAD_FILED_CHOICES.stage)
                      .map((item, index) => (<option value={item} key={index}>{fieldChoices.LEAD_FILED_CHOICES.stage[item]}</option>))}
                  </Input>
                  <FormFeedback>Please select valid stage.</FormFeedback>
                </FormGroup>
              </Col>
            </Row>}
          {formValues.compare_field === 'status' &&
          <React.Fragment>
            <Row>
              <Col xs="12">
                <FormGroup>
                  <FormLabel>Status</FormLabel>
                  <Input
                    type="select"
                    id="status"
                    value={formValues.status}
                    onChange={inputChangeHandler}
                    invalid={errors.status}
                  >
                    <option value={null}>Select</option>
                    {Object.keys(leadStatus).filter(el => !leadStatus[el].hide)
                      .map((item, index) => (<option value={item} key={index}>{leadStatus[item].title}</option>))}
                  </Input>
                  <FormFeedback>Please select valid status.</FormFeedback>
                </FormGroup>
              </Col>
            </Row>
            {formValues.status === 'LOST' &&
            <Row>
              <Col xs="12">
                <FormGroup>
                  <FormLabel>Lost reason</FormLabel>
                  <Input
                    type="select"
                    id="reason"
                    value={formValues.reason}
                    onChange={inputChangeHandler}
                    invalid={errors.reason}
                  >
                    <option value={null}>Select</option>
                    {prospectLostReasons.map((item, index) => (<option value={item.id} key={index}>{item.name}</option>))}
                  </Input>
                  <FormFeedback>Please choose a reason.</FormFeedback>
                </FormGroup>
              </Col>
            </Row>}
          </React.Fragment>}
          {formValues.compare_field === 'owner' &&
            <Row>
              <Col xs="12">
                <FormGroup>
                  <FormLabel> Owner value</FormLabel>
                  <Input
                    type="select"
                    id="owner"
                    value={formValues.owner}
                    onChange={inputChangeHandler}
                    invalid={errors.owner}
                  >
                    <option value={null}>Select</option>
                    {ownerDetails.map((item, index) => (<option value={item.id} key={index}>{item.first_name} {item.last_name} - {item.email}</option>))}
                  </Input>
                  <FormFeedback>Please select valid owner.</FormFeedback>
                </FormGroup>
              </Col>
            </Row>}
        </ModalBody>
        <ModalFooter>
          <Button className="btn-secondary" onClick={() => handleClose()} >Cancel</Button>
          <Button className="btn btn-add-lead" color="primary" onClick={handleSubmit} disabled={!isEmpty(errors)} >Save</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

const mapStateToProps = state => ({
  prospectLostReasons: state.property.property.lost_reasons,
  ownerDetails: state.property.property.users,
});

BulkEditDialog.defaultProps = {
  prospectLostReasons: [],
};

export default connect(
  mapStateToProps,
  {
    ...actions.lead,
  },
)(withRouter(BulkEditDialog));
