import React, { FC, useEffect, useRef, useState } from 'react';
import { set } from 'lodash';
import moment from 'moment';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { SingleDatePicker } from 'react-dates';
import { DatePickerWrapper, MediaValue } from './style';

interface MoveInDateInputProps {
  moveInDate: Date,
  onSave: ({ move_in_date: moveInDate }) => null,
  isShared: boolean,
}

const MoveInDateInput: FC<MoveInDateInputProps> = (props) => { // TODO is using?
  const [initialMoveInDate, setInitialMoveInDate] = useState(null);
  const [lead, setLead] = useState<{ moveInDate: Date } | { moveInDate: null}>({ moveInDate: null });
  const [dateFocused, setDateFocused] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isCanceled, setIsCanceled] = useState(false);
  const dateNode = useRef(null);

  useEffect(() => {
    setInitialMoveInDate(props.moveInDate);
    setLead({ ...lead, moveInDate: props.moveInDate });
  }, [props.moveInDate]);

  const handleClick = (e) => {
    if (dateNode.current && !dateNode.current.contains(e.target)) {
      setIsCanceled(true);
    }
  };

  useEffect(() => {
    if (isCanceled) {
      setIsEditing(false);
      setIsHovering(false);
      setLead({ ...lead, moveInDate: initialMoveInDate });
      setIsCanceled(false);
    }
  }, [isCanceled]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  const handleSave = () => {
    const { moveInDate } = lead;
    props.onSave({ move_in_date: moveInDate });
    setIsEditing(false);
  };

  const handleInputChange = ({ target: { id, value } }) => {
    const resultLead = set(lead, id, value);
    setLead(resultLead);
  };

  const { moveInDate } = lead;
  return (
    <MediaValue innerRef={node => dateNode.current = node} className="d-flex align-items-center">
      {isEditing ? (
        <React.Fragment>
          <DatePickerWrapper className="mr-1">
            <SingleDatePicker
              inputIconPosition="after"
              small
              block={false}
              numberOfMonths={1}
              date={moveInDate ? moment(moveInDate) : null}
              isOutsideRange={() => false}
              onDateChange={date => handleInputChange({ target: { id: 'moveInDate', value: date && date.format('YYYY-MM-DD') } })}
              focused={dateFocused}
              onFocusChange={({ focused }) => setDateFocused(focused)}
              openDirection="down"
              hideKeyboardShortcutsPanel
              isDayHighlighted={day => day.isSame(moment(), 'd')}
            />
          </DatePickerWrapper>
          <div className="inline-action-btn mr-1">
            <i className="icons fa fa-check-circle mr-1" onClick={handleSave} />
            <i className="icons fa fa-times-circle mr-1" onClick={() => setIsCanceled(true)} />
          </div>
        </React.Fragment>
      ) : (
      // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
        <MediaValue
          onClick={() => (props.isShared ? null : setIsEditing(true))}
          onMouseOver={() => setIsHovering(!props.isShared)}
          onMouseLeave={() => setIsHovering(false)}
        >
          { moveInDate ? moment(moveInDate).format('LL') : 'Not Set'}
          <i className="icons cui-pencil mt-10 pl-2 pr-2 isHovering" style={!isHovering ? { color: 'white' } : { cursor: 'pointer' }} />
        </MediaValue>
      )}
    </MediaValue>
  );
};

export default MoveInDateInput;
