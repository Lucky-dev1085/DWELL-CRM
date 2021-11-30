import React, { useState, useEffect, FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';

const LOADING_STATE_NONE = 'NONE' as string;
const LOADING_STATE_BEGIN = 'BEGIN' as string;
const LOADING_STATE_LOADED = 'LOADED' as string;

const LoadingElement = (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 364,
  }}
  >
    <FontAwesomeIcon icon={faSpinner} size="3x" spin />
    <span className="sr-only">Loading...</span>
  </div>
);

let isUnmounted = false;

interface LoadState {
  loadingState?: string,
}

interface LoadScriptProps {
  script: string | string[];
  children?: JSX.Element,
  loadingElement?: JSX.Element,
  timeout?: number,
  onBeginLoad?: () => void,
  onLoad?: () => void,
}

const LoadScript: FC<LoadScriptProps> = ({ script, children, loadingElement, timeout, onBeginLoad, onLoad }) => {
  const [loadScriptState, updateLoadScript] = useState({
    loadingState: LOADING_STATE_NONE,
  } as LoadState);
  const [timer, setTimer] = useState(null);

  const handleLoaded = () => {
    if (isUnmounted) {
      return;
    }
    updateLoadScript({ ...loadScriptState, loadingState: LOADING_STATE_LOADED });
    onLoad();
  };

  useEffect(() => {
    const { loadingState } = loadScriptState;
    if (loadingState === LOADING_STATE_NONE) {
      updateLoadScript({ ...loadScriptState, loadingState: LOADING_STATE_BEGIN });
      onBeginLoad();
      const timerId = setTimeout(() => {
        // Don't load scriptjs as a dependency since we do not want this module be used on server side.
        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
        const scriptjs = require('scriptjs');
        scriptjs.order(Array.isArray(script) ? script : [script], handleLoaded);
        setTimeout(() => {
          if (loadingState !== LOADING_STATE_LOADED) {
            updateLoadScript({ ...loadScriptState, loadingState: LOADING_STATE_LOADED });
            onLoad();
          }
        }, 3000);
      }, timeout);
      setTimer(timerId);
    }

    return () => {
      isUnmounted = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const { loadingState } = loadScriptState;

  if (loadingState === LOADING_STATE_LOADED) {
    return children;
  }
  return loadingElement;
};

LoadScript.defaultProps = {
  loadingElement: LoadingElement,
  timeout: 0,
  children: null,
  onBeginLoad: () => '',
};

export default LoadScript;
