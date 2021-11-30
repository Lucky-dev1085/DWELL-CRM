import React, { useState, useEffect, FC } from 'react';
import Select from 'react-select';
import { CardBody, CardHeader, Col, FormGroup, Row } from 'reactstrap';
import { toast, ToastOptions } from 'react-toastify';
import 'react-tagsinput/react-tagsinput.css';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { get, set, isEmpty, cloneDeep } from 'lodash';

import { sectionTypes, feedSourceTypes, toastOptions } from 'site/constants';
import actions from 'site/actions';
import { FormItem, ImageUpload, SortableFloorPlanList, SeoFormSection, Spinner, ConfirmActionModal, UploadContainer } from 'site/components';
import { CardBasic, TagsInputCustom, CardTitle, FormLabel, ImagePreview, AnimationWrapper } from 'site/components/common';
import { ListResponse, DetailResponse, FloorPlanPageData } from 'src/interfaces';
import { handleFileUpload } from 'site/common/fileUpload';

const feedSourceOptions = [
  { value: feedSourceTypes.ON_SITE, label: 'On-Site' },
  { value: feedSourceTypes.YARDI, label: 'Yardi' },
  { value: feedSourceTypes.RESMAN, label: 'Resman' },
];

interface ImageRemove {
  id?: string,
  index?: string,
}

interface FloorPlansProps extends RouteComponentProps {
  pageData: { values?: FloorPlanPageData },
  updatePageData: (type: string, data: { values?: FloorPlanPageData }, msg?: () => void) => Promise<DetailResponse>,
  setChangedState: (state: boolean) => void,
  setSubmissionState: (isClick: boolean) => void,
  submitClicked: boolean,
  formChanged: boolean,
  getPageData: (type: string) => Promise<ListResponse>,
  uploadImage: (image: Blob, successCB?: (response: { data: { url } }) => void) => void,
  isPageDataLoaded: boolean,
  clickedType?: { type: string },
  handleError?: (isError: boolean) => void,
}

