import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import actions from 'dwell/actions';
import { connect } from 'react-redux';
import { Dropdown } from 'reactstrap';
import he from 'he';
import {
  OptionsPanelDropdownItem,
  OptionsPanelDropdownMenu,
  OptionsPanelDropdownToggle,
  OptionsPanelIcon, OptionsPanelIconInner,
  ProspectMenu, ProspectMenuDivider, ProspectMenuItemBody, ProspectMenuItemButton, ProspectMenuLabel,
  TemplateTitle,
} from 'dwell/views/chat/multi_chat/styles';
import { isEmpty } from 'lodash';
import {
  ChatTemplateProps,
  LeadData,
  ListResponse,
  PropertyProps,
  DetailResponse,
} from 'src/interfaces';

interface MessageOptionsPanelProps extends RouteComponentProps {
  sendMessage: (message: string, type?: string) => void,
  setNewMessage: (message: string) => void,
  prospect: { name: '', has_guest_card: false, has_active_tour: false, id?: number, lead?: number, guest_card?: number,
    tour_scheduling_in_progress?: boolean, tour_date?: string },
  isSingleChat?: false,
  getChatTemplates: () => Promise<ListResponse>,
  chatTemplates: Array<ChatTemplateProps>,
  getLeadForProspect: (id: number) => Promise<DetailResponse>,
  lead: LeadData,
  property: PropertyProps,
  setMessageType: (type: string) => void,
}

const mockMessages = [
  { id: -1, title: 'Welcome', text: 'Welcome' },
  { id: -2, title: "I don't know", text: "I don't know" },
  { id: -3, title: 'Goodbye', text: 'Goodbye' },
];

const dataCaptureElements = [
  { title: 'Guest card', fields: 4 },
  { title: 'Name', fields: 2 },
  { title: 'Schedule a Tour', fields: 9 },
];

