/*eslint-disable*/
import view from './drawer';
import storage from './propertyStorage';
import requests from './requests';
import { onVirtualTourClick, runTourScheduling, onTourCancelClick } from './tourScheduler';
import { visitPhotos } from './viewPhotos';
import { navigatePricePage } from './checkPrice';
import runAgentConnect from './agentConnect';
import tourView from "dwell/chat_module/tourSchedulerDrawer";
import {formatDate} from "dwell/chat_module/utils";

class Action {
  constructor() {
    this.propertyName = '{{ propertyName }}';
    this.propertyExternalId = '{{ propertyExternalId }}';
    this.clientId = '{{ clientId }}';
    this.floorPlans = [];
    this.units = [];
    this.virtualTours = [];
    this.conversations = [];
    this.chatBotReplies = [];
    this.isAddingChatBotReply = false;
    this.propertyDomain = '{{ propertyDomain }}';
    this.host = '{{ host }}';
    this.prospectUUID = storage.getFromStorage('prospect_uuid');
    this.pusherKey = '{{ pusherKey }}';
    this.pusherCluster = '{{ pusherCluster }}';
    this.chatBotHost = '{{ chatBotHost }}';
    this.activeAgent = '';
    this.hasGreeted = false;
    this.tour = {};
    this.prospectName = '';
    this.isJoinedLiveAgent = false;
    this.agentAvatar = '';
    this.isAgentAvailable = false;
    this.last_visit_page = '';
    this.businessHours = [];
    this.socket = null;
    this.is_waiting_agent = false;
    this.waitingAgentTimer = null;
    this.availableAgentsNumber = 0;
    this.mtHost = '{{ mtHost }}';
    this.mtBaseUrl = '{{ mtBaseUrl }}';
    this.residentPortal = '';
    this.currentFormMessageId = null;
    this.galleryData =  {
        image: null,
        text: '',
        title: '',
      };
    this.isTyping = false;
    this.typingTimeoutId = null;
    this.neighborhoodURL = '';
    this.hobbesEnabled = false;
    this.is_booking_enabled = true;
    this.isTextMeFeatureEnabled = false;
    this.bedrooms = [];
    this.isSetPropertyToHobbes = false;
  }

  initialize = ({ floorPlans, units, conversations, activeAgent, tour, prospectName, agentAvatar, isAgentAvailable,
    businessHours, availableAgentsNumber, residentPortal, neighborhoodURL, hobbesEnabled, is_booking_enabled, bedrooms, isTextMeFeatureEnabled }) => {
    this.floorPlans = floorPlans;
    this.units = units;
    this.conversations = conversations;
    this.activeAgent = activeAgent;
    this.tour = tour;
    this.prospectName = prospectName;
    this.agentAvatar = agentAvatar;
    this.isAgentAvailable = isAgentAvailable;
    this.businessHours = businessHours;
    this.availableAgentsNumber = availableAgentsNumber;
    this.residentPortal = residentPortal;
    this.neighborhoodURL = neighborhoodURL;
    this.hobbesEnabled = hobbesEnabled;
    this.is_booking_enabled = is_booking_enabled;
    this.bedrooms = bedrooms;
    this.isTextMeFeatureEnabled = isTextMeFeatureEnabled;
  };

  addProspect = () => {
    // we should use current in / out group prospects distribution ratio as variable to study it on 90 % / 10 %
    const isInGroup = Math.floor((Math.random() * 10)) % 10 < 9;
    const data = {
      last_visit_page: window.location.pathname,
      is_active: true,
      source: window.location.host.includes(this.mtHost) ? 'MT' : 'SITE',
      is_in_group: isInGroup,
    };
    return new Promise((resolve) => {
      requests.post('/api/v1/prospects/', data, (response) => {
        resolve(response);
      });
    });
  };

