import React, { useEffect, useState, FC } from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Button, CardBody, CardHeader, Row, Col, CustomInput, Modal, ModalBody, ModalFooter } from 'reactstrap';
import moment from 'moment';
import actions from 'dwell/actions';
import { fieldChoices } from 'dwell/constants';
import { LeadData } from 'src/interfaces';
import 'src/scss/pages/_lead_creation.scss';
import 'src/scss/pages/_leads_merge.scss';
import { ModalHeader, CardMerge } from './styles';

interface LeadMergeModalProps extends RouteComponentProps {
  show: boolean,
  handleClose: () => void,
  leads: LeadData[],
  leadIds: number[],
  handleMerge: (id: number) => void,
}

const LeadMergeModal: FC<LeadMergeModalProps> = (props) => {
  const { leadIds, leads, show, handleClose, handleMerge } = props;
  const [primaryLead, setPrimaryLead] = useState(0);
  const closeBtn = <button className="close" onClick={() => handleClose()}>&times;</button>;

  useEffect(() => {
    if (!show) {
      setPrimaryLead(0);
    }
  }, [show]);

  return (
    <div>
      <Modal
        toggle={() => handleClose()}
        isOpen={show}
        centered
        aria-labelledby="example-custom-modal-styling-title"
        className="lead-merge-modal"
      >
        <ModalHeader close={closeBtn}>Merging {leadIds.length} lead records</ModalHeader>
        <ModalBody>
          <p className="mg-b-20">
            Select a primary lead record. All lead detail information from the records below will be merged to the primary record.
            Note secondary records will be deleted from Dwell.
          </p>
          {leads.filter(lead => leadIds.includes(lead.id)).map((lead, index) => (
            <CardMerge key={index} onClick={() => setPrimaryLead(lead.id)}>
              <CardHeader>
                <h6><span>{lead.name}</span></h6>
                <CustomInput
                  type="radio"
                  id={`primaryRadio${index}`}
                  name="primaryRadio"
                  label="Select as Primary"
                  checked={primaryLead === lead.id}
                  onChange={({ target: { checked } }) => { if (checked) setPrimaryLead(lead.id); }}
                />
              </CardHeader>
              <CardBody>
                <Row className="no-gutters"><Col sm={4}>Lead owner:</Col><Col sm={8}>{lead.owner || 'Not set'}</Col></Row>
                <Row className="no-gutters"><Col sm={4}>Lead source: </Col><Col sm={8}>{lead.source || 'Not set'}</Col></Row>
                <Row className="no-gutters"><Col sm={4}>Status:</Col><Col sm={8}>{lead.status ? fieldChoices.LEAD_FILED_CHOICES.status[lead.status].title : 'Not set'}</Col></Row>
                <Row className="no-gutters"><Col sm={4}>Stage:</Col><Col sm={8}>{lead.stage ? fieldChoices.LEAD_FILED_CHOICES.stage[lead.stage] : 'Not set'}</Col></Row>
                <Row className="no-gutters"><Col sm={4}>Created date:</Col><Col sm={8}>{moment(lead.created).format('ll')}</Col></Row>
                <Row className="no-gutters"><Col sm={4}>Move-in-date:</Col><Col sm={8}>{lead.move_in_date ? moment(lead.move_in_date).format('ll') : 'Not set'}</Col></Row>
              </CardBody>
            </CardMerge>))
          }
        </ModalBody>
        <ModalFooter>
          <Button className="btn-secondary" onClick={() => handleClose()} >Cancel</Button>
          <Button className="btn btn-add-lead" color="primary" onClick={() => handleMerge(primaryLead)} disabled={!leadIds.includes(primaryLead)} >Merge</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

const mapStateToProps = state => ({
  leads: state.lead.leads,
});

export default connect(
  mapStateToProps,
  {
    ...actions.lead,
  },
)(withRouter(LeadMergeModal));
