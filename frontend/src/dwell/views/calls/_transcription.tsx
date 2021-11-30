import React, { useEffect, useRef, useState, FC } from 'react';
import { useInterval } from 'dwell/components';
import TimedTextEditor from '@bbc/react-transcript-editor/TimedTextEditor';

interface CallTranscriptionProps {
  callId?: number,
  isPlaying?: boolean,
  transcription?: string,
  curTime?: string | number,
  recording?: string,
  onWordClick?: (id: number, time: string) => void,
}

const CallTranscription: FC<CallTranscriptionProps> = ({ callId, isPlaying, transcription, curTime, recording, onWordClick }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [hasEventListener, setHasEventListener] = useState(false);
  const [ignoreNextScrollEvent, _setIgnoreNextScrollEvent] = useState(true);
  const ignoreNextScrollEventRef = React.useRef(ignoreNextScrollEvent);
  const setIgnoreNextScrollEvent = (data) => {
    ignoreNextScrollEventRef.current = data;
    _setIgnoreNextScrollEvent(data);
  };

  const transcriptRef = useRef();

  const stopAutoScroll = () => {
    if (ignoreNextScrollEventRef.current) {
      setIgnoreNextScrollEvent(false);
    } else {
      setIsRunning(false);
    }
  };

  const scrollIntoView = () => {
    if (transcriptRef.current && isRunning) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const currentWordTime = transcriptRef.current && transcriptRef.current.getCurrentWord().start;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentWord = document.querySelector(`span.Word[data-start="${currentWordTime}"]`) as any;
      if (currentWord) {
        const container = currentWord.closest('.public-DraftEditor-content');
        if (!hasEventListener) {
          container.addEventListener('scroll', () => stopAutoScroll());
          setHasEventListener(true);
        }
        setIgnoreNextScrollEvent(true);
        container.scrollTo({ top: currentWord.offsetTop - container.offsetTop - 200 });
      }
    }
  };

  useEffect(() => {
    setIsRunning(isPlaying);
  }, [isPlaying]);

  useInterval(() => {
    scrollIntoView();
  }, isRunning ? 1000 : null);

  return (
    <TimedTextEditor
      ref={transcriptRef}
      isPlaying={isPlaying}
      transcriptData={transcription}
      currentTime={curTime}
      mediaUrl={recording}
      sttJsonType="amazontranscribe"
      showSpeakers
      showTimecodes
      onWordClick={time => onWordClick(callId, time)}
    />
  );
};

export default CallTranscription;
