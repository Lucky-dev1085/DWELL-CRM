import { toast, ToastOptions } from 'react-toastify';
import get from 'lodash/get';
import { toastOptions, toastError } from 'site/constants';
import colorToRGB from './colorToRGB';
import googleMapOptions from './googleMapOptions';

export {
  colorToRGB,
  googleMapOptions,
};

export const successCallback = (): number => toast.success('Your edit has been saved', toastOptions as ToastOptions);
export const failureCallback = (data: { message?: string }): number => toast.error(get(data, 'message', 'Something went wrong!'), toastError as ToastOptions);
export const isChrome = typeof navigator !== 'undefined' && /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
