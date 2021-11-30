/*eslint-disable*/
import storage from './propertyStorage';
import icons from './icons';
import tourView from './tourSchedulerDrawer';
import view from './drawer';
import action from './base';
import requests from './requests';

export const onVirtualTourClick = (tours) => {
  const chatContainer = document.querySelector('.chat .chat-container ul');
  const formListItem = document.createElement('li');
  formListItem.innerHTML = '<div class="schedule-form"></div>';
  chatContainer.appendChild(formListItem);

  tourView.addVideos(false, tours);
};

export const drawCancelConfirmation = () => {
  // draw form
  const chatContainer = document.querySelector('.chat .chat-container ul');
  const formListItem = document.createElement('li');
  formListItem.innerHTML =
        '<div class="confirm-tour-cancel">' +
        '<button class="styled-btn blank cancel" ><span>Nevermind</span></button>' +
        '<button class="styled-btn filled update" >Yes, Cancel My Tour</button>' +
        '</div>';
  chatContainer.appendChild(formListItem);
  tourView.scrollToBottom();

  // handler on cancel
  formListItem.querySelector('.confirm-tour-cancel .cancel').addEventListener('click', () => {
      const cancelConfirmation = formListItem.querySelector('.confirm-tour-cancel');
      cancelConfirmation.parentNode.removeChild(cancelConfirmation);

      action.addChat('PROSPECT', 'Nevermind')
        .then(() => action.addChat('BOT', 'Ok, your tour has not been cancelled.')
          .then(() => {
            view.addActionButtons(action);
            if (action.activeAgent) {
              view.appendMessageBox(value => action.addChat('PROSPECT', value, {action: null, toAgent: true}));
            } else if (action.hobbesEnabled) {
              view.appendMessageBox(async (value) => {
                const convId = await action.addChat('PROSPECT', value);
                await action.askQuestionToBot(value, () => {
                }, convId);
              });
            }
          }));
    },
  );

  // handler on confirm
  formListItem.querySelector('.confirm-tour-cancel .update')
      .addEventListener('click', () => cancel(tourView.getFormData().id));
};

export const onTourCancelClick = (isFromHobbes = false) => {
  // clear chat
  view.hideMessageBox();
  view.removeActionButtons();
  if (isFromHobbes) {
    action.addChat('BOT', 'Ok, are you sure you wish to cancel your tour?').then(() => {
      setTimeout(() => drawCancelConfirmation(), 1000);
    });
  } else {
    action.addChat('PROSPECT', 'Cancel Tour', {action: 'CANCEL_TOUR'}).then(() => {
      // add cancel confirmation
      action.addChat('BOT', 'Ok, are you sure you wish to cancel your tour?').then(() => {
        setTimeout(() => drawCancelConfirmation(), 1000);
      });
    });
  }
};

const handleResponseLoader = (isAdding = true) => {
  if (isAdding) {
    const bubble = document.createElement('li');
    bubble.innerHTML = `<div class="bot-icon">${icons.BotIcon()}</div><div class="bot-bubble bot"></div>`;
    bubble.classList.add('bot-list-item');

    const loader = document.createElement('div');
    loader.classList.add('response-wave');
    loader.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';

    const botBubble = bubble.querySelector('.bot-bubble');
    botBubble.innerHTML = '';
    botBubble.appendChild(loader);

    document.querySelector('.chat .chat-container ul').appendChild(bubble);
  } else {
    const nodes = document.querySelectorAll('.chat .chat-container ul .bot-list-item');
    nodes[nodes.length - 1].parentNode.removeChild(nodes[nodes.length - 1]);
  }
}

// add reschedule actions (cancel and submit)
const addRescheduleActions = (formListItem) => {
    const actions = document.createElement('div');
    actions.classList.add('action-buttons');
    actions.innerHTML =
        '<button class="styled-btn blank cancel"><span>Nevermind, cancel</span></button>' +
        '<button class="styled-btn filled update">Update Tour</button>';
    formListItem.querySelector('.schedule-form.reschedule')
        .appendChild(actions);

    actions.querySelector('.update').addEventListener(
        'click',
        () => reschedule(tourView.getFormData()),
    );

    actions.querySelector('.cancel').addEventListener(
        'click',
        () => {
          const tourData = storage.getFromStorage('tourData');
          if (tourData) {
            tourView.updateFormData(JSON.parse(tourData));
          }
          cancelReschedule();
        },
    );
  }

