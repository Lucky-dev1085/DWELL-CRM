import styled from 'styled-components';
import * as variables from './styledVariables';
import { parseColor } from './mixin';

export const SiteSavePanel = styled.div`
  position: fixed;
  bottom: 0;
  left: ${props => props.theme.templates.leftbarWidth};
  right: 0;
  padding: 17px 20px;
  background-color: rgba(255,255,255,0.9);
  border-top: 1px solid rgba(${parseColor(variables.borderColor).toString()}, .8);
  display: flex;
  align-items: center;
  box-shadow: 0 -5px 15px rgba(${parseColor(variables.colorTx03).toString()}, .21);
  transform: ${props => (props.show ? 'translateY(0)' : 'translateY(140px)')};
  transition: all 0.25s;

  .btn {
    padding-left: 20px;
    padding-right: 20px;

    i {
      font-size: 18px;
      line-height: 1px;
      margin-right: 5px;
    }

    &.btn-primary {
      width: 150px;
      align-items: center;
      justify-content: center;
      background-color: ${variables.colorUi01};
      border-color: ${variables.colorUi01};

      &:hover, &:focus {
        background-color: #0158d4;
        border-color: #0153c7;
      }

      > span:nth-child(2),
      > span:last-child {
        display: none;
        align-items: center;
        justify-content: center;
      }

      &.disabled > span:first-child { display: none; }
      &.disabled > span:nth-child(2) { display: flex; }

      &.saved {
        border-width: 1.5px;
        background-color: transparent;
        border-color: #24ba7b;
        color: #24ba7b;
        font-weight: ${variables.fontWeightMedium};

        > span:first-child,
        > span:nth-child(2) { display: none; }
        > span:last-child { display: flex; }
      }
    }

    + .btn { margin-left: 8px; }

    &.btn-secondary {
      background-color: rgba(225,230,247,0.6);
      color: ${variables.colorTx02};
      border-width: 0;

      &:hover, &:focus {
        background-color: ${variables.colorBg02};
      }
    }
  }
`;
