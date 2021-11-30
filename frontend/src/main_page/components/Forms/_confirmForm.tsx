import React, { FC } from 'react';
import { connect } from 'react-redux';
import actions from 'main_page/actions';
import moment from 'moment-timezone';
import {
  FormTitle,
  CustomForm,
  CustomBtn,
  ActionBtn,
  IconWrapper,
  IconCalendarWrapper,
  ConfirmedArticle,
  ConfirmContactInfo,
} from '../Forms/styles';

interface ConfirmFormProps {
  setActiveForm: (form: number) => void,
  dateTime: string,
  timezone: string,
  getDemoTourAvailableDates: () => Promise<string[]>,
}

const ConfirmForm: FC<ConfirmFormProps> = ({ setActiveForm, getDemoTourAvailableDates, dateTime, timezone }): JSX.Element => {
  const handleReschedule = () => {
    getDemoTourAvailableDates().then(() => setActiveForm(2));
  };

  return (
    <>
      <FormTitle> Demo Confirmed!</FormTitle>
      <CustomForm className="mb-2 mt-3">
        <ConfirmedArticle style={{ marginTop: 0 }}><IconWrapper className="ri-calendar-line" />{moment(dateTime).tz(timezone).format('dddd, MMMM D')} </ConfirmedArticle>
        <ConfirmContactInfo className="mt-2 mb-4"><IconWrapper className="ri-time-line" />{moment(dateTime).tz(timezone).format('hh:mm A')} {timezone} </ConfirmContactInfo>
        <CustomBtn onClick={() => { window.open('https://google.com/calendar', '_blank'); }}>
          <IconCalendarWrapper className="ri-google-line" /> Google Calendar
        </CustomBtn>
        <CustomBtn onClick={() => { window.open('https://icloud.com/calendar', '_blank'); }}>
          <IconCalendarWrapper className="ri-apple-line" /> Apple iCal
        </CustomBtn>
        <CustomBtn onClick={() => { window.open('https://office.live.com/start/Calendar.aspx', '_blank'); }}>
          <IconCalendarWrapper className="ri-microsoft-line" /> Microsoft Outlook
        </CustomBtn>
      </CustomForm>
      <div style={{ zIndex: 1 }}>
        <ActionBtn className="mt-0" onClick={handleReschedule}>Reschedule Demo</ActionBtn>
        <ActionBtn onClick={() => setActiveForm(6)}>Cancel Demo</ActionBtn>
      </div>
    </>
  );
};

export default connect(
  null,
  { ...actions.demoTours },
)(ConfirmForm);
