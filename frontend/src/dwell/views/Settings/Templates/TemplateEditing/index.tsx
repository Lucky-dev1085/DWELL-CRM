import React, { useEffect, useState, FC } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Card, CardBody, CardHeader, Col, Input, Row } from 'reactstrap';
import { connect } from 'react-redux';
import { Mention, MentionsInput } from 'react-mentions';
import CKEditor from 'ckeditor4-react';
import { emailVariables, emailTemplateTypes, paths } from 'dwell/constants';
import actions from 'dwell/actions';
import 'src/scss/pages/_email_template.scss';
import { isEmpty } from 'lodash';
import { getPropertyId } from 'src/utils';
import { EmailTemplateProps, DetailResponse } from 'src/interfaces';

interface TemplateEditingProps extends RouteComponentProps {
  updateEmailTemplateById: (templateId: string, data: EmailTemplateProps) => Promise<DetailResponse>,
  getEmailTemplateById: (id: string) => void,
  emailTemplate: EmailTemplateProps,
}

const TemplateEditing: FC<TemplateEditingProps> = ({ location: { pathname }, getEmailTemplateById, updateEmailTemplateById, emailTemplate, history: { push } }) => {
  CKEditor.editorUrl = `${window.location.origin}/static/ckeditor/ckeditor.js`;
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [subjectVariables, setSubjectVariables] = useState([]);

  useEffect(() => {
    getEmailTemplateById(pathname.split('/').pop());
  }, []);

  useEffect(() => {
    if (!isEmpty(emailTemplate)) {
      setText(emailTemplate.text);
      setName(emailTemplate.name);
      setSubject(emailTemplate.subject);
    }
  }, [emailTemplate]);

  const onEditorChange = (evt) => {
    setText(evt.editor.getData());
  };

  const onNameChange = ({ target: { value } }) => {
    setName(value);
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

  const handleUpdate = () => {
    const variables = parseVariables(text);
    updateEmailTemplateById(pathname.split('/').pop(), { text, subject, name, variables, subject_variables: subjectVariables })
      .then(() => {
        push(paths.build(paths.client.SETTINGS.LIST_TEMPLATE, getPropertyId()));
      });
  };

  const handleCancel = () => {
    push(paths.build(paths.client.SETTINGS.LIST_TEMPLATE, getPropertyId()));
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
    const { CKEDITOR } = window;
    CKEDITOR.disableAutoInline = true;
  };

  return (
    <div className="animated fadeIn">
      <Row>
        <Col xs="12">
          <Card className="edit-template">
            <CardHeader>
                Edit Template
            </CardHeader>
            <CardBody>
              <Card>
                <CardBody>
                  <Input
                    className="template-name"
                    placeholder="Template name*"
                    value={name}
                    disabled={emailTemplate.type !== emailTemplateTypes.EMAIL_TEMPLATE_TYPES.GENERIC}
                    onChange={e => onNameChange(e)}
                  />
                  <MentionsInput singleLine value={subject} onChange={handleChange} placeholder="Subject line*" className="subject">
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
                  { emailTemplate && emailTemplate.id === Number(pathname.split('/').pop()) ? (
                    <CKEditor
                      id="editor-default"
                      editorName="editor"
                      onBeforeLoad={disableAutoInline}
                      className="editor"
                      data={emailTemplate.text}
                      onChange={onEditorChange}
                      config={{
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
                    />) : null}
                  <div className="mt-2">
                    <button className="mr-1 btn btn-primary float-right" onClick={handleUpdate}>Save template</button>
                    <button className="mr-1 btn btn-secondary float-right" onClick={handleCancel}>Cancel</button>
                  </div>
                </CardBody>
              </Card>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = state => ({
  emailTemplate: state.emailTemplate.emailTemplate,
});

export default connect(
  mapStateToProps,
  {
    ...actions.emailTemplate,
  },
)(withRouter(TemplateEditing));
