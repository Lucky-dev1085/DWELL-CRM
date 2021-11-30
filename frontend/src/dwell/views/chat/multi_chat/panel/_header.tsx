import React, { FC, useEffect, useState } from 'react';
import actions from 'dwell/actions';
import { connect } from 'react-redux';
import cn from 'classnames';
import {
  ActiveChatHeader,
  CloseButton,
  Media,
  MediaBody,
  ProspectName,
  ProspectPage,
} from 'dwell/views/chat/multi_chat/styles';
import CloseCross from 'dwell/views/chat/multi_chat/svg/_closeCross';
import { getAvatarColor, getInitials } from 'dwell/views/chat/common/utils';
import 'src/scss/pages/_schedule_form.scss';
import { Avatar } from 'styles/common';
import ProspectSetting from '../../common/_prospectSetting';

interface ActiveChatPanelProps {
  contact: { id: number, name: string, last_visit_page_name: string, is_online: boolean, isSMS: boolean, unread_count: number, is_mute: boolean, property: number },
  removeFromActiveChats: (contact: { id: number, isSMS: boolean }) => void,
  newMessage: { prospect: number, type: string },
  properties: { id: number, name: string, domain: string }[],
  handleFirstChatRemove: () => void,
}

const Header: FC<ActiveChatPanelProps> = ({ contact, removeFromActiveChats, newMessage, properties, handleFirstChatRemove }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const property = properties.find(i => i.id === contact.property);

  useEffect(() => {
    if (contact.unread_count && ((newMessage.prospect === contact.id && !contact.isSMS) || contact.isSMS)) {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 5000);
    }
  }, [contact.unread_count]);

  let avatarClass = '';

  if (contact.isSMS) {
    avatarClass = cn(`avatar ${getAvatarColor(contact.name, contact.id, contact.isSMS)}`);
  } else {
    if (!contact) return <></>;
    avatarClass = cn(`avatar ${getAvatarColor(contact.name, contact.id, contact.isSMS)}`, {
      offline: !contact.is_online,
      online: contact.is_online,
    });
  }

  let source;
  if (contact.isSMS) {
    source = (
      <ProspectPage>{property.name}</ProspectPage>
    );
  } else {
    source = (
      <ProspectPage>
        <div>Source: <strong>{property.domain}</strong></div>
        <div>Viewing: <strong>{contact.last_visit_page_name}</strong>
        </div>
      </ProspectPage>
    );
  }

  const handleCloseButton = () => {
    if (handleFirstChatRemove) {
      handleFirstChatRemove();
      setTimeout(() => removeFromActiveChats({ id: contact.id, isSMS: contact.isSMS }), 300);
    } else {
      removeFromActiveChats({ id: contact.id, isSMS: contact.isSMS });
    }
  };

  return (
    <ActiveChatHeader isBlinking={isBlinking}>
      <Media>
        <Avatar className={`${avatarClass} mr-2`} hideOnlineIcon={contact.isSMS}>
          {getInitials(contact.name, contact.isSMS)}
        </Avatar>
        <MediaBody>
          <ProspectName>{contact.name} {!contact.isSMS && contact.is_mute && <i className="ri-notification-off-fill" />}</ProspectName>
          {source}
        </MediaBody>
      </Media>
      {contact.isSMS ? null : <ProspectSetting prospect={contact} />}
      <CloseButton onClick={handleCloseButton}>
        <CloseCross />
      </CloseButton>
    </ActiveChatHeader>
  );
};

const mapStateToProps = state => ({
  newMessage: state.prospectChat.newMessage,
  properties: state.property.properties,
});

export default connect(
  mapStateToProps,
  {
    ...actions.prospectChat,
  },
)(Header);
