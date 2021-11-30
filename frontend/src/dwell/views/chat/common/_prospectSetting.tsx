// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { FC, useState } from 'react';
import { connect } from 'react-redux';
import {
  ActiveChatsMenuDots,
  ChatsMainMenuDropdown,
  ChatsMainMenuDropdownItem, MenuDropdownIcon,
  VerticalMenuDots,
} from 'dwell/views/chat/multi_chat/styles';
import { Dropdown } from 'reactstrap';
import LeadCreationModal from 'dwell/components/Leads/LeadCreationModal';
import LeadLinkingModal from 'dwell/components/Leads/LeadLinkingModal';
import actions from 'dwell/actions';
import { getPropertyId } from 'src/utils';
import { RouteComponentProps, withRouter } from 'react-router-dom';

interface ProspectSettingProps extends RouteComponentProps {
  prospect: { id: number, lead: number, is_mute: boolean, guest_card: number },
  updateProspectChatStatus: (data: { prospect: number, body: { is_mute?: boolean, is_archived?: boolean, lead?: number } }) => null;
  isSingleChat: boolean;
}

const Actions = isMute => ({
  ADD_NEW_LEAD: <><MenuDropdownIcon className="ri-user-add-fill" />Create New Lead</>,
  LINK_TO_EXISTING_LEAD: <><MenuDropdownIcon className="ri-user-shared-fill" />Link to Existing Lead</>,
  MUTE: isMute
    ? <><MenuDropdownIcon className="ri-notification-4-fill" />Unmute Chat</>
    : <><MenuDropdownIcon className="ri-notification-off-fill" />Mute Chat</>,
  ARCHIVE: <><MenuDropdownIcon className="ri-archive-drawer-fill" />Archive Chat</>,
  VIEW_PROSPECT: <><MenuDropdownIcon className="ri-user-line" />View prospect</>,
});

const ProspectSetting: FC<ProspectSettingProps> = ({ prospect, updateProspectChatStatus, isSingleChat, activeProperties, history: { push } }) : JSX.Element => {
  const [isShowingCreationModal, setIsShowingCreationModal] = useState(false);
  const [isShowingLinkingModal, setIsShowingLinkingModal] = useState(false);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);

  const runAction = (event, key) => {
    event.stopPropagation();
    const possibilities = Object.keys(Actions(prospect.is_mute));
    switch (key) {
      case possibilities[0]:
        setIsShowingCreationModal(true);
        break;
      case possibilities[1]:
        setIsShowingLinkingModal(true);
        break;
      case possibilities[2]:
        updateProspectChatStatus({ prospect: prospect.id, body: { is_mute: !prospect.is_mute } }, activeProperties);
        break;
      case possibilities[3]:
        updateProspectChatStatus({ prospect: prospect.id, body: { is_archived: true } }, activeProperties);
        break;
      case possibilities[4]:
        push(`/${getPropertyId()}/leads/${prospect.lead || prospect.guest_card}`);
        break;
      default:
        break;
    }
    setIsMenuDropdownOpen(false);
  };

  return (
    <React.Fragment>
      <Dropdown
        isOpen={isMenuDropdownOpen}
        toggle={(e) => {
          e.stopPropagation();
          setIsMenuDropdownOpen(!isMenuDropdownOpen);
        }}
      >
        <ActiveChatsMenuDots
          tag="div"
          data-toggle="dropdown"
          aria-expanded={isMenuDropdownOpen}
        >
          {isSingleChat ? <i className="ri-more-2-fill" /> : <VerticalMenuDots />}
        </ActiveChatsMenuDots>
        <ChatsMainMenuDropdown isSingleChat={isSingleChat} right>
          {Object.keys(Actions(prospect.is_mute))
            .filter(key => ((prospect.lead || prospect.guest_card) ? !['ADD_NEW_LEAD', 'LINK_TO_EXISTING_LEAD'].includes(key) : key !== 'VIEW_PROSPECT'))
            .map(key => <ChatsMainMenuDropdownItem className="dropdown-item" onClick={event => runAction(event, key)} key={key}>{Actions(prospect.is_mute)[key]}</ChatsMainMenuDropdownItem>)}
        </ChatsMainMenuDropdown>
      </Dropdown>
      <LeadLinkingModal
        show={isShowingLinkingModal}
        handleClose={(lead) => {
          updateProspectChatStatus({ prospect: prospect.id, body: { lead } }, activeProperties);
          setIsShowingLinkingModal(false);
        }}
      />
      <LeadCreationModal
        show={isShowingCreationModal}
        handleClose={(lead) => {
          updateProspectChatStatus({ prospect: prospect.id, body: { lead } }, activeProperties);
          setIsShowingCreationModal(false);
        }}
      />
    </React.Fragment>);
};

const mapStateToProps = state => ({
  activeProperties: state.prospectChat.activeProperties,
});

export default connect(
  mapStateToProps,
  {
    ...actions.prospectChat,
  },
)(withRouter(ProspectSetting));
