import React, { Fragment, useState, FC } from 'react';
import { Button, ModalBody, ModalHeader, UncontrolledTooltip, ModalFooter } from 'reactstrap';
import { ModalWindow, IconAction } from 'site/components/common';
import { DetailResponse } from 'src/interfaces';

interface DeleteModalProps {
  name: string,
  message?: boolean | React.ReactNode,
  onDelete: () => Promise<DetailResponse>,
  index: number,
  type: string,
}

const DeleteModal: FC<DeleteModalProps> = ({ name, message, onDelete, index, type }) => {
  const [isModalOpen, toggleModal] = useState(false);

  const handleDelete = () => {
    onDelete().then(() => {
      toggleModal(!isModalOpen);
    });
  };

  return (
    <Fragment>
      <IconAction onClick={() => toggleModal(!isModalOpen)} id={`removeCategory-${index}`}>
        <i className="ri-delete-bin-5-line" />
      </IconAction>
      <UncontrolledTooltip placement="left" target={`removeCategory-${index}`}>
        Delete
      </UncontrolledTooltip>

      <ModalWindow isOpen={isModalOpen} toggle={() => toggleModal(!isModalOpen)} centered>
        <ModalHeader toggle={() => toggleModal(!isModalOpen)}>
          Delete {type}
        </ModalHeader>
        <ModalBody>
          Are you sure you wish to delete {type.toLowerCase()} {name}?
          {message}
          {message && <br />}
        </ModalBody>
        <ModalFooter>
          <Button color="white" onClick={() => toggleModal(!isModalOpen)}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleDelete}>
            Delete
          </Button>
        </ModalFooter>
      </ModalWindow>
    </Fragment >
  );
};

export default DeleteModal;
