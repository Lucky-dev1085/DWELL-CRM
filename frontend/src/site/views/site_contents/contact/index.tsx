import React, { useState, useEffect, FC } from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { get, set, isEqual, isEmpty, cloneDeep } from 'lodash';
import { Row, Col, CardHeader, CardBody, FormGroup, Input } from 'reactstrap';
import { toast, ToastOptions } from 'react-toastify';

import { FormItem, SeoFormSection, Spinner, ImageUpload, UploadContainer } from 'site/components';
import actions from 'site/actions';
import actionsDwell from 'dwell/actions';
import { sectionTypes, toastOptions } from 'site/constants';
import { CardBasic, CardTitle, FormLabel, ImagePreview } from 'site/components/common';
import { successCallback, failureCallback } from 'site/common';
import { ListResponse, DetailResponse, PropertyProps, ContactPageData } from 'src/interfaces';
import { handleFileUpload } from 'site/common/fileUpload';

interface ContactProps extends RouteComponentProps {
  pageData: { values?: ContactPageData },
  updatePageData: (type: string, data: { values?: ContactPageData }, msg?: () => void) => Promise<DetailResponse>,
  updateProperty: (id: number, payload: { city: string, town: string, phone_number: string }) => Promise<DetailResponse>,
  setChangedState: (state: boolean) => void,
  setSubmissionState: (isClick: boolean) => void,
  submitClicked: boolean,
  formChanged: boolean,
  isPageDataLoaded: boolean,
  getPageData: (type: string) => Promise<ListResponse>,
  uploadImage: (image: Blob, successCB?: (response: { data: { url } }) => void) => void;
  currentProperty: PropertyProps,
  clickedType?: { type: string },
  handleError?: (isError: boolean) => void,
}

