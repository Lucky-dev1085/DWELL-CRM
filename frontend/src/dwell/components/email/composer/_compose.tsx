import React, { useEffect, useState, FC } from 'react';
import CKEditor from 'ckeditor4-react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import { faEye } from '@fortawesome/free-regular-svg-icons/faEye';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isEmpty } from 'codemirror/src/util/misc';
import { Mention, MentionsInput } from 'react-mentions';
import { emailTemplateTypes, emailVariables, paths } from 'dwell/constants';
import { Alert, Button, ButtonDropdown, Card, CardBody, Col, CustomInput, DropdownItem, DropdownMenu, DropdownToggle, Input, InputGroup, InputGroupAddon, ListGroup, ListGroupItem, Popover, PopoverBody, Row, Spinner, Tooltip } from 'reactstrap';
import actions from 'dwell/actions';
import FileUpload from 'dwell/components/FileUpload';
import 'src/scss/pages/_email_compose.scss';
import 'spinkit/css/spinkit.css';
import { getPropertyId } from 'src/utils';
import { PrimaryButton, WhiteButton } from 'styles/common';
import { PropertyProps, EmailTemplateProps, EmailMessageProps, CustomBlob } from 'src/interfaces';
import { UploadIconButton, UploadTextButton } from 'dwell/views/lead/layout/styles';

interface Lead {
  id: number,
  first_name: string,
  last_name: string,
  email: string,
  owner: number
}

interface EmailComposeProps extends RouteComponentProps {
  properties?: PropertyProps[],
  emailTemplates: EmailTemplateProps[],
  lead?: Lead,
  message?: EmailMessageProps,
  sendMessage: (msg: FormData) => Promise<void>,
  isSendingEmail: boolean,
  getEmailConversations: (param: { lead_id: number }) => void,
  currentProperty?: PropertyProps,
  bulkEmail?: boolean,
  isBulkEmailPreview?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parentCallback?: (data: any) => void,
  subjectBulkEmail?: string,
  dataBulkEmail?: string,
  filesBulkEmail?: CustomBlob[],
  subjectVariablesBulkEmail?: string[],
  getEmailTemplates: () => void,
  handleClose?: () => void,
  isReply?: boolean,
  data: string,
  setData?: (data: string) => void,
  isShowingCc?: boolean,
  setIsShowingCc?: (isShow: boolean) => void,
  subject?: string,
  setSubject?: (subject: string) => void,
  cc?: string,
  setCc?: (cc: string) => void,
  selectedTemplateId?: number,
  setSelectedTemplateId?: (id: string | number) => void,
  subjectVariables?: () => void,
  setSubjectVariables?: (variables: string[]) => void,
  files?: CustomBlob[],
  setFiles?: (files: CustomBlob[]) => void,
  isCommunicationReply?: boolean,
}

