import React, { FC } from 'react';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { Button, Modal } from 'reactstrap';
import 'src/scss/pages/_lead_creation.scss';
import 'src/scss/pages/_roommates.scss';
import { SendEmailModalTitle, SendEmailModalBody, SendEmailButtonGroup, SendEmailModalInfo, SendEmailModalInfoSubjectTitle } from 'dwell/components/email/send/styles';

interface BulkEmailSendProps {
  handleClose: () => void,
  show: boolean,
  sendEmailBlast: () => void,
  data: string,
  count: number,
}

const BulkEmailSend: FC<BulkEmailSendProps> = ({ handleClose, show, sendEmailBlast, data, count }) => (
  <Modal
    isOpen={show}
    toggle={() => handleClose()}
    centered
    className="bulk-send-modal"
    aria-labelledby="example-custom-modal-styling-title"
  >
    <SendEmailModalBody>
      <i className="ri-mail-send-line" />
      <SendEmailModalTitle>Ready to send?</SendEmailModalTitle>
      <SendEmailModalInfo>
        <SendEmailModalInfoSubjectTitle>{data}</SendEmailModalInfoSubjectTitle>
        <p>Number of recipients: {count}</p>
      </SendEmailModalInfo>
      <SendEmailButtonGroup>
        <Button className="btn-secondary mr-1" onClick={() => handleClose()} >Cancel</Button>
        <Button className="btn" color="primary" onClick={() => sendEmailBlast()}>Send Email</Button>
      </SendEmailButtonGroup>
    </SendEmailModalBody>
  </Modal>
);

export default BulkEmailSend;
