import React, { FC } from 'react';
import { Editor } from 'slate-react';
import { isKeyHotkey } from 'is-hotkey';
import cn from 'classnames';

const isBoldHotkey = isKeyHotkey('mod+b');
const isItalicHotkey = isKeyHotkey('mod+i');
const isUnderlinedHotkey = isKeyHotkey('mod+u');
const isCodeHotkey = isKeyHotkey('mod+`');

interface WYSWYGProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (data: { value: any }) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  isInvalid: boolean,
}

export const WYSWYG: FC<WYSWYGProps> = ({ value, onChange, isInvalid }) => {
  const onKeyDown = (event, change) => {
    let mark;

    if (isBoldHotkey(event)) {
      mark = 'bold';
    } else if (isItalicHotkey(event)) {
      mark = 'italic';
    } else if (isUnderlinedHotkey(event)) {
      mark = 'underlined';
    } else if (isCodeHotkey(event)) {
      mark = 'code';
    } else {
      return;
    }

    event.preventDefault();
    change.toggleMark(mark);
  };

  const renderNode = (props) => {
    const { attributes, children, node } = props;
    switch (node.type) {
      case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>;
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>;
      case 'heading-one':
        return <h1 {...attributes}>{children}</h1>;
      case 'heading-two':
        return <h2 {...attributes}>{children}</h2>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>;
      default: return null;
    }
  };

  const renderMark = (props) => {
    const { children, mark, attributes } = props;
    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>;
      case 'code':
        return <code {...attributes}>{children}</code>;
      case 'italic':
        return <em {...attributes}>{children}</em>;
      case 'underlined':
        return <u {...attributes}>{children}</u>;
      default: return null;
    }
  };

  const onClickMark = (event, type) => {
    event.preventDefault();
    const change = value.change().toggleMark(type);
    onChange(change);
  };

  const hasMark = type => value.activeMarks.some(mark => mark.type === type);

  const renderMarkButton = (type, icon) => {
    const isActive = hasMark(type);
    const onMouseDown = event => onClickMark(event, type);

    return (
      <span className="wyswyg__button" onMouseDown={onMouseDown} data-active={isActive}>
        <i className={cn('fa', icon)} />
      </span>
    );
  };

  const renderEditor = () => (
    <div className="editor">
      <Editor
        placeholder="Promotion Description..."
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        renderNode={renderNode}
        renderMark={renderMark}
        spellCheck
        autoFocus
      />
    </div>
  );

  const renderToolbar = () => (
    <div className="menu toolbar-menu">
      {renderMarkButton('bold', 'fa-bold')}
      {renderMarkButton('italic', 'fa-italic')}
      {renderMarkButton('underlined', 'fa-underline')}
    </div>
  );

  return (
    <div id="wyswyg" className={isInvalid ? 'wyswyg-invalid' : ''}>
      {renderToolbar()}
      {renderEditor()}
    </div>
  );
};

export default WYSWYG;
