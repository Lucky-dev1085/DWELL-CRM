import React, { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import BootstrapTable from 'react-bootstrap-table-next';
import { Modal, ModalBody, ModalHeader, Row, UncontrolledTooltip } from 'reactstrap';
import { cloneDeep, isEmpty } from 'lodash';
import Loader from 'dwell/components/Loader';
import 'src/scss/pages/_reports.scss';
import 'src/scss/pages/_leads_list.scss';
import { getPropertyId } from 'src/utils';
import { PropertyProps } from 'src/interfaces';
import { CallPlay, CallSourceLabel, CallTime, RecordingNotExist } from 'dwell/views/calls/styles';
import { Slash } from 'react-feather';
import AudioPlayer from 'dwell/components/AudioPlayer';
import moment from 'moment-timezone';
import { PrimaryButton } from 'styles/common';
import { formatToOneDecimal, sortColumns } from './ReportBlocks/_utils';
import ScoredCallsModalProps from './_requireCallRescoreModal';
import { CallQuestionCol, ScoredCallsTableContainer, ScoreLink, PrevScore } from './styles';

interface ScoredCallsModalProps {
  show: boolean,
  isLoaded: boolean,
  handleClose: () => void,
  scoredCalls: {
    [key: string]: string | number,
  }[],
  currentProperty: PropertyProps,
  scoringQuestions: { id?: number, weight: number, question: string }[],
  requireRescore: (id: number, reason: string) => void,
}

const ScoredCallsModal: FC<ScoredCallsModalProps> = ({ show, handleClose, scoredCalls, isLoaded, scoringQuestions, requireRescore, currentProperty }) => {
  const [data, setData] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [showRequireRescoreModal, setShowRequireRescoreModal] = useState(false);
  const [scoredCallId, setScoredCallId] = useState(null);

  useEffect(() => {
    if (!isEmpty(scoredCalls)) {
      const callsData = scoredCalls.map(call => ({ ...call, isPlaying: false, curTime: 0, clickedTime: 0, agent_name: call.agent_name || '', date: call.date.toString() }));
      setData(callsData.sort((rowA, rowB) => Date.parse(rowB.date) - Date.parse(rowA.date)));
    }
  }, [scoredCalls]);

  const handleAudioClick = (rowId) => {
    const callsData = data.map(call => ({ ...call, isPlaying: call.id === rowId }));
    setData(callsData);
  };

  const setPlayingData = (rowId, curTime) => {
    const callsData = data.map((call) => {
      if (call.id === rowId) {
        return { ...call, curTime };
      } return call;
    });
    setData(callsData);
  };

  const onClose = () => {
    const callsData = data.map(call => ({ ...call, isPlaying: false }));
    setData(callsData);
    handleClose();
  };

  const columns = [
    {
      dataField: 'lead_name',
      text: 'Name',
      sort: true,
      formatter: (name, row) => (name ?
        <a href={`/${getPropertyId()}/leads/${row.lead_id}`} target="_blank">{row.lead_name}</a> : ''),
    },
    {
      dataField: 'source',
      text: 'Call Source',
      formatter: cell => <CallSourceLabel>{cell}</CallSourceLabel>,
      sort: true,
    },
    {
      dataField: 'prospect_phone_number',
      text: 'Phone Number',
      sort: true,
    },
    {
      dataField: 'agent_name',
      text: 'Agent Name',
      sort: true,
    },
    {
      dataField: 'recording',
      text: 'Call Record',
      sort: true,
      formatter: (cell, row) => (
        <React.Fragment>
          <div className="d-flex align-items-center">
            {(cell && !row.isPlaying) &&
              <CallPlay onClick={() => (cell ? handleAudioClick(row.id) : null)} active>
                <i className="ri-play-circle-fill" />
              </CallPlay>}
            {cell ?
              <React.Fragment>
                {row.isPlaying && <AudioPlayer recording={cell} callId={row.id} playing setPlayingData={setPlayingData} clickedWordTime={row.clickedTime} />}
                {!row.isPlaying && <CallTime>{moment.utc(row.duration * 1000).format('m:ss')}</CallTime>}
              </React.Fragment>
              : <RecordingNotExist><Slash />None</RecordingNotExist>}
          </div>
        </React.Fragment>),
    },
    {
      dataField: 'date',
      text: 'Date',
      sort: true,
      formatter: cell => <div >{moment(cell).local().format('lll')}</div>,
    },
    {
      dataField: 'score',
      text: 'Score',
      sort: true,
      formatter: (cell, row) => (
        <>
          <ScoreLink
            onClick={() => setExpanded(expanded.length && expanded[0] === row.id ? [] : [row.id])}
            expanded={expanded.includes(row.id)}
          >
            {['-', 'N/A'].includes(cell) ? cell : `${formatToOneDecimal(cell)}%`}
          </ScoreLink>
          {row.prev_score && <PrevScore>Prev. {row.prev_score}%</PrevScore>}
        </>
      ),
      formatExtraData: { expandedRows: expanded },
    },
  ];

  if (!currentProperty.is_call_rescore_required_today) {
    columns.push({
      dataField: 'call_score_id',
      text: '',
      sort: false,
      formatter: cell => (
        <PrimaryButton
          onClick={() => {
            setShowRequireRescoreModal(true);
            setScoredCallId(cell);
          }}
        >
          Rescore
        </PrimaryButton>
      ),
    });
  }

  const expandRow = {
    parentClassName: 'row-selected',
    className: 'row-score',
    renderer: row => (
      <div className="row no-gutters">
        {scoringQuestions.map((q, index) => (
          <>
            <CallQuestionCol id={`row-${row.id}-question-${index}`}>
              <span>Q{index + 1}:</span>
              {row.yes_questions.includes(q.id) && <i className="ri-checkbox-circle-fill text-success" />}
              {row.omitted_questions.includes(q.id) && <i className="ri-indeterminate-circle-fill text-warning" />}
              {!row.yes_questions.concat(row.omitted_questions).includes(q.id) && <i className="ri-close-circle-fill text-danger" />}
              <span>{q.weight}pts</span>
            </CallQuestionCol>
            <UncontrolledTooltip trigger="hover" placement="top" fade={false} target={`row-${row.id}-question-${index}`}>
              {q.question}
            </UncontrolledTooltip>
          </>
        ))}
      </div>
    ),
    expanded,
    expandByColumnOnly: true,
  };

  const indication = () => (
    <React.Fragment>
      <div className="empty-table">
        {/* eslint-disable-next-line jsx-a11y/heading-has-content */}
        <div>{!isLoaded ? <Loader /> : <h4>No results found</h4>}</div>
      </div>
    </React.Fragment>);

  const onTableChange = (changeType, { sortField, sortOrder, data: tableData }) => {
    let result = cloneDeep(tableData);
    if (changeType === 'sort') {
      result = sortColumns(sortOrder, sortField, result);
      setData(result);
    }
  };

  const closeBtn = <button className="close" onClick={() => onClose()}>&times;</button>;

  return (
    <Modal
      isOpen={show}
      centered
      toggle={() => onClose()}
      size="xl"
      aria-labelledby="example-custom-modal-styling-title"
      className="drilldown reports"
    >
      <ModalHeader close={closeBtn}>
        <span>Scored calls</span>
      </ModalHeader>
      <ModalBody>
        <Row>
          <ScoredCallsTableContainer xs={12}>
            <BootstrapTable
              remote={{ sort: true }}
              keyField="id"
              data={data || []}
              columns={columns}
              wrapperClasses="drilldown-table audition table-responsive table-alpha"
              noDataIndication={indication}
              onTableChange={onTableChange}
              expandRow={expandRow}
              bordered={false}
            />
          </ScoredCallsTableContainer>
        </Row>
        {showRequireRescoreModal && (
          <ScoredCallsModalProps
            show={showRequireRescoreModal}
            handleSubmit={(reason) => {
              requireRescore(scoredCallId, reason);
              setShowRequireRescoreModal(false);
            }}
            handleClose={() => setShowRequireRescoreModal(false)}
          />
        )}
      </ModalBody>
    </Modal>
  );
};

const mapStateToProps = state => ({
  isLoaded: state.report.isLoaded,
  currentProperty: state.property.property,
});

export default connect(mapStateToProps)(ScoredCallsModal);
