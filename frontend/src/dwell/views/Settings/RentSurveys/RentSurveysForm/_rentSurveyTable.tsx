import React, { useEffect, useState, FC } from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Label } from 'reactstrap';
import actions from 'dwell/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons/faPlusCircle';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import { isEqual, isEmpty } from 'lodash';
import { unitTypes } from 'dwell/constants';
import { SurveyProps } from 'src/interfaces';
import 'src/scss/pages/_paid_sources.scss';
import 'src/scss/pages/_competitor.scss';
import 'src/scss/pages/_leads_list.scss';

interface RentSurveyTableProps extends RouteComponentProps {
  currentDate?: string | Date,
  handleSurveysChange: (updated: SurveyProps[], created: SurveyProps[], deleted: SurveyProps[]) => void,
  competitor: { id: string },
  surveys: SurveyProps[],
  activeTab: number,
  tab: number,
}

const RentSurveyTable: FC<RentSurveyTableProps> = ({ surveys, currentDate, activeTab, tab, handleSurveysChange, competitor }) => {
  const [data, setData] = useState([]);
  const [deleted, setDeleted] = useState([]);

  const onTableChange = (type, { cellEdit }) => {
    let result = data;
    if (type === 'cellEdit') {
      const { rowId, dataField, newValue } = cellEdit;
      result = result.map((row) => {
        if (row.id === rowId && row[dataField] !== newValue) {
          if (['market_rent', 'concession_amount'].includes(dataField) && row[dataField] === Number(newValue)) return row;
          const newRow = { ...row };
          newRow.isTemplate = false;
          if (dataField === 'market_rent' || dataField === 'concession_amount') {
            newRow[dataField] = Number(newValue);
            newRow.effective_rent = (newRow.market_rent - (newRow.concession_amount / 12));
          } else {
            newRow[dataField] = newValue;
          }
          return newRow;
        }
        return row;
      });
    }
    setData(result);
  };

  const getUpdatedSurveys = () => {
    const existingSurveys = data.filter(survey => survey.surveyId).map((survey) => {
      const newSurvey = { ...survey };
      newSurvey.id = newSurvey.surveyId;
      delete newSurvey.surveyId;
      return newSurvey;
    });
    return existingSurveys.filter(eSurvey => !isEqual(eSurvey, surveys.find(survey => survey.id === eSurvey.id)));
  };

  const getCreatedSurveys = () => {
    const templateSurveys = data.filter(survey => survey.isTemplate);
    return data.filter(survey => (templateSurveys.length === data.length ? !survey.surveyId && !survey.isTemplate : !survey.surveyId))
      .map((survey) => {
        const newSurvey = { ...survey };
        newSurvey.id = newSurvey.surveyId;
        delete newSurvey.surveyId;
        return newSurvey;
      });
  };

  const loadTableData = () => {
    let competitorSurveys = surveys.filter(survey => survey.competitor === competitor.id && survey.date === currentDate);
    if (isEmpty(competitorSurveys)) {
      const firstSurveys = surveys.filter(survey => survey.is_first && survey.competitor === competitor.id);
      if (!isEmpty(firstSurveys)) {
        competitorSurveys = firstSurveys.map((survey, index) => {
          const newSurvey = { ...survey };
          newSurvey.surveyId = null;
          newSurvey.id = index;
          newSurvey.market_rent = 0;
          newSurvey.effective_rent = 0;
          newSurvey.concession_amount = 0;
          newSurvey.competitor = competitor.id;
          newSurvey.isTemplate = true;
          return newSurvey;
        });
      }
    } else {
      competitorSurveys = competitorSurveys.map((survey, index) => {
        const newSurvey = { ...survey };
        newSurvey.surveyId = newSurvey.id;
        newSurvey.id = index;
        return newSurvey;
      });
    }
    setData(competitorSurveys);
    setDeleted([]);
  };

  useEffect(() => {
    loadTableData();
  }, [surveys, currentDate, activeTab]);

  useEffect(() => {
    if (activeTab === tab) {
      const updated = getUpdatedSurveys();
      const created = getCreatedSurveys();
      handleSurveysChange(updated, created, deleted);
    }
  }, [data]);

  const addSurvey = () => {
    const survey = {
      id: !isEmpty(data) ? data[data.length - 1].id + 1 : 0,
      surveyId: null,
      unit_type: '',
      unit_type_name: '',
      unit_class: 'STUDIO',
      market_rent: 0,
      effective_rent: 0,
      concession_amount: 0,
      competitor: competitor.id,
    };
    setData(data.concat([survey]));
  };

  const deleteSurvey = (id, rowId) => {
    setData(data.filter(survey => (id ? survey.surveyId !== id : survey.id !== rowId)));
    setDeleted(deleted.concat(id ? [id] : []));
  };

  const columns = [
    {
      dataField: 'unit_type',
      text: 'Unit type',
      style: { width: '15%' },
      editCellStyle: { width: '15%' },
      validator: newValue => (newValue ? true : { valid: false, message: 'Unit type should not be empty' }),
    },
    {
      dataField: 'unit_type_name',
      text: 'Unit type name',
      style: { width: '20%' },
      editCellStyle: { width: '20%' },
      validator: newValue => (newValue ? true : { valid: false, message: 'Unit type name should not be empty' }),
    },
    {
      dataField: 'unit_class',
      text: 'Unit class',
      formatter: cell => unitTypes.UNIT_TYPES[cell],
      editor: {
        type: Type.SELECT,
        options: [{
          value: 'STUDIO',
          label: 'Studio',
        }, {
          value: 'ONE_BED',
          label: '1 bed',
        }, {
          value: 'TWO_BED',
          label: '2 bed',
        }, {
          value: 'THREE_BED',
          label: '3 bed',
        }, {
          value: 'FOUR_BED',
          label: '4 bed',
        }, {
          value: 'ONE_BED_PENTHOUSE',
          label: '1 bed Penthouse',
        }, {
          value: 'TWO_BED_PENTHOUSE',
          label: '2 bed Penthouse',
        }, {
          value: 'THREE_BED_PENTHOUSE',
          label: '3 bed Penthouse',
        }],
      },
      style: { width: '20%' },
      editCellStyle: { width: '20%' },
    },
    {
      dataField: 'market_rent',
      text: 'Market rent',
      formatter: cell => `$${cell.toFixed(2)}`,
      style: { width: '20%' },
      editCellStyle: { width: '20%' },
    },
    {
      dataField: 'effective_rent',
      text: 'Effective rent',
      formatter: cell => `$${cell.toFixed(2)}`,
      editable: false,
      style: { width: '20%', backgroundColor: '#f7f7f7', cursor: 'default' },
    },
    {
      dataField: 'concession_amount',
      text: 'Concession amount',
      formatter: cell => `$${cell.toFixed(2)}`,
      style: { width: '20%' },
      editCellStyle: { width: '20%' },
    },
    {
      dataField: 'surveyId',
      text: '',
      editable: false,
      formatter: (cell, row) => <FontAwesomeIcon icon={faTimesCircle} className="delete-survey" onClick={() => deleteSurvey(cell, row.id)} />,
      style: { width: '5%' },
    },
  ];

  return (
    <React.Fragment>
      <BootstrapTable
        remote={{ cellEdit: true }}
        keyField="id"
        data={data}
        columns={columns}
        wrapperClasses="survey-table"
        onTableChange={onTableChange}
        cellEdit={cellEditFactory({ mode: 'click', blurToSave: true })}
        tabIndexCell
      />
      <Label><strong className="add-survey" onClick={addSurvey}><FontAwesomeIcon icon={faPlusCircle} className="mr-2" />Add row</strong></Label>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  surveys: state.survey.surveys,
});

RentSurveyTable.defaultProps = {
  currentDate: '',
};

export default connect(
  mapStateToProps,
  {
    ...actions.survey,
  },
)(withRouter(RentSurveyTable));
