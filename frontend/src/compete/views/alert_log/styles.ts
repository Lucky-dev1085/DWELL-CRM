import styled from 'styled-components';

export const TextStatus = styled.span`
  display: inline-flex;
  align-items: center;

  i {
    font-size: ${props => (props.lg ? '14px' : '12px')};
    ${props => props.lg && 'margin-right: 2px;'}
  }
`;

export const TableTitle = styled.h6`
  color: ${props => props.theme.colors.colortx01};
  font-weight: 600;
`;
