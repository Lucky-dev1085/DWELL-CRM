import React, { useEffect, FC, useState } from 'react';
import { connect } from 'react-redux';
import actions from 'dwell/actions/index';
import {
  ContentText,
  ContentTitleSm,
  Divider,
  FormGroupBar,
  FormLabel,
  SettingsFooter,
  FormActions,
  CustomAddButton,
  Tag,
} from 'dwell/views/Settings/styles';
import Action from 'dwell/views/Settings/_action';
import { ListResponse, SuccessResponse, EmailTemplateProps, ChatTemplateProps } from 'src/interfaces';
import { CommonTemplateModalWindow } from 'dwell/components';
import { ConfirmActionModal } from 'site/components';
import { toast, ToastOptions } from 'react-toastify';
import { toastOptions } from 'site/constants';

const emptyEmailTemplate: EmailTemplateProps = {
  text: '',
  subject: '',
  name: '',
  variables: [],
  subject_variables: [],
};

const emptyChatTemplate: ChatTemplateProps = {
  text: '',
  name: '',
  variables: [],
};

interface CommonTemplateSettingsProps {
  getEmailTemplates: () => Promise<ListResponse>,
  deleteEmailTemplateById: (id: number, msg: () => void) => Promise<SuccessResponse>,
  emailTemplates: Array<EmailTemplateProps>,
  templateType: 'Email' | 'Chat',
  getChatTemplates: () => Promise<ListResponse>,
  deleteChatTemplateById: (id: number, msg: () => void) => Promise<SuccessResponse>,
  chatTemplates: Array<ChatTemplateProps>,
}

const CommonTemplateSettings: FC<CommonTemplateSettingsProps> = ({ templateType, getEmailTemplates, deleteEmailTemplateById, emailTemplates,
  getChatTemplates, deleteChatTemplateById, chatTemplates }) => {
  const [isShowModalWindow, setShowModalWindow] = useState(false);
  const [currentEmailTemplate, setEmailTemplate] = useState<EmailTemplateProps | ChatTemplateProps>(emptyEmailTemplate);
  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [removeItemId, setRemoveItemId] = useState(null);

  const handleCloseModalWindow = () => {
    setShowModalWindow(false);
  };

  const handleOpenModalWindow = () => {
    setShowModalWindow(true);
  };

  useEffect(() => {
    if (templateType === 'Email') {
      getEmailTemplates();
    } else {
      getChatTemplates();
    }
  }, []);

  const handleCreate = () => {
    setEmailTemplate(templateType === 'Email' ? emptyEmailTemplate : emptyChatTemplate);
    handleOpenModalWindow();
  };

  const handleEdit = (currentTemplateId) => {
    const templates = templateType === 'Email' ? emailTemplates : chatTemplates;
    const data: EmailTemplateProps | ChatTemplateProps = templates.find(template => template.id === currentTemplateId);
    setEmailTemplate(data);
    handleOpenModalWindow();
  };

  const handleDelete = (currentTemplateId) => {
    const templates = templateType === 'Email' ? emailTemplates : chatTemplates;
    const data: EmailTemplateProps | ChatTemplateProps = templates.find(template => template.id === currentTemplateId);
    setEmailTemplate(data);
    setRemoveItemId(currentTemplateId);
    toggleConfirmModal(true);
  };

  const confirmDelete = () => {
    toggleConfirmModal(false);
    if (templateType === 'Email') {
      deleteEmailTemplateById(removeItemId, () => toast.success('Email template deleted', toastOptions as ToastOptions)).then(() => getEmailTemplates());
    } else {
      deleteChatTemplateById(removeItemId, () => toast.success('Chat template deleted', toastOptions as ToastOptions)).then(() => getChatTemplates());
    }
  };

  const orderedEmailTemplates = emailTemplates;
  orderedEmailTemplates.forEach((template, i) => {
    if (template.type === 'NEW_PROSPECT_WELCOME') {
      orderedEmailTemplates.splice(i, 1);
      orderedEmailTemplates.unshift(template);
    }
  });

  return (
    <React.Fragment>
      {isShowModalWindow && (
        <CommonTemplateModalWindow
          templateType={templateType}
          show={isShowModalWindow}
          handleClose={handleCloseModalWindow}
          templateId={currentEmailTemplate.id}
          emailTemplate={currentEmailTemplate}
        />
      )}
      <ConfirmActionModal
        text={`Are you sure you wish to delete ${templateType} Template`}
        itemName={currentEmailTemplate.name}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        onClose={() => toggleConfirmModal(false)}
        show={showConfirmModal}
      />
      <ContentTitleSm>{`Manage ${templateType} Templates`}</ContentTitleSm>
      <ContentText>{ templateType === 'Email' ?
        'Use email templates to save time and quickly manage lead communication.' :
        'Use chat templates to save time and quickly manage lead communication in Dwell Messenger.' }
      </ContentText>
      <Divider />
      {templateType === 'Email' ? orderedEmailTemplates.map((template, index) => (
        <FormGroupBar key={index} style={{ height: '49px' }}>
          <FormLabel><span>{template.name}</span>{template.type === 'NEW_PROSPECT_WELCOME' && <Tag>SYSTEM</Tag>}</FormLabel>
          <FormActions>
            <Action handleClick={() => handleEdit(template.id)} actionType="edit" index={index} instanceType="email template" />
            <Action handleClick={() => handleDelete(template.id)} actionType="delete" index={index} instanceType="email template" disabled={template.type === 'NEW_PROSPECT_WELCOME'} />
          </FormActions>
        </FormGroupBar>))
        : chatTemplates.map((template, index) => (
          <FormGroupBar key={index} style={{ height: '49px' }}>
            <FormLabel>{template.name}</FormLabel>
            <FormActions>
              <Action handleClick={() => handleEdit(template.id)} actionType="edit" index={index} instanceType="chat template" />
              <Action handleClick={() => handleDelete(template.id)} actionType="delete" index={index} instanceType="chat template" />
            </FormActions>
          </FormGroupBar>))
      }
      <SettingsFooter>
        <CustomAddButton onClick={() => handleCreate()} ><i className="ri-add-circle-fill" />{`Add ${templateType} Template`}</CustomAddButton>
      </SettingsFooter>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  chatTemplates: state.chatTemplate.chatTemplates,
  emailTemplates: state.emailTemplate.emailTemplates,
  currentUser: state.user.currentUser,
});

export default connect(
  mapStateToProps,
  {
    ...actions.emailTemplate,
    ...actions.chatTemplate,
  },
)(CommonTemplateSettings);
