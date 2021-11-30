import React, { useEffect, useState } from 'react';
import { Row, Col, Input, CardBody, CardFooter, FormGroup } from 'reactstrap';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import cn from 'classnames';
import { CheckBox, ImageUpload } from 'site/components';
import { PrimaryButton, WhiteButton } from 'styles/common';
import { isEmpty } from 'lodash';
import { FloorPlanCard } from '../common';
import { ImageGalleryItem, ButtonAction, ButtonContainer, Gallery, ListGroup, ListGroupItem, UnavailablePlan, AddFloorPlanCardBody } from './styles';
import ImageCarousel from './_carousel';

interface ErrorProps {
  available: boolean,
  description: boolean,
  bedrooms: boolean,
  bathrooms: boolean,
}

const defaultFormValues = {
  images: [], available: null, bathrooms: null, bedrooms: null, description: null, squareFootage: null, minRent: null, maxRent: null, isVisible: true, show_sqft: false, isNew: false };
const FloorPlanItem = ({ onRemoveClick, indexToChange, plan, onInputChange, onDropAccepted, deleteFloorPlan, saveFloorPlan, cancelFloorPlan }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isEditing, setEditingState] = useState(false);
  const [formValues, setFormValues] = useState(defaultFormValues);
  const [errors, setErrors] = useState({} as ErrorProps);
  const unitString = formValues.available <= 1 ? 'unit' : 'units';
  const available = !formValues.available ? 'Join Waitlist' : `${formValues.available} ${unitString} available`;
  const images = formValues.images.length ? formValues.images : [{ src: '/static/images/no-image.jpg' }];

  const onChange = ({ target: { id, value } }) => {
    let newValue = value;
    if (newValue && ['available', 'bedrooms', 'bathrooms'].some(i => id.includes(i))) newValue = parseInt(newValue, 10);
    if (newValue && ['minRent', 'maxRent', 'squareFootage'].some(i => id.includes(i))) newValue = parseFloat(newValue);
    if (Number.isNaN(newValue)) newValue = null;
    let showSqft = formValues.show_sqft;
    if (plan.isNew && id === 'squareFootage' && value) {
      showSqft = true;
    }
    setFormValues({ ...formValues, [id]: newValue, show_sqft: showSqft });
  };

  const onKeyPress = (event) => {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  };

  const onCancel = () => {
    cancelFloorPlan();
    setEditingState(false);
    setFormValues(plan);
  };

  useEffect(() => {
    if (plan) {
      const values = { ...plan };
      if (plan.isNew) {
        setEditingState(true);
        delete values.isNew;
      }
      setFormValues(values);
    }
  }, [plan]);

  const validate = () => {
    const error = {} as ErrorProps;
    if (formValues.available !== 0 && !formValues.available) error.available = true;
    if (formValues.bedrooms === null || formValues.bedrooms < 0 || formValues.bedrooms > 5) error.bedrooms = true;
    if (formValues.bedrooms === null || formValues.bathrooms < 1 || formValues.bathrooms > 5) error.bathrooms = true;
    if (!formValues.description) error.description = true;
    setErrors(error);
    return isEmpty(error);
  };

  const onSave = () => {
    if (validate()) {
      setEditingState(false);
      onInputChange(`allPlans[${indexToChange}]`, formValues);
      saveFloorPlan();
    }
  };

  const onCheckboxSave = (id, value) => {
    if (isEditing) {
      setFormValues({ ...formValues, [id]: value });
    } else {
      onInputChange(`allPlans[${indexToChange}].${id}`, value);
      saveFloorPlan();
    }
  };

  return (
    <React.Fragment>
      <ImageGalleryItem>
        <ImageCarousel images={images} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
        <ButtonContainer>
          <ImageUpload
            onDropAccepted={(e) => {
              onDropAccepted(e, `allPlans[${indexToChange}].images`, true).then(() => {
                setActiveIndex(formValues.images.length - 1);
              });
            }}
            title="Upload image"
            dropzoneContainer={() => <ButtonAction><i className="ri-edit-2-fill" /></ButtonAction>}
          />
          {!!formValues.images.length && <ButtonAction onClick={() => onRemoveClick(indexToChange, activeIndex)}><i className="ri-delete-bin-line" /></ButtonAction>}
        </ButtonContainer>
      </ImageGalleryItem>
      <CardBody>
        <ListGroup>
          <ListGroupItem>
            <span>Model</span>
            <span className={cn({ editing: isEditing })}>
              {isEditing ?
                <Input id="description" value={formValues.description} onChange={onChange} invalid={errors.description} />
                : formValues.description}
            </span>
          </ListGroupItem>
          <ListGroupItem>
            <span>Units Available</span>
            <span className={cn({ editing: isEditing })}>
              {isEditing ?
                <Input id="available" onKeyPress={onKeyPress} value={formValues.available} onChange={onChange} invalid={errors.available} />
                : available}
            </span>
          </ListGroupItem>
          <ListGroupItem>
            <span>Bed/Bath</span>
            {isEditing ? (
              <span className="beds-and-baths">
                <Input id="bedrooms" onKeyPress={onKeyPress} value={formValues.bedrooms} onChange={onChange} invalid={errors.bedrooms} />
                <span className="ml-1 mr-1">/</span>
                <Input id="bathrooms" onKeyPress={onKeyPress} value={formValues.bathrooms} onChange={onChange} invalid={errors.bathrooms} />
              </span>
            ) : <span>{formValues.bedrooms}/{formValues.bathrooms}</span>}
          </ListGroupItem>
          <ListGroupItem>
            <span>Sq./Ft.</span>
            <span className={cn({ editing: isEditing })}>
              {isEditing ?
                <Input id="squareFootage" onKeyPress={onKeyPress} value={formValues.squareFootage} onChange={onChange} />
                : formValues.squareFootage}
            </span>
          </ListGroupItem>
        </ListGroup>
      </CardBody>
      <CardFooter className="text-center">
        {isEditing ? (
          <>
            <FormGroup>
              <span>$</span>
              <Input
                id="minRent"
                name="search"
                onKeyPress={onKeyPress}
                value={formValues.minRent}
                placeholder="Min"
                className="mr-2 mb-0"
                onChange={onChange}
              />
            </FormGroup>
            <FormGroup>
              <span>$</span>
              <Input
                id="maxRent"
                name="search"
                onKeyPress={onKeyPress}
                className="mb-0"
                value={formValues.maxRent}
                placeholder="Max"
                onChange={onChange}
              />
            </FormGroup>
          </>
        ) : (
          <>
            {formValues.available ? (
              <>
                {!formValues.minRent && !formValues.maxRent && <FormGroup>Call for pricing</FormGroup>}
                {!!formValues.minRent && !!formValues.maxRent && formValues.minRent === formValues.maxRent && <FormGroup>${formValues.minRent}</FormGroup>}
                {!!formValues.minRent && formValues.minRent !== formValues.maxRent && <FormGroup>${formValues.minRent}</FormGroup>}
                {!!formValues.maxRent && formValues.minRent !== formValues.maxRent && <FormGroup>${formValues.maxRent}</FormGroup>}
              </>
            ) : (
              <UnavailablePlan>Call for pricing</UnavailablePlan>
            )}
          </>
        )}
      </CardFooter>
      {!plan.isNew && (
        <CardFooter>
          <Row>
            <Col xs="6 mt-10">
              <CheckBox
                id={`allPlans[${indexToChange}].isVisible`}
                label="Active"
                checked={formValues.isVisible}
                onChange={() => onCheckboxSave('isVisible', !formValues.isVisible)}
                labelClassName="label-checkbox"
              />
            </Col>
            <Col xs="6 mt-10">
              <CheckBox
                id={`allPlans[${indexToChange}].show_sqft`}
                label="Show Square Footage"
                checked={formValues.show_sqft}
                onChange={() => onCheckboxSave('show_sqft', !formValues.show_sqft)}
                labelClassName="label-checkbox"
              />
            </Col>
          </Row>
        </CardFooter>
      )}
      <CardFooter className="justify-content-end">
        {isEditing ? (
          <>
            <PrimaryButton className="mr-2" onClick={onSave}>Save</PrimaryButton>
            <WhiteButton onClick={onCancel}>Cancel</WhiteButton>
          </>
        ) :
          <>
            <WhiteButton className="mr-2" onClick={() => deleteFloorPlan(indexToChange)}>Delete</WhiteButton>
            <WhiteButton onClick={() => setEditingState(true)}>Edit</WhiteButton>
          </>}
      </CardFooter>
    </React.Fragment>
  );
};

