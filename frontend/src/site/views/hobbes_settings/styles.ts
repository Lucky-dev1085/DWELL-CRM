import styled from 'styled-components';
import { Input } from 'reactstrap';

export const FormLabel = styled.div``;

export const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-right: -5px;
  margin-left: -5px;
  align-items: center;

  .custom-control-label {
    font-weight: 400;
  }
`;

export const FormControl = styled(Input)`
  margin-bottom: 0;
  border-color: #d9def0 !important;

  &:focus {
    border-color: ${props => props.theme.colors.colorbg03} !important;
  }
`;

export const Divider = styled.hr`
  margin-top: 20px;
  margin-bottom: 20px;
  border-color: #eaedf5;
`;

export const FormSwitch = styled.div`
border: none;
margin-bottom: 0;
width: 30px;
height: 16px;
background-color: ${props => (props.checked ? props.theme.colors.green : props.theme.colors.colorbg02)};
border-radius: 10px;
position: relative;
transition: background-color 0.25s;
cursor: pointer;

&:focus {
    outline: none;
}

&:before {
  content: '';
  width: 12px;
  height: 12px;
  background-color: #fff;
  border-radius: 100%;
  position: absolute;
  top: 2px;
  left: ${props => (props.checked ? '16px' : '2px')};
  transition: left 0.25s;
}
`;

export const DropdownWrapper = styled.div`
  max-width: 250px;

  .select-input {
    height: 38px !important;
  }

  .dropdown-toggle {
    border-radius: 4px;
    border-color: ${props => props.theme.input.borderColor} !important;
    color: ${props => props.theme.colors.gray700} !important;

    &:focus, &:hover {
      box-shadow: none !important;
      background-color: #fff !important;
    }

    &:after {
        border-color: #888 transparent transparent transparent;
        border-style: solid;
        border-width: 5px 4px 0 4px;
        height: 0;
        margin-left: -4px;
        margin-top: -2px;
        position: absolute;
        top: 50%;
        right: 11px;
        width: 0;
    }
  }

  .dropdown-item {
    border-radius: 4px;
    margin-bottom: 1px;
    color: #344563;
    background-color: #fff;
    padding: 6px 10px;
    border: none;

    &:hover {
      color: #fff !important;
      background-color: #0168fa !important;
    }
  }

  .dropdown-menu {
    padding: 4px;
    border-radius: unset;
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: 4px;
    top: -5px !important;
    border-color: ${props => props.theme.input.borderColor};
  }
`;

export const CardFooter = styled.div`
  background-color: transparent;
  border-top-color: #f0f2f9;
  padding: 20px;
  border-radius: 0 0 5px 5px;
  border-top: 1px solid rgba(225,230,247,.6);

  .btn {
    height: 38px;

    &:hover {
      color: #fff;
      background-color: #0158d4;
      border-color: #0153c7;
    }
  }
`;
