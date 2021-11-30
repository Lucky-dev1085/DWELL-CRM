import React, { useState, useEffect, FC } from 'react';
import { CardBody, CardHeader, Col, FormGroup, Row } from 'reactstrap';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import cloneDeep from 'lodash/cloneDeep';
import { toast, ToastOptions } from 'react-toastify';
import get from 'lodash/get';
import set from 'lodash/set';
import isEmpty from 'lodash/isEmpty';
import { googleMapOptions } from 'site/common';

import actions from 'site/actions';
import { LoadScript, Spinner, CheckBox, FormItem, ImageUpload, SeoFormSection, UploadContainer } from 'site/components';
import { sectionTypes, toastOptions } from 'site/constants';

import { CardBasic, CardTitle, ImagePreview } from 'site/components/common';
import { ListResponse, DetailResponse, NeighborHoodPageData, NeighborHooadDesignData } from 'src/interfaces';
import { handleFileUpload } from 'site/common/fileUpload';

import CategoryContent from './CategoryContent';
import LocationContent from './LocationContent';

interface Google {
  maps: {
    Geocoder: () => void,
  }
}
declare global {
  interface Window { google: Google; }
}

interface NeighborHoodProps extends RouteComponentProps {
  pageData: { values?: NeighborHoodPageData },
  updatePageData: (type: string, data: { values?: NeighborHoodPageData }, msg?: () => void) => Promise<DetailResponse>,
  setChangedState: (state: boolean) => void,
  setSubmissionState: (isClick: boolean) => void,
  submitClicked: boolean,
  formChanged: boolean,
  getPageData: (type: string) => Promise<ListResponse>,
  uploadImage: (image: Blob, successCB?: (response: { data: { url } }) => void) => Promise<{ result: { data: { url } } }>,
  isPageDataLoaded: boolean,
  designData?: NeighborHooadDesignData,
  clickedType?: { type: string },
  handleError?: (isError: boolean) => void,
}

