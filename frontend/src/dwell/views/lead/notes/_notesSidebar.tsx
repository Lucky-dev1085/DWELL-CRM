import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { Plus, File } from 'react-feather';
import TimeAgo from 'react-timeago';
import Skeleton from 'react-loading-skeleton';
import moment from 'moment';
import { UncontrolledTooltip } from 'reactstrap';
import { timeFormatter } from 'dwell/constants';
import { ActiveNote, NoteProps } from 'src/interfaces';
import { GreenBadge } from 'dwell/views/lead/overview/lead_body_content/styles';
import {
  NoteSidebarHeader,
  NoteSidebarHeaderLabel,
  NoteSidebarHeaderSpan,
  NoteSidebarHeaderAddButton, NoteSidebarHeaderAddButtonSpan,
  NavNotes, NavNotesLink, NoteBody, NoteIcon, TimeWrapper,
} from './styles';

interface NotesContentProps {
  notes: Array<NoteProps>,
  activeNoteTab: ActiveNote,
  setActiveNoteTab: (activeTab: ActiveNote) => unknown,
  handleAddNote: () => void,
  isLoading: boolean,
  editNoteId: number,
  updateEdit: (id: number) => void,
}

const getClearText = text => text.replace(/&nbsp;|<br \/>|<li>|<\/li>|<ol>|<\/ol>/g, ' ').replace(/<\/?[^>]+(>|$)|/g, '');

const NotesContent: FC<NotesContentProps> = ({ notes, activeNoteTab, setActiveNoteTab, handleAddNote, isLoading, editNoteId, updateEdit }) => {
  const isSubmitting = useSelector(state => state.note.isSubmitting);

  const handleSetActiveTab = (id) => {
    if (!editNoteId && activeNoteTab.id) {
      setActiveNoteTab({ id, isClick: true });
    } else {
      setActiveNoteTab({ id, isClick: false });
      updateEdit(id);
    }
  };

  return (
    <React.Fragment>
      <NoteSidebarHeader>
        <NoteSidebarHeaderLabel>
          Notes
          <NoteSidebarHeaderSpan>{notes.length}</NoteSidebarHeaderSpan>
        </NoteSidebarHeaderLabel>
        <div id="add-new-note">
          <NoteSidebarHeaderAddButton onClick={() => handleAddNote()} disabled={notes.some(i => !i.id) || isSubmitting}>
            <NoteSidebarHeaderAddButtonSpan><Plus size={20} /></NoteSidebarHeaderAddButtonSpan>
          </NoteSidebarHeaderAddButton>
        </div>
        <UncontrolledTooltip trigger="hover" placement="top" target="add-new-note">
          Add new note
        </UncontrolledTooltip>
      </NoteSidebarHeader>

      <NavNotes>
        {notes.filter(i => !i.id).concat(notes.filter(i => i.id)).map((note, index) => {
          const isNewNote = note.id === null;
          let text = isNewNote ? (note.text || 'Blank note') : note.text;
          text = `${getClearText(text).substring(0, 31)}${getClearText(text).length > 34 ? ' ...' : ' '}`;
          const isRecentDate = Math.abs(moment(note.updated).diff(moment(), 'm')) <= 5;
          const dateTitle = moment(note.updated).format('lll');
          return (
            <NavNotesLink key={`note${index}`} className={activeNoteTab.id === note.id ? 'active' : ''} onClick={() => handleSetActiveTab(note.id)}>
              <NoteIcon className="note-icon"><File /></NoteIcon>
              <NoteBody>
                {
                  isLoading ? (
                    <React.Fragment>
                      <h6>{text}</h6>
                      <span>
                        {isNewNote || isRecentDate ? <GreenBadge title={dateTitle}>JUST NOW</GreenBadge> :
                          <TimeWrapper>
                            <span>{<TimeAgo date={dateTitle} formatter={timeFormatter} />}</span>
                            <span>{moment(note.updated).format('ll')}</span>
                          </TimeWrapper>}
                      </span>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <Skeleton width={250} height={12} style={{ borderRadius: '6px', marginBottom: '10px' }} />
                      <Skeleton width={210} height={8} style={{ borderRadius: '6px' }} />
                    </React.Fragment>
                  )
                }
              </NoteBody>
            </NavNotesLink>
          );
        })}
      </NavNotes>

    </React.Fragment>
  );
};

export default NotesContent;
