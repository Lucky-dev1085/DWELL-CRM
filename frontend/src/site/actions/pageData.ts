import { actions, paths } from 'site/constants';
import { getPropertyId } from 'src/utils';
import { successCallback, failureCallback } from 'site/common';
import { CallBackFunction, ActionType, PageData, CustomBlob } from 'src/interfaces';

interface Domains {
  oldDomain?: string,
  domain?: string,
}

interface ActionChange {
  type: string,
  changed?: boolean,
  clicked?: boolean,
}

export default {
  getPageData: (sections: string): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_PAGE_DATA_REQUEST,
        actions.GET_PAGE_DATA_SUCCESS,
        actions.GET_PAGE_DATA_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.v1.PAGE_DATA, getPropertyId(), sections)),
      sections,
    },
  }),

  updatePageData: (sections: string, pageData: PageData, successCB: CallBackFunction = successCallback, failureCB: CallBackFunction = failureCallback): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_PAGE_DATA_REQUEST,
        actions.UPDATE_PAGE_DATA_SUCCESS,
        actions.UPDATE_PAGE_DATA_FAILURE,
      ],
      promise: client => client.put(paths.build(paths.api.v1.PAGE_DATA_UPDATE, getPropertyId(), sections), pageData),
      successCB,
      failureCB,
      sections,
    },
  }),

  uploadImage: (file: CustomBlob, successCB: CallBackFunction = successCallback, failureCB: CallBackFunction = failureCallback): ActionType => {
    const data = new FormData();
    data.append('file', file, file.name);

    return {
      [actions.CALL_API]: {
        types: [
          actions.PAGES_UPLOAD_IMAGE_REQUEST,
          actions.PAGES_UPLOAD_IMAGE_SUCCESS,
          actions.PAGES_UPLOAD_IMAGE_FAILURE,
        ],
        promise: client => client.post(paths.api.v1.UPLOAD_IMAGE, data),
        successCB,
        failureCB,
      },
    };
  },

  createPageData: (domain: string): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_PAGE_DATA_REQUEST,
        actions.CREATE_PAGE_DATA_SUCCESS,
        actions.CREATE_PAGE_DATA_FAILURE,
      ],
      promise: client => client.post(paths.api.v1.AUTH_PAGE_DATA, { domain }),
    },
  }),

  updatePageDataDomain: ({ oldDomain, domain }: Domains, successCB: CallBackFunction = successCallback, failureCB: CallBackFunction = failureCallback): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_PAGE_DATA_DOMAIN_REQUEST,
        actions.UPDATE_PAGE_DATA_DOMAIN_SUCCESS,
        actions.UPDATE_PAGE_DATA_DOMAIN_FAILURE,
      ],
      promise: client => client.put(paths.build(paths.api.v1.AUTH_PAGE_DATA_DOMAIN, oldDomain), { domain }),
      successCB,
      failureCB,
    },
  }),

  setChangedState: (changed: boolean): ActionChange => ({ type: actions.SET_PAGE_DATA_CHANGED_STATE, changed }),
  setSubmissionState: (clicked: boolean): ActionChange => ({ type: actions.SET_SUBMISSION_STATE, clicked }),
};
