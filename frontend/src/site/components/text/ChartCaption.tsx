import React, { FC } from 'react';
import styled from 'styled-components';

const CaptionText = styled.p`
  margin-left: 22px;
  color: ${props => props.color}
`;

interface ChartCaptionProps {
  color?: string,
  content?: string,
}

const ChartCaption: FC<ChartCaptionProps> = ({ color, content }) => (
  <CaptionText color={color}>{content}</CaptionText>
);

ChartCaption.defaultProps = {
  color: '#000000',
};

export default ChartCaption;
