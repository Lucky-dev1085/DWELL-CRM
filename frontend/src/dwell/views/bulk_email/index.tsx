import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import CKEditor from 'ckeditor4-react';
import { cloneDeep, isEmpty, set } from 'lodash';
import { Button, Card, CardBody, Row, Col } from 'reactstrap';
import { Helmet } from 'react-helmet';
import actions from 'dwell/actions';
import 'src/scss/pages/_bulk_email.scss';
import { ContainerFluid, ContentTitle, ContentText, ContentHeader, PrimaryButton } from 'styles/common';
import { BulkEmailPreview, BulkEmailSend } from 'dwell/components';
import { DetailResponse } from 'src/interfaces';
import { CardBulk, CardFooterBulk, CardHeaderBulk, CustomCardTitle, NavCircle, NavLinkCircle, EmptyFollowups, BulkContentBody } from './styles';
import Recipients from './_recipients';
import SelectRecipients from './_selectRecipients';
import Compose from './_compose';

declare global {
  interface Window { CKEDITOR: CKEditor }
}

interface FilterItemsProps {
  compare_field: string,
  compare_operator: string,
  compare_value: Array<string>,
}

interface DefaultLeadsFilterProps {
  name: number,
  filter_items: Array<FilterItemsProps>,
  focused: boolean,
  filter_type: string,
  check_lead_owner? : boolean,
  is_active_only?: boolean,
}

const defaultLeadsFilter: DefaultLeadsFilterProps = {
  name: (Date.now()),
  filter_items: [{ compare_field: 'created', compare_operator: 'IS_ON', compare_value: [moment().format('YYYY-MM-DD')] }],
  focused: false,
  filter_type: 'ALL',
};

const defaultComposerData = {
  data: '',
  subject: '',
  checkedVariables: [],
  checkedSubjectVariables: [],
  subjectPreview: '',
  dataPreview: '',
  subjectVariables: [],
  files: [],
};

interface PropertyProps {
  sent_email_count: number,
  external_id: string,
  nylas_status: string,
}

interface FormDataProps {
  append(name: string, value: string): void
}

interface BulkEmailProps extends RouteComponentProps {
  getFilteredLeadsCount: (data: DefaultLeadsFilterProps) => Promise<DetailResponse>,
  property: PropertyProps,
  filteredCount: number,
  sendBulkEmail: (formData: FormDataProps) => Promise<null>,
  isSubmitting: boolean,
}

