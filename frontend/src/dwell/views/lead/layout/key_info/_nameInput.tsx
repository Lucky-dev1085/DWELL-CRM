import React, { FC, useEffect, useRef, useState } from 'react';
import { Input } from 'reactstrap';
import { LineSkeleton } from 'src/utils';
import { LeadName } from './style';

interface NameInputProps {
  firstName: string,
  lastName: string,
  onSave: (object: { first_name: string, last_name: string }) => null,
  isShared: boolean,
  label: string,
  getSyncStatus: () => void,
}

export const NameInput: FC<NameInputProps> = (props) => {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isCanceled, setIsCanceled] = useState(false);
  const nameNode = useRef(null);

  useEffect(() => {
    setFirstName(props.firstName);
    setLastName(props.lastName);
  }, [props.firstName, props.lastName]);

  const handleClick = (e) => {
    if (!nameNode.current.contains(e.target)) {
      setIsCanceled(true);
    }
  };

  useEffect(() => {
    if (isCanceled) {
      setIsEditing(false);
      setIsHovering(false);
      setFirstName(props.firstName);
      setLastName(props.lastName);
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
    props.onSave({ first_name: firstName, last_name: lastName });
    setIsEditing(false);
  };

  const handleInputChange = ({ target: { id, value } }) => {
    if (id === 'firstName') {
      setFirstName(value);
    }
    if (id === 'lastName') {
      setLastName(value);
    }
  };

  return (
    <div ref={node => nameNode.current = node} className="d-flex align-items-end">
      {isEditing ? (
        <React.Fragment>
          <div>
            <Input className="mr-1" type="text" id="firstName" placeholder="First Name" value={firstName} onChange={handleInputChange} required />
            <Input className="mr-1" type="text" id="lastName" placeholder="Last Name" value={lastName} onChange={handleInputChange} required />
          </div>
          <div className="inline-action-btn mr-1 d-flex ml-1 mb-3">
            <i className="icons fa fa-check-circle mr-1" onClick={handleSave} />
            <i className="icons fa fa-times-circle mr-1" onClick={() => setIsCanceled(true)} />
          </div>
        </React.Fragment>
      ) : (
        <div>
          {/* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */}
          <LeadName
            onClick={() => (props.isShared ? null : setIsEditing(true))}
            onMouseOver={() => setIsHovering(!props.isShared)}
            onMouseLeave={() => setIsHovering(false)}
          >{firstName || lastName ?
              <>
                {firstName} {lastName}
                {props.isShared && <span className="text-black-50 font-weight-normal ml-2" style={{ fontSize: '18px' }}>({props.label})</span>}
                {isHovering && <i className="icons cui-pencil mt-10 pl-2 pr-2" style={{ fontSize: '18px', cursor: 'pointer' }} />}
              </>
              : <LineSkeleton width={100} height={12} />}
          </LeadName>
          {firstName || lastName ? props.getSyncStatus() : <LineSkeleton width={150} height={8} />}
        </div>
      )}
    </div>
  );
};

export default NameInput;
