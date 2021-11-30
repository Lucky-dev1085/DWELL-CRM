import React, { FC, useState } from 'react';
import { Dropdown } from 'reactstrap';
import { connect } from 'react-redux';
import {
  ChatSettingsButton,
  ChatSettingsDropdownItem,
  ChatSettingsDropdownList,
  ChatSettingsDropdownMenu,
  ChatsSettingsMenuLabel,
  ChatsSettingsWrapper, FormSwitch, FormSwitchWrapper, ItemBody, ItemBodyName, ItemBodyProspects,
  PropertyItemLogo, PropertyItemLogoImg,
} from 'dwell/views/chat/multi_chat/styles';
import ListSettings from 'dwell/views/chat/multi_chat/svg/_listSettings';
import actions from 'dwell/actions';

interface PropertyProps {
  id: number,
  logo: string,
  name: string,
  active_prospects: number,
}

interface ChatSettingsProps {
  property: PropertyProps,
  properties: PropertyProps[],
  activeProperties: number[],
  setActiveProperties: (ids?: number[]) => void,
  getAllProspects: (show_all: boolean, properties: number[]) => void,
}

const ChatSettings: FC<ChatSettingsProps> = ({ properties, property, activeProperties, setActiveProperties, getAllProspects }) => {
  const [isChatSettingsOpen, setIsChatSettingsOpen] = useState(false);

  const onActiveChange = (pid, checked) => {
    if (checked) {
      setActiveProperties(activeProperties.filter(id => id !== pid));
    } else {
      setActiveProperties(activeProperties.concat([pid]));
      getAllProspects(true, activeProperties.concat([pid]));
    }
  };

  return (
    <ChatsSettingsWrapper>
      <Dropdown isOpen={isChatSettingsOpen} toggle={() => setIsChatSettingsOpen(!isChatSettingsOpen)}>
        <ChatSettingsButton
          tag="button"
          data-toggle="dropdown"
          aria-expanded={isChatSettingsOpen}
        >
          <ListSettings />
        </ChatSettingsButton>
        <ChatSettingsDropdownMenu right>
          <ChatsSettingsMenuLabel>Show Properties</ChatsSettingsMenuLabel>
          <ChatSettingsDropdownList>
            {properties.map((p, index) => (
              <ChatSettingsDropdownItem key={index}>
                <PropertyItemLogo>
                  <PropertyItemLogoImg src={(property && property.logo) ? property.logo : '/static/images/mt-logo.png'} alt="PLogo" />
                </PropertyItemLogo>
                <ItemBody index={index}>
                  <ItemBodyName>{p.name}</ItemBodyName>
                  <ItemBodyProspects>{p.active_prospects} active prospect{p.active_prospects > 1 ? 's' : ''}</ItemBodyProspects>
                </ItemBody>
                <FormSwitchWrapper>
                  <FormSwitch
                    checked={activeProperties.includes(p.id)}
                    onClick={({ target: { checked } }) => onActiveChange(p.id, checked)}
                  />
                </FormSwitchWrapper>
              </ChatSettingsDropdownItem>
            ))}
          </ChatSettingsDropdownList>
        </ChatSettingsDropdownMenu>
      </Dropdown>
    </ChatsSettingsWrapper>);
};

const mapStateToProps = state => ({
  properties: state.property.properties,
  property: state.property.property,
  activeProperties: state.prospectChat.activeProperties,
});

export default connect(
  mapStateToProps,
  {
    ...actions.prospectChat,
  },
)(ChatSettings);
