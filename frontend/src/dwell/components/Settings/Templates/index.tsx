import React, { FC, useEffect, useState } from 'react';
import 'react-dates/initialize';
import { Button, Col, Form, ModalBody, ModalHeader, Row, Input, Label } from 'reactstrap';
import { Mention, MentionsInput } from 'react-mentions';
import 'src/scss/pages/_placeholders.scss';
import { emailVariables } from 'dwell/constants';
import CKEditor from 'ckeditor4-react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { ChatTemplateProps, DetailResponse, EmailTemplateProps } from 'src/interfaces';
import actions from 'dwell/actions';
import { connect } from 'react-redux';
import { EmailTemplateModal, CustomTextEditor, EmailInputFormGroup, EmailTemplateModalFooter } from 'dwell/components/Settings/Templates/styles';
import { SettingsPrimaryButton } from 'dwell/views/Settings/styles';
import { isEmpty } from 'lodash';
import { toast, ToastOptions } from 'react-toastify';
import { toastOptions } from 'site/constants';

interface CommonTemplateModalWindowProps extends RouteComponentProps{
  handleClose: () => void,
  show: boolean,
  templateType: 'Email' | 'Chat',
  createEmailTemplate: (data: EmailTemplateProps, msg: () => void) => Promise<DetailResponse>,
  updateEmailTemplateById: (templateId: number, data: EmailTemplateProps, msg: () => void) => Promise<DetailResponse>,
  templateId: number,
  emailTemplate: EmailTemplateProps,
  createChatTemplate: (data: ChatTemplateProps, msg: () => void) => Promise<DetailResponse>,
  updateChatTemplateById: (templateId: number, data: ChatTemplateProps, msg: () => void) => Promise<DetailResponse>,
}

