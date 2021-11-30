import { actions } from 'dwell/constants';
import { orderBy, unionBy } from 'lodash';
import { NoteProps, NoteState, NoteActionTypes } from 'src/interfaces';
import { isLeadPage, isLeadsObject } from './utils';

const initialState: NoteState = {
  isSubmitting: false,
  errorMessage: null,
  notes: [],
  leadNotes: [],
  note: {} as NoteProps,
  count: 0,
};

const actionMap = {
  [actions.GET_LEAD_BY_ID_SUCCESS]: (state, { result: { data } }) => ({ ...state, leadNotes: data.notes }),

  [actions.GET_LEAD_LEVEL_NOTES_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_LEAD_LEVEL_NOTES_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, leadNotes: data.results }),
  [actions.GET_LEAD_LEVEL_NOTES_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.GET_NOTES_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_NOTES_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, notes: data.results }),
  [actions.GET_NOTES_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.GET_NOTE_BY_ID_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_NOTE_BY_ID_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, note: data }),
  [actions.GET_NOTE_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.DELETE_NOTE_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.DELETE_NOTE_SUCCESS]: (state, { result: { data } }) => {
    const updateLeadNotesList = state.leadNotes.filter(note => (note.id !== data.id));
    return { ...state, isSubmitting: false, leadNotes: updateLeadNotesList };
  },
  [actions.DELETE_NOTE_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_NOTE_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_NOTE_SUCCESS]: (state, { result: { data } }) =>
    ({ ...state, isSubmitting: false, leadNotes: orderBy(unionBy([data], state.leadNotes, 'id'), ['updated'], ['desc']) }),
  [actions.UPDATE_NOTE_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.CREATE_NOTE_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_NOTE_SUCCESS]: (state, { result: { data } }) => {
    const updateLeadNotesList = [data].concat([...state.leadNotes]);
    return { ...state, isSubmitting: false, leadNotes: updateLeadNotesList };
  },
  [actions.CREATE_NOTE_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.PUSHER_CREATE_RECORD]: (state, { row }) => {
    let newNotes = state.leadNotes;
    if (isLeadPage() && isLeadsObject(row.lead) && !state.leadNotes.find(i => i.id === row.id)) {
      newNotes = orderBy(unionBy([row], state.leadNotes, 'id'), ['updated'], ['desc']);
    }
    return { ...state, leadNotes: newNotes };
  },
  [actions.PUSHER_UPDATE_RECORD]: (state, { row }) => {
    let newNotes = state.leadNotes;
    if (isLeadPage() && isLeadsObject(row.lead)) {
      newNotes = orderBy(unionBy([row], state.leadNotes, 'id'), ['updated'], ['desc']);
    }
    return { ...state, leadNotes: newNotes, note: state.note.id === row.id ? row : state.note };
  },
  [actions.PUSHER_DELETE_RECORD]: (state, { row }) => {
    let newNotes = state.leadNotes;
    if (isLeadPage() && isLeadsObject(row.id.lead)) {
      newNotes = state.leadNotes.filter(o => o.id.toString() !== row.id.toString());
    }
    return { ...state, leadNotes: newNotes };
  },
};

export default (state = initialState, action: NoteActionTypes): NoteState => {
  if (actionMap[action.type]) {
    if (action.type.includes('PUSHER_') && action.pusherModel !== 'note') {
      return state;
    }
    return actionMap[action.type](state, action);
  }

  return state;
};
