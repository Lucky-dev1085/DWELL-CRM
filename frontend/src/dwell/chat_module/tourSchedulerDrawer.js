/*eslint-disable*/
import icons from './icons'
import storage from './propertyStorage';
import {formatDate, formatPhoneNumber, formatTime, parseBedrooms} from "dwell/chat_module/utils";
import requests from "dwell/chat_module/requests";

const formData = {
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
  comment: '',
  unit: [],
};

const formFields = {
  date: {
    name: 'Date',
    type: 'date',
    number: 2,
    placeholder: 'Date',
  },
  time: {
    name: 'Time',
    type: 'time',
    number: 3,
    placeholder: 'Date',
  },
  email: {
    name: 'Email',
    type: 'email',
    number: 5,
    placeholder: 'Email Address',
  },
  phone_number: {
    name: 'Phone',
    type: 'tel',
    number: 6,
    placeholder: 'Phone Number',
  },
  move_in_date: {
    name: 'Move-in Date',
    type: 'date',
    number: 7,
    placeholder: 'Move-in Date',
  },
};

const handleSelectClick = (e) => {
  const optionHeight = 40;
  const label = e.currentTarget.querySelector('.custom-select__trigger');
  const optionsContainer = e.currentTarget.querySelector('.custom-options');
  const itemsLength = optionsContainer.childElementCount;
  const optionsHeight = itemsLength > 4 ? optionHeight * 4 + 2 : optionHeight * itemsLength + 2;

  const wrapper = document.querySelector('.chat .modal-body');
  const { bottom } = wrapper.getBoundingClientRect();
  const { bottom: labelBottom, height } = label.getBoundingClientRect();

  const orientation = labelBottom + optionsHeight > bottom ? 'top' : 'bottom';
  if (orientation === 'top') {
    optionsContainer.style.transform = `translate(0, -${optionsHeight}px)`;
  } else {
    optionsContainer.style.transform = `translate(0, ${height}px)`;
  }
  e.currentTarget.querySelector('.custom-select').classList.toggle('open');
};

const handleClickOutside = (e, field) => {
  const select = field.querySelector('.custom-select');
  if (!select.contains(e.target)) {
    select.classList.remove('open');
  }
};

const handleClickOutsidePopover = (e, field) => {
  const tourDetails = field.querySelector('.tour-details');
  const tourDetailsButton = field.querySelector('.details');
  if (!tourDetails.contains(e.target) && tourDetailsButton && tourDetailsButton !== e.target && !tourDetailsButton.contains(e.target)) {
    tourDetails.classList.remove('show');
  }
};

Object.filter = (obj, predicate) =>
  Object.keys(obj)
    .filter(key => predicate(key))
    .reduce((res, key) => (res[key] = obj[key], res), {});

class TourSchedulerView {
  constructor() {
    this.scheduleAction = null;
    this.floorPlans = [];
    this.units = [];
    this.unit_type = null;
    this.tour_type = null;
    this.virtualTours = [];
    this.businessHours = [];
    this.availableTourTimes = [];
    this.status = 'OPEN';
    this.tourTypes = {
      IN_PERSON: { name: 'In-Person', description: 'On property, guided in-person by a property team member.', height: 62 },
      SELF_GUIDED_TOUR: { name: 'Self-Guided Tour', description: 'On property, self-guided without a property team member.', height: 62 },
      FACETIME: { name: 'Facetime', description: 'From your phone, via Apple Facetime, guided by a property team member.', height: 62 },
      GUIDED_VIRTUAL_TOUR: { name: 'Guided Virtual Tour', description: 'From your computer, guided by a property team member.', height: 62 },
      VIRTUAL_TOUR: { name: 'Virtual Tour', description: 'From your computer, view now.', height: 36 },
    };
    this.dataCaptureType = 'Name';
    this.bedrooms = [];
  }

  setTourTypes = (tourTypes) => {
    this.tourTypes = Object.filter(this.tourTypes, type => tourTypes.includes(type));
  };

  scrollToBottom = () => {
    const modalBody = document.querySelector('.chat .modal-body');
    modalBody.scrollTo(0, modalBody.scrollHeight);
  };

  // Tour Scheduler
  startSchedule = (action, units, floorPlans, unit_type, businessHours, virtualTours, tour_type, bedrooms, isDataCapture=false) => {
    this.scheduleAction = action;
    this.floorPlans = floorPlans;
    this.units = units;
    this.unit_type = unit_type;
    this.tour_type = tour_type;
    this.virtualTours = virtualTours;
    this.businessHours = businessHours;
    this.bedrooms = bedrooms;
    if (isDataCapture) {
      document.body.querySelector('.chat .back').style.display = 'flex';
    }
    this.addFormField('type');
  };

  startReschedule = (tour, floorPlans, businessHours, bedrooms, units) => {
    if (tour.id) {
      this.updateFormData(tour);
    }
    this.status = tour.status;
    this.units = units;
    this.floorPlans = floorPlans;
    this.businessHours = businessHours;
    this.bedrooms = bedrooms;
  };

  startDataCaptureAction = (type, action) => {
    this.dataCaptureType = type;
    this.scheduleAction = action;
    this.addFormField('name', false, false, true);
  };

  getFormData = () => formData;

  updateFormData = (source) => {
    Object.assign(formData, source);
  };

  // add schedule form field
  addFormField = (fieldName, isReschedule = false, noAvailableAgents = false, dataCapture = false) => {
    if (fieldName === 'type') {
      this.addTypeField(isReschedule);
    }
    if (fieldName === 'date') {
      this.addDateField(isReschedule, 'date');
    }
    if (fieldName === 'time') {
      this.addTimeField(isReschedule);
    }
    if (fieldName === 'name') {
      this.addNameField(noAvailableAgents, dataCapture);
    }
    if (fieldName === 'email') {
      this.addField('email', 'phone_number', isReschedule, noAvailableAgents, dataCapture);
    }
    if (fieldName === 'phone_number') {
      this.addField('phone_number', 'move_in_date', isReschedule, noAvailableAgents, dataCapture);
    }
    if (fieldName === 'move_in_date') {
      this.addMoveInDateField(isReschedule);
    }
    if (fieldName === 'bedroom') {
      this.addBedroomsField(isReschedule);
    }
    if (fieldName === 'floor_plan') {
      this.addUnitField(isReschedule, 'floor_plan');
    }
    if (fieldName === 'unit') {
      this.addUnitField(isReschedule, 'unit');
    }
    if (fieldName === 'comment') {
      this.addCommentField();
    }
    if (!isReschedule) {
      const formContainers = document.querySelectorAll('.chat .chat-container .schedule-form');
      const formContainer = formContainers[formContainers.length - 1];
      const totalCount = noAvailableAgents ? '3' : formData.type === 'VIRTUAL_TOUR' ? '7' : '9';
      if (formContainer.querySelector('.schedule-form__field .field-count')) {
        formContainer.querySelector('.schedule-form__field .field-count').textContent = `(${this.getCurrentStepNumber() - 1} of ${totalCount})`;
      }
    }
    this.scrollToBottom();
  };

