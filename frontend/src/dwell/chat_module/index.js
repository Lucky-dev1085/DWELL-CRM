/*eslint-disable*/
'use strict';

import view from './drawer';
import tourView from './tourSchedulerDrawer';
import storage from './propertyStorage';
import requests from './requests';
import { runTourScheduling, onTourCancelClick } from './tourScheduler';
import { runViewPhotos } from './viewPhotos';
import { runCheckPrice } from './checkPrice';
import { runResidentPortal } from './residentPortal';
import { runTextMe } from './textMe';
import runAgentConnect from './agentConnect';
import action from './base';
import { formatDate } from "dwell/chat_module/utils";

class DwellChat {
  constructor() {

    this.starterPromptsList = [
      // { name: 'Resident Access', handler: runResidentPortal },
      { name: 'Prices / Availability', handler: runCheckPrice },
      { name: 'View Photos', handler: runViewPhotos },
      { name: 'Schedule a Tour', handler: runTourScheduling },
      { name: 'Text me', handler: runTextMe },
    ];

    this.interval = null;
    this.timer = null;
  }

  initialize = () => {
    this.getSettings();
  };

  getSettings = () =>
    // This will load all the settings for current prospect and property
    requests.get(`/api/v1/chat_settings/?uuid=${action.prospectUUID}`, async (response) => {
      const { is_valid_property: isValidProperty, conversations, active_agent: activeAgent, tour,
        prospect_name: prospectName, lead, agent_avatar: agentAvatar, floor_plans: floorPlans, is_agent_available: isAgentAvailable,
        business_hours: businessHours, not_valid_prospect: notValidProspect, available_agents_number: availableAgentsNumber,
        is_in_group: isInGroup, tour_types: tourTypes, resident_portal: residentPortal, units, agent_chat_enabled: agentChatEnabled,
        neighborhood_url: neighborhoodURL, hobbes_enabled: hobbesEnabled, property_domain: propertyDomain, is_booking_enabled: is_booking_enabled,
        bedrooms: bedrooms, is_text_me_feature_enabled: isTextMeFeatureEnabled } = response;
      if (!isValidProperty) {
        return;
      }

      const prospectUUID = localStorage.getItem('prospect_uuid');
      if (prospectUUID) {
        localStorage.removeItem('prospect_uuid');
        storage.setToStorage('prospect_uuid', prospectUUID);
        action.prospectUUID = prospectUUID;
      }

      storage.setToStorage('property-name', floorPlans[0] && floorPlans[0].property);

      if (notValidProspect) {
        storage.removeFromStorage('prospect_uuid');
        action.prospectUUID = null;
      }

      const initialData = {
        floorPlans,
        units,
        conversations,
        activeAgent,
        tour,
        prospectName,
        agentAvatar,
        isAgentAvailable,
        businessHours,
        availableAgentsNumber,
        tourTypes,
        residentPortal,
        agentChatEnabled,
        neighborhoodURL,
        hobbesEnabled,
        isTextMeFeatureEnabled,
        propertyDomain,
        is_booking_enabled,
        bedrooms,
      };

      if (tour && Object.keys(tour).length !== 0 && tour.type !== 'VIRTUAL_TOUR') {
        const isNotEmptyLead = lead && Object.keys(lead).length !== 0;
        tourView.updateFormData({
          id: isNotEmptyLead ? tour.id : '',
          date: isNotEmptyLead ? formatDate(tour.tour_date) : '',
          time: isNotEmptyLead ? tour.tour_date : '',
          first_name: '',
          last_name: '',
          email: '',
          phone_number: '',
          move_in_date: isNotEmptyLead ? formatDate(lead.move_in_date) : '',
          type: tour.type,
          bedroom: isNotEmptyLead ? lead.bedroom : null,
          floor_plan: isNotEmptyLead ? lead.floor_plan : null,
          unit: isNotEmptyLead ? lead.unit : null,
        });
      }

      action.initialize(initialData);
      const isNewProspect = !action.prospectUUID
      if (!action.prospectUUID) {
        const response = await action.addProspect();
        action.setCookie('showStarterPrompts', true, 2);
        storage.setToStorage('prospect_uuid', response.external_id);
        action.prospectUUID = response.external_id;
        if (!response.is_in_group) return;
      } else if (!isInGroup) return;

      // change prospect status
      action.updateProspect({ is_active: true, tour_scheduling_in_progress: false });
      window.addEventListener('beforeunload', () => action.updateProspectActiveStatus(false));

      view.tabMessage = document.title;

      const pusherChecker = setInterval(() => {
        if (!window.Pusher || !window.io) return;
        clearInterval(pusherChecker);
        requests.fetchVirtualTours().then((tours) => {
          action.virtualTours = tours;
        });
        this.drawLayout(initialData, isNewProspect);
      }, 1000);

      setInterval(() => {
        action.updateLastVisitedPage();
      }, 10000);
    }, { cache: 'no-store' })
  ;