const displayRescheduleTour = (action) => {
  // add schedule form container
  const chatContainer = document.querySelector('.chat .chat-container ul');
  const formListItem = document.createElement('li');
  formListItem.innerHTML = '<div class="schedule-form reschedule"></div>';
  chatContainer.appendChild(formListItem);

  tourView.startReschedule(action.tour, action.floorPlans, action.businessHours, action.bedrooms, action.units);

  tourView.addFormField('type', true);
  requests.getAvailableTourTime(action.tour.type === 'SELF_GUIDED_TOUR' ? null : tourView.getFormData().date,
      tourView.getFormData().type, tourView.getFormData().unit, action.tour.id).then((times) => {
    tourView.availableTourTimes = times;
  }).then(() => {
    if (action.tour.type === 'SELF_GUIDED_TOUR') {
      tourView.addFormField('unit', true);
    }
    if (action.tour.type !== 'VIRTUAL_TOUR') {
      tourView.addFormField('date', true);
      tourView.addFormField('time', true);
      tourView.addFormField('move_in_date', true);
    }
    if (action.tour.type !== 'SELF_GUIDED_TOUR') {
      tourView.addFormField('bedroom', true);
      tourView.addFormField('floor_plan', true);
    }
    addRescheduleActions(formListItem);
    tourView.scrollToBottom();
  })
  storage.setToStorage('tourData', JSON.stringify(tourView.getFormData()));
}

export const runTourScheduling = async (action, view, unit_type = null, isDataCapture= false, tour_type = null, isFromHobbes=false) => {
  if (!action.tour.id && !isDataCapture && !isFromHobbes) {
    await action.addChat('PROSPECT', 'I’d like to schedule a tour', { action: 'SCHEDULE_TOUR' });
  }
  view.hideMessageBox()
  view.removeActionButtons();

  if (action.tour.id && !['VIRTUAL_TOUR'].includes(action.tour.type)) { // check if tour already exists
    tourView.updateFormData(action.tour);

    if (isFromHobbes) {
      displayRescheduleTour(action);
    } else {
      // add chat messages
      action.addChat('PROSPECT', 'Edit / Reschedule Tour', {action: 'RESCHEDULE_TOUR'})
          .then(() => action.addChat('BOT', 'Sure, I can help you edit or reschedule your tour.'))
          .then(() => new Promise((resolve) => {
            setTimeout(() => {
              handleResponseLoader();
              tourView.scrollToBottom();
              resolve();
            }, 1000);
          }))
          .then(() => new Promise((resolve) => {
            setTimeout(() => {
              handleResponseLoader(false);
              resolve();
            }, 1500);
          }))
          .then(() => {
            displayRescheduleTour(action);
          });
    }
  } else {
    await action.updateProspect({ tour_scheduling_in_progress: true })
    new Promise((resolve) => {
      setTimeout(() => {
        handleResponseLoader();
        tourView.scrollToBottom();
        resolve();
      }, 1000);
    }).then(() => new Promise((resolve) => {
      setTimeout(() => {
        handleResponseLoader(false);
        resolve();
      }, 1500);
    })).then(() => { // add schedule form container
      const chatContainer = document.querySelector('.chat .chat-container ul');
      const formListItem = document.createElement('li');
      formListItem.innerHTML =
                '<div class="schedule-form"></div>' +
                `<button class="styled-btn blank cancel" style="display: ${isDataCapture ? 'none' : 'flex'}">Nevermind, cancel tour</button>`;
      chatContainer.appendChild(formListItem);

      const cancelBtn = formListItem.querySelector('.cancel');
      cancelBtn.addEventListener('click', () => {
        formListItem.parentNode.removeChild(formListItem);
        action.addChat('PROSPECT', 'Nevermind, cancel tour').then(() => {
          action.addChat('BOT', 'Ok, I won\'t schedule a tour for you. Is there anything else I can help you with?')
            .then(() => {
              action.updateProspect({ tour_scheduling_in_progress: false })
              view.addActionButtons(action);
              if (action.activeAgent) {
                view.appendMessageBox(value => action.addChat('PROSPECT', value, {action: null, toAgent: true}));
              } else if (action.hobbesEnabled) {
                view.appendMessageBox(async (value) => {
                  const convId = await action.addChat('PROSPECT', value);
                  await action.askQuestionToBot(value, () => {
                  }, convId);
                });
              }
            });
        });
        const modalFooter = document.querySelector('.chat .modal-footer');
        modalFooter.style.display = 'flex';
        tourView.updateFormData({
          id: null,
          date: '',
          time: '',
          first_name: '',
          last_name: '',
          email: '',
          phone_number: '',
          move_in_date: '',
          type: '',
          bedroom: null,
          floor_plan: null,
          unit: [],
        });
      });

      // add tour type field
      tourView.startSchedule((data) => book(data, isDataCapture), action.units, action.floorPlans, unit_type,
          action.businessHours, action.virtualTours, tour_type, action.bedrooms, isDataCapture);
    });
  }
};

