import styled from 'styled-components';
import darken from '@bit/styled-components.polished.color.darken';
import * as variables from './styledVariables';
import { shadowDreamy } from './mixin';

export const CardTitle = styled.h6`
  font-size: 15px;
  font-weight: ${variables.fontWeightSemibold};
  color: ${variables.colorTx01};
  margin-bottom: 0;
`;

export const CardText = styled.p`
  margin-bottom: 0;
  color: ${variables.colorTx03};
  font-size: ${variables.fontSizeSm};
`;

export const FormDescription = styled.div`
  color: ${variables.colorTx03};
  font-size: 11px;
  font-weight: 400;
  margin-top: 0.25rem;
`;

export const FormLabel = styled.label`
  display: block;
  letter-spacing: .2px;
  font-size: ${variables.fontSizeSm};
  font-family: ${variables.fontFamilyLabel};
  color: ${variables.colorTx02};
  line-height: 1;
  margin-bottom: 10px;
  font-weight: 400;
`;

export const LabelWrapper = styled.div`
  display:  flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 10px;

  label {
    display: block;
    letter-spacing: .2px;
    font-size: ${variables.fontSizeSm};
    font-family: ${variables.fontFamilyLabel};
    color: ${variables.colorTx02};
    line-height: 1;
    font-weight: 400;
    margin-bottom: 0;
  }
`;

export const ImagePreview = styled.div`
  img {
    border-radius: 6px;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const ActionCardIcon = styled.div`
  height: auto;
  padding: 0;
  width: ${variables.heightXs};
  height: ${variables.heightXs};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${darken('0.05', variables.colorBg02)};
  border-radius: 5px;
  color: ${variables.colorTx02};
  cursor: pointer;

  &:focus, &:hover {
    ${shadowDreamy(variables.colorTx03)}
    background-color: transparent;
  }

  i {
    font-size: 16px;
    line-height: .7;
    margin-right: 5px;
  }
`;

export const ActionCardText = styled(ActionCardIcon)`
  width: auto;
  height: ${variables.heightSm};
  padding: 0 10px;

  span {
    margin-left: 5px;
    font-size: ${variables.fontSizeSm};
  }
`;
