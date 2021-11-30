// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect, FC } from 'react';
import Html from 'slate-html-serializer';
import { isEmpty, get } from 'lodash';
import { connect, useSelector } from 'react-redux';
import { Value } from 'slate';
import styled, { css } from 'styled-components';
import { Input, FormFeedback, FormGroup, Label, ModalHeader, ModalBody, ModalFooter, Button, Row, Col } from 'reactstrap';
import Select from 'react-select';

import { WYSWYG, ImageUpload, UploadContainer } from 'site/components';
import { statusTypes, unitTypes } from 'site/constants';
import actions from 'site/actions';
import { rules } from 'site/common/validations';
import { PromotionProps } from 'src/interfaces';
import { ModalPromotion, CustomSelect, Divider, RemoveImage } from 'site/components/common';
import { handleFileUpload } from 'site/common/fileUpload';

const BLOCK_TAGS = {
  blockquote: 'quote',
  p: 'paragraph',
  pre: 'code',
};

const MARK_TAGS = {
  em: 'italic',
  strong: 'bold',
  u: 'underlined',
};

const ImageUploadContainer = styled.div`
  height: 100%;
  > div {
    padding: 10px;
    border: 1px solid ${props => props.theme.colors.colorbg03} !important;

    ${props => props.invalid && css`border-color: ${props.theme.colors.red} !important;`}
  }
`;

const slateRules = [
  {
    deserialize(el, next) {
      const type = BLOCK_TAGS[el.tagName.toLowerCase()];
      if (type) {
        return {
          object: 'block',
          type,
          data: {
            className: el.getAttribute('class'),
          },
          nodes: next(el.childNodes),
        };
      }
      return undefined;
    },
    serialize(obj, children) {
      if (obj.object === 'block') {
        switch (obj.type) {
          case 'code':
            return (
              <pre>
                <code>{children}</code>
              </pre>
            );
          case 'paragraph':
            return <p className={obj.data.get('className')}>{children}</p>;
          case 'quote':
            return <blockquote>{children}</blockquote>;
          default:
            return null;
        }
      }
      return undefined;
    },
  },
  {
    deserialize(el, next) {
      const type = MARK_TAGS[el.tagName.toLowerCase()];
      if (type) {
        return {
          object: 'mark',
          type,
          nodes: next(el.childNodes),
        };
      }
      return undefined;
    },
    serialize(obj, children) {
      if (obj.object === 'mark') {
        switch (obj.type) {
          case 'bold':
            return <strong>{children}</strong>;
          case 'italic':
            return <em>{children}</em>;
          case 'underlined':
            return <u>{children}</u>;
          default:
            return null;
        }
      }
      return undefined;
    },
  },
];

const html = new Html({ rules: slateRules });

const initialData = {
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            leaves: [],
          },
        ],
      },
    ],
  },
};

interface PromotionModalProps {
  promotion: PromotionProps,
  show: boolean,
  title: string,
  isSubmitting: boolean,
  updatePromotion: () => null,
  createPromotion: () => null,
  reload: () => null,
  onClose: () => null,
  floorPlans: { id: number | string, plan: string }[],
}

const initialState = {
  button_label: 'Select A Unit',
  promotion_title: 'Exclusive Offer',
  promotion_text: Value.fromJSON(initialData),
  is_active: true,
  floor_plans: [],
  unit_types: [],
  restriction: '',
};