const CommonTemplateModalWindow: FC<CommonTemplateModalWindowProps> = ({ emailTemplate, templateType, handleClose, show, createEmailTemplate, templateId, updateEmailTemplateById, createChatTemplate, updateChatTemplateById }) => {
  const closeBtn = <button className="close" onClick={() => handleClose()} />;

  CKEditor.editorUrl = `${window.location.origin}/static/ckeditor/ckeditor.js`;

  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [subjectVariables, setSubjectVariables] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!isEmpty(emailTemplate)) {
      setText(emailTemplate.text);
      setName(emailTemplate.name);
      if (templateType === 'Email') {
        setSubject(emailTemplate.subject);
      }
    }
  }, [emailTemplate]);

  const onEditorChange = (evt) => {
    setText(evt.editor.getData());
  };

  const onNameChange = ({ target: { value } }) => {
    setName(value);
    setIsError(false);
  };

  const parseVariables = (data) => {
    const emailVars = data.match(/\[=(.*?)=\]/g);
    let variableTitles = [];
    if (emailVars) {
      // eslint-disable-next-line no-useless-escape
      variableTitles = emailVars.map(v => v.replace(/[\[=\]]/g, ''));
    }
    return Object.keys(emailVariables.VARIABLES)
      .filter(key => variableTitles.includes(emailVariables.VARIABLES[key].name));
  };

  const handleCreate = () => {
    const variables = parseVariables(text);
    if (templateType === 'Email') {
      createEmailTemplate({ text, subject, name, variables, subject_variables: subjectVariables }, () => toast.success('Email template created', toastOptions as ToastOptions))
        .then(() => {
          handleClose();
        });
    } else {
      createChatTemplate({ text, name, variables }, () => toast.success('Chat template created', toastOptions as ToastOptions))
        .then(() => {
          handleClose();
        });
    }
  };

  const handleUpdate = () => {
    const variables = parseVariables(text);
    if (templateType === 'Email') {
      updateEmailTemplateById(templateId, { text, subject, name, variables, subject_variables: subjectVariables }, () => toast.success('Email template updated', toastOptions as ToastOptions))
        .then(() => {
          handleClose();
        });
    } else {
      updateChatTemplateById(templateId, { text, name, variables }, () => toast.success('Chat template updated', toastOptions as ToastOptions))
        .then(() => {
          handleClose();
        });
    }
  };

  const handleSave = () => {
    if (name.trim()) {
      if (emailTemplate.id) {
        handleUpdate();
      } else {
        handleCreate();
      }
    } else {
      setIsError(true);
    }
  };

  const handleCKEediorConfig = () => {
    let SettingsConfig = 'Cut,Copy,Paste,Undo,Redo,Anchor,Underline,Strike,Subscript,Superscript,CreatePlaceholder';
    if (templateType === 'Chat') {
      SettingsConfig += ',Bold,Italic,Link,Unlink,Indent,Outdent,BulletedList,NumberedList,Scayt';
    }
    return SettingsConfig;
  };
  const handleChange = (event, newValue, newPlainTextValue, mentions) => {
    setSubject(newValue);
    setSubjectVariables(Object.keys(emailVariables.VARIABLES).filter(key => mentions.map(item => item.id).includes(emailVariables.VARIABLES[key].name)));
  };

  const dataSubjectCallback = (matchInfo, callback) => {
    const data = Object.keys(emailVariables.VARIABLES).map((key, i) => ({ id: i, display: `${emailVariables.VARIABLES[key].name}` }));
    callback(data);
  };

  const dataCallback = (matchInfo, callback) => {
    const data = Object.keys(emailVariables.VARIABLES).map((key, i) => ({ id: i, title: emailVariables.VARIABLES[key].name }));
    callback(data);
  };

  const disableAutoInline = () => {
    const { CKEDITOR }: CKEditor = window;
    CKEDITOR.disableAutoInline = true;
  };

  return (
    <EmailTemplateModal
      isOpen={show}
      toggle={() => handleClose()}
      centered
    >
      <ModalHeader close={closeBtn}> {emailTemplate.id ? `Edit ${templateType} Template` : `Add ${templateType ? 'Email' : 'Chat'} Template`}</ModalHeader>
      <ModalBody>
        <Row>
          <Col xs="12">
            <Form>
              <EmailInputFormGroup className="p-0" isError={isError}>
                <Input
                  className={`template-name h-41 ${emailTemplate.id ? 'font-weight-bold' : ''}`}
                  style={{ padding: '0 15px', paddingBottom: '2px' }}
                  placeholder="Template title"
                  value={name}
                  onChange={e => onNameChange(e)}
                />
              </EmailInputFormGroup>
              {templateType === 'Email' && (
                <EmailInputFormGroup style={{ paddingTop: 0, paddingBottom: '6px' }}>
                  {emailTemplate.id && <Label style={{ margin: '5px 0 0 15px' }}>Subject:</Label>}
                  <MentionsInput singleLine value={subject} onChange={handleChange} placeholder="Subject" className="subject">
                    <Mention
                      appendSpaceOnAdd
                      trigger="["
                      markup="[=__display__=]"
                      displayTransform={(id, display) => `[=${display}=]`}
                      data={dataSubjectCallback}
                      className="subject-variable"
                      renderSuggestion={(suggestion, search, highlightedDisplay, index, focused) => (<div className={`${focused ? 'focused' : ''}`}>{highlightedDisplay}</div>)}
                    />
                  </MentionsInput>
                </EmailInputFormGroup>)
              }
              <EmailInputFormGroup>
                <CustomTextEditor>
                  <div className="templates-editor">
                    <CKEditor
                      id="editor-default"
                      editorName="editor"
                      onBeforeLoad={disableAutoInline}
                      className="editor"
                      data={text}
                      onChange={onEditorChange}
                      config={{
                        removeButtons: handleCKEediorConfig(),
                        height: 300,
                        extraAllowedContent: 'span(*)',
                        scayt_autoStartup: true,
                        placeholder_select: {
                          placeholders: Object.values(emailVariables.VARIABLES).map(item => item.name),
                          format: '<span><span class="email-placeholder">[=%placeholder%=]</span>&nbsp;</span>' },
                        mentions: [{
                          feed: (matchInfo, callback) => dataCallback(matchInfo, callback),
                          minChars: 0,
                          marker: '[',
                          itemTemplate: '<li data-id="{id}"><div class="item-title">{title}</div></li>',
                          outputTemplate: '<span><span class="email-placeholder">[={title}=]</span>&nbsp;</span>',
                        }] }}
                    />
                  </div>
                </CustomTextEditor>
              </EmailInputFormGroup>
            </Form>
          </Col>
        </Row>
      </ModalBody>
      <EmailTemplateModalFooter>
        <Button className="btn-secondary mr-2" onClick={() => handleClose()} >Cancel</Button>
        <SettingsPrimaryButton className="btn btn-primary m-0" onClick={() => handleSave()} >{ emailTemplate.id ? 'Save changes' : 'Add template' } </SettingsPrimaryButton>
      </EmailTemplateModalFooter>
    </EmailTemplateModal>

  );
};

export default connect(
  null,
  {
    ...actions.emailTemplate,
    ...actions.chatTemplate,
  },
)(withRouter(CommonTemplateModalWindow));
