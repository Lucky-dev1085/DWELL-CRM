import { ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { connect } from 'react-redux';
import React, { FC } from 'react';
import actions from 'site/actions';
import { ModalText } from 'site/components/common';
import { ModalWindow } from 'site/components/confirm_action_modal/styles';

interface ConfirmProps {
  text: string,
  title: string,
  show: boolean,
  onConfirm: () => void,
  onClose: () => void,
  itemName?: string,
  disabled?: boolean,
  content?: JSX.Element,
}

const ConfirmActionModal: FC<ConfirmProps> = (props) => {
  const { show, onConfirm, onClose, title, text, content, itemName, disabled } = props;

  return (
    <ModalWindow isOpen={show} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>
        {title}
      </ModalHeader>
      <ModalBody>
        <ModalText>
          {text}
          <strong>{` ${itemName}`}</strong>
          ?
          {content}
        </ModalText>
      </ModalBody>
      <ModalFooter>
        <Button color="white" onClick={onClose}>
          Cancel
        </Button>
        <Button color="danger" onClick={onConfirm} disabled={disabled}>
          Confirm delete
        </Button>
      </ModalFooter>
    </ModalWindow>
  );
};

ConfirmActionModal.defaultProps = {
  content: null,
  itemName: '',
  disabled: false,
};

export default connect(
  null,
  {
    ...actions.pageData,
  },
)(ConfirmActionModal);
