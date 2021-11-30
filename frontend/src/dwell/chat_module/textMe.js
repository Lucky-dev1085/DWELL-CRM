import icons from 'dwell/chat_module/icons';
import storage from 'dwell/chat_module/propertyStorage';
import { formatPhoneNumber } from 'dwell/chat_module/utils';
import requests from 'dwell/chat_module/requests';

const formData = {
  first_name: '',
  last_name: '',
  phone_number: '',
  prospect: '',
};

const formFields = {
  phone_number: {
    name: 'Phone',
    type: 'tel',
    number: 2,
    placeholder: 'Phone Number',
  },
};
const getFieldValue = (fieldName) => {
  if (formData[fieldName]) return formData[fieldName];
  if (storage.getFromStorage('userPhoneNumber')) return storage.getFromStorage('userPhoneNumber');
  return '';
};

const addPhoneField = (action, view) => {
  const formContainers = document.querySelectorAll('.chat .chat-container .schedule-form');
  const formContainer = formContainers[formContainers.length - 1];
  const field = document.createElement('div');
  field.classList.add('schedule-form__field');
  field.innerHTML =
      '<div class="field-info">' +
      '<span> 2. Phone </span>' +
      '</div>' +
      '<div class="field">' +
      '<div class="inner-addon right-addon">' +
      `<span class="glyphicon">${icons.CheckmarkIcon('#000')}</span>` +
      `<input type="phone_number${formFields.phone_number.type}" id="phone_number" name="phone_number" class="field-input" placeholder="${formFields.phone_number.placeholder}" value="${getFieldValue('phone_number')}" required>` +
      '</div>' +
      '<button class="styled-btn blank submit"><div class="arrow right"></div></button>' +
      '</div>';
  formContainer.appendChild(field);
  field.querySelector('input').focus();

  let consentTerms = document.createElement('div');
  consentTerms.classList.add('consent-terms');
  const text = 'By providing your phone number, you agree to Terms of Use and <a href="https://staging.liftlytics.com/privacy-policy" target="_blank">Privacy Policy</a> and consent to be contacted via phone or SMS.';
  consentTerms.innerHTML = `<input type="checkbox" id="phone_number-checkbox"/><label for="phone_number-checkbox">${text}</label>`;
  field.appendChild(consentTerms);

  setTimeout(() => view.scrollToBottom(), 300);

  const phoneNumber = storage.getFromStorage('userPhoneNumber');
  if (phoneNumber) {
    formData.phone_number = phoneNumber;
  }

  // listen on checkbox state change
  consentTerms.querySelector('input')
    .addEventListener('change', ({ target }) => {
      const button = target.parentNode.parentNode.querySelector('.styled-btn.submit');
      if (target.checked && formData.phone_number) {
        if (!(/^[0-9]{7,11}$/.test(formData.phone_number.replace(/\D/g, '')))) return;
        button.classList.remove('blank');
        button.classList.add('filled');
      } else {
        button.classList.remove('filled');
        button.classList.add('blank');
      }
    });

  // listen on field change
  field.querySelector('.field-input#phone_number')
    .addEventListener('input', ({ target: t }) => {
      const target = t;
      formData.phone_number = target.value;
      target.setAttribute('value', target.value);
      const button = target.parentNode.parentNode.querySelector('.styled-btn.submit');
      consentTerms = target.parentNode.parentNode.nextSibling;
      let consent = true;
      if (consentTerms) {
        consent = consentTerms.querySelector('input').checked;
      }

      target.value = formatPhoneNumber(target.value);
      if (!(/^[0-9]{7,11}$/.test(target.value.replace(/\D/g, '')))) {
        button.classList.remove('filled');
        button.classList.add('blank');
        return;
      }
      storage.setToStorage('userPhoneNumber', target.value);
      if (target.value && consent) {
        button.classList.remove('blank');
        button.classList.add('filled');
      } else {
        button.classList.remove('filled');
        button.classList.add('blank');
      }
    });

  field.querySelector('.styled-btn').addEventListener('click', ({ target }) => {
    const curTarget = target.classList.contains('styled-btn') ? target : target.parentNode;
    if (curTarget.classList.contains('filled')) {
      const input = curTarget.parentNode.querySelector('.field-input');
      input.classList.add('disabled');
      curTarget.parentNode.querySelector('.glyphicon').classList.add('show');
      curTarget.style.display = 'none';

      const loader = document.createElement('div');
      loader.classList.add('loader');
      curTarget.parentNode.appendChild(loader);

      formData.prospect = storage.getFromStorage('prospect_uuid');
      requests.sendTextMe(formData).then(() => {
        setTimeout(() =>
          curTarget.parentNode.removeChild(loader), 1000);

        action.addChat('BOT', 'You\'re all set! You\'ll be receiving a text shortly to connect you to someone on our team ready to answer any questions about our community. Anything else I can help you with?')
          .then(() => {
            view.addActionButtons(action);
            if (action.activeAgent) {
              view.appendMessageBox(value => action.addChat('PROSPECT', value, { action: null, toAgent: true }));
            } else if (action.hobbesEnabled) {
              view.appendMessageBox(async (value) => {
                const convId = await action.addChat('PROSPECT', value);
                await action.askQuestionToBot(value, () => {
                }, convId);
              });
            }
          });
      });
    }
  });
};

const addNameField = (action, view) => {
  const formContainers = document.querySelectorAll('.chat .chat-container .schedule-form');
  const formContainer = formContainers[formContainers.length - 1];
  const field = document.createElement('div');
  field.classList.add('schedule-form__field');
  field.innerHTML =
      '<div class="field-info">' +
      ' <span> 1. Name </span>' +
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
    .addEventListener('change', (e) => {
      formData.first_name = e.target.value;
      e.target.setAttribute('value', e.target.value);
      storage.setToStorage('userName', e.target.value);
      const button = e.target.parentNode.parentNode.querySelector('.styled-btn.submit');
      const lastName = field.querySelector('.field-input#last_name');
      if (e.target.value && lastName.value) {
        button.classList.remove('blank');
        button.classList.add('filled');
      } else {
        button.classList.remove('filled');
        button.classList.add('blank');
      }
    });

  field.querySelector('.field-input#last_name')
    .addEventListener('change', (e) => {
      formData.last_name = e.target.value;
      e.target.setAttribute('value', e.target.value);
      storage.setToStorage('userLastName', e.target.value);
      const button = e.target.parentNode.parentNode.querySelector('.styled-btn.submit');
      const firstName = field.querySelector('.field-input#first_name');
      if (e.target.value && firstName.value) {
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
        curTarget.style.display = 'none';
        curTarget.parentNode.querySelector('.field-input#first_name')
          .classList
          .add('disabled');
        curTarget.parentNode.querySelector('.field-input#last_name')
          .classList
          .add('disabled');
        curTarget.parentNode.querySelectorAll('.glyphicon')
          .forEach(el => el.classList.add('show'));
        addPhoneField(action, view);
      }
    });
};

const buildTextMeContent = (action, view) => {
  const chatContainer = document.querySelector('.chat .chat-container ul');
  const formListItem = document.createElement('li');
  formListItem.innerHTML = '<div class="schedule-form"></div>';
  chatContainer.appendChild(formListItem);
  addNameField(action, view);
};

export const runTextMe = async (action, view) => {
  await action.addChat('PROSPECT', 'Text me', 'TEXT_ME').then(() => {
    action.addChat('BOT', 'Please provide your name and phone number so our team can reach out and text you.')
      .then(() => buildTextMeContent(action, view));
  });
  view.hideMessageBox();
  view.removeActionButtons();
};

