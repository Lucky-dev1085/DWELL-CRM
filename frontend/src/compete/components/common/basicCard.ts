import { Card } from 'reactstrap';
import styled from 'styled-components';
import { shadowDiffuse } from './mixin';

export const CardBasic = styled(Card)`
  border-color: ${props => props.theme.colors.colorbg02};
  ${props => shadowDiffuse(props.theme.colors.colorbg02)}
  margin-bottom: 0;

  .card-header {
    display: flex;
    align-items: center;
    background-color: transparent;
    border-bottom-width: 0;
    padding: 20px 23px;

    ${props => props.$dropdownHeader && 'padding: 15px 25px;'}
  }

  .card-body {
    padding: 0 23px 23px;
  }

  .text-danger {
    color: ${props => props.theme.colors.red} !important;
  }

  .text-success {
    color: ${props => props.theme.colors.success} !important;
  }

  .text-muted {
    color: ${props => props.theme.colors.gray600} !important;
  }
`;
