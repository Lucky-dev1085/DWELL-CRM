import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { UncontrolledTooltip, CardBody } from 'reactstrap';
import moment from 'moment';
import axios from 'axios';
import { toast } from 'react-toastify';
import { isEmpty } from 'lodash';
import { Slash } from 'react-feather';
import Loader from 'dwell/components/Loader';
import AudioPlayer from 'dwell/components/AudioPlayer';
import { LOGGED_ACCOUNT } from 'dwell/constants';
import { CallPlay, CallTranscriptionToggle, CallTime, RecordingNotExist, CallTranscriptionContainer, CallTransCard } from 'dwell/views/calls/styles';
import CallTranscription from 'dwell/views/calls/_transcription';
import { Call } from 'src/interfaces';
import { TranscriptionWrapper, CallWrapper } from './styles';
import { overrideSpeakerLabelStyles } from './utils';

interface CallDetailProps extends RouteComponentProps {
  call: Call,
  isPlaying: boolean,
  handlePlay: ({ id: number, isPlay: boolean }) => void,
}

const CallDetail: FC<CallDetailProps> = ({ call, isPlaying, handlePlay }) => {
  const [callData, setCallData] = useState({ ...call, isDropdownOpen: false, curTime: 0, clickedTime: 0 });
  const [isExpanded, setExpanded] = useState(false);
  const [transcriptions, setTranscriptions] = useState(null);
  const [isUpdateViewDelay, setIsDelay] = useState(false);

  useEffect(() => {
    if (!isEmpty(transcriptions)) {
      setTimeout(() => {
        overrideSpeakerLabelStyles('Speaker 0');
        overrideSpeakerLabelStyles('Speaker 1');
      }, 300);
    }
  }, [transcriptions, isExpanded]);

  useEffect(() => {
    if (isUpdateViewDelay) {
      setTimeout(() => setIsDelay(false), 800);
    }
  }, [isUpdateViewDelay]);

  const setPlayingData = (rowId, curTime) => {
    setCallData({ ...callData, curTime });
  };

  const handleExpandClick = () => {
    setExpanded(!isExpanded);
    const token = JSON.parse(localStorage.getItem(LOGGED_ACCOUNT)) || {};
    if (isEmpty(transcriptions)) {
      axios.get(`${callData.transcription}?token=${token.access}`).then((response) => {
        setTranscriptions(response.data);
        setIsDelay(true);
      }).catch(e => toast.error(e.message));
    } else if (!isUpdateViewDelay && !isExpanded) {
      setIsDelay(true);
    }
    setCallData({ ...callData, expanded: !callData.expanded });
  };

  const onWordClick = (rowId, clickedTime) => {
    setCallData({ ...callData, clickedTime });
  };

  const isTranscriptionEmpty = transcription => isEmpty(transcription.results.items);

  return (
    <React.Fragment>
      <CallWrapper>
        {(callData.recording && !isPlaying) &&
        <CallPlay active onClick={() => handlePlay({ id: callData.id, isPlay: true })}>
          <i className="ri-play-circle-fill" />
        </CallPlay>}
        {callData.recording ?
          <React.Fragment>
            {isPlaying && <AudioPlayer recording={callData.recording} callId={callData.id} playing setPlayingData={setPlayingData} clickedWordTime={callData.clickedTime} handlePlay={handlePlay} />}
            {!isPlaying && <CallTime>{moment.utc(callData.duration * 1000).format('m:ss')}</CallTime>}
            {callData.transcription && (
              <React.Fragment>
                <CallTranscriptionToggle active={isExpanded} id={`call-transcription-${callData.id}`}>
                  <i onClick={() => handleExpandClick()} className="ri-voiceprint-line" />
                </CallTranscriptionToggle>
                <UncontrolledTooltip target={`call-transcription-${callData.id}`}>Call transcript</UncontrolledTooltip>
              </React.Fragment>)}
          </React.Fragment>
          : <RecordingNotExist><Slash />None</RecordingNotExist>}
      </CallWrapper>
      <TranscriptionWrapper>
        <CallTransCard>
          {isExpanded && !isEmpty(transcriptions) && !isTranscriptionEmpty(transcriptions) &&
          <CallTranscriptionContainer hidden={isUpdateViewDelay}>
            <CallTranscription
              callId={callData.id}
              isPlaying={isPlaying}
              transcription={transcriptions}
              curTime={callData.curTime}
              recording={callData.recording}
              onWordClick={onWordClick}
            />
          </CallTranscriptionContainer>}
          {((isExpanded && isEmpty(transcriptions)) || isUpdateViewDelay) && <CardBody><Loader /></CardBody>}
        </CallTransCard>
      </TranscriptionWrapper>
    </React.Fragment>
  );
};

export default withRouter(CallDetail);
