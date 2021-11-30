import styled, { css } from 'styled-components';
import { Clock, Phone } from 'react-feather';
import { ListGroup, DropdownMenu, ListGroupItem, DropdownItem, DropdownToggle, Media } from 'reactstrap';

export const ReportValue = styled.h2`
    color: #0b2151;
    font-weight: 400;
    font-size: 32px;
    letter-spacing: -.2px;
    margin-bottom: 3px;
    font-family: "Rubik",sans-serif;
    margin-right: 5px;

    small {
        letter-spacing: -.5px;
        font-size: 22px;
        margin-left: 5px;
    }
`;

export const Icon = styled.i`
    margin-left: 2px;
    font-size: 18px;
    line-height: 0;
    position: relative;
    top: 2px;
    color: ${props => props.color};
`;

export const ReportLabel = styled.label`
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #4a5e8a;
    text-transform: uppercase;
    margin-bottom: 3px;
    letter-spacing: .5px;

    ${props => props.active && css`
        color: #0168fa;
        cursor: pointer;
    `}

    i {
        color: #0168fa;
        cursor: pointer;
    }
`;

export const Separator = styled.span`
    color: #d5dcf4;
    margin-left: 2px;
    margin-right: 2px;
`;

export const DownloadReportIcon = styled.svg`
    font-size: 16px;
    font-weight: 300;
    vertical-align: text-top;
    line-height: 15px;
    fill:#0168fa;
    vertical-align: text-top;
    margin-right: 5px;
`;

export const ReportCompare = styled.p`
    font-size: 12px;
    color: #929eb9;
    display: ${props => (props.compareFilterValue ? 'flex' : 'none')};
    margin-bottom: 0;
`;

export const ReportCompareValue = styled.span`
    display: flex;
    align-items: center;
    margin-right: 2px;
    color: ${props => props.color};
`;

export const PhoneIcon = styled(Phone)`
  margin-left: 0;
  margin-right: 8px;
  margin-bottom: 3px;
  fill: rgba(33,198,183,0.1);
`;

export const ClockIcon = styled(Clock)`
  margin-left: 0;
  margin-right: 8px;
  margin-bottom: 3px;
  fill: rgba(121,87,245,0.1);
`;

export const ToursChartLabel = styled.h6`
    margin-top: 25px;
    margin-bottom: 0;
`;

export const DropdownWrapper = styled.div`
    display: flex;
    font-size: 12px;
    color: #4a5e8a;
`;

export const FollowupsLabelsList = styled(ListGroup)`
    margin-top: 15px;
`;

export const FollowupsLabelsItem = styled(ListGroupItem)`
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    border-width: 0;
    padding: 0;
    font-size: 13px;
    position: relative;

    &:before {
        content: '';
        display: block;
        width: 8px;
        height: 8px;
        border-radius: 100%;
        margin-right: 10px;
        margin-top: -1.5px;
        background-color: ${props => props.color};
    }

    ${ReportCompare} {
        margin-left: 10px;
    }
`;

export const FollowupsLabelsItemPercents = styled.span`
    margin-left: auto;
    display: flex;
    > span{
        font-weight: 600;
        color: #0b2151;
    }
`;

// Reports dropdown
export const DropdownButton = styled(DropdownToggle)`
    cursor: pointer;
    display: flex;
    align-items: center;
    color: #0168fa;
    background-color: transparent;
    padding: 0;
    border: none;
    margin-left: 3px;
    font-size: 12px;

    &:hover {
      color: #0148ae;
      background-color: transparent;
    }

    &:focus {
      color: #0148ae;
      outline: none;
      box-shadow: none;
      background-color: transparent;
    }
`;

export const SelectMenu = styled(DropdownMenu)`
    border-width: 0 !important;
    border-radius: 4px;
    box-shadow: 2px 5px 45px rgba(36,55,130,0.12), 4px 5px 10px rgba(36,55,130,0.07);
    padding: 5px;
`;

export const SelectItem = styled(DropdownItem)`
    font-size: 13px;
    padding: 5px 10px;
    color: #4a5e8a;
    border-radius: 3px;
    border-width: 0 !important;

    &:hover, &:focus {
       background-color: #0168fa;
       color: #fff;
       outline: none;
    }
`;

export const TableCompare = styled(ReportCompare)`
    margin-left: 10px;
`;

export const Divider = styled.hr`
    opacity: 0;
    margin-top: 10px;
    margin-bottom: 10px;
`;

export const ReportMedia = styled(Media)`
    height: auto;
    margin-bottom: 25px;
`;

export const ReportSidebar = styled.div`
    width: 300px;
    margin-right: 25px;
    flex-shrink: 0;
`;

export const ReportChart = styled.div`
    flex: 1;
`;

export const CardBox = styled.div`
    border-radius: 4px;
    border: 1px solid rgba(36,55,130,0.1);
    padding: 13px 20px 15px;
    margin-bottom: 20px;
`;

