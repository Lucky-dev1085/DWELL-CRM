import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import actions from 'dwell/actions/index';
import moment from 'moment';
import { getUTCDate } from 'dwell/views/Settings/utils';
import { isEmpty } from 'lodash';
import {
  ContentText,
  ContentTitleSm,
  Divider,
  FormGroupBar,
  FormLabel,
  SettingsFooter,
  CustomAddButton,
  FormActions,
} from 'dwell/views/Settings/styles';
import Action from 'dwell/views/Settings/_action';
import { ListResponse, DetailResponse } from 'src/interfaces';
import { RentSurveyModalWindow } from 'dwell/components';
import { ConfirmActionModal } from 'site/components';

interface RentSurveyProps extends RouteComponentProps {
  getSurveys: () => Promise<ListResponse>,
  getCompetitors: () => Promise<ListResponse>,
  surveys: {id: number, date: string}[],
  updateSurveys: ({ deleted_surveys: number, date: string }) => Promise<DetailResponse>,
}

const RentSurvey: FC<RentSurveyProps> = ({ updateSurveys, getSurveys, surveys, getCompetitors }) => {
  const [surveysDates, setSurveysDates] = useState([]);
  const [isShowModalWindow, setShowModalWindow] = useState(false);
  const [curDate, setCurDate] = useState(moment(new Date()).startOf('month').format('YYYY-MM-DD'));
  const [isNew, setIsNew] = useState(true);
  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [removeItemId, setRemoveItemId] = useState(null);

  const handleCloseModalWindow = () => {
    setShowModalWindow(false);
  };

  const handleOpenModalWindow = () => {
    setShowModalWindow(true);
  };

  useEffect(() => {
    getSurveys();
    getCompetitors();
  }, []);

  useEffect(() => {
    if (!isEmpty(surveys)) {
      setSurveysDates([...new Set(surveys.map(survey => survey.date))].sort());
    }
  }, [surveys]);

  const handleCreate = () => {
    setIsNew(true);
    setCurDate(moment(new Date()).startOf('month').format('YYYY-MM-DD'));
    handleOpenModalWindow();
  };

  const handleEdit = (date) => {
    setIsNew(false);
    setCurDate(date);
    handleOpenModalWindow();
  };

  const handleDelete = (date) => {
    const deleteSurveys = surveys.filter(survey => survey.date === date).map(survey => survey.id);
    setRemoveItemId({ deleteSurveys, date });
    toggleConfirmModal(true);
  };

  const confirmDelete = () => {
    const { deleteSurveys, date } = removeItemId;
    toggleConfirmModal(false);
    updateSurveys({ deleted_surveys: deleteSurveys, date });
  };

  return (
    <React.Fragment>
      <RentSurveyModalWindow show={isShowModalWindow} handleClose={handleCloseModalWindow} curDate={curDate} surveys={surveys} setCurDate={setCurDate} isNew={isNew} />
      <ConfirmActionModal
        text="You are about to delete this rent survey"
        itemName={removeItemId ? removeItemId.date : ''}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        onClose={() => toggleConfirmModal(false)}
        show={showConfirmModal}
      />
      <ContentTitleSm>Rent Surveys</ContentTitleSm>
      <ContentText>Record competitor rates to track submarket pricing across unit type.</ContentText>
      <Divider />
      { !isEmpty(surveys) ?
        surveysDates.map((date, index) => (
          <FormGroupBar key={index} style={{ height: '49px' }}>
            <FormLabel>{moment(getUTCDate(date)).format('MMMM YYYY')}</FormLabel>
            <FormActions>
              <Action handleClick={() => handleEdit(date)} actionType="edit" index={index} instanceType="survey" />
              <Action handleClick={() => handleDelete(date)} actionType="delete" index={index} instanceType="template" />
            </FormActions>
          </FormGroupBar>)) :
        (<React.Fragment />)}
      <SettingsFooter>
        <CustomAddButton onClick={() => handleCreate()} ><i className="ri-add-circle-fill" />Add Survey</CustomAddButton>
      </SettingsFooter>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  surveys: state.survey.surveys,
});

export default connect(
  mapStateToProps,
  {
    ...actions.survey,
    ...actions.competitor,
  },
)(withRouter(RentSurvey));
