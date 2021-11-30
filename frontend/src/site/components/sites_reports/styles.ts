import styled, { css } from 'styled-components';

export const CardContainer = styled.div`
  padding: 5px;
  align-text: left;
  border: 1px solid transparent;
  :hover, :focus {
    border: 1px solid #d5dcf4;
    border-radius: 4px;
    cursor: pointer
  };
  ${props => props.active && css`
    border: 1px solid #d5dcf4;
    background-color: #f7f8fc;
    border-radius: 4px;
    cursor: pointer
  `}
`;

export const CardTitle = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: #4a5e8a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 7px;
`;

export const CardContent = styled.h2`
  font-size: 30px;
  font-weight: 400;
  letter-spacing: -.5px;
  color: #0b2151;
  margin-bottom: 3px;
`;

export const CardRateContainer = styled.p`
  font-size: 12px;
  color: #929eb9;
  display: flex !important;
`;

export const CardRateSucess = styled.span`
  display: flex;
  align-items: center;
  margin-right: 2px;
  color: #24ba7b !important;
`;

export const CardRateFail = styled.span`
  display: flex;
  align-items: center;
  margin-right: 2px;
  color: #f3505c !important;
`;

export const CardChartContainer = styled.div`
  padding: 5px;
  text-align: center;
  border: 1px solid transparent;
  :hover, :focus {
    border: 1px solid #d5dcf4;
    border-radius: 4px;
    cursor: pointer
  };
  ${props => props.active && css`
    border: 1px solid #d5dcf4;
    background-color: #f7f8fc;
    border-radius: 4px;
    cursor: pointer
  `}
`;

export const CardChartRateContainer = styled.p`
  font-size: 12px;
  color: #929eb9;
`;

export const CardChartRateSucess = styled.span`
  align-items: center;
  margin-right: 2px;
  color: #24ba7b !important;
`;

export const CardChartRateFail = styled.span`
  align-items: center;
  margin-right: 2px;
  color: #f3505c !important;
`;
