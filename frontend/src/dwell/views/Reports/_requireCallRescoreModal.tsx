import React, { FC, useState } from 'react';
import { connect } from 'react-redux';
import { Modal, ModalFooter, FormGroup, FormFeedback, Input, Label, ModalBody, ModalHeader, Row, Button } from 'reactstrap';
import 'src/scss/pages/_reports.scss';
import 'src/scss/pages/_leads_list.scss';
import { RescoreModalNote } from './styles';

interface ScoredCallsModalProps {
  show: boolean,
  handleClose: () => void,
  handleSubmit: (reason: string) => void,
}

const RequireCallRescoreModal: FC<ScoredCallsModalProps> = ({ show, handleClose, handleSubmit }) => {
  const [rescoreReason, setRescoreReason] = useState('');
  const [error, setError] = useState(false);
  const closeBtn = <button className="close" onClick={() => handleClose()}>&times;</button>;

  const onSubmit = () => {
    if (rescoreReason.length < 10) {
      setError(true);
    } else {
      handleSubmit(rescoreReason);
    }
  };

  return (
    <Modal
      isOpen={show}
      centered
      toggle={() => handleClose()}
      size="sm"
      aria-labelledby="example-custom-modal-styling-title"
      className="drilldown"
    >
      <ModalHeader close={closeBtn}>
        <span>Rescore Call</span>
      </ModalHeader>
      <ModalBody>
        <Row>
          <FormGroup className="col-12">
            <Label htmlFor="first_name">Reason for rescore</Label>
            <Input
              type="textarea"
              name="reason_for_rescore"
              placeholder="Enter the reason for rescore"
              value={rescoreReason}
              onChange={({ target: { value } }) => {
                setRescoreReason(value);
                setError(false);
              }}
              invalid={error}
            />
            <FormFeedback>Please input the reason at least 10 characters.</FormFeedback>
          </FormGroup>
          <FormGroup className="col-12">
            <RescoreModalNote>Only one call can be submitted to be rescored per property, each day.</RescoreModalNote>
          </FormGroup>
        </Row>
      </ModalBody>
      <ModalFooter>
        <div className="roommates-actions">
          <Button color="white" onClick={() => handleClose()} >Cancel</Button>
          <Button color="primary" onClick={onSubmit}>Request rescore</Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default connect(null)(RequireCallRescoreModal);
