import styled from 'styled-components';
import * as variables from './styledVariables';
import { parseColor } from './mixin';

export const SiteSideBar = styled.div`
  width: 200px;
  margin-right: 20px;

  .list-group {
    flex-direction: column;
  }

  .list-group-item {
    display: flex;
    align-items: center;
    padding: 0 10px;
    height: ${variables.heightMd};
    color: ${variables.colorTx02};
    border-radius: 4px;
    border-color: transparent;
    background-color: transparent;
    cursor: pointer;

    &:focus, &:hover {
      background-color: rgba(${parseColor(variables.colorBg02).toString()}, .4);
    }

    i {
      font-size: 20px;
      font-weight: 400;
      line-height: 1;
      margin-right: 15px;
      margin-left: -1px;
    }

    &.active {
      background-color: ${variables.colorUi01};
      color: #fff;

      i { color: inherit; }
    }

    + .list-group-item { margin-top: 3px; }
  }
`;
