import styled from 'styled-components';
import { TableWrapper } from 'site/components/common';

export const TableProperty = styled(TableWrapper)`
  thead th {
    &:first-child { padding-left: 74px; width: 35%; }
    &:nth-child(3) { width: 13%; }
    &:nth-child(3) { width: 13%; }
    &:nth-child(4) { width: 15%; text-align: right; }
    &:nth-child(5) { width: 8%; text-align: right; }
    &:nth-child(6) { width: 6%; text-align: right; }
    &:last-child { width: 13%; }

    &:hover {  outline: none; }
  }
  table {
    img {
      object-fit: cover;
    }
  }
`;

export const PropertyDomain = styled.a`
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: 400;
  color: ${props => props.theme.colors.colortx03};
  display: inline-block;
`;

export const PropertiesCount = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.colorui01};
`;