const ContactPage: FC<ContactProps> = ({ pageData, updatePageData, updateProperty, currentProperty, setChangedState, setSubmissionState,
  submitClicked, formChanged, getPageData, isPageDataLoaded, uploadImage, clickedType, handleError }) => {
  const [formValues, setFormValues] = useState(cloneDeep(pageData.values));
  const [targetPhoneNumber, updateNumber] = useState(null);
  const [formErrors, updateErrors] = useState({});

  const handleErrors = (errors) => {
    updateErrors(errors);
    if (isEmpty(errors)) setSubmissionState(false);
    handleError(!isEmpty(errors));
  };

  const handleUpdateContactData = () => {
    const { values: oldPageData } = pageData;
    if (!isEqual(get(oldPageData, 'address', {}), get(formValues, 'address', {})) || targetPhoneNumber !== currentProperty.phone_number) {
      const payloads = {
        city: get(formValues, 'address.city', ''),
        town: get(formValues, 'address.town', ''),
        phone_number: targetPhoneNumber,
      };
      return updateProperty(currentProperty.id, payloads).then(successCallback).catch(failureCallback);
    }
    return successCallback();
  };

  const handleSubmit = () => {
    setSubmissionState(true);

    if (isEmpty(formErrors)) {
      updatePageData(sectionTypes.CONTACT, { values: formValues }, () => handleUpdateContactData()).then(() => {
        setChangedState(false);
        setSubmissionState(false);
      });
    }
  };

  const triggerSaveRequired = () => {
    if (!formChanged) setChangedState(true);
  };

  const onChange = ({ target: { id, value } }) => {
    triggerSaveRequired();
    if (id === 'targetPhoneNumber') {
      updateNumber(value);
    } else {
      set(formValues, id, value);
      setFormValues({ ...formValues });
    }
  };

  const fileUploadSuccessCB = ({ data: { url } }, name) => {
    const oldFormValues = cloneDeep(formValues);
    set(oldFormValues, name, url);
    setFormValues(oldFormValues);
    updatePageData(sectionTypes.CONTACT, { values: oldFormValues }, () => toast.success('Image uploaded', toastOptions as ToastOptions));
  };

  useEffect(() => {
    if (!isEmpty(pageData)) {
      setFormValues(cloneDeep(pageData.values));
    } else {
      getPageData('contact');
    }
  }, [pageData]);

  useEffect(() => {
    if (!isEmpty(currentProperty)) {
      updateNumber(currentProperty.phone_number);
    }
  }, [currentProperty]);

  const discardChanges = () => {
    setChangedState(false);
    setFormValues(cloneDeep(pageData.values));
    setSubmissionState(false);
    updateNumber(null);
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
    <div>
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
                      section="CONTACT"
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
                      section="CONTACT"
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
                      section="CONTACT"
                      isTextArea
                      textAreaRow={4}
                    />
                  </FormGroup>
                </Col>
                <Col xs="12">
                  <FormGroup>
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'googleBusinessMap', '')}
                      title="Google Business Map Link"
                      id="googleBusinessMap"
                      name="googleBusinessMap"
                      section="CONTACT"
                    />
                  </FormGroup>
                </Col>
                <Col xs="12">
                  <FormGroup>
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'googleDirectionUrl', '')}
                      title="Google Map Direction Link"
                      id="googleDirectionUrl"
                      name="googleDirectionUrl"
                      section="CONTACT"
                    />
                  </FormGroup>
                </Col>
                <Col xs="6">
                  <FormGroup>
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'address.name', '')}
                      title="Name"
                      id="address.name"
                      name="Name"
                      section="CONTACT"
                      showTooltip
                    />
                  </FormGroup>
                </Col>
                <Col xs="6">
                  <FormGroup>
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'address.town', '')}
                      title="City"
                      id="address.town"
                      name="Town"
                      section="CONTACT"
                      showTooltip
                    />
                  </FormGroup>
                </Col>
                <Col xs="6">
                  <FormGroup>
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'address.email', '')}
                      title="Email"
                      id="address.email"
                      name="Email"
                      section="CONTACT"
                      showTooltip
                    />
                  </FormGroup>
                </Col>
                <Col xs="6">
                  <FormGroup>
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'hours.mondayToFriday', '')}
                      title="Week Days"
                      id="hours.mondayToFriday"
                      name="Week Days"
                      section="CONTACT"
                      showTooltip
                    />
                  </FormGroup>
                </Col>
                <Col xs="6">
                  <FormGroup>
                    <FormItem
                      handleOnChange={onChange}
                      value={targetPhoneNumber}
                      title="Target Phone Number"
                      id="targetPhoneNumber"
                      name="Phone"
                      section="CONTACT"
                      showTooltip
                    />
                  </FormGroup>
                </Col>
                <Col xs="6">
                  <FormGroup>
                    <FormLabel htmlFor="name">Tracking Phone Number</FormLabel>
                    <Input value={currentProperty.tracking_number} disabled />
                  </FormGroup>
                </Col>
                <Col xs="6">
                  <FormGroup>
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'hours.saturday', '')}
                      title="Saturday"
                      id="hours.saturday"
                      name="Saturday"
                      section="CONTACT"
                      showTooltip
                    />
                  </FormGroup>
                </Col>
                <Col xs="6">
                  <FormGroup>
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'address.city', '')}
                      title="Address"
                      id="address.city"
                      name="City"
                      section="CONTACT"
                      showTooltip
                    />
                  </FormGroup>
                </Col>
                <Col xs="6">
                  <FormGroup>
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'hours.sunday', '')}
                      title="Sunday"
                      id="hours.sunday"
                      name="Sunday"
                      section="CONTACT"
                      showTooltip
                    />
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          </CardBasic>
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = state => ({
  isPageDataLoaded: state.pageData.isPageDataLoaded,
  pageData: state.pageData.contactPageData,
  currentProperty: state.property.property,
  submitClicked: state.pageData.submitClicked,
  formChanged: state.pageData.formChanged,
});

export default connect(
  mapStateToProps,
  {
    ...actions.pageData,
    ...actionsDwell.property,
  },
)(withRouter(ContactPage));
