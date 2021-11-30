import styled from 'styled-components';
import { Button } from 'reactstrap';
import { CardBasic as Card } from 'compete/components/common';

export const FormLabel = styled.label`
  display: block;
  margin-bottom: 10px;
  line-height: 1;
  font-size: 13px;
  font-weight: 400;
  color: ${props => props.theme.colors.gray600};
`;

export const CardTitle = styled.h6`
  font-weight: 600;
  margin-bottom: 0;
  font-size: 16px;
  color: ${props => props.theme.colors.bodyColor};
`;

export const CardBasic = styled(Card)`
  .card-header {
    padding: 18px 20px 20px;
  }

  .card-body {
    padding: 0 20px 20px;
  }
`;

export const ButtonPrimary = styled(Button)`
  height: 38px;
  width: 100%;
  border-radius: 4px;

  &:hover, &:focus {
    background-color: #0158d4 !important;
    border-color: #0153c7 !important;
  }
`;

export const InvalidFeedback = styled.div`
  font-size: 80%;
  color: #f86c6b;
  margin-bottom: 5px;
`;

export const ComparisonWelcome = styled.div`
  height: 100%;
  background-color: ${props => props.theme.colors.colorbg01};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  i {
    font-size: 48px;
    line-height: .8;
    margin-bottom: 15px;
    color: ${props => props.theme.colors.colortx03};
  }

  h5 {
    color: ${props => props.theme.colors.colortx02};
  }

  p {
    margin-bottom: 0;
    color: ${props => props.theme.colors.colortx03};
  }
`;

export const ToggleWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FormSwitch = styled.div`
  border: none;
  margin-bottom: 0;
  width: 30px;
  height: 16px;
  background-color: ${props => (props.checked ? props.theme.colors.green : props.theme.colors.colorbg02)};
  border-radius: 10px;
  position: relative;
  transition: background-color 0.25s;
  cursor: pointer;

  &:focus {
    outline: none;
  }

  &:before {
    content: '';
    width: 12px;
    height: 12px;
    background-color: #fff;
    border-radius: 100%;
    position: absolute;
    top: 2px;
    left: ${props => (props.checked ? '16px' : '2px')};
    transition: left 0.25s;
  }
`;

export const ChartLegend = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  align-items: center;
  margin-bottom: 25px;

  li {
    position: relative;
    padding-left: 15px;
    font-size: 13px;
  }

  li:first-child {
    color: #4d8bfb;
  }

  li:last-child {
    color: #21c6b7;
  }

  li:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    height: 2px;
    width: 10px;
    margin-top: -1px;
  }

  li:first-child:before {
    background-color: #4d8bfb;
  }

  li:last-child:before {
    background-color: #21c6b7;
  }

  li + li {
    margin-left: 20px;
  }
`;

export const BreakdownContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  word-wrap: break-word;
  background-color: #fff;
  border: 1px solid ${props => props.theme.colors.colorbd02};
  padding: 18px 20px 20px;
  border-radius: 5px
`;

export const Info = styled.small`
  display: flex !important;
  align-items: center;
  font-size: 11px !important;
  color: ${props => (props.succes ? props.theme.colors.success : props.theme.colors.red)} !important;
  margin-bottom: 2px;
`;
