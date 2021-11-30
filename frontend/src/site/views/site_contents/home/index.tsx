import React, { useEffect, useState, FC } from 'react';
import { Row, Col, CardHeader, CardBody, FormGroup, UncontrolledTooltip } from 'reactstrap';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { get, isEmpty, set, cloneDeep } from 'lodash';
import { arrayMove } from 'react-sortable-hoc';
import { toast, ToastOptions } from 'react-toastify';

import actions from 'site/actions';
import actionsDwell from 'dwell/actions';
import { FormItem, SortableList, Geolocation, ImageUpload, SeoFormSection, ColorPicker, CheckBox, Map, UploadContainer } from 'site/components';
import { sectionTypes, MAX_CAROUSEL_LENGTH, toastOptions } from 'site/constants';
import { CardBasic, CardTitle, ImagePreview, AnimationWrapper, ActionCardIcon, CardAction, ContainerUploadImage } from 'site/components/common';
import { ListResponse, DetailResponse, HomePageData } from 'src/interfaces';
import { CardBasicCustom, SiteLogo, SecondLogoCard, Label, MapWrapper, Divider } from 'site/views/site_contents/home/styles';
import { handleFileUpload } from 'site/common/fileUpload';

const UploadContainerLogo = () => (
  <ContainerUploadImage style={{ width: '100px' }}>
    <i className="ri-image-line" style={{ fontSize: '20px' }} />
    <span>Upload Logo</span>
  </ContainerUploadImage>
);

interface HomeProps extends RouteComponentProps {
  pageData: { values?: HomePageData },
  updatePageData: (type: string, data: { values?: HomePageData }, msg?: () => void) => Promise<DetailResponse>,
  updateProperty: (id: number, payload: { logo: string }) => Promise<DetailResponse>,
  setChangedState: (state: boolean) => void,
  setSubmissionState: (isClick: boolean) => void,
  submitClicked: boolean,
  formChanged: boolean,
  getPageData: (type: string) => Promise<ListResponse>,
  uploadImage: (image: Blob, successCB?: (response: { data: { url } }) => void) => void;
  currentProperty: { id: number, logo: string, },
  designData?: {
    values?: {
      customColors: {
        V1: { name: string, value: string }[],
        V2: { name: string, value: string }[]
      }
    }
  },
  clickedType?: { type: string },
  handleError?: (isError: boolean) => void,
}

