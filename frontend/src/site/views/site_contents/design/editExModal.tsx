import React, { useState, FC, useEffect } from 'react';
import { ModalBody, ModalHeader, ModalFooter, Button, FormGroup, Input } from 'reactstrap';
import { ModalWindow } from 'site/components/sortable_list/styles';
import { ModalFormLabel } from '../../../components/common';

interface EditProps {
  isModalOpen?: boolean,
  onModalToggle: () => void,
  onSubmit: (data: string) => void,
  data: string,
}

const EditExModal: FC<EditProps> = ({ isModalOpen, onModalToggle, onSubmit, data }) => {
  const [exTxt, setExTxt] = useState(data);

  useEffect(() => {
    setExTxt(data);
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(exTxt);
    onModalToggle();
  };

  const handleChange = (value) => {
    setExTxt(value);
  };

  return (
    <ModalWindow isOpen={isModalOpen} toggle={onModalToggle} centered>
      <ModalHeader toggle={onModalToggle}>
        Edit Text
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            {/* <ModalFormLabel for="videoDescription">Text</ModalFormLabel> */}
            <Input
              id="text"
              placeholder="Text"
              value={exTxt}
              onChange={e => handleChange(e.target.value)}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="white" type="button" onClick={onModalToggle}>
            Cancel
          </Button>
          <Button color="primary" type="submit">
            Save changes
          </Button>
        </ModalFooter>
      </form>
    </ModalWindow>
  );
};

EditExModal.defaultProps = {
  isModalOpen: false,
};

export default EditExModal;
