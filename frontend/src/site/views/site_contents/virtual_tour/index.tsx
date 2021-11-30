import { Row, Col, CardHeader, CardBody, FormGroup, FormFeedback, Input, UncontrolledTooltip } from 'reactstrap';
import React, { useEffect, useState, FC } from 'react';
import Select from 'react-select';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { get, set, cloneDeep, isEmpty } from 'lodash';
import { toast, ToastOptions } from 'react-toastify';
import actions from 'site/actions';
import { CheckBox, FormItem, SeoFormSection, Spinner, ImageUpload, UploadContainer, ConfirmActionModal } from 'site/components';
import { sectionTypes, urlValidate, toastOptions } from 'site/constants';
import {
  CardBasic,
  CardSiteLogo,
  CardTitle,
  ImagePreview,
  ActionCardText,
  IconAction,
  FormLabel,
} from 'site/components/common';
import { ListResponse, DetailResponse, VirtualTourPageData } from 'src/interfaces';
import { ActionButtonWrapper, CustomFormGroup } from 'site/views/site_contents/virtual_tour/styles';
import { handleFileUpload } from 'site/common/fileUpload';

interface VirtualTourProps extends RouteComponentProps {
  pageData: { values?: VirtualTourPageData },
  floorPlans: { id: number, plan: string }[],
  updatePageData: (type: string, data: { values?: VirtualTourPageData }, msg?: () => void) => Promise<DetailResponse>,
  setChangedState: (state: boolean) => void,
  setSubmissionState: (isClick: boolean) => void,
  submitClicked: boolean,
  formChanged: boolean,
  isPageDataLoaded: boolean,
  getPageData: (type: string) => Promise<ListResponse>,
  uploadImage: (image: Blob, successCB?: (response: { data: { url } }) => void) => void,
  clickedType?: { type: string },
  handleError?: (isError: boolean) => void,
}

