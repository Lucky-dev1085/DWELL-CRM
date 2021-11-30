import styled from 'styled-components';

export const TableWrapper = styled.div`
  table {
    border-collapse: separate;
    border-spacing: 0 2px;
    letter-spacing: -0.2px;
    color: ${props => props.theme.colors.bodyColor};
  }

  thead th {
    border-top-width: 0;
    border-bottom-width: 0;
    padding: 6px 10px;
    color: ${props => props.theme.colors.colortx01};
    font-weight: 500;
    font-size: 12px;
    letter-spacing: .2px;
    padding-top: 10px;
    padding-bottom: 10px;
    background-color: ${props => props.theme.colors.colorbg01};
    line-height: 1.3;
    vertical-align: middle;
  }

  tbody tr {
    box-shadow: none;
    border-radius: 4px;
    td {
      background-color: ${props => props.theme.colors.gray100};
    }

    &:hover, &:focus {
      position: relative;
      box-shadow: inset 0 0 0 1px ${props => props.theme.colors.colorbd02};
      z-index: 10;

      td {
        background-color: transparent;
      }
    }
  }

  tbody td {
    border-top: 1px solid ${props => props.theme.input.borderColor};
    padding: 9px 10px;
    color: ${props => props.theme.colors.colortx02};
    border-top-width: 1px;
    border-top-color: transparent;
    border-bottom: 1px solid transparent;
    vertical-align: bottom;
    font-size: 13px;
    line-height: 1.7;
    background-color: #fff;


    &:first-child {
      border-left: 1px solid transparent;
      border-top-left-radius: inherit;
      border-bottom-left-radius: inherit;
    }
    &:last-child {
      border-right: 1px solid transparent;
     }

    .nav { justify-content: flex-end; }
  }

  thead th,
  tbody td {
    &:first-child {
      padding-left: 15px;
      border-top-left-radius: 3px;
      border-bottom-left-radius: 3px;
    }

    &:last-child {
      border-top-right-radius: 3px;
      border-bottom-right-radius: 3px;
      padding-right: 15px;
    }
  }

  .page-item {
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
    border-radius: 5px;
    height: ${props => props.theme.templates.heightsm};
    width: ${props => props.theme.templates.heightsm};
    display: flex;
    align-items: center;
    justify-content: center;

    + .page-item { margin-left: 5px; }

    &.active .page-link {
      &,&:hover,&:focus {
        background-color: ${props => props.theme.colors.colorui01};
        color: #fff;
        box-shadow: none;
      }
    }
  }

  .react-bootstrap-table-pagination {
    display: flex;
    margin: auto;
    padding: 10px 0 2px 0;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(193,200,222,0.2);
    align-items: center;
    margin-top: -16px;
    position: sticky;
    left: 0;
    ${props => props.paginationHidden && 'display: none;'}

    .react-bootstrap-table-pagination-list {
      display: flex;
      justify-content: flex-end;
      padding-right: 0;
    }

    .pagination {
      margin-bottom: 0px;
    }
  }

  .react-bootstrap-table-page-btns-ul {
    ${props => props.paginationHidden && 'display: none;'}
  }

  tbody .selected-row {
    td {
      background-color: #f1f7ff;
      color: rgba(36,55,130,0.85);
      border-color: #3a8bfe;
    }
  }

  .overflow-visible {
    overflow: visible;
  }

  ${props => props.alignMiddle && `
    tbody tr td {
      vertical-align: middle;
    }
  `}

  tfoot tr {
    box-shadow: none;
    border-radius: 4px;
    th {
      padding: 9px 10px;
      border-bottom: 1px solid #3a8bfe;
      background-color: #f1f7ff;
      color: ${props => props.theme.colors.colortx02};
      font-size: 13px;
      font-weight: 400;
      border-color: #3a8bfe;

      &:first-child {
        padding-left: 15px;
        border-left: 1px solid #3a8bfe;
        border-top-left-radius: inherit;
        border-bottom-left-radius: inherit;
      }
      &:last-child {
        padding-right: 15px;
        border-right: 1px solid #3a8bfe;
        border-top-right-radius: inherit;
        border-bottom-right-radius: inherit;
      }
    }
  }
`;