const NeighborHood: FC<NeighborHoodProps> = ({ pageData, designData, updatePageData, uploadImage, setChangedState, setSubmissionState, submitClicked, formChanged,
  getPageData, isPageDataLoaded, clickedType, handleError }) => {
  const [formValues, setFormValues] = useState(cloneDeep(pageData.values));
  const [isGMapScriptLoading, updateGMapLoad] = useState(true);
  const [dataDesign, updateDesignData] = useState(designData);
  const [formErrors, updateErrors] = useState({});

  const handleErrors = (errors) => {
    updateErrors(errors);
    if (isEmpty(errors)) setSubmissionState(false);
    handleError(!isEmpty(errors));
  };

  const handleGMapScriptLoad = () => {
    updateGMapLoad(false);
  };

  const handleImageUpload = (imageFile) => {
    if (!imageFile) return null;

    return handleFileUpload(uploadImage, [imageFile]);
  };

  const updatePageDataSuccessCB = (successMessage, newPageData) => {
    setChangedState(false);
    setSubmissionState(false);
    setFormValues(newPageData);
    toast.success(successMessage, toastOptions as ToastOptions);
    return Promise.resolve(true);
  };

  const handlePageDataUpdate = (newPageData, successMessage) =>
    updatePageData(sectionTypes.NEIGHBORHOOD, { values: newPageData }, () => updatePageDataSuccessCB(successMessage, newPageData));

  const triggerSaveRequired = () => {
    if (!formChanged) setChangedState(true);
  };

  const handleChange = ({ target: { id, value } }) => {
    triggerSaveRequired();
    set(formValues, id, value);
    setFormValues({ ...formValues });
  };

  const handleSubmit = () => {
    setSubmissionState(true);
    if (isEmpty(formErrors)) {
      handlePageDataUpdate(formValues, 'Page updated');
    }
  };

  const fileUploadSuccessCB = ({ data: { url } }, name) => {
    set(formValues, name, url);
    setFormValues({ ...formValues });
    handlePageDataUpdate(formValues, 'Image uploaded');
  };

  useEffect(() => {
    const { google } = window;
    if (google) {
      handleGMapScriptLoad();
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(pageData)) {
      setFormValues(cloneDeep(pageData.values));
    } else {
      getPageData('neighborhood');
    }
  }, [pageData]);

  useEffect(() => {
    if (!isEmpty(designData)) {
      updateDesignData(designData);
    } else {
      getPageData('design');
    }
  }, [designData]);

  const discardChanges = () => {
    setChangedState(false);
    setFormValues(cloneDeep(pageData.values));
    updateDesignData(designData);
  };

  useEffect(() => {
    if (clickedType.type === 'submit') {
      handleSubmit();
    }
    if (clickedType.type === 'discard') {
      discardChanges();
    }
  }, [clickedType]);

  if (!isPageDataLoaded || isEmpty(formValues) || isEmpty(designData)) return <Spinner />;

  const { displayNeighborhoodPage } = formValues;

  if (isGMapScriptLoading) {
    return (
      <section>
        <LoadScript
          script={`https://maps.googleapis.com/maps/api/js?key=${googleMapOptions.key}&v=3.exp&libraries=geometry,drawing,places`}
          loadingElement={<Spinner />}
          onLoad={handleGMapScriptLoad}
        />
      </section>
    );
  }

  return (
    <section id="neighborhood">
      <CardBasic>
        <CardBody className="p-3">
          <CheckBox
            checked={displayNeighborhoodPage}
            onChange={() => handleChange({ target: { id: 'displayNeighborhoodPage', value: !displayNeighborhoodPage } })}
            label="Display Neighborhood Page"
            id="neighborhood_page_toggle"
          />
        </CardBody>
      </CardBasic>
      <SeoFormSection
        onChange={handleChange}
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
                      handleOnChange={handleChange}
                      value={get(formValues, 'pageTitle', '')}
                      title="Title"
                      id="pageTitle"
                      name="title"
                      section="NEIGHBORHOOD"
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
                      handleOnChange={handleChange}
                      value={get(formValues, 'firstRibbon.title', '')}
                      title="Title"
                      id="firstRibbon.title"
                      name="title"
                      section="NEIGHBORHOOD"
                    />
                  </FormGroup>
                </Col>
                <Col xs="12">
                  <FormGroup>
                    <FormItem
                      handleOnChange={handleChange}
                      value={get(formValues, 'firstRibbon.text', '')}
                      title="Text"
                      id="firstRibbon.text"
                      name="Text"
                      section="NEIGHBORHOOD"
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
      <CardBasic>
        <CardHeader>
          <CardTitle>Property Icon</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col xs="2">
              <ImagePreview>
                <img src={get(formValues, 'propertyIcon', '') || '/static/images/no-image.jpg'} alt="property icon" />
              </ImagePreview>
            </Col>
            <Col xs="2">
              <ImageUpload
                onDropAccepted={e => handleFileUpload(uploadImage, e, 'propertyIcon', fileUploadSuccessCB)}
                title="Upload Image"
                dropzoneContainer={() => <UploadContainer label="Upload Property Icon" />}
                dropzoneClassname="h-100"
              />
            </Col>
          </Row>
        </CardBody>
      </CardBasic>
      <LocationContent
        formValues={formValues}
        handlePageDataUpdate={handlePageDataUpdate}
        handleImageUpload={handleImageUpload}
      />
      <CategoryContent
        formValues={formValues}
        handlePageDataUpdate={handlePageDataUpdate}
        handleImageUpload={handleImageUpload}
        dataDesign={dataDesign}
      />
    </section>
  );
};

NeighborHood.defaultProps = {
  pageData: {},
  designData: {},
};

const mapStateToProps = state => ({
  isPageDataLoaded: state.pageData.isPageDataLoaded,
  pageData: state.pageData.neighborhoodPageData,
  designData: state.pageData.designPageData,
  submitClicked: state.pageData.submitClicked,
  formChanged: state.pageData.formChanged,
});

export default connect(
  mapStateToProps,
  {
    ...actions.pageData,
  },
)(withRouter(NeighborHood));
