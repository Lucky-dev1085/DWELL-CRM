import React, { useState, FC } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Dropdown } from 'reactstrap';
import actions from 'dwell/actions';
import 'src/scss/pages/_lead_creation.scss';
import 'src/scss/pages/_columns_settings.scss';
import { getPropertyId } from 'src/utils';
import { ConfirmActionModal } from 'site/components';
import { ColumnsSettingsIcon, MoreActionDropDownMenu, MoreActionDropDownItem } from './styles';

interface MoreActionDropDownProps extends RouteComponentProps {
  leadId: number,
  leadName: string,
  deleteLeadById: (id: number) => null,
}
const MoreActionDropDown: FC<MoreActionDropDownProps> = ({ history: { push }, leadId, leadName, deleteLeadById }) => {
  const [isShow, setIsShow] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleClose = (e) => {
    e.stopPropagation();
    setIsShow(!isShow);
  };

  const siteId = getPropertyId();
  const viewDetails = () => {
    push({ pathname: `/${siteId}/leads/${leadId}` });
  };

  const addNote = () => {
    push({ pathname: `/${siteId}/leads/${leadId}/notes` });
  };

  const addTask = () => {
    push({ pathname: `/${siteId}/leads/${leadId}`, state: { newTask: true } });
  };

  const deleteLead = () => {
    deleteLeadById(leadId);
  };

  return (
    <Dropdown
      isOpen={isShow}
      toggle={handleClose}
      className="columns-settings-modal"
    >
      <ColumnsSettingsIcon className="ri-more-2-fill" tag="a" />
      <MoreActionDropDownMenu>
        <MoreActionDropDownItem onClick={viewDetails}><i className="ri-file-list-2-line" />View details</MoreActionDropDownItem>
        <MoreActionDropDownItem onClick={addTask}><i className="ri-task-line" />Add task</MoreActionDropDownItem>
        <MoreActionDropDownItem onClick={addNote}><i className="ri-sticky-note-line" />Add note</MoreActionDropDownItem>
        <MoreActionDropDownItem onClick={() => setShowConfirmModal(true)}><i className="ri-delete-bin-line" />Delete</MoreActionDropDownItem>
      </MoreActionDropDownMenu>
      <ConfirmActionModal
        text="Do you wish to delete lead"
        itemName={leadName}
        onConfirm={deleteLead}
        onClose={() => setShowConfirmModal(false)}
        show={showConfirmModal}
        title="Confirm Delete"
      />
    </Dropdown>
  );
};

export default connect(
  null,
  {
    ...actions.lead,
  },
)(withRouter(MoreActionDropDown));
