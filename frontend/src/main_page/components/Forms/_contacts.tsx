import React, { FC } from 'react';
import actions from 'main_page/actions';
import { connect } from 'react-redux';
import { DemoTourProps, DetailResponse } from 'src/interfaces';
import moment from 'moment-timezone';
import { DEMO_EXTERNAL_ID } from 'main_page/constants';
import {
  ContactDataWrapper,
  FormTitle,
  BackBtn,
  ContinueBtn,
  ControlBtns,
  ContactInfo,
  Article,
  FormDescription, IconWrapper,
} from './styles';

interface ContactsProps {
  setActiveForm: (form: number) => void,
  dateTime: string,
  timezone: string,
  demo: DemoTourProps,
  updateDemoTourById: (id: string, data: DemoTourProps) => Promise<DetailResponse>,
  createDemoTour: (data: DemoTourProps, callback?: (response) => void) => Promise<DetailResponse>,
  setCurrentDemo: (val) => void,
  currentDemo: string,
}

const Contacts: FC<ContactsProps> = ({ setActiveForm, demo, dateTime, timezone, updateDemoTourById, createDemoTour, currentDemo }): JSX.Element => {
  const handleContinue = () => {
    const data = {
      date: dateTime,
      first_name: demo.first_name,
      last_name: demo.last_name,
      email: demo.email,
      phone_number: demo.phone_number,
      company: demo.company,
      timezone,
    };
    if (currentDemo) {
      updateDemoTourById(currentDemo, data).then(() => setActiveForm(5));
    } else {
      createDemoTour(data, (response) => {
        localStorage.setItem(DEMO_EXTERNAL_ID, response.data.external_id);
        setActiveForm(5);
      });
    }
  };
  return <>
    <FormTitle> Request a Demo </FormTitle>
    <FormDescription className="mt-4 mb-0"> Contact Information </FormDescription>
    <ContactDataWrapper>
      <Article><IconWrapper className="ri-user-3-line" />{demo.first_name} {demo.last_name}</Article>
      <ContactInfo><IconWrapper className="ri-mail-line" />{demo.email}</ContactInfo>
      <ContactInfo><IconWrapper className="ri-phone-line" />{demo.phone_number} </ContactInfo>
    </ContactDataWrapper>
    <FormDescription style={{ marginTop: '3em' }} className="mb-0"> Demo Schedule </FormDescription>
    <ContactDataWrapper style={{ flexGrow: 1 }}>
      <Article><IconWrapper className="ri-calendar-line" />{moment(dateTime).tz(timezone).format('dddd, MMMM D')} </Article>
      <ContactInfo><IconWrapper className="ri-time-line" />{moment(dateTime).tz(timezone).format('hh:mm A')} {timezone} </ContactInfo>
    </ContactDataWrapper>
    <ControlBtns>
      <BackBtn onClick={() => setActiveForm(3)}> <i className="ri-arrow-left-s-line" /> </BackBtn>
      <ContinueBtn onClick={handleContinue}> Confirm Demo </ContinueBtn>
    </ControlBtns>
  </>;
};

export default connect(
  null,
  { ...actions.demoTours },
)(Contacts);

