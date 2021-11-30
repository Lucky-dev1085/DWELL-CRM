import React, { FC } from 'react';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { Button, Col, Form, FormGroup, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import 'src/scss/pages/_lead_creation.scss';
import 'src/scss/pages/_roommates.scss';
import { CustomModalWindow } from 'dwell/components/email/preview/styles';

interface BulkEmailPreviewProps {
  handleClose: () => void,
  show: boolean,
  handleOpenSendModal: () => void,
  data: string,
  subject?: string,
}

const BulkEmailPreview: FC<BulkEmailPreviewProps> = ({ handleClose, show, data, handleOpenSendModal, subject }) => {
  const closeBtn = <button className="close" onClick={() => handleClose()}>&times;</button>;

  return (
    <CustomModalWindow
      isOpen={show}
      toggle={() => handleClose()}
      centered
      aria-labelledby="example-custom-modal-styling-title"
    >
      <ModalHeader close={closeBtn}>Preview Email</ModalHeader>
      <ModalBody>
        <Row>
          <Col xs="12">
            <Form>
              <FormGroup>
                <div>{subject}</div>
              </FormGroup>
              <hr />
              <FormGroup>
                <div
                  dangerouslySetInnerHTML={{
                    __html: data,
                  }}
                />
              </FormGroup>
            </Form>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <div className="roommates-actions">
          <Button className="btn-secondary mr-1" onClick={() => handleClose()} >Edit</Button>
          <Button className="btn" color="primary" onClick={() => handleOpenSendModal()}>Ready to send?</Button>
        </div>
      </ModalFooter>
    </CustomModalWindow>
  );
};

export default BulkEmailPreview;
