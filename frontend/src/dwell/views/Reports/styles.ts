import styled, { css } from 'styled-components';
import { Dropdown, DropdownMenu, Card, CardBody, CardHeader, Nav, NavItem, NavLink, TabContent, Col, Label } from 'reactstrap';
import { ContentTitle as Title, DefaultDropdownItem, DefaultDropdownMenu, SelectToggle } from 'styles/common';

// Filters
export const DropdownWrapper = styled(Dropdown)`
      margin-left: 10px;
`;

export const DropdownToggle = styled(SelectToggle)`
    height: 40px;
    padding-left: 12px;
    padding-right: 28px;
    padding-bottom: 2px;
    border-radius: 5px;
    color: #4a5e8a;
    position: relative;
    outline: none;
    transition: all 0.2s;
    padding-top: 0;
    background-color: #fff !important;

    &:after {
      content: '\\EBA8';
      font-family: 'remixicon';
      font-size: 11px;
      position: absolute;
      top: 50%;
      right: 10px;
      transform: rotate(90deg);
      line-height: 0;
      opacity: .5;
      border-style: none;
      margin-top: 0;
      width: 11px;
    }
`;

export const Icon = styled.i`
    margin-right: 5px;
    font-size: 16px;
    font-weight: 700;
    line-height: .8;
    color: #0168fa;
`;

export const FilterDropdownMenu = styled(DropdownMenu)`
    ${DefaultDropdownMenu}
    min-width: 160px;
    background-color: #fff;
    position: absolute;
    padding: 8px;
    margin-top: 5px;
    border-radius: 5px;
    max-height: fit-content;
`;

export const FilterDropdownItem = styled.button`
    ${DefaultDropdownItem}
    white-space: nowrap;

    ${props => props.disabled && css`
            background-color: #f7f8fc !important;
            color: #929eb9 !important;
    `}
`;

// Main
export const ContentHeader = styled.div`
  margin-bottom: 30px;
  display: flex;
  align-items: center;
`;

export const ContentTitleWrapper = styled.div`
  margin-right: auto;
`;

export const ContentTitle = styled(Title)`
  margin-bottom: 3px;
`;

export const ContentText = styled.span`
  font-size: 13px;
  color: #4a5e8a;
`;

// Report Block
export const ReportCard = styled(Card)`
    border-color: #e1e6f7;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(225,230,247,0.07),
    0 2px 4px rgba(225,230,247,0.07),
    0 4px 8px rgba(225,230,247,0.07),
    0 8px 16px rgba(225,230,247,0.07),
    0 16px 32px rgba(225,230,247,0.07),
    0 32px 64px rgba(225,230,247,0.07);
`;

export const ReportCardHeader = styled(CardHeader)`
    padding: 22px 25px 25px;
    background-color: transparent;
    border-bottom-width: 0;
    display: ${props => (props.show ? 'flex' : 'none')};
    justify-content: space-between;
`;

export const ReportCardTitle = styled.h6`
    font-size: 16px;
    font-weight: 600;
    color: #0b2151;
    margin-bottom: 8px;

    ${props => props.active && css`
        color: #0168fa;
        cursor: pointer;
    `}
`;

export const ReportCardText = styled.span`
    display: block;
    color: #929eb9;
    font-size: 13px;
    line-height: 1.4;
`;

export const ReportCardBody = styled(CardBody)`
    padding: ${props => (props.upperPadding ? '25px' : '0')} 25px 25px;
`;

export const PropertyFilterDropdownMenu = styled(FilterDropdownMenu)`
  width: max-content;
`;

export const InnerIcon = styled(Icon)`
  color: #4a5e8a;
  margin-left: 5px;
`;

export const PortfolioTabContentType = styled.div`
    padding: 5px 10px;
    cursor: pointer;
    color: #4a5e8a;
    background-color: #fff;
    border-radius: 4px;
    display: flex;
    align-items: center;

    &:hover {
      ${InnerIcon} {
        color: #fff;
      }
      color: #fff;
      background-color: #0168fa;
    }
`;

export const PortfolioSearch = styled.div`
  margin: 1rem;
`;

export const PortfolioTabs = styled(Nav)`
  display: flex;
  justify-content: space-between;
  margin: 0.3rem 0 0;
`;

export const PortfolioTabItem = styled(NavItem)`
  margin-bottom: 0;
  cursor: pointer;
  color: #4a5e8a;

  &:hover {
    color: #0168fa;
  }

  ${props => props.active && css`
      border-color: #fff #fff #0168fa;
      border-bottom: 2px solid #0168fa;
      color: #0168fa;
  `}
`;

export const PortfolioTabLink = styled(NavLink)`
  border: none;
  font-weight: 400;
  text-align: center;

  &:hover {
    border-color: transparent !important;
  }
`;

export const PortfolioTabContent = styled(TabContent)`
  border: none;
`;

export const DrilldownIcon = styled.i`
  font-size: 18px;
  cursor: pointer;
  color: #929eb9;
  margin-right: 0 !important;

  &:hover {
    color: #4a5e8a;
  }
`;

export const CallQuestionCol = styled(Col)`
  background-color: #fff;
  border: 1px solid ${props => props.theme.colors.colorbg02};
  padding: 10px !important;
  display: flex;
  align-items: center;
  transition: all 0.2s;

  span:first-child { margin-right: 5px; }
  span:last-child {
    color: ${props => props.theme.colors.colortx03};
    margin-left: auto;
  }
  font-weight: 400;

  i {
    line-height: 1;
    font-size: 18px;
  }
`;

export const ScoredCallsTableContainer = styled(Col)`
  padding-bottom: 1em;

  tr.row-selected {
    td {
      background-color: #fff;
      border-width: 1.5px;
      border-bottom-width: 0;

      &:first-child { border-bottom-left-radius: 0; }
      &:last-child { border-bottom-right-radius: 0; }

      color: rgba(36,55,130, 0.85);
      border-color: #3a8bfe !important;
    }

    + tr {
      display: table-row;
      td {
        background-color: #fff;
        border-width: 1.5px;
        border-top-width: 0;

        &:first-child { border-top-left-radius: 0; }
        &:last-child { border-top-right-radius: 0; }

        color: rgba(36,55,130, 0.85);
        border-color: #3a8bfe !important;
      }
    }
  }
`;

export const ScoreLink = styled.a`
  color: ${props => props.theme.colors.colorui01} !important;
  font-family:${props => props.theme.fonts.numeric};
  position: relative;
  display: flex;
  align-items: center;
  outline: none;
  cursor: pointer;

  &::after {
    content: '\\EA4D';
    font-family: 'remixicon';
    font-size: 16px;
    display: inline-block;
    position: relative;

    ${props => props.expanded && css`
      content: '\\EA77';
      top: 1px;
    `}
  }
`;

export const PrevScore = styled.p`
  margin-bottom: 0px;
  margin-top: 3px;
  font-size: 12px;
`;

export const DownloadIcon = styled.i`
  cursor: pointer;
  color: ${props => props.theme.colors.colorui01};
`;

export const RescoreModalNote = styled(Label)`
  font-size: 11px;
`;
