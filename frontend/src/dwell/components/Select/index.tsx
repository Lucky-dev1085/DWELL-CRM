import React, { FC } from 'react';
import { Input } from 'reactstrap';
import styled from 'styled-components';

const CustomSelect = styled(Input)`
    appearance: none;
    height: 40px;
    border-radius: 4px;
    padding-left: 8px;

    transition: background-color 0.15s ease-in-out,border-color 0.15s ease-in-out,box-shadow 0.15s ease-in-out;

    display: inline-block;
    width: 100%;
    padding: .375rem 1.75rem .375rem .75rem;
    font-size: .875rem;
    font-weight: 400;
    line-height: 1.5;
    color: #233457;
    vertical-align: middle;
    background: #fff url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5' viewBox='0 0 4 5'%3e%3cpath fill='%2315274d' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e") no-repeat right .75rem center/8px 10px;
    border: 1px solid #d5dcf4;

    &:focus {
        box-shadow: 0 0 0 0.5px #3085fe;
        border-color: #3085fe;
    }
`;

interface ChoicesOperator {
  IS?: string,
  IS_NOT?: string,
  STARTS_WITH?: string,
  ENDS_WITH?: string,
  IS_BETWEEN?: string,
  IS_LESS_THAN?: string,
  IS_GREATER_THAN?: string,
  IS_NOT_SET?: string,
  IS_ON?: string,
  IS_ON_OR_BEFORE?: string,
  IS_ON_OR_AFTER?: string,
  IS_ONE_OF?: string,
}

interface SelectProps {
  id?: string,
  placeholder?: string,
  value?: string,
  onChange?: (e: Event) => void,
  choices?: ChoicesOperator,
  required?: boolean
}

const Select: FC<SelectProps> = (props) => {
  const { choices } = props;
  return (
    <CustomSelect type="select" {...props}>
      <option label="- select an option -" value={null} />
      {Object.keys(choices).map((key, index) => (<option value={key} key={index}>{choices[key]}</option>))}
    </CustomSelect>
  );
};

export default Select;
