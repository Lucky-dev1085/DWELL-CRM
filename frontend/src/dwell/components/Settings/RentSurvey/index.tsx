import React, { FC, useEffect, useState } from 'react';
import 'react-dates/initialize';
import 'src/scss/pages/_email_template.scss';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import actions from 'dwell/actions';
import { connect } from 'react-redux';
import {
  Col, Row,
  Label, TabContent, TabPane, Nav, NavItem,
  Modal, ModalHeader, ModalBody, ModalFooter, Button, NavLink,
} from 'reactstrap';
import { SettingsPrimaryButton } from 'dwell/views/Settings/styles';
import {
  RentSurveyModal,
  NavGroup,
  RentSurveyCustomTable,
} from 'dwell/components/Settings/RentSurvey/styles';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { getUTCDate } from 'dwell/views/Settings/utils';
import { paths } from 'dwell/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons/faPlusCircle';
import RentSurveyTable from 'dwell/components/Settings/RentSurvey/_rentSurveyTable';
import 'react-datepicker/dist/react-datepicker.css';
import CustomDatePicker from 'dwell/components/Settings/_datePicker';
import { NoCompetitorsHeader } from 'dwell/components/Settings/styles';
import { ListResponse, DetailResponse, updateSurveysProps } from 'src/interfaces';
import { getPropertyId } from 'src/utils';

interface RentSurveyModalWindowProps extends RouteComponentProps{
  handleClose: () => void,
  show: boolean,
  getSurveys: () => Promise<ListResponse>,
  getCompetitors: () => Promise<ListResponse>,
  surveys: {date: string}[],
  updateSurveys: (data: updateSurveysProps) => Promise<DetailResponse>,
  competitors: {date: string, name: string}[],
  curDate: Date,
  setCurDate: (date: string) => void,
  isNew: boolean,
}

const RentSurveySaveModal = ({ show, handleClose, handleSave, handleDiscard, disabled }) => {
  const closeBtn = <button className="close" onClick={() => handleClose()}>&times;</button>;
  return (
    <Modal
      isOpen={show}
      centered
      aria-labelledby="example-custom-modal-styling-title"
      className="survey-dialog"
    >
      <ModalHeader close={closeBtn}>Survey changes</ModalHeader>
      <ModalBody>
        Do you want to save or discard rent survey changes?
      </ModalBody>
      <ModalFooter>
        <Button className="btn-secondary" onClick={() => handleDiscard()} >Discard</Button>
        <Button className="btn btn-add-lead" color="primary" onClick={() => handleSave()} disabled={disabled} >Save</Button>
      </ModalFooter>
    </Modal>
  );
};

