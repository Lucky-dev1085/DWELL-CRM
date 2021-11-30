import { actions } from 'compete/constants';
import { ComparisonState, ComparisonActionTypes } from 'src/interfaces';

const initialState: ComparisonState = {
  isSubmitting: false,
  errorMessage: null,
  isComparisonListLoaded: false,
  isComparisonLoaded: false,
  comparisonList: null,
  comparison: null,
  isHighestRentLoaded: false,
  highestRent: null,
  isHighestOccupancyLoaded: false,
  highestOccupancy: null,
  highestOccupancyCount: 0,
  highestRentCount: 0,
  subjectName: null,
  subjectRentRank: null,
  subjectOccupancyRank: null,
  subjectType: null,
};

const actionMap = {
  [actions.GET_COMPARISON_LIST_REQUEST]: state => ({ ...state, isComparisonListLoaded: false }),
  [actions.GET_COMPARISON_LIST_SUCCESS]: (state, { result: { data: { results } } }) => ({ ...state, comparisonList: results, isComparisonListLoaded: true }),
  [actions.GET_COMPARISON_LIST_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isComparisonListLoaded: false }),

  [actions.CREATE_COMPARISON_REQUEST]: state => ({ ...state, isSubmitting: true, isComparisonLoaded: false }),
  [actions.CREATE_COMPARISON_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, comparison: data, isComparisonLoaded: true }),
  [actions.CREATE_COMPARISON_FAILURE]: state => ({ ...state, isSubmitting: false, isComparisonLoaded: false }),

  [actions.GET_HIGHEST_RENT_REQUEST]: state => ({ ...state, isHighestRentLoaded: false }),
  [actions.GET_HIGHEST_RENT_SUCCESS]: (state, { result: { data: { results, count, subject_name: subjectName, subject_rank: subjectRentRank, subject_type: subjectType } } }) => ({
    ...state, highestRent: results, isHighestRentLoaded: true, highestRentCount: count, errorMessage: null, subjectName, subjectRentRank, subjectType,
  }),
  [actions.GET_HIGHEST_RENT_FAILURE]: (state, { error: { response: { data } } }) => ({ ...state, errorMessage: data, isHighestRentLoaded: false }),

  [actions.GET_HIGHEST_OCCUPANCY_REQUEST]: state => ({ ...state, isHighestOccupancyLoaded: false }),
  [actions.GET_HIGHEST_OCCUPANCY_SUCCESS]: (state, { result: { data: { results, count, subject_name: subjectName, subject_rank: subjectOccupancyRank, subject_type: subjectType } } }) => ({
    ...state, highestOccupancy: results, isHighestOccupancyLoaded: true, highestOccupancyCount: count, errorMessage: null, subjectName, subjectOccupancyRank, subjectType,
  }),
  [actions.GET_HIGHEST_OCCUPANCY_FAILURE]: (state, { error: { response: { data } } }) => ({ ...state, errorMessage: data, isHighestOccupancyLoaded: false }),

  [actions.GET_COMPARISON_BY_ID_REQUEST]: state => ({ ...state, isComparisonLoaded: false }),
  [actions.GET_COMPARISON_BY_ID_SUCCESS]: (state, { result: { data } }) => ({ ...state, comparison: data, isComparisonLoaded: true }),
  [actions.GET_COMPARISON_BY_ID_FAILURE]: state => ({ ...state, isComparisonLoaded: false }),
};

export default (state = initialState, action: ComparisonActionTypes): ComparisonState => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
