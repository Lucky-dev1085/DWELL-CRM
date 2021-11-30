import React, { FC, useEffect } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import actions from 'dwell/actions';
import EmailCompose from 'dwell/components/email/composer/_compose';
import 'src/scss/pages/_bulk_email.scss';
import {
  ComposeCardBody,
} from './styles';

interface ComposeProps extends RouteComponentProps {
  currentStep: number,
  parentCallback: (data: string) => void,
  subject: string,
  data: string,
  subjectVariables: string,
  files: Array<File>
  setIsActiveLeadsOnly: (isActiveLeadsOnly: boolean) => null,
  disableNextButton: boolean,
  setCurrentStep: (step: number) => void,
  isPreview: boolean,
  setPreviewState: (isPreview: boolean) => void,
  setEmailLeadId: (leadId: number) => void,
  clearEmailContent: () => void,
}

const Compose: FC<ComposeProps> = (props) => {
  const { currentStep, subject, data, subjectVariables, files, isPreview, clearEmailContent, setEmailLeadId } = props;

  useEffect(() => {
    clearEmailContent();
    setEmailLeadId(null);
  }, []);

  const callbackFunction = (composerData) => {
    const { parentCallback } = props;
    parentCallback(composerData);
  };

  if (currentStep !== 2) {
    return null;
  }
  return (
    <React.Fragment>
      <ComposeCardBody>
        <EmailCompose
          bulkEmail
          isBulkEmailPreview={isPreview}
          parentCallback={callbackFunction}
          subjectBulkEmail={subject}
          dataBulkEmail={data}
          subjectVariablesBulkEmail={subjectVariables}
          filesBulkEmail={files}
        />
      </ComposeCardBody>
    </React.Fragment>
  );
};

export default connect(
  null,
  {
    ...actions.property,
    ...actions.emailMessage,
  },
)(withRouter(Compose));