const RentSurveyModalWindow: FC<RentSurveyModalWindowProps> = ({
  handleClose,
  show,
  updateSurveys,
  competitors,
  history: { push },
  curDate,
  setCurDate,
  isNew,
  surveys,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [updated, setUpdated] = useState([]);
  const [created, setCreated] = useState([]);
  const [deleted, setDeleted] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment(new Date()).startOf('month').format('YYYY-MM-DD'));
  const [isShowingModal, setIsShowingModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [disabledDates, setDisabledDates] = useState([]);
  const [isSubmitting, setSubmit] = useState(false);

  const isDisabled = updated.some(survey => !survey.unit_type || !survey.unit_type_name) || created.some(survey => !survey.unit_type || !survey.unit_type_name) || !curDate;
  const closeBtn = <button className="close" onClick={() => { handleClose(); setSubmit(false); }} />;

  const handleSurveysChange = (updatedSurveys, createdSurveys, deletedSurveys) => {
    setUpdated(updatedSurveys);
    setCreated(createdSurveys);
    setDeleted(deletedSurveys);
  };

  const handleDiscardChanges = () => {
    setUpdated([]);
    setCreated([]);
    setDeleted([]);
    setIsShowingModal(false);
    setActiveTab(selectedTab);
    setCurDate(selectedDate);
  };

  const handleCloseModal = () => {
    setIsShowingModal(false);
    setSubmit(false);
  };

  const handleCreate = (isChangingTab = false) => {
    if (isDisabled) {
      setSubmit(true);
      return;
    }

    const createdSurveys = created.map((survey) => {
      const newSurvey = { ...survey };
      delete newSurvey.id;
      return newSurvey;
    });
    updateSurveys({ updated_surveys: updated, created_surveys: createdSurveys, deleted_surveys: deleted, date: curDate }).then(() => {
      if (!isChangingTab) {
        push({ pathname: paths.build(paths.client.SETTINGS.LIST_RENT_SURVEY, getPropertyId()), state: { tab: 6 } });
      } else {
        handleDiscardChanges();
      }
    });
    handleCloseModal();
    handleClose();
  };

  useEffect(() => {
    if (!isEmpty(surveys) && isNew) {
      const surveysDates = [...new Set(surveys.map(survey => survey.date))].sort();
      if (!isEmpty(surveysDates)) {
        const lastDate = getUTCDate(surveysDates[surveysDates.length - 1]);
        const currentDate = moment(lastDate.setMonth(lastDate.getMonth() + 1, 1))
          .format('YYYY-MM-DD');
        setCurDate(currentDate);
        setSelectedDate(currentDate);
        setDisabledDates(surveysDates);
      }
    }
  }, [show]);

  const handleAMonthChange = (date) => {
    const newDate = moment(getUTCDate(date)).format('YYYY-MM-DD');
    if (!disabledDates.includes(newDate)) {
      if (!isEmpty(deleted) || !isEmpty(created) || !isEmpty(updated)) {
        setIsShowingModal(true);
        setSelectedDate(newDate);
      } else {
        setCurDate(newDate);
        setSelectedDate(newDate);
      }
    }
  };

  const toggle = (tab) => {
    if (activeTab !== tab) {
      if (!isEmpty(deleted) || !isEmpty(created) || !isEmpty(updated)) {
        setIsShowingModal(true);
        setSelectedTab(tab);
      } else {
        setActiveTab(tab);
      }
    }
  };

  const handleSave = () => {
    handleCreate(true);
    handleClose();
  };

  const handleAddCompetitors = () => {
    handleClose();
    push({ pathname: paths.build(paths.client.SETTINGS.COMPETITORS, getPropertyId()), state: { tab: 4, isNewCompetitor: false } });
  };

  return (
    <RentSurveyModal
      isOpen={show}
      toggle={() => { handleClose(); setSubmit(false); }}
      centered
      isSubmitting={isSubmitting}
    >
      <ModalHeader close={closeBtn}>{isNew ? 'Add Rent Survey' : 'Edit rent survey'}</ModalHeader>
      <div className="animated fadeIn">
        <Row>
          <Col xs="12">
            <RentSurveySaveModal show={isShowingModal} handleClose={handleCloseModal} handleSave={handleSave} handleDiscard={handleDiscardChanges} disabled={isDisabled} />
            {isEmpty(competitors) ?
              <React.Fragment>
                <ModalBody>
                  <div className="empty-paid-sources">
                    <NoCompetitorsHeader>No competitors</NoCompetitorsHeader>
                    <div>In order to run a rent survey, you&#8216;ll need to add competitors to your property account.</div>

                  </div>
                </ModalBody>
                <ModalFooter>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAddCompetitors()}
                  >
                    <FontAwesomeIcon icon={faPlusCircle} /> New competitor
                  </button>
                </ModalFooter>
              </React.Fragment> :
              <React.Fragment>
                <ModalBody>
                  <Label>Survey Month</Label>
                  <div>
                    <CustomDatePicker handleAMonthChange={handleAMonthChange} curDate={curDate} disabledDates={disabledDates} isNew={isNew} />
                  </div>
                  <div className="mt-3 competitor-tabs">
                    <Nav tabs>
                      <NavGroup>
                        {competitors.map((competitor, index) => (
                          <NavItem key={index}>
                            <NavLink className={activeTab === index ? 'active' : ''} onClick={() => toggle(index)}>{competitor.name}</NavLink>
                          </NavItem>))}
                      </NavGroup>
                    </Nav>
                    <RentSurveyCustomTable>
                      <TabContent activeTab={activeTab}>
                        {competitors.map((competitor, index) => (
                          <TabPane tabId={index} key={index} >
                            <RentSurveyTable
                              competitor={competitor}
                              currentDate={curDate}
                              handleSurveysChange={handleSurveysChange}
                              tab={index}
                              activeTab={activeTab}
                              isSubmitting={isSubmitting}
                            />
                          </TabPane>))}
                      </TabContent>
                    </RentSurveyCustomTable>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button className="btn-secondary" style={{ height: '38px' }} onClick={() => handleClose()} >Cancel</Button>
                  <SettingsPrimaryButton className="btn btn-primary" style={{ height: '38px' }} onClick={() => handleCreate()}>{isNew ? 'Add Survey' : 'Save changes'}</SettingsPrimaryButton>
                </ModalFooter>
              </React.Fragment>
            }
          </Col>
        </Row>
      </div>
    </RentSurveyModal>

  );
};

const mapStateToProps = state => ({
  competitors: state.competitor.competitors,
  surveys: state.survey.surveys,
});

export default connect(
  mapStateToProps,
  {
    ...actions.survey,
    ...actions.competitor,
  },
)(withRouter(RentSurveyModalWindow));