// additional handlers
const afterBooking = (type, isDataCapture) => {
  const nodes = document.querySelectorAll('.chat .chat-container .schedule-form');
  const loader = nodes[nodes.length - 1].querySelector('.loader');
  loader.parentNode.removeChild(loader);

  const scheduleForms = document.querySelectorAll('.chat .chat-container .schedule-form');
  scheduleForms[scheduleForms.length - 1].id = 'tour-card';
  const activeForm = scheduleForms[scheduleForms.length - 1].parentNode;

  const customOptions = activeForm.querySelectorAll('.custom-options');
  if (customOptions) {
    customOptions.forEach(e => e.parentNode.removeChild(e));

  const cancelBtn = scheduleForms[scheduleForms.length - 1].nextElementSibling;
    cancelBtn.parentNode.removeChild(cancelBtn);
  }

  if (isDataCapture) {
    action.createConversationFromHTML(activeForm);
  } else {
    action.createConversationFromHTML(activeForm).then(() => {
      // add calendar links and bot messages
      action.addChat('BOT', 'Your tour is booked! Details will be sent via email and text message.').then(() => {
        setTimeout(() => {
          if (type !== 'VIRTUAL_TOUR') {
            tourView.addCalendarLinks();
            const calendarLinks = document.querySelectorAll('.chat .chat-container .calendar-links');
            action.createConversationFromHTML(calendarLinks[calendarLinks.length - 1].parentNode);
          }
          action.askForMoreHelp().then(() => {
            view.addActionButtons(action)
            if (action.activeAgent) {
              view.appendMessageBox(value => action.addChat('PROSPECT', value, {action: null, toAgent: true}));
            } else if (action.hobbesEnabled) {
              view.appendMessageBox(async (value) => {
                const convId = await action.addChat('PROSPECT', value);
                await action.askQuestionToBot(value, () => {
                }, convId);
              });
            }
          });
        }, 1000);
      });
    });
  }
};

const beforeReschedule = () => {
  const rescheduleForm = document.querySelector('.schedule-form.reschedule');

  // disable form elements
  rescheduleForm.querySelectorAll('.field-input').forEach(el => el.classList.add('disabled'));

  const actions = rescheduleForm.querySelector('.action-buttons');
  actions.innerHTML = '<div class="loader"></div>';
  actions.style.justifyContent = 'center';
};

const afterReschedule = () => {
  const rescheduleForm = document.querySelector('.schedule-form.reschedule');
  tourView.removeDateButtons(rescheduleForm, 'date');
  tourView.removeDatePicker(rescheduleForm);
  tourView.removeTimeButtons(rescheduleForm);

  // change buttons to success message
  const actions = rescheduleForm.querySelector('.action-buttons');
  actions.innerHTML = '<p>Tour updated successfully!</p>';
  rescheduleForm.classList.remove('reschedule');

  action.createConversationFromHTML(rescheduleForm.parentNode).then(() => {
    // add calendar links and bot messages
    action.addChat('BOT', 'Your tour has been updated! Details will be sent via email and text message.').then(() => {
      setTimeout(() => {
        tourView.addCalendarLinks();
        const calendarLinks = document.querySelectorAll('.chat .chat-container .calendar-links');
        action.createConversationFromHTML(calendarLinks[calendarLinks.length - 1].parentNode);
        action.askForMoreHelp().then(() => {
          view.addActionButtons(action);

          if (action.activeAgent) {
            view.appendMessageBox(value => action.addChat('PROSPECT', value, {action: null, toAgent: true}));
          } else if (action.hobbesEnabled) {
            view.appendMessageBox(async (value) => {
              const convId = await action.addChat('PROSPECT', value);
              await action.askQuestionToBot(value, () => {
              }, convId);
            });
          }
        });
      }, 1000);
    });
  });
};