const FloorPlansPage: FC<FloorPlansProps> = ({ pageData, updatePageData, uploadImage, setChangedState, setSubmissionState, submitClicked, formChanged, getPageData,
  isPageDataLoaded, clickedType, handleError }) => {
  const [formValues, setFormValues] = useState({} as FloorPlanPageData);
  const [formErrors, updateErrors] = useState({});
  const [isShowConfirm, toggleConfirm] = useState(false);
  const [isShowConfirmFloorPlanRemove, toggleRemoveFloorPlanConfirm] = useState(false);
  const [removeImageId, setRemoveImage] = useState({} as ImageRemove);
  const [indexToDelete, setIndexToDelete] = useState<number>(null);

  useEffect(() => {
    if (!isEmpty(pageData)) {
      setFormValues({
        ...cloneDeep(pageData.values),
        // allPlans: orderBy(cloneDeep(pageData.values.allPlans), ['squareFootage'], ['asc']),
      });
    } else {
      getPageData('floor_plans');
    }
  }, [pageData]);

  const handleErrors = (errors) => {
    updateErrors(errors);
    if (isEmpty(errors)) setSubmissionState(false);
    handleError(!isEmpty(errors));
  };

  const triggerSaveRequired = () => {
    if (!formChanged) setChangedState(true);
  };

  const onChange = ({ target: { id, value } }) => {
    const newValues = { ...formValues };
    set(newValues, id, value);
    setFormValues(newValues);
    triggerSaveRequired();
  };

  const onPlanChange = (id, value) => {
    const newValues = { ...formValues };
    set(newValues, id, value);
    setFormValues(newValues);
  };

  const addFloorPlan = () => {
    const { allPlans } = formValues;
    allPlans.push({
      images: [], available: null, bathrooms: null, bedrooms: null, description: null, squareFootage: null, minRent: null, maxRent: null, isVisible: true, show_sqft: false, isNew: true,
    });
    setFormValues({ ...formValues, allPlans });
  };

  const cancelFloorPlan = () => {
    const { allPlans } = formValues;
    setFormValues({ ...formValues, allPlans: allPlans.filter(i => !i.isNew) });
  };

  const fileUploadSuccessCB = ({ data: { url } }, name, isBulkUpload) => {
    const newFormValues = { ...formValues };
    if (isBulkUpload) {
      const images = get(newFormValues, name);
      images.push({ src: url });
      set(newFormValues, name, images);
      setFormValues(newFormValues);
    } else {
      set(newFormValues, name, url);
      setFormValues(newFormValues);
    }
    updatePageData(sectionTypes.FLOOR_PLANS, { values: newFormValues }, () => toast.success('Image uploaded', toastOptions as ToastOptions));
  };

  const handleUpload = (file, name, isBulkUpload = false) => handleFileUpload(uploadImage, file, name, fileUploadSuccessCB, isBulkUpload);

  const handleSubmit = (values = formValues) => {
    setSubmissionState(true);
    let { allPlans } = values;
    allPlans = allPlans.filter(plan => !plan.isNew);
    if (isEmpty(formErrors)) {
      updatePageData(sectionTypes.FLOOR_PLANS, { values: { ...values, allPlans } }).then(() => {
        setChangedState(false);
        setTimeout(() => setSubmissionState(false), 2000);
      });
    }
  };

  const deleteFloorPlan = (index) => {
    setIndexToDelete(index);
    toggleRemoveFloorPlanConfirm(true);
  };

  const handleFloorPlanDelete = () => {
    toggleRemoveFloorPlanConfirm(false);
    const { allPlans } = cloneDeep(formValues);
    allPlans.splice(indexToDelete, 1);
    const newValues = { ...formValues, allPlans };
    setFormValues(newValues);
    handleSubmit(newValues);
    setIndexToDelete(null);
  };

  const updateArray = (propertyIds) => {
    // only allow one property Id
    if (propertyIds.length > 1) return;
    setChangedState(true);
    setFormValues({ ...formValues, propertyIds });
    triggerSaveRequired();
  };

  const handleRemoveImage = () => {
    const { index, id } = removeImageId;
    const newFormValues = { ...formValues } as FloorPlanPageData;
    toggleConfirm(false);
    newFormValues.allPlans[index].images = newFormValues.allPlans[index].images.filter((image, key) => key !== id);
    setFormValues(newFormValues);
    setRemoveImage({});
    updatePageData(sectionTypes.FLOOR_PLANS, { values: newFormValues }, () => toast.success('Image deleted', toastOptions as ToastOptions));
  };

  const removeImage = (index, id) => {
    toggleConfirm(true);
    setRemoveImage({ index, id });
  };

  const discardChanges = () => {
    setChangedState(false);
    setFormValues({
      ...cloneDeep(pageData.values),
      // allPlans: orderBy(cloneDeep(pageData.values.allPlans), ['squareFootage'], ['asc'])
    });
  };

  useEffect(() => {
    if (clickedType.type === 'submit') {
      handleSubmit();
    }
    if (clickedType.type === 'discard') {
      discardChanges();
    }
  }, [clickedType]);

  if (!isPageDataLoaded || isEmpty(formValues)) return <Spinner />;

  return (
    <AnimationWrapper>
      <SeoFormSection
        onChange={onChange}
        title={get(formValues, 'seo.title', '')}
        description={get(formValues, 'seo.description', '')}
        handleErrors={handleErrors}
        submitIsClicked={submitClicked}
      />
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
                      handleOnChange={onChange}
                      value={get(formValues, 'pageTitle', '')}
                      title="Title"
                      id="pageTitle"
                      name="title"
                      section="FLOOR_PLANS"
                      showTooltip
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
                <Col xs="12">
                  <FormGroup>
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'firstRibbon.title', '')}
                      title="Title"
                      id="firstRibbon.title"
                      name="title"
                      section="FLOOR_PLANS"
                    />
                  </FormGroup>
                </Col>
                <Col xs="12">
                  <FormGroup>
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'firstRibbon.text', '')}
                      title="Text"
                      id="firstRibbon.text"
                      name="Text"
                      section="FLOOR_PLANS"
                      isTextArea
                      textAreaRow={4}
                      sectionClassName="mb-input-none"
                    />
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          </CardBasic>
        </Col>
      </Row>
      {get(formValues, 'feedSourceType', '') === feedSourceTypes.YARDI && (
        <Row>
          <Col xs="12">
            <CardBasic>
              <CardHeader>
                <CardTitle>Yardi Online Url</CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col xs="12">
                    <FormGroup>
                      <FormItem
                        handleOnChange={onChange}
                        value={get(formValues, 'yardiOnlineUrl', '')}
                        title="Url"
                        id="yardiOnlineUrl"
                        name="yardiOnlineUrl"
                        section="FLOOR_PLANS"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </CardBasic>
          </Col>
        </Row>
      )}
      <Row>
        <Col xs="12">
          <CardBasic>
            <CardHeader>
              <CardTitle>Property Feed</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col xs="3">
                  <FormLabel>Select Feed Source </FormLabel>
                  <Select
                    value={feedSourceOptions.filter(item => item.value === get(formValues, 'feedSourceType', ''))}
                    onChange={item => onChange({ target: { id: 'feedSourceType', value: item.value } })}
                    options={feedSourceOptions}
                  />
                </Col>
                <Col xs="9">
                  <FormLabel>Property ID </FormLabel>
                  <FormGroup>
                    <TagsInputCustom value={formValues.propertyIds} onChange={updateArray} addOnBlur />
                  </FormGroup>
                </Col>
                <Col xs="12">
                  {formValues.allPlans.length > 0 && formValues.allPlans[0] === null ? null :
                    (
                      <SortableFloorPlanList
                        onRemoveClick={removeImage}
                        plans={formValues.allPlans}
                        onDropAccepted={handleUpload}
                        onInputChange={onPlanChange}
                        addFloorPlan={addFloorPlan}
                        deleteFloorPlan={deleteFloorPlan}
                        cancelFloorPlan={cancelFloorPlan}
                        saveFloorPlan={handleSubmit}
                      />
                    )}
                </Col>
              </Row>
            </CardBody>
          </CardBasic>
        </Col>
      </Row>
      <ConfirmActionModal
        title="Confirm Delete"
        text="You are about to delete this image"
        onConfirm={handleRemoveImage}
        show={isShowConfirm}
        onClose={() => toggleConfirm(false)}
      />
      <ConfirmActionModal
        title="Confirm Delete"
        text={`Delete floor plan ${formValues.allPlans[indexToDelete]?.description}`}
        onConfirm={handleFloorPlanDelete}
        show={isShowConfirmFloorPlanRemove}
        onClose={() => toggleRemoveFloorPlanConfirm(false)}
      />
    </AnimationWrapper>
  );
};

FloorPlansPage.defaultProps = {
  pageData: {},
};

const mapStateToProps = state => ({
  isPageDataLoaded: state.pageData.isPageDataLoaded,
  pageData: state.pageData.floorPlansPageData,
  submitClicked: state.pageData.submitClicked,
  formChanged: state.pageData.formChanged,
});

export default connect(
  mapStateToProps,
  {
    ...actions.pageData,
  },
)(withRouter(FloorPlansPage));
