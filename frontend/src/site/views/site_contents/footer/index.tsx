import { Row, Col, CardHeader, CardBody, FormGroup } from 'reactstrap';
import React, { useState, useEffect, FC } from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { get, set, cloneDeep, isEmpty } from 'lodash';
import { toast, ToastOptions } from 'react-toastify';
import actions from 'site/actions';
import { FormItem, Spinner, ImageUpload, UploadContainer, CheckBox } from 'site/components';
import { sectionTypes, toastOptions } from 'site/constants';
import { CardBasic, CardTitle, FormLabel, ImagePreview } from 'site/components/common';
import { ListResponse, DetailResponse, FooterPageData } from 'src/interfaces';
import { handleFileUpload } from 'site/common/fileUpload';
import { RemoveImage } from 'site/views/site_contents/styles';

interface FooterProps extends RouteComponentProps {
  pageData: { values: FooterPageData },
  updatePageData: (type: string, data: { values: FooterPageData }, msg?: () => void) => Promise<DetailResponse>,
  uploadImage: (image: Blob, successCB?: (response: { data: { url } }) => void) => void,
  setChangedState: (state: boolean) => void,
  setSubmissionState: (isClick: boolean) => void,
  formChanged: boolean,
  isPageDataLoaded: boolean,
  getPageData: (type: string) => Promise<ListResponse>,
  clickedType?: { type: string },
}

const FooterPage: FC<FooterProps> = ({ pageData, updatePageData, setChangedState, setSubmissionState, formChanged, isPageDataLoaded, getPageData, clickedType, uploadImage }) => {
  const [formValues, setFormValues] = useState(cloneDeep(pageData.values));

  const handleSubmit = () => {
    setSubmissionState(true);
    updatePageData(sectionTypes.FOOTER, { values: formValues }).then(() => {
      setChangedState(false);
      setSubmissionState(false);
    });
  };

  useEffect(() => {
    if (!isEmpty(pageData)) {
      setFormValues(cloneDeep(pageData.values));
    } else {
      getPageData('footer');
    }
  }, [pageData]);

  const triggerSaveRequired = () => {
    if (!formChanged) setChangedState(true);
  };

  const onChange = ({ target: { id, value } }) => {
    set(formValues, id, value);
    setFormValues({ ...formValues });
    triggerSaveRequired();
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

  const fileUploadSuccessCB = ({ data: { url } }, name) => {
    set(formValues, name, url);
    setFormValues(formValues);
    updatePageData(sectionTypes.FOOTER, { values: formValues }, () => toast.success('Image uploaded', toastOptions as ToastOptions));
  };

  const removeImage = () => {
    onChange({ target: { id: 'rightFooter.imageUrl', value: '' } });
  };

  if (!isPageDataLoaded) return <Spinner />;

  return (
    <div>
      <Row>
        <Col xs="12">
          <CardBasic>
            <CardHeader>
              <CardTitle>Links</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col xs="12">
                  <FormGroup>
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'links.facebook', '')}
                      title="Facebook"
                      id="links.facebook"
                      name="Facebook"
                      section="FOOTER"
                    />
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'links.youtube', '')}
                      title="Youtube"
                      id="links.youtube"
                      name="Youtube"
                      section="FOOTER"
                    />
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'links.instagram', '')}
                      title="Instagram"
                      id="links.instagram"
                      name="Instagram"
                      section="FOOTER"
                    />
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'links.twitter', '')}
                      title="Twitter"
                      id="links.twitter"
                      name="Twitter"
                      section="FOOTER"
                    />
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'links.residentPortal', '')}
                      title="Resident Portal"
                      id="links.residentPortal"
                      name="Resident Portal"
                      section="FOOTER"
                    />
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'links.propertyUrl', '')}
                      title="Property URL"
                      id="links.propertyUrl"
                      name="Property URL"
                      section="FOOTER"
                    />
                    <FormGroup className="w-100">
                      <CheckBox
                        id="isActive"
                        label="Active Right Footer"
                        checked={get(formValues, 'rightFooter.isVisible', true)}
                        onChange={() => {
                          onChange({ target: { id: 'rightFooter.isVisible', value: !get(formValues, 'rightFooter.isVisible', true) } });
                        }}
                      />
                    </FormGroup>
                    <FormLabel htmlFor="name">Right Footer Image</FormLabel>
                    <Row>
                      {get(formValues, 'rightFooter.imageUrl', false) &&
                        <Col xs="2">
                          <div className="position-relative">
                            <RemoveImage onClick={removeImage} >
                              <i className="ri-close-circle-fill" />
                            </RemoveImage>
                            <ImagePreview>
                              <img src={get(formValues, 'rightFooter.imageUrl', '')} alt="breadcrumbs" />
                            </ImagePreview>
                          </div>
                        </Col>
                      }
                      <Col xs="2">
                        <ImageUpload
                          onDropAccepted={e => handleFileUpload(uploadImage, e, 'rightFooter.imageUrl', fileUploadSuccessCB)}
                          title="Upload Image"
                          dropzoneContainer={UploadContainer}
                          dropzoneClassname="h-100"
                        />
                      </Col>
                    </Row>
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'rightFooter.imageClickUrl', '')}
                      title="Right Footer Image Link"
                      id="rightFooter.imageClickUrl"
                      name="Right Footer"
                      placeholder="Image click URL"
                      section="FOOTER"
                      sectionClassName="mt-3"
                    />
                    <FormItem
                      handleOnChange={onChange}
                      value={get(formValues, 'rightFooter.imageLabel', 'Developed by')}
                      title="Right Footer Image Label"
                      id="rightFooter.imageLabel"
                      name="Right Footer"
                      placeholder="Image click URL"
                      section="FOOTER"
                      sectionClassName="mb-input-none"
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
  pageData: state.pageData.footerPageData,
  formChanged: state.pageData.formChanged,
});

export default connect(
  mapStateToProps,
  {
    ...actions.pageData,
  },
)(withRouter(FooterPage));
