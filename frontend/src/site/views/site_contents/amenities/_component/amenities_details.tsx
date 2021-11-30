import React, { useState, useEffect, FC } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { Col, FormFeedback, Input } from 'reactstrap';
import { map, isEmpty } from 'lodash';
import CKEditor from 'ckeditor4-react';
import Select from 'react-select';
import { WhiteButton, PrimaryButton } from 'styles/common';
import { DetailItem, ButtonDrag, DetailsText, ButtonRemove, DetailsPlaceholder, ButtonOutline, FormAmenity, ButtonWrapper, CommonButton, SelectWrapper } from './styles';

interface AmenityDetails {
  id?: number,
  description: string,
  category: number
}

interface FormErrors {
  description?: string,
  category?: string,
}

interface AmenitiesDetailsProps {
  details: AmenityDetails[],
  columnId: number,
  sectionId: number,
  handleAddDetails: (data: AmenityDetails, columnId: number, sectionId: number) => void,
  onSortEndDetails: (oldIndex: number, newIndex: number, columnId: number, sectionId: number) => void,
  removeDetails: (index: number) => void,
  removeColumn: () => void,
  amenityCategories: { id: number, name: string }[],
  editDetails: (data: { target: { id: string, value: AmenityDetails } }) => void,
  hiddenColumn: boolean,
}

const DetailsItem = SortableElement(({ details, removeDetails, indexToChange, editDetail, formAddDetails }) => (
  <React.Fragment>
    <DetailItem hidden={!!formAddDetails}>
      <ButtonDrag><i className="ri-more-2-fill" /></ButtonDrag>
      <DetailsText dangerouslySetInnerHTML={{ __html: details.description }} title={(details.description || '').replace(/<[^>]*>/g, '')} />
      <ButtonRemove onClick={() => editDetail(indexToChange)}><i className="ri-pencil-line" /></ButtonRemove>
      <ButtonRemove className="ml-1" onClick={() => removeDetails(indexToChange)}><i className="ri-close-fill" /></ButtonRemove>
    </DetailItem>
    <DetailsPlaceholder hidden={!!formAddDetails} />
    {formAddDetails}
  </React.Fragment>
));

const DetailsList = SortableContainer(({ detailsList, removeDetails, editDetail, formAddDetails, editIndex }) => {
  const itemsWithOriginalIndex = detailsList.map((itm, i) => ({ ...itm, index: i }));
  return (
    <div>
      {map(itemsWithOriginalIndex, (value, index) => (
        <div key={index} className="position-relative">
          <DetailsItem
            index={value.index}
            details={value}
            indexToChange={value.index}
            removeDetails={removeDetails}
            editDetail={editDetail}
            formAddDetails={value.index === editIndex ? formAddDetails : null}
            disabled={editIndex !== null}
          />
        </div>
      ))}
    </div>
  );
});

const AmenitiesDetails: FC<AmenitiesDetailsProps> = ({ details, columnId, handleAddDetails, onSortEndDetails, removeDetails, sectionId, amenityCategories, removeColumn, editDetails, hiddenColumn }) => {
  const [detailsList, setList] = useState(details);
  const [isAddDetails, toggleAddDetails] = useState(false);
  const [amenityForm, setForm] = useState({ category: null, description: '' });
  const [editIndex, setEdit] = useState(null);
  const [formErrors, updateErrors] = useState({} as FormErrors);

  const setCursorType = type => document.body.style.cursor = type;

  const validate = () => {
    const errors = {} as FormErrors;

    if (isEmpty(amenityForm.description)) {
      errors.description = 'Please provide description';
    }

    if (!amenityForm.category) {
      errors.category = 'Please choose category';
    }
    updateErrors(errors);

    return errors;
  };

  const clearForm = (isAdd = false) => {
    setForm({ category: null, description: '' });
    toggleAddDetails(isAdd);
    setEdit(null);
    updateErrors({});
  };

  useEffect(() => {
    if (!(details || []).length) clearForm(true);
  }, []);

  useEffect(() => {
    setList(details);
  }, [details]);

  useEffect(() => {
    if (!isEmpty(formErrors)) validate();
  }, [amenityForm]);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    onSortEndDetails(oldIndex, newIndex, columnId, sectionId);
    setCursorType('default');
  };

  const editDetail = (index) => {
    toggleAddDetails(false);
    setEdit(index);
    setForm(detailsList[index]);
  };

  const addDetail = () => {
    if (isEmpty(validate())) {
      if (editIndex !== null) {
        editDetails({ target: { id: `amenitiesList[${sectionId}].amenitiesDetails[${columnId}][${editIndex}]`, value: amenityForm } });
      } else {
        handleAddDetails(amenityForm, columnId, sectionId);
      }
      clearForm();
    }
  };

  const onEditorChange = (evt, id) => {
    setForm({ ...amenityForm, [id]: evt.editor.getData() });
  };

  const formAddDetails = (
    <FormAmenity className={`${detailsList.length ? 'mt-10' : ''} ${editIndex !== null ? 'mb-10' : ''}`} editorInvalid={formErrors.description}>
      <SelectWrapper isDisabled={!amenityForm.category} invalid={formErrors.category}>
        <Select
          value={amenityCategories.find(el => el.id === amenityForm.category)}
          options={amenityCategories}
          onChange={selected => setForm({ ...amenityForm, category: selected.id })}
          getOptionLabel={option => option.name}
          getOptionValue={option => option.id}
          placeholder="Select Amenity Category"
        />
      </SelectWrapper>
      <Input hidden invalid={formErrors.category} />
      <FormFeedback>{formErrors.category}</FormFeedback>
      <div className="templates-editor amenities-editor mt-10">
        <CKEditor
          id={`editor-${sectionId}-${columnId}`}
          editorName="editor"
          className="editor"
          data={amenityForm.description || ''}
          onChange={e => onEditorChange(e, 'description')}
          config={{
            height: 300,
            extraAllowedContent: 'span(*)',
            scayt_autoStartup: true,
            placeholder: 'Add amenities details',
          }}
        />
      </div>
      <Input hidden invalid={formErrors.description} />
      <FormFeedback>{formErrors.description}</FormFeedback>
      <ButtonWrapper>
        <WhiteButton className="mr-2" onClick={() => clearForm()}>Cancel</WhiteButton>
        <PrimaryButton
          color="primary"
          onClick={addDetail}
        >{editIndex !== null ? 'Save' : 'Add'}
        </PrimaryButton>
      </ButtonWrapper>
    </FormAmenity>
  );

  if (hiddenColumn) return null;

  return (
    <Col xs={4}>
      <DetailsList
        detailsList={detailsList}
        onSortEnd={onSortEnd}
        onSortStart={() => setCursorType('grabbing')}
        distance={1}
        removeDetails={removeDetails}
        editDetail={editDetail}
        formAddDetails={formAddDetails}
        editIndex={editIndex}
      />
      {isAddDetails ?
        formAddDetails :
        <div className={`d-flex ${detailsList.length ? 'mt-10' : ''}`}>
          <ButtonOutline color="outline-primary" onClick={() => clearForm(true)}>
            <i className="ri-add-fill" />
            Add Amenity Item
          </ButtonOutline>
          {!(detailsList || []).length &&
            <CommonButton color="outline-danger" className="ml-10" onClick={removeColumn}>
              Remove List
            </CommonButton>}
        </div>}
    </Col>
  );
};

export default AmenitiesDetails;
