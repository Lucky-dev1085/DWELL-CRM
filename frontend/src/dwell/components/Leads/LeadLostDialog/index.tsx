import React, { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  Button,
  ButtonDropdown,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormFeedback,
  FormGroup,
  Label,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import actions from 'dwell/actions';
import 'src/scss/pages/_lead_creation.scss';
import { isEmpty } from 'lodash';
import { LostReason } from 'src/interfaces';
import { StyledModal } from 'styles/common';

interface LeadLostDialogProps {
  prospectLostReasons: LostReason[],
  handleSave: (reason: LostReason) => void,
  handleClose: () => void,
  show: boolean,
}

const LeadLostDialog: FC<LeadLostDialogProps> = ({ prospectLostReasons, handleSave, handleClose, show }) => {
  const closeBtn = <button className="close" onClick={() => handleClose()}>&times;</button>;
  const [reason, setReason] = useState(null);
  const [error, setError] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!reason && !isEmpty(prospectLostReasons)) {
      setReason(prospectLostReasons[0].id);
    }
  }, [prospectLostReasons]);

  const handleSubmit = () => {
    if (!reason) {
      setError(error);
    } else {
      handleSave(reason);
    }
  };

  const changeLostReason = (value) => {
    setReason(value);
  };

  const currentReason = prospectLostReasons.find(r => r.id === reason);
  return (
    <StyledModal
      isOpen={show}
      centered
      aria-labelledby="example-custom-modal-styling-title"
      className="lead-creation-dialog"
    >
      <ModalHeader close={closeBtn}>Please choose lost reason</ModalHeader>
      <ModalBody>
        <Row>
          <Col xs="12">
            <FormGroup>
              <Label>Lost reason</Label>
              <ButtonDropdown className="mr-1 select-input" isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(!isDropdownOpen)}>
                <DropdownToggle caret className="bg-white">
                  {currentReason ? currentReason.name : ''}
                </DropdownToggle>
                <DropdownMenu>
                  {prospectLostReasons.map((item, index) => (
                    <React.Fragment key={index}>
                      <DropdownItem onClick={() => changeLostReason(item.id)}>
                        {item.name}
                      </DropdownItem>
                    </React.Fragment>
                  ))}
                </DropdownMenu>
              </ButtonDropdown>
              <FormFeedback>Please choose a reason.</FormFeedback>
            </FormGroup>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="white" onClick={() => handleClose()} >Cancel</Button>
        <Button className="btn btn-add-lead" color="primary" onClick={handleSubmit} >Save</Button>
      </ModalFooter>
    </StyledModal>
  );
};

const mapStateToProps = state => ({
  prospectLostReasons: state.property.property.lost_reasons,
});

export default connect(
  mapStateToProps,
  {
    ...actions.lead,
  },
)(LeadLostDialog);
