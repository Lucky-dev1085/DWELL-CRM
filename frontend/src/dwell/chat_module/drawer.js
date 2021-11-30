/*eslint-disable*/
import icons from './icons'
import storage from './propertyStorage';
import runChatBot from 'dwell/chat_module/chatBot';
import { runResidentPortal } from 'dwell/chat_module/residentPortal';
import { onTourCancelClick, runTourScheduling } from 'dwell/chat_module/tourScheduler';
import {runViewPhotos} from 'dwell/chat_module/viewPhotos';
import { runCheckPrice } from 'dwell/chat_module/checkPrice';
import tourView from "dwell/chat_module/tourSchedulerDrawer";
import requests from "dwell/chat_module/requests";
import { runTextMe } from "dwell/chat_module/textMe";
import { hyphenate } from "dwell/chat_module/utils";

const BtnCreator = ({ classList = [], textContent, onclick = () => {}, selector, icon }) => {
  const container = document.createElement('div');
  container.classList.add('col-4');
  container.innerHTML =
      `<div class="response-option ${hyphenate(textContent)}">${icon}<label>${textContent}</label></div>`;
  container.onclick = onclick;

  const elem = document.querySelector(selector);
  if (elem) elem.appendChild(container);
};

const StarterPromptCreator = ({ classList = [], textContent, onclick = () => {}, selector, index }) => {
  const Button = document.createElement('button');
  Button.classList.add(...classList);
  Button.textContent = textContent;
  Button.onclick = onclick;
  const elem = document.querySelector(selector);
  if (elem) elem.parentNode.insertBefore(Button, elem);
  Button.style.bottom = `${85 + index * 42}px`;
};

class View {
  constructor() {
    this.activeAgent = null;
    this.units = [];
    this.agentAvatar = '';
    this.isAgentAvailable = false;
    this.interval = null;
    this.tabMessage = null;
    this.limit = 10;
    this.offset = 0;
    this.isChatOpen = false;
    this.chatStateCallback = null;
    this.propertyDomain = window.location.host;
    this.firstCheckedOpeningState = false;
    this.actionButtonList = [
      { name: 'Schedule a Tour', handler: runTourScheduling, icon: icons.MapPinIcon('var(--primary-color)') },
      { name: 'Text me', handler: runTextMe, icon: icons.TextMeIcon('var(--primary-color)') },
      { name: 'Prices / Availability', handler: runCheckPrice, icon: icons.PriceTagIcon('var(--primary-color)') },
      { name: 'View Photos', handler: runViewPhotos, icon: icons.ImageIcon('var(--primary-color)') },
      { name: 'Resident Access', handler: runResidentPortal, icon: icons.LockIcon('var(--primary-color)') },
      { name: 'I have a Question', handler: runChatBot, icon: icons.QuestionIcon('var(--primary-color)') },
    ];
    this.canPublish = true;
    this.isPusherConfigured = false;
  }

  setChatState = (chatStateCallback) => {
    this.chatStateCallback = chatStateCallback;
  };

  setActiveAgent = (activeAgent, agentAvatar, isAgentAvailable) => {
    this.activeAgent = activeAgent;
    this.agentAvatar = agentAvatar;
    this.setAgentAvailableStatus(isAgentAvailable);
  };

  setAgentAvailableStatus = (isAvailable) => {
    this.isAgentAvailable = isAvailable;
  };

  setLiveAgentButtonDisplay = (availableAgentsNumber) => {
    document.querySelector('.chat .connect-agent').style.display = availableAgentsNumber > 0 ? 'flex' : 'none';
  };

  addReconnectButton = (callback) => {
    const liveAgentButton = document.querySelector('.chat .connect-agent');

    const reconnectButton = document.createElement('button');
    const headphonesIcon = icons.HeadphonesIcon('var(--secondary-color)');
    reconnectButton.innerHTML = `${headphonesIcon} Continue chat`;
    reconnectButton.classList.add('styled-btn', 'blank', 'reconnect-agent');

    liveAgentButton.parentNode.insertBefore(reconnectButton, liveAgentButton);
    liveAgentButton.style.display = 'none';
    reconnectButton.onclick = () => {
      reconnectButton.parentNode.removeChild(reconnectButton);
      callback();
    };
  };

