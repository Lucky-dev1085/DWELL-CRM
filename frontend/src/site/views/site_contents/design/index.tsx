import React, { useState, useEffect, FC } from 'react';
import { Row, Col, CardHeader, CardBody, FormGroup, Input } from 'reactstrap';
import { get, set, cloneDeep, isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import 'react-tagsinput/react-tagsinput.css';
import { toast, ToastOptions } from 'react-toastify';
import styled from 'styled-components';

import { sectionTypes, templates, customFont, toastOptions, googleFontsData, backgroundTransparencyChoices } from 'site/constants';
import actions from 'site/actions';
import { List, Spinner, ImageUpload, UploadContainer, ConfirmActionModal } from 'site/components';
import { ListResponse, DetailResponse, FontOption, DesignPageData } from 'src/interfaces';
import { CardBasic, CardTitle, FormLabel, CustomSelect, AnimationWrapper, GalleryWrapper, ButtonAction, ActionWrapper } from 'site/components/common';
import { handleFileUpload } from 'site/common/fileUpload';
import FontSelect from './_select';
import EditComingSoonModal from './EditComingSoonModal';
import { PrimaryButton } from '../../../../styles/common';
import EditExModal from './editExModal';

const CardBasicCustom = styled(CardBasic)`
  height: calc(100% - 20px);
`;

interface DesignProps extends RouteComponentProps {
  pageData: { values: DesignPageData },
  updatePageData: (type: string, data: { values: DesignPageData }, successCB?: () => void) => Promise<DetailResponse>,
  setChangedState: (state: boolean) => void,
  setSubmissionState: (isClick: boolean) => void,
  formChanged: boolean,
  isPageDataLoaded: boolean,
  getPageData: (type: string) => Promise<ListResponse>,
  uploadImage: (image: Blob, successCB?: (response: { data: { url } }) => void) => void;
  clickedType?: { type: string },
}

const DesignPage: FC<DesignProps> = ({ pageData, updatePageData, setChangedState, setSubmissionState, formChanged, getPageData, isPageDataLoaded, uploadImage, clickedType }) => {
  const [formValues, setFormValues] = useState(cloneDeep(pageData.values));

  const [headerFont, setHeaderFont] = useState(get(formValues, 'customFonts.headingFont'));
  const [bodyFont, setBodyFont] = useState(get(formValues, 'customFonts.bodyFont'));
  const [quoteFont, setQuoteFont] = useState(get(formValues, 'customFonts.quoteFont'));
  const [modalSubtitle, setModalSubtitle] = useState(get(formValues, 'customFonts.modalSubtitle'));
  const [isShowConfirm, toggleConfirm] = useState(false);
  const [isEditModalOpen, toggleEditModal] = useState(false);
  const [exFont, setExFont] = useState(get(formValues, 'customFonts.headingFont'));
  // const [exToggle, setExToggle] = useState('customFonts.headingFont');
  const [exToggle, setExToggle] = useState(get(formValues, 'exTextFont.customFonts'));
  const [exText, setExText] = useState(get(formValues, 'exTextFont.txt'));
  const [isEditExModalOpen, toggleEditExModal] = useState(false);

  const handleSubmit = () => {
    setSubmissionState(true);
    updatePageData(sectionTypes.DESIGN, { values: formValues }).then(() => {
      setChangedState(false);
      setSubmissionState(false);
    });
  };

  useEffect(() => {
    if (!isEmpty(pageData)) {
      setFormValues(cloneDeep(pageData.values));
    } else {
      getPageData('design');
    }
  }, [pageData]);

  useEffect(() => {
    if (!isEmpty(formValues)) {
      setHeaderFont(get(formValues, 'customFonts.headingFont'));
      setBodyFont(get(formValues, 'customFonts.bodyFont'));
      setQuoteFont(get(formValues, 'customFonts.quoteFont'));
      setModalSubtitle(get(formValues, 'customFonts.modalSubtitle'));
      setExText(get(formValues, 'exTextFont.txt') ? get(formValues, 'exTextFont.txt') : 'The quick brown fox jumps over the lazy dog');
      setExToggle(get(formValues, 'exTextFont.customFonts'));

      if (!('imageCategories' in formValues)) {
        const category = ['community', 'apartment'];

        const oldFormValues = cloneDeep(formValues);
        set(oldFormValues, 'imageCategories', category);
        setFormValues(oldFormValues);
      }

      switch (exToggle) {
        case 'customFonts.headingFont':
          setExFont(get(formValues, 'customFonts.headingFont'));
          break;
        case 'customFonts.bodyFont':
          setExFont(get(formValues, 'customFonts.bodyFont'));
          break;
        case 'customFonts.quoteFont':
          setExFont(get(formValues, 'customFonts.quoteFont'));
          break;
        case 'customFonts.modalSubtitle':
          setExFont(get(formValues, 'customFonts.modalSubtitle'));
          break;
      }
    }
  }, [formValues, exToggle]);

  const triggerSaveRequired = () => {
    if (!formChanged) setChangedState(true);
  };

  const onChange = ({ target: { id, value } }) => {
    set(formValues, id, value !== 'default' ? value : '');
    if ((id === 'customFonts.headingFont') || (id === 'customFonts.bodyFont') || (id === 'customFonts.quoteFont') || (id === 'customFonts.modalSubtitle')) {
      set(formValues, 'exTextFont.customFonts', id);
    }
    triggerSaveRequired();
    setFormValues({ ...formValues });
  };

  const discardChanges = () => {
    setChangedState(false);
    setFormValues(cloneDeep(pageData.values));
  };

  const fileUploadSuccessCB = ({ data: { url } }, name) => {
    const oldFormValues = cloneDeep(formValues);
    set(oldFormValues, name, { src: url });
    setFormValues(oldFormValues);
    updatePageData(sectionTypes.DESIGN, { values: oldFormValues }, () => toast.success('Image uploaded', toastOptions as ToastOptions));
  };

  useEffect(() => {
    if (clickedType.type === 'submit') {
      handleSubmit();
    }
    if (clickedType.type === 'discard') {
      discardChanges();
    }
  }, [clickedType]);

  const onRemoveClick = (name) => {
    const oldFormValues = cloneDeep(formValues);
    set(oldFormValues, name, { src: '' });
    setFormValues(oldFormValues);
    updatePageData(sectionTypes.DESIGN, { values: oldFormValues }, () => toast.success('Image removed', toastOptions as ToastOptions));
  };

  const onSubmit = (name, data) => {
    const { title, location, category } = data;
    set(formValues, `${name}.title`, title);
    set(formValues, `${name}.location`, location);
    set(formValues, `${name}.category`, category);
    setFormValues(formValues);
    updatePageData(sectionTypes.DESIGN, { values: formValues }, () => toast.success('Image updated', toastOptions as ToastOptions));
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const fonts = customFont.concat(googleFontsData.items) as FontOption[];
  const siteTemplate = get(formValues, 'siteTemplate');

  const exToggleBtnClick = (selToggle) => {
    setExToggle(selToggle);
    onChange({ target: { id: 'exTextFont', value: { txt: exText, customFonts: selToggle } } });
  };

  const exTextChanged = (data) => {
    setExText(data);
    set(formValues, 'exTextFont.txt', data);
    setFormValues(formValues);
    updatePageData(sectionTypes.DESIGN, { values: formValues }, () => toast.success('Text Changed', toastOptions as ToastOptions));
  };

  const googleFonts = (
    <React.Fragment>
      <EditExModal
        onSubmit={(data) => { exTextChanged(data); }}
        isModalOpen={isEditExModalOpen}
        onModalToggle={() => toggleEditExModal(!isEditExModalOpen)}
        data={exText}
      />
      <Row className="mb-20">
        <Col sm="12">
          <FormGroup className="w-100">
            <FormLabel style={{ fontFamily: exFont, fontSize: '24px' }} onClick={() => toggleEditExModal(true)} >{exText}</FormLabel>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col xs="6 pr-10">
          <FormGroup className="w-100">
            <FormLabel style={{ fontFamily: headerFont }} >Header font</FormLabel>
            <Row>
              <Col xs="10">
                <FontSelect onChange={onChange} pageData={formValues} options={fonts} optionName="customFonts.headingFont" />
              </Col>
              <Col>
                <PrimaryButton disabled={exToggle === 'customFonts.headingFont'} onClick={() => exToggleBtnClick('customFonts.headingFont')}>View</PrimaryButton>
              </Col>
            </Row>
          </FormGroup>
          <FormGroup className="w-100 mb-0">
            <FormLabel htmlFor="customFonts.quoteFont" style={{ fontFamily: quoteFont }}>Quote font</FormLabel>
            <Row>
              <Col xs="10">
                <FontSelect onChange={onChange} pageData={formValues} options={fonts} optionName="customFonts.quoteFont" />
              </Col>
              <Col>
                <PrimaryButton disabled={exToggle === 'customFonts.quoteFont'} onClick={() => exToggleBtnClick('customFonts.quoteFont')}>View</PrimaryButton>
              </Col>
            </Row>
          </FormGroup>
        </Col>
        <Col xs="6 pl-10">
          <FormGroup className="w-100">
            <FormLabel htmlFor="customFonts.bodyFont" style={{ fontFamily: bodyFont }}>Body font</FormLabel>
            <Row>
              <Col xs="10">
                <FontSelect onChange={onChange} pageData={formValues} options={fonts} optionName="customFonts.bodyFont" />
              </Col>
              <Col>
                <PrimaryButton disabled={exToggle === 'customFonts.bodyFont'} onClick={() => exToggleBtnClick('customFonts.bodyFont')}>View</PrimaryButton>
              </Col>
            </Row>
          </FormGroup>
          <FormGroup className="w-100 mb-0">
            <FormLabel htmlFor="customFonts.modalSubtitle" style={{ fontFamily: modalSubtitle }}>Modal subtitle</FormLabel>
            <Row>
              <Col xs="10">
                <FontSelect onChange={onChange} pageData={formValues} options={fonts} optionName="customFonts.modalSubtitle" />
              </Col>
              <Col>
                <PrimaryButton disabled={exToggle === 'customFonts.modalSubtitle'} onClick={() => exToggleBtnClick('customFonts.modalSubtitle')}>View</PrimaryButton>
              </Col>
            </Row>
          </FormGroup>
        </Col>
      </Row>
      <Row className="mt-30 pt-4" style={{ borderTop: '1px solid #1807074d' }}>
        <Col xs="6 pr-10">
          <FormGroup className="w-100">
            <FormLabel htmlFor="backgroundTransparencyOption">Text background transparency option</FormLabel>
            <CustomSelect value={get(formValues, 'backgroundTransparencyOption')} defaultValue="NONE" id="backgroundTransparencyOption" onChange={onChange}>
              <option label="-- select an option -- " value="default" />
              {Object.keys(backgroundTransparencyChoices).map(i => <option value={i}>{backgroundTransparencyChoices[i]}</option>)}
            </CustomSelect>
          </FormGroup>
        </Col>
      </Row>

    </React.Fragment>
  );

  if (!isPageDataLoaded || isEmpty(pageData)) return <Spinner />;

  return (
    <AnimationWrapper>
      <Row>
        <Col xs="6">
          <CardBasicCustom>
            <CardHeader>
              <CardTitle>Site Template</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col xs="12">
                  <FormLabel for="siteTemplate">Select site template</FormLabel>
                  <CustomSelect
                    value={siteTemplate}
                    id="siteTemplate"
                    onChange={onChange}
                  >
                    {
                      Object.keys(templates).map((t, i) => (
                        <option value={t} key={i}>{t}</option>
                      ))
                    }
                  </CustomSelect>
                </Col>
              </Row>
            </CardBody>
          </CardBasicCustom>
        </Col>
        <Col xs="6">
          <CardBasicCustom>
            <CardHeader>
              <CardTitle>Coming Soon Page</CardTitle>
            </CardHeader>
            <CardBody>
              <ConfirmActionModal
                title="Confirm Delete"
                text="You are about to delete this media file"
                onConfirm={() => { onRemoveClick('comingSoonImage'); toggleConfirm(false); }}
                show={isShowConfirm}
                onClose={() => toggleConfirm(false)}
              />
              {formValues && formValues.comingSoonImage &&
                <EditComingSoonModal
                  onSubmit={(data) => { onSubmit('comingSoonImage', data); }}
                  isModalOpen={isEditModalOpen}
                  onModalToggle={() => toggleEditModal(!isEditModalOpen)}
                  data={formValues.comingSoonImage}
                  categories={get(formValues, 'imageCategories')}
                />
              }
              <Row>
                {formValues && ('comingSoonImage' in formValues) && ('src' in formValues.comingSoonImage) && (formValues.comingSoonImage.src !== '') &&
                  <Col xs="3 pr-10">
                    <GalleryWrapper>
                      <ActionWrapper>
                        <ButtonAction onClick={() => toggleEditModal(true)}>
                          <i className="ri-edit-2-fill" />
                        </ButtonAction>
                        <ButtonAction onClick={() => toggleConfirm(true)} >
                          <i className="ri-delete-bin-line" />
                        </ButtonAction>
                      </ActionWrapper>
                      <img src={formValues.comingSoonImage.src} alt="Coming soon" style={{ width: '100%', height: '100%' }} />
                    </GalleryWrapper>
                  </Col>
                }
                <Col xs="3 pl-10">
                  <ImageUpload
                    onDropAccepted={e => handleFileUpload(uploadImage, e, 'comingSoonImage', fileUploadSuccessCB)}
                    title="Upload Image"
                    dropzoneContainer={UploadContainer}
                    dropzoneClassname="h-100"
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
              <CardTitle>Fonts</CardTitle>
            </CardHeader>
            <CardBody>
              {googleFonts}
            </CardBody>
          </CardBasic>
        </Col>
      </Row>
      <Row>
        <Col xs="12">
          <CardBasic>
            <CardHeader>
              <CardTitle>Site Colors</CardTitle>
            </CardHeader>
            <CardBody>
              {formValues && formValues.customColors &&
                <List
                  objectKey="value"
                  data={formValues.customColors[siteTemplate]}
                  colorLabels={formValues.labels}
                  onChange={onChange}
                  id={`customColors[${siteTemplate}]`}
                />
              }
            </CardBody>
          </CardBasic>
        </Col>
      </Row>
      <Row>
        <Col xs="12">
          <CardBasic>
            <CardHeader>
              <CardTitle>Custom CSS Codes</CardTitle>
            </CardHeader>
            <CardBody>
              <Input
                id={`customCssCodes[${siteTemplate}]`}
                value={formValues && formValues.customCssCodes[siteTemplate]}
                onChange={onChange}
                type="textarea"
                style={{ height: 700 }}
              />
            </CardBody>
          </CardBasic>
        </Col>
      </Row>
    </AnimationWrapper>
  );
};

const mapStateToProps = state => ({
  isPageDataLoaded: state.pageData.isPageDataLoaded,
  pageData: state.pageData.designPageData,
  formChanged: state.pageData.formChanged,
});

export default connect(
  mapStateToProps,
  {
    ...actions.pageData,
  },
)(withRouter(DesignPage));
