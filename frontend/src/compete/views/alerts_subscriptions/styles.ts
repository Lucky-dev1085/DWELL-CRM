import styled from 'styled-components';
import { Button as ButtonDefault } from 'reactstrap';

export const Button = styled(ButtonDefault)`
  border-width: 0;
  flex-shrink: 0;
  font-weight: 500;
  letter-spacing: -0.2px;
  text-transform: capitalize;
  color: rgba(255,255,255,0.85);
  min-height: 38px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-radius: 6px;

  &:hover, &:focus {
    color: #fff;
    background-color: #0158d4;
    border-color: #0153c7;
  }

  i {
    font-size: 16px;
    line-height: .8;
    margin-right: 7px;
    text-indent: -3px;
  }
`;
