import { Card } from 'reactstrap';
import styled from 'styled-components';
import * as variables from './styledVariables';

export const FloorPlanCard = styled(Card)`
  border-width: 0;
  border-radius: 0;
  margin-bottom: 0;

  .card-body {
    padding: 15px;
    border: 1px solid ${variables.colorBg02};
    border-top-width: 0;
    border-bottom-width: 0;
  }

  .card-footer {
    border: 1px solid ${variables.colorBg02};
    border-bottom-width: 0;
    background-color: #fff;
    padding: 15px;
    display: flex;

    .form-group {
      margin-bottom: 0;
      flex: 1;
      position: relative;

      span {
        position: absolute;
        left: 12px;
        top: 8.5px;
        color: ${variables.colorTx03}$color-tx-03;
      }

      + .form-group {
        margin-left: 30px;

        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: -20px;
          width: 10px;
          border-bottom: 1px solid ${variables.colorTx03};
        }
      }
    }

    .form-control {
      padding-left: 25px;
      height: ${variables.heightBase};
      border-radius: 4px;
    }

    &:last-child {
      padding-top: 0;
      border-top-width: 0;
      border-bottom-width: 1px;
    }
  }
`;
