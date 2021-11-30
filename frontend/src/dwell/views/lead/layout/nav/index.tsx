import React, { FC, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { set, isEmpty } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { Share2, UserPlus } from 'react-feather';
import { getPropertyId, LineSkeleton } from 'src/utils';
import { fieldChoices } from 'dwell/constants';
import LeadShareModal from 'dwell/components/Leads/LeadShareModal';
import LeadLostDialog from 'dwell/components/Leads/LeadLostDialog';
import {
  NavLine,
  NavLink,
  ContentNavBar,
  Arrow,
  NavLeadOption,
  StageDropdown,
  StageDropdownItem,
  StageDropdownMenu,
  ControlButtons, DropdownLink,
  StageDropdownLink,
  CustomDropdownItem,
  UnassignedItem, StatusDropdownMenu, StatusDropdownItem,
} from './styles';

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

interface UsersProps {
  id: number,
  first_name: string,
  last_name: string,
  email: string,
}

interface LeadNavBarProps extends RouteComponentProps {
  lead: LeadProps,
  handleSave: (params: {status?: string}) => void,
  isShared: boolean,
  availableOwners: Array<UsersProps>,
  onDelete: () => Promise<null>,
  getLeadById: (leadId: number, shared: { shared: boolean }) => Promise<null>,
}

const LeadNavBar: FC<LeadNavBarProps> = (props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownStatusOpen, setDropdownStatusOpen] = useState(false);
  const [dropdownOwnersOpen, setDropdownOwnersOpen] = useState(false);
  const [showLeadShareModal, setShowLeadShareModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const leadStatus = fieldChoices.LEAD_FILED_CHOICES.status;

  const { history: { push }, lead, availableOwners, location: { pathname, hash }, getLeadById } = props;

  const { stage, status, next_lead: nextLead, prev_lead: prevLead, owner } = lead;

  const handleChangeLead = (leadId) => {
    getLeadById(parseInt(leadId, 10), { shared: hash.includes('shared') || hash.includes('transferred') }).then(() => {
      push(`/${getPropertyId()}/leads/${leadId}`);
    });
  };

  const { handleSave, isShared } = props;

  const handleStageSave = (id, value) => {
    const params = set({}, id, value);
    if (value === 'LOST' && status !== value) {
      setShowReasonModal(true);
    } else {
      handleSave(params);
    }
  };

  const handleShare = () => {
    setShowLeadShareModal(true);
  };

  const handleSaveLostReason = (value) => {
    setShowReasonModal(false);
    let params = set({}, 'lost_reason', value);
    params = set(params, 'status', 'LOST');
    handleSave(params);
  };

  const setitemClassName = key => key.toLowerCase();

  const setOwner = () => {
    const lead_owner = availableOwners.find(availableOwner => availableOwner.id === owner);
    if (lead_owner) {
      return `${lead_owner.first_name} ${lead_owner.last_name}`;
    }
    return (<React.Fragment><UserPlus size="16" /> <UnassignedItem>Unassigned</UnassignedItem></React.Fragment>);
  };

  const navigateSubPage = (item) => {
    push({ pathname: item === 'overview' ? `/${getPropertyId()}/leads/${lead.id}` : `/${getPropertyId()}/leads/${lead.id}/${item}`, state: { alreadyLoaded: true } });
  };

  const routes = pathname.split('/');
  return (
    <div className="lead-action">
      <LeadShareModal lead={lead} show={showLeadShareModal} handleClose={() => setShowLeadShareModal(false)} />
      <ContentNavBar>
        <Arrow onClick={() => handleChangeLead(prevLead)}>
          <FontAwesomeIcon icon={faChevronLeft} style={{ opacity: 0.5 }} />
        </Arrow>
        <Arrow onClick={() => handleChangeLead(nextLead)}>
          <FontAwesomeIcon icon={faChevronRight} style={{ opacity: 0.5 }} />
        </Arrow>
        <NavLine >
          {['overview', 'roommates', 'notes', 'emails', 'calls', 'chats'].map((item, index) => (
            <NavLink
              key={index}
              onClick={() => navigateSubPage(item)}
              className={item === pathname.split('/').pop() || (item === 'overview' && routes[routes.length - 2] === 'leads') ? 'active' : ''}
            >
              {item.replace(/^\w/, c => c.toUpperCase())}
            </NavLink>
          ))}
        </NavLine>
        <NavLeadOption>
          {!isEmpty(lead) ?
            <StageDropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
              <StageDropdownLink caret className={stage ? stage.toLowerCase() : 'bg-white'} disabled={isShared}>
                {stage ? fieldChoices.LEAD_FILED_CHOICES.stage[stage] : 'Select stage'}
              </StageDropdownLink>
              <StageDropdownMenu >
                {Object.keys(fieldChoices.LEAD_FILED_CHOICES.stage).map((key, index) => (
                  <React.Fragment key={index}>
                    <StageDropdownItem onClick={() => handleStageSave('stage', key)} className={setitemClassName(key)}>
                      {fieldChoices.LEAD_FILED_CHOICES.stage[key]}
                    </StageDropdownItem>
                  </React.Fragment>))}
              </StageDropdownMenu>
            </StageDropdown> : <LineSkeleton width={150} height={38} />}

          {!isEmpty(lead) ?
            <StageDropdown isOpen={dropdownOwnersOpen} toggle={() => setDropdownOwnersOpen(!dropdownOwnersOpen)}>
              <DropdownLink caret disabled={isShared}>
                {setOwner()}
              </DropdownLink>
              <StageDropdownMenu >
                {availableOwners.map((current_owner: UsersProps) => (
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
      </ContentNavBar>
    </div>
  );
};

export default connect(null)(withRouter(LeadNavBar));
