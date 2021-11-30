import React, { useState, useEffect, FC } from 'react';
import { ModalBody, ModalHeader, ModalFooter, Button, FormGroup, Input } from 'reactstrap';
import { ModalWindow } from 'site/components/sortable_list/styles';
import { ModalFormLabel } from '../common';
import CheckBox from '../check_box';
import SelectCustom from '../select_custom';

interface Media {
  title?: string,
  location?: string,
  category?: string,
}

interface EditProps {
  isModalOpen?: boolean,
  onModalToggle: () => void,
  onSubmit: (data: Media) => void,
  submitting?: boolean,
  isVideo?: boolean,
  indexToChange?: string,
  displayOnHomepage?: boolean,
  categories?: string[],
  data?: Media,
  onHomePageVideoChange?: (index: string) => void,
}

const EditMediaModal: FC<EditProps> = ({ isModalOpen, onModalToggle, onSubmit, submitting, data, categories, displayOnHomepage, indexToChange, onHomePageVideoChange, isVideo }) => {
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
    <ModalWindow isOpen={isModalOpen} toggle={onModalToggle} keyboard={!submitting} centered>
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
              disabled={submitting}
            />
          </FormGroup>
          <FormGroup>
            <ModalFormLabel for="videoDescription">Location</ModalFormLabel>
            <Input
              id="location"
              placeholder="Location"
              value={location}
              onChange={e => handleChange('location', e.target.value)}
              disabled={submitting}
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
          {isVideo &&
            <div className="mt-3">
              <CheckBox
                checked={!!displayOnHomepage}
                id={`video_home_page_check_${indexToChange}`}
                onChange={() => onHomePageVideoChange(indexToChange)}
                label="Display on homepage"
              />
            </div>
          }
        </ModalBody>
        <ModalFooter>
          <Button color="white" type="button" onClick={onModalToggle} disabled={submitting}>
            Cancel
          </Button>
          <Button color="primary" type="submit" disabled={submitting}>
            Save changes
          </Button>
        </ModalFooter>
      </form>
    </ModalWindow>
  );
};

EditMediaModal.defaultProps = {
  isModalOpen: false,
  submitting: false,
  data: {
    title: '',
    location: '',
    category: '',
  },
  categories: null,
  displayOnHomepage: false,
  indexToChange: null,
  isVideo: false,
};

export default EditMediaModal;