const PromotionModal: FC<PromotionModalProps> = ({ promotion, updatePromotion, createPromotion, uploadImage, reload, show, title, onClose, isSubmitting, floorPlans }) => {
  const [formValues, setFormValues] = useState<PromotionProps>({ ...initialState });
  const [errors, setErrors] = useState<PromotionProps>({});
  const { longest_lease_term, shortest_lease_term } = useSelector(state => state.lease.durationPricing) || {};

  useEffect(() => {
    if (!isEmpty(promotion)) {
      const parsedText = Value.fromJSON(JSON.parse(promotion.promotion_text));
      setFormValues({
        ...promotion,
        promotion_text: parsedText,
        floor_plans: floorPlans.filter(el => promotion.floor_plans.includes(el.id)),
        unit_types: unitTypes.filter(el => promotion.unit_types.includes(el.value)),
      });
    } else {
      setFormValues({ ...initialState });
    }
  }, [promotion]);

  const selectionMonths = longest_lease_term && shortest_lease_term ? longest_lease_term - (shortest_lease_term - 1) : 15;

  const monthOptions = [...Array(selectionMonths).keys()].map((index) => {
    const noMonths = shortest_lease_term ? index + shortest_lease_term : index + 1;

    return { value: noMonths, label: `${noMonths} month${noMonths > 1 ? 's' : ''}` };
  });

  const applicableFloorPlanOptions = [
    { value: 'More than', label: ' More than' },
    { value: 'Less than', label: ' Less than' },
    { value: 'Exactly', label: 'Exactly' },
    { value: 'All months', label: 'All months' },
  ];

  const customUnitTypeStyle = {
    control: base => ({
      ...base,
      borderColor: errors.unit_types ? 'red' : '#d9deef',
    }),
  };

  const validate = () => {
    const formErrors = {} as PromotionProps;

    if (rules.isEmpty(formValues.name)) {
      formErrors.name = 'Please provide promotion name';
    }

    if (rules.isEmpty(formValues.image)) {
      formErrors.image = 'Please provide an image';
    }

    if (formValues.button_label.length > 65) {
      formErrors.button_label = 'Button label should be less than 65 letters';
    }

    if (formValues.promotion_text.document.text.length > 256) {
      formErrors.promotion_text = 'Promotion description should be less than 256 character';
    }

    if (!formValues.promotion_title) {
      formErrors.promotion_title = 'Please provide promotion headline';
    }

    if (!formValues.unit_types.length) {
      formErrors.unit_types = 'Please select a unit type';
    }

    setErrors(formErrors);
    return formErrors;
  };

  useEffect(() => {
    if (!isEmpty(errors)) {
      validate();
    }
  }, [formValues]);

  const onChange = ({ value }) => {
    const string = html.serialize(value);
    setFormValues({ ...formValues, promotion_text: value, promotion_html: string });
  };

  const handleInputChange = ({ target: { id, value } }) => {
    let resolvedValue = id === 'is_active' ? value === 'ACTIVE' : value;
    if (id === 'dollar_value') {
      resolvedValue = parseInt(value, 10);
    }
    setFormValues({ ...formValues, [id]: resolvedValue });
  };

  const fileUploadSuccessCB = ({ data: { url } }, name) => {
    handleInputChange({ target: { id: name, value: url } });
  };

  const handleRemoveImage = () => setFormValues({ ...formValues, image: '' });

  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedPromotion = {
      ...formValues,
      seo_title: formValues.name,
      seo_description: formValues.promotion_text.document.text || '',
      promotion_text: JSON.stringify(formValues.promotion_text.toJSON()),
      floor_plans: (formValues.floor_plans || []).map(el => el.id),
      unit_types: (formValues.unit_types || []).map(el => el.value),
    };

    if (isEmpty(validate())) {
      if (promotion.id) {
        updatePromotion(promotion.id, updatedPromotion).then(reload);
      } else {
        createPromotion(updatedPromotion).then(reload);
      }
    }
  };

  const unitTypeSelected = formValues.unit_types.map(el => el.bedrooms);
  const filteredFloorPlans = floorPlans ? floorPlans.filter(el => unitTypeSelected.includes(el.bedrooms)) : [];

  const handleSelectFloorPlans = (newValue, selected) => {
    const isSelectAll = get(selected, 'option.id', '') === 'all';

    setFormValues({ ...formValues, floor_plans: isSelectAll ? filteredFloorPlans : newValue });
  };

  const handleSelectUnitTypes = (newValue, selected) => {
    const isSelectAll = get(selected, 'option.value', '') === 'all';
    const unitType = (newValue || []).map(el => el.bedrooms);
    const floorPlan = formValues.floor_plans ? formValues.floor_plans.filter(el => unitType.includes(el.bedrooms)) : [];
    setFormValues({ ...formValues, unit_types: isSelectAll ? unitTypes : (newValue || []), floor_plans: floorPlan });
  };

  const floorPlansOptions = filteredFloorPlans.length ? [{ plan: 'Select All', id: 'all' }].concat(filteredFloorPlans) : [];
  const unitTypeOptions = [{ label: 'Select All', value: 'all' }].concat(unitTypes);
  const closeBtn = <button className="close" onClick={() => onClose()}>&times;</button>;
  const content = (
    <React.Fragment>
      <Row>
        <Col xs="12">
          <FormGroup>
            <Label className="w-100 uppercase" htmlFor="name">Name*</Label>
            <Input
              type="text"
              className="form-control mt-1"
              id="name"
              aria-describedby="name"
              placeholder="Enter name of promotion"
              value={formValues.name}
              onChange={handleInputChange}
              invalid={errors.name}
            />
            <FormFeedback>{errors.name}</FormFeedback>
          </FormGroup>
        </Col>
      </Row>
      <Divider />
      <Row>
        <Col xs="12">
          <FormGroup>
            <Label className="w-100 uppercase" htmlFor="promotion_title">Headline*</Label>
            <Input
              type="text"
              className="form-control mt-1"
              id="promotion_title"
              aria-describedby="promotion_title"
              placeholder="Enter headline of promotion"
              value={formValues.promotion_title}
              onChange={handleInputChange}
              invalid={errors.promotion_title}
            />
            <FormFeedback>{errors.promotion_title}</FormFeedback>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col xs="6">
          <FormGroup className="h-100">
            <Label className="w-100 uppercase" htmlFor="image">Image*</Label>
            {formValues.image ?
              <div className="position-relative">
                <RemoveImage onClick={handleRemoveImage}>
                  <i className="ri-delete-bin-line" />
                </RemoveImage>
                <img src={formValues.image} alt="" className="w-100" />
              </div> :
              <ImageUpload
                onDropAccepted={e => handleFileUpload(uploadImage, e, 'image', fileUploadSuccessCB)}
                dropzoneContainer={() => <ImageUploadContainer invalid={errors.image}>{UploadContainer({ label: 'Upload Image' })}</ImageUploadContainer>}
                dropzoneClassname="img-container"
              />}
            <Input hidden invalid={errors.image} />
            <FormFeedback>{errors.image}</FormFeedback>
          </FormGroup>
        </Col>
        <Col xs="6">
          <FormGroup className="h-100">
            <Label className="w-100 uppercase" htmlFor="image">Description</Label>
            <WYSWYG value={formValues.promotion_text} onChange={onChange} isInvalid={!!errors.promotion_text} />
            <Input hidden invalid={errors.promotion_text} />
            <FormFeedback>{errors.promotion_text}</FormFeedback>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col xs="6">
          <FormGroup>
            <Label className="w-100 uppercase" htmlFor="name">Button Title</Label>
            <Input
              type="text"
              className="form-control mt-1"
              id="button_label"
              aria-describedby="button_label"
              placeholder="Enter button label"
              value={formValues.button_label}
              onChange={handleInputChange}
              invalid={errors.button_label}
            />
            <FormFeedback>{errors.button_label}</FormFeedback>
          </FormGroup>
        </Col>
        <Col xs="6">
          <FormGroup className="mb-0">
            <Label>Status</Label>
            <CustomSelect
              value={formValues.is_active ? 'ACTIVE' : 'INACTIVE'}
              id="is_active"
              onChange={handleInputChange}
              className={`my-1 ${errors.status ? 'is-invalid form-control' : ''}`}
            >
              {Object.keys(statusTypes).map((type, key) =>
                <option key={key} value={type} defaultValue="ACTIVE">{type.charAt(0) + type.toLowerCase().slice(1)}</option>)}
            </CustomSelect>
            <FormFeedback>{errors.status}</FormFeedback>
          </FormGroup>
        </Col>
      </Row>
      <Divider />
      <Row>
        <Col xs="6">
          <FormGroup>
            <Label className="w-100 uppercase">Applicable Lease Duration</Label>
            <Row>
              <Col xs="6">
                <Select
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  backspaceRemovesValue={false}
                  value={{ value: formValues.lease_duration_modifier, label: formValues.lease_duration_modifier }}
                  options={applicableFloorPlanOptions}
                  onChange={value => setFormValues({ ...formValues, lease_duration_modifier: value.value })}
                />
              </Col>
              {
                formValues.lease_duration_modifier !== 'All months' &&
                <Col xs="6">
                  <Select
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    backspaceRemovesValue={false}
                    value={{ value: formValues.lease_duration, label: formValues.lease_duration }}
                    options={monthOptions}
                    onChange={value => setFormValues({ ...formValues, lease_duration: value.value })}
                  />
                </Col>
              }
            </Row>
          </FormGroup>
        </Col>
        <Col xs="6">
          <FormGroup>
            <Label className="w-100 uppercase" htmlFor="dollar_value">Dollar Value (Internal use only)*</Label>
            <Input
              type="number"
              className="form-control mt-1"
              id="dollar_value"
              aria-describedby="dollar_value"
              placeholder="$"
              value={formValues.dollar_value}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col xs="12">
          <FormGroup>
            <Label className="w-100 uppercase" htmlFor="restriction">Restrictions</Label>
            <Input
              type="textarea"
              className="form-control mt-1"
              id="restriction"
              aria-describedby="d"
              rows={1}
              placeholder="Enter Restrictions"
              value={formValues.restriction}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col xs="6">
          <FormGroup>
            <Label>Applicable Unit Type*</Label>
            <Select
              styles={
                customUnitTypeStyle
              }
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              backspaceRemovesValue={false}
              value={formValues.unit_types}
              options={unitTypeOptions}
              onChange={handleSelectUnitTypes}
              isMulti
            />
          </FormGroup>
        </Col>
        <Col xs="6">
          <FormGroup>
            <Label>Applicable Floor Plans</Label>
            <Select
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              backspaceRemovesValue={false}
              getOptionLabel={option => option.plan}
              getOptionValue={option => option.id}
              value={formValues.floor_plans}
              options={floorPlansOptions}
              onChange={handleSelectFloorPlans}
              isMulti
            />
          </FormGroup>
        </Col>
      </Row>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <ModalPromotion isOpen={show} size="md" toggle={onClose} centered>
        <ModalHeader close={closeBtn}>{title}</ModalHeader>
        <ModalBody>
          {content}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={onClose}>Cancel</Button>
          <Button color="primary" onClick={handleSubmit} disabled={isSubmitting}>Save</Button>
        </ModalFooter>
      </ModalPromotion>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  isSubmitting: state.promotion.isSubmitting,
  floorPlans: state.property.property.floor_plans,
});

export default connect(
  mapStateToProps,
  {
    ...actions.promotion,
    ...actions.pageData,
  },
)(PromotionModal);