const cancelReschedule = () => {
  const rescheduleForm = document.querySelector('.schedule-form.reschedule');
  rescheduleForm.parentNode.removeChild(rescheduleForm);
  if (action.tour.id) {
    tourView.updateFormData(action.tour);
  }

  action.addChat('PROSPECT', 'Nevermind').then(() =>
    action.addChat('BOT', 'Ok, your tour details have not been changed.')).then(() => {
    setTimeout(() => {
      if (action.tour.type !== 'VIRTUAL_TOUR') {
        tourView.addUpcomingTourData(() => runTourScheduling(action, view), onTourCancelClick, action.createConversationFromHTML);
      }
      action.askForMoreHelp().then(() => {
        view.addActionButtons(action);
        if (action.activeAgent) {
          view.appendMessageBox(value => action.addChat('PROSPECT', value, {action: null, toAgent: true}));
        } else if (action.hobbesEnabled) {
          view.appendMessageBox(async (value) => {
            const convId = await action.addChat('PROSPECT', value);
            await action.askQuestionToBot(value, () => {
            }, convId);
          });
        }
      });
    }, 1000);
  });

  const modalFooter = document.querySelector('.chat .modal-footer');
  modalFooter.style.display = 'flex';
};

const beforeCancel = () => {
  const chatContainer = document.querySelector('.chat .chat-container ul');
  const nodes = chatContainer.querySelectorAll('.confirm-tour-cancel');
  nodes[nodes.length - 1].innerHTML = '<div class="loader"></div>';
};

const afterCancel = () => {
  // add success message
  const chatContainer = document.querySelector('.chat .chat-container ul');
  const nodes = chatContainer.querySelectorAll('.confirm-tour-cancel');
  nodes[nodes.length - 1].innerHTML = '<p>Tour Canceled Successfully</p>';

  action.createConversationFromHTML(nodes[nodes.length - 1].parentNode)
    .then(() => action.askForMoreHelp().then(() => {
      view.addActionButtons(action)

      if (action.activeAgent) {
        view.appendMessageBox(value => action.addChat('PROSPECT', value, {action: null, toAgent: true}));
      } else if (action.hobbesEnabled) {
        view.appendMessageBox(async (value) => {
          const convId = await action.addChat('PROSPECT', value);
          await action.askQuestionToBot(value, () => {
          }, convId);
        });
      }
    }));
};

// Scheduling API
const book = (tourData, isDataCapture = false) => {
  const formData = {
    ...tourData, prospect: action.prospectUUID, is_from_mt: window.location.host.includes(action.mtHost),
  };
  try {
    formData.tour_date = new Date(tourData.time).toISOString();
  } catch (e) {}

  const callback = (data) => {
    if (formData.type === 'VIRTUAL_TOUR') {
      tourView.updateFormData({
        id: null,
        date: '',
        time: '',
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        move_in_date: '',
        type: '',
        bedroom: null,
        floor_plan: null,
        unit: [],
      });
    } else {
      tourView.updateFormData({ ...formData, id: data.tour_id, status: data.status });
      action.tour = tourView.getFormData();
    }
    afterBooking(formData.type, isDataCapture);
  };
  return requests.post('/api/v1/book_tour/', formData, callback);
};

const reschedule = (tourData) => {
  beforeReschedule();

  const formData = {
    ...tourData,
    prospect: action.prospectUUID,
    tour_date: new Date(tourData.time).toISOString(),
  };

  const callback = (data) => {
    tourView.updateFormData({ ...tourData, id: data.tour_id, status: data.status });
    action.tour = tourView.getFormData();
    afterReschedule();
  };
  return requests.post('/api/v1/reschedule_tour/', formData, callback);
};

const cancel = (id) => {
  beforeCancel();

  const callback = () => {
    tourView.updateFormData({
      id: null,
      date: '',
      time: '',
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      move_in_date: '',
      type: '',
      bedroom: null,
      floor_plan: null,
      unit: [],
    });
    if (action.tour.id) {
      action.tour = {};
    }
    afterCancel();
  };
  return requests.post('/api/v1/cancel_tour/', { id }, callback);
};

