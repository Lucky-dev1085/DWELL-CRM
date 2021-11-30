import moment from 'moment';
import React, { useEffect, useState, FC } from 'react';
import {
  ButtonDropdown,
} from 'reactstrap';
import { LOGGED_ACCOUNT } from 'dwell/constants';
import { CallPlay, CallProgress, CallTime, SpeedControlToggle, SpeedControlMenu, SpeedControlItem } from './styles';

interface AudioPlayerProps {
  callId: number,
  playing: boolean,
  recording: string,
  clickedWordTime: number,
  setPlayingData: (callId: number, curTime: number) => void,
  handlePlay?: ({ id: number, isPlay: boolean }) => void,
}

interface CustomHTMLElement extends HTMLElement {
  offsetWidth: number,
  playbackRate: number,
  duration: number,
  currentTime: number,
  play: () => null,
  pause: () => null,
}

const AudioPlayer : FC<AudioPlayerProps> = ({ recording, callId, playing, setPlayingData, clickedWordTime, handlePlay }) => {
  const [isPlaying, setIsPlaying] = useState(null);
  const [duration, setDuration] = useState(0);
  const [curTime, setCurTime] = useState(0);
  const [clickedTime, setClickedTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const playbackRates = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];

  const curPercentage = duration === 0 ? 0 : (curTime / duration) * 100;

  const formatDuration = recDuration => moment
    .utc(recDuration * 1000)
    .format('m:ss');

  const calcClickedTime = (e) => {
    const clickPositionInPage = e.pageX;
    const bar = document.querySelector('.progress') as CustomHTMLElement;
    const barStart = bar.getBoundingClientRect().left + window.scrollX;
    const barWidth = bar.offsetWidth;
    const clickPositionInBar = clickPositionInPage - barStart;
    const timePerPixel = duration / barWidth;
    return timePerPixel * clickPositionInBar;
  };

  const handleTimeDrag = (e) => {
    setClickedTime(calcClickedTime(e));

    const updateTimeOnMove = (eMove) => {
      setClickedTime(calcClickedTime(eMove));
    };

    document.addEventListener('mousemove', updateTimeOnMove);

    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', updateTimeOnMove);
    });
  };

  useEffect(() => {
    if (playing) {
      setIsPlaying(true);
    }
    const userPlaybackRate = localStorage.getItem('playbackRate');
    if (userPlaybackRate) {
      setPlaybackRate(parseFloat(userPlaybackRate));
    }
  }, []);

  useEffect(() => {
    if (typeof isPlaying === 'boolean' && handlePlay) {
      handlePlay({ id: callId, isPlay: isPlaying });
    }
  }, [isPlaying]);

  useEffect(() => {
    localStorage.setItem('playbackRate', playbackRate.toString());
  }, [playbackRate]);

  useEffect(() => {
    setPlayingData(callId, curTime);
  }, [curTime, isPlaying]);

  useEffect(() => {
    if (clickedWordTime) {
      setClickedTime(clickedWordTime);
    }
  }, [clickedWordTime]);

  useEffect(() => {
    const audio = document.getElementById(`recording-${callId}`) as CustomHTMLElement;
    audio.playbackRate = playbackRate;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurTime(audio.currentTime);
    };

    const setAudioTime = () => setCurTime(audio.currentTime);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);

    // eslint-disable-next-line no-unused-expressions
    isPlaying ? audio.play() : audio.pause();

    if (clickedTime && clickedTime !== curTime) {
      audio.currentTime = clickedTime;
      setClickedTime(null);
    }

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
    };
  }, [isPlaying, clickedTime, playbackRate]);

  useEffect(() => {
    if (curTime !== 0 && duration === curTime) {
      setIsPlaying(false);
    }
  }, [curTime]);

  const token = JSON.parse(localStorage.getItem(LOGGED_ACCOUNT)) || {};

  return (
    <React.Fragment>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio id={`recording-${callId}`} preload="auto">
        <source src={`${recording}?token=${token.access}`} type="audio/mp3" />
      Your browser does not support the audio tag.
      </audio>
      <CallPlay active={isPlaying} onClick={() => setIsPlaying(!isPlaying)}>
        <i className="ri-play-circle-fill" />
        <i className="ri-pause-circle-line" />
      </CallPlay>
      <CallTime>
        {formatDuration(curTime)}
      </CallTime>
      <CallProgress value={curPercentage} onMouseDown={e => handleTimeDrag(e)} />
      <CallTime>
        {formatDuration(duration)}
      </CallTime>
      <ButtonDropdown className="ml-3" isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
        <SpeedControlToggle tag="a">
          <span>{`${playbackRate} x`}</span>
        </SpeedControlToggle>
        <SpeedControlMenu>
          {playbackRates.map((rate, i) => (
            <React.Fragment key={i}>
              <SpeedControlItem onClick={() => setPlaybackRate(rate)} tag="a">
                {`${rate} x`}
              </SpeedControlItem>
            </React.Fragment>
          ))}
        </SpeedControlMenu>
      </ButtonDropdown>
    </React.Fragment>
  );
};

export default AudioPlayer;
