export const formatDate = (date) => {
  const d = new Date(date);
  let month = `${d.getMonth() + 1}`;
  let day = `${d.getDate()}`;
  const year = d.getFullYear();

  if (month.length < 2) { month = `0${month}`; }
  if (day.length < 2) { day = `0${day}`; }

  return [year, month, day].join('-');
};

export const formatTime = (date) => {
  const d = new Date(date);
  let hours = `${d.getHours()}`;
  let minutes = `${d.getMinutes()}`;

  if (hours.length < 2) { hours = `0${hours}`; }
  if (minutes.length < 2) { minutes = `0${minutes}`; }

  return [hours, minutes].join(':');
};

export const formatPhoneNumber = (value) => {
  let phoneNumber = value;
  const input = phoneNumber.replace(/\D/g, '').substring(0, 10);
  const zip = input.substring(0, 3);
  const middle = input.substring(3, 6);
  const last = input.substring(6, 10);

  if (input.length > 6) {
    phoneNumber = `(${zip}) ${middle}-${last}`;
  } else if (input.length > 3) {
    phoneNumber = `(${zip}) ${middle}`;
  } else if (input.length > 0) {
    phoneNumber = `(${zip}`;
  }
  return phoneNumber;
};

export const parseBedrooms = (bedrooms) => {
  let clearBedrooms = [];
  if (bedrooms) {
    bedrooms.forEach((bedroom) => {
      switch (bedroom) {
        case 'STUDIO':
          clearBedrooms = clearBedrooms.concat({ name: 'Studio', id: 0 });
          break;
        case 'ONE_BEDROOM':
          clearBedrooms = clearBedrooms.concat({ name: '1 Bedroom', id: 1 });
          break;
        case 'TWO_BEDROOM':
          clearBedrooms = clearBedrooms.concat({ name: '2 Bedrooms', id: 2 });
          break;
        case 'THREE_BEDROOM':
          clearBedrooms = clearBedrooms.concat({ name: '3 Bedrooms', id: 3 });
          break;
        case 'FOUR_BEDROOM':
          clearBedrooms = clearBedrooms.concat({ name: '4 Bedrooms', id: 4 });
          break;
        default:
          break;
      }
    });
  }
  return clearBedrooms;
};

export const hyphenate = text => text.toLowerCase()
  .replace(/[^a-z]/g, '-').replace(/-+/g, '-');
