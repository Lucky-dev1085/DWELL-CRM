import React, { FC, useEffect, useRef, useState } from 'react';
import { Label, DropdownToggle, DropdownMenu, DropdownItem, ButtonDropdown } from 'reactstrap';
import { fieldChoices } from 'dwell/constants';
import LeadLostDialog from 'dwell/components/Leads/LeadLostDialog';
import { faUserCheck } from '@fortawesome/free-solid-svg-icons/faUserCheck';
import { faUserTimes } from '@fortawesome/free-solid-svg-icons/faUserTimes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface StatusInputInputProps {
  status: string,
  onSave: any,
  isShared: boolean,
}

const StatusInput: FC<StatusInputInputProps> = (props) => {
  const [status, setStatus] = useState<string>('');
  const [lostReason, setLostReason] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isCanceled, setIsCanceled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const statusNode = useRef(null);
  const leadStatus = fieldChoices.LEAD_FILED_CHOICES.status;

  useEffect(() => {
    setStatus(props.status);
  }, [props.status]);

  const handleClick = (e) => {
    if (!statusNode.current.contains(e.target)) {
      setIsCanceled(true);
    }
  };

  useEffect(() => {
    if (isCanceled) {
      if (!showReasonModal) {
        setIsEditing(false);
        setIsHovering(false);
        setStatus(props.status);
      }
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
    props.onSave({ status, lost_reason: lostReason });
    setIsEditing(false);
    setIsHovering(false);
  };

  const handleCheckStatus = () => {
    if (status === 'LOST' && props.status !== status) {
      setShowReasonModal(true);
    } else {
      handleSave();
    }
  };

  const handleInputChange = (id, value) => {
    if (id === 'lost_reason') {
      setLostReason(value);
    }
    if (id === 'status') {
      setStatus(value);
    }
  };

  return (
    <div className="lead-key-detail-container mb-1" ref={node => statusNode.current = node}>
      <LeadLostDialog
        show={showReasonModal}
        handleClose={() => setShowReasonModal(false)}
        handleChange={value => handleInputChange('lost_reason', value)}
        handleSave={() => {
          setShowReasonModal(false);
          handleSave();
        }}
      />
      {isEditing ? (
        <React.Fragment>
          <div className="pr-1">
            <ButtonDropdown className="mr-1 stage-select float-right" isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
              <DropdownToggle caret className="bg-white">
                {status ? leadStatus[status] : 'Select status'}
              </DropdownToggle>
              <DropdownMenu>
                {Object.keys(leadStatus).filter(el => !leadStatus[el].hide).map((key, index) => (
                  <React.Fragment key={index}>
                    <DropdownItem onClick={() => handleInputChange('status', key)} className={status === key ? 'selected' : ''}>
                      {leadStatus[key]}
                    </DropdownItem>
                  </React.Fragment>
                ))}
              </DropdownMenu>
            </ButtonDropdown>
          </div>
          <div className="inline-action-btn mr-1">
            <i className="icons fa fa-check-circle mr-1" onClick={handleCheckStatus} />
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
          { status === 'ACTIVE' ? <FontAwesomeIcon icon={faUserCheck} /> : <FontAwesomeIcon icon={faUserTimes} />}
          {leadStatus[status] || 'Not Set'}
          <i className="icons cui-pencil mt-10 pl-2 pr-2 isHovering" style={!isHovering ? { color: 'white' } : {}} />
        </Label>
      )}
    </div>
  );
};

export default StatusInput;
