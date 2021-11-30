import React, { FC, useState } from 'react';
import { Col, Row } from 'reactstrap';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import { timezones } from 'main_page/constants';
import {
  BackBtn,
  Checkmark,
  ContinueBtn,
  ControlBtns,
  CustomForm,
  FormDescription,
  FormTitle,
  TimeBtn,
  TimezoneSelect,
} from './styles';

interface TimeFormProps {
  dateTime: string,
  setDateTime: (dateTime: string) => void,
  availableTimes: string[],
  timezone: string,
  setTimezone: (timezone: string) => void,
  setActiveForm: (form: number) => void,
}

const TimeForm: FC<TimeFormProps> = ({ dateTime, setDateTime, availableTimes, timezone, setTimezone, setActiveForm }): JSX.Element => {
  const [isError, setIsError] = useState(false);

  const handleContinue = () => {
    if (dateTime) {
      setActiveForm(4);
    } else {
      setIsError(true);
    }
  };

  const handleTimeChange = (value) => {
    setDateTime(value);
    setIsError(false);
  };

  return <>
    <FormTitle> Request a Demo </FormTitle>
    <FormDescription className="mt-4 mb-0"> Select your timezone </FormDescription>
    <TimezoneSelect
      value={{ value: timezone, label: timezone.replace(/_/g, ' ') }}
      options={timezones.map(tz => ({ value: tz, label: tz.replace(/_/g, ' ') }))}
      classNamePrefix="select"
      placeholder="Select timezone"
      onChange={item => setTimezone(item.value)}
    />
    <FormDescription error={isError} className="mt-4 mb-0"> Select a time </FormDescription>
    <CustomForm>
      <Row>
        <Col xs={6} lg={6} style={{ paddingRight: '5px' }}>
          {availableTimes.filter((time, index) => index % 2 === 0).map(time => (
            <TimeBtn
              key={time}
              onClick={() => handleTimeChange(time)}
              selected={moment(time).tz(timezone).format() === moment(dateTime).tz(timezone).format()}
            >
              {moment(time).tz(timezone).format('hh:mm A')}
              {moment(dateTime).tz(timezone).format() === moment(time).tz(timezone).format() && <Checkmark />}
            </TimeBtn>))}
        </Col>
        <Col xs={6} lg={6} style={{ paddingLeft: '5px' }}>
          {availableTimes.filter((time, index) => index % 2 !== 0).map(time => (
            <TimeBtn
              key={time}
              onClick={() => handleTimeChange(time)}
              selected={moment(time).tz(timezone).format() === moment(dateTime).tz(timezone).format()}
            >
              {moment(time).tz(timezone).format('hh:mm A')}
              {moment(dateTime).tz(timezone).format() === moment(time).tz(timezone).format() && <Checkmark />}
            </TimeBtn>))}
        </Col>
      </Row>
    </CustomForm>
    <ControlBtns style={{ marginTop: '0.5em' }}>
      <BackBtn onClick={() => setActiveForm(2)}> <i className="ri-arrow-left-s-line" /> </BackBtn>
      <ContinueBtn onClick={handleContinue}> Continue </ContinueBtn>
    </ControlBtns>
  </>;
};

const mapStateToProps = state => ({
  availableTimes: state.demoTours.availableTimes,
});

export default connect(
  mapStateToProps,
  { },
)(TimeForm);

