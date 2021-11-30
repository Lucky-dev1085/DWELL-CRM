import styled from 'styled-components';
import { Col, FormGroup } from 'reactstrap';

export const ActionButtonWrapper = styled(Col)`
  align-items: baseline;
  display: flex;
  margin-top: 22px;

  > div {
    border: 1px solid #cdd5f2;
    height: 42px;
    width: 42px;
  }
`;

export const CustomFormGroup = styled(FormGroup)`
  .css-yk16xz-control, .css-1pahdxg-control {
    min-height: 42px !important;
  }
`;