const HomePage: FC<HomeProps> = ({ submitClicked, pageData: propsPageData, setSubmissionState, setChangedState, formChanged, uploadImage, updateProperty, updatePageData,
  designData, getPageData, currentProperty, clickedType, handleError }) => {
  const [pageData, setPageData] = useState({ ...cloneDeep(propsPageData.values) });
  const [errors, setErrors] = useState({});

  const handleUpdatePropertyLogo = () => {
    if (currentProperty) updateProperty(currentProperty.id, { logo: get(pageData, 'logo.src', '') });
  };

  const handleErrors = (error) => {
    setErrors(error);
    if (isEmpty(error)) setSubmissionState(false);
    handleError(!isEmpty(error));
  };

  const handleSubmit = () => {
    setSubmissionState(true);
    if (isEmpty(errors)) {
      updatePageData(sectionTypes.HOME, { values: pageData }).then(() => {
        setChangedState(false);
        setSubmissionState(false);
      });
    }
  };

  useEffect(() => {
    if (!isEmpty(propsPageData)) {
      setPageData({ ...cloneDeep(propsPageData.values) });
    } else {
      getPageData('home');
    }
  }, [propsPageData]);

  useEffect(() => {
    if (isEmpty(designData)) {
      getPageData('design');
    }
  }, [designData]);

  const triggerSaveRequired = () => {
    if (!formChanged) setChangedState(true);
  };

  const onChange = ({ target: { id, value } }) => {
    const newPageData = { ...pageData };
    set(newPageData, id, value);
    triggerSaveRequired();
    setPageData(newPageData);
  };

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setPageData({
      ...pageData,
      images: arrayMove(pageData.images, oldIndex, newIndex),
    });
    triggerSaveRequired();
  };

  const setLocation = (location) => {
    setPageData({
      ...pageData,
      map: {
        ...pageData.map,
        marker: {
          ...pageData.map.marker,
          lat: location[0].geometry.location.lat(),
          lng: location[0].geometry.location.lng(),
        },
        address: location[0].formatted_address,
      },
    });
    triggerSaveRequired();
  };

  const removeImage = (src) => {
    const filteredImages = pageData.images.filter(image => image.src !== src);
    onChange({ target: { id: 'images', value: filteredImages } });
  };

  const fileUploadSuccessCB = ({ data: { url } }, name, isBulkUpload) => {
    const newPageData = { ...pageData };
    if (isBulkUpload) {
      newPageData.images.push({ src: url });
      setPageData(newPageData);
    } else {
      set(newPageData, name, url);
      setPageData(newPageData);
    }
    updatePageData(sectionTypes.HOME, { values: newPageData }, () => {
      if (name === 'logo.src') {
        toast.success('Logo uploaded', toastOptions as ToastOptions);
        handleUpdatePropertyLogo();
      } else {
        toast.success('Image uploaded', toastOptions as ToastOptions);
      }
    });
  };

  const handleUpload = (file, name, isBulkUpload = false) => {
    handleFileUpload(uploadImage, file, name, fileUploadSuccessCB, isBulkUpload);
  };

  const discardChanges = () => {
    setChangedState(false);
    setPageData({ ...cloneDeep(propsPageData.values) });
  };

  useEffect(() => {
    if (clickedType.type === 'submit') {
      handleSubmit();
    }
    if (clickedType.type === 'discard') {
      discardChanges();
    }
  }, [clickedType]);

  const resolveIsDisabled = () => pageData.images.length > MAX_CAROUSEL_LENGTH;

  if (isEmpty(pageData) || isEmpty(designData)) return <div />;

  const siteTemplate = get(designData.values, 'siteTemplate');
  const customColors = (designData.values.customColors[siteTemplate] || []).map(item => item.value);

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <AnimationWrapper>
          <SeoFormSection
            onChange={onChange}
            title={get(pageData, 'seo.title', '')}
            description={get(pageData, 'seo.description', '')}
            handleErrors={handleErrors}
            submitIsClicked={submitClicked}
          />
          <Row>
            <Col xs="12">
              <CardAction>
                <CardHeader>
                  <CardTitle>Logos </CardTitle>
                  <div>
                    <CheckBox
                      id="logos-display-large"
                      label="Display large (on page load)"
                      checked={get(pageData, 'displayLargeLogo', false)}
                      onChange={() => onChange({ target: { id: 'displayLargeLogo', value: !get(pageData, 'displayLargeLogo', false) } })}
                    />
                  </div>
                </CardHeader>
                <Row>
                  <Col xs="6 pr-10">
                    <SecondLogoCard>
                      <CardHeader>
                        <CardTitle>Initial Logo</CardTitle>

                        <ActionCardIcon id="initialUpload">
                          <ImageUpload onDropAccepted={e => handleUpload(e, 'logo.src')} title="Upload logo" />
                        </ActionCardIcon>
                        <UncontrolledTooltip placement="top" target="initialUpload">
                    Upload logo
                        </UncontrolledTooltip>

                      </CardHeader>
                      <CardBody>
                        <SiteLogo>
                          {currentProperty.logo ?
                            <img src={currentProperty.logo || '/static/images/no-image.jpg'} alt="initial logo" />
                            :
                            <ImageUpload
                              onDropAccepted={e => handleUpload(e, 'logo.src')}
                              title="Upload logo"
                              dropzoneContainer={UploadContainerLogo}
                              dropzoneClassname="h-100"
                            />
                          }
                        </SiteLogo>
                      </CardBody>
                    </SecondLogoCard>
                  </Col>
                  <Col xs="6 pl-10">
                    <SecondLogoCard>
                      <CardHeader>
                        <CardTitle>Secondary Logo</CardTitle>

                        <ActionCardIcon id="secondaryUpload">
                          <ImageUpload onDropAccepted={e => handleUpload(e, 'secondaryLogo.src')} title="Upload logo" />
                        </ActionCardIcon>
                        <UncontrolledTooltip placement="top" target="secondaryUpload">
                    Upload logo
                        </UncontrolledTooltip>

                      </CardHeader>
                      <CardBody>
                        <Row>
                          <SiteLogo isSecond>
                            {get(pageData, 'secondaryLogo.src', '') ?
                              <img src={get(pageData, 'secondaryLogo.src', '') || '/static/images/no-image.jpg'} alt="initial logo" />
                              :
                              <ImageUpload
                                onDropAccepted={e => handleUpload(e, 'secondaryLogo.src')}
                                title="Upload logo"
                                dropzoneContainer={UploadContainerLogo}
                                dropzoneClassname="h-100"
                              />
                            }
                          </SiteLogo>
                        </Row>
                      </CardBody>
                    </SecondLogoCard>
                  </Col>
                </Row>
              </CardAction>
            </Col>
          </Row>
          <Row>
            <Col xs="12">
              <CardAction>
                <CardHeader>
                  <CardTitle>Images</CardTitle>

                  <ActionCardIcon id="imagesUpload">
                    <ImageUpload
                      onDropAccepted={e => handleUpload(e, 'images', true)}
                      title="Upload image"
                      disabled={resolveIsDisabled()}
                    />
                  </ActionCardIcon>
                  <UncontrolledTooltip placement="top" target="imagesUpload">
                    Upload New Image
                  </UncontrolledTooltip>
                </CardHeader>
                <CardBody>
                  <SortableList
                    onRemoveClick={removeImage}
                    images={pageData.images}
                    onSortEnd={onSortEnd}
                    onInputChange={onChange}
                    noInputs
                  />
                </CardBody>
              </CardAction>
            </Col>
          </Row>
          <Row>
            <Col xs="12">
              <CardBasic>
                <CardHeader>
                  <CardTitle>Header Carousel</CardTitle>
                </CardHeader>
                <CardBody>
                  <FormGroup className="mb-0">
                    <Row>
                      <Col md="9">
                        <FormItem
                          handleOnChange={onChange}
                          value={get(pageData, 'carousel.mainTitle', '')}
                          title="Header title"
                          id="carousel.mainTitle"
                          name="mainTitle"
                          section="HOME"
                          showTooltip
                        />
                      </Col>
                      <Col md="3">
                        <ColorPicker
                          id="carousel.mainTitleColor"
                          target="main-title-color"
                          value={get(pageData, 'carousel.mainTitleColor', ['V1', 'V4'].includes(siteTemplate) ? '#ffffff' : '#000000')}
                          onChange={onChange}
                          defaultColors={customColors}
                        />
                      </Col>
                    </Row>
                  </FormGroup>
                  <FormGroup className="mb-0">
                    <Row>
                      <Col md="9">
                        <FormItem
                          handleOnChange={onChange}
                          value={get(pageData, 'carousel.subTitle', '')}
                          title="Header subtitle"
                          id="carousel.subTitle"
                          name="subTitle"
                          section="HOME"
                          showTooltip
                        />
                      </Col>
                      <Col md="3">
                        <ColorPicker
                          id="carousel.subTitleColor"
                          target="main-sub-title-color"
                          value={get(pageData, 'carousel.subTitleColor', ['V1', 'V4'].includes(siteTemplate) ? '#ffffff' : '#000000')}
                          onChange={onChange}
                          defaultColors={customColors}
                        />
                      </Col>
                    </Row>
                  </FormGroup>
                  <FormGroup className="mb-0">
                    <CheckBox
                      id="carousel.applyTextContrastGradient"
                      label="Apply text contrast gradient"
                      checked={get(pageData, 'carousel.applyTextContrastGradient', true)}
                      onChange={() => onChange({ target: { id: 'carousel.applyTextContrastGradient', value: !get(pageData, 'carousel.applyTextContrastGradient', true) } })}
                    />
                  </FormGroup>
                </CardBody>
              </CardBasic>
            </Col>
          </Row>
          <Row>
            <Col xs="12" sm="6 pr-10">
              <CardBasicCustom>
                <CardHeader>
                  <CardTitle>First Ribbon</CardTitle>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col xs="12">
                      <FormGroup>
                        <FormItem
                          handleOnChange={onChange}
                          value={get(pageData, 'firstRibbon.title', '')}
                          title="Title"
                          id="firstRibbon.title"
                          name="firstRibbonTitle"
                          section="HOME"
                          showTooltip
                        />
                      </FormGroup>
                      <FormGroup>
                        <FormItem
                          handleOnChange={onChange}
                          value={get(pageData, 'firstRibbon.text', '')}
                          title="Text"
                          id="firstRibbon.text"
                          name="firstRibbonText"
                          section="HOME"
                          isTextArea
                          textAreaRow={37}
                          showTooltip
                          sectionClassName="mb-input-none"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </CardBasicCustom>
            </Col>
            <Col xs="12" sm="6 pl-10">
              <CardBasicCustom>
                <CardHeader>
                  <CardTitle>Quote</CardTitle>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col xs="12">
                      <FormGroup>
                        <FormItem
                          handleOnChange={onChange}
                          value={get(pageData, 'quote.text', '')}
                          title="Text (Quote 1)"
                          id="quote.text"
                          name="quoteText"
                          section="HOME"
                          isTextArea
                          textAreaRow={3}
                          showTooltip
                        />
                      </FormGroup>
                      <FormGroup>
                        <FormItem
                          handleOnChange={onChange}
                          value={get(pageData, 'quote.author', '')}
                          title="Author"
                          id="quote.author"
                          name="quoteAuthor"
                          section="HOME"
                          showTooltip
                        />
                      </FormGroup>
                      <FormGroup>
                        <FormItem
                          handleOnChange={onChange}
                          value={get(pageData, 'quote.details', '')}
                          title="Details"
                          id="quote.details"
                          name="quoteDetails"
                          section="HOME"
                          showTooltip
                        />
                      </FormGroup>
                      <Divider />
                      <FormGroup>
                        <FormItem
                          handleOnChange={onChange}
                          value={get(pageData, 'quote.secondText', '')}
                          title="Text (Quote 2)"
                          id="quote.secondText"
                          name="quoteText"
                          section="HOME"
                          isTextArea
                          textAreaRow={3}
                          showTooltip
                        />
                      </FormGroup>
                      <FormGroup>
                        <FormItem
                          handleOnChange={onChange}
                          value={get(pageData, 'quote.secondAuthor', '')}
                          title="Author"
                          id="quote.secondAuthor"
                          name="quoteAuthor"
                          section="HOME"
                          showTooltip
                        />
                      </FormGroup>
                      <FormGroup>
                        <FormItem
                          handleOnChange={onChange}
                          value={get(pageData, 'quote.secondDetails', '')}
                          title="Details"
                          id="quote.secondDetails"
                          name="quoteDetails"
                          section="HOME"
                          showTooltip
                        />
                      </FormGroup>
                      <Divider />
                      <FormGroup>
                        <FormItem
                          handleOnChange={onChange}
                          value={get(pageData, 'quote.thirdText', '')}
                          title="Text (Quote 3)"
                          id="quote.thirdText"
                          name="quoteText"
                          section="HOME"
                          isTextArea
                          textAreaRow={3}
                          showTooltip
                        />
                      </FormGroup>
                      <FormGroup>
                        <FormItem
                          handleOnChange={onChange}
                          value={get(pageData, 'quote.thirdAuthor', '')}
                          title="Author"
                          id="quote.thirdAuthor"
                          name="quoteAuthor"
                          section="HOME"
                          showTooltip
                        />
                      </FormGroup>
                      <FormGroup>
                        <FormItem
                          handleOnChange={onChange}
                          value={get(pageData, 'quote.thirdDetails', '')}
                          title="Details"
                          id="quote.thirdDetails"
                          name="quoteDetails"
                          section="HOME"
                          showTooltip
                          sectionClassName="mb-input-none"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </CardBasicCustom>
            </Col>
          </Row>
          <Row>
            <Col xs="12" sm="6 pr-10">
              <CardBasicCustom>
                <CardHeader>
                  <CardTitle>Second Ribbon</CardTitle>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col xs="12">
                      <FormItem
                        handleOnChange={onChange}
                        value={get(pageData, 'secondRibbon.title', '')}
                        title="Title"
                        id="secondRibbon.title"
                        name="secondRibbonTitle"
                        section="HOME"
                        showTooltip
                      />
                      <FormItem
                        handleOnChange={onChange}
                        value={get(pageData, 'secondRibbon.subtitle', '')}
                        title="Subtitle"
                        id="secondRibbon.subtitle"
                        name="secondRibbonSubtitle"
                        section="HOME"
                        showTooltip
                      />
                      <FormGroup className="mb-1">
                        <Label>Background</Label>
                        <Row>
                          <Col xs="3" className="p-x-12">
                            <ImagePreview>
                              <img src={get(pageData, 'secondRibbon.image', '') || '/static/images/no-image.jpg'} alt="background" />
                            </ImagePreview>
                          </Col>
                          <Col xs="3" className="p-x-12">
                            <div className="h-100">
                              <ImageUpload
                                onDropAccepted={e => handleUpload(e, 'secondRibbon.image')}
                                title="Upload image"
                                dropzoneContainer={() => <UploadContainer label="Upload Background" />}
                                dropzoneClassname="h-100"
                              />
                            </div>
                          </Col>
                        </Row>
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </CardBasicCustom>
            </Col>
            <Col xs="12" sm="6 pl-10">
              <CardBasicCustom>
                <CardHeader>
                  <CardTitle>Third Ribbon</CardTitle>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col xs="12">
                      <FormItem
                        handleOnChange={onChange}
                        value={get(pageData, 'thirdRibbon.title', '')}
                        title="Title"
                        id="thirdRibbon.title"
                        name="thirdRibbonTitle"
                        section="HOME"
                        showTooltip
                      />
                      <FormItem
                        handleOnChange={onChange}
                        value={get(pageData, 'thirdRibbon.text', '')}
                        title="Text"
                        id="thirdRibbon.text"
                        name="thirdRibbonText"
                        section="HOME"
                        isTextArea
                        textAreaRow={7}
                        showTooltip
                        sectionClassName="mb-input-none"
                      />
                    </Col>
                  </Row>
                </CardBody>
              </CardBasicCustom>
            </Col>
          </Row>
          <Row>
            <Col xs="12">
              <CardBasic>
                <CardHeader>
                  <CardTitle>Map</CardTitle>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col xs="9" className="pr-10">
                      <FormGroup>
                        <Geolocation setLocation={setLocation} address={get(pageData, 'map.address', '')} />
                      </FormGroup>
                    </Col>
                    <Col xs="3" className="pl-10">
                      <FormGroup>
                        <FormItem
                          handleOnChange={onChange}
                          value={get(pageData, 'map.zoom', '')}
                          title="Zoom Level"
                          id="map.zoom"
                          name="mapZoom"
                          section="HOME"
                          showTooltip
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <FormGroup>
                    <FormItem
                      handleOnChange={onChange}
                      value={get(pageData, 'map.styles', '')}
                      title="Style"
                      id="map.styles"
                      name="mapStyles"
                      section="HOME"
                      showTooltip
                    />
                  </FormGroup>
                  <FormGroup className="mb-40">
                    <Row>
                      <Col xs="2">
                        <ImagePreview>
                          <img src={get(pageData, 'map.marker.icon', '') || '/static/images/no-image.jpg'} alt="map icon" />
                        </ImagePreview>
                      </Col>
                      <Col xs="2">
                        <ImageUpload
                          onDropAccepted={e => handleUpload(e, 'map.marker.icon')}
                          title="Upload marker"
                          dropzoneContainer={UploadContainer}
                          dropzoneClassname="h-100"
                        />
                      </Col>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <FormItem
                      handleOnChange={onChange}
                      value={get(pageData, 'map.marker.url', '')}
                      title="Marker Url"
                      id="map.marker.url"
                      name="markerUrl"
                      section="HOME"
                      showTooltip
                      sectionClassName="mb-input-none"
                    />
                  </FormGroup>
                  <FormGroup>
                    <MapWrapper>
                      <Map
                        isMarkerShown
                        loadingElement={<div style={{ height: '100%' }} />}
                        containerElement={<div style={{ height: '100%' }} />}
                        mapElement={<div style={{ height: '100%' }} />}
                        map={pageData.map}
                      />
                    </MapWrapper>
                  </FormGroup>
                </CardBody>
              </CardBasic>
            </Col>
          </Row>
          <Row>
            <Col xs="12">
              <CardBasic>
                <CardHeader>
                  <CardTitle>Application Form Ribbon</CardTitle>
                </CardHeader>
                <CardBody>
                  <FormGroup>
                    <FormItem
                      handleOnChange={onChange}
                      value={get(pageData, 'applicationForm.title', '')}
                      title="Title"
                      id="applicationForm.title"
                      name="Title"
                      section="HOME"
                      showTooltip
                    />
                  </FormGroup>
                  <FormGroup className="mb-0">
                    <Label>Background</Label>
                    <Row>
                      <Col xs="2">
                        <ImagePreview>
                          <img src={get(pageData, 'applicationForm.image', '') || '/static/images/no-image.jpg'} alt="Background" />
                        </ImagePreview>
                      </Col>
                      <Col xs="2">
                        <div className="h-100">
                          <ImageUpload
                            onDropAccepted={e => handleUpload(e, 'applicationForm.image')}
                            title="Background"
                            dropzoneContainer={() => <UploadContainer label="Upload Background" />}
                            dropzoneClassname="h-100"
                          />
                        </div>
                      </Col>
                    </Row>
                  </FormGroup>
                </CardBody>
              </CardBasic>
            </Col>
          </Row>
        </AnimationWrapper>
      </form>
    </section>
  );
};

HomePage.defaultProps = {
  pageData: {},
  designData: {},
};

const mapStateToProps = state => ({
  pageData: state.pageData.homePageData,
  submitClicked: state.pageData.submitClicked,
  formChanged: state.pageData.formChanged,
  designData: state.pageData.designPageData,
  currentProperty: state.property.property,
});

export default connect(
  mapStateToProps,
  {
    ...actions.pageData,
    ...actionsDwell.property,
  },
)(withRouter(HomePage));
