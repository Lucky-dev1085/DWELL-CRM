import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { connect } from 'react-redux';
import actions from 'dwell/actions';
import { isEmpty } from 'lodash';
import { ContentText, ContentTitleSm, Divider, FormGroupBar, FormLabel, SettingsFooter, SettingsPrimaryButton } from 'dwell/views/Settings/styles';
import { HeaderRow, HeaderColumn, FormBarColumn, FormSwitchWrapper, HeaderTime } from 'dwell/views/Settings/BusinessHours/styles';
import { DetailResponse, ListResponse } from 'src/interfaces';
import TimeDropdown from './_timeDropdown';

const initialWeekdays = [
  { weekday: 0, start_time: '09:00:00', end_time: '17:30:00', is_workday: true },
  { weekday: 1, start_time: '09:00:00', end_time: '17:30:00', is_workday: true },
  { weekday: 2, start_time: '09:00:00', end_time: '17:30:00', is_workday: true },
  { weekday: 3, start_time: '09:00:00', end_time: '17:30:00', is_workday: true },
  { weekday: 4, start_time: '09:00:00', end_time: '17:30:00', is_workday: true },
  { weekday: 5, start_time: '09:00:00', end_time: '17:30:00', is_workday: true },
  { weekday: 6, start_time: '09:00:00', end_time: '17:30:00', is_workday: true },
];

interface WeekdayProps { weekday: number, start_time: string, end_time: string, is_workday: boolean }

interface BusinessHoursProps extends RouteComponentProps {
  getBusinessHours: () => Promise<ListResponse>,
  businessHours: WeekdayProps[],
  isSubmitting: boolean,
  createBusinessHours: (data: { business_hours: WeekdayProps[]}) => Promise<DetailResponse>,
  updateBusinessHours: (data: { business_hours: WeekdayProps[]}) => Promise<DetailResponse>,
}

const BusinessHours: FC<BusinessHoursProps> = ({ getBusinessHours, businessHours, createBusinessHours, updateBusinessHours, isSubmitting }) => {
  const [weekdays, setWeekdays] = useState(initialWeekdays);
  const [loaded, setLoaded] = useState(false);
  const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const loadBusinessHours = () => {
    getBusinessHours().then(() => {
      setLoaded(true);
    });
  };

  useEffect(() => {
    loadBusinessHours();
  }, []);

  useEffect(() => {
    if (!isEmpty(businessHours)) {
      setWeekdays(businessHours.sort((a, b) => a.weekday - b.weekday));
    }
  }, [businessHours]);

  const handleChangeWorkday = (dayName, isWorkday) => {
    setWeekdays(weekdays.map(item => ({ ...item, is_workday: item.weekday === dayName ? isWorkday : item.is_workday })));
  };

  const handleChangeTime = (dayName, time, field) => {
    setWeekdays(weekdays.map(item => ({ ...item, [field]: item.weekday === dayName ? time : item[field] })));
  };

  // const resetBusinessHours = () => {
  //   if (!isEmpty(businessHours)) {
  //     setWeekdays(businessHours.sort((a, b) => a.weekday - b.weekday));
  //   } else {
  //     setWeekdays(initialWeekdays);
  //   }
  // };

  const handleSaveBusinessHours = () => {
    if (!isEmpty(businessHours)) {
      updateBusinessHours({ business_hours: weekdays }).then(() => loadBusinessHours());
    } else {
      createBusinessHours({ business_hours: weekdays }).then(() => loadBusinessHours());
    }
  };

  return (
    <React.Fragment>
      <ContentTitleSm>Business Hours</ContentTitleSm>
      <ContentText>Set property work days and hours to be used to calculate the average response time to leads during business hours.</ContentText>
      <Divider />
      <HeaderRow>
        <HeaderColumn sm={5}>Days</HeaderColumn>
        <HeaderColumn sm={2} className="open-slider-header">Open</HeaderColumn>
        <HeaderColumn xs={5}>
          <Row >
            <HeaderTime sm={6}>Start Time</HeaderTime>
            <HeaderTime sm={6}>End Time</HeaderTime>
          </Row>
        </HeaderColumn>
      </HeaderRow>
      {weekdays.map((item, index) => (
        <FormGroupBar key={index} style={{ height: '56px', borderColor: '#e9eaf0' }}>
          <Col sm={12}>
            <Row>
              <FormBarColumn sm={5}><FormLabel >{WEEKDAYS[item.weekday]}</FormLabel></FormBarColumn>
              <FormBarColumn sm={2}>
                <FormSwitchWrapper label checked={item.is_workday} onClick={() => handleChangeWorkday(item.weekday, !item.is_workday)} />
              </FormBarColumn>
              <Col xs={5}>
                <Row >
                  <FormBarColumn sm={6}><TimeDropdown onClick={handleChangeTime} weekday={item} checked={item.is_workday} field="start_time" /></FormBarColumn>
                  <FormBarColumn sm={6}><TimeDropdown onClick={handleChangeTime} weekday={item} checked={item.is_workday} field="end_time" /></FormBarColumn>
                </Row>
              </Col>
            </Row>
          </Col>
        </FormGroupBar>))}
      <SettingsFooter>
        <SettingsPrimaryButton onClick={() => handleSaveBusinessHours()} disabled={!loaded || isSubmitting} >Save Changes</SettingsPrimaryButton>
      </SettingsFooter>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  businessHours: state.businessHours.businessHours,
  isSubmitting: state.businessHours.isSubmitting,
});

BusinessHours.defaultProps = {
  businessHours: [],
};

export default connect(
  mapStateToProps,
  {
    ...actions.businessHours,
  },
)(withRouter(BusinessHours));
