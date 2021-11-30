import React, { FC, useState } from 'react';
import { isEmpty } from 'lodash';
import { Share2, UserPlus } from 'react-feather';
import { LineSkeleton } from 'src/utils';
import { fieldChoices } from 'dwell/constants';
import LeadShareModal from 'dwell/components/Leads/LeadShareModal';
import LeadLostDialog from 'dwell/components/Leads/LeadLostDialog';
import { UserProps, LostReason } from 'src/interfaces';
import { ContentNavBar, NavLeadOption, StageDropdown, StageDropdownItem, StageDropdownMenu, ControlButtons, DropdownLink, StageDropdownLink, CustomDropdownItem,
  UnassignedItem, StatusDropdownMenu, StatusDropdownItem } from './style';

interface LeadProps {
  id: number,
  first_name: string,
  last_name: string,
  stage: string,
  owner: string | number,
  move_in_date: Date,
  status: string,
  next_lead: LeadProps,
  prev_lead: LeadProps,
}

interface NavLeadOptionProps {
  lead: LeadProps,
  handleSave: (params: {status?: string, lost_reason?: LostReason}) => void,
  isShared: boolean,
  availableOwners: UserProps[],
}

const NavLeadOptions: FC<NavLeadOptionProps> = ({ lead, availableOwners, handleSave, isShared }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownStatusOpen, setDropdownStatusOpen] = useState(false);
  const [dropdownOwnersOpen, setDropdownOwnersOpen] = useState(false);
  const [showLeadShareModal, setShowLeadShareModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const leadStatus = fieldChoices.LEAD_FILED_CHOICES.status;

  const { stage, status, owner } = lead;

  const handleStageSave = (id, value) => {
    if (value === 'LOST' && status !== value) {
      setShowReasonModal(true);
    } else {
      handleSave({ [id]: value });
    }
  };

  const handleShare = () => {
    setShowLeadShareModal(true);
  };

  const handleSaveLostReason = (value) => {
    setShowReasonModal(false);
    handleSave({ lost_reason: value, status: 'LOST' });
  };

  const lead_owner = availableOwners.find(availableOwner => availableOwner.id === owner);
  const setOwner = lead_owner ? `${lead_owner.first_name} ${lead_owner.last_name}` : (<React.Fragment><UserPlus size="16" /> <UnassignedItem>Unassigned</UnassignedItem></React.Fragment>);

  return (
    <ContentNavBar>
      <NavLeadOption>
        {!isEmpty(lead) ?
          <StageDropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
            <StageDropdownLink caret className={stage ? stage.toLowerCase() : 'bg-white'} disabled={isShared}>
              {stage ? fieldChoices.LEAD_FILED_CHOICES.stage[stage] : 'Select stage'}
            </StageDropdownLink>
            <StageDropdownMenu >
              {Object.keys(fieldChoices.LEAD_FILED_CHOICES.stage).map((key, index) => (
                <React.Fragment key={index}>
                  <StageDropdownItem onClick={() => handleStageSave('stage', key)} className={key.toLowerCase()}>
                    {fieldChoices.LEAD_FILED_CHOICES.stage[key]}
                  </StageDropdownItem>
                </React.Fragment>))}
            </StageDropdownMenu>
          </StageDropdown> : <LineSkeleton width={150} height={38} />}

        {!isEmpty(lead) ?
          <StageDropdown isOpen={dropdownOwnersOpen} toggle={() => setDropdownOwnersOpen(!dropdownOwnersOpen)}>
            <DropdownLink caret disabled={isShared}>
              {setOwner}
            </DropdownLink>
            <StageDropdownMenu >
              {availableOwners.map((current_owner: UserProps) => (
                <React.Fragment key={current_owner.id} >
                  <CustomDropdownItem onClick={() => handleStageSave('owner', current_owner.id)}>
                    {current_owner.first_name} {current_owner.last_name}
                  </CustomDropdownItem>
                </React.Fragment>))}
            </StageDropdownMenu>
          </StageDropdown> : <LineSkeleton width={100} height={38} style={{ marginLeft: '8px' }} />}

        {!isEmpty(lead) ?
          <StageDropdown isOpen={dropdownStatusOpen} toggle={() => setDropdownStatusOpen(!dropdownStatusOpen)}>
            <DropdownLink caret disabled={isShared}>
              {status ? leadStatus[status]?.title : 'Select status'}
            </DropdownLink>
            <StatusDropdownMenu right >
              {Object.keys(leadStatus).filter(el => !leadStatus[el].hide).map((key, index) => (
                <React.Fragment key={`status${index}`}>
                  <StatusDropdownItem onClick={() => handleStageSave('status', key)} selected={status === key} >
                    <strong>
                      {leadStatus[key].title}
                      {status === key && <i className="ri-check-line" />}
                    </strong>
                    <span>
                      {leadStatus[key].text}
                    </span>
                  </StatusDropdownItem>
                </React.Fragment>))}
            </StatusDropdownMenu>
          </StageDropdown> : <LineSkeleton width={80} height={38} style={{ marginLeft: '8px' }} />}

      </NavLeadOption>
      <ControlButtons onClick={handleShare}><Share2 size="20" /></ControlButtons>
      <LeadLostDialog
        show={showReasonModal}
        handleClose={() => setShowReasonModal(false)}
        handleSave={(value) => {
          handleSaveLostReason(value);
        }}
      />
      <LeadShareModal lead={lead} show={showLeadShareModal} handleClose={() => setShowLeadShareModal(false)} />
    </ContentNavBar>
  );
};

export default NavLeadOptions;
