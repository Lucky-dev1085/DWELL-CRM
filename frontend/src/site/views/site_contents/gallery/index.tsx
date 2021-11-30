import React, { useState, useEffect, FC } from 'react';
import { Row, Col, CardHeader, CardBody, FormGroup } from 'reactstrap';
import { get, set, clone, isEmpty, cloneDeep } from 'lodash';
import { toast, ToastOptions } from 'react-toastify';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { arrayMove } from 'react-sortable-hoc';
import 'react-tagsinput/react-tagsinput.css';

import { sectionTypes, toastOptions } from 'site/constants';
import actions from 'site/actions';
import { FormItem, SortableList, SeoFormSection, ImageUpload, Spinner, UploadContainer } from 'site/components';
import { CardBasic, TagsInputCustom, CardTitle, FormLabel, ImagePreview, AnimationWrapper, ActionCardText, CardAction } from 'site/components/common';
import { ListResponse, DetailResponse, FormError, GalleryPageData } from 'src/interfaces';
import { handleFileUpload } from 'site/common/fileUpload';
import VideoModal from './videoModal';

const MediaUploadContainer = () => <ActionCardText><i className="ri-image-line" /> Add Image</ActionCardText>;

interface GalleryProps extends RouteComponentProps {
  pageData: { values?: GalleryPageData },
  updatePageData: (type: string, data: { values?: GalleryPageData }, msg?: () => void) => Promise<DetailResponse>,
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

const GalleryPage: FC<GalleryProps> = ({ pageData, updatePageData, uploadImage, setChangedState, setSubmissionState, submitClicked, formChanged, getPageData,
  isPageDataLoaded, clickedType, handleError }) => {
  const [formValues, setFormValues] = useState({} as GalleryPageData);
  const [isVideoModalOpen, toggleVideoModal] = useState(false);
  const [formErrors, updateErrors] = useState({} as FormError);
  const [homePageVideoIndex, updateVideoIndex] = useState(get(pageData, 'values.images', []).findIndex(item => item.displayOnHomepage));

  useEffect(() => {
    if (!isEmpty(pageData)) {
      setFormValues(cloneDeep(pageData.values));
    } else {
      getPageData('gallery');
    }
  }, [pageData]);

  const triggerSaveRequired = () => {
    if (!formChanged) setChangedState(true);
  };

  const onChange = ({ target: { id, value } }, indexToChange = -1, keyToChange = null) => {
    const condition = `${id}${indexToChange !== -1 ? `.${indexToChange}` : ''}${keyToChange ? `.${keyToChange}` : ''}`;
    const newFormValues = cloneDeep(formValues);
    set(newFormValues, condition, value);
    setFormValues(newFormValues);
    triggerSaveRequired();
  };

  const handleUpdateImageInfo = (data, indexToChange) => {
    const { title, location, category } = data;
    set(formValues, `images.${indexToChange}.title`, title);
    set(formValues, `images.${indexToChange}.location`, location);
    set(formValues, `images.${indexToChange}.category`, category);
    setFormValues(formValues);
    updatePageData(sectionTypes.GALLERY, { values: formValues }, () => toast.success('Image information updated', toastOptions as ToastOptions));
  };

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setFormValues({
      ...formValues,
      images: arrayMove(formValues.images, oldIndex, newIndex),
    });
    triggerSaveRequired();
  };

  const removeImage = (src, isVideo) => {
    const filteredImages = formValues.images.filter(image => image.src !== src);
    const newFormValues = { ...formValues };
    set(newFormValues, 'images', filteredImages);
    updatePageData(sectionTypes.GALLERY, { values: newFormValues }, () => toast.success(isVideo ? 'Video deleted' : 'Image deleted', toastOptions as ToastOptions));
  };

  const fileUploadSuccessCB = ({ data: { url } }, name, isBulkUpload = false, videoModal = false, additionalData = {}) => {
    const newFormValues = { ...formValues };
    if (isBulkUpload) {
      if (videoModal) {
        newFormValues.images.unshift({ src: url, ...additionalData });
      } else {
        newFormValues.images.push({ src: url, ...additionalData });
      }
      setFormValues(newFormValues);
      if (videoModal) toggleVideoModal(!isVideoModalOpen);
    } else {
      set(newFormValues, name, url);
      setFormValues(newFormValues);
    }
    updatePageData(sectionTypes.GALLERY, { values: newFormValues }, () => toast.success('Image uploaded', toastOptions as ToastOptions));
  };

