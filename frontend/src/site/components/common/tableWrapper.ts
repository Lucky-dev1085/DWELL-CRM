import styled from 'styled-components';
import lighten from '@bit/styled-components.polished.color.lighten';
import * as variables from './styledVariables';
import { parseColor } from './mixin';
import { Avatar } from './common';

export const TableWrapper = styled.div`
  table {
    border-collapse: separate;
    border-spacing: 0 4px;
    letter-spacing: -0.2px;
  }

  thead th {
    border-top-width: 0;
    border-bottom-width: 0;
    font-size: ${variables.fontSizeSm};
    font-weight: 400;
    color: ${variables.colorTx03};
    vertical-align: middle;
    padding: 6px 10px;
  }

  tbody tr {
    box-shadow: 0 1px 2px rgba(${parseColor(variables.colorBg03).toString()}, .2);
    border-radius: 6px;

    &:hover, &:focus {
      position: relative;
      box-shadow: ${variables.shadow01}, ${variables.shadow02}, ${variables.shadow04};
    }

    &.selected {
      box-shadow: none;

      ${Avatar} {
        background-color: ${lighten('0.4', variables.colorUi01)};
        color: rgba(${parseColor(variables.colorUi02).toString()}, .75);
      }

      td {
        background-color: ${lighten('0.48', variables.colorUi01)};
        color: rgba(${parseColor(variables.colorUi02).toString()}, .85);
        border-color: ${lighten('0.12', variables.colorUi01)};

        strong { color: ${variables.colorUi02}; }
      }

      &:hover, &:focus {
        box-shadow: none;
      }

      i { color: ${variables.colorTx03};}
    }
  }

  tbody td {
    border-top-width: 1px;
    border-top-color: transparent;
    border-bottom: 1px solid transparent;
    background-color: #fff;
    color: ${variables.colorTx02};
    padding: 9px 10px;
    vertical-align: middle;

    &:first-child { border-left: 1px solid transparent; }
    &:last-child { border-right: 1px solid transparent; }

    .nav { justify-content: flex-end; }
  }

  thead th,
  tbody td {
    &:first-child {
      padding-left: 20px;
      border-top-left-radius: 6px;
      border-bottom-left-radius: 6px;
    }

    &:last-child {
      padding-right: 15px;
      border-top-right-radius: 6px;
      border-bottom-right-radius: 6px;
    }
  }

  .page-item {
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
    border-radius: 5px;
    height: ${variables.heightBase};
    width: ${variables.heightBase};
    display: flex;
    align-items: center;
    justify-content: center;

    + .page-item { margin-left: 5px; }

    &.active .page-link {
      &,&:hover,&:focus {
        background-color: ${variables.colorUi01};
        color: #fff;
        box-shadow: none;
      }
    }
  }

  .react-bootstrap-table-pagination {
    display: flex;
    margin: auto;
    padding: 10px 0;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(193,200,222,0.2);
    align-items: center;
    margin-top: -16px;
    position: sticky;
    left: 0;

    .react-bootstrap-table-pagination-list {
      display: flex;
      justify-content: flex-end;

    }

    .pagination {
      margin-bottom: 0px;
    }
  }
`;
