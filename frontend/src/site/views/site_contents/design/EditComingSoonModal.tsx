import React, { useState, useEffect, FC } from 'react';
import { ModalBody, ModalHeader, ModalFooter, Button, FormGroup, Input } from 'reactstrap';
import { ModalWindow } from 'site/components/sortable_list/styles';
import { ModalFormLabel } from '../../../components/common';
import SelectCustom from '../../../components/select_custom';

interface ComingSoonMedia {
  title?: string,
  location?: string,
  category?: string,
}

interface EditProps {
  isModalOpen?: boolean,
  onModalToggle: () => void,
  onSubmit: (data: ComingSoonMedia) => void,
  data: ComingSoonMedia,
  categories?: string[],
}

const EditComingSoonModal: FC<EditProps> = ({ isModalOpen, onModalToggle, onSubmit, data, categories }) => {
  const [editMediaState, updateMedia] = useState({
    title: data.title,
    location: data.location,
    category: data.category,
  });

  useEffect(() => {
    updateMedia({
      ...editMediaState,
      title: data.title,
      location: data.location,
      category: data.category,
    });
  }, [data]);

  const handleChange = (key, value) => {
    updateMedia({ ...editMediaState, [key]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { title, location, category } = editMediaState;

    onSubmit({ title, location, category });
    updateMedia({ ...editMediaState, title: '', location: '', category: '' });
    onModalToggle();
  };

  const { title, location, category } = editMediaState;

  return (
    <ModalWindow isOpen={isModalOpen} toggle={onModalToggle} centered>
      <ModalHeader toggle={onModalToggle}>
        Edit Media Details
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <ModalFormLabel for="title">Title</ModalFormLabel>
            <Input
              type="text"
              id="title"
              placeholder="Title"
              value={title}
              onChange={e => handleChange('title', e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <ModalFormLabel for="videoDescription">Location</ModalFormLabel>
            <Input
              id="location"
              placeholder="Location"
              value={location}
              onChange={e => handleChange('location', e.target.value)}
            />
          </FormGroup>
          <ModalFormLabel>Category</ModalFormLabel>
          <SelectCustom
            value={category}
            options={categories}
            id="images"
            disabled={false}
            handleInputChange={e => handleChange('category', e.target.value)}
            placeholderDisplay
          />
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

EditComingSoonModal.defaultProps = {
  isModalOpen: false,
};

export default EditComingSoonModal;
