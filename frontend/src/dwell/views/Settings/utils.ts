import moment from 'moment';

export const getUTCDate = (date: string): Date => {
  const utcDate = moment.utc(date);
  return utcDate.date() === 1 ? new Date(utcDate.format('YYYY-MM-DDTHH:mm:ss.SSS')) : new Date(date);
};
