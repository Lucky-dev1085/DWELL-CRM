import React, { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button } from 'reactstrap';
import actions from 'dwell/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import { isEqual, isEmpty } from 'lodash';
import { unitTypes } from 'dwell/constants';
import styled, { css } from 'styled-components';
import { SurveyProps } from 'src/interfaces';
import 'src/scss/pages/_paid_sources.scss';
import 'src/scss/pages/_competitor.scss';
import 'src/scss/pages/_leads_list.scss';

const SurveyCell = styled.div`
  border: 1px solid #d9def0;
  border-radius: 5px;
  height: 35px;
  padding: 7px 12px;
  font-size: .875rem;
  color: #0b2151;

  ${props => (props.cellSelect ? css`
    background: #fff url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5' viewBox='0 0 4 5'%3e%3cpath fill='%2315274d' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e") no-repeat right .75rem center/8px 10px;
    ` : '')}
`;

interface RentSurveyTableProps extends RouteComponentProps {
  surveys: SurveyProps[],
  currentDate: Date,
  activeTab: string,
  tab: string,
  handleSurveysChange: (updated: SurveyProps[], created: SurveyProps[], deleted: SurveyProps[]) => void,
  competitor: {date: string, name: string, id: string},
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
      text: 'Unit Type',
      style: { width: '15%' },
      editCellStyle: { width: '15%' },
      formatter: value => (
        <React.Fragment>
          <SurveyCell>{value}</SurveyCell>
          {!value && <div className="invalid-feedback">Unit type should not be empty</div>}
        </React.Fragment>),
    },
    {
      dataField: 'unit_type_name',
      text: 'Unit Type Name',
      style: { width: '20%' },
      editCellStyle: { width: '20%' },
      formatter: value => (
        <React.Fragment>
          <SurveyCell>{value}</SurveyCell>
          {!value && <div className="invalid-feedback">Unit type name should not be empty</div>}
        </React.Fragment>),
    },
    {
      dataField: 'unit_class',
      text: 'Unit Class',
      formatter: cell => <SurveyCell cellSelect>{unitTypes.UNIT_TYPES[cell]}</SurveyCell>,
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
      text: 'Market Rent',
      formatter: cell => <SurveyCell>{`$${cell.toFixed(2)}`}</SurveyCell>,
      style: { width: '20%' },
      editCellStyle: { width: '20%' },
    },
    {
      dataField: 'effective_rent',
      text: 'Effective Rent',
      formatter: cell => <SurveyCell>{`$${cell.toFixed(2)}`}</SurveyCell>,
      editable: false,
      style: { width: '20%', backgroundColor: '#fff', cursor: 'default' },
    },
    {
      dataField: 'concession_amount',
      text: 'Concession Rent',
      formatter: cell => <SurveyCell>{`$${cell.toFixed(2)}`}</SurveyCell>,
      style: { width: '20%' },
      editCellStyle: { width: '20%' },
    },
    {
      dataField: 'surveyId',
      text: '',
      editable: false,
      formatter: (cell, row) => <FontAwesomeIcon icon={faTimesCircle} className="delete-survey" onClick={() => deleteSurvey(cell, row.id)} />,
      style: { width: '5%', paddingTop: '20px' },
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
      <Button className="btn-secondary mr-1" style={{ marginTop: '-8px', height: '34px', fontSize: '.8125rem', padding: '0 15px' }} onClick={addSurvey} >Add Row</Button>
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
  },
)(withRouter(RentSurveyTable));
