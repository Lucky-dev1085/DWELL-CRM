import styled from 'styled-components';
import { Button } from 'reactstrap';

export const ContentTitle = styled.h4`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.colors.colortx01};
  letter-spacing: -0.5px;
  margin-bottom: 0;
`;

export const CardTitle = styled.h5`
  font-size: ${props => (props.xs ? '16px' : '20px')};
  color: ${props => (props.xs ? props.theme.colors.colortx01 : props.theme.colors.bodyColor)};
  font-weight: 600;
  margin-bottom: 0;
  margin-right: auto;
`;

export const CardSubTitle = styled.span`
  margin-top: -.375rem;
  margin-bottom: 0;
  font-size: 13px;
  color: ${props => props.theme.colors.colortx03};
`;

export const ContentContainer = styled.div`
  padding: 25px 30px 50px 30px;

  .breadcrumb {
    border-radius: 0;
    background-color: transparent;
    padding: 0;
    margin-bottom: 5px;
    border: none;

    li {
      font-size: 13px;
    }

    a {
      color: ${props => props.theme.colors.colorui01};
      text-decoration: none;
      background-color: transparent;
      font-weight: 400;
    }

    .active {
      font-weight: 400;
      color: ${props => props.theme.colors.gray};
    }
  }
`;

export const ContentHeader = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: 25px;
`;

export const TabGroup = styled.div`
  position: relative;
  display: inline-flex;
  vertical-align: middle;
`;

export const TabButton = styled(Button)`
  background-color: ${props => (props.active ? props.theme.colors.colorui01 : props.theme.colors.colorbg01)} !important;
  color: ${props => (props.active ? '#fff' : props.theme.colors.colortx02)} !important;
  border-color: ${props => (props.active ? props.theme.colors.colorui01 : props.theme.input.borderColor)} !important;
  box-shadow: none !important;
  font-weight: 400;
  transition: background-color 0.25s,color 0.25s;
  border-radius: 0;
  padding-left: 20px;
  padding-right: 20px;
  height: 38px;
  letter-spacing: -0.2px;

  &:hover {
    color: ${props => (props.active ? '#fff' : props.theme.colors.colorui01)} !important;
    border-color: ${props => props.theme.colors.colorui01} !important;
    background-color: ${props => (!props.active ? '#fff' : props.theme.colors.colorui01)} !important;
    ${props => !props.active && 'z-index: 1;'}
  }

  &:first-child {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
  }

  &:last-child {
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  &:not(:first-child) {
    margin-left: -1px;
  }
`;

export const CompeteStar = styled.div`
  color: ${props => (props.isActive ? props.theme.colors.yellow : props.theme.colors.colortx03)};
  display: inline-block;
  cursor: pointer;
  ${props => props.disabled && 'pointer-events: none;'}

  &:hover {
    color: ${props => props.theme.colors.yellow};
  }

  i {
    display: block;
    font-size: 20px;
    position: relative;
    top: 1.5px;
  }
`;

export const ItemLabel = styled.label`
  display: block;
  margin-bottom: 5px;
  line-height: 1;
  color: ${props => props.theme.colors.colortx03};
  font-size: 13px;
  font-weight: 400;
`;

export const ItemValue = styled.h6`
  font-weight: 400;
  color: ${props => props.theme.colors.colortx01};
  line-height: 1.5;
  display: flex;
  align-items: center;
`;

export const ItemLink = styled.a`
  font-size: 14px;
  margin-left: 5px;
  line-height: 1;
  position: relative;
  top: 1.5px;
  color: ${props => props.theme.colors.colorui01};
  outline: none;
  transition: all 0.25s;

  &:focus, &:hover {
    text-decoration: none;
    color: #0148ae;
  }
`;

export const EmptyProp = styled.div`
  background-color: ${props => props.theme.colors.gray100};
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: ${props => (props.left ? 'left' : 'center')};
  justify-content: center;

  i {
    font-size: 48px;
    line-height: 1;
    margin-bottom: 20px;
  }

  h5 {
    color: ${props => props.theme.colors.colortx01};
    font-weight: 600;
    margin-bottom: 2px;
  }

  p {
    margin-bottom: 0;
  }
`;

export const LinkText = styled.span`
  color: ${props => props.theme.colors.colorui01};
  text-decoration: none !important;
  background-color: transparent;

  &:hover {
    color: #0148ae;
  }
`;

export const Link = styled.a`
  color: ${props => props.theme.colors.colorui01};
  text-decoration: none !important;
  background-color: transparent;

  &:hover {
    color: #0148ae;
  }
`;

export const FeatureList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: inside;
`;

export const ChartWrapper = styled.div`
  height: 350px;
  margin-top: 10px;
  margin-bottom: 20px;
`;

export const BreakdownItem = styled.div`
  h2 {
    font-size: ${props => (props.small ? '24px' : '28px')};
    font-weight: 500;
    font-family: "Helvetica Neue",Arial,sans-serif;
    color: ${props => props.theme.colors.colortx01};
    margin-bottom: 8px;
    letter-spacing: -.5px;
  }

  small {
    display: block;
    font-size: 12px;
    color: ${props => props.theme.colors.colortx03};
  }
`;

export const BreakdownLabel = styled.label`
  display: block;
  line-height: 1;
  margin-bottom: 2px;
  color: ${props => props.theme.colors.colortx02};
  font-weight: 600;
  font-size: 11px;
  letter-spacing: .5px;
  text-transform: uppercase;

  span {
    letter-spacing: normal;
    text-transform: none;
    font-weight: 400;
    font-size: 12px;
    color: ${props => props.theme.colors.colortx03};
  }
`;

export const CollapseArea = styled.h6`
  font-weight: 500;
  display: flex;
  align-items: center;
  position: relative;
  outline: none;
  cursor: pointer;
  margin-bottom: 0;
  color: ${props => props.theme.colors.colorui01};

  i {
    line-height: 1;
    position: relative;
    top: 1px;
    transition: all 0.25s;
    ${props => props.active && 'transform: rotate(90deg)'};
  }

  &:hover {
    color: #0148ae;
  }
`;

export const TableContainer = styled.div`
  position: relative;
  overflow: hidden;
  transition: all 0.5s;
  max-height: 0;
  ${props => props.show && 'max-height: 500vh; margin-top: 20px;'}
`;

export const AlertStatus = styled.span`
  display: flex;
  align-items: center;
  text-transform: capitalize;

  &:before {
    content: '';
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 100%;
    margin-right: 5px;
    background-color: ${props => (props.active ? props.theme.colors.success : props.theme.colors.warning)};
  }
`;

export const NoWrap = styled.div`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const CardHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const LeaseUp = styled.div`
  background-color: #ffe53c;
  border: 1px solid #f5d400;
  padding: 0 25px;
  border-radius: 4px;
  color: white;
  font-weight: 600;

  ${props => props.small && `
    padding: 0 8px;
    margin-left: 10px;
  `}
`;

export const BlueBadge = styled.div`
  background-color: #74add7;
  border: 1px solid #60a1d1;
  padding: 0 25px;
  border-radius: 4px;
  color: white;
  font-weight: 600;

  ${props => props.small && `
    padding: 0 8px;
    margin-left: 10px;
  `}
`;
