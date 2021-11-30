import React, { FC, useEffect, useState } from 'react';
import { DemoTourProps } from 'src/interfaces';
import { defaultPlaceholders } from 'main_page/components/Forms/index';
import { FormTitle, FormDescription, CustomInput, CustomForm, DemoBtn, CustomLabel, InputWrapper } from './styles';

interface PersonalFormProps {
  demo: DemoTourProps,
  errors: { [key:string]: boolean },
  placeholders: { [key:string]: string },
  submit: (form: number) => void,
  handleChange: (field: string, value: string) => void,
  setErrors: (errors: { [key: string]: boolean }) => void,
  setPlaceholders: (errors: { [key: string]: string }) => void,
}

const defaultFocused = {
  first_name: false,
  last_name: false,
  email: false,
  phone_number: false,
  company: false,
  submit: false,
};

const PersonalForm: FC<PersonalFormProps> = ({ demo, errors, placeholders, submit, handleChange, setErrors, setPlaceholders }): JSX.Element => {
  const [focused, setFocused] = useState(defaultFocused);
  const getInputType = (field) => {
    switch (field) {
      case 'phone_number': return 'tel';
      case 'email': return 'email';
      default: return 'text';
    }
  };

  const handleClick = (key) => {
    setFocused({ ...focused, [key]: true });
    setErrors({ ...errors, [key]: false });
    setPlaceholders({ ...placeholders, [key]: defaultPlaceholders[key] });
  };

  useEffect(() => {
    Object.keys(focused).forEach((key) => {
      if (focused[key]) {
        (document.querySelector(`${key === 'submit' ? 'button' : 'input'}[name="${key}"]`) as HTMLElement).focus();
      }
    });
  }, [focused]);

  const handleBlur = (key) => {
    setFocused({ ...focused, [key]: false });
  };

  const handleFocus = (e, key) => {
    if (e.key === 'Tab') {
      const currentField = Object.keys(defaultFocused).indexOf(key);
      if (currentField !== Object.keys(defaultFocused).length - 1) {
        handleClick(Object.keys(defaultFocused)[currentField + 1]);
      }
    }
  };

  return (
    <>
      <FormTitle> Request a Demo </FormTitle>
      <FormDescription isPersonal> See why we have a perfect NPS score </FormDescription>
      <CustomForm>
        {Object.keys(demo).map(key => (
          <InputWrapper onClick={() => handleClick(key)} isError={errors[key]} filled={demo[key] !== ''} focused={focused[key]} key={key} onKeyDown={e => handleFocus(e, key)}>
            <CustomLabel className="label">{placeholders[key]}</CustomLabel>
            <CustomInput name={key} type={getInputType(key)} value={demo[key]} onChange={({ target: { value } }) => handleChange(key, value)} isError={errors[key]} onBlur={() => handleBlur(key)} />
          </InputWrapper>
        ))}
        <DemoBtn name="submit" onClick={(() => submit(2))} onBlur={() => handleBlur('submit')}> REQUEST DEMO </DemoBtn>
      </CustomForm>
    </>
  );
};

export default PersonalForm;