  addVideoModal = () => {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.setAttribute('id', 'videoModal');
    modal.style.display = 'none';

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    const modalHeader = document.createElement('div');
    modalHeader.classList.add('modal-header');
    modalHeader.innerHTML = '<div class="modal-title"></div><span class="close">&times;</span>';

    const modalBody = document.createElement('div');
    modalBody.classList.add('modal-body');
    modalBody.innerHTML = '<iframe class="embed-responsive-item" src="" allowfullscreen frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"></iframe>';

    modalContent.append(modalHeader);
    modalContent.append(modalBody);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    const closeVideo = (modal) => {
      const iframe = modal.querySelector('iframe').contentWindow;
      iframe.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      modal.querySelector('iframe').setAttribute('src', '');
      modal.querySelector('.modal-title').innerHTML = '';
      modal.classList.remove('open');
      modal.classList.add('close');
      modal.style.display = 'none';
    };

    modal.querySelector('.close').addEventListener('click', () => closeVideo(modal));

    window.onclick = function (event) {
      if (event.target === modal) {
        closeVideo(modal);
      }
    };
  };

  addVideos = (isReschedule, virtualTours) => {
    const formContainers = document.querySelectorAll(`.chat .chat-container ${isReschedule ? '.schedule-form.reschedule' : '.schedule-form'}`);
    const formContainer = formContainers[formContainers.length - 1];
    let tours = formContainer.querySelector('.tour-video-list');
    if (!tours) {
      tours = document.createElement('ul');
      tours.classList.add('tour-video-list');
      formContainer.appendChild(tours);
      virtualTours.forEach((tour) => {
        const fullreg = /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([^& \n<]+)(?:[^ \n<]+)?/g;
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n<]+)(?:[^ \n<]+)?/g;
        let convertedLink = tour.link;
        if (tour.link.match(fullreg) && tour.link.match(fullreg).length > 0) {
          convertedLink = `https://www.youtube.com/embed/${tour.link.split(regex)[1]}`;
        }
        const videoContainer = document.createElement('li');
        videoContainer.classList.add('tour-video-item');
        videoContainer.innerHTML =
                    `<label>${tour.title}</label>` +
                    '<div class="holder">' +
                    `<iframe width="250" src="${convertedLink}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>` +
                    `<div class="overlay trigger" src="${convertedLink}" data-target="#videoModal" data-toggle="modal"></div>` +
                    '</div>';

        videoContainer.querySelector('.trigger').addEventListener('click', function (e) {
          e.preventDefault();
          const modal = document.querySelector('#videoModal');
          modal.querySelector('.modal-title').innerHTML = tour.title;
          const videoSRC = this.getAttribute('src');
          modal.querySelector('iframe').setAttribute('src', `${videoSRC}?autoplay=1&enablejsapi=1`);
          modal.classList.remove('close');
          modal.classList.add('open');
          modal.style.display = 'block';
        });
        tours.appendChild(videoContainer);
      });
    }
  };

  // calendar links component
  addCalendarLinks = () => {
    const chatContainer = document.querySelector('.chat .chat-container ul');
    const formListItem = document.createElement('li');
    const yahooIcon = icons.YahooIcon('var(--primary-color)');
    const appleIcon = icons.AppleIcon('var(--primary-color)');
    const microsoftIcon = icons.MicrosoftIcon('var(--primary-color)');
    const googleIcon = icons.GoogleIcon('var(--primary-color)');
    formListItem.innerHTML =
      '<div class="calendar-links">' +
          `<a href="https://google.com/calendar" target="_blank" class="styled-btn blank calendar">  <div class="calendar-logo"> ${googleIcon} </div>  <div> Google Calendar  </div> </a>` +
          `<a href="https://office.live.com/start/Calendar.aspx" target="_blank" class="styled-btn blank calendar"> <div class="calendar-logo"> ${microsoftIcon} </div>  <div> Outlook </div> </a>` +
          `<a href="https://icloud.com/calendar" target="_blank" class="styled-btn blank calendar"> <div class="calendar-logo apple"> ${appleIcon} </div> <div> iCal </div> </a>` +
          `<a href="https://calendar.yahoo.com/" target="_blank" class="styled-btn blank calendar"> <div class="calendar-logo yahoo"> ${yahooIcon} </div>  <div> Yahoo Calendar </div> </a>` +
      '</div>';

    chatContainer.appendChild(formListItem);
  };

  formatMoveInDate = (element) => {
    const input = element.querySelector('#move_in_date');
    input.type = 'text';
    const weekday = new Date(formData.move_in_date).toLocaleString('en-us', { weekday: 'long' });
    const date = `${new Date(formData.move_in_date).getMonth() + 1}/${new Date(formData.move_in_date).getDate()}/${new Date(formData.move_in_date).getFullYear()}`;
    input.value = `${weekday} - ${date}`;
  };

  getCurrentStepNumber = (isReschedule = false) => {
    const formContainers = document.querySelectorAll(`.chat .chat-container ${isReschedule ? '.schedule-form.reschedule' : '.schedule-form'}`);
    const formContainer = formContainers[formContainers.length - 1];
    return formContainer.querySelectorAll('.schedule-form__field').length + 1;
  }

  addField = (fieldName, nextField, isReschedule, noAvailableAgents, dataCapture) => {
    const formContainers = document.querySelectorAll(`.chat .chat-container ${isReschedule ? '.schedule-form.reschedule' : '.schedule-form'}`);
    const formContainer = formContainers[formContainers.length - 1];

    const getFieldValue = (fieldName) => {
      if (formData[fieldName]) return formData[fieldName];
      if (fieldName === 'phone_number' && storage.getFromStorage('userPhoneNumber')) return storage.getFromStorage('userPhoneNumber');
      if (fieldName === 'email' && storage.getFromStorage('userEmail')) return storage.getFromStorage('userEmail');
      return '';
    };

    const field = document.createElement('div');
    field.classList.add('schedule-form__field');
    field.innerHTML =
      '<div class="field-info">' +
      `   <span>${!isReschedule && !noAvailableAgents ? `${this.getCurrentStepNumber(isReschedule)}.` : '2'} ${formFields[fieldName].name}</span>` +
      '</div>' +
      '<div class="field">' +
      '<div class="inner-addon right-addon">' +
      `<span class="glyphicon">${icons.CheckmarkIcon('#000')}</span>` +
      `<input type="${formFields[fieldName].type}" id="${fieldName}" name="${fieldName}" class="field-input" placeholder="${formFields[fieldName].placeholder}" value="${getFieldValue(fieldName)}" required>` +
      '</div>' +
      `${!isReschedule ? '<button class="styled-btn blank submit"><div class="arrow right"></div></button>' : ''}` +
      '</div>';
    formContainer.appendChild(field);
    field.querySelector('input').focus();

    // add consent terms for email and phone
    if (['phone_number', 'email'].includes(fieldName)) {
      const consentTerms = document.createElement('div');
      consentTerms.classList.add('consent-terms');
      const text = `By providing your ${fieldName === 'email' ? 'email address' : 'phone number'}, you agree to Terms of Use and <a href="https://staging.liftlytics.com/privacy-policy" target="_blank">Privacy Policy</a> and consent to be contacted via ${fieldName === 'email' ? 'email' : 'phone or SMS'}.`;
      consentTerms.innerHTML =
        `<input type="checkbox" id="${fieldName}-checkbox"/><label for="${fieldName}-checkbox">${text}</label>`;
      field.appendChild(consentTerms);

      if (fieldName === 'phone_number' && storage.getFromStorage('userPhoneNumber')) {
        formData.phone_number = storage.getFromStorage('userPhoneNumber');
      }
      if (fieldName === 'email' && storage.getFromStorage('userEmail')) {
        formData.email = storage.getFromStorage('userEmail');
      }

      // listen on checkbox state change
      consentTerms.querySelector('input')
        .addEventListener('change', function () {
          const button = this.parentNode.parentNode.querySelector('.styled-btn.submit');
          if (this.checked && formData[fieldName]) {
            if (fieldName === 'email' && !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[fieldName]))) return;
            if (fieldName === 'phone_number' && !(/^[0-9]{7,11}$/.test(formData[fieldName].replace(/\D/g, '')))) return;
            button.classList.remove('blank');
            button.classList.add('filled');
          } else {
            button.classList.remove('filled');
            button.classList.add('blank');
          }
        });
    }

    // listen on field change
    field.querySelector(`.field-input#${fieldName}`)
      .addEventListener('input', function () {
        formData[fieldName] = this.value;
        this.setAttribute('value', this.value);
        const button = this.parentNode.parentNode.querySelector('.styled-btn.submit');
        const consentTerms = this.parentNode.parentNode.nextSibling;
        let consent = true;
        if (consentTerms) {
          consent = consentTerms.querySelector('input').checked;
        }

        if (fieldName === 'phone_number') {
          this.value = formatPhoneNumber(this.value);
        }

        if (fieldName === 'email' && !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value)) ||
            fieldName === 'phone_number' && !(/^[0-9]{7,11}$/.test(this.value.replace(/\D/g, '')))) {
          button.classList.remove('filled');
          button.classList.add('blank');
          return;
        }
        if (['phone_number', 'email'].includes(fieldName)) {
          storage.setToStorage(`${fieldName === 'phone_number' ? 'userPhoneNumber' : 'userEmail'}`, this.value);
        }
        if (this.value && consent) {
          button.classList.remove('blank');
          button.classList.add('filled');
        } else {
          button.classList.remove('filled');
          button.classList.add('blank');
        }
      });

    if (noAvailableAgents) {
      field.querySelector('.styled-btn').addEventListener('click', ({ target }) => {
        const curTarget = target.classList.contains('styled-btn') ? target : target.parentNode;
        if (curTarget.classList.contains('filled')) {
          const input = curTarget.parentNode.querySelector('.field-input');
          input.classList.add('disabled');
          curTarget.parentNode.querySelector('.glyphicon').classList.add('show');
          const consentTerms = field.querySelector('.consent-terms');
          if (consentTerms) {
            consentTerms.style.display = 'none';
          }
          curTarget.style.display = 'none';

          const loader = document.createElement('div');
          loader.classList.add('loader');
          curTarget.parentNode.appendChild(loader);
          curTarget.parentNode.removeChild(curTarget);

          this.scheduleAction({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
          }).then(() => {
            this.addFormField('comment');
          });
        }
      });
    }

    if (dataCapture) {
      field.querySelector('.styled-btn')
        .addEventListener('click', ({ target }) => {
          const curTarget = target.classList.contains('styled-btn') ? target : target.parentNode;
          if (curTarget.classList.contains('filled')) {
            const input = curTarget.parentNode.querySelector('.field-input');
            input.classList.add('disabled');
            curTarget.parentNode.querySelector('.glyphicon')
              .classList
              .add('show');
            const consentTerms = field.querySelector('.consent-terms');
            if (consentTerms) {
              consentTerms.style.display = 'none';
            }
            curTarget.style.display = 'none';

            const loader = document.createElement('div');
            loader.classList.add('loader');
            curTarget.parentNode.appendChild(loader);
            curTarget.parentNode.removeChild(curTarget);

            let data = {
              first_name: formData.first_name,
              last_name: formData.last_name,
              email: formData.email,
              form_type: this.dataCaptureType,
            };
            if (fieldName === 'phone_number') {
              data = { ...data, phone_number: formData.phone_number };
            }

            this.scheduleAction(data, fieldName === 'phone_number').then(() => {
              if (fieldName === 'phone_number') {
                this.scheduleAction = null;
              } else {
                this.addFormField('phone_number', false, false, dataCapture);
              }
            });
          }
        });
    }

    if (!isReschedule && !noAvailableAgents && !dataCapture) {
      // listen on button click
      field.querySelector('.styled-btn')
        .addEventListener('click', ({ target }) => {
          const curTarget = target.classList.contains('styled-btn') ? target : target.parentNode;
          if (curTarget.classList.contains('filled')) {
            this.addFormField(nextField);
            curTarget.style.display = 'none';
            const input = curTarget.parentNode.querySelector('.field-input');
            input.type = 'text';
            if (fieldName === 'move_in_date') {
              this.formatMoveInDate(field);
            }
            input.classList.add('disabled');
            if (fieldName === 'phone_number') {
              input.setAttribute('value', formatPhoneNumber(input.getAttribute('value')));
            }
            curTarget.parentNode.querySelector('.glyphicon')
              .classList
              .add('show');
            const consentTerms = field.querySelector('.consent-terms');
            if (consentTerms) {
              consentTerms.style.display = 'none';
            }
          }
        });
    }
  };

  getFormattedDate = () => {
    const parsedDate = formData.date.split('-').map(d => Number(d));
    const resultDate = new Date(parsedDate[0], parsedDate[1] - 1, parsedDate[2]);
    const weekday = resultDate.toLocaleString('en-us', { weekday: 'long' });
    const date = `${resultDate.getMonth() + 1}/${resultDate.getDate()}/${resultDate.getFullYear()}`;
    const time = new Date(formData.time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${weekday}, ${date} - ${time}`;
  };

  addUpcomingTourData = (changeTour, cancelTour, createConversationFromHTML, status='OPEN') => {
    const chatContainer = document.querySelector('.chat .chat-container ul');
    const formListItem = document.createElement('li');
    formListItem.innerHTML =
      '<div class="upcoming-tour">' +
      `<span>Your upcoming tour ${status === 'PENDING' ? '- pending confirmation' : ''}</span>` +
      `<div class="date">${this.getFormattedDate()}</div>` +
      '<div></div>' +
      '<div class="actions">' +
      '</div>' +
      '</div>';
    chatContainer.appendChild(formListItem);
    createConversationFromHTML(formListItem);

    if (formData.type !== 'SELF_GUIDED_TOUR') {
      formListItem.querySelector('.actions').innerHTML =
            '<button class="styled-btn filled reschedule">Change Tour</button>' +
            '<button class="styled-btn blank cancel">Cancel Tour</button>';
      formListItem.querySelector('.reschedule').addEventListener('click', () => {
        const actions = formListItem.querySelector('.actions');
        actions.parentNode.removeChild(actions);
        changeTour(formData);
      });
      formListItem.querySelector('.cancel').addEventListener('click', () => {
        const actions = formListItem.querySelector('.actions');
        actions.parentNode.removeChild(actions);
        cancelTour();
      });
    }
    this.scrollToBottom();
  };

  removeDateButtons = (element, fieldName) => {
    const dates = element.querySelector(`.${fieldName}.dates`);
    if (!dates) return;
    const input = document.createElement('input');
    input.type = 'text';
    input.setAttribute('id', `${fieldName}`);
    input.setAttribute('name', `${fieldName}`);

    const parsedDate = formData[fieldName].split('-').map(d => Number(d));
    const resultDate = new Date(parsedDate[0], parsedDate[1] - 1, parsedDate[2]);
    const weekday = resultDate.toLocaleString('en-us', { weekday: 'long' });
    const date = `${resultDate.getMonth() + 1}/${resultDate.getDate()}/${resultDate.getFullYear()}`;
    input.setAttribute('value', `${weekday} - ${date}`);
    input.classList.add('disabled', 'field-input');

    dates.parentNode.insertBefore(input, dates);
    dates.parentNode.removeChild(dates);
  };

  addMoreDates = (field, additional = false, previousDate = null, isReschedule = false, fieldName = 'date') => {
    const { dates, showMoreDates } = this.generateDates(previousDate, additional, formData.type === 'SELF_GUIDED_TOUR');
    dates.forEach((date) => {
      const datesList = field.querySelector('.dates-list');
      const listItem = document.createElement('li');
      const button = document.createElement('button');
      button.classList.add('styled-btn', 'blank');
      const weekday = date.toLocaleString('en-us', { weekday: 'long' });
      const formattedDate = `${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}`;
      button.textContent = `${weekday}, ${formattedDate}`;
      button.setAttribute('value', formatDate(date));
      if (fieldName === 'date') {
        if (formatDate(date) === formData.date) {
          button.classList.remove('blank');
          button.classList.add('filled');
        }
      } else if (formatDate(date) === formData.move_in_date) {
        button.classList.remove('blank');
        button.classList.add('filled');
      }
      button.onclick = () => {
        if (fieldName === 'date') {
          if (isReschedule && formData.time) {
            const updateBtn = document.querySelector('.styled-btn.filled.update');
            updateBtn.removeAttribute('disabled');
          }
          formData.date = button.getAttribute('value');
        } else {
          formData.move_in_date = button.getAttribute('value');
        }

        if (isReschedule && fieldName === 'date') {
          requests.getAvailableTourTime(formData.date, formData.type, formData.unit, formData.id).then((times) => {
            this.availableTourTimes = times;
            this.replaceTimes(isReschedule);
          });
        }

        const selected = button.parentNode.parentNode.querySelector('.filled');
        if (selected) {
          selected.classList.remove('filled');
          selected.classList.add('blank');
        }

        button.classList.remove('blank');
        button.classList.add('filled');

        const submitButton = field.querySelector('button.submit');
        if (submitButton) {
          submitButton.classList.remove('blank');
          submitButton.classList.add('filled');
        }
      };
      datesList.appendChild(listItem);
      listItem.appendChild(button);
    });
    return { previousDate: dates[dates.length - 1], showMoreDates };
  };

  addDays = (date, days) => {
    const copy = new Date(Number(date));
    copy.setDate(date.getDate() + days);
    return copy;
  };

  generateDates = (previousDate = null, additional = false, is_self_guided_tour = false) => {
    if (is_self_guided_tour) {
      return {
        dates: this.availableTourTimes.map(item => new Date(`${item.date}T00:00:00.000-07:00`)),
        showMoreDates: false,
      };
    }
    const workingDays = this.businessHours.sort((a, b) => a.weekday - b.weekday).filter(bh => bh.is_workday).map(bh => bh.weekday);
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      .map((day, index) => (workingDays.includes(index) ? day : ''));
    if (weekdays.every(day => day === '')) return;
    const daysCount = additional ? 3 : 5;
    let currentDate = previousDate ? this.addDays(previousDate, 1) : new Date();
    while (!weekdays.includes(currentDate.toLocaleString('en-us', { weekday: 'long' }))) {
      currentDate = this.addDays(currentDate, 1);
    }
    const result = [];
    let count = 0;
    let i = 0;
    while (count < daysCount) {
      const day = this.addDays(currentDate, i);
      if (this.addDays(new Date(), 6) <= day && formData.type === 'SELF_GUIDED_TOUR') {
        return { dates: result, showMoreDates: false };
      }
      const weekday = day.toLocaleString('en-us', { weekday: 'long' });
      if (weekdays.includes(weekday)) {
        result.push(day);
        count++;
      }
      i++;
    }
    return {
      dates: result,
      showMoreDates: this.addDays(new Date(), 7) > this.addDays(result[result.length - 1], 1)
              || formData.type !== 'SELF_GUIDED_TOUR',
    };
  };

  addDateField = (isReschedule, fieldName) => {
    let previousDate = null;
    let addedDatesCount = 0;
    let showMoreDates = true;
    const formContainers = document.querySelectorAll(`.chat .chat-container ${isReschedule ? '.schedule-form.reschedule' : '.schedule-form'}`);
    const formContainer = formContainers[formContainers.length - 1];
    const field = document.createElement('div');
    field.classList.add('schedule-form__field');
    field.innerHTML =
          '<div class="field-info">' +
          `   <span>${!isReschedule ? `${fieldName === 'date' ? `${this.getCurrentStepNumber(isReschedule)}. Date` : `${this.getCurrentStepNumber(isReschedule)}. Move-in Date`}` : `${fieldName === 'date' ? 'Date' : 'Move-in Date'}`}</span>` +
          '</div>' +
          '<div class="field date-field">' +
          '<div class="inner-addon right-addon">' +
          `<span class="glyphicon">${icons.CheckmarkIcon('#000')}</span>` +
          `<div class="${fieldName} dates">` +
          '<ul class="dates-list"></ul>' +
          '<button class="styled-btn blank add-dates"><span>+ more dates</span></button>' +
          '</div>' +
          '</div>' +
          `${!isReschedule ? '<button class="styled-btn blank submit"><div class="arrow right"></div></button>' : ''}` +
          '</div>';
    formContainer.appendChild(field);

    const { previousDate: prevDate, showMoreDates: showMore } = this.addMoreDates(field, false, previousDate, isReschedule, fieldName);
    previousDate = prevDate;
    showMoreDates = showMore;
    if (!showMoreDates) {
      field.querySelector('button.add-dates').style.display = 'none';
    }

    field.querySelector('button.add-dates').addEventListener('click', () => {
      const { previousDate: prevDate, showMoreDates: showMore } = this.addMoreDates(field, true, previousDate, isReschedule, fieldName);
      previousDate = prevDate;
      showMoreDates = showMore;
      addedDatesCount += 1;
      if (addedDatesCount === 3 || !showMoreDates) {
        field.querySelector('button.add-dates').style.display = 'none';
      }
      if (!isReschedule) {
        this.scrollToBottom();
      }
    });

    if (!isReschedule) {
      // listen on button click
      field.querySelector('.styled-btn.submit')
        .addEventListener('click', ({ target }) => {
          const curTarget = target.classList.contains('submit') ? target : target.parentNode;
          if (curTarget.classList.contains('filled')) {
            if (fieldName === 'date') {
              curTarget.style.display = 'none';
              const loader = document.createElement('div');
              loader.classList.add('loader');
              curTarget.parentNode.appendChild(loader);
              if (formData.type === 'SELF_GUIDED_TOUR') {
                curTarget.parentNode.removeChild(loader);
                curTarget.parentNode.querySelector('.glyphicon').classList.add('show');
                this.addFormField('time');
                this.removeDateButtons(curTarget.parentNode, fieldName);
              } else {
                requests.getAvailableTourTime(formData.date, formData.type, formData.unit).then((times) => {
                  this.availableTourTimes = times;
                  curTarget.parentNode.removeChild(loader);
                  curTarget.parentNode.querySelector('.glyphicon').classList.add('show');
                  this.addFormField('time');
                  this.removeDateButtons(curTarget.parentNode, fieldName);
                });
              }
            } else {
              this.addFormField('bedroom');
              curTarget.style.display = 'none';
              curTarget.parentNode.querySelector('.glyphicon').classList.add('show');

              this.removeDateButtons(curTarget.parentNode, fieldName);
            }
          }
        });
    }
  };

  addMoveInDateField = (isReschedule) => {
    const formContainers = document.querySelectorAll(`.chat .chat-container ${isReschedule ? '.schedule-form.reschedule' : '.schedule-form'}`);
    const formContainer = formContainers[formContainers.length - 1];
    const field = document.createElement('div');
    field.classList.add('schedule-form__field');
    field.innerHTML =
          '<div class="field-info">' +
          `   <span>${!isReschedule ? `${this.getCurrentStepNumber(isReschedule)}. Move-in Date` : 'Move-in Date'}</span>` +
          '</div>' +
          '<div class="field date-field">' +
          '<div class="inner-addon right-addon">' +
          `<span class="glyphicon">${icons.CheckmarkIcon('#000')}</span>` +
          '<div id="move_in_date"></div>' +
          '</div>' +
          `${!isReschedule ? '<button class="styled-btn blank submit"><div class="arrow right"></div></button>' : ''}` +
          '</div>';
    formContainer.appendChild(field);

    const elem = field.querySelector('#move_in_date');
    const datepicker = new Datepicker(elem, { format: 'yyyy-mm-dd', minDate: new Date() });

    if (isReschedule) {
      datepicker.setDate(formData.move_in_date);
    }

    elem.addEventListener('changeDate', (e) => {
      formData.move_in_date = Datepicker.formatDate(e.detail.date, 'yyyy-mm-dd');
      if (!isReschedule) {
        const button = field.querySelector('.styled-btn');
        if (button.classList.contains('blank')) {
          button.classList.remove('blank');
          button.classList.add('filled');
        }
        button.onclick = () => {
          if (button.classList.contains('filled')) {
            if (formData.type === 'SELF_GUIDED_TOUR') {
              this.addFormField('unit');
            } else {
              this.addFormField('bedroom');
            }
            button.style.display = 'none';
            field.querySelector('.glyphicon').classList.add('show');

            this.removeDatePicker(formContainer);
          }
        };
      }
    });
  };

  removeDatePicker = (element) => {
    const datepicker = element.querySelector('#move_in_date');
    if (!datepicker) return;
    const input = document.createElement('input');
    input.type = 'text';
    const parsedDate = formData.move_in_date.split('-').map(d => Number(d));
    const resultDate = new Date(parsedDate[0], parsedDate[1] - 1, parsedDate[2]);
    const weekday = resultDate.toLocaleString('en-us', { weekday: 'long' });
    const date = `${resultDate.getMonth() + 1}/${resultDate.getDate()}/${resultDate.getFullYear()}`;
    input.setAttribute('value', `${weekday} - ${date}`);
    input.setAttribute('id', 'move_in_date');
    input.setAttribute('name', 'move_in_date');
    input.classList.add('disabled', 'field-input');

    datepicker.parentNode.insertBefore(input, datepicker);
    datepicker.parentNode.removeChild(datepicker);
  };

  addEventListenerOptions = (element, fieldType, isReschedule) => {
  for (let option of element.querySelectorAll('.units-select .custom-option')) {
    if (fieldType === 'unit') {
      const checkboxElement = option.querySelector('input[type="checkbox"]');
      checkboxElement.addEventListener('change', () => {
        checkboxElement.checked = !checkboxElement.checked
      })
    }

    option.addEventListener('click', ({target}) => {
      if (!target.classList.contains('selected')) {
        const itemId = Number(target.getAttribute('data-value'));
        if (fieldType === 'floor_plan') {
          formData.floor_plan = itemId;
          target.classList.add('selected');
          target.closest('.custom-select').querySelector('.custom-select__trigger span').textContent = target.textContent;
        } else {
          const checkboxElement = option.querySelector('input[type="checkbox"]');
          checkboxElement.checked = !checkboxElement.checked
          formData.unit = formData.unit.includes(itemId)
              ? formData.unit.filter(id => id !== itemId)
              : formData.unit.concat(itemId);
          formData.date = '';
          formData.time = '';
          for (let date of element.querySelectorAll('.dates-list .styled-btn.filled')) {
            date.classList.remove('filled');
            date.classList.add('blank');
          }

          let input = target.closest('.custom-select').querySelector('.custom-select__trigger span')
          input.textContent = this.units.filter(unit => formData.unit.includes(unit.id)).map(unit => unit.unit).join(', ');

          const updateBtn = document.querySelector('.styled-btn.filled.update');
          const button = element.querySelector('#tour_unit .styled-btn');

          if (!isReschedule) {
            button.classList.remove('blank');
            button.classList.add('filled');
          } else {
            updateBtn.setAttribute('disabled', 'disabled');
            requests.getAvailableTourTime(null, formData.type, formData.unit).then((times) => {
              this.availableTourTimes = times;
              this.replaceTimes(isReschedule);
            });
          }

          if (!formData.unit.length) {
            input.textContent = 'Choose unit'
            if (!isReschedule) {
              button.classList.remove('filled');
              button.classList.add('blank');
            }
          }
        }

        const selected = target.parentNode.querySelector('.custom-option.selected');
        if (selected) {
          selected.classList.remove('selected');

          if (fieldType === 'unit') {
            button.classList.remove('filled');
            button.classList.add('blank');
          }
        }
      }
    });
  }
}

  replaceTimes = (isReschedule) => {
    const formContainers = document.querySelectorAll(`.chat .chat-container ${isReschedule ? '.schedule-form.reschedule' : '.schedule-form'}`);
    const formContainer = formContainers[formContainers.length - 1];
    const timesList = formContainer.querySelector('.times-list');
    if (!timesList) return;
    timesList.innerHTML = '';
    let tourTimes = this.availableTourTimes;
    if (formData.type === 'SELF_GUIDED_TOUR') {
      tourTimes = tourTimes.map(item => item.times).reduce((a, b) => a.concat(b), [])
          .filter(item => item.available).map(item => item.date_time)
          .filter(item => new Date(item).getDate() === new Date(formData.date).getDate());
    }
    tourTimes.forEach((datetime) => {
      const listItem = document.createElement('li');
      const button = document.createElement('button');
      button.classList.add('styled-btn', 'blank');
      button.textContent = new Date(datetime).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

      if (formData.time && (new Date(datetime).toISOString() === new Date(formData.time).toISOString())) {
        button.classList.remove('blank');
        button.classList.add('filled');
      }
      button.setAttribute('value', datetime);
      button.onclick = () => {
        formData.time = button.getAttribute('value');
        if (isReschedule && formData.date) {
            const updateBtn = document.querySelector('.styled-btn.filled.update');
            updateBtn.removeAttribute('disabled');
          }

        const selected = button.parentNode.parentNode.querySelector('.filled');
        if (selected) {
          selected.classList.remove('filled');
          selected.classList.add('blank');
        }
        button.classList.remove('blank');
        button.classList.add('filled');

        const submitButton = timesList.parentNode.parentNode.querySelector('button.submit');
        if (submitButton) {
          submitButton.classList.remove('blank');
          submitButton.classList.add('filled');
        }
      };
      timesList.appendChild(listItem);
      listItem.appendChild(button);
    });
  };

  removeTimeButtons = (element) => {
    const times = element.querySelector('.times-list');
    if (!times) return;
    const input = document.createElement('input');
    input.type = 'text';
    input.setAttribute('id', 'time');
    input.setAttribute('name', 'time');

    const time = new Date(formData.time).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    input.setAttribute('value', `${time}`);
    input.classList.add('disabled', 'field-input');

    times.parentNode.insertBefore(input, times);
    times.parentNode.removeChild(times);
  };

  addTimeField = (isReschedule) => {
    const formContainers = document.querySelectorAll(`.chat .chat-container ${isReschedule ? '.schedule-form.reschedule' : '.schedule-form'}`);
    const formContainer = formContainers[formContainers.length - 1];
    const field = document.createElement('div');
    field.classList.add('schedule-form__field');
    field.innerHTML =
      '<div class="field-info">' +
      `   <span>${!isReschedule ? `${this.getCurrentStepNumber(isReschedule)}. Time` : 'Time'}</span>` +
        '</div>' +
      '<div class="field time-field">' +
      '<div class="inner-addon right-addon">' +
      `<span class="glyphicon">${icons.CheckmarkIcon('#000')}</span>` +
        '<ul class="times-list"></ul>' +
      '</div>' +
      `${!isReschedule ? '<button class="styled-btn blank submit"><div class="arrow right"></div></button>' : ''}` +
      '</div>';
    formContainer.appendChild(field);

    this.replaceTimes(isReschedule);

    if (!isReschedule) {
      // listen on button click
      field.querySelector('.styled-btn.submit')
        .addEventListener('click', ({ target }) => {
          const curTarget = target.classList.contains('submit') ? target : target.parentNode;
          if (curTarget.classList.contains('filled')) {
            curTarget.style.display = 'none';
            curTarget.parentNode.querySelector('.glyphicon').classList.add('show');
            this.removeTimeButtons(curTarget.parentNode);
            if (formData.type === 'SELF_GUIDED_TOUR') {
              const timeField = formContainer.querySelector('.time-field');
              timeField.removeChild(curTarget);
              const loader = document.createElement('div');
              loader.classList.add('loader');
              timeField.appendChild(loader);
              // send schedule request
              this.scheduleAction(formData).then(() => this.scheduleAction = null);
            } else {
              this.addFormField('name');
            }
          }
        });
    }
  };

  addNameField = (noAvailableAgents, dataCapture) => {
    const formContainers = document.querySelectorAll('.chat .chat-container .schedule-form');
    const formContainer = formContainers[formContainers.length - 1];
    const field = document.createElement('div');
    field.classList.add('schedule-form__field');
    field.innerHTML =
      '<div class="field-info">' +
      `   <span>${!noAvailableAgents && !dataCapture ? `${this.getCurrentStepNumber()}. Name` : '1. Name'}</span>` +
        `   ${noAvailableAgents ? '<span class="field-count">(1 of 2)</span>' : ''}` +
      '</div>' +
      '<div class="field">' +
      '<div class="inner-addon right-addon">' +
      `<span class="glyphicon">${icons.CheckmarkIcon('#000')}</span>` +
      `<input type="text" id="first_name" name="first_name" class="field-input left" placeholder="First Name" value="${formData.first_name || storage.getFromStorage('userName') || ''}">` +
      '</div>' +
      '<div class="inner-addon right-addon">' +
      `<span class="glyphicon">${icons.CheckmarkIcon('#000')}</span>` +
      `<input type="text" id="last_name" name="last_name" class="field-input right" placeholder="Last Name" value="${formData.last_name || storage.getFromStorage('userLastName') || ''}">` +
      '</div>' +
      '<button class="styled-btn blank submit"><div class="arrow right"></div></button>' +
      '</div>';
    formContainer.appendChild(field);
    field.querySelector('input#first_name').focus();

    if (field.querySelector('.field-input#first_name').value && field.querySelector('.field-input#last_name').value) {
      formData.first_name = field.querySelector('.field-input#first_name').value;
      formData.last_name = field.querySelector('.field-input#last_name').value;
      const button = field.querySelector('.styled-btn.submit');
      button.classList.add('filled');
      button.classList.remove('blank');
    }

    field.querySelector('.field-input#first_name')
      .addEventListener('change', function () {
        formData.first_name = this.value;
        this.setAttribute('value', this.value);
        storage.setToStorage('userName', this.value);
        const button = this.parentNode.parentNode.querySelector('.styled-btn.submit');
        const lastName = field.querySelector('.field-input#last_name');
        if (this.value && lastName.value) {
          button.classList.remove('blank');
          button.classList.add('filled');
        } else {
          button.classList.remove('filled');
          button.classList.add('blank');
        }
      });

    field.querySelector('.field-input#last_name')
      .addEventListener('change', function () {
        formData.last_name = this.value;
        this.setAttribute('value', this.value);
        storage.setToStorage('userLastName', this.value);
        const button = this.parentNode.parentNode.querySelector('.styled-btn.submit');
        const firstName = field.querySelector('.field-input#first_name');
        if (this.value && firstName.value) {
          button.classList.remove('blank');
          button.classList.add('filled');
        } else {
          button.classList.remove('filled');
          button.classList.add('blank');
        }
      });

    field.querySelector('.styled-btn')
      .addEventListener('click', ({ target }) => {
        const curTarget = target.classList.contains('styled-btn') ? target : target.parentNode;
        if (curTarget.classList.contains('filled')) {
          // formContainer.querySelector('.schedule-form__field .field-count').textContent = `${noAvailableAgents ? '(2 of 2)' : '(5 of 9)'}`;
          curTarget.style.display = 'none';
          curTarget.parentNode.querySelector('.field-input#first_name')
            .classList
            .add('disabled');
          curTarget.parentNode.querySelector('.field-input#last_name')
            .classList
            .add('disabled');
          curTarget.parentNode.querySelectorAll('.glyphicon')
            .forEach(el => el.classList.add('show'));

          if (dataCapture || noAvailableAgents) {
            const loader = document.createElement('div');
            loader.classList.add('loader');
            curTarget.parentNode.appendChild(loader);
            curTarget.parentNode.removeChild(curTarget);

            this.scheduleAction({
              first_name: formData.first_name,
              last_name: formData.last_name,
              form_type: this.dataCaptureType,
            }, dataCapture && this.dataCaptureType === 'Name')
              .then(() => {
                if (dataCapture && this.dataCaptureType === 'Name') {
                  this.scheduleAction = null;
                } else {
                  this.addFormField('email', false, noAvailableAgents, dataCapture);
                }
              });
          } else {
            this.addFormField('email', false, noAvailableAgents, dataCapture);
          }
        }
      });
  };

  addBedroomsField = (isReschedule) => {
    const formContainers = document.querySelectorAll(`.chat .chat-container ${isReschedule ? '.schedule-form.reschedule' : '.schedule-form'}`);
    const formContainer = formContainers[formContainers.length - 1];
    const field = document.createElement('div');
    field.classList.add('schedule-form__field');
    field.innerHTML =
      '<div class="field-info">' +
      `   <span>${!isReschedule ? `${this.getCurrentStepNumber(isReschedule)}. Bedrooms` : 'Bedrooms'}</span>` +
      '</div>' +
      '<div id="tour_bedrooms" class="field">' +
      '<div class="custom-select-wrapper bedrooms-select field-input">' +
      '<div class="custom-select">' +
      '<div class="custom-select__trigger"><span>Choose bedrooms...</span>' +
      '<div class="arrow"></div>' +
      '</div>' +
      '<div class="custom-options">' +
      '</div>' +
      '</div>' +
      '</div>' +
      `${!isReschedule ? '<button class="styled-btn blank submit"><div class="arrow right"></div></button>' : ''}` +
      '</div>';
    formContainer.appendChild(field);

    const options = formContainer.querySelector('.bedrooms-select .custom-options');
    parseBedrooms(this.bedrooms).forEach((bedroom) => {
      options.innerHTML +=
        `<span class="custom-option ${formData.bedroom === bedroom.id ? 'selected' : ''}" data-value="${bedroom.id}">${bedroom.name}</span>`;
      if (formData.bedroom === bedroom.id) {
        formContainer.querySelector('.bedrooms-select .custom-select__trigger span').textContent = bedroom.name;
      }
    });

    window.addEventListener('click', e => handleClickOutside(e, field));

    formContainer.querySelector('.custom-select-wrapper.bedrooms-select')
      .addEventListener('click', handleSelectClick);

    for (const option of formContainer.querySelectorAll('.bedrooms-select .custom-option')) {
      option.addEventListener('click', ({ target }) => {
        if (!target.classList.contains('selected')) {
          formData.bedroom = Number(target.getAttribute('data-value'));

          const selected = target.parentNode.querySelector('.custom-option.selected');
          if (selected) {
            selected.classList.remove('selected');
          } else if (!isReschedule) {
            const button = formContainer.querySelector('#tour_bedrooms .styled-btn');
            button.classList.remove('blank');
            button.classList.add('filled');
            button.onclick = () => {
              if (formData.type === 'SELF_GUIDED_TOUR') {
                this.addFormField('unit');
              } else {
                this.addFormField('floor_plan');
              }
              button.style.display = 'none';
              const select = formContainer.querySelector('.custom-select-wrapper.bedrooms-select');
              select.removeEventListener('click', handleSelectClick);
              select.querySelector('.custom-select__trigger').style.cursor = 'default';
              const arrow = select.querySelector('.arrow');
              arrow.classList.remove('arrow');
              arrow.innerHTML = icons.CheckmarkIcon('#000');
            };
          }
          target.classList.add('selected');
          target.closest('.custom-select')
            .querySelector('.custom-select__trigger span').textContent = target.textContent;
          if (isReschedule) {
            formData.floor_plan = null;
            formContainer.querySelector('.units-select .custom-select__trigger span').textContent = 'Choose floor plan (optional)';
            this.addUnitOptions(formContainer, isReschedule, 'floor_plan');
          }
        }
      });
    }
  };

  addUnitOptions = (element, isReschedule, fieldType) => {
    const options = element.querySelector('.units-select .custom-options');
    options.innerHTML = '';
    if (fieldType === 'unit') {
      this.units.forEach((unit) => {
        if (isReschedule && formData.unit.includes(unit.id) || (!isReschedule && this.unit_type && unit.unit === this.unit_type)) {
           options.innerHTML +=
                  `<span class="custom-option" data-value="${unit.id}"><input type="checkbox" class="checkbox" data-value="${unit.id}" checked />${unit.unit}</span>`;
        } else {
          options.innerHTML +=
              `<span class="custom-option" data-value="${unit.id}"><input type="checkbox" class="checkbox" data-value="${unit.id}" />${unit.unit}</span>`;
          }
      });
    } else {
      this.floorPlans.filter(floorPlan => floorPlan.bedrooms === formData.bedroom).forEach((floorPlan) => {
        options.innerHTML +=
                  `<span class="custom-option ${formData.floor_plan === floorPlan.id ? 'selected' : ''}" data-value="${floorPlan.id}">${floorPlan.plan}</span>`;
        if (formData.floor_plan === floorPlan.id || (!isReschedule && this.unit_type && floorPlan.plan === this.unit_type)) {
          element.querySelector('.units-select .custom-select__trigger span').textContent = floorPlan.plan;
        }
      });
    }

    element.querySelector('.custom-select-wrapper.units-select')
      .addEventListener('click', handleSelectClick);
    this.addEventListenerOptions(element, fieldType, isReschedule)
  };

  addUnitField = (isReschedule, fieldType) => {
    const formContainers = document.querySelectorAll(`.chat .chat-container ${isReschedule ? '.schedule-form.reschedule' : '.schedule-form'}`);
    const formContainer = formContainers[formContainers.length - 1];
    const field = document.createElement('div');
    field.classList.add('schedule-form__field');
    field.innerHTML =
      '<div class="field-info">' +
      `   <span>${!isReschedule ? `${this.getCurrentStepNumber(isReschedule)}. ` : ''} ${fieldType === 'floor_plan' ? 'Floor Plan' : 'Unit'}</span>` +
      '</div>' +
      '<div id="tour_unit" class="field">' +
      '<div class="custom-select-wrapper units-select field-input">' +
      '<div class="custom-select">' +
      `<div class="custom-select__trigger"><span>Choose ${fieldType === 'floor_plan' ? 'floor plan (optional)' : 'unit'}</span>` +
      '<div class="arrow"></div>' +
      '</div>' +
      '<div class="custom-options">' +
      '</div>' +
      '</div>' +
      '</div>' +
      `${!isReschedule ? `<button class="styled-btn ${fieldType === 'floor_plan' ? 'filled' : 'blank'} submit"><div class="arrow right"></div></button>` : ''}` +
      '</div>';
    formContainer.appendChild(field);

    this.addUnitOptions(formContainer, isReschedule, fieldType);

    window.addEventListener('click', e => handleClickOutside(e, field));

    if (!isReschedule) {
      const button = formContainer.querySelector('#tour_unit .styled-btn');
      button.onclick = () => {
        if (button.classList.contains('filled')) {
          const unitField = formContainer.querySelector('#tour_unit');
          unitField.removeChild(button);
          // button.style.display = 'none';

          const select = formContainer.querySelector('.custom-select-wrapper.units-select');
          select.removeEventListener('click', handleSelectClick);
          select.querySelector('.custom-select__trigger').style.cursor = 'default';
          const arrow = select.querySelector('.arrow');
          arrow.classList.remove('arrow');
          arrow.innerHTML = icons.CheckmarkIcon('#000');

          const loader = document.createElement('div');
          loader.classList.add('loader');
          unitField.appendChild(loader);
          if (fieldType === 'unit') {
            requests.getAvailableTourTime(null, formData.type,formData.unit).then((times) => {
              this.availableTourTimes = times;
              unitField.removeChild(loader);
              this.addFormField('date');
            });
          } else {
            // send schedule request
            this.scheduleAction(formData).then(() => this.scheduleAction = null);
          }
        }
      };
    }
    else if (fieldType === 'unit') {
      const select = formContainer.querySelector('.custom-select-wrapper.units-select');
      select.querySelector('.custom-select__trigger span').textContent = this.units.filter(unit => formData.unit.includes(unit.id)).map(unit => unit.unit).join(', ');
    }
  };

  addTypeField = (isReschedule) => {
    const formContainers = document.querySelectorAll(`.chat .chat-container ${isReschedule ? '.schedule-form.reschedule' : '.schedule-form'}`);
    const formContainer = formContainers[formContainers.length - 1];
    const field = document.createElement('div');
    field.classList.add('schedule-form__field');
    field.innerHTML =
      '<div class="field-info">' +
      `   <span>${!isReschedule ? '1. Tour type' : 'Tour type'}</span>` +
      `   ${!isReschedule ? '<span class="field-count">(1 of 9)</span>' : ''}` +
      '</div>' +
      '<div id="tour_type" class="field">' +
      '<div class="custom-select-wrapper tour-types-select field-input">' +
      '<div class="custom-select">' +
      '<div class="custom-select__trigger"><span>Choose tour type...</span>' +
      '<div class="arrow"></div>' +
      '</div>' +
      '<div class="custom-options">' +
      '</div>' +
      '</div>' +
      '</div>' +
      `${!isReschedule ? '<button class="styled-btn filled details"><span>?</span></button>' +
          '<div class="tour-details"><ul>' +
          '</ul></div>' : ''}` +
      '</div>';
    formContainer.appendChild(field);

    if (!isReschedule) {
      const tourDetails = formContainer.querySelector('.tour-details ul');
      Object.keys(this.tourTypes).forEach((type) => {
        tourDetails.innerHTML +=
          `<li><div><strong>${this.tourTypes[type].name}:</strong></div> ${this.tourTypes[type].description}</li>`;
      });
    }

    window.addEventListener('click', e => handleClickOutside(e, field));

    const handleTourDetailsClick = () => {
      const tourDetails = formContainer.querySelector('.tour-details');
      if (tourDetails.classList.contains('show')) {
        tourDetails.classList.remove('show');
      } else {
        const tourDetailsHeight = Object.values(this.tourTypes).reduce((a, b) => a + b.height, 0) + 20;
        tourDetails.querySelector('ul').style.height = `${tourDetailsHeight}px`;
        const label = formContainer.querySelector('.details');
        const wrapper = document.querySelector('.chat .modal-body');
        const { bottom } = wrapper.getBoundingClientRect();
        const { bottom: labelBottom } = label.getBoundingClientRect();
        const orientation = labelBottom + tourDetailsHeight > bottom ? 'top' : 'bottom';
        if (orientation === 'top') {
          tourDetails.querySelector('ul').style.transform = `translate(0, -${tourDetailsHeight}px)`;
        } else {
          tourDetails.querySelector('ul').style.transform = `translate(0, ${40}px)`;
        }
        tourDetails.classList.add('show');
      }
    };

    if (!isReschedule) {
      window.addEventListener('click', e => handleClickOutsidePopover(e, field), true);
      formContainer.querySelector('.details').addEventListener('click', handleTourDetailsClick);
    }

    // add type select options
    const options = formContainer.querySelector('.tour-types-select .custom-options');
    Object.keys(this.tourTypes).forEach((type) => {
      options.innerHTML +=
        `<span class="custom-option ${formData.type === type ? 'selected' : ''}" data-value="${type}">${this.tourTypes[type].name}</span>`;
    });

    if (isReschedule && formData.type) {
      formContainer.querySelector('.tour-types-select .custom-select__trigger span').textContent = this.tourTypes[formData.type].name;
    }

    formContainer.querySelector('.custom-select-wrapper.tour-types-select')
      .addEventListener('click', handleSelectClick);

    // listen on type change
    for (const option of formContainer.querySelectorAll('.tour-types-select .custom-option')) {
      option.addEventListener('click', ({ target }) => {
        if (!target.classList.contains('selected')) {
          // store value
          formData.type = target.getAttribute('data-value');
          if (!isReschedule) {
            const button = formContainer.querySelector('#tour_type .styled-btn');
            button.style.display = 'block';
          }

          const selected = target.parentNode.querySelector('.custom-option.selected');
          if (selected) {
            selected.classList.remove('selected');
          } else if (!isReschedule) {
            // change button to active
            const button = formContainer.querySelector('#tour_type .styled-btn');
            window.removeEventListener('click', e => handleClickOutsidePopover(e, field), true);
            button.removeEventListener('click', handleTourDetailsClick);
            button.classList.remove('details');
            button.classList.add('submit');
            button.innerHTML = '<div class="arrow right"></div>';

            // button click handler
            button.onclick = () => {
              if (formData.type === 'VIRTUAL_TOUR' || formData.type === 'SELF_GUIDED_TOUR') {
                this.addFormField('name');
              } else {
                this.addFormField('date');
              }
              // hide button and disable field
              button.style.display = 'none';
              const select = formContainer.querySelector('.custom-select-wrapper.tour-types-select');
              select.removeEventListener('click', handleSelectClick);
              select.querySelector('.custom-select__trigger').style.cursor = 'default';
              const arrow = select.querySelector('.arrow');
              arrow.classList.remove('arrow');
              arrow.innerHTML = icons.CheckmarkIcon('#000');
            };
          }
          target.classList.add('selected');
          target.closest('.custom-select')
            .querySelector('.custom-select__trigger span').textContent = target.textContent;
        }
      });
    }

    if (!isReschedule && this.tour_type) {
        const selected = formContainer.querySelector(`.tour-types-select .custom-option[data-value="${this.tour_type}"]`);
        if (selected) {
          selected.click();
          const dropdown = formContainer.querySelector('.tour-types-select .custom-select')
          if (dropdown.classList.contains('open')) {
            dropdown.classList.toggle('open');
          }
        }
    }
  };

  addCommentField = () => {
    const formContainers = document.querySelectorAll('.chat .chat-container .schedule-form');
    const formContainer = formContainers[formContainers.length - 1];
    const field = document.createElement('div');
    field.classList.add('schedule-form__field');
    field.innerHTML =
          '<div class="field-info">' +
          '   <span>3. Comment (optional)</span>' +
          '</div>' +
          '<div class="field">' +
          '<div class="inner-addon right-addon">' +
          `<span class="glyphicon">${icons.CheckmarkIcon('#000')}</span>` +
          `<textarea rows="2" type="text" id="comment" name="comment" class="field-input" placeholder="Type your comment here..." maxlength="1500">${formData.comment}</textarea>` +
          '</div>' +
          '<button class="styled-btn filled submit"><div class="arrow right"></div></button>' +
          '</div>';
    formContainer.appendChild(field);
    field.querySelector('textarea').focus();

    field.querySelector('.field-input#comment')
      .addEventListener('input', function ({ target }) {
        formData.comment = this.value;
        target.value = this.value;
        target.textContent = this.value;
      });

    field.querySelector('.styled-btn').addEventListener('click', ({ target }) => {
      const curTarget = target.classList.contains('styled-btn') ? target : target.parentNode;
      const input = curTarget.parentNode.querySelector('.field-input');
      input.classList.add('disabled');
      curTarget.parentNode.querySelector('.glyphicon').classList.add('show');

      const loader = document.createElement('div');
      loader.classList.add('loader');
      curTarget.parentNode.appendChild(loader);

      curTarget.parentNode.removeChild(curTarget);

      this.scheduleAction({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        comment: formData.comment,
      }, true).then(() => this.scheduleAction = null);
    });
  }
}

const tourView = new TourSchedulerView();
export default tourView;
