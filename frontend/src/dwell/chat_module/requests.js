import storage from 'dwell/chat_module/propertyStorage';

class Requests {
  constructor() {
    this.propertyExternalId = '{{ propertyExternalId }}';
    this.clientId = '{{ clientId }}';
    this.host = '{{ host }}';
    this.prospectUUID = storage.getFromStorage('prospect_uuid');
  }

  // main fetch actions
  post = (endpoint, data, callback) => fetch(`${this.host}${endpoint}`, {
    method: 'post',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'X-Name': this.propertyExternalId,
      'Client-ID': this.clientId,
    },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(result => callback(result));

  get = (endpoint, callback, cacheSettings) => fetch(`${this.host}${endpoint}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'X-Name': this.propertyExternalId,
      'Client-ID': this.clientId,
    },
    ...cacheSettings,
  })
    .then(response => response.json())
    .then(data => callback(data));

  patch = (endpoint, data) => fetch(`${this.host}${endpoint}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'X-Name': this.propertyExternalId,
      'Client-ID': this.clientId,
    },
    body: JSON.stringify(data),
  });

  fetchVirtualTours = () => fetch(`${this.host}/api/v1/public_page_data/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'X-Domain': window.location.host,
    },
  })
    .then(response => response.json())
    .then(({ data: pageData }) => {
      const section = pageData.find(item => item.section === 'VIRTUAL_TOUR');
      if (section) {
        return section.values.tours || [];
      }
      return [];
    })

  fetchImages = () => fetch(`${this.host}/api/v1/public_page_data/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'X-Domain': window.location.host,
    },
  })
    .then(response => response.json())
    .then(({ data: pageData }) => {
      const section = pageData.find(item => item.section === 'GALLERY');
      const result = {
        image: null,
        text: '',
        title: '',
      };
      if (section && section.values.images) {
        return {
          image: section.values.images[0] || null,
          text: section.firstRibbon.text || '',
          title: section.firstRibbon.title || '',
        };
      }
      return result;
    })

  getAvailableTourTime = (date, type, unit = [], tour = null) => {
    const unitParam = `${unit ? unit.map(u => `&unit[]=${u}`).join('') : ''}`;
    const dateParam = `${date ? `&date=${date}` : ''}`;
    const tourParam = `${tour ? `&tour=${tour}` : ''}`;
    const tzDifference = `&tz_difference=${new Date().getTimezoneOffset()}`;
    return this.get(`/api/v1/tour_available_time/?${dateParam}&type=${type}${unitParam}${tourParam}${tzDifference}`, response => response.times);
  };

  sendTextMe = data => new Promise(resolve => this.post('/api/v1/text_me/', data, (response) => {
    resolve(response);
  }));

  sendTyping = data => new Promise((resolve) => {
    this.post(`/api/v1/prospects/${this.prospectUUID}/send_typing_state/`, data, (response) => {
      resolve(response);
    });
  });
}

const requests = new Requests();
export default requests;
