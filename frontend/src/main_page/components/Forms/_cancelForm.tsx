import React, { useState, FC } from 'react';
import { connect } from 'react-redux';
import actions from 'main_page/actions';
import moment from 'moment-timezone';
import { DemoTourProps, DetailResponse } from 'src/interfaces';
import { DEMO_EXTERNAL_ID } from 'main_page/constants';
import { FormTitle, CustomForm, CancelButton, ActionBtn, Content, EmailLink, CancelContactInfo, CustomStrong } from './styles';

interface CancelFormProps {
  currentDemo: string,
  dateTime: string,
  timezone: string,
  setActiveForm: (form: number) => void,
  updateDemoTourById: (id: string, data: DemoTourProps) => Promise<DetailResponse>,
}

const CancelForm: FC<CancelFormProps> = ({ setActiveForm, updateDemoTourById, currentDemo, dateTime, timezone }): JSX.Element => {
  const [isCancelled, setIsCancelled] = useState(false);

  const confirmCancel = () => setActiveForm(1);
  const handleCancel = () => {
    updateDemoTourById(currentDemo, { is_cancelled: true }).then(() => {
      setIsCancelled(true);
      localStorage.removeItem(DEMO_EXTERNAL_ID);
    });
  };

  return (
    <>
      <FormTitle>{ isCancelled ? 'Demo Cancelled' : 'Cancel Demo' }</FormTitle>
      <CustomForm>
        <CancelContactInfo style={{ display: 'block' }}>
          { isCancelled
            ? <>Your <CustomStrong>{moment(dateTime).tz(timezone).format('dddd, MMMM D')}</CustomStrong> demo has been cancelled.</>
            : 'Are you sure you wish to cancel your DWELL demo?' }
        </CancelContactInfo>
        {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
        { isCancelled && (<Content><CancelContactInfo style={{ display: 'block' }}> Alternatively, say hi anytime <EmailLink href="mailto:hello@dwell.io">hello@dwell.io</EmailLink></CancelContactInfo></Content>)}
      </CustomForm>
      { isCancelled ?
        (<div style={{ zIndex: 1 }}> <ActionBtn onClick={confirmCancel}> Close </ActionBtn> </div>) : (
          <div style={{ zIndex: 1 }}>
            <CancelButton onClick={handleCancel}> YES, CANCEL THE DEMO </CancelButton>
            <ActionBtn onClick={() => setActiveForm(5)}> NO, KEEP THE DEMO </ActionBtn>
          </div>
        )}
    </>
  );
};

export default connect(
  null,
  { ...actions.demoTours },
)(CancelForm);

