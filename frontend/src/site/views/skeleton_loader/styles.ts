import { Card } from 'reactstrap';
import styled from 'styled-components';

export const SiteSideBarSkeleton = styled.div`
  width: 200px;
  margin-right: 20px;

  .list-group {
    flex-direction: column;
  }

  .list-group-item {
    height: 38px;
    border-radius: 6px;
    border-color: transparent;
    background-color: #f0f2f9 !important;

    + .list-group-item { margin-top: 6px; }
  }
`;

export const CardSkeleton = styled(Card)`
  border-radius: 6px;
  height: 200px;
  background-color: #f0f2f9;
  border: none;
  margin-bottom: 0;

  & + & { margin-top: 20px; }
`;