export const PriceValueSmall = styled.small`
    letter-spacing: -.5px;
    font-size: 22px;
`;

export const ReportCardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
`;

export const ComparePeriodLabel = styled.span`
    margin-left: 3px;
    color: #929eb9;
`;

export const ScoringTable = styled.table`
    width: 100%;
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 4px;
    font-size: 12px;
    border: 1px solid #d5dcf4;
    width: 100%;
    color: #344563;
    border-top-width: 0 !important;
`;

export const ScoringTableHeaderItem = styled.th`
    position: sticky;
    top: 0;
    z-index: 9;
    background-color: #fff;
    border-bottom-width: 0 !important;
    border-left-width: 0 !important;
    border: 1px solid #d5dcf4;

    font-weight: 600;
    padding: 7px 20px 7px 10px;

    vertical-align: bottom;

    &:last-child {
        text-align: right;
        border-right-width: 0 !important;
    }
    ${props => props.sorting && css`
        cursor: pointer;

        span i {
            margin-left: 5px;
            opacity: .7;
        }
    `}
`;

export const ScoringTableBodyItem = styled.td`
    color: #4a5e8a;
    vertical-align: middle;
    border-bottom-width: 0 !important;
    padding: 7px 20px 7px 10px;
    border-left-width: 0 !important;
    border: 1px solid #d5dcf4;

    &:last-child {
        text-align: right;
        border-right-width: 0 !important;
        display: flex;
        justify-content: flex-end;
        font-weight: 500;
    }
`;

export const ReportCompareScoring = styled(ReportCompare)`
    font-size: 11px;
    font-weight: 400;
    width: 40px;
    margin-left: 0.5rem;
`;

export const StyledTBody = styled.tbody`
`;

export const StyledTHead = styled.thead`
`;

export const StyledTRow = styled.tr`
`;

export const CustomTooltip = styled.div`
    display: none;
    position: absolute;
    z-index: 100;
    background-color: black;
    color: white;
    opacity: 0.8;
    padding: 5px 10px;
    top: 2px;
    left: 2px;
    border-radius: 0.25rem;
    width: max-content;
    max-width: 175px;
`;

export const PropertyTableItem = styled(ScoringTableBodyItem)`
    position: relative;

    &:hover {
        ${CustomTooltip} {
            display: block;
        }
    }
`;

export const PropertiesText = styled.div`
    overflow-x: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

export const AgentReportLabel = styled(ReportLabel)`
    display: flex;
    i {
        color: #0168fa;
        cursor: pointer;
    }
`;

export const TableWrapper = styled.div`
    max-height: 550px;
    display: block;
    overflow-y: auto;
`;

export const SBTblWrapper = styled.div`
  display: block;
  width: 100%;
  overflow-x: auto;
`;

export const SBTbl = styled.table`
  width: 100%;
  margin-bottom: 1rem;
  color: #344563;
  border-collapse: collapse;
  text-indent: initial;
  border-spacing: 2px;
  border-color: grey;
  thead {
    tr {
      th {
        border-width: 0;
        padding: 10px;
        vertical-align: bottom;
        border-bottom: 2px solid #d5dcf4;
      }
    }
    tr: first-child {
      th {
        font-size: 16px;
        font-weight: 500;
        color: #0b2151;
        text-align: center;
        border-bottom-width: 1px;
      }
      th: first-child{
        border: none;
      }
      th: nth-child(even){
        background-color: #f0f2f9;
      }
    }
    tr: not(:first-child) {
      th: nth-child(2),
      th: nth-child(3),
      th: nth-child(4),
      th: nth-child(8),
      th: nth-child(9),
      th: nth-child(10),
      th: nth-child(11),
      th: nth-child(12),
      th: nth-child(13) {
        background-color: #f0f2f9;
      }
      th: first-child {
        text-align: left;
      }
    }
  }
  tbody {
    tr {
      td: first-child {
        text-align: left;
      }
      td: nth-child(2),
      td: nth-child(3),
      td: nth-child(4),
      td: nth-child(8),
      td: nth-child(9),
      td: nth-child(10),
      td: nth-child(11),
      td: nth-child(12),
      td: nth-child(13) {
        background-color: #f0f2f999;
      }
      td {
        border-color: #e2e7f4;
        padding: 10px;
        vertical-align: top;
        border-top: 1px solid #d5dcf4;
        font-size: 13px;
        color: #4a5e8a;
      }
      :hover {
        background-color: #f0f2f9
      }
    }
  }
`;

export const SBTblHeaderItem = styled.th``;

export const SBTblHeaderSub = styled.th`
  text-align: right;
  border: none !important;
  span {
    font-size: 12px;
    font-weight: 400;
    color: #929eb9;
    margin-bottom: 3px;
  }
  p {
    margin-top: 0;
    margin-bottom: 1rem;
  }
`;

export const SBTblHeaderBody = styled.th`
  font-weight: bold;
  text-align: right;
`;

export const SBTblBodyItem = styled.td`
  text-align: right;
`;
