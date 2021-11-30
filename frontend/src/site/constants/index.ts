import actions from './actions';
import customFont from './customFonts';
import feedSourceTypes from './feedSourceTypes';
import pageTypes from './pageTypes';
import platformTypes from './platformTypes';
import roleTypes from './roleTypes';
import sectionTypes from './sectionTypes';
import statusCheckItems from './statusCheckItems';
import statusTypes from './statusTypes';
import templates from './templates';
import urlValidate from './urlValidate';
import paths from './paths';
import googleFontsData from './googleFonts';
import unitTypes from './unitTypes';

export {
  sectionTypes,
  pageTypes,
  urlValidate,
  templates,
  customFont,
  feedSourceTypes,
  actions,
  paths,
  roleTypes,
  statusTypes,
  statusCheckItems,
  platformTypes,
  googleFontsData,
  unitTypes,
};

export const IMAGE_COMPRESS_OPTIONS = {
  quality: 0.8,
  maxWidth: 1600,
  maxHeight: 1067,
};
export const MAX_IMG_SIZE = 10000000;
export const MAX_FILE_SIZE = 25000000;
export const MIN_LENGTH_PHONE_NUMBER = 9;
export const MAX_CAROUSEL_LENGTH = 10;
export const LOGGED_ACCOUNT = 'crm-auth';
export const imageCompressOption = {
  quality: 0.8,
  maxWidth: 1600,
  maxHeight: 1067,
};
export const toastOptions = {
  className: 'custom-success-toast',
  position: 'bottom-center',
  hideProgressBar: true,
};
export const toastError = {
  className: 'custom-error-toast',
  position: 'bottom-center',
  hideProgressBar: true,
};
export const toastWarning = {
  className: 'custom-failure-toast',
  position: 'bottom-center',
  hideProgressBar: true,
};
export const selectRow = {
  mode: 'checkbox',
  clickToSelect: true,
  classes: 'selected',
};
export const roleChoices = {
  GENERIC_ADMIN: 'Property Agent',
  PROPERTY_ADMIN: 'Property Manager',
  CUSTOMER_ADMIN: 'Corporate',
  LIFT_LYTICS_ADMIN: 'Dwell Admin',
};
export const defaultAmenitiesSection = {
  isVisible: false,
  name: '',
  disclaimerText: '',
};
export const backgroundTransparencyChoices = {
  NONE: 'none',
  BLURRED: 'blurred',
  TRANSPARENT_WHITE: 'Transparent White',
  TRANSPARENT_BLACK: 'Transparent Black',
};
