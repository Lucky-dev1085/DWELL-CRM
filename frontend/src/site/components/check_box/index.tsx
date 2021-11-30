import React, { Fragment, FC } from 'react';
import { CustomControl, ControlLabel, ControlInput } from 'site/components/check_box/styles';

interface CheckBoxProps {
  id: string,
  checked?: boolean,
  onChange?: (data: { target: { id: string, name?: string, value: string | number, checked?: boolean } }) => void,
  label?: string,
  labelClassName?: string,
  name?: string,
  value?: string,
  disabled?: boolean,
}

const CheckBox: FC<CheckBoxProps> = ({ id, checked, onChange, label, labelClassName, disabled, ...rest }) => (
  <CustomControl>
    <ControlInput
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      {...rest}
    />
    <ControlLabel className={labelClassName} htmlFor={id} checked={checked}>{/* eslint-disable-line jsx-a11y/label-has-for */}
      {label ? label : <Fragment>&nbsp;</Fragment>}{/* eslint-disable-line no-unneeded-ternary */}
    </ControlLabel>
  </CustomControl>
);

CheckBox.defaultProps = {
  checked: false,
  label: '',
  labelClassName: '',
};

export default CheckBox;