  changeOnlineIcon = (isAvailable) => {
    const modalHeader = document.querySelector('.chat .modal-header');
    const onlineStatus = modalHeader.querySelector(`${isAvailable ? '.agent-icon .offline' : '.agent-icon .online'}`);
    if (onlineStatus) {
      onlineStatus.classList.remove(`${isAvailable ? 'offline' : 'online'}`);
      onlineStatus.classList.add(`${isAvailable ? 'online' : 'offline'}`);
    }
  };

  createModalHeader = (agentChatEnabled) => {
    const modalHeader = document.createElement('div');
    modalHeader.classList.add('modal-header');
    const headphonesIcon = icons.HeadphonesIcon('var(--secondary-color)');
    const closeIcon = icons.CloseIcon('var(--secondary-color)');
    let agentAvatar = '';
    if (this.activeAgent) {
      agentAvatar = `<i>${this.activeAgent[0]}</i>`;
      if (this.agentAvatar) {
        agentAvatar = `<img src="${this.agentAvatar}" alt="agent-icon" style="height: 42px; width: 42px; border-radius: 50%;"/>`;
      }
    }
    modalHeader.innerHTML =
        `<div class="action-buttons">` +
        `<button class="styled-btn blank back" style="display: ${this.activeAgent ? 'flex' : 'none'}">${icons.ArrowBackIcon('var(--secondary-color)')}</button>` +
        `${'<div class="bot-info">' +
        `   <div class="${this.activeAgent ? 'agent-icon' : 'bot-icon'}">` +
        // `<img src="${this.activeAgent ? this.agentAvatar ||'https://crm-production-1.s3-us-west-1.amazonaws.com/headset-agent-icon.png' : 'https://img.icons8.com/material-outlined/36/000000/bot.png'}" alt="${this.activeAgent ? 'agent-icon' : 'bot-icon'}" style="${this.agentAvatar ? 'height: 45px; border-radius: 50%;' : 'filter: brightness(60%) invert(40%);'}"/>` +
        `${this.activeAgent ? agentAvatar : icons.BotIcon()}` +
        `<div class="${!this.activeAgent || (this.activeAgent && this.isAgentAvailable) ? 'online' : 'offline'}"></div></div>` +
        '   <div>' +
        `       <div class="name">${this.activeAgent || 'Hobbes'}</div>` +
        `       <div class="role">${this.activeAgent ? 'Agent' : 'Bot'}</div>` +
        '   </div>' +
        '</div>' +
        '</div>' +
        '<div class="action-buttons">'}${
            agentChatEnabled ? `<button class="connect-agent" style="display: ${this.activeAgent ? 'none' : 'flex'};">${headphonesIcon} Live Agent</button>` : ''
        }   <button class="styled-btn blank close">${closeIcon}</button>` +
        '</div>';
    return modalHeader;
  }

  createModalBody = (conversations) => {
    const modalBody = document.createElement('div');
    modalBody.classList.add('modal-body');
    modalBody.innerHTML = '<div class="chat-container"><ul></ul></div>';
    modalBody.onscroll = () => {
      if (modalBody.scrollTop === 0 && conversations.length - this.offset > 0) {
        const oldScrollPosition = modalBody.scrollHeight - modalBody.clientHeight;

        const loader = document.createElement('div');
        loader.classList.add('loader');
        loader.style.marginLeft = `calc(50% - ${Math.floor(loader.style.width / 2)}px)`;
        loader.style.marginBottom = '0.5rem';
        modalBody.querySelector('.chat-container').insertBefore(loader, modalBody.querySelector('.chat-container').childNodes[0]);

        setTimeout(() => {
          loader.parentNode.removeChild(loader);

          this.drawAllConversations(conversations);

          modalBody.style.scrollBehavior = 'auto';
          const newScroll = modalBody.scrollHeight - modalBody.clientHeight;
          modalBody.scrollTop += (newScroll - oldScrollPosition);
          modalBody.style.scrollBehavior = 'smooth';
        }, 1000);
      }
    };

    const preventBodyScroll = (e) => {
      const { scrollTop } = modalBody;
      const { scrollHeight } = modalBody;
      const height = parseFloat(getComputedStyle(modalBody, null).height.replace('px', ''));
      const delta = e.wheelDelta;
      const up = delta > 0;

      const prevent = () => {
        e.stopPropagation();
        e.preventDefault();
        e.returnValue = false;
        return false;
      };
      if (!up && -delta > scrollHeight - height - scrollTop) {
        // Scrolling down, but this will take us past the bottom.
        modalBody.scrollTop = scrollHeight;
        return prevent();
      } else if (up && delta > scrollTop) {
        // Scrolling up, but this will take us past the top.
        modalBody.scrollTop = 0;
        return prevent();
      }
    };

    // modalBody.addEventListener('wheel', preventBodyScroll);
    modalBody.addEventListener('mousewheel', preventBodyScroll);
    modalBody.addEventListener('DOMMouseScroll', preventBodyScroll);
    return modalBody;
  }

