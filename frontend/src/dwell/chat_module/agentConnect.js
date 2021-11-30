/*eslint-disable*/
const addTransferLoader = () => {
  const chatContainer = document.querySelector('.chat .chat-container ul');
  const listItem = document.createElement('li');
  listItem.classList.add('dots-loader-container');

  const loader = document.createElement('div');
  loader.classList.add('dots-loader');
  loader.innerHTML =
        '<span></span>' +
        '<span></span>' +
        '<span></span>' +
        '<span></span>' +
        '<span></span>';

  listItem.appendChild(loader);
  chatContainer.appendChild(listItem);
};

const runAgentConnect = async (action, view, existingSession = false, isOnButtonClick = false, type = 'suggest_transfer') => {
  action.isJoinedLiveAgent = true;
  view.removeActionButtons();
  view.hideMessageBox()

  if (!existingSession) {
    if (!isOnButtonClick) {
      let message = '';
      if (type === 'suggest_transfer') {
        message = 'Sorry, I can\'t answer that question for you. Would you like me to transfer you to a live agent?';
      }
      if (type === 'no_data') {
        message = 'Sorry, I can\'t find any associated information for this question. Would you like me to transfer you to a live agent?';
      }
      if (type === 'transfer_request') {
        message = 'Would you like to speak with a live agent from our team?';
      }
      if (message) {
        // no answer from bot, ask for agent
        await action.addChat('BOT', message);
      }
      view.drawLiveAgentConfirmContainer(ele => onJoin(ele, action), ele => onCancel(ele, action, view));
    } else {
      // Live Agent button click
      await action.addChat('PROSPECT', 'Transfer to live agent');
      action.createConversation({ message: '', type: 'AGENT_REQUEST' });
      view.toggleLiveAgentButton(false);
      await action.addChat('BOT', 'Sure thing, requesting a live agent to join chat. This may take a moment.');

      addTransferLoader();
      action.is_waiting_agent = true;
      // on agent wait time out
      action.waitingAgentTimer = setTimeout(() => {
        if (action.waitingAgentTimer) {
          action.onAgentWaitingTimeout();
        }
      }, 30 * 1000);
    }
  } else {
    // was talking with agent in current session earlier
    view.appendMessageBox(value => action.addChat('PROSPECT', value, { action: null, toAgent: true }));
  }

  const onJoin = async (element) => {
    await action.addChat('PROSPECT', 'Yes, have a live agent join');
    action.createConversation({ message: '', type: 'AGENT_REQUEST' });
    view.toggleLiveAgentButton(false);
    await action.addChat('BOT', 'Sure thing, requesting a live agent to join chat. This may take a moment.');

    addTransferLoader();
    action.is_waiting_agent = true;
    action.waitingAgentTimer = setTimeout(() => {
      if (action.waitingAgentTimer) {
        action.onAgentWaitingTimeout();
      }
    }, 30 * 1000);
  };

  const onCancel = async (element) => {
    await action.addChat('PROSPECT', 'Nevermind');
    await action.addChat('BOT', 'Ok, is there anything else I can help you with?');
    view.addActionButtons(action);
    view.scrollToBottom();
  };
};

export default runAgentConnect;
