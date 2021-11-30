import React, { useState, useEffect, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Modal, ModalBody, ModalHeader, Card, CardBody, Col, Row } from 'reactstrap';
import CKEditor from 'ckeditor4-react';
import noteAction from 'dwell/actions/note';
import { PrimaryButton, WhiteButton } from 'styles/common';
import { FollowupCheck, NoteFooter } from './styles';

interface NoteModalProps extends RouteComponentProps {
  show: boolean,
  handleClose: () => void,
  editId?: number,
}

CKEditor.editorUrl = `${window.location.origin}/static/ckeditor/ckeditor.js`;

const removeWhiteSpace = /^(&nbsp;|<br \/>|\s)*|(&nbsp;|<br \/>|\s)*$/gm;

const NoteModal: FC<NoteModalProps> = ({ show, handleClose, editId }) => {
  const [note, setNote] = useState('');
  const [isFollowupNote, setIsFollowupNote] = useState(false);
  const [noteId, setNoteId] = useState(null);

  const dispatch = useDispatch();
  const lead = useSelector(state => state.lead.lead);
  const currentProperty = useSelector(state => state.property.property);
  const currentUser = useSelector(state => state.user.currentUser);
  const leadNotes = useSelector(state => state.note.leadNotes);
  const { createNote, updateNoteById } = noteAction;

  useEffect(() => {
    if (editId) {
      const currentNote = leadNotes.find(el => el.id === editId);
      if (currentNote) {
        const { id, transformed_text, is_follow_up } = currentNote;
        setNote(transformed_text);
        setIsFollowupNote(is_follow_up);
        setNoteId(id);
      }
    }
  }, [editId]);

  const getClearText = text => text.replace(/&nbsp;|<br \/>|<li>|<\/li>|<ol>|<\/ol>/g, ' ').replace(/<\/?[^>]+(>|$)|/g, '');

  const focusEndLine = (editor) => {
    const range = editor.createRange();
    range.moveToElementEditEnd(range.root);
    editor.getSelection().selectRanges([range]);
  };

  const disableAutoInline = () => {
    const { CKEDITOR } = window;
    CKEDITOR.disableAutoInline = true;

    CKEDITOR.on('instanceReady', (ev) => {
      ev.editor.focus();
      focusEndLine(ev.editor);
    });
  };

  const dataFeed = (opts, callback) => {
    const dataList = currentProperty.users.filter(item => item.first_name.toLowerCase().includes(opts.query.toLowerCase()) || item.last_name.toLowerCase().includes(opts.query.toLowerCase()));
    callback(dataList);
  };

  const modalClose = () => {
    if (!editId) setNote('');
    handleClose();
  };

  const handleCreate = () => {
    if (note) {
      const mentionIds = note.match(/id="([^"]*)"/g);
      let mentions = [];
      if (mentionIds) {
        // eslint-disable-next-line no-useless-escape
        mentions = mentionIds.map(m => Number(m.split('=')[1].replace(/\"/g, '')));
        mentions = [...new Set(mentions)];
      }
      if (editId) {
        dispatch(updateNoteById(noteId, {
          text: note.replace(removeWhiteSpace, ''),
          mentions,
          is_follow_up: isFollowupNote }, lead.id));
      } else {
        dispatch(createNote({ lead: lead.id,
          owner: currentUser.id,
          text: note.replace(removeWhiteSpace, ''),
          mentions,
          is_follow_up: isFollowupNote }, lead.id));
      }
      modalClose();
    }
  };

  return (
    <Modal
      size="lg"
      isOpen={show}
      toggle={modalClose}
      aria-labelledby="example-custom-modal-styling-title"
      modalClassName="email-composer"
      className="composer-modal"
      centered
    >
      <ModalHeader>
        {note ? `${getClearText(note).substring(0, 31)}${getClearText(note).length > 34 ? ' ...' : ' '}` : 'Blank Note'}
        <button className="close" onClick={(e) => { modalClose(); e.stopPropagation(); }}>
          <i className="ri-close-line" />
        </button>
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col xs="12">
            <Card className="compose">
              <CardBody>
                <div className="compose-editor">
                  <CKEditor
                    id="editor"
                    editorName="editor"
                    className="editor"
                    onBeforeLoad={disableAutoInline}
                    data={note}
                    onChange={e => setNote(e.editor.getData())}
                    config={{
                      height: 400,
                      removePlugins: 'placeholder_select',
                      extraAllowedContent: 'span(*)',
                      scayt_autoStartup: true,
                      startupFocus: true,
                      placeholder: 'Write some note...',
                      htmlEncodeOutput: false,
                      entities: false,
                      mentions: [{
                        feed: dataFeed,
                        minChars: 0,
                        marker: '@',
                        itemTemplate: '<li data-id="{id}">{first_name} {last_name}</li>',
                        outputTemplate: '<a href="javascript:void(0)" id="{id}">@{first_name} {last_name}</a>' }] }}
                  />
                </div>
                <NoteFooter>
                  <FollowupCheck>
                    <input type="checkbox" checked={isFollowupNote} onChange={e => setIsFollowupNote(e.target.checked)} />
                    <span>Mark as followup</span>
                  </FollowupCheck>
                  <div className="d-flex mr-1">
                    <WhiteButton className="mr-2" onClick={modalClose}>Cancel</WhiteButton>
                    <PrimaryButton
                      color="primary"
                      onClick={handleCreate}
                      disabled={!note}
                    > {editId ? 'Edit' : 'Create'} note
                    </PrimaryButton>
                  </div>
                </NoteFooter>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
};

export default withRouter(NoteModal);
