import React, { useState, useEffect, FC } from 'react';
import { Row, Col, CardHeader, CardBody, FormGroup, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { get, isEmpty, set, cloneDeep, isEqual } from 'lodash';
import { toast, ToastOptions } from 'react-toastify';
import { WithContext as ReactTags } from 'react-tag-input';
import CKEditor from 'ckeditor4-react';
import 'react-tagsinput/react-tagsinput.css';
import { arrayMove } from 'react-sortable-hoc';

import { sectionTypes, toastOptions, defaultAmenitiesSection } from 'site/constants';

import actions from 'site/actions';
import { FormItem, ImageUpload, SeoFormSection, CheckBox, UploadContainer, ConfirmActionModal } from 'site/components';
import { CardBasic, CardTitle, FormLabel, ImagePreview, ActionCardText, CardSiteLogo, ButtonPrimary } from 'site/components/common';
import { TagsWrapper } from 'site/views/site_contents/amenities/styles';
import { DetailResponse, AmenitiesPageData } from 'src/interfaces';
import { handleFileUpload } from 'site/common/fileUpload';
import { RemoveImage } from 'site/views/site_contents/styles';
import AmenitiesDetails from './amenities_details';
import { DetailsWrapper } from './styles';

const KeyCodes = {
  enter: 13,
};

const delimiters = [KeyCodes.enter];
const persistSection = ['Apartment Features', 'Community Amenities'];
CKEditor.editorUrl = `${window.location.origin}/static/ckeditor/ckeditor.js`;

interface ContentProps extends RouteComponentProps {
  pageData?: { values?: AmenitiesPageData },
  updatePageData: (type: string, data: { values?: AmenitiesPageData }, msg?: () => void) => Promise<DetailResponse>,
  setChangedState: (state: boolean) => void,
  setSubmissionState: (isClick: boolean) => void,
  submitClicked: boolean,
  formChanged: boolean,
  uploadImage: (image: Blob, successCB?: (response: { data: { url } }) => void) => void,
  showCategories: boolean,
  page: number,
  subCategories: { firstRibbon?: { tags: string[] } }[],
  handleChange: (data: { target: { id?: string, name?: string, value?: string | number, checked?: boolean } }) => void,
  clickedType?: { type: string },
  handleError?: (isError: boolean) => void,
  getAmenityCategories: () => void,
  amenityCategories: { id: number, name: string }[],
}

const Content: FC<ContentProps> = ({ pageData, updatePageData, uploadImage, setChangedState, setSubmissionState, submitClicked, formChanged, page, showCategories,
  handleChange, subCategories, clickedType, handleError, getAmenityCategories, amenityCategories }) => {
  const [formValues, setFormValues] = useState(cloneDeep(pageData.values));
  const [removeAmenities, setRemoveAmenities] = useState({ name: '', id: null });
  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [seoError, toggleError] = useState(false);

  useEffect(() => {
    getAmenityCategories();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const handleErrors = (error) => {
    toggleError(!isEmpty(error));
    if (isEmpty(error)) setSubmissionState(false);
    handleError(!isEmpty(errors) || !isEmpty(error));
  };

  const validate = () => {
    const formErrors = {};

    get(formValues, 'amenitiesList', []).forEach((item, index) => {
      if (!item.name) set(formErrors, `amenitiesList.[${index}].name`, 'Please provide section name');
    });
    if (isEmpty(formErrors)) setSubmissionState(false);
    setErrors(formErrors);
    handleError(!isEmpty(formErrors) || seoError);
    return formErrors;
  };

  useEffect(() => {
    if (!isEmpty(errors)) validate();
  }, [formValues]);

  const preparedFormValues = () => {
    const form = cloneDeep(formValues);

    get(form, 'amenitiesList', []).forEach((el, i) => {
      let data = get(el, 'amenitiesDetails', []);
      data = data.filter((e, ind) => !get(el, `columnHidden[${ind}]`));
      set(form, `amenitiesList[${i}].amenitiesDetails`, data);
      set(form, `amenitiesList[${i}].columnHidden`, []);
    });

    return form;
  };

  const handleSubmit = () => {
    setSubmissionState(true);

    if (isEmpty(validate()) && !seoError) {
      updatePageData(sectionTypes.AMENITIES, { values: preparedFormValues() }).then(() => {
        setChangedState(false);
        setSubmissionState(false);
      });
    }
  };

  useEffect(() => {
    set(formValues, 'showCategories', showCategories);
    setFormValues(formValues);
  }, [showCategories]);

  const successMessage = () => toast.success('Subcategories was update', toastOptions as ToastOptions);

  useEffect(() => {
    if (!isEqual(subCategories, formValues.subCategories)) {
      set(formValues, 'subCategories', subCategories);
      setFormValues(formValues);
      updatePageData(sectionTypes.AMENITIES, { values: formValues }, successMessage)
        .then(() => {
          setChangedState(false);
        });
    }
  }, [subCategories]);

  const triggerSaveRequired = () => {
    if (!formChanged) setChangedState(true);
  };

  const onChange = ({ target: { id, value, checked = false } }) => {
    const resolvedValue = id === 'map.isShown' || id.includes('isVisible') ? checked : value;
    set(formValues, id, resolvedValue);
    triggerSaveRequired();
    setFormValues({ ...formValues });
  };

  const handleDelete = (i, id) => {
    const data = get(formValues, id).filter((tag, index) => index !== i);
    set(formValues, id, data);
    triggerSaveRequired();
    setFormValues({ ...formValues });
  };

  const handleAddition = (tag, id) => {
    const data = get(formValues, id, []);
    data.push(id === 'map.list' ? { text: tag.text } : tag.text);
    set(formValues, id, data);
    triggerSaveRequired();
    setFormValues({ ...formValues });
  };

  const handleDrag = (tag, currPos, newPos, id) => {
    const data = get(formValues, id).slice();
    data.splice(currPos, 1);
    data.splice(newPos, 0, id === 'map.list' ? { text: tag.text } : tag.text);
    set(formValues, id, data);
    triggerSaveRequired();
    setFormValues({ ...formValues });
  };

  const fileUploadSuccessCB = ({ data: { url } }, name) => {
    set(formValues, name, url);
    setFormValues(formValues);
    updatePageData(sectionTypes.AMENITIES, { values: formValues }, () => toast.success('Image uploaded', toastOptions as ToastOptions));
  };

  const handleUpload = (file, name) => {
    handleFileUpload(uploadImage, file, name, fileUploadSuccessCB);
  };

  const handleAddSection = () => {
    const data = get(formValues, 'amenitiesList', []);
    data.push({ ...defaultAmenitiesSection, amenitiesDetails: [[]] });
    set(formValues, 'amenitiesList', data);
    triggerSaveRequired();
    setFormValues({ ...formValues });
  };

  const handleRemoveSection = (item, index) => {
    setRemoveAmenities({ name: get(item, 'name', ''), id: index });
    toggleConfirmModal(true);
  };

  const discardChanges = () => {
    setChangedState(false);
    setFormValues(cloneDeep(pageData.values));
    setSubmissionState(false);
  };

  useEffect(() => {
    if (clickedType.type === 'submit') {
      handleSubmit();
    }
    if (clickedType.type === 'discard') {
      discardChanges();
    }
  }, [clickedType]);

  const addDetailsColumn = (index) => {
    const data = get(formValues, `amenitiesList[${index}].amenitiesDetails`, []);
    data.push([]);
    set(formValues, `amenitiesList[${index}].amenitiesDetails`, data);
    triggerSaveRequired();
    setFormValues({ ...formValues });
  };

  const removeDetailsColumn = (index, id) => {
    const data = get(formValues, id, []);
    set(data, `[${index}]`, true);
    set(formValues, id, data);
    triggerSaveRequired();
    setFormValues({ ...formValues });
  };

  const handleAddDetails = (detailsData, columnId, sectionId) => {
    const data = get(formValues, `amenitiesList[${sectionId}].amenitiesDetails[${columnId}]`, []);
    data.push(detailsData);
    set(formValues, `amenitiesList[${sectionId}].amenitiesDetails[${columnId}]`, data);
    triggerSaveRequired();
    setFormValues({ ...formValues });
  };

  const onSortEndDetails = (oldIndex, newIndex, columnId, sectionId) => {
    set(formValues, `amenitiesList[${sectionId}].amenitiesDetails[${columnId}]`, arrayMove(get(formValues, `amenitiesList[${sectionId}].amenitiesDetails[${columnId}]`, []), oldIndex, newIndex));
    setFormValues({ ...formValues });
    triggerSaveRequired();
  };

  return (
    <React.Fragment>
      <SeoFormSection
        onChange={onChange}
        title={get(formValues, page >= 0 ? `subCategories.${page}.seo.title` : 'seo.title', '')}
        titleId={page >= 0 ? `subCategories.${page}.seo.title` : 'seo.title'}
        description={get(formValues, page >= 0 ? `subCategories.${page}.seo.description` : 'seo.description', '')}
        descriptionId={page >= 0 ? `subCategories.${page}.seo.description` : 'seo.description'}
        handleErrors={handleErrors}
        submitIsClicked={submitClicked}
      />
      <CardBasic>
        <CardBody className="p-3">
          <CheckBox
            id="showCategories"
            label="Display Category Page"
            checked={showCategories}
            onChange={handleChange}
          />
        </CardBody>
      </CardBasic>

      <Row>
        <Col xs="12">
          <CardBasic>
            <CardHeader>
              <CardTitle>Header Ribbon</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col xs="12">
                  <FormGroup>
                    <FormItem
                      name="title"
                      title="Title"
                      id={page >= 0 ? `subCategories.${page}.pageTitle` : 'pageTitle'}
                      value={get(formValues, page >= 0 ? `subCategories.${page}.pageTitle` : 'pageTitle', '')}
                      handleOnChange={onChange}
                      section="AMENITIES"
                    />
                  </FormGroup>
                </Col>
                <Col xs="2">
                  <ImagePreview>
                    <img src={get(formValues, 'breadcrumbsBar.image', '') || '/static/images/no-image.jpg'} alt="breadcrumbs" />
                  </ImagePreview>
                </Col>
                <Col xs="2">
                  <ImageUpload
                    onDropAccepted={e => handleUpload(e, 'breadcrumbsBar.image')}
                    title="Upload Image"
                    dropzoneContainer={UploadContainer}
                    dropzoneClassname="h-100"
                  />
                </Col>
              </Row>
            </CardBody>
          </CardBasic>
        </Col>
      </Row>
      <Row>
        <Col xs="12">
          <CardBasic>
            <CardHeader>
              <CardTitle>Page Introduction</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                {page >= 0 ?
                  <React.Fragment>
                    <Col xs="2">
                      <ImagePreview>
                        <img src={get(formValues, `subCategories.${page}.image`, '') || '/static/images/no-image.jpg'} alt="community" />
                      </ImagePreview>
                    </Col>
                    <Col xs="2">
                      <ImageUpload
                        onDropAccepted={e => handleUpload(e, `subCategories.${page}.image`)}
                        title="Upload Image"
                        dropzoneContainer={UploadContainer}
                        dropzoneClassname="h-100"
                      />
                    </Col>
                  </React.Fragment> : null
                }
                <Col xs="12" className={page >= 0 ? 'mt-3' : ''}>
                  <FormGroup>
                    <FormItem
                      name={page >= 0 ? 'text' : 'title'}
                      title={page >= 0 ? 'Text' : 'Title'}
                      id={page >= 0 ? `subCategories.${page}.text` : 'firstRibbon.title'}
                      value={get(formValues, page >= 0 ? `subCategories.${page}.text` : 'firstRibbon.title', '')}
                      handleOnChange={onChange}
                      isTextArea
                      textAreaRow={page >= 0 ? 3 : 2}
                      showTooltip
                      section="AMENITIES"
                      sectionClassName={page >= 0 ? 'mb-input-none' : ''}
                    />
                  </FormGroup>
                </Col>
                {page === -1 && (
                  <Col xs="12">
                    <FormGroup>
                      <FormItem
                        id="firstRibbon.text"
                        name="text"
                        handleOnChange={onChange}
                        title="Text"
                        section="AMENITIES"
                        value={get(formValues, 'firstRibbon.text', '')}
                        isTextArea
                        textAreaRow={3}
                        showTooltip
                        sectionClassName="mb-input-none"
                      />
                    </FormGroup>
                  </Col>
                )}
              </Row>
            </CardBody>
          </CardBasic>
        </Col>
      </Row>
      {page >= 0 ?
        <Row>
          <Col xs="12">
            <CardBasic>
              <CardHeader>
                <CardTitle>First Ribbon</CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col xs="2">
                    <ImagePreview>
                      <img src={get(formValues, `subCategories.${page}.firstRibbon.image`, '') || '/static/images/no-image.jpg'} alt="community" />
                    </ImagePreview>
                  </Col>
                  <Col xs="2">
                    <ImageUpload
                      onDropAccepted={e => handleUpload(e, `subCategories.${page}.firstRibbon.image`)}
                      title="Upload Image"
                      dropzoneContainer={UploadContainer}
                      dropzoneClassname="h-100"
                    />
                  </Col>
                  <Col xs="12" className="mt-3">
                    <FormGroup>
                      <FormItem
                        id={`subCategories.${page}.firstRibbon.title`}
                        name="title"
                        value={get(formValues, `subCategories.${page}.firstRibbon.title`, '')}
                        title="Title"
                        handleOnChange={onChange}
                        section="AMENITIES"
                        selector="subCategories.firstRibbon.title"
                        showTooltip
                      />
                    </FormGroup>
                  </Col>
                  <Col xs="12">
                    <FormGroup>
                      <FormItem
                        id={`subCategories.${page}.firstRibbon.text`}
                        name="text"
                        value={get(formValues, `subCategories.${page}.firstRibbon.text`, '')}
                        title="Text"
                        handleOnChange={onChange}
                        section="AMENITIES"
                        selector="subCategories.firstRibbon.text"
                        isTextArea
                        showTooltip
                      />
                    </FormGroup>
                  </Col>
                  <Col xs="12" className="mt-3">
                    <TagsWrapper>
                      <ReactTags
                        tags={formValues.subCategories[page].firstRibbon.tags.map(item => ({ id: item, text: item }))}
                        handleDelete={i => handleDelete(i, `subCategories.${page}.firstRibbon.tags`)}
                        handleAddition={tag => handleAddition(tag, `subCategories.${page}.firstRibbon.tags`)}
                        handleDrag={(tag, currPos, newPos) => handleDrag(tag, currPos, newPos, `subCategories.${page}.firstRibbon.tags`)}
                        delimiters={delimiters}
                      />
                    </TagsWrapper>
                  </Col>
                </Row>
              </CardBody>
            </CardBasic>
          </Col>
        </Row> :
        <React.Fragment>
          {get(formValues, 'amenitiesList', []).map((item, index) => {
            const isPersistSection = index < 2 && persistSection.includes(get(item, 'name', ''));
            const countHiddenColumn = get(formValues, `amenitiesList[${index}].columnHidden`, []).filter(el => el).length;
            const countColumn = get(formValues, `amenitiesList[${index}].amenitiesDetails`, []).length - countHiddenColumn;
            return (
              <Row key={index}>
                <Col xs="12">
                  <CardSiteLogo>
                    <CardHeader>
                      <CheckBox
                        id={`amenitiesList[${index}].isVisible`}
                        label="Active"
                        checked={get(item, 'isVisible', '')}
                        onChange={onChange}
                      />
                      {!isPersistSection &&
                        <ActionCardText onClick={() => handleRemoveSection(item, index)}>
                          <i className="ri-delete-bin-line" />
                          Remove Section
                        </ActionCardText>}
                    </CardHeader>
                    <CardBody>
                      <Row>
                        <Col xs="12">
                          <FormGroup>
                            <FormItem
                              id={`amenitiesList[${index}].name`}
                              name="text"
                              title="Section Name*"
                              section="AMENITIES"
                              handleOnChange={onChange}
                              value={get(item, 'name', '')}
                              disabled={isPersistSection}
                              invalid={get(errors, `amenitiesList.[${index}].name`, '')}
                            />
                          </FormGroup>
                        </Col>
                        <Col xs="12">
                          <FormLabel htmlFor="name">Upload Image</FormLabel>
                        </Col>
                        <Col xs="2">
                          <div className="position-relative">
                            {get(item, 'image', '') &&
                              <RemoveImage onClick={() => onChange({ target: { id: `amenitiesList[${index}].image`, value: '' } })} >
                                <i className="ri-close-circle-fill" />
                              </RemoveImage>}
                            <ImagePreview>
                              <img src={get(item, 'image', '') || '/static/images/no-image.jpg'} alt="breadcrumbs" />
                            </ImagePreview>
                          </div>
                        </Col>
                        <Col xs="2">
                          <ImageUpload
                            onDropAccepted={e => handleUpload(e, `amenitiesList[${index}].image`)}
                            title="Upload Image"
                            dropzoneContainer={UploadContainer}
                            dropzoneClassname="h-100"
                          />
                        </Col>
                        <Col xs="12" className="mt-3">
                          <FormGroup>
                            <FormItem
                              id={`amenitiesList[${index}].disclaimerText`}
                              name="text"
                              title="Disclaimer Text"
                              section="AMENITIES"
                              handleOnChange={onChange}
                              value={get(item, 'disclaimerText', '')}
                              selector={`disclaimerText-additionalAmenitiesSections-${index}`}
                              showTooltip
                            />
                          </FormGroup>
                        </Col>
                        <Col xs="12">
                          <FormLabel htmlFor="name">Amenities details</FormLabel>
                          <ButtonPrimary color="primary" className="mb-10" onClick={() => addDetailsColumn(index)} hidden={countColumn === 3}>
                            <i className="ri-add-fill" />
                            Add List
                          </ButtonPrimary>
                        </Col>
                        <DetailsWrapper className="w-100">
                          <Row className="mx-0">
                            {get(formValues, `amenitiesList[${index}].amenitiesDetails`, []).map((el, ind) => (
                              <AmenitiesDetails
                                key={ind}
                                details={el}
                                columnId={ind}
                                sectionId={index}
                                handleAddDetails={handleAddDetails}
                                onSortEndDetails={onSortEndDetails}
                                removeDetails={i => handleDelete(i, `amenitiesList[${index}].amenitiesDetails[${ind}]`)}
                                removeColumn={() => removeDetailsColumn(ind, `amenitiesList[${index}].columnHidden`)}
                                amenityCategories={amenityCategories}
                                editDetails={onChange}
                                hiddenColumn={get(formValues, `amenitiesList[${index}].columnHidden[${ind}]`)}
                              />
                            ))}
                          </Row>
                        </DetailsWrapper>
                      </Row>
                    </CardBody>
                  </CardSiteLogo>
                </Col>
              </Row>
            );
          })}
          <Button color="primary" className="mb-20" onClick={handleAddSection}>Add Amenities Section</Button>
          <Row>
            <Col xs="12">
              <CardBasic>
                <CardHeader>
                  <CardTitle>Welcome To</CardTitle>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col xs="12">
                      <FormLabel htmlFor="name">Upload Image</FormLabel>
                    </Col>
                    <Col xs="2">
                      <ImagePreview>
                        <img src={get(formValues, 'map.image', '') || '/static/images/no-image.jpg'} alt="community" />
                      </ImagePreview>
                    </Col>
                    <Col xs="2">
                      <ImageUpload
                        onDropAccepted={e => handleUpload(e, 'map.image')}
                        title="Upload Image"
                        dropzoneContainer={UploadContainer}
                        dropzoneClassname="h-100"
                      />
                    </Col>
                    <Col xs="12" className="mt-3">
                      <CheckBox
                        id="map.isShown"
                        label="Show Map Section"
                        checked={get(formValues, 'map.isShown', '')}
                        onChange={onChange}
                        labelClassName="label-checkbox"
                      />
                    </Col>
                    <Col xs="12" className="mt-3">
                      <FormGroup>
                        <FormItem
                          id="disclaimerText.welcome"
                          name="text"
                          title="Disclaimer Text"
                          section="AMENITIES"
                          handleOnChange={onChange}
                          value={get(formValues, 'disclaimerText.welcome', '')}
                          showTooltip
                        />
                      </FormGroup>
                    </Col>
                    <Col xs="12">
                      <TagsWrapper>
                        <ReactTags
                          tags={formValues.map.list.map(item => ({ id: item.text, text: item.text }))}
                          handleDelete={i => handleDelete(i, 'map.list')}
                          handleAddition={tag => handleAddition(tag, 'map.list')}
                          handleDrag={(tag, currPos, newPos) => handleDrag(tag, currPos, newPos, 'map.list')}
                          delimiters={delimiters}
                        />
                      </TagsWrapper>
                    </Col>
                  </Row>
                </CardBody>
              </CardBasic>
            </Col>
          </Row>
        </React.Fragment>
      }
      <ConfirmActionModal
        text="Are you sure wish to delete amenities section"
        itemName={removeAmenities.name}
        onConfirm={() => { handleDelete(removeAmenities.id, 'amenitiesList'); toggleConfirmModal(false); }}
        title="Confirm Delete"
        onClose={() => toggleConfirmModal(false)}
        show={showConfirmModal}
      />
    </React.Fragment>
  );
};

Content.defaultProps = {
  pageData: {},
};

const mapStateToProps = state => ({
  isPageDataLoaded: state.pageData.isPageDataLoaded,
  pageData: state.pageData.amenitiesPageData,
  submitClicked: state.pageData.submitClicked,
  formChanged: state.pageData.formChanged,
  amenityCategories: state.hobbes.amenityCategories,
});

export default connect(
  mapStateToProps,
  {
    ...actions.pageData,
    ...actions.hobbes,
  },
)(withRouter(Content));
