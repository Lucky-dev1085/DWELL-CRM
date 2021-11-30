import React, { FC } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Alert, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
import actions from 'dwell/actions';
import 'src/scss/pages/_bulk_email.scss';
import LeadsFilter from 'dwell/components/Leads/LeadsFilterModal/_leadsFilter';
import {
  SelectRecipientsContainer,
  CustomInputLabel,
  CustomFormGroup,
  CustomFormLabel,
  RadioButtons,
} from './styles';

interface SelectRecipientsProps extends RouteComponentProps {
  currentStep: number,
  count: number,
  maxRecipients: number,
  filterType: string,
  updateFilterType: (filterType: string) => null,
}

const SelectRecipients: FC<SelectRecipientsProps> = (props) => {
  const { currentStep, count, maxRecipients, filterType, updateFilterType } = props;
  if (currentStep !== 1) {
    return null;
  }
  return (
    <React.Fragment>
      {count > maxRecipients && <Alert className="animated fadeIn" color="danger"><FontAwesomeIcon className="mr-1" icon={faExclamationTriangle} /> Email blast exceeds max recipients count. Review and update recipient conditions.</Alert>}
      <React.Fragment>
        <SelectRecipientsContainer className="recipients-filter-card-body">
          <CustomFormGroup>
            <CustomFormLabel className="form-label">Select recipients that match the following conditions</CustomFormLabel>
            <RadioButtons>
              <div className="custom-control custom-radio custom-control-inline">
                <Input
                  checked={filterType === 'ALL'}
                  type="radio"
                  id="customRadioInline1"
                  name="customRadioInline1"
                  className="custom-control-input"
                  onClick={() => updateFilterType('ALL')}
                />
                <CustomInputLabel className="custom-control-label" htmlFor="customRadioInline1">All</CustomInputLabel>
              </div>
              <div className="custom-control custom-radio custom-control-inline">
                <Input
                  checked={filterType === 'ANY'}
                  type="radio"
                  id="customRadioInline2"
                  name="customRadioInline1"
                  className="custom-control-input"
                  onClick={() => updateFilterType('ANY')}
                />
                <CustomInputLabel className="custom-control-label" htmlFor="customRadioInline2">Any
                </CustomInputLabel>
              </div>
            </RadioButtons>
          </CustomFormGroup>
          <CustomFormLabel className="form-label">Conditions</CustomFormLabel>
          <LeadsFilter
            {...props}
            isLinkButton={false}
          />
        </SelectRecipientsContainer>
      </React.Fragment>
    </React.Fragment>
  );
};

export default connect(
  null,
  {
    ...actions.emailMessage,
  },
)(withRouter(SelectRecipients));