const VirtualTourPage: FC<VirtualTourProps> = ({ pageData, updatePageData, setChangedState, formChanged, isPageDataLoaded, uploadImage, clickedType, handleError,
  setSubmissionState, submitClicked, getPageData, floorPlans }) => {
  const [formValues, setFormValues] = useState(cloneDeep(pageData.values));
  const [errors, setErrors] = useState({});
  const [isShowConfirm, toggleConfirm] = useState(false);
  const [deleteTourIndex, setDeleteTourIndex] = useState(null);
  const [seoError, toggleError] = useState(false);

  const handleErrors = (error) => {
    toggleError(!isEmpty(error));
    if (isEmpty(error)) setSubmissionState(false);
    handleError(!isEmpty(errors) || !isEmpty(error));
  };

  const validate = () => {
    const formErrors = {};

    get(formValues, 'tours', []).forEach((record, index) => {
      if (!record.title) set(formErrors, `tours.[${index}].title`, 'Please add title of tour');
      if (!urlValidate(record.link)) set(formErrors, `tours.[${index}].link`, 'Please add valid tour link');
    });
    if (isEmpty(formErrors)) setSubmissionState(false);
    setErrors(formErrors);
    handleError(!isEmpty(formErrors) || seoError);
    return formErrors;
  };

  useEffect(() => {
    if (!isEmpty(errors)) validate();
  }, [formValues]);

  useEffect(() => {
    if (!isEmpty(pageData)) {
      setFormValues(cloneDeep(pageData.values));
    } else {
      getPageData('virtual_tour');
    }
  }, [pageData]);

  const handleSubmit = () => {
    setSubmissionState(true);
    if (isEmpty(validate()) && !seoError) {
      updatePageData(sectionTypes.VIRTUAL_TOUR, { values: formValues }).then(() => {
        setChangedState(false);
        setSubmissionState(false);
      });
    }
  };

  const triggerSaveRequired = () => {
    if (!formChanged) setChangedState(true);
  };

  const onChange = ({ target: { id, value } }) => {
    const newPageData = cloneDeep(formValues);
    set(newPageData, id, value);
    setFormValues(newPageData);
    triggerSaveRequired();
  };

  const fileUploadSuccessCB = ({ data: { url } }, name) => {
    const newPageData = { ...formValues };
    set(newPageData, name, url);
    setFormValues(newPageData);
    updatePageData(sectionTypes.VIRTUAL_TOUR, { values: newPageData }, () => toast.success('Image uploaded', toastOptions as ToastOptions));
  };

  const addTour = () => {
    const newTours = get(formValues, 'tours', []);
    setFormValues({ ...formValues, tours: newTours.concat([{ title: '', link: '' }]) });
    triggerSaveRequired();
  };

  const deleteTour = (index) => {
    const newTours = get(formValues, 'tours', []);
    const newPageData = { ...formValues, tours: newTours.filter((tour, ind) => index !== ind) };
    setFormValues(newPageData);
    updatePageData(sectionTypes.VIRTUAL_TOUR, { values: newPageData }, () => toast.success('Tour deleted', toastOptions as ToastOptions));
  };

  const discardChanges = () => {
    setChangedState(false);
    setFormValues(cloneDeep(pageData.values));
  };

  useEffect(() => {
    if (clickedType.type === 'submit') {
      handleSubmit();
    }
    if (clickedType.type === 'discard') {
      discardChanges();
    }
  }, [clickedType]);

  const virtualTourOptions = [
    { value: 'PANOSKIN', label: 'Panoskin' },
    { value: 'HELIX', label: 'Helix' },
    { value: 'MATTERPORT', label: 'Matterport' },
  ];

  const floorPlansOptions = floorPlans.map(i => ({ value: i.plan, label: i.plan }));

  if (!isPageDataLoaded) return <Spinner />;

  return (
    <div>
      <CardBasic>
        <CardBody className="p-3">
          <CheckBox
            checked={get(formValues, 'is_visible', false)}
            onChange={() => onChange({ target: { id: 'is_visible', value: !formValues.is_visible } })}
            label="Display Virtual Tour Page"
            id="is_visible"
          />
        </CardBody>
      </CardBasic>
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
                      section="VIRTUAL_TOUR"
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
                    onDropAccepted={e => handleFileUpload(uploadImage, e, 'breadcrumbsBar.image', fileUploadSuccessCB)}
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
                      section="VIRTUAL_TOUR"
                      placeholder="Enter title"
                      showTooltip
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
                      section="VIRTUAL_TOUR"
                      isTextArea
                      textAreaRow={4}
                      placeholder="Write some text..."
                      showTooltip
                      sectionClassName="mb-input-none"
                    />
                  </FormGroup>
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
              <CardTitle>VR tour</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col xs="12">
                  <FormGroup>
                    <FormLabel>VR tour type</FormLabel>
                    <Select
                      value={virtualTourOptions.filter(item => item.value === get(formValues, 'virtualTourType', ''))}
                      onChange={item => onChange({ target: { id: 'virtualTourType', value: item.value } })}
                      options={virtualTourOptions}
                    />
                  </FormGroup>
                  <FormGroup>
                    {get(formValues, 'virtualTourType') === 'PANOSKIN' ? (
                      <FormItem
                        handleOnChange={onChange}
                        value={get(formValues, 'panoId', '')}
                        title="Embed Panoskin tour ID"
                        id="panoId"
                        name="panoId"
                        section="VIRTUAL_TOUR"
                        placeholder="Enter ID"
                        showTooltip
                        sectionClassName="mb-input-none"
                      />
                    ) : null}
                    {get(formValues, 'virtualTourType') === 'HELIX' ? (
                      <FormItem
                        handleOnChange={onChange}
                        value={get(formValues, 'helixLink', '')}
                        title="Helix Link"
                        id="helixLink"
                        name="helixLink"
                        section="VIRTUAL_TOUR"
                        placeholder="Enter Helix Link"
                        showTooltip
                        sectionClassName="mb-input-none"
                      />
                    ) : null}
                    {get(formValues, 'virtualTourType') === 'MATTERPORT' ? (
                      <FormItem
                        handleOnChange={onChange}
                        value={get(formValues, 'matterportLink', '')}
                        title="Matterport Link"
                        id="matterportLink"
                        name="matterportLink"
                        section="VIRTUAL_TOUR"
                        placeholder="Enter Matterport Link"
                        showTooltip
                        sectionClassName="mb-input-none"
                      />
                    ) : null}
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          </CardBasic>
        </Col>
      </Row>
      <Row>
        <Col xs="12">
          <CardSiteLogo>
            <CardHeader>
              <CardTitle>Virtual Tour</CardTitle>
              <ActionCardText onClick={addTour}>
                <i className="ri-map-pin-line" />
                Add Tour
              </ActionCardText>
            </CardHeader>
            <CardBody>
              {formValues && formValues.tours && formValues.tours.map((record, index) => (
                <Row className="mb-3">
                  <Col xs={11}>
                    <Row>
                      <Col xs="6">
                        <FormGroup>
                          <FormItem
                            handleOnChange={onChange}
                            value={get(formValues, `tours.[${index}].title`, '')}
                            title="Title"
                            id={`tours.[${index}].title`}
                            selector="tours.title"
                            name="Title"
                            section="VIRTUAL_TOUR"
                            placeholder="Enter title"
                            showTooltip
                            sectionClassName="mb-input-none"
                          />
                          <Input type="hidden" invalid={get(errors, `tours.[${index}].title`, '')} />
                          <FormFeedback className="mt-n2">{get(errors, `tours.[${index}].title`, '')}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col xs="6">
                        <Row>
                          <Col xs="6">
                            <FormGroup>
                              <FormItem
                                handleOnChange={onChange}
                                value={get(formValues, `tours.[${index}].link`, '')}
                                title="Link"
                                id={`tours.[${index}].link`}
                                selector="tours.link"
                                name="Link"
                                section="VIRTUAL_TOUR"
                                placeholder="http://"
                                showTooltip
                                sectionClassName="mb-input-none"
                              />
                              <Input type="hidden" invalid={get(errors, `tours.[${index}].link`, '')} />
                              <FormFeedback className="mt-n2">{get(errors, `tours.[${index}].link`, '')}</FormFeedback>
                            </FormGroup>
                          </Col>
                          <Col xs="6">
                            <CustomFormGroup>
                              <FormLabel>Floor Plan</FormLabel>
                              <Select
                                value={floorPlansOptions.filter(item => item.value === get(formValues, `tours.[${index}].floor_plan`, ''))}
                                onChange={item => onChange({ target: { id: `tours.[${index}].floor_plan`, value: item.value } })}
                                options={floorPlansOptions}
                              />
                            </CustomFormGroup>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Col>
                  <ActionButtonWrapper xs={1}>
                    <IconAction onClick={() => {
                      toggleConfirm(true);
                      setDeleteTourIndex(index);
                    }}
                    >
                      <i
                        className="ri-delete-bin-5-line"
                        id={`delete-${index}`}
                      />
                      <UncontrolledTooltip placement="top" target={`delete-${index}`}>
                        Delete virtual tour
                      </UncontrolledTooltip>
                    </IconAction>
                  </ActionButtonWrapper>
                </Row>
              ))}
            </CardBody>
            {isShowConfirm && (
              <ConfirmActionModal
                title="Confirm Delete"
                text={`Confirm deletion of virtual tour ${get(formValues, 'tours', [])[deleteTourIndex].title}`}
                onConfirm={() => { deleteTour(deleteTourIndex); toggleConfirm(false); }}
                show={isShowConfirm}
                onClose={() => toggleConfirm(false)}
              />
            )}
          </CardSiteLogo>
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = state => ({
  isPageDataLoaded: state.pageData.isPageDataLoaded,
  pageData: state.pageData.virtualTourPageData,
  submitClicked: state.pageData.submitClicked,
  formChanged: state.pageData.formChanged,
  floorPlans: state.property.property.floor_plans,
});

export default connect(
  mapStateToProps,
  {
    ...actions.pageData,
  },
)(withRouter(VirtualTourPage));
