import React, { FC, useState } from 'react';
import { connect } from 'react-redux';
import cn from 'classnames';
import actions from 'dwell/actions';
import { Dropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap';

interface ProspectSettingProps {
  activeFilter: string,
  setActiveFilter: (filter: string) => void,
}

const ProspectFilter: FC<ProspectSettingProps> = ({ activeFilter, setActiveFilter }) : JSX.Element => {
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);

  const onClick = (filter) => {
    setActiveFilter(filter);
    setIsMenuDropdownOpen(false);
  };

  return (
    <React.Fragment>
      <Dropdown isOpen={isMenuDropdownOpen} toggle={() => setIsMenuDropdownOpen(!isMenuDropdownOpen)}>
        <DropdownToggle tag="a" className="btn"><i className="ri-list-settings-line" /></DropdownToggle>
        <DropdownMenu right>
          <DropdownItem className={cn({ active: activeFilter === 'Active' })} onClick={() => onClick('Active')} tag="a">
            <i className="ri-message-2-fill" /> Active Prospects
          </DropdownItem>
          <DropdownItem className={cn({ active: activeFilter === 'My' })} onClick={() => onClick('My')} tag="a">
            <i className="ri-chat-4-fill" /> My Chats
          </DropdownItem>
          <DropdownItem className={cn({ active: activeFilter === 'All' })} onClick={() => onClick('All')} tag="a">
            <i className="ri-question-answer-fill" /> All Prospects
          </DropdownItem>
          <DropdownItem className={cn({ active: activeFilter === 'Archive' })} onClick={() => onClick('Archive')} tag="a">
            <i className="ri-chat-download-fill" /> Archived Prospects
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>);
};

export default connect(
  null,
  {
    ...actions.prospectChat,
  },
)(ProspectFilter);
