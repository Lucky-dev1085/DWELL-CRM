import { trim } from 'lodash';
import { MIN_LENGTH_PHONE_NUMBER } from 'site/constants';

export default {
  isEmpty: (value: string | number): boolean => !trim((value || '').toString()),
  isPhoneNumber: (value: string): RegExpMatchArray => (value.length > MIN_LENGTH_PHONE_NUMBER) && value.match(/^(1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/),
  isValidEmail: (value: string): boolean => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value),
  isValidName: (value: string): boolean => /^[a-zA-Z ]+$/.test(value),
  // eslint-disable-next-line max-len
  isValidWebsite: (value: string): boolean => /^(?:(?:https?|ftp|http|ftps):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/.test(value),
  hasYoutubeVideoId: (value: string): string | boolean => {
    const matched = value.match(/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/); // eslint-disable-line no-useless-escape
    return matched && matched[1].length === 11 ? matched[1] : false;
  },
};