  drawLayout = (initialData, isNewProspect) => {
    document.documentElement.style.setProperty('--primary-color', window.primaryChatColor || '#267ffe');
    document.documentElement.style.setProperty('--secondary-color', window.primaryChatColor || '#4a5e8a');
    const link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = `${action.host}/static/tourScheduler.css`;
    document.head.appendChild(link);

    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(font);

    const splideScriptURL = 'https://cdn.jsdelivr.net/npm/@splidejs/splide@latest/dist/js/splide.min.js';
    if (!document.querySelectorAll(`script[src="${splideScriptURL}"]`).length) {
      const carouselStyles = document.createElement('link');
      carouselStyles.href = 'https://cdn.jsdelivr.net/npm/@splidejs/splide@2.4.14/dist/css/themes/splide-skyblue.min.css';
      carouselStyles.type = 'text/css';
      carouselStyles.rel = 'stylesheet';
      document.head.appendChild(carouselStyles);

      const carouselScript = document.createElement('script');
      carouselScript.src = splideScriptURL;
      document.head.appendChild(carouselScript);
    }

    tourView.setTourTypes(initialData.tourTypes);
    view.setActiveAgent(initialData.activeAgent, initialData.agentAvatar, initialData.isAgentAvailable);
    view.drawLayout(action.conversations, initialData.agentChatEnabled, () => view.addActionButtons(action));
    view.setChatState(action.updateChatState);
    if (initialData.agentChatEnabled) {
      view.setLiveAgentButtonDisplay(initialData.activeAgent ? 0 : initialData.availableAgentsNumber);
    }

    setInterval(() => {
      const chatModal = document.querySelector('.modal.chat');
      if (chatModal.classList.contains('closed') && !this.firstCheckedOpeningState) {
        storage.setToStorage('last_closed_time', new Date());
        this.firstCheckedOpeningState = true;
      }
    }, 5000);

    // setTimeout(() => view.addActionButtons(action), 500);

    if (initialData.agentChatEnabled) {
      view.getLiveAgentHandler(() => runAgentConnect(action, view, false, true));
    }
    setTimeout(() => view.drawAllConversations(action.conversations), 100);

    if (action.activeAgent) {
      runAgentConnect(action, view, true);
    }

    const params = new URLSearchParams(window.location.search);
    view.addChatBtn(this.openChatBoxCallback, this.showStarterPrompts, params.has('chat_open'), action.configurePusher);
    let isReturnButton = false;
    if (storage.getFromStorage('should_show_return_button')) {
      storage.removeFromStorage('should_show_return_button');
      isReturnButton = true;
    }
    tourView.addVideoModal();

    this.showStarterPrompts(isReturnButton);

    setTimeout(() => {
      const chatBtn = document.querySelector('.chat-btn')
      const container = chatBtn.parentNode;

      container.addEventListener('mouseover', () => {
        const modal = document.querySelector('.modal.chat');
        if (modal.classList.contains('closed')) {
          if (container.querySelector('.starter-btn')) {
            container.querySelectorAll('.starter-btn').forEach(e => {
              e.style.display = 'flex';
            })
          } else {
            this.showStarterPrompts(isReturnButton);
          }
        }
      });
    }, 3000)

    if (!action.hasGreeted && !action.conversations.length) {
      action.displayGreetingMessage(isNewProspect);
    }

    if (!view.activeAgent) {
      view.addActionButtons(action);
    }
  };

  showStarterPrompts = (isReturnButton = false) => {
    const isNewProspect = action.getCookie('showStarterPrompts');
    const isMobile = window.matchMedia('only screen and (max-width: 767px)').matches;
    if (isNewProspect && !isMobile && !isReturnButton) {
      setTimeout(() => {
        const modal = document.querySelector('.modal.chat');
        if (modal.classList.contains('closed')) {
          const filteredList = this.starterPromptsList
              .filter(item => !(item.handler === runTourScheduling && action.tour.id && action.tour.status === 'PENDING'))
              .filter(item => !(item.handler === runResidentPortal && !action.residentPortal))
              .filter(item => !(item.handler === runTextMe && !action.isTextMeFeatureEnabled));

          filteredList.forEach((item, index) => {
            let { name } = item;
            if (item.handler === runTourScheduling && action.tour.id) {
              if (action.tour.type !== 'VIRTUAL_TOUR') {
                name = 'Edit / Reschedule Tour';
              }
            }
            view.drawStarterPromptButton(name, () => {
              const btn = document.querySelector('.chat-btn');
              view.onChatButtonClick(btn, this.openChatBoxCallback, true, action.configurePusher);
              item.handler(action, view);
            }, index);
          });

          view.drawStarterPromptCloseButton(85 + filteredList.length * 42);
          if (action.hasGreeted || action.conversations.length) {
            view.playChatMessageAlarm();
          }
        }
      }, 1000);
    }
  }

  openChatBoxCallback = async (isStarterAction) => {
   if (action.activeAgent) {
      view.appendMessageBox(value => action.addChat('PROSPECT', value, { action: null, toAgent: true }))
      view.scrollToBottom();
    } else if (action.hobbesEnabled) {
      view.appendMessageBox(async (value) => {
        const convId = await action.addChat('PROSPECT', value);
        await action.askQuestionToBot(value, () => {
        }, convId);
      });
    }
    if (!action.hasGreeted && !action.conversations.length) {
      await action.sendGreetingMessage();
      if (action.tour.id) {
        if (action.tour.type !== 'VIRTUAL_TOUR') {
          tourView.addUpcomingTourData(
              () => runTourScheduling(action, view), onTourCancelClick, action.createConversationFromHTML, action.tour.status
          );
        }
        view.scrollToBottom();
      }
    }
  }
}

const pusherScript = document.createElement('script');
pusherScript.src = 'https://js.pusher.com/4.0/pusher.min.js';
document.head.appendChild(pusherScript);

const socketIoScript = document.createElement('script');
socketIoScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.js';
document.head.appendChild(socketIoScript);

const datepickerStyles = document.createElement('link');
datepickerStyles.href = 'https://cdn.jsdelivr.net/npm/vanillajs-datepicker@1.0/dist/css/datepicker.min.css';
datepickerStyles.type = 'text/css';
datepickerStyles.rel = 'stylesheet';
document.head.appendChild(datepickerStyles);

const datepickerScript = document.createElement('script');
datepickerScript.src = 'https://cdn.jsdelivr.net/npm/vanillajs-datepicker@1.0/dist/js/datepicker.min.js';
document.head.appendChild(datepickerScript);

const chat = new DwellChat();
chat.initialize();