const EmailCompose: FC<EmailComposeProps> = ({ properties, message, lead, bulkEmail, subjectBulkEmail, dataBulkEmail, subjectVariablesBulkEmail, filesBulkEmail, getEmailTemplates,
  parentCallback, isBulkEmailPreview, history: { push }, emailTemplates, sendMessage, location: { pathname }, getEmailConversations, isSendingEmail,
  currentProperty, handleClose, isReply, data, setData, isShowingCc, setIsShowingCc, subject, setSubject, cc, setCc, selectedTemplateId, setSelectedTemplateId,
  subjectVariables, setSubjectVariables, files, setFiles, isCommunicationReply }) => {
  CKEditor.editorUrl = `${window.location.origin}/static/ckeditor/ckeditor.js`;
  const [sender, setSender] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [receiver, setReceiver] = useState({});
  const [isPreview, setIsPreview] = useState(false);
  const [sendFollowupEmail, setSendFollowupEmail] = useState(true);
  const [isShowingReminderInfo, setIsShowingReminderInfo] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const parseVariables = (body) => {
    const emailVars = body.match(/\[=(.*?)=\]/g);
    let variableTitles = [];
    if (emailVars) {
      // eslint-disable-next-line no-useless-escape
      variableTitles = emailVars.map(v => v.replace(/[\[=\]]/g, ''));
    }
    return Object.keys(emailVariables.VARIABLES)
      .filter(key => variableTitles.includes(emailVariables.VARIABLES[key].name));
  };

  const checkVariables = (variables) => {
    const checkedVariables = {};
    (variables || []).forEach((v) => {
      const parsedVariable = { object: v.split(/_(.+)/)[0], field: v.split(/_(.+)/)[1] };
      checkedVariables[v] = undefined;
      if (parsedVariable.object === 'lead') {
        if (lead) {
          if (parsedVariable.field === 'full_name' && lead.first_name && lead.last_name) {
            if (lead.first_name === '-' && lead.last_name === '-') {
              checkedVariables[v] = 'potential resident';
            } else {
              checkedVariables[v] = `${lead.first_name} ${lead.last_name}`;
            }
          } else if (parsedVariable.field === 'first_name' && lead.first_name === '-') {
            checkedVariables[v] = 'potential resident';
          } else if (parsedVariable.field === 'owner') {
            const owner = currentProperty.users.find(user => user.id === lead.owner);
            checkedVariables[v] = owner ? `${owner.first_name} ${owner.last_name}` : undefined;
          } else if (lead[parsedVariable.field]) {
            checkedVariables[v] = lead[parsedVariable.field];
          }
        }
      }
      if (parsedVariable.object === 'property' && currentProperty) {
        if (parsedVariable.field === 'address' && currentProperty.town && currentProperty.city) {
          checkedVariables[v] = `${currentProperty.city}, ${currentProperty.town}`;
        } else if (parsedVariable.field === 'website') {
          checkedVariables[v] = currentProperty.domain;
        } else if (parsedVariable.field === 'phone_number') {
          checkedVariables[v] = currentProperty.tracking_number;
        } else if (parsedVariable.field === 'website_link') {
          checkedVariables[v] = `<a href="https://${currentProperty.domain}?chat_open" target="_blank">here</a>`;
        } else if (currentProperty[parsedVariable.field]) {
          checkedVariables[v] = currentProperty[parsedVariable.field];
        }
      }
      if (v === 'virtual_tour_link') {
        checkedVariables[v] = `https://${currentProperty.domain}/virtual-tour`;
      }
    });
    return checkedVariables;
  };

  const getPreview = (type) => {
    let previewData = type === 'body' ? data : subject;
    const checkedVariables = checkVariables(type === 'body' ? parseVariables(data) : subjectVariables);
    Object.keys(checkedVariables)
      .forEach((key) => {
        if (checkedVariables[key]) {
          const pattern = type === 'body'
            ? `<span class="email-placeholder">[=${emailVariables.VARIABLES[key].name}=]</span>`
            : `[=${emailVariables.VARIABLES[key].name}=]`;
          previewData = previewData.replace(
            // eslint-disable-next-line no-useless-escape
            new RegExp(pattern.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1'), 'g'),
            `${checkedVariables[key]}`,
          );
        }
      });
    return previewData;
  };

  useEffect(() => {
    if (window.CKEDITOR) {
      const instanceNumber = isEmpty(message) ? 1 : 0;
      const instance = window.CKEDITOR.instances[Object.keys(window.CKEDITOR.instances)[instanceNumber]];
      if (instance) {
        let retryCount = 0;
        const delayedSetReadOnly = () => {
          if (instance.editable() === undefined && retryCount < 10) {
            setTimeout(delayedSetReadOnly, retryCount * 100);
          } else {
            instance.setReadOnly(isPreview);
          }
          retryCount += 1;
        };
        setTimeout(delayedSetReadOnly, 50);
      }
    }
  }, [isPreview]);

  const initialize = () => {
    setSender({ email: currentProperty.shared_email, name: `${currentProperty.name} team` });
    setReceiver(!isEmpty(message) ? { email: message.sender_email, name: message.sender_name } : { email: lead.email, name: `${lead.first_name} ${lead.last_name}` });
  };

  const handleSend = () => {
    const selectedTemplate = emailTemplates.find(t => t.id === selectedTemplateId);
    const body = getPreview('body');
    const resultSubject = getPreview('subject');
    const copies = cc ? [...cc.replace(/ /g, '').split(',')].map(item => ({ email: item, name: '' })) : cc;
    const currentLead = pathname.split('/').includes('leads') ? lead.id : null;
    const shouldSendFollowupEmail = selectedTemplate && selectedTemplate.type === emailTemplateTypes.EMAIL_TEMPLATE_TYPES.FIRST_FOLLOWUP && sendFollowupEmail;
    const formData = new FormData();
    if (files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    formData.append('message_data', JSON.stringify({ body, subject: resultSubject, sender, cc: copies, receiver, message_id: message.id, lead: currentLead, send_followup_email: shouldSendFollowupEmail }));
    sendMessage(formData)
      .then(() => {
        if (lead) {
          // todo we should update this logic, temporarily use timeout, need changes in back-end, (pusher not set & email send API does not create email object directly)
          setTimeout(() => getEmailConversations({ lead_id: lead.id }), 3000);
        }
        setIsPreview(false);
        setData('');
        setSelectedTemplateId('');
        setSubject('');
        setFiles([]);
        if (!isEmpty(message) && !isCommunicationReply) {
          const siteId = getPropertyId();
          push(`/${siteId}/followups`);
        }
        if (handleClose) {
          handleClose();
        }
      });
  };

  const dataCallback = (matchInfo, callback, type) => {
    const newData = Object.keys(emailVariables.VARIABLES)
      .map(key => (type === 'subject'
        ? { id: key, display: `${emailVariables.VARIABLES[key].name}` }
        : { id: key, title: emailVariables.VARIABLES[key].name, name: key }));
    callback(newData);
  };

  const replaceEmptyVariables = (body) => {
    const checkedVariables = checkVariables(parseVariables(body));
    let text = body;
    Object.keys(checkedVariables)
      .forEach((key) => {
        if (bulkEmail && (key === 'lead_full_name' || key === 'lead_first_name' || key === 'lead_owner')) return;
        if (!checkedVariables[key]) {
          text = text.replace(
            new RegExp(`<span class="email-placeholder">[=${emailVariables.VARIABLES[key].name}=]</span>`
            // eslint-disable-next-line no-useless-escape
              .replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1'), 'g'),
            `<span class="empty">[=${emailVariables.VARIABLES[key].name}=]</span>`,
          );
        }
      });
    return text;
  };

  const handleTemplateChange = (value) => {
    const template = emailTemplates.find(t => t.id === Number(value));
    setData(replaceEmptyVariables(template.text));
    setSubject(template.subject);
    setSelectedTemplateId(template.id);
    setSubjectVariables(template.subject_variables);
    // setTimeout(() => this.replaceSubjectEmptyVariables(), 50);
  };

  const cancelTemplate = () => {
    if (selectedTemplateId) {
      setData('');
      setSubject('');
      setSelectedTemplateId('');
    }
  };

  const redirectToSettings = () => {
    const siteId = getPropertyId();
    push(paths.build(paths.client.SETTINGS.LIST_TEMPLATE, siteId));
  };

  const handleEditorChange = (evt) => {
    const newData = replaceEmptyVariables(evt.editor.getData());
    if (!isPreview && !isBulkEmailPreview) setData(newData);
    // setTimeout(() => this.focusEditor(), 100);
  };

  const handleSubjectChange = (event, newValue, newPlainTextValue, mentions) => {
    const newSubjectVariables = Object.keys(emailVariables.VARIABLES).filter(key => mentions.map(item => item.id).includes(emailVariables.VARIABLES[key].name));
    setSubject(newValue);
    setSubjectVariables(newSubjectVariables);
  };

  const replaceSubjectEmptyVariables = () => {
    if (!isEmpty(subjectVariables)) {
      [...document.getElementsByClassName('subject-variable')].forEach((el) => {
        const checkedSubjectVariables = checkVariables(subjectVariables);
        Object.entries(emailVariables.VARIABLES)
          .forEach(([key, value]) => {
            if (bulkEmail && (key === 'lead_full_name' || key === 'lead_first_name' || key === 'lead_owner')) return;
            if (!checkedSubjectVariables[key] && el.textContent === `[=${value.name}=]`) {
              el.classList.add('subject-variable-empty');
              el.classList.remove('subject-variable');
            }
          });
      });
    }
  };

  useEffect(() => {
    initialize();
    getEmailTemplates();
    if (bulkEmail) {
      setSubject(subjectBulkEmail);
      setData(dataBulkEmail);
      setSubjectVariables(subjectVariablesBulkEmail);
      setFiles(filesBulkEmail);
    }
    if (isReply) {
      setSubject(`Re: ${message.subject}`);
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(subjectVariables)) {
      setTimeout(() => replaceSubjectEmptyVariables(), 100);
    }
  }, [subjectVariables]);

  useEffect(() => {
    initialize();
  }, [properties, message, lead]);

  useEffect(() => {
    if (bulkEmail) {
      parentCallback({
        subject,
        data,
        checkedVariables: checkVariables(parseVariables(data)),
        checkedSubjectVariables: checkVariables(subjectVariables),
        subjectPreview: getPreview('subject'),
        dataPreview: getPreview('body'),
        subjectVariables,
        files,
      });
    }
  }, [subject, data, files]);

  const handleFilesAdded = (file) => {
    setFiles(files.concat(file));
  };

  const unattachFile = (filePreview) => {
    setFiles(files.filter(file => file.preview !== filePreview));
  };

  const convertFileSize = (size) => {
    if (size < 1024) {
      return `${size}b`;
    } else
    if (size < 1024 * 1024) {
      return `${+(size / 1024).toFixed(1)}kb`;
    }
    return `${+(size / (1024 * 1024)).toFixed(1)}mb`;
  };

  const selectedTemplate = emailTemplates.find(t => t.id === selectedTemplateId);
  const checkedVariables = checkVariables(parseVariables(data));
  const checkedSubjectVariables = checkVariables(subjectVariables);
  const isEmptyEmail = lead && !lead.email;
  return (
    <Row>
      <Col xs="12">
        {['DISCONNECTED', 'AUTH_REQUIRED'].includes(currentProperty.nylas_status) ?
          <Card className="empty-followups-card animated fadeIn">
            <CardBody>
              <div className="empty-followups">
                <h4>{currentProperty.nylas_status === 'DISCONNECTED' ? 'Your email account is no longer connected. ' : 'Your email account is no longer authorized. '}</h4>
                <button className="btn btn-primary mt-2" onClick={() => push(`/${currentProperty.external_id}/settings`)}>Go to email settings</button>
              </div>
            </CardBody>
          </Card> :
          <Card className="compose">
            <CardBody>
              {!bulkEmail &&
                <InputGroup>
                  <InputGroupAddon className={isEmptyEmail ? 'to-prepend invalid' : 'to-prepend'} addonType="prepend">To:</InputGroupAddon>
                  {isEmpty(message) || lead ?
                    <Input className={isEmptyEmail ? 'to invalid' : 'to'} value={isEmptyEmail ? `${lead.first_name} ${lead.last_name}` : `${lead.first_name} ${lead.last_name} (${lead.email})`} disabled /> :
                    <Input className="to" value={`${message.sender_name} (${message.sender_email})`} disabled />}
                  <InputGroupAddon addonType="append">
                    <Button color="white" className={isEmptyEmail ? 'cc-btn invalid' : 'cc-btn'} onClick={() => setIsShowingCc(true)} disabled={isEmptyEmail}>Cc</Button>
                  </InputGroupAddon>
                </InputGroup>}
              {isShowingCc ?
                <InputGroup>
                  <InputGroupAddon addonType="prepend">Cc:</InputGroupAddon>
                  <Input className="cc" onChange={({ target: { value } }) => setCc(value)} value={cc} />
                  <InputGroupAddon addonType="append"><Button color="white cross-btn" onClick={() => setIsShowingCc(false)}><FontAwesomeIcon icon={faTimesCircle} /></Button></InputGroupAddon>
                </InputGroup>
                : null}
              <InputGroup>
                <InputGroupAddon addonType="prepend">From:</InputGroupAddon>
                <Input className="from" value={`${currentProperty.name} team (${currentProperty.shared_email})`} disabled />
              </InputGroup>
              <MentionsInput
                singleLine
                value={isPreview || isBulkEmailPreview ? getPreview('subject') : subject}
                onChange={handleSubjectChange}
                placeholder="Subject"
                className="subject"
                disabled={isPreview || isBulkEmailPreview}
                onClick={() => replaceSubjectEmptyVariables()}
                onBlur={() => setTimeout(() => replaceSubjectEmptyVariables())}
                onKeyDown={() => replaceSubjectEmptyVariables()}
                onKeyUp={() => replaceSubjectEmptyVariables()}
              >
                <Mention
                  appendSpaceOnAdd
                  trigger="["
                  markup="[=__display__=]"
                  displayTransform={(id, display) => `[=${display}=]`}
                  data={(matchInfo, callback) => dataCallback(matchInfo, callback, 'subject')}
                  className="subject-variable"
                  renderSuggestion={(suggestion, search, highlightedDisplay, index, focused) => (<div className={`${focused ? 'focused' : ''}`}>{highlightedDisplay}</div>)}
                />
              </MentionsInput>
              <div className="compose-editor">
                <CKEditor
                  onBeforeLoad={() => { window.CKEDITOR.disableAutoInline = true; }}
                  id="editor-default"
                  editorName10="editor"
                  className="editor animated fadeIn"
                  data={isPreview || isBulkEmailPreview ? getPreview('body') : data}
                  onChange={handleEditorChange}
                  config={{
                    height: 300,
                    extraAllowedContent: 'span(*)',
                    scayt_autoStartup: true,
                    startupFocus: true,
                    placeholder: 'Write some message...',
                    placeholder_select: {
                      placeholders: Object.values(emailVariables.VARIABLES)
                        .map(item => item.name),
                      format: '<span><span class="email-placeholder">[=%placeholder%=]</span>&nbsp;</span>',
                    },
                    mentions: [{
                      feed: (matchInfo, callback) => dataCallback(matchInfo, callback, 'body'),
                      minChars: 0,
                      marker: '[',
                      itemTemplate: '<li data-id="{id}"><div class="item-title">{title}</div></li>',
                      outputTemplate: '<span><span class="email-placeholder">[={title}=]</span>&nbsp;</span>',
                    }],
                  }}
                />
              </div>
              <ListGroup className="mt-2 files">
                {files.map((file, index) => (
                  <ListGroupItem className="d-flex align-items-center justify-content-between mb-1" key={index}>
                    <div className="filename">{`${file.name} (${convertFileSize(file.size)})`}</div>
                    <FontAwesomeIcon className="mr-1" style={{ cursor: 'pointer' }} icon={faTimesCircle} onClick={() => unattachFile(file.preview)} />
                  </ListGroupItem>))}
              </ListGroup>
              {!bulkEmail ?
                <div className="actions">
                  {!isReply && (
                    <ButtonDropdown className="mr-2 float-left select-template" isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)} disabled={isPreview}>
                      <DropdownToggle caret className="bg-white" disabled={isPreview}>
                        {selectedTemplateId ? selectedTemplate.name : 'Insert Template'}
                      </DropdownToggle>
                      <DropdownMenu>
                        {emailTemplates.map((template, index) => (
                          <React.Fragment key={index}>
                            <DropdownItem onClick={() => handleTemplateChange(template.id)} className={template.id === selectedTemplateId ? 'selected' : ''}>
                              {template.name}
                            </DropdownItem>
                          </React.Fragment>))}
                        <DropdownItem onClick={redirectToSettings}>
                          <FontAwesomeIcon icon={faCog} /> Manage Templates
                        </DropdownItem>
                      </DropdownMenu>
                    </ButtonDropdown>
                  )}
                  <div>
                    <FileUpload
                      onDropAccepted={e => handleFilesAdded(e)}
                      title="Upload File"
                      dropzoneContainer={() => <UploadIconButton id="upload-file" className="btn mr-1" disabled={isPreview || isSendingEmail}><i className="ri-upload-2-fill" /></UploadIconButton>}
                      dropzoneClassname="file-upload"
                      disabled={isPreview || isSendingEmail}
                    />
                    <Tooltip trigger="hover" placement="top" isOpen={tooltipOpen} target="upload-file" toggle={() => setTooltipOpen(!tooltipOpen)}>
                      Upload file
                    </Tooltip>
                  </div>
                  {!isReply && <WhiteButton className="ml-1" onClick={cancelTemplate} disabled={isPreview || isSendingEmail || !selectedTemplateId}>Cancel</WhiteButton>}
                  {selectedTemplateId && selectedTemplate.type === emailTemplateTypes.EMAIL_TEMPLATE_TYPES.FIRST_FOLLOWUP && (
                    <React.Fragment>
                      <div className="reminder-checkbox align-items-center">
                        <CustomInput
                          id="send_followup_emails"
                          className="mt-2 ml-2 d-flex"
                          type="checkbox"
                          checked={sendFollowupEmail}
                          onChange={e => setSendFollowupEmail(e.target.checked)}
                          label="Send post-tour followups"
                        />
                        <div
                          className="ml-2 mt-2 reminder-checkbox-popover"
                          id="tour-popover"
                          onMouseEnter={() => setIsShowingReminderInfo(true)}
                          onMouseLeave={() => setIsShowingReminderInfo(false)}
                        >
                          <FontAwesomeIcon className="mr-1" icon={faInfoCircle} />
                        </div>
                        <Popover className="reminder-checkbox-popover-info" placement="right" isOpen={isShowingReminderInfo} target="tour-popover" toggle={() => setIsShowingReminderInfo(!isShowingReminderInfo)}>
                          <PopoverBody>
                            Dwell automatically sends a series of 3 followup emails to prompt lead to fill out application. Followups stop sending if the lead completes the application.
                          </PopoverBody>
                        </Popover>
                      </div>
                    </React.Fragment>
                  )}
                  <div className="email-actions mr-1">
                    {isSendingEmail && <Spinner size="sm" className="mr-2" />}
                    <WhiteButton className="mr-2" onClick={() => setIsPreview(!isPreview)} disabled={isSendingEmail}>{isPreview ? 'Back to edit mail' : 'Preview mail'}</WhiteButton>
                    <PrimaryButton
                      color="primary"
                      onClick={handleSend}
                      disabled={data.length === 0 || subject.length === 0 || isSendingEmail || Object.values(checkedVariables).some(v => !v)
                        || Object.values(checkedSubjectVariables).some(v => !v) || isEmptyEmail}
                    >Send mail
                    </PrimaryButton>
                  </div>
                </div> :
                <FileUpload
                  onDropAccepted={e => handleFilesAdded(e)}
                  title="Upload File"
                  dropzoneContainer={() => <UploadTextButton disabled={isBulkEmailPreview}><span>Upload file</span></UploadTextButton>}
                  dropzoneClassname="file-upload"
                  disabled={isBulkEmailPreview}
                />}
              {isPreview && <Alert className="mt-2" color="info"><FontAwesomeIcon className="mr-1" icon={faEye} />You&apos;re previewing this email. This is what your recipient will see when they read your email message.</Alert>}
            </CardBody>
          </Card>}
      </Col>
    </Row>
  );
};

const mapStateToProps = state => ({
  properties: state.property.properties,
  currentProperty: state.property.property,
  emailTemplates: state.emailTemplate.emailTemplates,
  isSendingEmail: state.nylas.isSendingEmail,
  data: state.emailMessage.data,
  subject: state.emailMessage.subject,
  cc: state.emailMessage.cc,
  selectedTemplateId: state.emailMessage.selectedTemplateId,
  subjectVariables: state.emailMessage.subjectVariables,
  files: state.emailMessage.files,
  isShowingCc: state.emailMessage.isShowingCc,
});

EmailCompose.defaultProps = {
  properties: [],
  lead: {} as Lead,
  message: {},
  currentProperty: {},
  bulkEmail: false,
  isBulkEmailPreview: false,
  parentCallback: null,
  subjectBulkEmail: '',
  dataBulkEmail: '',
  subjectVariablesBulkEmail: [],
  filesBulkEmail: [],
  handleClose: null,
  isReply: false,
};

export default connect(
  mapStateToProps,
  {
    ...actions.nylas,
    ...actions.emailMessage,
    ...actions.emailTemplate,
    ...actions.lead,
  },
)(withRouter(EmailCompose));
