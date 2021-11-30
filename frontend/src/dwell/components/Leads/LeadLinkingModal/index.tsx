import React, { useEffect, useState, FC } from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import actions from 'dwell/actions';
import { Typeahead } from 'react-bootstrap-typeahead';
import { isEmpty } from 'lodash';
import 'src/scss/pages/_calls.scss';

interface LeadName {
  phone_number?: string,
  email?: string,
  id?: number
}

interface LeadLinkingModalProps extends RouteComponentProps {
  show: boolean,
  handleClose: (id?: number) => void,
  leadNames?: LeadName[],
  call?: { prospect_phone_number: string, id: number },
  updateCallLead: (id: number, leadId: number) => void,
  email: string,
}

const LeadLinkingModal: FC<LeadLinkingModalProps> = ({ updateCallLead, call, email, handleClose, show, leadNames }) => {
  const closeBtn = <button className="close" onClick={() => handleClose()}>&times;</button>;
  const [selectedLead, setSelectedLead] = useState({} as LeadName);

  const handleSave = () => {
    if (!isEmpty(selectedLead)) {
      if (updateCallLead) {
        updateCallLead(call.id, selectedLead.id);
      }
      handleClose(selectedLead.id);
    }
  };

  useEffect(() => {
    if (!isEmpty(call)) {
      setSelectedLead(leadNames.find(item => item.phone_number === call.prospect_phone_number) || {});
    }
  }, [call, leadNames]);

  useEffect(() => {
    if (email) {
      setSelectedLead(leadNames.find(item => item.email === email) || {});
    }
  }, [email, leadNames]);

  useEffect(() => {
    if (!show) {
      setSelectedLead({});
    }
  }, [show]);

  return (
    <Modal
      isOpen={show}
      toggle={() => handleClose()}
      centered
      aria-labelledby="example-custom-modal-styling-title"
      className="lead-linking_modal"
    >
      <ModalHeader close={closeBtn}>Link to existing lead</ModalHeader>
      <ModalBody>
        <p>Link this call to an existing lead.</p>
        <Typeahead
          id="lead"
          labelKey="name"
          options={leadNames}
          selected={isEmpty(selectedLead) ? [] : [selectedLead]}
          onChange={e => setSelectedLead(e[0])}
          placeholder="Select lead"
        />
      </ModalBody>
      <ModalFooter>
        <Button className="btn link-button" color="primary" onClick={handleSave} disabled={isEmpty(selectedLead)} >Link lead</Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStateToProps = state => ({
  leadNames: state.lead.leadNames,
});

LeadLinkingModal.defaultProps = {
  call: {} as { prospect_phone_number: string, id: number },
  leadNames: [],
  updateCallLead: null,
};

export default connect(
  mapStateToProps,
  {
    ...actions.lead,
    ...actions.call,
  },
)(withRouter(LeadLinkingModal));
