import React, { useEffect, useState, FC } from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Card, CardBody, CardHeader, Col, CardFooter, Row, Label, TabContent, TabPane, Nav, NavItem, NavLink, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import actions from 'dwell/actions';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DatePicker from 'react-datepicker';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons/faPlusCircle';
import { getUTCDate } from 'dwell/views/Settings/utils';
import { paths } from 'dwell/constants';
import 'src/scss/pages/_paid_sources.scss';
import 'src/scss/pages/_competitor.scss';
import 'react-datepicker/dist/react-datepicker.css';
import { getPropertyId } from 'src/utils';
import { SurveyProps, updateSurveysProps } from 'src/interfaces';
import RentSurveyTable from './_rentSurveyTable';

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

interface RentSurveyFormProps extends RouteComponentProps {
  competitors: { name: string }[],
  surveys: SurveyProps[],
  updateSurveys: (data: updateSurveysProps) => Promise<void>,
  getSurveys: () => void,
  getCompetitors: () => void,
}

const RentSurveyForm: FC<RentSurveyFormProps> = ({ getSurveys, location: { pathname, search }, getCompetitors, surveys, updateSurveys, competitors, history: { push } }) => {
  const [curDate, setCurDate] = useState(moment(new Date()).startOf('month').format('YYYY-MM-DD'));
  const [activeTab, setActiveTab] = useState(0);
  const [updated, setUpdated] = useState([]);
  const [created, setCreated] = useState([]);
  const [deleted, setDeleted] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment(new Date()).startOf('month').format('YYYY-MM-DD'));
  const [isShowingModal, setIsShowingModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [disabledDates, setDisabledDates] = useState([]);
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    if (pathname.split('/').pop() !== 'new') {
      setCurDate(search.split('=').pop());
      setIsNew(false);
    }
    getSurveys();
    getCompetitors();
  }, []);

  useEffect(() => {
    if (pathname.split('/').pop() === 'new') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const surveysDates = [...new Set(surveys.map(survey => survey.date))].sort() as any;
      if (!isEmpty(surveysDates)) {
        const lastDate = getUTCDate(surveysDates[surveysDates.length - 1]);
        const currentDate = moment(lastDate.setMonth(lastDate.getMonth() + 1, 1))
          .format('YYYY-MM-DD');
        setCurDate(currentDate);
        setSelectedDate(currentDate);
        setDisabledDates(surveysDates);
      }
    }
  }, [surveys]);

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
  };

  const handleCreate = (isChangingTab = false) => {
    const createdSurveys = created.map((survey) => {
      const newSurvey = { ...survey };
      delete newSurvey.id;
      return newSurvey;
    });
    updateSurveys({ updated_surveys: updated, created_surveys: createdSurveys, deleted_surveys: deleted, date: curDate }).then(() => {
      if (!isChangingTab) {
        push({ pathname: paths.build(paths.client.SETTINGS.LIST_RENT_SURVEY, getPropertyId()), state: { tab: 6 } });
      } else {
        getSurveys();
        handleDiscardChanges();
      }
    });
    handleCloseModal();
  };

  const handleCancel = () => {
    const siteId = getPropertyId();
    push(paths.build(paths.client.SETTINGS.LIST_RENT_SURVEY, siteId));
  };

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
  };

  const isDisabled = updated.some(survey => !survey.unit_type || !survey.unit_type_name) || created.some(survey => !survey.unit_type || !survey.unit_type_name) || !curDate;
  return (
    <div className="animated fadeIn">
      <Row>
        <Col xs="12">
          <Card className="create-paid-source">
            <CardHeader>
              {isNew ? 'Create rent survey' : 'Edit rent survey'}
            </CardHeader>
            <CardBody>
              <RentSurveySaveModal show={isShowingModal} handleClose={handleCloseModal} handleSave={handleSave} handleDiscard={handleDiscardChanges} disabled={isDisabled} />
              {isEmpty(competitors) ?
                <Card className="empty-paid-sources-card">
                  <CardBody>
                    <div className="empty-paid-sources">
                      <h4>No competitors</h4>
                      <div>In order to run a rent survey, you&#8216;ll need to add competitors to your property account.</div>
                      <button
                        className="btn btn-primary"
                        onClick={() => push({ pathname: paths.build(paths.client.SETTINGS.COMPETITORS, getPropertyId()), state: { tab: 4, isNewCompetitor: true } })}
                      >
                        <FontAwesomeIcon icon={faPlusCircle} /> New competitor
                      </button>
                    </div>
                  </CardBody>
                </Card> :
                <Card>
                  <CardBody>
                    <Label>Survey Month</Label>
                    <div>
                      <DatePicker
                        selected={getUTCDate(curDate)}
                        onChange={date => handleAMonthChange(date)}
                        dateFormat="MMMM yyyy"
                        minDate={getUTCDate('2019-01-01')}
                        excludeDates={disabledDates.map(date => getUTCDate(date))}
                        showMonthYearPicker
                        disabled={!isNew}
                      />
                    </div>
                    <div className="mt-4 competitor-tabs">
                      <Nav tabs>
                        {competitors.map((competitor, index) => (
                          <NavItem key={index}>
                            <NavLink className={activeTab === index ? 'active' : ''} onClick={() => toggle(index)}>{competitor.name}</NavLink>
                          </NavItem>))}
                      </Nav>
                      <TabContent activeTab={activeTab}>
                        {competitors.map((competitor, index) => (
                          <TabPane tabId={index} key={index} >
                            <RentSurveyTable competitor={competitor} currentDate={curDate} handleSurveysChange={handleSurveysChange} tab={index} activeTab={activeTab} />
                          </TabPane>))}
                      </TabContent>
                    </div>
                  </CardBody>
                  <CardFooter className="bg-white">
                    <button className="mr-1 btn btn-primary float-right" onClick={() => handleCreate()} disabled={isDisabled}>Save survey</button>
                    <button className="mr-1 btn btn-secondary float-right" onClick={handleCancel}>Cancel</button>
                  </CardFooter>
                </Card>}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
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
)(withRouter(RentSurveyForm));
