import React, { FC, useState } from 'react';
import { FormAction, FormActionTooltip, CustomIcon } from 'dwell/views/Settings/styles';

interface ActionProps {
  actionType: string,
  handleClick: () => void,
  index: number,
  instanceType: string,
  disabled?: boolean,
}

const Action: FC<ActionProps> = ({ actionType, handleClick, index, instanceType, disabled }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => {
    setTooltipOpen(!tooltipOpen);
  };
  const onClick = () => {
    if (!disabled) handleClick();
  };
  return (
    <React.Fragment>
      <FormAction className="p-0" style={actionType !== 'edit' ? { marginRight: '-1px' } : {}} id={`${actionType}-${index}`} onClick={() => onClick()} $disabled={disabled} >
        {actionType === 'edit' ? <CustomIcon className="ri-pencil-line" /> : <CustomIcon className="ri-delete-bin-5-line" />}
      </FormAction>
      <FormActionTooltip
        placement="top"
        isOpen={tooltipOpen}
        target={`${actionType}-${index}`}
        toggle={() => toggle()}
      >
        {disabled ? 'System templates cannot be deleted' : `${actionType === 'edit' ? 'Edit' : 'Delete'} ${instanceType}`}
      </FormActionTooltip>
    </React.Fragment>);
};

export default Action;
