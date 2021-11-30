import React, { FC, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { CardBody, CardTitle, Popover, PopoverBody } from 'reactstrap';
import actions from 'dwell/actions';
import 'src/scss/pages/_bulk_email.scss';
import { AppSwitch } from '@coreui/react';
import {
  RecipientsCardTitle,
  RecipientsCard,
  RecipientsCardText,
  RecipientsCardNumber,
  ActiveRecipientsSwitch,
  PreviewEmailButton,
} from './styles';

interface SelectRecipientsProps extends RouteComponentProps {
  currentStep: number,
  count: number,
  maxRecipients: number,
  filterType: string,
  updateFilterType: (filterType: string) => null,
  isActiveLeadsOnly: boolean,
  setIsActiveLeadsOnly: (isActiveLeadsOnly: boolean) => null,
  show: boolean;
  handleShowPreviewModal: () => void;
  previewEmail: () => void;
  dataIsEmpty: boolean;
}

const Recipients: FC<SelectRecipientsProps> = (props) => {
  const [isShowingLimitInfo, setLimitInfo] = useState(false);

  const { currentStep, count, maxRecipients, handleShowPreviewModal, previewEmail, dataIsEmpty, isActiveLeadsOnly, setIsActiveLeadsOnly } = props;

  const handleShowPreview = () => {
    previewEmail();
    handleShowPreviewModal();
  };

  return (
    <React.Fragment>
      <RecipientsCard>
        <CardBody>
          <CardTitle>
            <RecipientsCardTitle>Recipients</RecipientsCardTitle>
          </CardTitle>
          <ActiveRecipientsSwitch className="d-flex align-items-center active-switch">
            Active Recipients Only:
            <AppSwitch className="ml-1" color="info" label checked={isActiveLeadsOnly} onClick={() => setIsActiveLeadsOnly(!isActiveLeadsOnly)} />
          </ActiveRecipientsSwitch>
          <RecipientsCardText className="mb-1">When you send the email blast, it will be delivered to:</RecipientsCardText>
          <RecipientsCardNumber>{count} </RecipientsCardNumber>
          <div>Number of recipients</div>
          <small className="recipients-limit" id="Popover1">Max recipients: {maxRecipients}</small>
          { currentStep === 2 ? (
            <React.Fragment>
              <RecipientsCardText className="mt-3">See a preview of the email blast before you send it out.</RecipientsCardText>
              <PreviewEmailButton onClick={() => handleShowPreview()} disabled={dataIsEmpty}>Preview Email</PreviewEmailButton>
            </React.Fragment>

          ) : (<React.Fragment />)}

          <Popover className="limit-info" trigger="legacy" placement="left" isOpen={isShowingLimitInfo} target="Popover1" toggle={() => setLimitInfo(!isShowingLimitInfo)}>
            <PopoverBody>
              We use your email provider&#39;s send limits and daily email activity to calculate the maximum recipients who can receive your email blast(s) each day.
            </PopoverBody>
          </Popover>
        </CardBody>
      </RecipientsCard>
    </React.Fragment>
  );
};

export default connect(
  null,
  {
    ...actions.emailMessage,
  },
)(withRouter(Recipients));
