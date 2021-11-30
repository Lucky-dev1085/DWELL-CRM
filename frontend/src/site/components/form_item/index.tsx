import React, { FC } from 'react';
import { Label, Input, FormFeedback, FormGroup } from 'reactstrap';
import { FormDescription, LabelWrapper } from 'site/components/common';
import Tooltip from '../tooltip';

interface FormItemProps {
  id: string,
  name: string,
  section?: string,
  title?: string,
  value?: string | number;
  invalid?: string | boolean;
  keyToChange?: string,
  isTextArea?: boolean,
  showTooltip?: boolean,
  selector?: string,
  helperText?: string,
  placeholder?: string,
  sectionClassName?: string,
  textAreaRow?: number,
  indexToChange?: number,
  handleOnChange?: (e?: { target?: { id?: string, value?: string | number } }, index?: number, key?: string) => void,
  disabled?: boolean,
}

const FormItem: FC<FormItemProps> = (props) => {
  const { name, value, handleOnChange, id, title, indexToChange, keyToChange, isTextArea, section, showTooltip, selector, invalid, textAreaRow,
    sectionClassName, placeholder, helperText, disabled } = props;

  let inputFiled = isTextArea
    ?
    (<Input
      type="textarea"
      rows={textAreaRow}
      name={name}
      value={value}
      onChange={e => handleOnChange(e, indexToChange, keyToChange)}
      id={id}
      placeholder={placeholder}
      invalid={invalid}
      disabled={disabled}
    />)
    : (<Input
      name={name}
      value={value || ''}
      onChange={e => handleOnChange(e, indexToChange, keyToChange)}
      id={id}
      invalid={invalid}
      placeholder={placeholder}
      disabled={disabled}
    />);

  if (id === 'map.zoom') {
    inputFiled = (<Input type="number" min="0" max="100" name={name} className="mb-1" value={value} onChange={handleOnChange} id={id} />);
  }

  const content = (
    <FormGroup className="w-100">
      <LabelWrapper>
        <Label htmlFor="name">{title}</Label>
        {showTooltip &&
          <Tooltip section={section} selector={selector || id} />
        }
      </LabelWrapper>
      {inputFiled}
      {invalid ? <FormFeedback>{invalid}</FormFeedback> : helperText && <FormDescription>{helperText}</FormDescription>}
    </FormGroup>
  );

  return (
    <section className={sectionClassName}>
      {content}
    </section>
  );
};

FormItem.defaultProps = {
  indexToChange: undefined,
  keyToChange: undefined,
  title: null,
  value: null,
  isTextArea: false,
  showTooltip: false,
  section: null,
  selector: null,
  invalid: false,
  textAreaRow: 6,
  sectionClassName: null,
  placeholder: '',
  helperText: '',
  disabled: false,
};

export default FormItem;
