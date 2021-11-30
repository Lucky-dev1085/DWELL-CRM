import React, { FC } from 'react';
import isEmpty from 'lodash/isEmpty';

interface FormErrorProps {
  show: boolean,
  error?: string
}

const FormError: FC<FormErrorProps> = (props) => {
  const { show, error } = props;

  if (show && !isEmpty(error)) {
    return (
      <div className="input-error"><i className="fa fa-exclamation-triangle" aria-hidden="true" />
        {error}
      </div>
    );
  }

  return null;
};

FormError.defaultProps = {
  error: null,
};

export default FormError;