  drawLayout = (conversations, agentChatEnabled = false, addActionButtons) => {
    // draw modal layout
    const modal = document.createElement('div');
    modal.style.display = 'none';
    modal.className = 'modal chat closed';

    const modalHeader = this.createModalHeader(agentChatEnabled);
    const modalBody = this.createModalBody(conversations);

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    const modalFooter = document.createElement('div');
    modalFooter.classList.add('modal-footer');
    modalFooter.innerHTML =
        `<span class="dwell-link">Powered by <a href="https://dwell.io/?property=${storage.getFromStorage('property-name')}&channel=chat" target="_blank" class="chat-dwell-logo">${icons.DwellLogo()}</a></span>`;
    const modalChatBoxContainer = document.createElement('div');
    modalChatBoxContainer.className = 'modal-messagebox-container';
    modalChatBoxContainer.style.display = !this.activeAgent ? 'none' : 'block';

    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalChatBoxContainer);
    modalContent.appendChild(modalFooter);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    document.body.querySelector('.chat .close').onclick = this.closeHandler;

    const backBtn = document.body.querySelector('.chat .back');
    backBtn.onclick = () => {
      this.removeActionButtons()
      addActionButtons();
      backBtn.style.display = 'none';
      const formListItem = document.body.querySelector('.schedule-form').parentElement;
      if (formListItem) {
        formListItem.parentNode.removeChild(formListItem);
        action.updateProspect({ tour_scheduling_in_progress: false })
      }
    };
  };

  removeQuestionActionButton = () => {
    const questionAction = document.querySelector(`.chat .response-options .actions-row .${hyphenate('I have a Question')}`);
    if (questionAction) {
      questionAction.style.display = 'none';
    }
  }

  removeBotContainer = () => {
    const botContainer = document.querySelector(`.chat .bot-special-container`);
    if (botContainer) {
      botContainer.parentElement.removeChild(botContainer);
    }
  }

  addActionButtons = (action) => {
    const actionButtons = document.createElement('li');
    actionButtons.classList.add('response-options');
    actionButtons.innerHTML =
          '<label class="option-label">Choose from options or type your question below</label>' +
          '<div class="actions-row">' +
          '</div>';

    const chatContainer = document.querySelector('.chat .chat-container ul');
    chatContainer.appendChild(actionButtons);

    this.actionButtonList.forEach((item) => {
      if (item.handler === runChatBot && (!action.hobbesEnabled || this.activeAgent)) return;
      if (item.handler === runTextMe && !action.isTextMeFeatureEnabled) return;
      if (item.handler === runResidentPortal && !action.residentPortal) return;
      let { name } = item;
      if (item.handler === runTourScheduling && !action.is_booking_enabled ) return;
      if (item.handler === runTourScheduling && action.tour.id) {
        if (action.tour.status === 'PENDING') {
          this.drawActionButton('Cancel Tour', onTourCancelClick, icons.MapPinIcon('var(--primary-color)'));
          return;
        }
        if (action.tour.type !== 'VIRTUAL_TOUR') {
          name = 'Edit / Reschedule Tour';
        }
      }
      this.drawActionButton(name, () => item.handler(action, this), item.icon);
      if (item.handler === runTourScheduling && action.tour.id && action.tour.type !== 'VIRTUAL_TOUR') {
        this.drawActionButton('Cancel Tour', onTourCancelClick, icons.MapPinIcon('var(--primary-color)'));
      }
    });
    setTimeout(() => this.scrollToBottom(), 300);
  }

  removeActionButtons = () => {
    const actionButtons = document.querySelector('.chat .chat-container .response-options');
    if (actionButtons) {
      actionButtons.parentNode.removeChild(actionButtons);
    }
  }

  hideStarterPrompts = () => {
    const starterPrompts = document.querySelectorAll('.starter-btn');
    if (starterPrompts) {
      starterPrompts.forEach((prompt) => {
        prompt.style.display = 'none';
      });
    }
  }

  addChatBtn = (openChatBoxCallback, showStarterPrompts, open_by_default = false, configurePusher = () => {}) => {
    const container = document.createElement('div');
    const btn = document.createElement('BUTTON');
    btn.classList.add('chat-btn');
    btn.innerHTML = `${icons.MessageIcon('var(--secondary-color)')}<div class="unread-display"></div>`;
    container.appendChild(btn);
    document.body.appendChild(container);

    btn.onclick = () => this.onChatButtonClick(btn, openChatBoxCallback, false, configurePusher);
    if (open_by_default) btn.click();
    this.changeUnreadCountDisplay();
  };

  onChatButtonClick = (btn, openChatBoxCallback = () => {}, isStarterAction = false, configurePusher) => {
    const modal = document.querySelector('.modal.chat');
    if (modal.classList.contains('closed')) {
      openChatBoxCallback(isStarterAction);

      this.hideStarterPrompts();

      modal.classList.remove('closed');
      modal.classList.add('open');

      storage.setToStorage('unread_count', '0');
      this.changeUnreadCountDisplay();

      modal.style.display = 'flex';
      this.setLastActiveDate();

      this.isChatOpen = true;
      this.chatStateCallback(true);

      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }

      document.body.classList.add('chat-open');
      if (!this.isPusherConfigured) {
        configurePusher();
        this.isPusherConfigured = true;
      }
      this.firstCheckedOpeningState = false;
      this.scrollToBottom();
    } else {
      storage.setToStorage('last_closed_time', new Date());
      modal.classList.remove('open');
      modal.classList.add('closed');

      btn.innerHTML = `${icons.MessageIcon('var(--secondary-color)')}<div class="unread-display"></div>`;

      this.isChatOpen = false;
      this.chatStateCallback(false);

      this.setLastActiveDate();

      document.body.classList.remove('chat-open');
    }
  };

  blinkTabMessage = (type) => {
    document.title = ['AGENT', 'TEMPLATE'].includes(type) ? 'Agent says...' : 'Hobbes says...';
    setTimeout(() => (document.title = this.tabMessage), 2000);
  };

  addChat = (type, content, kwargs = {}) => {
    const { isFormMessage, isHistory, agent_avatar, pk, shouldScroll, agent_name } = kwargs;
    const chatContainer = document.querySelector('.chat .chat-container ul');
    const bubble = document.createElement('li');

    // If the conversion was added already, we don't have to add it again.
    if (!isHistory && document.querySelector(`.chat .chat-container ul #conv-${pk}`)) return;

    let bubbleClass = '';
    if (!isFormMessage) {
      if (type === 'PROSPECT') bubbleClass = 'user-bubble';
      if (['AGENT', 'TEMPLATE'].includes(type)) bubbleClass = 'bot-bubble agent';
      if (type === 'BOT' || type === 'GREETING') bubbleClass = `bot-bubble bot ${type === 'GREETING' && 'greeting'}`;
      if (type === 'JOINED') bubbleClass = 'agent-joined';
    }

    const loader = document.createElement('div');
    loader.classList.add('response-wave');
    loader.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';

    bubble.id = `conv-${pk}`;

    let agentAvatar = `<i>${agent_name ? agent_name[0] : ''}</i>`;
    if (agent_avatar) {
      agentAvatar = `<img src="${agent_avatar}" alt="agent-icon" style="height: 26px; width: 26px; border-radius: 50%;"/>`;
    }

    // ${type === 'AGENT'? `<div class="agent-icon"><img src="${agent_avatar || 'https://crm-production-1.s3-us-west-1.amazonaws.com/headset-agent-icon.png'}" alt="agent-icon" style="${agent_avatar ? 'height: 32px; border-radius: 50%;' : 'filter: brightness(60%) invert(40%);'}"/></div>`:''}
    bubble.innerHTML = `
        ${type === 'BOT' || type === 'GREETING' ? `<div class="bot-icon">${icons.BotIcon()}</div>` : ''}
        ${['AGENT', 'TEMPLATE'].includes(type) ? `<div class="agent-icon">${agentAvatar}</div>` : ''}
        <div class="${bubbleClass}">
        ${content}
        </div>`;
    bubble.classList.add(type === 'PROSPECT' ? 'clearfix' : 'bot-list-item');

    if (bubbleClass.includes('bot-bubble') && !isHistory) {
      const botBubble = bubble.querySelector('.bot-bubble');
      botBubble.innerHTML = '';
      if (type === 'GREETING') {
        botBubble.innerHTML = content;
      } else {
        botBubble.appendChild(loader);
        setTimeout(() => {
          botBubble.innerHTML = content;
          if (type !== 'BOT' || (type === 'BOT' && shouldScroll)) {
            this.scrollToBottom();
          }
        }, 1000);
      }
    }

    if (isHistory && chatContainer.childNodes.length > 0) {
      chatContainer.insertBefore(bubble, chatContainer.childNodes[0]);
    } else {
      const actionButtons = chatContainer.querySelector('.response-options')
      if (actionButtons) {
        chatContainer.insertBefore(bubble, actionButtons);
      } else {
        chatContainer.appendChild(bubble);
      }
    }
    if (type === 'JOINED' && !isHistory) {
      this.playAgentJoinedAlarm();
      this.scrollToBottom();
    }

    if (['BOT', 'AGENT', 'GREETING', 'TEMPLATE'].includes(type) && !isHistory) {
      this.playChatMessageAlarm();
      const modal = document.querySelector('.chat.modal');
      if (modal.classList.contains('closed')) {
        if (type === 'GREETING') {
          storage.setToStorage('unread_count', 1);
        } else {
            const counter = storage.getFromStorage('unread_count') || 0;
            storage.setToStorage('unread_count', Number(counter) + 1);
        }
        this.changeUnreadCountDisplay();
      }

      if (!this.isChatOpen) {
        this.interval = setInterval(() => {
          this.blinkTabMessage(type);
        }, 6000);
      }
    }
    if (!isHistory || isHistory && this.offset === 0) {
      if (shouldScroll) {
        this.scrollToBottom();
      }
    }
    this.setLastActiveDate();

    const unitForm = bubble.querySelector('.unit-form');
    if (isFormMessage && unitForm) {
      if (unitForm.querySelector('.splide__list').childElementCount > 1) {
        const slider = unitForm.querySelector('.splide');
        new Splide(slider, {
          type: 'loop',
          arrows: false,
          // autoplay: true,
        }).mount();
      }
    }
  };

  playChatMessageAlarm = () => {
    const audio = new Audio('https://crm-production-1.s3-us-west-1.amazonaws.com/statics/new-chat-message.mp3');
    audio.play();
  };

  playAgentJoinedAlarm = () => {
    const audio = new Audio('https://crm-production-1.s3-us-west-1.amazonaws.com/statics/agent-transfer.mp3');
    audio.play();
  };

  changeUnreadCountDisplay = () => {
    const counter = document.querySelector('.chat-btn .unread-display');
    if (counter) {
      const count = Number(storage.getFromStorage('unread_count') || '0');
      counter.textContent = count;
      counter.style.display = count > 0 ? 'flex' : 'none';
    }
  };

  clearChat = () => {
    const chatContainer = document.querySelector('.chat .chat-container ul');
    chatContainer.innerHTML = '';
  };

  getLastActiveDate = () => storage.getFromStorage('last_active_time');

  setLastActiveDate = () => {
    storage.setToStorage('last_active_time', new Date().toString());
  };

  drawActionButton = (label, event, icon) => {
    const classList = ['response-option'];
    if (label === 'Cancel Tour') {
      classList.push('cancel-btn');
    }
    BtnCreator({
      classList,
      textContent: label,
      selector: '.chat .response-options .actions-row',
      onclick: event,
      icon,
    });
  };

  drawStarterPromptButton = (label, event, index) => {
    const classList = ['starter-btn'];
    StarterPromptCreator({
      classList,
      textContent: label,
      selector: '.chat-btn',
      onclick: event,
      index,
    });
  }

  drawStarterPromptCloseButton = (bottom) => {
    const Button = document.createElement('button');
    Button.classList.add('starter-btn', 'close');
    Button.innerHTML = icons.CloseIcon('#fff');
    Button.onclick = () => this.hideStarterPrompts();
    const elem = document.querySelector('.chat-btn');
    if (elem) elem.parentNode.insertBefore(Button, elem);
    Button.style.bottom = `${bottom}px`;
  }


  clearTyping = () => {
    if (document.querySelector('#typing-message')) {
      document.querySelector('#typing-message').remove();
    }
  }

  drawTyping = (name) => {
    if (!document.querySelector('#typing-message')){
      const messageBoxContainer = document.querySelector('.chat .modal-messagebox-container');
      const typingMessage = document.createElement('div');
      typingMessage.id = 'typing-message'
      typingMessage.innerHTML = `${name} is typing...`
      const modalBody = document.querySelector('.chat .modal-body');
      const shouldScroll = modalBody.scrollHeight - modalBody.scrollTop === modalBody.clientHeight;
      messageBoxContainer.before(typingMessage);
      if (shouldScroll) {
        this.scrollToBottom();
      }
    }
  }
  scrollToBottom = () => {
    const modalBody = document.querySelector('.chat .modal-body');
    modalBody.scrollTo(0, modalBody.scrollHeight);
  };

  closeHandler = () => {
    const btn = document.querySelector('.chat-btn');
    this.onChatButtonClick(btn);
  };

  hideFooter = (hide) => {
    const modalFooter = document.querySelector('.chat .modal-footer .action-buttons-container');
    modalFooter.style.display = hide ? 'none' : 'flex';
  };

  hideMessageBox = () => {
    const chatContainer = document.querySelector('.modal-messagebox-container');
    chatContainer.style.display = 'none';
  };

  appendMessageBox = (onEnter, activeAgent = '') => {
    if (activeAgent) {
      this.activeAgent = activeAgent;
    }
    const chatContainer = document.querySelector('.modal-messagebox-container');
    chatContainer.style.display = 'block';
    chatContainer.innerHTML = '';
    const container = document.createElement('div');
    container.classList.add('message-box-container');
    const sendIcon = icons.SendIcon('var(--primary-color)');
    container.innerHTML = `
        <input type="text" id="message-box" placeholder="Type your message here..." />
        <button class="styled-btn blank submit">${sendIcon}</div></button>`;
    chatContainer.appendChild(container);
    const messagebox = chatContainer.querySelector('input#message-box');
    const button = messagebox.nextElementSibling;

    messagebox.oninput = ({ target }) => {
      target.nextElementSibling.style.display = target.value ? 'flex' : 'none';
    };

    let canPublish = true;
    let throttleTime = 200; //0.2 seconds
    ['keyup', 'touchend'].forEach(event => {
      messagebox.addEventListener(event, ({target, key}) => {
        if (target.value && key === 'Enter') {
          this.removeActionButtons();
          onEnter(target.value);
          target.value = '';
          document.querySelector('.styled-btn.blank.back').style.display = 'flex';
        } else if (this.activeAgent && canPublish) {
          requests.sendTyping({is_typing: true, type: 'PROSPECT'})
          canPublish = false;

          setTimeout(() => {
            canPublish = true;
          }, throttleTime)
        }
      });
    });
    button.addEventListener('click', () => {
      if (messagebox.value) {
        this.removeActionButtons();
        onEnter(messagebox.value);
        messagebox.value = '';
        document.querySelector('.styled-btn.blank.back').style.display = 'flex';
      }
    });

    messagebox.focus();
  };

  getLiveAgentHandler = (callback) => {
    document.querySelector('.chat .connect-agent').onclick = callback;
  };

  sortColumns = (sortOrder, sortField, data) => data.sort((a, b) => {
    if (a[sortField] > b[sortField]) {
      return sortOrder === 'asc' ? 1 : -1;
    } else if (b[sortField] > a[sortField]) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    return 0;
  });

  drawAllConversations = (conversations) => {
    const chatContainer = document.querySelector('.chat .chat-container ul');
    // chatContainer.innerHTML = '';
    const start = conversations.length - (this.offset + this.limit) < 0 ? 0 : conversations.length - (this.offset + this.limit);
    const end = conversations.length - this.offset;
    if (start >= 0 && end > 0) {
      this.sortColumns('asc', 'date', conversations).slice(start, end).reverse().map((conversation) => {
        const message = conversation.type === 'JOINED' ? `${conversation.agent_name} has entered the chat.` : conversation.message;
        // if (conversation.type === 'JOINED' && this.activeAgent) {
        //     this.changeModalHeaderAvatar(conversation.agent_name, conversation.agent_avatar)
        // }
        if (conversation.type !== 'DATA_CAPTURE') {
          this.addChat(conversation.type, message, {
            pk: conversation.external_id,
            isFormMessage: conversation.is_form_message,
            isHistory: true,
            agent_avatar: conversation.agent_avatar,
            agent_name: conversation.agent_name,
          });
        }
      });
      this.offset += this.limit;
    }
  };

  changeModalHeaderAvatar = (agentName, agentAvatar) => {
    const modalHeader = document.querySelector('.chat .modal-header .bot-info');
    let agentAvatarIcon = `<i>${agentName[0]}</i>`;
    if (agentAvatar) {
      agentAvatarIcon = `<img src="${agentAvatar}" alt="agent-icon" style="height: 42px; width: 42px; border-radius: 50%;"/>`;
    }
    modalHeader.innerHTML =
        '<div class="bot-info">' +
        `   <div class="agent-icon">${agentAvatarIcon}` +
        // `<img src="${agentAvatar ||'https://crm-production-1.s3-us-west-1.amazonaws.com/headset-agent-icon.png'}" alt="agent-icon" style="height: 45px; border-radius: 50%;"/>` +
        '<div class="online"></div></div>' +
        '   <div>' +
        `       <div class="name">${agentName}</div>` +
        '       <div class="role">agent</div>' +
        '   </div>' +
        '</div>';
  };

  drawReturnButton = (callback, configurePusher = () => {}) => {
    const btn = document.querySelector('.chat-btn');
    btn.onclick = (e) => {
      this.drawChatButton();
      this.onChatButtonClick(btn, callback, false, configurePusher);
    };
  };

  drawChatButton = () => {
    const btn = document.querySelector('.chat-btn');
    btn.innerHTML = `${icons.MessageIcon('var(--secondary-color)')}<div class="unread-display"></div>`;
  };

  toggleLiveAgentButton = (show = true) => {
    document.querySelector('.chat .connect-agent').style.display = show ? 'block' : 'none';
  };

  drawLiveAgentConfirmContainer = (onJoin, onCancel) => {
    const chatContainer = document.querySelector('.chat .chat-container ul');
    const formListItem = document.createElement('li');
    formListItem.innerHTML =
      '<div class="bot-special-container">\n ' +
      '<span class="bot-based-response underline" id="nevermind">Nevermind</span>\n <button class="styled-btn filled submit" id="join">Yes,  have a live agent join</button>\n' +
      ' </div>';

    formListItem.querySelector('#nevermind').onclick = () => {
      onCancel(formListItem);
      formListItem.parentNode.removeChild(formListItem);
    };
    formListItem.querySelector('#join').onclick = () => {
      onJoin(formListItem);
      formListItem.parentNode.removeChild(formListItem);
    };
    chatContainer.appendChild(formListItem);
    this.scrollToBottom();
  };

  startNoAvailableAgentsAction = (action) => {
    tourView.scheduleAction = action;
    tourView.addFormField('name', false, true);
  };

  showUnits = (units, createConversationFromHTML, action) => {
    const chatContainer = document.querySelector('.chat .chat-container ul');
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    });

    units.forEach((unit, index) => {
      const formListItem = document.createElement('li');
      const pricing = unit.maxRent && unit.minRent ? `${formatter.format(unit.minRent)} - ${formatter.format(unit.maxRent)}` : 'Call for pricing';
      const linkUrl = window.location.host.includes(action.mtHost) ? `${action.mtBaseUrl}apply` :
        `http://${this.propertyDomain}/apply-now?currentPlan={%22available%22:${unit.available},%22description%22: %22${unit.unit_type}%22}&conversionType=APPLY_NOW&secondTitle=${unit.available ? 'Apply Now' : 'Join Waitlist'}`;
      formListItem.innerHTML =
              '<div class="unit-form">' +
              `<div id="unit-${unit.id}" class="splide">` +
              '<div class="splide__track">' +
              '<ul class="splide__list">' +
              '</ul>' +
              '</div>' +
              '</div>' +
              '<div class="unit-info">' +
              `<div class="unit-type-price"><div class="type">Model ${unit.unit_type}</div><div class="price">${pricing}</div></div>` +
              `<div class="unit-bedrooms">${unit.bedrooms} bed | ${unit.bathrooms} bath | ${unit.squareFootage} ft</div>` +
              '<div class="unit-available">' +
              `<div class="available">${unit.available ? `${unit.available} unit${unit.available % 10 === 1 ? '' : 's'} available` : 'Join waitlist'}</div>` +
              `<a class="apply-now" href="${linkUrl}">${unit.available ? 'Apply now' : 'Join waitlist'}</a>` +
              '</div>' +
              '</div>' +
              '</div>';
      unit.images.forEach((image) => {
        const slider = formListItem.querySelector('.splide__list');
        slider.innerHTML += `<div class="splide__slide"><img class="unit-image" src="${image}" /></div>`;
      });
      chatContainer.appendChild(formListItem);
      const slider = formListItem.querySelector(`#unit-${unit.id}`);
      slider.style.visibility = 'visible';
      createConversationFromHTML(formListItem);
      if (index === 0) {
        setTimeout(() => {
          formListItem.previousElementSibling.scrollIntoView();
        }, 100);
      }

      formListItem.querySelector('.apply-now').addEventListener('click', () => {
        storage.setToStorage('should_show_return_button', 'true');
      });

      setTimeout(() => {
        if (unit.images.length > 1) {
          new Splide(slider, {
            type: 'loop',
            arrows: false,
            // autoplay: true,
          }).mount();
        }
      }, 1000);
    });
  }

  showQuotes = (quotes, createConversationFromHTML) => {
    const chatContainer = document.querySelector('.chat .chat-container ul');
    quotes.forEach((quote, index) => {
      const formListItem = document.createElement('li');
      formListItem.innerHTML =
          '<div class="quote-form">' +
          `<p class="quote-text">"${quote.text}"</p>` +
          `<span class="quote-author-info"><strong>${quote.author}</strong>, ${quote.details}</span>` +
          '</div>';

      chatContainer.appendChild(formListItem);
      createConversationFromHTML(formListItem);
      if (index === 0) {
        setTimeout(() => {
          formListItem.previousElementSibling.scrollIntoView();
        }, 100);
      }
    })
  }

  showBotPrompt = (confirm, cancel, type, context = {}) => {
    const chatContainer = document.querySelector('.chat .chat-container ul');
    const formListItem = document.createElement('li');

    let classnames = 'amenities-form';
    if (['schedule_tour_prompt', 'transfer_live_agent_prompt'].includes(type)) classnames = 'amenities-form schedule-tour-prompt';
    formListItem.innerHTML =
          `<div class="${classnames}">` +
          '<div class="actions"></div>' +
          '</div>';
    chatContainer.appendChild(formListItem);

    const negativeButtonLabel = ['schedule_tour_prompt', 'transfer_live_agent_prompt'].includes(type) ? 'Nevermind' : 'No';
    let positiveButtonLabel = 'Yes';
    if (type === 'schedule_tour_prompt') {
      if (context.tour_type === 'VIRTUAL_TOUR') {
        positiveButtonLabel = 'Yes, access tour';
      } else {
        positiveButtonLabel = 'Yes, schedule tour';
      }
    }
    if (type === 'transfer_live_agent_prompt') positiveButtonLabel = 'Yes, have a live agent join';

    formListItem.querySelector('.actions').innerHTML =
          `<button class="styled-btn blank cancel"><span>${negativeButtonLabel}</span></button>` +
          `<button class="styled-btn filled confirm">${positiveButtonLabel}</button>`;

    formListItem.querySelector('.confirm').addEventListener('click', () => {
      formListItem.parentNode.removeChild(formListItem);
      confirm(type, context);
    });
    formListItem.querySelector('.cancel').addEventListener('click', () => {
      formListItem.parentNode.removeChild(formListItem);
      cancel();
    });

    this.scrollToBottom();
  }

  addLeasingButtons = (buttons, onButtonClick) => {
    const chatContainer = document.querySelector('.chat .chat-container ul');
    const formListItem = document.createElement('li');

    formListItem.innerHTML =
          `<div class="amenities-form">` +
          '<div class="actions" style="flex-direction: column"></div>' +
          '</div>';
    chatContainer.appendChild(formListItem);

    let actionContainer = '';
    buttons.forEach(item => {
      actionContainer += `<button class="styled-btn filled confirm" style="margin-top: 5px;" data-text="${item.text}">${item.button}</button>`;
    });
    formListItem.querySelector('.actions').innerHTML = actionContainer;

    formListItem.querySelectorAll('.confirm').forEach((item) => {
      item.addEventListener('click', (e) => {
        formListItem.parentNode.removeChild(formListItem);
        onButtonClick(e.target.getAttribute('data-text'));
      });
    });
    this.scrollToBottom();
  }

  showGalleryForm = (action, data, visitPhotos, createConversationFromHTML) => {
    const chatContainer = document.querySelector('.chat .chat-container ul');
    const formListItem = document.createElement('li');
    formListItem.innerHTML =
        '<div class="gallery-form">' +
        `<h6 class="gallery-title">${data.title}</h6>` +
        `<p class="gallery-text">${data.text}</p>` +
        `<img src="${data.image}" class="gallery-img" alt="gallery-image" />` +
        '<button class="gallery-btn styled-btn blank">Open Gallery</button>' +
        '</button>';
    formListItem.querySelector('.gallery-btn').addEventListener('click', () => visitPhotos(action, this));
    chatContainer.appendChild(formListItem);
    this.scrollToBottom();
    createConversationFromHTML(formListItem);
  }
}

const view = new View();
export default view;
