import React, { FC, useEffect } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import moment from 'moment';
import TimeAgo from 'react-timeago';
import { useDispatch } from 'react-redux';
import noteActions from 'dwell/actions/note';
import { debounce } from 'lodash';
import { getLeadId } from 'dwell/views/lead/layout/utils';
import { NoteProps, ActiveNote } from 'src/interfaces';
import { ContentNoteFooter, RemoveBtn, SaveBtn, NotePane, TextMuted, NoteList } from './styles';

interface NotesListProps extends RouteComponentProps {
  activeNoteTab: ActiveNote,
  editNoteById: (id: number) => void,
  notes: NoteProps[],
  setActiveNoteTab: (activeTab: ActiveNote) => void,
}

const topHeightOffset = 380;

const NotesList: FC<NotesListProps> = ({ location: { pathname }, activeNoteTab, notes, editNoteById, setActiveNoteTab }) => {
  const dispatch = useDispatch();
  const { deleteNoteById } = noteActions;

  const handleScroll = () => {
    notes.forEach((note) => {
      const element = document.getElementById(`note-${note.id}`);
      const elementOffset = element.getBoundingClientRect().top;

      if (elementOffset <= topHeightOffset) {
        setActiveNoteTab({ id: note.id, isClick: false });
      }
    });
  };

  useEffect(() => {
    if (activeNoteTab.isClick) {
      const element = document.getElementById(`note-${activeNoteTab.id}`);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeNoteTab]);

  const handleDelete = (id) => {
    if (id) {
      dispatch(deleteNoteById(id, getLeadId(pathname)));
    }
  };

  const scrollToTab = () => {
    setActiveNoteTab({ id: activeNoteTab.id, isClick: false });
  };

  return (
    <NoteList onScroll={!activeNoteTab.isClick ? handleScroll : debounce(scrollToTab, 100)}>
      {notes.map((note, index) => (
        <NotePane key={index} id={`note-${note.id}`}>
          <TextMuted>{moment(note.updated).format('LLL')} (<TimeAgo title={moment(note.updated).format('YYYY-MM-DD HH:mm')} date={note.updated} live={false} />)</TextMuted>
          <div dangerouslySetInnerHTML={{ __html: note.text }} />
          <ContentNoteFooter>
            <SaveBtn onClick={() => { editNoteById(note.id); setActiveNoteTab({ id: note.id, isClick: false }); }}>Edit Note</SaveBtn>
            <RemoveBtn onClick={() => handleDelete(note.id)}>Delete</RemoveBtn>
          </ContentNoteFooter>
        </NotePane>))}
    </NoteList>
  );
};

export default withRouter(NotesList);
