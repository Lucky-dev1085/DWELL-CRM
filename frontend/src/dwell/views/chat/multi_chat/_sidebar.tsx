import React, { useState } from 'react';
import { Dropdown } from 'reactstrap';
import { connect } from 'react-redux';
import { MoreHorizontal } from 'react-feather';
import { MULTI_CHAT_FILTER } from 'dwell/constants';
import actions from 'dwell/actions';
import {
  ChatsBack, ChatsBackSvg,
  ChatSidebarContent,
  ChatSidebarHeader,
  ChatsMainMenu,
  ChatsMainMenuDropdown,
  ChatsMainMenuDropdownItem,
  ChatsMainMenuNav,
  ChatsMenuDots,
  ChatsMenuItem,
  ChatsMyMenu,
  ChatsOtherMenu,
  ChatsOtherMenuTitle,
  ChatsSearch,
  ChatsSearchInput,
  ChatsSidebarMenu,
} from './styles';
import MagnifyingGlass from './svg/_magnifyingGlass';
import ChatsSettings from './_settings';
import Contacts from './_contacts';
import { getSearchPlaceholder } from '../common/utils';

const ChatSidebar = ({ contacts }) : JSX.Element => {
  const filter = localStorage.getItem(MULTI_CHAT_FILTER);
  const defaultOtherFilter = ['All Prospects', 'Archive Prospects', 'SMS'].includes(filter) ? filter : null;
  // eslint-disable-next-line no-nested-ternary
  const defaultMainFilter = ['ACTIVE', 'MY'].includes(filter) ? filter : (defaultOtherFilter ? null : 'ACTIVE');
  const [keyword, setKeyword] = useState('');
  const [mainMenuItem, setMainMenuItem] = useState(defaultMainFilter);
  const [otherMenuItem, setOtherMenuItem] = useState(defaultOtherFilter);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);

  const onOtherMenuItemClick = (name) => {
    setIsMenuDropdownOpen(false);
    setOtherMenuItem(name);
    localStorage.setItem(MULTI_CHAT_FILTER, name);
  };

  const onMainMenuItemClick = (name) => {
    setMainMenuItem(name);
    localStorage.setItem(MULTI_CHAT_FILTER, name);
  };

  const onBackIconClick = () => {
    setOtherMenuItem(null);
    onMainMenuItemClick('ACTIVE');
  };

  const smsUnread = contacts.reduce((acc, crr) => (acc + Number(crr.unread_count)), 0);

  return (
    <ChatSidebarContent>
      <ChatSidebarHeader>
        <ChatsSearch>
          <MagnifyingGlass />
          <ChatsSearchInput onChange={({ target: { value } }) => setKeyword(value)} placeholder={getSearchPlaceholder(filter)} />
        </ChatsSearch>
        <ChatsSettings />
      </ChatSidebarHeader>
      <ChatsSidebarMenu>
        {!otherMenuItem ?
          <ChatsMainMenu>
            <ChatsMainMenuNav>
              <ChatsMenuItem active={mainMenuItem === 'ACTIVE'} onClick={() => onMainMenuItemClick('ACTIVE')}>Active Prospects</ChatsMenuItem>
              <ChatsMyMenu active={mainMenuItem === 'MY'} onClick={() => onMainMenuItemClick('MY')}>My Chats</ChatsMyMenu>
            </ChatsMainMenuNav>
            <Dropdown isOpen={isMenuDropdownOpen} toggle={() => setIsMenuDropdownOpen(!isMenuDropdownOpen)}>
              <ChatsMenuDots
                tag="div"
                data-toggle="dropdown"
                aria-expanded={isMenuDropdownOpen}
              >
                <MoreHorizontal />
                {smsUnread ? <span /> : null}
              </ChatsMenuDots>
              <ChatsMainMenuDropdown right>
                <ChatsMainMenuDropdownItem onClick={() => onOtherMenuItemClick('All Prospects')}>All Prospects</ChatsMainMenuDropdownItem>
                <ChatsMainMenuDropdownItem onClick={() => onOtherMenuItemClick('Archive Prospects')}>Archived Prospects</ChatsMainMenuDropdownItem>
                <ChatsMainMenuDropdownItem onClick={() => onOtherMenuItemClick('SMS')}>SMS {smsUnread ? <span /> : null}</ChatsMainMenuDropdownItem>
              </ChatsMainMenuDropdown>
            </Dropdown>
          </ChatsMainMenu> :
          <ChatsOtherMenu>
            <ChatsBack onClick={() => onBackIconClick()}>
              <ChatsBackSvg />
            </ChatsBack>
            <ChatsOtherMenuTitle>{otherMenuItem}</ChatsOtherMenuTitle>
          </ChatsOtherMenu>}
      </ChatsSidebarMenu>
      <Contacts mainMenuItem={mainMenuItem} otherMenuItem={otherMenuItem} searchKeyword={keyword} />
    </ChatSidebarContent>);
};

const mapStateToProps = state => ({
  contacts: state.smsMessage.contacts,
});

export default connect(
  mapStateToProps,
  {
    ...actions.smsMessage,
  },
)(ChatSidebar);
