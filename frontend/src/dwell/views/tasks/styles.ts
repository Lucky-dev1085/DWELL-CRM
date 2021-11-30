import styled, { css } from 'styled-components';
import { Col, Row } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import { PrimaryButton } from 'styles/common';

export const ContentTitle = styled.h4`
`;

export const Content = styled.div`
  background-color: #fff;
`;

export const TaskType = styled.div`
    margin-bottom: 2px;
    font-weight: ${props => props.theme.fontWeights.medium};
    color: ${props => props.theme.colors.colortx01};

    &::before {
      border-radius: 2px;
      border-color: rgba(${props => props.theme.colors.colorui02}, .25);
    }
`;

export const TaskLabel = styled.label`
  line-height: 1;
  display: block;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 15px;
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.colortx01};
`;

export const TaskItem = styled.div`
  background-color: #fff;
  margin-top: 10px;
  border-radius: 5px;
  box-shadow: 0 1px 1px rgba(193,200,222,0.11),
  0 2px 2px rgba(193,200,222,0.11),
  0 4px 4px rgba(193,200,222,0.11),
  0 6px 8px rgba(193,200,222,0.11),
  0 8px 16px rgba(193,200,222,0.11);
`;

export const TaskGroup = styled.div`
    flex: 0 0 25%;
    max-width: 25%;
    padding-left: 10px !important;
    padding-right: 10px !important;
`;

export const TaskList = styled(Col)`
  background-color: ${props => props.theme.colors.colorbg01};
  padding: 15px;
  height: 100%;
  width: 100%;
`;

export const TaskGroups = styled(Row)`
    padding-top: 1rem;
`;

export const TaskLabelSpan = styled.span`
  font-weight: 400;
  color: ${props => props.theme.colors.colortx03};
`;

export const TaskFooter = styled.div`
  position: relative;
  width: 100%;
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.colortx02};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  border-top: 1px solid rgba(36,55,130,0.08);
`;

export const TaskBody = styled.div`
   font-size: ${props => props.theme.fontSizes.sm};
   color: ${props => props.theme.colors.colortx03};
   margin-bottom: 5px;
`;

export const TaskDue = styled.strong`
    font-weight: ${props => props.theme.fontWeights.medium};
`;

export const TaskEditLinks = styled.span`
    color: ${props => props.theme.colors.colorbg03} !important;
    font-size: 16px;
    line-height: 1rem;
    cursor: pointer;
    vertical-align: middle;
    padding: 3px;

    :hover {
        ${props => !props.disabled && css`
            color: ${props.theme.colors.colortx02} !important;
        `}
    }
    + span { margin-left: 0.3rem;}
`;

export const LeadDetails = styled(TaskBody)`
    margin-bottom: 5px;
    display: flex;
    flex-direction: row;
    color: ${props => props.theme.colors.colortx02};
`;

export const AssignedOwner = styled(LeadDetails)`
    margin-bottom: 0;
`;

export const TaskNavLinks = styled.nav`
    ${TaskEditLinks}:hover & {
    color: red;
  }
`;

export const TaskDueDate = styled.div``;

export const TaskHeader = styled.div`
    padding-top: 12px;
    padding-left: 38px;
`;

export const TaskHeaders = styled.div`
    padding: 12px 10px 12px 14px;
    display: flex;
    flex-direction: row;

    .custom-checkbox .custom-control-label::before {
        border-radius: 2px;
        border-color: rgba(36,55,130,0.25);
    }

    .custom-control-input:checked ~ .custom-control-label::before {
        border-color: ${props => props.theme.colors.colorui01};
    }
`;

export const TaskInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

export const LeadLink = styled(NavLink)`
    font-weight: ${props => props.theme.fontWeights.medium};
    margin-left: 3px;
    color: ${props => props.theme.colors.colorui01};
    text-decoration: none;
    background-color: transparent;

    &:hover {
        color: #0148ae;
        text-decoration: none;
    }
`;

export const OwnerName = styled.span`
    font-weight: ${props => props.theme.fontWeights.medium};
    margin-left: 3px;
    color: ${props => props.theme.colors.colorui01};
    background-color: transparent;
`;

export const ShowUnits = styled(TaskBody)``;

export const ShowMoreButton = styled.a`
    background-color: #fff;
    border-radius: 5px;
    margin-top: 10px;
    border-width: 0;
    width: 100%;
    justify-content: center;
    box-shadow: ${props => props.theme.shadows.base};
    font-size: ${props => props.theme.fontSizes.sm};
    font-weight: ${props => props.theme.fontWeights.medium};
    color: ${props => props.theme.colors.colortx03} !important;
    height: ${props => props.theme.templates.heightBase};

    :hover {
      color: ${props => props.theme.colors.colortx02} !important;
      cursor: pointer;
    }
`;

export const NewTaskButton = styled(PrimaryButton)`
    border-width: 0;
    flex-shrink: 0;
    padding-left: 18px;
    padding-right: 18px;
    font-weight: 500;
    letter-spacing: -0.2px;
    text-transform: capitalize;
    color: rgba(255,255,255,0.85);
    height: 38px;
    border-radius: 6px;

    i {
        font-size: 16px;
    }
`;

export const TaskActions = styled.div`
    color: red;
`;

export const TaskDot = styled.small`
    width: 8px;
    height: 8px;
    border-radius: 100%;
    margin-right: 5px;
    display: inline-block;
    background-color: ${props => props.theme.colors.warning};
`;