  const handleErrors = (errors) => {
    updateErrors(errors);
    if (isEmpty(errors)) setSubmissionState(false);
    handleError(!isEmpty(errors));
  };

  const handleSubmit = () => {
    setSubmissionState(true);
    // if (isEmpty(formErrors)) {
    updatePageData(sectionTypes.GALLERY, { values: formValues }).then(() => {
      setChangedState(false);
      setTimeout(() => setSubmissionState(false), 2000);
    });
    // }
  };

  const handleVideoLinkAdd = ({ videoUrl, videoDescription, src, hasHostVideoThumbnail }) => {
    if (hasHostVideoThumbnail) {
      const newPageData = clone(formValues);
      // newPageData.images.push({ videoUrl, title: videoDescription, src });
      newPageData.images.unshift({ videoUrl, title: videoDescription, src });
      setFormValues(newPageData);
      toggleVideoModal(!isVideoModalOpen);
      updatePageData(sectionTypes.GALLERY, { values: newPageData }, () => toast.success('Video added', toastOptions as ToastOptions));
      return;
    }
    handleFileUpload(uploadImage, [src], '', fileUploadSuccessCB, true, true, { videoUrl, title: videoDescription });
  };

  const handleHomepageVideoChange = (indexToChange) => {
    const clonedPageData = clone(formValues);
    if (indexToChange === homePageVideoIndex) {
      clonedPageData.images[indexToChange].displayOnHomepage = !clonedPageData.images[indexToChange].displayOnHomepage;
    } else {
      clonedPageData.images[indexToChange].displayOnHomepage = true;
      if (homePageVideoIndex !== -1) {
        clonedPageData.images[homePageVideoIndex].displayOnHomepage = false;
      }
      updateVideoIndex(indexToChange);
    }
    setFormValues(clonedPageData);
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

  if (!isPageDataLoaded || isEmpty(formValues)) return <Spinner />;

  return (
    <section>
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
                        section="GALLERY"
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
                        section="GALLERY"
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
                        section="GALLERY"
                        isTextArea
                        textAreaRow={4}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs="12">
                    <FormGroup>
                      <FormLabel>Add new image category</FormLabel>
                      <TagsInputCustom value={get(formValues, 'imageCategories', [])} onChange={categories => onChange({ target: { id: 'imageCategories', value: categories } })} />
                    </FormGroup>
                  </Col>
                  <Col xs="12">
                    <FormGroup>
                      <FormItem
                        handleOnChange={onChange}
                        value={get(formValues, 'panoId', '')}
                        title="Embed Panoskin tour ID"
                        id="panoId"
                        name="panoId"
                        section="GALLERY"
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
            <CardAction>
              <CardHeader>
                <CardTitle>Images & Videos</CardTitle>
                <div className="d-flex">
                  <ImageUpload
                    onDropAccepted={e => handleFileUpload(uploadImage, e, 'logo.src', fileUploadSuccessCB, true)}
                    title="Upload media"
                    dropzoneClassname="media-upload-container"
                    dropzoneContainer={MediaUploadContainer}
                  />
                  <ActionCardText className="ml-10" onClick={() => toggleVideoModal(!isVideoModalOpen)}>
                    <i className="ri-movie-line" />
                    Add Video
                  </ActionCardText>
                </div>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col xs="12">
                    <SortableList
                      onRemoveClick={removeImage}
                      images={formValues.images}
                      categories={formValues.imageCategories}
                      onSortEnd={onSortEnd}
                      onInputChange={onChange}
                      submitting={submitClicked}
                      onSubmit={handleUpdateImageInfo}
                      isGalleryPage
                      onHomePageVideoChange={handleHomepageVideoChange}
                    />
                  </Col>
                </Row>
              </CardBody>
            </CardAction>
          </Col>
        </Row>
      </AnimationWrapper>
      <VideoModal
        submitting={submitClicked}
        onSubmit={handleVideoLinkAdd}
        isModalOpen={isVideoModalOpen}
        onModalToggle={() => toggleVideoModal(!isVideoModalOpen)}
      />
    </section>
  );
};

GalleryPage.defaultProps = {
  pageData: {},
};

const mapStateToProps = state => ({
  isPageDataLoaded: state.pageData.isPageDataLoaded,
  pageData: state.pageData.galleryPageData,
  submitClicked: state.pageData.submitClicked,
  formChanged: state.pageData.formChanged,
});

export default connect(
  mapStateToProps,
  {
    ...actions.pageData,
  },
)(withRouter(GalleryPage));
