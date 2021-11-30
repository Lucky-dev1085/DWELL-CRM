import { actions, pageTypes } from 'site/constants';
import { PageDataState, PageDataActionTypes } from 'src/interfaces';

const initialState: PageDataState = {
  isSubmitting: false,
  isPageDataLoaded: false,
  homePageData: {},
  galleryPageData: {},
  floorPlansPageData: {},
  amenitiesPageData: {},
  neighborhoodPageData: {},
  virtualTourPageData: {},
  contactPageData: {},
  footerPageData: {},
  designPageData: {},
  seoPageData: {},
  formChanged: false,
  submitClicked: false,
};

const actionMap = {
  [actions.GET_PAGE_DATA_REQUEST]: state => ({ ...state, isSubmitting: true, isPageDataLoaded: false }),
  [actions.GET_PAGE_DATA_SUCCESS]: (state, { result: { data }, sections }) => ({ ...state, isSubmitting: false, isPageDataLoaded: true, [pageTypes[sections]]: data }),
  [actions.GET_PAGE_DATA_FAILURE]: state => ({ ...state, isSubmitting: false, isPageDataLoaded: false }),

  [actions.UPDATE_PAGE_DATA_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_PAGE_DATA_SUCCESS]: (state, { result: { data }, sections }) => ({ ...state, isSubmitting: false, [pageTypes[sections]]: data }),
  [actions.UPDATE_PAGE_DATA_FAILURE]: state => ({ ...state, isSubmitting: false }),

  [actions.CREATE_PAGE_DATA_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_PAGE_DATA_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.CREATE_PAGE_DATA_FAILURE]: state => ({ ...state, isSubmitting: false }),

  [actions.SET_PAGE_DATA_CHANGED_STATE]: (state, { changed }) => ({ ...state, formChanged: changed }),
  [actions.SET_SUBMISSION_STATE]: (state, { clicked }) => ({ ...state, submitClicked: clicked }),

};

export default (state = initialState, action: PageDataActionTypes): PageDataState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
