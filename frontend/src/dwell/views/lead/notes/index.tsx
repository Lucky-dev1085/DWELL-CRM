import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { EmptyContent, PrimaryButton } from 'styles/common';
import { getLeadId } from 'dwell/views/lead/layout/utils';
import { ActiveNote, NoteProps } from 'src/interfaces';
import NotesSidebar from './_notesSidebar';
import NotesContent from './_notesContent';
import NotesList from './_notesList';
import { ContentBodyNotes, ContentNodeSidebar, ContentNoteBody } from './styles';

const LeadNotes: FC<RouteComponentProps> = ({ location: { pathname } }) => {
  const [notes, setNotes] = useState<NoteProps[]>([]);
  const [activeNoteTab, setActiveNoteTab] = useState<ActiveNote>({ id: -1, isClick: false });
  const [isLoading, toggleLoading] = useState(false);
  const [editNoteId, updateEdit] = useState(null);

  const leadNotes = useSelector(state => state.note.leadNotes);

  const handleAddNote = () => {
    setNotes(notes.concat([{ id: null, text: '' }]));
    setActiveNoteTab({ id: null, isClick: false });
    updateEdit(null);
  };

  useEffect(() => {
    setTimeout(() => toggleLoading(true), 1500);
  }, []);

  useEffect(() => {
    const newNotes = notes.filter(i => i.id === null).concat(leadNotes.filter(i => i.lead === getLeadId(pathname)));
    setNotes(newNotes);
    if (leadNotes.length && !newNotes.find(i => i.id === activeNoteTab.id)) {
      setActiveNoteTab({ id: leadNotes[0].id, isClick: false });
    }
  }, [leadNotes]);

  const handleSetTextToNewNote = (text) => {
    const noteIndex = notes.findIndex(i => i.id === null);
    if (noteIndex !== -1) {
      const newNotes = [...notes];
      newNotes[noteIndex].text = text;
      setNotes(newNotes);
    }
  };

  const handleRemoveNewNote = (isCancel = false) => {
    const newNoes = notes.filter(i => i.id);
    setNotes(newNoes);
    if (newNoes.length && isCancel) setActiveNoteTab({ id: newNoes[0].id, isClick: false });
  };

  const emptyContent = (
    <React.Fragment>
      <EmptyContent>
        <i className="ri-sticky-note-line" />
        <h5><span>No notes</span></h5>
        <p>There are no notes linked to this lead yet.</p>
        <PrimaryButton onClick={() => handleAddNote()}>
          <span>+</span> Add Note
        </PrimaryButton>
      </EmptyContent>
    </React.Fragment>
  );

  const note = notes.find(i => i.id === editNoteId);

  const content = (
    <React.Fragment>
      <ContentBodyNotes>
        <ContentNodeSidebar>
          <NotesSidebar
            notes={notes}
            activeNoteTab={activeNoteTab}
            setActiveNoteTab={setActiveNoteTab}
            handleAddNote={handleAddNote}
            isLoading={isLoading}
            editNoteId={editNoteId}
            updateEdit={updateEdit}
          />
        </ContentNodeSidebar>
        <ContentNoteBody isNote={note}>
          {isLoading && note ?
            <NotesContent
              note={note}
              setTextToNewNote={handleSetTextToNewNote}
              activeNoteTab={activeNoteTab}
              pathname={pathname}
              removeNewNote={handleRemoveNewNote}
              updateEdit={updateEdit}
            /> :
            <NotesList
              notes={notes}
              editNoteById={updateEdit}
              activeNoteTab={activeNoteTab}
              setActiveNoteTab={setActiveNoteTab}
            />
          }
        </ContentNoteBody>
      </ContentBodyNotes>
    </React.Fragment>
  );

  return (
    <React.Fragment >
      {notes.length ? content : emptyContent}
    </React.Fragment>
  );
};

export default withRouter(LeadNotes);
