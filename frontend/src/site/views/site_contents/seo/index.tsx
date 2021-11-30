import React, { useState, useEffect, FC } from 'react';
import { Row, Col, CardHeader, CardBody, FormGroup } from 'reactstrap';
import { get, set, cloneDeep, isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { toast, ToastOptions } from 'react-toastify';
import 'react-tagsinput/react-tagsinput.css';

import { sectionTypes, toastOptions } from 'site/constants';
import actions from 'site/actions';
import { FormItem, ImageUpload, Spinner, Tooltip, UploadContainer, SeoFormSection } from 'site/components';
import { CardBasic, TagsInputCustom, CardTitle, FormLabel, AnimationWrapper, ImagePreview } from 'site/components/common';
import { ListResponse, DetailResponse, SeoPageData } from 'src/interfaces';
import { handleFileUpload } from 'site/common/fileUpload';

interface SeoProps extends RouteComponentProps {
  pageData: { values: SeoPageData },
  updatePageData: (type: string, data: { values: SeoPageData }) => Promise<DetailResponse>,
  setChangedState: (state: boolean) => void,
  setSubmissionState: (isClick: boolean) => void,
  formChanged: boolean,
  isPageDataLoaded: boolean,
  submitClicked: boolean,
  getPageData: (type: string) => Promise<ListResponse>,
  uploadImage: (image: Blob, successCB?: (response: { data: { url } }) => void) => void;
  clickedType?: { type: string },
  handleError?: (isError: boolean) => void,
}

const SeoPage: FC<SeoProps> = ({ pageData, updatePageData, uploadImage, setChangedState, setSubmissionState, formChanged, isPageDataLoaded, getPageData,
  clickedType, submitClicked, handleError }) => {
  const [formValues, setFormValues] = useState(cloneDeep(pageData.values));
  const [formErrors, updateErrors] = useState({});

  const handleErrors = (errors) => {
    updateErrors(errors);
    if (isEmpty(errors)) setSubmissionState(false);
    handleError(!isEmpty(errors));
  };

  const triggerSaveRequired = () => {
    if (!formChanged) setChangedState(true);
  };

  const onChange = ({ target: { id, value } }) => {
    set(formValues, id, value);
    triggerSaveRequired();
    setFormValues({ ...formValues });
  };

  const fileUploadSuccessCB = ({ data: { url } }, name) => {
    toast.success('File was upload', toastOptions as ToastOptions);
    onChange({ target: { id: name, value: url } });
  };

  const addItemToList = (data, id) => {
    onChange({ target: { id, value: data } });
  };

  const handleSubmit = () => {
    setSubmissionState(true);
    if (isEmpty(formErrors)) {
      updatePageData(sectionTypes.SEO, { values: formValues }).then(() => {
        setChangedState(false);
        setSubmissionState(false);
      });
    }
  };

  useEffect(() => {
    if (!isEmpty(pageData)) {
      setFormValues(cloneDeep(pageData.values));
    } else {
      getPageData('seo');
    }
  }, [pageData]);

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

  if (!isPageDataLoaded) return <Spinner />;

  return (
    <AnimationWrapper>
      <Row>
        <Col xs="12">
          <SeoFormSection
            onChange={onChange}
            title={get(formValues, 'applyNow.title', '')}
            description={get(formValues, 'applyNow.description', '')}
            titleId="applyNow.title"
            descriptionId="applyNow.description"
            handleErrors={handleErrors}
            submitIsClicked={submitClicked}
            headerLabel="Apply Now SEO"
          />
          <SeoFormSection
            onChange={onChange}
            title={get(formValues, 'privacyPolicy.title', '')}
            description={get(formValues, 'privacyPolicy.description', '')}
            titleId="privacyPolicy.title"
            descriptionId="privacyPolicy.description"
            handleErrors={handleErrors}
            submitIsClicked={submitClicked}
            headerLabel="Privacy Policy SEO"
          />
          <CardBasic>
            <CardHeader>
              <CardTitle>General Data</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col xs="12">
                  <FormGroup>
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'generalData.title', '')}
                      title="Title"
                      id="generalData.title"
                      name="title"
                      placeholder="Enter title"
                      section="SEO"
                      showTooltip
                    />
                  </FormGroup>
                </Col>
                <Col xs="12">
                  <FormGroup>
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'generalData.description', '')}
                      title="Description"
                      id="generalData.description"
                      name="Description"
                      section="SEO"
                      placeholder="Enter some description..."
                      isTextArea
                      showTooltip
                      textAreaRow={2}
                      helperText="Description should be less than 156 letters"
                    />
                  </FormGroup>
                </Col>
                <Col xs="12">
                  <div className="d-flex">
                    <FormLabel htmlFor="name" className="w-100">Keywords</FormLabel>
                    <Tooltip section="SEO" selector="generalData.keywords" />
                  </div>
                </Col>
                <Col xs="12">
                  <FormGroup>
                    <TagsInputCustom value={get(formValues, 'generalData.keywords', [])} onChange={e => addItemToList(e, 'generalData.keywords')} />
                  </FormGroup>
                </Col>
                <Col xs="12">
                  <FormLabel htmlFor="name">Favicon Upload</FormLabel>
                </Col>
                <Col xs="12">
                  <Row>
                    <Col xs="2">
                      <ImagePreview>
                        <img src={get(formValues, 'generalData.favicon', '') || '/static/images/no-image.jpg'} alt="icon" />
                      </ImagePreview>
                    </Col>
                    <Col xs="2" style={{ minWidth: '90px' }}>
                      <ImageUpload
                        onDropAccepted={e => handleFileUpload(uploadImage, e, 'generalData.favicon', fileUploadSuccessCB)}
                        title="Upload Icon"
                        dropzoneContainer={() => <UploadContainer label="Upload Favicon" />}
                        dropzoneClassname="h-100"
                      />
                    </Col>
                  </Row>
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
              <CardTitle>Additional Script</CardTitle>
            </CardHeader>
            <CardBody>
              <Col xs="12" className="p-0">
                <FormItem
                  id="aditionalScript"
                  name="Script"
                  handleOnChange={onChange}
                  value={get(formValues, 'aditionalScript', '')}
                  title="Script"
                  section="SEO"
                  isTextArea
                  sectionClassName="mb-input-none"
                />
              </Col>
            </CardBody>
          </CardBasic>
        </Col>
      </Row>
      <Row>
        <Col xs="12">
          <CardBasic>
            <CardHeader>
              <CardTitle>GTM Script</CardTitle>
            </CardHeader>
            <CardBody>
              <Col xs="12" className="p-0">
                <FormItem
                  id="gtmId"
                  name="GTM Id"
                  title="GTM Id"
                  handleOnChange={onChange}
                  value={get(formValues, 'gtmId', '')}
                  section="SEO"
                  showTooltip
                  sectionClassName="mb-input-none"
                />
              </Col>
            </CardBody>
          </CardBasic>
        </Col>
      </Row>
      <Row>
        <Col xs="12">
          <CardBasic>
            <CardHeader>
              <CardTitle>Ownership Settings</CardTitle>
            </CardHeader>
            <CardBody>
              <Col xs="12" className="p-0">
                <FormItem
                  id="bing_ownership"
                  name="Bing Ownership"
                  title="Bing Ownership"
                  handleOnChange={onChange}
                  value={get(formValues, 'bing_ownership', '')}
                  section="SEO"
                  showTooltip
                />
              </Col>
              <Col xs="12" className="p-0">
                <FormItem
                  id="google_ownership"
                  name="Google Ownership"
                  title="Google Ownership"
                  handleOnChange={onChange}
                  value={get(formValues, 'google_ownership', '')}
                  section="SEO"
                  showTooltip
                  sectionClassName="mb-input-none"
                />
              </Col>
            </CardBody>
          </CardBasic>
        </Col>
      </Row>
    </AnimationWrapper>
  );
};

const mapStateToProps = state => ({
  isPageDataLoaded: state.pageData.isPageDataLoaded,
  pageData: state.pageData.seoPageData,
  formChanged: state.pageData.formChanged,
  submitClicked: state.pageData.submitClicked,
});

export default connect(
  mapStateToProps,
  {
    ...actions.pageData,
  },
)(withRouter(SeoPage));