  // depends on view
  addChat = async (type, content, kwargs = {}, shouldScroll = true) => {
    const { action , toAgent } = kwargs;
    const data = {
      message: content,
      type,
    };
    if (action) data.action = action;
    if (type === 'PROSPECT' && toAgent) data.to_agent = true;
    const response = await this.createConversation(data);
    view.addChat(type, content, { pk: response.external_id, shouldScroll });
    this.conversations.push(response);
    return response.id;
  };

  createConversationFromHTML = (element, isCapturingData = false) => {
    const content = element.innerHTML;
    const data = {
      message: content,
      type: 'PROSPECT',
      is_form_message: true,
    };
    return this.createConversation(data).then((response) => {
      element.setAttribute('id', `conv-${response.external_id}`);
      if (isCapturingData) {
        this.currentFormMessageId = response.id;
      }
    });
  };

  updateConversationFromHTML = (element, id) => {
    const content = element.innerHTML;
    const data = {
      message: content,
    };
    return this.updateConversation(data, id).then((response) => {
      element.setAttribute('id', `conv-${response.external_id}`);
    });
  };

  createConversation = data => new Promise((resolve) => {
    requests.post(`/api/v1/prospects/${this.prospectUUID}/conversations/`, data, (response) => {
      resolve(response);
      storage.setToStorage('last_active_time', new Date());
    });
  });

  updateConversation = (data, id) => new Promise((resolve) => {
    requests.patch(`/api/v1/prospects/${this.prospectUUID}/conversations/${id}/`, data, (response) => {
      resolve(response);
      storage.setToStorage('last_active_time', new Date());
    });
  });

  configurePusher = () => {
    const pusher = new Pusher(this.pusherKey, {
      authEndpoint: '/pusher/auth',
      cluster: this.pusherCluster,
      encrypted: true,
    });
    const channel = pusher.subscribe(`prospect-${this.prospectUUID}`);
    channel.bind('chatconversation_created', (conversation) => {
      const message = conversation.type === 'JOINED' ? `${conversation.agent_name} has entered the chat.` : conversation.message;
      if (conversation.type === 'JOINED') {
        const reconnectButton = document.querySelector('.chat .modal-header .reconnect-agent');
        if (reconnectButton) {
          reconnectButton.parentNode.removeChild(reconnectButton);
        }
        const backButton = document.querySelector('.chat .modal-header .back');
        if (backButton) {
          backButton.style.display = 'flex';
        }
        view.removeBotContainer();
        view.changeModalHeaderAvatar(conversation.agent_name, conversation.agent_avatar);
        view.appendMessageBox(value => this.addChat('PROSPECT', value, { action: null, toAgent: true }), conversation.agent_name);
        view.setLiveAgentButtonDisplay(0);
        this.activeAgent = conversation.agent_name;

        const loader = document.querySelector('.dots-loader-container');
        if (loader) {
          loader.parentNode.removeChild(loader);
        }
        this.waitingAgentTimer = null;
        this.updateAgentWaiting();
      }
      if (conversation.type !== 'DATA_CAPTURE') {
        view.addChat(conversation.type, message, { isFormMessage: conversation.is_form_message,
          pk: conversation.external_id,
          agent_avatar: conversation.agent_avatar,
          agent_name: conversation.agent_name });
      } else {
        if (conversation.message === 'Schedule a Tour') {
          runTourScheduling(this, view, null, true);
        } else {
          const chatContainer = document.querySelector('.chat .chat-container ul');
          const formListItem = document.createElement('li');
          formListItem.innerHTML = '<div class="schedule-form"></div>';
          chatContainer.appendChild(formListItem);
          tourView.startDataCaptureAction(conversation.message, (data, isFinal) => this.sendProspectData(data, false, isFinal));
        }
      }
    });
    channel.bind('user_changed', ({ active_agent: activeAgent, agent_avatar: agentAvatar, is_available: isAvailable }) => {
      if (isAvailable) {
        view.setLiveAgentButtonDisplay(0);
      }
      view.removeQuestionActionButton();
      view.removeBotContainer();
      view.setActiveAgent(activeAgent, agentAvatar, isAvailable);
      this.activeAgent = activeAgent;
      view.changeModalHeaderAvatar(activeAgent, agentAvatar);
      view.changeOnlineIcon(isAvailable);
      view.appendMessageBox(value => this.addChat('PROSPECT', value, { action: null, toAgent: true }), activeAgent);
    });
    channel.bind('available_agents_number_changed', ({ available_agents_number: availableAgentsNumber }) => {
      if (!view.isAgentAvailable) {
        view.setLiveAgentButtonDisplay(availableAgentsNumber);
      } else {
        view.setLiveAgentButtonDisplay(0);
      }
      this.availableAgentsNumber = availableAgentsNumber;
      if (availableAgentsNumber === 0 && this.waitingAgentTimer) {
        this.onAgentWaitingTimeout();
      }
    });
    channel.bind('user_typing', ({ is_typing: isTyping }) => {
      this.isTyping = isTyping;
      clearTimeout(this.typingTimeoutId);
      view.drawTyping(this.activeAgent)
      this.typingTimeoutId = setTimeout(() => {
        this.isTyping = false;
        view.clearTyping()
      }, 900);
    })

    channel.bind('task_changed', ({tour_date, type, units}) => {
      const tourDate = formatDate(tour_date);
      requests.getAvailableTourTime(tourDate, type, units, action.tour.id).then((times) => {
        tourView.availableTourTimes = times;
        tourView.updateFormData({ type, date: tourDate, time: tour_date});
        action.tour.date = tourDate;
        action.tour.time = tour_date;
        action.tour.type = type;
        tourView.replaceTimes(true);
      });
    });
  };

