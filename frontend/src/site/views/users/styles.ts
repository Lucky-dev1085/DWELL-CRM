import styled from 'styled-components';
import { UncontrolledTooltip } from 'reactstrap';
import { EmptyContent as CommonEmptyContent } from 'styles/common';
import { TableWrapper } from 'site/components/common';

export const TableUser = styled(TableWrapper)`
  table {
    width: auto;
    min-width: 100%;

    td {
      &:nth-child(5) { text-align: right; padding-right: 25px; }
    }
  }

  thead th {
    &:nth-child(5) { text-align: right; padding-right: 25px; }
    &:nth-child(7) { width: 10%; }
  }
`;

export const Avatar = styled.div`
  width: ${props => props.theme.templates.heightBase};
  height: ${props => props.theme.templates.heightBase};
  background-color: ${props => props.theme.colors.colortx03};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  position: relative;
  font-size: 12px;
  text-transform: uppercase;
`;

export const EmptyContent = styled(CommonEmptyContent)`
  height: calc(100vh - 350px);
`;

export const Tooltip = styled(UncontrolledTooltip)`
  pointer-events: none;
`;
