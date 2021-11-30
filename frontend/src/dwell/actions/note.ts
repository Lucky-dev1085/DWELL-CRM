import { actions, paths } from 'dwell/constants';
import { build } from 'dwell/constants/paths';
import { ActionType, NoteProps } from 'src/interfaces';

export default {
  getLeadNotes: (leadId: number, params: NoteProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_LEAD_LEVEL_NOTES_REQUEST,
        actions.GET_LEAD_LEVEL_NOTES_SUCCESS,
        actions.GET_LEAD_LEVEL_NOTES_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.LEAD_LEVEL_NOTES, leadId), { params }),
    },
  }),

  getNoteById: (id: number, leadId: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_NOTE_BY_ID_REQUEST,
        actions.GET_NOTE_BY_ID_SUCCESS,
        actions.GET_NOTE_BY_ID_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.NOTE_DETAILS, leadId, id)),
    },
  }),
  deleteNoteById: (id: number, leadId: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.DELETE_NOTE_REQUEST,
        actions.DELETE_NOTE_SUCCESS,
        actions.DELETE_NOTE_FAILURE,
      ],
      promise: client => client.delete(build(paths.api.v1.NOTE_DETAILS, leadId, id)),
    },
  }),
  updateNoteById: (id: number, params: NoteProps, leadId: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_NOTE_REQUEST,
        actions.UPDATE_NOTE_SUCCESS,
        actions.UPDATE_NOTE_FAILURE,
      ],
      promise: client => client.put(build(paths.api.v1.NOTE_DETAILS, leadId, id), params),
    },
  }),
  createNote: (data: NoteProps, leadId: number): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_NOTE_REQUEST,
        actions.CREATE_NOTE_SUCCESS,
        actions.CREATE_NOTE_FAILURE,
      ],
      promise: client => client.post(build(paths.api.v1.LEAD_LEVEL_NOTES, leadId), data),
    },
  }),
};
