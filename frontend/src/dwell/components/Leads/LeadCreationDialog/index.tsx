import React, { useEffect, FC } from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter, RouteComponentProps } from 'react-router-dom';
import { Button, Card, CardText, Modal, ModalBody, ModalFooter, ModalHeader, Label } from 'reactstrap';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons/faEnvelope';
import { faCalendarDay } from '@fortawesome/free-solid-svg-icons/faCalendarDay';
import actions from 'dwell/actions';
import 'src/scss/pages/_lead_creation.scss';
import { isEmpty } from 'codemirror/src/util/misc';
import { getPropertyId } from 'src/utils';
import { LeadData } from 'src/interfaces';

interface LeadCreationDialogProps extends RouteComponentProps {
  show: boolean,
  handleClose: (isClose?: boolean) => void,
  errorData: { id: number, message: string },
  getLeadById: (id: number) => void,
  leadData: LeadData,
  newLeadData: LeadData,
}

const LeadCreationDialog: FC<LeadCreationDialogProps> = (props) => {
  const { getLeadById, errorData, show, handleClose, newLeadData,
    leadData: { first_name: firstName, last_name: lastName, email, move_in_date: moveInDate } } = props;

  const closeBtn = <button className="close" onClick={() => handleClose()}><i className="ri-close-line" /></button>;
  const siteId = getPropertyId();

  useEffect(() => {
    if (!isEmpty(errorData) && errorData.id) {
      getLeadById(errorData.id);
    }
  }, [errorData]);

  return (
    <div>
      <Modal
        isOpen={show}
        centered
        aria-labelledby="example-custom-modal-styling-title"
        className="lead-creation-dialog"
      >
        <ModalHeader close={closeBtn}>Duplicate Lead</ModalHeader>
        <ModalBody>
          {errorData.message} Check the details below before creating a new lead.
          <div className="lead-cards">
            <div className="card-container">
              <Label>New lead:</Label>
              <Card body style={{ backgroundColor: 'white', borderColor: '#ccced9' }}>
                <CardText tag="div">
                  <div className="lead-info">
                    <div className="lead-name" style={{ color: '#0b2151' }}>{newLeadData.firstName} {newLeadData.lastName}</div>
                    {newLeadData.email ? <div className="lead-email" style={{ color: '#4a5e8a' }}><FontAwesomeIcon icon={faEnvelope} />{newLeadData.email}</div> : null}
                    {newLeadData.moveInDate ? <div className="lead-move-in-date" style={{ color: '#4a5e8a' }}><FontAwesomeIcon icon={faCalendarDay} />{moment(newLeadData.moveInDate).format('ll')}</div> : null}
                  </div>
                </CardText>
              </Card>
            </div>
            <div className="card-container existing-lead-card">
              <Label>Existing lead:</Label>
              <Card body style={{ backgroundColor: 'white', borderColor: '#ccced9' }}>
                <CardText tag="div">
                  <div className="lead-info">
                    <div className="lead-name" style={{ color: '#0b2151' }}>{firstName} {lastName}</div>
                    {email ? <div className="lead-email" style={{ color: '#4a5e8a' }}><FontAwesomeIcon icon={faEnvelope} />{email}</div> : null}
                    {moveInDate ? <div className="lead-move-in-date" style={{ color: '#4a5e8a' }}><FontAwesomeIcon icon={faCalendarDay} />{moment(moveInDate).format('ll')}</div> : null}
                    <NavLink style={{ color: '#0168fa' }} className="details-link" to={`/${siteId}/leads/${errorData.id}`} >Go to lead details</NavLink>
                  </div>
                </CardText>
              </Card>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="white" onClick={() => handleClose()} >Cancel</Button>
          <Button color="primary" onClick={() => handleClose(true)} >Continue & create new lead</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

const mapStateToProps = state => ({
  leadData: state.lead.lead,
});

export default connect(
  mapStateToProps,
  {
    ...actions.lead,
  },
)(withRouter(LeadCreationDialog));
