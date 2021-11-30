import React, { FC, useState } from 'react';
import { connect } from 'react-redux';
import actions from 'main_page/actions';
import moment from 'moment-timezone';
import { DateBtn, BackBtn, ControlBtns, ContinueBtn, FormTitle, FormDescription, CustomForm, Checkmark } from './styles';

interface DateFormProps {
  availableDates: string[],
  setActiveForm: (form: number) => void,
  date: string,
  setDate: (date: string) => void,
  getDemoTourAvailableTimes: (params: { date: string, demo?: number }) => Promise<string[]>,
  currentDemo: number,
}

const DateForm: FC<DateFormProps> = ({ availableDates, setActiveForm, date, setDate, getDemoTourAvailableTimes, currentDemo }): JSX.Element => {
  const [isError, setIsError] = useState(false);
  const handleContinue = () => {
    if (date) {
      let data = { date } as { date: string, demo?: number };
      if (currentDemo) {
        data = { ...data, demo: currentDemo };
      }
      getDemoTourAvailableTimes(data).then(() => {
        setActiveForm(3);
      });
    } else {
      setIsError(true);
    }
  };

  const handleDateChange = (value) => {
    setDate(value);
    setIsError(false);
  };

  return <>
    <FormTitle> Request a Demo </FormTitle>
    <FormDescription error={isError} className="mt-4 mb-2" > Select a date </FormDescription>
    <CustomForm>
      {availableDates.map(dateItem => (
        <DateBtn key={dateItem} selected={date === dateItem} onClick={() => handleDateChange(dateItem)}>
          {moment(dateItem).format('dddd, MMMM D')}
          {date === dateItem && <Checkmark />}
        </DateBtn>))}
    </CustomForm>
    <ControlBtns>
      <BackBtn onClick={() => setActiveForm(1)}> <i className="ri-arrow-left-s-line" /> </BackBtn>
      <ContinueBtn onClick={handleContinue}> Continue </ContinueBtn>
    </ControlBtns>
  </>;
};

const mapStateToProps = state => ({
  availableDates: state.demoTours.availableDates,
});

export default connect(
  mapStateToProps,
  { ...actions.demoTours },
)(DateForm);

