import { Table } from 'reactstrap';
import styled from 'styled-components';
import * as variables from './styledVariables';

export const SiteTable = styled(Table)`
  margin-bottom: 5px;

  thead {
    background-color: inherit;
    color: inherit;
  }

  thead th {
    font-weight: 400;
    font-size: 12px;
    color: ${variables.colorTx03};
    border-top-width: 0;
    border-bottom-width: 0;
    padding-left: 0;
    padding-right: 0;
  }

  tbody td {
    padding: 7px 0;
    border-color: ${variables.colorBg01};
    vertical-align: middle;
    word-break: break-word;
    color: ${variables.bodyColor};
  }
`;
