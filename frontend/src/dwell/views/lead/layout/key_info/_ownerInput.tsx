import React, { FC, useEffect, useRef, useState } from 'react';
import { Label, DropdownToggle, DropdownMenu, DropdownItem, ButtonDropdown } from 'reactstrap';
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface UsersProps {
  id: number,
  first_name: string,
  last_name: string,
  email: string,
}

interface OwnerInputProps {
  owner: number,
  onSave: any,
  availableOwners: Array<UsersProps>,
  isShared: boolean,
}

const OwnerInput: FC<OwnerInputProps> = (props) => {
  const [owner, setOwner] = useState<string | number>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isCanceled, setIsCanceled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ownerNode = useRef(null);

  useEffect(() => {
    setOwner(props.owner);
  }, [props.owner]);

  const handleClick = (e) => {
    if (!ownerNode.current.contains(e.target)) {
      setIsCanceled(true);
    }
  };

  useEffect(() => {
    if (isCanceled) {
      setIsEditing(false);
      setIsHovering(false);
      setOwner(props.owner);
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
    props.onSave({ owner });
    setIsEditing(false);
  };

  const handleInputChange = (id) => {
    setOwner(id);
  };

  const currentOwner = props.availableOwners.find(o => o.id === owner);
  return (
    <div className="lead-key-detail-container mb-1" ref={node => ownerNode.current = node} >
      {isEditing ? (
        <React.Fragment>
          <div className="pr-1">
            <ButtonDropdown className="mr-1 stage-select float-right" isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
              <DropdownToggle caret className="bg-white">
                {currentOwner ? `${currentOwner.email}` : 'Select owner'}
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={() => handleInputChange(null)}>
                      Select owner
                </DropdownItem>
                {props.availableOwners.map((user, index) => (
                  <React.Fragment key={index}>
                    <DropdownItem onClick={() => handleInputChange(user.id)} className={user.id === owner ? 'selected' : ''}>
                      {user.email}
                    </DropdownItem>
                  </React.Fragment>
                ))}
              </DropdownMenu>
            </ButtonDropdown>
          </div>
          <div className="inline-action-btn mr-1">
            <i className="icons fa fa-check-circle mr-1" onClick={handleSave} />
            <i className="icons fa fa-times-circle mr-1" onClick={() => setIsCanceled(true)} />
          </div>
        </React.Fragment>
      ) : (
      // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
        <Label
          onClick={() => (props.isShared ? null : setIsEditing(true))}
          onMouseOver={() => setIsHovering(!props.isShared)}
          onMouseLeave={() => setIsHovering(false)}
          className="lead-key-detail pl-2 pt-1 pb-1"
        >
          <FontAwesomeIcon icon={faUser} />
          {currentOwner ? `${currentOwner.email}` : 'Not Set'}
          <i className="icons cui-pencil mt-10 pl-2 pr-2 isHovering" style={!isHovering ? { color: 'white' } : {}} />
        </Label>
      )}
    </div>
  );
};

export default OwnerInput;
