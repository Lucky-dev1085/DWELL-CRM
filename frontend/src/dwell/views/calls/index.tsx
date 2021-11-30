import React, { useEffect, useState, FC } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardBody, CardHeader, CardTitle, CustomInput, Spinner, NavLink, ListGroup, UncontrolledTooltip } from 'reactstrap';
import { isEmpty } from 'lodash';
import moment from 'moment-timezone/builds/moment-timezone-with-data';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import { PhoneCall, PhoneMissed, Slash } from 'react-feather';
import leadAction from 'dwell/actions/lead';
import callAction from 'dwell/actions/call';
import userAction from 'dwell/actions/user';
import callScoringQuestionsAction from 'dwell/actions/call_scoring_questions';
import scoredCallsAction from 'dwell/actions/scored_calls';
import RemotePagination from 'dwell/components/remote_pagination';
import Loader from 'dwell/components/Loader';
import BootstrapTable from 'react-bootstrap-table-next';
import LeadCreationModal from 'dwell/components/Leads/LeadCreationModal';
import LeadLinkingModal from 'dwell/components/Leads/LeadLinkingModal';
import { LOGGED_ACCOUNT } from 'dwell/constants';
import AudioPlayer from 'dwell/components/AudioPlayer';
import 'src/scss/pages/_leads_list.scss';
import 'src/scss/pages/_followups.scss';
import 'src/scss/pages/_calls.scss';
import 'spinkit/css/spinkit.css';
import { ContainerFluid, ContentTitle } from 'styles/common';
import CallScoring from './_callScoring';
import { overrideSpeakerLabelStyles, defaultTableColumns, defaultTableData } from './utils';
import CallTranscription from './_transcription';
import {
  CallSourceLabel, CallStatus, CallPlay, CallTranscriptionToggle, CallTime, RecordingNotExist, MoreActionNav,
  ContentHeader, CallTransCard, Avatar, CallTransWrapper, EmptyContent, PrevScore, RescoreReason, CallTranscriptionContainer,
} from './styles';

interface CustomHTMLElement extends HTMLElement {
  indeterminate: boolean,
}

interface CallsData {
  offset?: number,
  limit?: number,
  lead_id?: number,
  show_all?: boolean,
}

interface CallsProps extends RouteComponentProps {
  leadId?: number,
}

