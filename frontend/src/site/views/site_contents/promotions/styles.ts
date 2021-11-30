import { TableWrapper } from 'site/components/common';
import { EmptyContent as CommonEmptyContent } from 'styles/common';
import styled from 'styled-components';

export const TableClient = styled(TableWrapper)`
  thead th {
    &:first-child { width: 25%; }
    &:nth-child(2) { width: 30%; }
    &:nth-child(3) { width: 15%; }
    &:nth-child(4) { width: 15%; }
    &:nth-child(5) { width: 15%; }
    &:hover {  outline: none; }
  }
  td {
    img {
      width: 100px !important;
      height: 40px !important;
      object-fit: cover;
      border-radius: 3px;
    }
  }
`;

export const EmptyContent = styled(CommonEmptyContent)`
    height: calc(100vh - 350px);
`;

export const PromotionTextContainer = styled.span`
  p { margin: 0; }
`;
