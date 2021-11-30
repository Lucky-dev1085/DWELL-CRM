import React, { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import actions from 'dwell/actions';
import { cloneDeep, isEmpty } from 'lodash';
import styled from 'styled-components';
import { ListResponse, DetailResponse, AssignLeadOwnerProps } from 'src/interfaces';
import { toast, ToastOptions } from 'react-toastify';
import { toastOptions } from 'site/constants';
import {
  ContentText,
  ContentTitleSm,
  Divider,
  FormGroupBar,
  FormLabel,
  SettingsFooter,
  SettingsPrimaryButton,
} from 'dwell/views/Settings/styles';
import UsersDropdown from './_users_dropdown';

const FormSwitch = styled.button`
    border: none;
    margin-left: 10px;
    margin-bottom: 0;
    width: 30px;
    height: 16px;
    background-color: ${props => (props.checked ? props.theme.colors.green : props.theme.colors.gray400)};
    border-radius: 10px;
    position: relative;
    transition: background-color 0.25s;
    cursor: pointer;

    &:focus {
        outline: none;
    }

    &:before {
      content: '';
      width: 12px;
      height: 12px;
      background-color: #fff;
      border-radius: 100%;
      position: absolute;
      top: 2px;
      left: ${props => (props.checked ? '16px' : '2px')};
      transition: left 0.25s;
    }
`;

const FormSwitchWrapper = styled.div`
    position: absolute;
    top: 25px;
    right: 30px;
    display: flex;
    align-items: center;
    color: ${props => props.theme.colors.colortx02};
    font-size: 13px;
`;

const initialWeekdays = {
  Monday: { user: null },
  Tuesday: { user: null },
  Wednesday: { user: null },
  Thursday: { user: null },
  Friday: { user: null },
  Saturday: { user: null },
  Sunday: { user: null },
};

interface AssignLeadOwnersProps {
  getAssignLeadOwners: () => Promise<ListResponse>,
  assignLeadOwners: AssignLeadOwnerProps,
  createAssignLeadOwners: (data: AssignLeadOwnerProps, msg: () => void) => Promise<DetailResponse>,
  updateAssignLeadOwnersById: (id: number, data: AssignLeadOwnerProps) => Promise<DetailResponse>,
  isSubmitting: boolean,
}

const AssignLeadOwners: FC<AssignLeadOwnersProps> = ({ getAssignLeadOwners, assignLeadOwners, createAssignLeadOwners,
  updateAssignLeadOwnersById, isSubmitting }) => {
  const [weekdays, setWeekdays] = useState(initialWeekdays);
  const [status, setStatus] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const getLeadOwnersSettings = () => {
    if (!isEmpty(assignLeadOwners)) {
      const resultWeekdays = cloneDeep(initialWeekdays);
      Object.keys(weekdays)
        .forEach((key) => {
          resultWeekdays[key].user = assignLeadOwners[key.toLowerCase()];
        });
      setWeekdays(resultWeekdays);
      setStatus(assignLeadOwners.is_enabled);
    }
  };

  useEffect(() => {
    getAssignLeadOwners().then(() => {
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    getLeadOwnersSettings();
  }, [assignLeadOwners]);

  const handleChange = (id, value) => {
    const resultWeekdays = cloneDeep(weekdays);
    resultWeekdays[id].user = value;
    setWeekdays(resultWeekdays);
  };

  const handleSave = () => {
    const data = {
      monday: weekdays.Monday.user,
      tuesday: weekdays.Tuesday.user,
      wednesday: weekdays.Wednesday.user,
      thursday: weekdays.Thursday.user,
      friday: weekdays.Friday.user,
      saturday: weekdays.Saturday.user,
      sunday: weekdays.Sunday.user,
      is_enabled: status,
    };
    if (!isEmpty(assignLeadOwners)) {
      updateAssignLeadOwnersById(assignLeadOwners.id, data);
    } else {
      createAssignLeadOwners(data, () => toast.success('New lead owner assignments made', toastOptions as ToastOptions)).then(() => {
        getLeadOwnersSettings();
        setLoaded(true);
      });
    }
  };

  return (
    <React.Fragment>
      <ContentTitleSm>Assign Lead Owners</ContentTitleSm>
      <ContentText>Automatically assign lead owners to new leads created from Mark-Taylor property website.</ContentText>
      <FormSwitchWrapper>Enable <FormSwitch checked={status} onClick={() => setStatus(!status)} /></FormSwitchWrapper>
      <Divider />
      {Object.keys(weekdays).map((key, index) => (
        <FormGroupBar key={index}>
          <FormLabel>{key}s</FormLabel>
          <UsersDropdown weekdays={weekdays} onClick={handleChange} dayName={key} />
        </FormGroupBar>))}
      <SettingsFooter>
        <SettingsPrimaryButton onClick={handleSave} disabled={!loaded || isSubmitting} >Save Changes</SettingsPrimaryButton>
      </SettingsFooter>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  assignLeadOwners: state.assignLeadOwners.assignLeadOwners,
  isSubmitting: state.assignLeadOwners.isSubmitting,
});

export default connect(
  mapStateToProps,
  {
    ...actions.assignLeadOwners,
  },
)(AssignLeadOwners);