const BulkEmail: FC<BulkEmailProps> = ({ getFilteredLeadsCount, property, filteredCount: count, sendBulkEmail, history: { push }, isSubmitting }) => {
  const maxRecipients = 800;
  const [currentStep, setCurrentStep] = useState(1);
  const [filteredCount, setFilteredCount] = useState(0);
  const [sentEmailCount, setSentEmailCount] = useState(0);
  const [composerData, setComposerData] = useState(defaultComposerData);
  const [checkLeadOwner, setCheckLeadOwner] = useState<boolean>(false);
  const [leadsFilter, setLeadsFilter] = useState<DefaultLeadsFilterProps>(defaultLeadsFilter);
  const [isActiveLeadsOnly, setIsActiveLeadsOnly] = useState<boolean>(true);
  const [isPreview, setPreviewState] = useState(false);
  const [isShowingPreviewModal, setShowingPreviewModal] = useState(false);
  const [isShowingSendModal, setShowingSendModal] = useState(false);

  useEffect(() => {
    setFilteredCount(count);
  }, [count]);

  useEffect(() => {
    if (isActiveLeadsOnly && leadsFilter.filter_items.some(item => item.compare_field === 'status')) {
      setIsActiveLeadsOnly(false);
    }
  }, [leadsFilter]);

  useEffect(() => {
    getFilteredLeadsCount({ ...leadsFilter, check_lead_owner: checkLeadOwner, is_active_only: isActiveLeadsOnly });
    if (!isEmpty(property)) {
      setSentEmailCount(property.sent_email_count);
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(property)) {
      setSentEmailCount(property.sent_email_count);
    }
  }, [property]);

  const updateRecipientsCount = (id, filter, isUpdate = false) => {
    getFilteredLeadsCount({ ...filter, check_lead_owner: checkLeadOwner, is_active_only: isActiveLeadsOnly }).then(({ result: { data } }) => {
      setLeadsFilter(filter);
      if (isUpdate) setFilteredCount(data.count);
    });
  };

  useEffect(() => {
    getFilteredLeadsCount({ ...leadsFilter, check_lead_owner: checkLeadOwner, is_active_only: isActiveLeadsOnly });
  }, [isActiveLeadsOnly]);

  const updateRecipientsFilter = (filter, newLeadsFilter) => {
    if (newLeadsFilter.filter_items.filter(item => !item.compare_operator || (!item.compare_value[0] && item.compare_operator !== 'IS_NOT_SET')
      || (item.compare_operator === 'IS_BETWEEN' && !item.compare_value[1])).length === 0) {
      const updateFilter = newLeadsFilter.filter_items.length < filter.filter_items.length;
      updateRecipientsCount(filter.id, newLeadsFilter, updateFilter);
    } else {
      setLeadsFilter(newLeadsFilter);
      setFilteredCount(0);
    }
  };

  const updateFilterType = (type) => {
    let newLeadsFilter = { ...cloneDeep(leadsFilter) };
    newLeadsFilter = set(newLeadsFilter, 'filter_type', type);
    updateRecipientsFilter(leadsFilter, newLeadsFilter);
  };

  const handleAddCondition = () => {
    const newLeadsFilter = { ...leadsFilter, filter_items: [...leadsFilter.filter_items, { compare_field: 'created', compare_operator: 'IS_ON', compare_value: [] }] };
    updateRecipientsFilter(leadsFilter, newLeadsFilter);
  };

  const handleDeleteCondition = (deleteIndex) => {
    const newLeadsFilter = { ...leadsFilter, filter_items: leadsFilter.filter_items.filter((item, index) => index !== deleteIndex) };
    updateRecipientsFilter(leadsFilter, newLeadsFilter);
  };

  useEffect(() => {
    const activeStatusIndex = leadsFilter.filter_items.findIndex(item => item.compare_field === 'status');
    if (isActiveLeadsOnly && activeStatusIndex !== -1) {
      setIsActiveLeadsOnly(false);
    }
  }, [isActiveLeadsOnly]);

  const handleInputChange = ({ target: { id, value } }, compareValueId = '', compareOperatorId = '') => {
    let newLeadsFilter = { ...cloneDeep(leadsFilter) };
    newLeadsFilter = set(newLeadsFilter, id, value);
    if (value === 'IS_NOT_SET') {
      newLeadsFilter = set(newLeadsFilter, `${id.substr(0, id.lastIndexOf('.') + 1)}compare_value`, []);
    }
    if (compareValueId) {
      newLeadsFilter = set(newLeadsFilter, compareValueId, '');
    }
    if (compareOperatorId) {
      newLeadsFilter = set(
        newLeadsFilter, compareOperatorId,
        ['created', 'updated', 'move_in_date', 'pms_sync_date', 'next_task_due_date', 'last_activity_date', 'last_followup_date'].includes(value) ? 'IS_ON' : 'IS',
      );
    }
    updateRecipientsFilter(leadsFilter, newLeadsFilter);
  };

  const handleMultiSelectChange = (selectedOptions, id) => {
    let newLeadsFilter = { ...cloneDeep(leadsFilter) };
    newLeadsFilter = set(newLeadsFilter, id, selectedOptions.map(option => option.value));
    updateRecipientsFilter(leadsFilter, newLeadsFilter);
  };

  const handleSimpleInputChange = ({ target: { id, value } }) => {
    let newLeadsFilter = { ...cloneDeep(leadsFilter) };
    newLeadsFilter = set(newLeadsFilter, id, value);
    const newFilteredCount = newLeadsFilter.filter_items.filter(item => !item.compare_operator || (!item.compare_value[0] && item.compare_operator !== 'IS_NOT_SET')
      || (item.compare_operator === 'IS_BETWEEN' && !item.compare_value[1])).length === 0 ? filteredCount : 0;
    setLeadsFilter(newLeadsFilter);
    setFilteredCount(newFilteredCount);
  };

  const handleSimpleInputOnBlur = ({ target: { id, value } }) => {
    let newLeadsFilter = { ...cloneDeep(leadsFilter) };
    newLeadsFilter = set(newLeadsFilter, id, value);
    updateRecipientsFilter(leadsFilter, newLeadsFilter);
  };

  const callbackFunction = (data) => {
    const newCheckLeadOwner = Object.keys(data.checkedSubjectVariables).includes('lead_owner') || Object.keys(data.checkedVariables).includes('lead_owner');
    if (checkLeadOwner !== newCheckLeadOwner) {
      getFilteredLeadsCount({
        ...leadsFilter,
        check_lead_owner: newCheckLeadOwner,
        is_active_only: isActiveLeadsOnly,
      }).then(() => {
        setCheckLeadOwner(newCheckLeadOwner);
      });
    }
    setComposerData(data);
  };

  const sendEmailBlast = () => {
    const { subjectPreview, dataPreview, checkedSubjectVariables, checkedVariables, files } = composerData;
    const formData = new FormData();
    if (files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    formData.append(
      'message_data',
      JSON.stringify({ filter_items: leadsFilter.filter_items,
        filter_type: leadsFilter.filter_type,
        subject: subjectPreview,
        body: dataPreview,
        subject_variables: Object.keys(checkedSubjectVariables),
        body_variables: Object.keys(checkedVariables),
        check_lead_owner: checkLeadOwner,
        is_active_only: isActiveLeadsOnly,
      }),
    );
    sendBulkEmail(formData)
      .then(() => {
        push(`/${property.external_id}/followups`);
      });
  };

  const isStep2Disabled = (filteredCnt, maxRecipientsCnt, sentEmailCnt) => filteredCnt > (maxRecipientsCnt - sentEmailCnt)
      || filteredCnt === 0 || leadsFilter.filter_items.some(item => isEmpty(item.compare_value) && item.compare_operator !== 'IS_NOT_SET');
  const isStep3Disabled = (data, subject, checkedVariables, checkedSubjectVariables, filteredCnt) => filteredCnt === 0 || !data || !subject || (data.length === 0 || subject.length === 0
    || Object.entries(checkedVariables).filter(([key, value]) => !['lead_first_name', 'lead_full_name', 'lead_owner'].includes(key) && !value).length > 0
    || Object.entries(checkedSubjectVariables).filter(([key, value]) => !['lead_first_name', 'lead_full_name', 'lead_owner'].includes(key) && !value).length > 0);

  const changeStep = (stepNumber) => {
    const { subject, data, checkedSubjectVariables, checkedVariables } = composerData;
    switch (stepNumber) {
      case 1: {
        setCurrentStep(stepNumber);
        break;
      }
      case 2: {
        if (!isStep2Disabled(filteredCount, maxRecipients, sentEmailCount)) {
          setCurrentStep(stepNumber);
        }
        break;
      }
      case 3: {
        if (!isStep3Disabled(data, subject, checkedVariables, checkedSubjectVariables, filteredCount)) {
          setCurrentStep(stepNumber);
        }
        break;
      }
      default: break;
    }
  };

  const previewEmail = () => {
    const { CKEDITOR } = window;
    const editor = CKEDITOR.instances[Object.keys(CKEDITOR.instances)[0]];
    editor.setReadOnly(!isPreview);
    setPreviewState(!isPreview);
  };

  const handlePreviewModalClose = () => {
    previewEmail();
    setShowingPreviewModal(false);
  };

  const handleShowPreviewModal = () => {
    setShowingPreviewModal(true);
  };

  const handleSendModalClose = () => {
    setShowingSendModal(false);
  };

  const handleOpenSendModal = () => {
    previewEmail();
    setShowingPreviewModal(false);
    setShowingSendModal(true);
  };

  const { subject, data, checkedSubjectVariables, checkedVariables, subjectPreview, subjectVariables, files } = composerData;
  const { filter_items: filterItems, filter_type: filterType } = leadsFilter;
  const disableNextButton = (currentStep === 1 && isStep2Disabled(filteredCount, maxRecipients, sentEmailCount)) ||
                        (currentStep === 2 && isStep3Disabled(data, subject, checkedVariables, checkedSubjectVariables, filteredCount)) || isSubmitting;

  return (
    <ContainerFluid fluid>
      <Helmet>
        <title>DWELL | Bulk Emails</title>
      </Helmet>
      <ContentHeader>
        <div className="mg-r-auto mb-1">
          <ContentTitle>Bulk Email</ContentTitle>
          <ContentText>{currentStep === 1 ? 'Choose who will receive this email blast?' : 'Compose email blast for selected recipients'}</ContentText>
        </div>
      </ContentHeader>
      <BulkContentBody>
        {(property.nylas_status === '') ?
          <Card className="empty-followups-card animated fadeIn">
            <CardBody>
              <div className="empty-followups">
                <EmptyFollowups>Enable Dwell Bulk Emails</EmptyFollowups>
                <div>When you sync your work email account with Dwell, you can use our inbox to send emails to leads and automatically link conversations to leads directly from Dwell.</div>
                <button className="btn btn-primary mt-3" onClick={() => push(`/${property.external_id}/settings`, { tab: 2 })}>Get started</button>
              </div>
            </CardBody>
          </Card> : (
            <React.Fragment>
              <Row>
                <Col xs="9">
                  <CardBulk>
                    <CardHeaderBulk>
                      <div className="mg-r-auto">
                        <CustomCardTitle>{ currentStep === 1 ? 'Select Recipients' : 'Compose Message' }</CustomCardTitle>
                      </div>
                      <NavCircle>
                        {property.nylas_status !== '' && (
                          <React.Fragment>
                            <NavLinkCircle className={currentStep >= 2 ? 'step-circle done' : 'step-circle active'} onClick={() => changeStep(1)}>1</NavLinkCircle>
                            <NavLinkCircle className={currentStep >= 2 ? 'step-circle active' : 'step-circle'} onClick={() => changeStep(2)}>2</NavLinkCircle>
                          </React.Fragment>
                        )}
                      </NavCircle>
                    </CardHeaderBulk>
                    <SelectRecipients
                      count={filteredCount}
                      currentStep={currentStep}
                      filterItems={filterItems}
                      handleAddCondition={handleAddCondition}
                      handleDeleteCondition={handleDeleteCondition}
                      handleInputChange={handleInputChange}
                      handleSimpleInputChange={handleSimpleInputChange}
                      maxRecipients={maxRecipients - sentEmailCount}
                      handleSimpleInputOnBlur={handleSimpleInputOnBlur}
                      handleMultiSelectChange={handleMultiSelectChange}
                      filterType={filterType}
                      updateFilterType={updateFilterType}
                      isActiveLeadsOnly={isActiveLeadsOnly}
                      setIsActiveLeadsOnly={setIsActiveLeadsOnly}
                      setCurrentStep={setCurrentStep}
                      disableNextButton={disableNextButton}
                    />
                    <Compose
                      currentStep={currentStep}
                      parentCallback={callbackFunction}
                      subject={subject}
                      data={data}
                      subjectVariables={subjectVariables}
                      files={files}
                      isActiveLeadsOnly={isActiveLeadsOnly}
                      setCurrentStep={setCurrentStep}
                      disableNextButton={disableNextButton}
                      isPreview={isPreview}
                      setPreviewState={setPreviewState}
                    />
                    <CardFooterBulk>
                      {currentStep !== 1 && <Button onClick={() => setCurrentStep(currentStep - 1)} className="btn-white mr-1" disabled={isSubmitting}>Back</Button>}
                      {currentStep === 1 &&
                          <PrimaryButton
                            color={disableNextButton ? 'secondary' : 'primary'}
                            onClick={() => setCurrentStep(currentStep + 1)}
                            disabled={disableNextButton}
                            className="btn float-right"
                          >
                            Next
                          </PrimaryButton>}
                      {currentStep === 2 &&
                      <PrimaryButton
                        className="btn float-right ml-1 send-btn"
                        color={(isEmpty(data) || isEmpty(subjectPreview)) ? 'secondary' : 'primary'}
                        onClick={() => setShowingSendModal(true)}
                        disabled={(isEmpty(data) || isEmpty(subjectPreview))}
                      >Ready to send?
                      </PrimaryButton>}
                    </CardFooterBulk>
                  </CardBulk>
                </Col>
                <Col xs="3">
                  <Recipients
                    currentStep={currentStep}
                    count={filteredCount}
                    maxRecipients={maxRecipients - sentEmailCount}
                    isActiveLeadsOnly={isActiveLeadsOnly}
                    setIsActiveLeadsOnly={setIsActiveLeadsOnly}
                    isPreview={isPreview}
                    show={isShowingPreviewModal}
                    handleShowPreviewModal={handleShowPreviewModal}
                    previewEmail={previewEmail}
                    dataIsEmpty={(isEmpty(data) || isEmpty(subjectPreview))}
                  />
                </Col>
              </Row>
            </React.Fragment>
          )}
      </BulkContentBody>
      <BulkEmailSend
        show={isShowingSendModal}
        handleClose={handleSendModalClose}
        sendEmailBlast={sendEmailBlast}
        data={subjectPreview}
        count={count}
      />
      <BulkEmailPreview
        show={isShowingPreviewModal}
        handleClose={handlePreviewModalClose}
        handleOpenSendModal={handleOpenSendModal}
        data={composerData.dataPreview}
        subject={subjectPreview}
      />
    </ContainerFluid>
  );
};

const mapStateToProps = state => ({
  isSubmitting: state.emailMessage.isSubmitting,
  filteredCount: state.lead.filteredCount,
  property: state.property.property,
});

export default connect(
  mapStateToProps,
  {
    ...actions.leadsFilter,
    ...actions.lead,
    ...actions.property,
    ...actions.emailMessage,
  },
)(withRouter(BulkEmail));
