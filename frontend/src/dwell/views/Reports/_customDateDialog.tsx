import React, { useState, useEffect, FC } from 'react';
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import moment from 'moment';
import * as m from 'moment';
import { isInclusivelyBeforeDay, DateRangePicker } from 'react-dates';

interface CustomDateDialogProps {
  show: boolean,
  handleClose: (save?: boolean) => void,
  setCustomDateStart: (date: m.Moment) => void,
  setCustomDateEnd: (date: m.Moment) => void,
  customDateStart: m.Moment,
  customDateEnd: m.Moment,
}

const CustomDateDialog: FC<CustomDateDialogProps> = (props) => {
  const { show, handleClose, setCustomDateStart, setCustomDateEnd, customDateStart, customDateEnd } = props;
  const [focusedInput, setFocusedInput] = useState(null);
  const [inValid, setInValid] = useState(false);
  const closeBtn = <button className="close" onClick={() => handleClose()}>&times;</button>;

  useEffect(() => {
    if (customDateStart && customDateEnd) setInValid(false);
  }, [customDateStart, customDateEnd]);

  const onApply = () => {
    if (!customDateStart || !customDateEnd) {
      setInValid(true);
    } else {
      setCustomDateStart(customDateStart);
      setCustomDateEnd(customDateEnd);
      handleClose(true);
    }
  };

  return (
    <Modal
      isOpen={show}
      toggle={() => handleClose()}
      centered
      aria-labelledby="example-custom-modal-styling-title"
      className="custom-date-dialog"
    >
      <ModalHeader close={closeBtn}>Custom range</ModalHeader>
      <ModalBody>
        <Row className="text-center">
          <Col xs={12}>
            <DateRangePicker
              noBorder
              onFocusChange={focused => setFocusedInput(focused)}
              onDatesChange={({ startDate: start, endDate: end }) => { setCustomDateStart(start); setCustomDateEnd(end); }}
              startDate={customDateStart}
              startDateId="start-date"
              endDate={customDateEnd}
              focusedInput={focusedInput}
              endDateId="end-date"
              numberOfMonths={2}
              isOutsideRange={day => !isInclusivelyBeforeDay(day, moment())}
            />
          </Col>
          <Col xs={12} className="mt-2">
            {inValid && 'Please fill both start and end date.'}
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button className="btn-secondary" onClick={handleClose} >Cancel</Button>
        <Button className="btn" color="primary" onClick={onApply} >Apply</Button>
      </ModalFooter>
    </Modal>
  );
};

export default CustomDateDialog;