const MessageOptionsPanel: FC<MessageOptionsPanelProps> = ({ lead, getLeadForProspect, property, chatTemplates, getChatTemplates, sendMessage, setNewMessage, prospect, isSingleChat, setMessageType }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [messages, setMessages] = useState(mockMessages);
  const [prospectLead, setProspectLead] = useState(null);

  useEffect(() => {
    getChatTemplates();
  }, []);

  useEffect(() => {
    if (prospect.lead || prospect.guest_card) {
      getLeadForProspect(prospect.lead || prospect.guest_card);
    }
  }, [prospect.lead, prospect.guest_card]);

  useEffect(() => {
    if (lead && (prospect.lead === lead.id || prospect.guest_card === lead.id)) {
      setProspectLead(lead);
    }
  }, [lead]);

  useEffect(() => {
    const newChatTemplates = chatTemplates.map(template => ({ id: template.id, title: template.name, text: template.text }));
    setMessages([...mockMessages, ...newChatTemplates]);
  }, [chatTemplates]);

  const handleSendMessageClick = (message) => {
    sendMessage(message, 'DATA_CAPTURE');
    setIsDropdownOpen(false);
  };

  const handleSetMessageClick = (message) => {
    const tagReg = /(<([^>]+)>)/ig;
    let parsedMessage = he.decode(message.replaceAll(tagReg, ' '));
    const placeholderReg = /\[=(.*?)=\]/g;
    [...parsedMessage.matchAll(placeholderReg)].reduce((a, b) => a.concat(b[0]), [])
      .forEach((placeholder) => {
        switch (placeholder) {
          case '[=Tour time=]':
            if (!isEmpty(prospect) && prospect.tour_date) {
              const date = `${prospect.tour_date}`;
              parsedMessage = parsedMessage.replace(placeholder, date);
            } break;
          case '[=Lead owner=]':
            if (!isEmpty(prospectLead) && prospectLead.owner) {
              const owner = property.users.find(u => u.id === prospectLead.owner);
              parsedMessage = parsedMessage.replace(placeholder, `${owner.first_name} ${owner.last_name}`);
            } break;
          case '[=Lead full name=]':
            if (!isEmpty(prospectLead) && prospectLead.first_name && prospectLead.last_name) {
              const name = `${prospectLead.first_name} ${prospectLead.last_name}`;
              parsedMessage = parsedMessage.replace(placeholder, name);
            } break;
          case '[=Lead first name=]':
            if (!isEmpty(prospectLead) && prospectLead.first_name) {
              const name = prospectLead.first_name;
              parsedMessage = parsedMessage.replace(placeholder, name);
            } break;
          case '[=Property name=]':
            if (property && property.name) {
              parsedMessage = parsedMessage.replace(placeholder, property.name);
            } break;
          case '[=Property address=]':
            if (property && property.city) {
              parsedMessage = parsedMessage.replace(placeholder, `${property.city}, ${property.town}`);
            } break;
          case '[=Property phone number=]':
            if (property && property.tracking_number) {
              parsedMessage = parsedMessage.replace(placeholder, property.tracking_number);
            } break;
          case '[=Property website link=]':
            if (property) {
              parsedMessage = parsedMessage.replace(placeholder, `https//:${property.domain}/`);
            } break;
          case '[=Virtual tour link=]':
            parsedMessage = parsedMessage.replace(placeholder, `https://${property.domain}/virtual-tour`);
            break;
        }
      });
    setMessageType('TEMPLATE');
    setNewMessage(parsedMessage);
    setIsDropdownOpen(false);
  };

  let filteredCaptureElements = dataCaptureElements;
  if (prospect.name) {
    if (prospect.has_active_tour || prospect.tour_scheduling_in_progress) {
      filteredCaptureElements = filteredCaptureElements.filter(e => e.title !== 'Schedule a Tour');
    }
    if (prospect.has_guest_card) {
      filteredCaptureElements = filteredCaptureElements.filter(e => e.title !== 'Guest card');
    }
    filteredCaptureElements = filteredCaptureElements.filter(e => e.title !== 'Name');
  }

  return (
    <Dropdown isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(!isDropdownOpen)}>
      <OptionsPanelDropdownToggle
        tag="div"
        data-toggle="dropdown"
        aria-expanded={isDropdownOpen}
        className="toggle"
      >
        <OptionsPanelIcon className={isSingleChat ? 'ri-add-fill' : 'ri-add-circle-fill'} />
      </OptionsPanelDropdownToggle>
      <OptionsPanelDropdownMenu right>
        <ProspectMenu>
          {filteredCaptureElements.length ?
            <>
              <ProspectMenuLabel>Data capture elements</ProspectMenuLabel>
              {filteredCaptureElements.map((message, index) => (
                <OptionsPanelDropdownItem key={index}>
                  <ProspectMenuItemButton onClick={() => handleSendMessageClick(message.title)}>
                    <OptionsPanelIconInner className="ri-arrow-left-down-line" />
                  </ProspectMenuItemButton>
                  <ProspectMenuItemBody>
                    <span>{message.title}</span>
                    <span>{message.fields}</span>
                  </ProspectMenuItemBody>
                </OptionsPanelDropdownItem>
              ))}
              <ProspectMenuDivider />
            </> : null}
          <ProspectMenuLabel>Chat templates</ProspectMenuLabel>
          {messages.map((message, index) => (
            <OptionsPanelDropdownItem key={index}>
              <ProspectMenuItemButton onClick={() => handleSetMessageClick(message.text)}>
                <OptionsPanelIconInner className="ri-add-line" />
              </ProspectMenuItemButton>
              <ProspectMenuItemBody>
                <TemplateTitle>{message.title}</TemplateTitle>
              </ProspectMenuItemBody>
            </OptionsPanelDropdownItem>
          ))}
        </ProspectMenu>
      </OptionsPanelDropdownMenu>
    </Dropdown>);
};

const mapStateToProps = state => ({
  chatTemplates: state.chatTemplate.chatTemplates,
  property: state.property.property,
  lead: state.lead.leadProspect,
});

export default connect(
  mapStateToProps,
  {
    ...actions.prospectChat,
    ...actions.chatTemplate,
    ...actions.lead,
  },
)(withRouter(MessageOptionsPanel));