  // configureSocket = () => {
  //   if (!this.prospectUUID) return;
  //   this.socket = window.io(this.chatBotHost, { path: '/socket.io/' })
  //   this.socket.on('connect', () => {
  //     this.socket.emit('session_request', { session_id: this.prospectUUID });
  //     console.log('emitted');
  //   });
  //   this.socket.on('session_confirm', (sessionObject) => {
  //     const remoteId = (sessionObject && sessionObject.session_id)
  //         ? sessionObject.session_id
  //         : sessionObject;
  //
  //     // eslint-disable-next-line no-console
  //     console.log(`session_confirm:${this.socket.socket} session_id:${remoteId}`);
  //   });
  //   this.socket.on('bot_uttered', (data) => {
  //     this.chatBotReplies.push(data);
  //     this.addChatRelies();
  //   });
  //   this.socket.on('disconnect', (reason) => {
  //     // eslint-disable-next-line no-console
  //     console.log(reason);
  //   });
  //
  //   // set property
  //   this.askQuestionToBot(`/set_property{\"property\": \"${this.propertyDomain}\"}`, );
  //   // this.askQuestionToBot(`/set_property{\"property\": \"localhost:3000\"}`, );
  //
  // };

  updateChatState = (isChatOpen) => {
    if (storage.getFromStorage('prospect_uuid')) {
      return requests.patch(`/api/v1/prospects/${storage.getFromStorage('prospect_uuid')}/`, { is_chat_open: isChatOpen });
    }
    return new Promise(resolve => resolve());
  };

  updateLastVisitedPage = () => {
    if (storage.getFromStorage('prospect_uuid') && this.last_visit_page !== window.location.pathname) {
      this.last_visit_page = window.location.pathname;
      return requests.patch(
        `/api/v1/prospects/${storage.getFromStorage('prospect_uuid')}/`,
        { last_visit_page: window.location.pathname },
      );
    }
    return Promise.resolve(true);
  };

  // addChatRelies = async () => {
  //   if (this.isAddingChatBotReply) return;
  //   while (this.chatBotReplies.length) {
  //     this.isAddingChatBotReply = true;
  //     const reply = this.chatBotReplies.shift();
  //     await this.onBotUttered(reply);
  //   }
  //   this.isAddingChatBotReply = false;
  // }

