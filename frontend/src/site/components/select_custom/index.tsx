import React, { FC } from 'react';
import { map } from 'lodash';
import cn from 'classnames';
import { Input, FormFeedback } from 'reactstrap';
import { CustomSelect } from 'site/components/common';

interface SelectCustomProps {
  placeholderLabel?: string,
  placeholderDisplay?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any,
  optionValue?: string,
  optionLabel?: string,
  value: string,
  id: string,
  errorMsg?: string,
  disabled?: boolean,
  handleInputChange: (data: { target: { id: string, value: string } }) => void,
}

const SelectCustom: FC<SelectCustomProps> = ({ placeholderLabel, placeholderDisplay, options, value, id, optionValue, optionLabel, errorMsg, handleInputChange, disabled }) => {
  const selectPlaceholder = placeholderDisplay ? <option disabled={disabled} label={placeholderLabel} value={-1} /> : null;

  const mappedOptions = map(options, (option, key) => (
    <option key={key} value={optionValue ? option[optionValue] : option}>{optionLabel ? option[optionLabel] : option.toLowerCase().replace(/_/ig, ' ')}</option>));

  return (
    <React.Fragment>
      <CustomSelect
        className={cn({ 'is-invalid': errorMsg })}
        value={value || -1}
        id={id}
        onChange={handleInputChange}
        invalid={errorMsg}
      >
        {selectPlaceholder}
        {mappedOptions}
      </CustomSelect>
      <Input invalid={errorMsg} hidden />
      <FormFeedback>{errorMsg}</FormFeedback>
    </React.Fragment>
  );
};

SelectCustom.defaultProps = {
  placeholderLabel: '-- select an option -- ',
  placeholderDisplay: false,
  optionValue: null,
  optionLabel: null,
  disabled: true,
};

export default SelectCustom;