const Calls : FC<CallsProps> = ({ leadId }) => {
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [sizePerPage, setSizePerPage] = useState(20);
  const [totalSize, setTotalSize] = useState(0);
  const [expanded, setExpanded] = useState([]);
  const [isShowingCreationModal, setIsShowingCreationModal] = useState(false);
  const [isShowingLinkingModal, setIsShowingLinkingModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState({});
  const [transcriptions, setTranscriptions] = useState({});
  const [lastExpanded, setLastExpanded] = useState('');

  const dispatch = useDispatch();
  const calls = useSelector(state => state.call.calls);
  const callsCount = useSelector(state => state.call.count);
  const isLoaded = useSelector(state => state.call.isLoaded);
  const isArchiving = useSelector(state => state.call.isArchiving);
  const currentProperty = useSelector(state => state.property.property);
  const properties = useSelector(state => state.property.properties);
  const currentUser = useSelector(state => state.user.currentUser);
  const isUsersLoaded = useSelector(state => state.user.isUsersLoaded);
  const { getLeadNames } = leadAction;
  const { getCalls, archiveCalls, updateCallById, archiveCall } = callAction;
  const { getCallScoringQuestions } = callScoringQuestionsAction;
  const { getScoredCalls } = scoredCallsAction;
  const { getUsers } = userAction;

  const { is_call_scorer: isCallScorer } = currentUser;

  useEffect(() => {
    const headerCheckbox = document.getElementById('header-checkbox') as CustomHTMLElement;
    if (headerCheckbox) {
      headerCheckbox.indeterminate = (headerCheckbox.getAttribute('indeterminate') === 'true');
    }
  }, [selected, page, data, sizePerPage, totalSize, selectedCall]);

  useEffect(() => {
    if (currentUser.is_call_scorer && currentProperty.external_id === 'call-rescores' && !isUsersLoaded) {
      dispatch(getUsers());
    }
  });

  const handleOnSelect = (row, isSelect) => {
    const ids = isSelect ? [...selected, row.id] : selected.filter(x => x !== row.id);
    setSelected(ids);
  };

  const handleOnSelectAll = (isSelect, rows) => {
    const ids = isSelect ? rows.map(r => r.id) : [];
    setSelected(ids);
  };

  useEffect(() => {
    const callsData = calls.map(call => ({ ...call, isDropdownOpen: false, isPlaying: false, curTime: 0, clickedTime: 0 }));
    setData(callsData);
    setTotalSize(callsCount);
    setSelected([]);
  }, [calls]);

  const sortColumns = (order, field, tableData) => tableData.sort((a, b) => {
    const currentField = field === 'recording' ? 'duration' : field;
    const aField = typeof (a[currentField]) === 'string' ? a[currentField].toLowerCase() : a[currentField];
    const bField = typeof (b[currentField]) === 'string' ? b[currentField].toLowerCase() : b[currentField];
    if (aField > bField) {
      return order === 'asc' ? 1 : -1;
    } else if (bField > aField) {
      return order === 'asc' ? -1 : 1;
    }
    return 0;
  });

  const handleTableChange = (type, { data: currentData, page: selectedPage, sizePerPage: selectedSizePerPage, sortField: field, sortOrder: order }) => {
    let callsData = { offset: selectedSizePerPage * (selectedPage - 1), limit: selectedSizePerPage, page: selectedPage } as CallsData;
    if (leadId) {
      callsData = { lead_id: leadId, show_all: true } as CallsData;
    }
    if (type === 'pagination') {
      dispatch(getCalls(callsData))
        .then(() => {
          setSizePerPage(selectedSizePerPage);
          setPage(selectedPage);
        });
    }
    if (type === 'sort') {
      const result = sortColumns(order, field, currentData);
      setData(result);
    }
  };

  const reloadCalls = () => {
    let callsData = { offset: sizePerPage * (page - 1), limit: sizePerPage, page } as CallsData;
    if (leadId) {
      callsData = { lead_id: leadId, show_all: true } as CallsData;
    }
    dispatch(getCalls(callsData));
  };

  useEffect(() => {
    reloadCalls();
    if (!isCallScorer && currentUser.id) {
      dispatch(getLeadNames());
    }
  }, [leadId, currentUser]);

  useEffect(() => {
    if (isCallScorer) {
      dispatch(getCallScoringQuestions());
      dispatch(getScoredCalls());
    }
  }, [currentUser]);

  useEffect(() => {
    if (!isEmpty(transcriptions)) {
      setTimeout(() => {
        overrideSpeakerLabelStyles('Speaker 0');
        overrideSpeakerLabelStyles('Speaker 1');
      }, 300);
    }
  }, [transcriptions, expanded]);

  const indication = () => (
    <EmptyContent>
      <h5 className="m-0"><span>Your team is all caught up on calls.</span></h5>
    </EmptyContent>
  );
  const archiveSelected = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    dispatch(archiveCalls({ ids: selected })).then(() => reloadCalls());
  };

  const handleExpandClick = (rowId) => {
    if (!expanded.includes(rowId)) {
      setExpanded([rowId].concat(expanded));
      setLastExpanded(rowId);
    } else {
      setExpanded(expanded.filter(x => x !== rowId));
    }
    const callsData = data.map((call) => {
      if (call.id === rowId) {
        return { ...call, expanded: !call.expanded };
      } return call;
    });
    setData(callsData);
  };

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

  const onWordClick = (rowId, clickedTime) => {
    const callsData = data.map((call) => {
      if (call.id === rowId) {
        return { ...call, clickedTime };
      } return call;
    });
    setData(callsData);
  };

  const onArchiveClick = (callId) => {
    dispatch(archiveCall(callId)).then(() => reloadCalls());
  };

  const updateCallLead = (callId, lead) => {
    dispatch(updateCallById(callId, { lead })).then(() => { reloadCalls(); dispatch(getLeadNames()); });
  };

  const handleCallScoreSubmit = (id) => {
    setExpanded(expanded.filter(x => x !== id));
    dispatch(getScoredCalls());
    dispatch(getCalls({ offset: sizePerPage * (page - 1), limit: sizePerPage }));
  };

  const changeCallScore = (id, score) => {
    const callsData = data.map((call) => {
      if (call.id === id) {
        return { ...call, score };
      } return call;
    });
    setData(callsData);
  };

  const isTranscriptionEmpty = transcription => isEmpty(transcription.results.items);

  const getColumns = () => {
    let columns = [
      {
        dataField: 'id',
        text: '',
        formatter: () => <Avatar className="avatar"><i className="ri-phone-fill" /></Avatar>,
      },
      {
        dataField: 'source',
        text: leadId ? 'Phone Call' : 'Call Source',
        style: { width: '25%' },
        formatter: cell => <CallSourceLabel>{cell}</CallSourceLabel>,
        sort: isCallScorer,
      },
      {
        dataField: 'prospect_phone_number',
        classes: 'text-right',
        headerFormatter: () => <div className="text-right">Phone Number</div>,
        formatter: cell => <div className="text-right">{cell}</div>,
        sort: isCallScorer,
      },
      {
        dataField: 'call_result',
        text: 'Call Status',
        formatter: cell => (
          <CallStatus answered={cell !== 'no-answer'}>
            {cell !== 'no-answer' ? <PhoneCall /> : <PhoneMissed />}
            <span className="ml-2">{cell === 'no-answer' ? 'Missed' : 'Answered'}</span>
          </CallStatus>
        ),
        sort: isCallScorer,
      },
      {
        dataField: 'recording',
        text: 'Call Record',
        sort: isCallScorer,
        style: { width: '25%' },
        formatter: (cell, row, rowIndex, { expandedRows }) => (
          <React.Fragment>
            <div className="d-flex align-items-center">
              {(cell && !row.isPlaying) &&
              <CallPlay active>
                <i className="ri-play-circle-fill" />
              </CallPlay>}
              {cell ?
                <React.Fragment>
                  {row.isPlaying && <AudioPlayer recording={cell} callId={row.id} playing setPlayingData={setPlayingData} clickedWordTime={row.clickedTime} />}
                  {!row.isPlaying && <CallTime>{moment.utc(row.duration * 1000).format('m:ss')}</CallTime>}
                  <CallTranscriptionToggle active={expandedRows.includes(row.id)} id={`call-transcription-${row.id}`}>
                    <i onClick={() => handleExpandClick(row.id)} className="ri-voiceprint-line" />
                  </CallTranscriptionToggle>
                  <UncontrolledTooltip target={`call-transcription-${row.id}`}>Call transcript</UncontrolledTooltip>
                </React.Fragment>
                : <RecordingNotExist><Slash />None</RecordingNotExist>}
            </div>
          </React.Fragment>),
        formatExtraData: { expandedRows: expanded },
      },
      {
        dataField: 'date',
        headerFormatter: () => <div className="text-right">Date</div>,
        formatter: cell => <div className="text-right">{moment(cell).local().format('lll')}</div>,
      },
      {
        dataField: '',
        text: '',
        style: { width: '20%' },
        formatter: (cell, row) => (
          <MoreActionNav className="nav-icon">
            <NavLink id={`add-new-lead-${row.id}`}>
              <span>
                <i className="ri-user-add-line" onClick={() => { setSelectedCall(row); setIsShowingCreationModal(true); }} />
              </span>
            </NavLink>
            <UncontrolledTooltip target={`add-new-lead-${row.id}`}>Add as new lead</UncontrolledTooltip>
            <NavLink id={`link-existing-lead-${row.id}`}>
              <span data-title="Link to existing lead">
                <i className="ri-links-line" onClick={() => { setSelectedCall(row); setIsShowingLinkingModal(true); }} />
              </span>
            </NavLink>
            <UncontrolledTooltip target={`link-existing-lead-${row.id}`}>Link to existing lead</UncontrolledTooltip>
            <NavLink id={`archive-call-${row.id}`}>
              <span data-title="Archive call">
                <i className="ri-archive-drawer-line" onClick={() => onArchiveClick(row.id)} />
              </span>
            </NavLink>
            <UncontrolledTooltip target={`archive-call-${row.id}`}>Archive call</UncontrolledTooltip>
          </MoreActionNav>
        ),
      },
    ];

    if (leadId) {
      columns = [...columns.filter(c => c.dataField)];
    }

    if (isCallScorer) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      columns = [...columns.filter(c => !['isDropdownOpen', 'date', ''].includes(c.dataField)),
        {
          dataField: 'score',
          text: 'Score',
          style: { width: '10%' },
          sort: true,
          formatter: (cell, row) => (
            <>
              <p className="mb-0">{['-', 'N/A'].includes(cell) ? cell : `${cell}%`}</p>
              {row.prev_score && <PrevScore>Prev. {['-', 'N/A'].includes(row.prev_score) ? row.prev_score : `${row.prev_score}%`}</PrevScore>}
            </>
          ),
        },
        {
          dataField: 'date',
          text: 'Date',
          style: { width: '10%' },
          sort: true,
          formatter: (cell) => {
            const dateDiff = moment(cell)
              .isSame(moment(), 'd');
            const date = dateDiff ? moment(cell).local().format('hh:mm A') : moment(cell).local().format('MMM D');
            return <div className="date">{date}</div>;
          },
        },
      ];

      if (currentProperty.external_id === 'call-rescores') {
        columns.splice(2, 0, {
          dataField: 'property',
          text: 'Property',
          style: { width: '10%' },
          sort: true,
          formatter: cell => <>{(properties.find(p => p.id === cell) || {}).name}</>,
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        columns.push({
          dataField: 'rescore_reason',
          text: 'Reason for rescore',
          style: { width: '10%' },
          sort: true,
          formatter: (cell, row) => <>
            <RescoreReason id={`reason_for_rescore_${row.id}`}>{cell}</RescoreReason>
            <UncontrolledTooltip trigger="hover" placement="top" target={`reason_for_rescore_${row.id}`}>
              {cell}
            </UncontrolledTooltip>
          </>,
        });
      }
    }
    return columns;
  };

  const selectRow = leadId ? {
    mode: 'checkbox',
    selected,
    hideSelectColumn: true,
  } :
    {
      hideSelectColumn: isCallScorer,
      mode: 'checkbox',
      selected,
      onSelect: handleOnSelect,
      onSelectAll: handleOnSelectAll,
      selectionHeaderRenderer: ({ mode, checked, indeterminate }) => <CustomInput type={mode} id="header-checkbox" checked={checked} onChange={handleOnSelectAll} indeterminate={indeterminate.toString()} />,
      selectionRenderer: ({ mode, rowIndex, checked }) => (
        <CustomInput type={mode} id={`row${rowIndex + 1}`} checked={checked} onChange={handleOnSelect} />
      ),
    };

  const token = JSON.parse(localStorage.getItem(LOGGED_ACCOUNT)) || {};

  const expandRow = {
    parentClassName: 'trans-row',
    renderer: (row) => {
      const { transcription, is_transcribed: isTranscribed } = row;
      if (!isTranscribed) {
        return (
          <div className="d-flex justify-content-center">
            <Card className="call-transcription">
              <CardHeader>Call transcription</CardHeader>
              <CardBody className="no-transcription">
                <p>Transcription for this call is not made yet.</p>
              </CardBody>
            </Card>
            { isCallScorer &&
            <CallScoring
              onSubmitSuccess={handleCallScoreSubmit}
              callId={row.id}
              changeCallScore={changeCallScore}
            /> }
          </div>
        );
      }
      if (!transcriptions[row.id] && expanded.includes(row.id) && lastExpanded === row.id) {
        axios.get(`${transcription}?token=${token.access}`).then((response) => {
          setTranscriptions({ ...transcriptions, [row.id]: response.data });
        }).catch(e => toast.error(e.message));
      }
      return (
        <CallTransWrapper className="d-flex">
          <CallTransCard isCallScoring={isCallScorer} >
            <CardHeader><CardTitle>Call transcription</CardTitle></CardHeader>
            <ListGroup>
              {transcriptions[row.id] && !isTranscriptionEmpty(transcriptions[row.id]) &&
                <CallTranscriptionContainer>
                  <CallTranscription
                    callId={row.id}
                    isPlaying={row.isPlaying}
                    transcription={transcriptions[row.id]}
                    curTime={row.curTime}
                    recording={row.recording}
                    onWordClick={onWordClick}
                  />
                </CallTranscriptionContainer>}
              {transcriptions[row.id] && isTranscriptionEmpty(transcriptions[row.id]) &&
              <CardBody className="no-transcription">
                <p>Transcription is not available.</p>
              </CardBody>}
              {!transcriptions[row.id] && <CardBody><Loader /></CardBody>}
            </ListGroup>
          </CallTransCard>
          { isCallScorer &&
            <CallScoring
              onSubmitSuccess={handleCallScoreSubmit}
              callId={row.id}
              changeCallScore={changeCallScore}
            /> }
        </CallTransWrapper>
      );
    },
    expanded,
    expandByColumnOnly: true,
  };

  const rowClasses = (row) => {
    let classes = 'animated fadeIn';
    if (selected.includes(row.id)) {
      classes = `selected ${classes}`;
    }
    if (isCallScorer && ((currentProperty.external_id === 'call-rescores' && row.prev_score) || (currentProperty.external_id !== 'call-rescores' && row.score !== '-'))) {
      classes = `scored ${classes}`;
    }
    return classes;
  };

  const rowEvents = {
    onClick: (e, row) => {
      if (row.recording && ['ri-play-circle-fill', 'ri-pause-circle-line'].includes(e.target.className)) {
        handleAudioClick(row.id);
      } else {
        handleExpandClick(row.id);
      }
    },
  };

  return (
    <ContainerFluid fluid scroll>
      <Helmet>
        <title>DWELL | Calls</title>
      </Helmet>
      {!leadId &&
        <>
          <ContentHeader>
            <div className="mg-r-auto">
              <ContentTitle>
                {`Calls (${totalSize})`}
              </ContentTitle>
            </div>
            {!isEmpty(selected) && !isCallScorer &&
        <div className="float-right archive">
          {isArchiving && <Spinner size="sm" className="mr-2" />}
          <button className="mr-1 btn btn-danger" onClick={archiveSelected} disabled={isArchiving}>Archive</button>
        </div>
            }
          </ContentHeader>
          {!isCallScorer && (
            <>
              <LeadCreationModal
                call={selectedCall}
                updateCallLead={updateCallLead}
                show={isShowingCreationModal}
                handleClose={() => setIsShowingCreationModal(false)}
              />
              <LeadLinkingModal call={selectedCall} updateCallLead={updateCallLead} show={isShowingLinkingModal} handleClose={() => setIsShowingLinkingModal(false)} />
            </>
          )}
        </>}
      {!leadId ?
        <RemotePagination
          keyField="id"
          wrapperClasses="table-alpha"
          data={isLoaded ? data : defaultTableData()}
          page={page}
          sizePerPage={sizePerPage}
          totalSize={totalSize}
          onTableChange={handleTableChange}
          columns={isLoaded ? getColumns() : defaultTableColumns(leadId, isCallScorer)}
          selectRow={selectRow}
          indication={indication}
          rowClasses={rowClasses}
          expandRow={expandRow}
          rowEvents={rowEvents}
        /> :
        <BootstrapTable
          keyField="id"
          wrapperClasses="table-alpha"
          data={isLoaded ? data : defaultTableData()}
          columns={isLoaded ? getColumns() : defaultTableColumns(leadId, isCallScorer)}
          onTableChange={handleTableChange}
          noDataIndication={indication}
          bordered={false}
          rowClasses={rowClasses}
          expandRow={expandRow}
          selectRow={selectRow}
          rowEvents={rowEvents}
        />}
    </ContainerFluid>
  );
};

export default withRouter(Calls);