  confirmBotPrompt = (type, context = {}) => {
    let href = '', message = '';
    if (type === 'communities') {
      href = window.location.host.includes(this.mtHost) ? `${this.mtBaseUrl}amenities` : '/amenities#communities-anchor-scroll';
      message = 'Sure thing, just a moment while I direct you to our full list of amenities';
    }
    if (type === 'amenities') {
      href = window.location.host.includes(this.mtHost) ? `${this.mtBaseUrl}amenities` : '/amenities#amenities-anchor-scroll';
      message = 'Sure thing, just a moment while I direct you to our full list of amenities';
    }
    if (type === 'apply') {
      href = window.location.host.includes(this.mtHost) ? `${this.mtBaseUrl}apply` : '/apply-now';
      message = 'Sure thing, just a moment while I direct you to our application form.';
    }
    if (type === 'community_map') {
      href = window.location.host.includes(this.mtHost) ? `${this.mtBaseUrl}floor-plans#/#floorplans` : '/amenities#community-map-anchor-scroll';
      message = 'Of course! Just a moment while I direct you to our community map.';
    }
    if (type === 'schedule_tour_prompt') {
      return runTourScheduling(this, view, null, false, context.tour_type, true);
    }
    if (type === 'neighborhood') {
      href = window.location.host.includes(this.mtHost) ? `${this.mtBaseUrl}neighborhood` : `/${this.neighborhoodURL}`;
      message = 'Sure thing, just a moment while I direct you to our full list of go-to neighborhood spots.';
    }
    if (type === 'resident_access') {
      href = this.residentPortal;
      message = 'Sure thing, just a moment while I direct you to the resident portal.';
    }
    this.addChat('BOT', message).then(() => {
      setTimeout(() => {
        const originalLocation = window.location.href;
        window.location.href = href;
        if (originalLocation === '/amenities') window.location.reload();
        storage.setToStorage('should_show_return_button', 'true');
      }, 1500);
    });
  }

  cancelBotPrompt = () => {
    this.addChat('BOT', 'Ok, is there anything else I can help you with?');
  }

