import React, { useState, FC, useEffect } from 'react';
import actions from 'main_page/actions';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import moment from 'moment-timezone';
import PersonalForm from 'main_page/components/Forms/_personalForm';
import DateForm from 'main_page/components/Forms/_dateForm';
import TimeForm from 'main_page/components/Forms/_timeForm';
import CancelForm from 'main_page/components/Forms/_cancelForm';
import ConfirmForm from 'main_page/components/Forms/_confirmForm';
import Contacts from 'main_page/components/Forms/_contacts';
import { DemoTourProps, DetailResponse } from 'src/interfaces';
import { DEMO_EXTERNAL_ID } from 'main_page/constants';
import { FormWrapper } from './styles';

const defaultErrors = {
  first_name: false,
  last_name: false,
  email: false,
  phone_number: false,
  company: false,
};

const defaultDemo = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  company: '',
};

export const defaultPlaceholders = {
  first_name: 'First Name',
  last_name: 'Last Name',
  email: 'Email',
  phone_number: 'Phone',
  company: 'Company',
};

interface DemoFormProps {
  getDemoTourAvailableDates: () => Promise<string[]>,
  currentDemo: DemoTourProps,
  getDemoTourById: (id: string) => Promise<DetailResponse>
}

export const formatPhoneNumber = (value: string): string => {
  let phoneNumber = value;
  const input = phoneNumber.replace(/\D/g, '').substring(0, 10);
  const zip = input.substring(0, 3);
  const middle = input.substring(3, 6);
  const last = input.substring(6, 10);

  if (input.length > 6) {
    phoneNumber = `(${zip}) ${middle}-${last}`;
  } else if (input.length > 3) {
    phoneNumber = `(${zip}) ${middle}`;
  } else if (input.length > 0) {
    phoneNumber = `(${zip}`;
  }
  return phoneNumber;
};

// some of the timezones are deprecated and not accepted on BE, so need to replace them to allowed timezones
// https://stackoverflow.com/a/51380132
const getCurrentTimezone = () => {
  let tz = moment.tz.guess(true);
  if (tz === 'Asia/Calcutta') {
    tz = 'Asia/Kolkata';
  }
  if (tz === 'Asia/Katmandu') {
    tz = 'Asia/Kathmandu';
  }
  return tz;
};

const DemoForm: FC<DemoFormProps> = ({ getDemoTourAvailableDates, currentDemo, getDemoTourById }): JSX.Element => {
  const [activeForm, setActiveForm] = useState(1);
  const [demo, setDemo] = useState(defaultDemo);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>(defaultErrors);
  const [placeholders, setPlaceholders] = useState<{ [key: string]: string }>(defaultPlaceholders);
  const [date, setDate] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [timezone, setTimezone] = useState(getCurrentTimezone());

  useEffect(() => {
    const id = localStorage.getItem(DEMO_EXTERNAL_ID);
    if (id) {
      getDemoTourById(id).then((response) => {
        if (!response.result.data.is_cancelled && moment(response.result.data.date) >= moment()) {
          setActiveForm(5);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(currentDemo)) {
      setDemo({ first_name: currentDemo.first_name,
        last_name: currentDemo.last_name,
        email: currentDemo.email,
        phone_number: currentDemo.phone_number,
        company: currentDemo.company });
      setTimezone(currentDemo.timezone);
      setDate(moment(currentDemo.date).tz(currentDemo.timezone).format('YYYY-MM-DD'));
      setDateTime(moment(currentDemo.date).tz(currentDemo.timezone).format());
    }
  }, [currentDemo]);

  const submitPersonalData = (numberOfForm) => {
    let fieldErrors = { ...errors };
    let fieldPlaceholders = { ...placeholders };
    Object.keys(demo).forEach((key) => {
      const value = demo[key].trim();
      if (!value) {
        fieldErrors = { ...fieldErrors, [key]: true };
        if (!placeholders[key].match('required')) {
          fieldPlaceholders = { ...fieldPlaceholders, [key]: `(${placeholders[key]}) - required field` };
        }
      }
      if ((key === 'email' && !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) ||
          (key === 'phone_number' && !(/^[0-9]{10}$/.test(value.replace(/\D/g, '')))) ||
          (['first_name', 'last_name'].includes(key) && value.length < 2) || (key === 'company' && value.length < 3)
      ) {
        fieldErrors = { ...fieldErrors, [key]: true };
      }
    });
    if (!Object.values(fieldErrors).filter(i => i).length) {
      getDemoTourAvailableDates().then(() => setActiveForm(numberOfForm));
    } else {
      setErrors(fieldErrors);
      setPlaceholders(fieldPlaceholders);
    }
  };

  const handleChange = (field, value) => {
    let val = value;
    if (field === 'phone_number') {
      val = formatPhoneNumber(val);
    }
    setDemo({ ...demo, [field]: val });
    if (val.trim().length) {
      setErrors({ ...errors, [field]: false });
      setPlaceholders({ ...placeholders, [field]: defaultPlaceholders[field] });
    }
  };

  return (
    <FormWrapper>
      {activeForm === 1 &&
      <PersonalForm
        demo={demo}
        errors={errors}
        placeholders={placeholders}
        submit={submitPersonalData}
        handleChange={handleChange}
        setErrors={setErrors}
        setPlaceholders={setPlaceholders}
      />}
      {activeForm === 2 &&
      <DateForm
        setActiveForm={setActiveForm}
        date={date}
        setDate={setDate}
        currentDemo={isEmpty(currentDemo) ? '' : currentDemo.external_id}
      />}
      {activeForm === 3 &&
      <TimeForm
        setActiveForm={setActiveForm}
        dateTime={dateTime}
        setDateTime={setDateTime}
        timezone={timezone}
        setTimezone={setTimezone}
      />}
      {activeForm === 4 &&
      <Contacts
        setActiveForm={setActiveForm}
        demo={demo}
        dateTime={dateTime}
        timezone={timezone}
        currentDemo={isEmpty(currentDemo) ? '' : currentDemo.external_id}
      />}
      {activeForm === 5 &&
      <ConfirmForm
        dateTime={dateTime}
        timezone={timezone}
        setActiveForm={setActiveForm}
      />}
      {activeForm === 6 &&
      <CancelForm
        dateTime={dateTime}
        timezone={timezone}
        setActiveForm={setActiveForm}
        currentDemo={currentDemo.external_id}
      />}
    </FormWrapper>
  );
};

const mapStateToProps = state => ({
  currentDemo: state.demoTours.demoTour,
});

export default connect(
  mapStateToProps,
  { ...actions.demoTours },
)(DemoForm);