const SortableItem = SortableElement(props => <FloorPlanItem {...props} />);

const SortableFloorPlanList = SortableContainer(({ plans, onRemoveClick, onDropAccepted, onInputChange, addFloorPlan, deleteFloorPlan, saveFloorPlan, cancelFloorPlan }) => (
  <Gallery>
    {plans.map((plan, index) => (
      <FloorPlanCard key={index}>
        <SortableItem
          onInputChange={onInputChange}
          index={index}
          indexToChange={index}
          plan={plan}
          onRemoveClick={onRemoveClick}
          onDropAccepted={onDropAccepted}
          deleteFloorPlan={deleteFloorPlan}
          saveFloorPlan={saveFloorPlan}
          cancelFloorPlan={cancelFloorPlan}
        />
      </FloorPlanCard>
    ))}
    {!plans.some(plan => plan.isNew) && (
      <FloorPlanCard>
        <AddFloorPlanCardBody>
          <PrimaryButton onClick={() => addFloorPlan()}>
            <span className="mr-2">+</span> Add Floor Plan
          </PrimaryButton>
        </AddFloorPlanCardBody>
      </FloorPlanCard>
    )}
  </Gallery>
));

SortableFloorPlanList.defaultProps = {
  onInputChange: null,
};

export default SortableFloorPlanList;
