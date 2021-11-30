import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';

const Spinner = (): JSX.Element => (
  <div>
    <FontAwesomeIcon icon={faSpinner} size="3x" spin />
    <span className="sr-only">Loading...</span>
  </div>
);

export default Spinner;
