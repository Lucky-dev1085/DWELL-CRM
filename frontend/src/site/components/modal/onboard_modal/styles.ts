import styled from 'styled-components';
import { Input } from 'reactstrap';
import { NavStepItem as NavItem } from 'site/components/common';

export const NavStepItem = styled(NavItem)`
  & + & {
    margin-left: 30px;

    &::before {
      left: -23px;
      font-size: 12px;
    }
  }
`;

export const ModalSubTitle = styled.p`
  margin-top: -15px;
  color: ${props => props.theme.colors.colortx02};
`;

export const CustomSelect = styled(Input)`
  -webkit-appearance: none;
  background: #fff url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5' viewBox='0 0 4 5'%3e%3cpath fill='%2315274d' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e") no-repeat right 15px center/8px 10px;
`;

export const LabelTitle = styled.label`
  line-height: 1;
  color: ${props => props.theme.colors.colortx02} !important;
  margin-bottom: 10px !important;
`;
