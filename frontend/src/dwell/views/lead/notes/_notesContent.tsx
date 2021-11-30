import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import CKEditor from 'ckeditor4-react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import noteActions from 'dwell/actions/note';
import { getLeadId } from 'dwell/views/lead/layout/utils';
import { NoteProps, ActiveNote } from 'src/interfaces';
import { ContentNoteFooter, RemoveBtn, SaveBtn, FollowupCheck } from './styles';

declare global {
  interface Window { CKEDITOR: CKEditor }
}

interface NotesContentProps extends RouteComponentProps {
  note: NoteProps,
  activeNoteTab: ActiveNote,
  removeNewNote: (isCancel?: boolean) => void,
  pathname: string,
  setTextToNewNote: (text: string) => void,
  updateEdit: (isEdit: false) => void,
}

const removeWhiteSpace = /^(&nbsp;|<br \/>|\s)*|(&nbsp;|<br \/>|\s)*$/gm;

const NotesContent: FC<NotesContentProps> = ({ location: { pathname }, removeNewNote, activeNoteTab, setTextToNewNote, note: defaultNote, updateEdit }) => {
  const [note, setNote] = useState<NoteProps>(defaultNote);
  const [isFocusNote, setFocusNote] = useState(false);
  const [isFollowupNote, setIsFollowupNote] = useState(false);

  const dispatch = useDispatch();
  const currentProperty = useSelector(state => state.property.property);
  const currentUser = useSelector(state => state.user.currentUser);
  const { updateNoteById, createNote } = noteActions;

  useEffect(() => {
    setNote(defaultNote);
    setFocusNote(true);
    setIsFollowupNote(defaultNote.is_follow_up);
  }, [defaultNote, activeNoteTab]);

  const focusEndLine = (editor) => {
    const range = editor.createRange();
    range.moveToElementEditEnd(range.root);
    editor.getSelection().selectRanges([range]);
  };

  const editorFocus = () => {
    const { CKEDITOR } = window;
    setFocusNote(false);

    if (CKEDITOR) {
      const key = Object.keys(CKEDITOR.instances);
      const editor = key.length ? CKEDITOR.instances[key[0]] : null;
      if (editor) {
        editor.focus();
        focusEndLine(editor);
      }
    }
  };

  CKEditor.editorUrl = `${window.location.origin}/static/ckeditor/ckeditor.js`;

  const handleSetData = (text) => {
    if (isFocusNote) setTimeout(editorFocus, 0);
    setNote({ ...note, text });
    if (note.id === null) {
      setTextToNewNote(text);
    }
  };

  const disableAutoInline = () => {
    const { CKEDITOR } = window;
    CKEDITOR.disableAutoInline = true;

    CKEDITOR.on('instanceReady', (ev) => {
      ev.editor.focus();
      focusEndLine(ev.editor);
    });
  };
  const handleCreate = () => {
    const leadId = getLeadId(pathname);
    if (note.text) {
      const mentionIds = note.text.match(/id="([^"]*)"/g);
      let mentions = [];
      if (mentionIds) {
        // eslint-disable-next-line no-useless-escape
        mentions = mentionIds.map(m => Number(m.split('=')[1].replace(/\"/g, '')));
        mentions = [...new Set(mentions)];
      }
      dispatch(createNote({ lead: leadId,
        owner: currentUser.id,
        text: note.text.replace(removeWhiteSpace, ''),
        mentions,
        is_follow_up: isFollowupNote }, leadId));
      removeNewNote();
    }
  };

  const handleUpdate = () => {
    const mentionIds = note.text.match(/id="([^"]*)"/g);
    let mentions = [];
    if (mentionIds) {
      // eslint-disable-next-line no-useless-escape
      mentions = mentionIds.map(m => m.split('=')[1].replace(/\"/g, ''));
      mentions = [...new Set(mentions)];
    }

    dispatch(updateNoteById(note.id, { text: note.text.replace(removeWhiteSpace, ''),
      mentions,
      is_follow_up: isFollowupNote }, getLeadId(pathname)));
    updateEdit(null);
    removeNewNote();
  };

  const handleSave = () => {
    if (note.id) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  const handleDelete = () => {
    if (note.id) {
      updateEdit(null);
      removeNewNote();
    }
  };

  const dataFeed = (opts, callback) => {
    const dataList = currentProperty.users.filter(item => item.first_name.toLowerCase().includes(opts.query.toLowerCase()) || item.last_name.toLowerCase().includes(opts.query.toLowerCase()));
    callback(dataList);
  };

  const isCallNote = note && note.text.startsWith('<strong>Call Recording Transcription:</strong>');

  return (
    <div className="editor-wrapper editor-note">
      {isCallNote ? <div dangerouslySetInnerHTML={{ __html: note.text }} /> : (
        <CKEditor
          id="editor"
          editorName="editor"
          className="editor"
          onBeforeLoad={disableAutoInline}
          data={note ? note.text : ''}
          onChange={e => handleSetData(e.editor.getData())}
          config={{
            removePlugins: 'placeholder_select',
            extraAllowedContent: 'a[id]',
            scayt_autoStartup: true,
            placeholder: 'Write some message...',
            htmlEncodeOutput: false,
            entities: false,
            mentions: [{
              feed: dataFeed,
              minChars: 0,
              marker: '@',
              itemTemplate: '<li data-id="{id}">{first_name} {last_name}</li>',
              outputTemplate: '<a href="javascript:void(0)" id="{id}">@{first_name} {last_name}</a>' }] }}
        />
      )}
      <ContentNoteFooter>
        <FollowupCheck>
          <input type="checkbox" checked={isFollowupNote} onChange={e => setIsFollowupNote(e.target.checked)} />
          <span>Mark as followup</span>
        </FollowupCheck>
        {!isCallNote && <SaveBtn onClick={() => handleSave()}>{ note.id ? 'Save changes' : 'Save note' }</SaveBtn>}
        <RemoveBtn onClick={() => (note.id ? handleDelete() : removeNewNote(true))}>Cancel</RemoveBtn>
        <span>{(note.updated) ? `Last saved on ${moment(note.updated).format('LLL')}` : ''}</span>
      </ContentNoteFooter>
    </div>
  );
};

export default withRouter(NotesContent);