  // depends on view
  onBotUttered = async (data, shouldScroll = true, questionId = null) => {
    const isGreeting = false;
    let { text } = data;

    if (questionId) {
      let questionResult = 'ANSWERED';
      if (text === 'utter_live_agent') questionResult = 'FAILED';
      if (text === 'utter_no_data') questionResult = 'NO_DATA';
      if (text === 'utter_rephrase') questionResult = 'REPHRASED';
      const hobbesAnswer = {};
      Object.keys(data).forEach(key => {
        if (key !== 'recipient_id') hobbesAnswer[key] = data[key];
      });
      this.updateConversation({ question_result: questionResult, hobbes_answer: hobbesAnswer }, questionId);
    }

    if (data.custom) {
      const { custom } = data;
      switch (custom.type) {
        case 'view_photos':
          setTimeout(() => {
            this.galleryData = requests.fetchImages();
            if (this.galleryData.image) {
              view.showGalleryForm(this, this.galleryData, (action, view) => visitPhotos(action, view),
                      node => this.createConversationFromHTML(node));
            } else {
              visitPhotos(this, view);
            }
          }, custom.wait);
          break;
        case 'check_prices':
          setTimeout(() => {
            navigatePricePage(this, view);
          }, custom.wait);
          break;
        case 'virtual_tour':
          const tours = JSON.parse(custom.tours);
          onVirtualTourClick(tours);
          break;
        case 'show_units':
          const units = JSON.parse(custom.units).map(unit => ({ ...unit, images: unit.images || [] }));
          view.showUnits(units, node => this.createConversationFromHTML(node), this);
          break;
        case 'view_communities':
          const communities = custom.communities.map(item => `<span>&#8226;</span> ${item}`).join('<br>');
          this.addChat('BOT', 'Our community offers several class-A features and has everything you need to to feel right at home. Here<span>&#146;</span>s a few of our favorites:' +
              `<br/><br/>${communities}<br/><br/>Want to see our full list of community features?`).then(() => {
            setTimeout(() => {
              view.showBotPrompt(this.confirmBotPrompt, this.cancelBotPrompt, 'communities');
            }, 1000);
          });
          break;
        case 'navigate_apply_flow':
          this.addChat('BOT', 'You can reach out to our property team directly, or I can direct you to fill out a quick form to start the application process.' +
              `<br/><br/>Would you like me to direct you to our application form?`).then(() => {
            setTimeout(() => {
              view.showBotPrompt(this.confirmBotPrompt, this.cancelBotPrompt, 'apply');
            }, 1000);
          });
          break;
        case 'navigate_community_map':
          this.confirmBotPrompt('community_map');
          break;
        case 'resident_access':
          setTimeout(() => {
            view.showBotPrompt(this.confirmBotPrompt, this.cancelBotPrompt, 'resident_access');
          }, 1000);
          break;
        case 'schedule_tour_prompt':
          setTimeout(() => {
            if (custom.show_directly) {
              runTourScheduling(this, view, null, false, custom.tour_type, true);
            } else {
              view.showBotPrompt(this.confirmBotPrompt, this.cancelBotPrompt, 'schedule_tour_prompt', { tour_type: custom.tour_type });
            }
          }, 2000);
          break;
        case 'reschedule_tour':
          setTimeout(() => {
            if (this.tour.id) {
              runTourScheduling(this, view, null, false, null, true);
            } else {
              this.addChat('BOT', 'I don’t see any tours to reschedule for you. Would you like to schedule a new tour?').then(
                  () => view.showBotPrompt(this.confirmBotPrompt, this.cancelBotPrompt, 'schedule_tour_prompt', { tour_type: custom.tour_type }));
            }
          }, 2000);
          break;
        case 'cancel_tour':
          setTimeout(() => {
            if (this.tour.id) {
              onTourCancelClick(true);
            } else {
              this.addChat('BOT', 'I don’t see any tours to cancel for you. Would you like to schedule a new tour?').then(
                  () => view.showBotPrompt(this.confirmBotPrompt, this.cancelBotPrompt, 'schedule_tour_prompt', { tour_type: custom.tour_type }));
            }
          }, 2000);
          break;
        case 'show_upcoming_tour':
          setTimeout(() => {
            if (this.tour.id) {
              tourView.addUpcomingTourData(
                  () => runTourScheduling(this, view), () => onTourCancelClick(true),
                  node => this.createConversationFromHTML(node), this.tour.status
              );
            } else {
              this.addChat('BOT', 'I can’t find any upcoming tour appointments for you. ' +
                  'Typically, this means you either cancelled the tour or you scheduled the tour on a different device than what you’re using right now. ' +
                  'Do you want to schedule a new tour?').then(
                  () => view.showBotPrompt(this.confirmBotPrompt, this.cancelBotPrompt, 'schedule_tour_prompt', { tour_type: custom.tour_type }));
            }
          }, 2000);
          break;
        case 'exit_hobbes':
          setTimeout(() => {
            view.addActionButtons(this);
          }, 2000);
          break;
        case 'view_amenities':
          const amenities = custom.amenities.map(item => `<span>&#8226;</span> ${item}`).join('<br>');
          this.addChat('BOT', 'Our community offers several class-A amenities to help make your stay with us memorable. ' +
              `Some of our resident favorites include:<br/><br/>${amenities}<br/><br/>Want to see our full list of amenities?`).then(() => {
            setTimeout(() => {
              view.showBotPrompt(this.confirmBotPrompt, this.cancelBotPrompt, 'amenities');
            }, 1000);
          });
          break;
        case 'view_neighborhood':
          const locations = custom.locations.map(item => `<span>&#8226;</span> ${item}`).join('<br>');
          this.addChat('BOT', 'Our community neighborhood offers lots of great places to eat, shop, and explore. ' +
              `Here's a few of our resident favorites:<br/><br/>${locations}<br/><br/>Want to see our full list of go-to neighborhood spots?`).then(() => {
            setTimeout(() => {
              view.showBotPrompt(this.confirmBotPrompt, this.cancelBotPrompt, 'neighborhood');
            }, 1000);
          });
          break;
        case 'resident_quotes':
          const quotes = custom.resident_quotes;
          view.showQuotes(quotes, node => this.createConversationFromHTML(node));
          break;
        case 'agent_transfer_request':
          runAgentConnect(this, view, false, false, null);
          break;
        case 'button':
          const { context } = custom;
          view.addLeasingButtons(context, (message) => {
            this.addChat('PROSPECT', message).then(() => {
              this.askQuestionToBot(message);
            });
          });
          break;
        case 'question_prompt':
          let response;

          const lastHobbesGreeting = storage.getFromStorage('last_hobbes_greeting');
          if (lastHobbesGreeting) {
            const diffTime = Math.abs(new Date() - Date.parse(lastHobbesGreeting));
            const diffMinutes = Math.ceil(diffTime / (1000 * 60));
            if (diffMinutes < 30) {
              response = 'Happy to help! Just type your question in the text field below.'
            }
          }

          if (!response) {
            response = `Hi! I\'m Hobbes, ${this.propertyName}'s bot assistant and I can help answer your questions about:<br>` +
            '\u2022 Apartments<br>' +
            '\u2022 Leasing<br>' +
            '\u2022 Promotions<br>' +
            '\u2022 Amenities<br>' +
            '\u2022 Tours<br>' +
            '\u2022 Office<br>' +
            '\u2022 Community<br>' +
            '\u2022 Neighborhood<br><br>' +
            'Just type your question in the text field below!';
            storage.setToStorage('last_hobbes_greeting', new Date());
          }
          this.addChat('BOT', response);
          break;
      }
    }

    if (!text) return;

    if (text === 'utter_rephrase') {
      text = 'Sorry, I didn\'t understand your question. Can you rephrase and ask again?';
    } else if (['utter_live_agent', 'utter_no_data', 'utter_agent_transfer_request'].includes(text)) {
      let type = '';
      if (text === 'utter_live_agent') type = 'suggest_transfer';
      if (text === 'utter_no_data') type = 'no_data';
      if (text === 'utter_agent_transfer_request') type = 'transfer_request';
      return this.availableAgentsNumber > 0 ? runAgentConnect(this, view, false, false, type) :
        this.noAvailableAgents(true, type);
    } else if (text.includes('utter_')) {
      return;
    }
    text = text.split('\n').join('<br />');

    if (isGreeting) {
      // todo get variable from BOT
      text = `Welcome to ${this.propertyName}! What can I help you with today? <br /><br /> If you have a question, please type below.\n`;
      if (this.prospectName) {
        text = `Hi, ${this.prospectName} welcome back! What can I help you with today? <br /><br /> If you have a question, please type below.\n`;
      }
      await this.addChat('BOT', text, { action: null, toAgent: false });
    } else {
      await this.addChat('BOT', text, { action: null, toAgent: false }, shouldScroll);
    }
  }

  askForMoreHelp = async () => {
    await this.addChat('BOT', 'Anything else I can help you with?');
    // view.hideMessageBox(true);

    const noThanksBtn = document.querySelector('.no-thanks');
    if (noThanksBtn) {
      noThanksBtn.parentNode.removeChild(noThanksBtn);
    }
  }

  setPropertyToChatBot = () => this.askQuestionToBot(`/smalltalk.set_property{\"property\": \"${this.propertyDomain}\"}`)

  askQuestionToBot = (question, callback = () => {}, questionId = null) => {
    if (!this.isSetPropertyToHobbes) {
      this.isSetPropertyToHobbes = true;
      this.setPropertyToChatBot();
    }
    const data = {
      sender: this.prospectUUID,
      message: question,
    };
    return fetch(`${this.chatBotHost}/webhooks/rest/webhook`, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(async (result) => {
        const shouldScroll = !result.some(message => message.custom && message.custom.type === 'show_units');
        for (const message of result) {
          if (message.text === 'utter_require_property') {
            await this.setPropertyToChatBot();
            await this.askQuestionToBot(question, callback, questionId);
            return;
          }
          await this.onBotUttered(message, shouldScroll, questionId);
        }
        callback(result);
      });
  }

  // askQuestionToBot = (question) => {
  //   if (!this.socket) return;
  //   console.log(question);
  //   const interval = setInterval(() => {
  //     if (this.socket.connected) {
  //       this.socket.emit('user_uttered', { message: question, session_id: this.prospectUUID });
  //       clearInterval(interval);
  //     }
  //   }, 500);
  // };

  // depends on view
  displayGreetingMessage = (isNewProspect) => {
    let message = `<div class="greeting-inner"><h5>Welcome to</h5><h3>${this.propertyName}</h3><p>What can I help you with today?</p></div>`;
    if (!isNewProspect) {
      message = `<div class="greeting-inner"><h3>Welcome back</h3><h5>What can I help you with today?</h5></div>`;
    }
    // const userName = storage.getFromStorage('userName');
    // if (userName) {
    //   message = `<div class="greeting-inner"><h5>Hi ${userName}, welcome back to</h5><h3>${this.propertyName}</h3><p>What can I help you with today?</p></div>`;
    // }
    view.addChat('GREETING', message);
  }

  sendGreetingMessage = () => {
    const chatContainer = document.querySelector('.chat .chat-container ul');
    const greeting = chatContainer.querySelector('.greeting');
    if (!greeting) return Promise.resolve(true);
    const data = {
      message: greeting.innerHTML,
      type: 'GREETING',
    };
    return this.createConversation(data).then((response) => {
      greeting.parentElement.setAttribute('id', `conv-${response.external_id}`);
      this.hasGreeted = true;
    });
  }

  // depends on view
  noAvailableAgents = (isFromHobbes = false, hobbesType = 'no-data') => {
    let priorText = 'Unfortunately, there are no agents available at this time.';
    if (hobbesType === 'no_data') {
      priorText = 'Sorry, I can\'t find any associated information for you and none of our agents are available at this time.';
    }
    if (hobbesType === 'suggest_transfer') {
      priorText = 'Sorry, I can\'t answer that question for you and none of our agents are available at this time.';
    }
    this.addChat('BOT', `${priorText}<br/><br/>` +
        "I will have someone from our team respond as soon as possible.<br/><br/>What's your name and email?").then(() => {
      setTimeout(() => {
        const chatContainer = document.querySelector('.chat .chat-container ul');
        const formListItem = document.createElement('li');
        formListItem.innerHTML = '<div class="schedule-form"></div><button class="styled-btn blank cancel">No Thanks</button>';
        const actionButtons = chatContainer.querySelector('.response-options')
        if (actionButtons) {
          chatContainer.insertBefore(formListItem, actionButtons)
        } else {
          chatContainer.appendChild(formListItem);
        }

        const cancelBtn = formListItem.querySelector('.cancel');
        cancelBtn.addEventListener('click', async () => {
          await this.addChat('PROSPECT', 'No Thanks');
          await this.updateAgentWaiting();
          await this.addChat('BOT', 'Ok, I won\'t notify our team about your question. Is there anything else I can help you with?')
              .then(() => {
                if (!actionButtons) {
                  view.addActionButtons(this);
                }
                if (this.activeAgent) {
                  view.appendMessageBox(value => this.addChat('PROSPECT', value, { action: null, toAgent: true }));
                } else if (this.hobbesEnabled) {
                  view.appendMessageBox(async (value) => {
                    const convId = await this.addChat('PROSPECT', value);
                    await this.askQuestionToBot(value, () => {
                    }, convId);
                  });
                }
              });
          formListItem.parentNode.removeChild(formListItem);
        });

        view.startNoAvailableAgentsAction((data, isFinal) => this.sendProspectData(data, true, isFinal));
      }, 1000);
    });
  };

  timedOutRequestResponse = () => {
    this.addChat('BOT', 'Thank you! <br><br>Your information has been sent to the team. We will get back to you as soon as possible.')
      .then(() => {
        setTimeout(() => {
          this.askForMoreHelp().then(() => {
            const chatContainer = document.querySelector('.chat .chat-container ul');
            if (!chatContainer.querySelector('.response-options')) {
              view.addActionButtons(this)
            }
          });
        }, 1000);
      });
  }

  sendProspectData = (data, isTimedOutRequest = false, isFinal = false) => {
    const url = `/api/v1/${isTimedOutRequest && isFinal ? 'timed_out_agent_request_prospect' : 'capture_data'}/`;
    return requests.post(url, { ...data, prospect: this.prospectUUID }, () => {
    }).then(() => {
      const nodes = document.querySelectorAll('.chat .chat-container .schedule-form');
      const loader = nodes[nodes.length - 1].querySelector('.loader');
      loader.parentNode.removeChild(loader);

      const scheduleForms = document.querySelectorAll('.chat .chat-container .schedule-form');
      const target = scheduleForms[scheduleForms.length - 1].parentNode;
      const noThanksBtn = target.querySelector('button.cancel');
      if (noThanksBtn) {
        noThanksBtn.style.display = 'none';
      }

      if (!isFinal) {
        if (!this.currentFormMessageId) {
          this.createConversationFromHTML(target, true);
        } else {
          this.updateConversationFromHTML(target, this.currentFormMessageId);
        }

        if (noThanksBtn) {
          noThanksBtn.style.display = 'inline-block';
        }
      } else {
        if (noThanksBtn) {
          target.removeChild(noThanksBtn);
        }
        if (!this.currentFormMessageId) {
          this.createConversationFromHTML(target, true);
        } else {
          this.updateConversationFromHTML(target, this.currentFormMessageId).then(() => {
            this.currentFormMessageId = null;
          });
        }

        if (isTimedOutRequest) {
          this.timedOutRequestResponse();
          this.updateAgentWaiting();
        }
      }
    });
  };

  updateAgentWaiting = () => {
    if (storage.getFromStorage('prospect_uuid')) {
      return requests.patch(
        `/api/v1/prospects/${storage.getFromStorage('prospect_uuid')}/`,
        { is_waiting_agent: false },
      );
    }
    return Promise.resolve(true);
  };

  onAgentWaitingTimeout = () => {
    this.waitingAgentTimer = null;
    const loader = document.querySelector('.dots-loader-container');
    if (loader) {
      loader.parentNode.removeChild(loader);
    }
    this.noAvailableAgents();
  }

  updateProspectActiveStatus = (isActive) => {
    if (storage.getFromStorage('prospect_uuid')) {
      return requests.patch(`/api/v1/prospects/${storage.getFromStorage('prospect_uuid')}/`, { is_active: isActive });
    }
    return Promise.resolve(true);
  };

  updateProspect = data => requests.patch(`/api/v1/prospects/${this.prospectUUID}/`, data);

  setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    document.cookie = `${cname}=${cvalue};expires=${d.toUTCString()};path=/`;
  }

  getCookie = (cname) => {
    const cvalue = document.cookie.match(`(^|;)\\s*${cname}\\s*=\\s*([^;]+)`);
    return cvalue ? cvalue.pop() : '';
  }
}

const action = new Action();
export default action;
