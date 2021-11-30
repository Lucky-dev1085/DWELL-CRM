import styled from 'styled-components';
import * as variables from './styledVariables';
import { parseColor } from './mixin';

export const ContentHeader = styled.div`
display: flex;
align-items: center;
min-height: ${variables.heightMd};
justify-content: space-between;
padding: 10px;
background-color: #fff;
border-radius: ${variables.borderRadius};
box-shadow: 0 1px 2px rgba(${parseColor(variables.colorBg03).toString()}, .2);

.btn {
  flex-shrink: 0;
  height: ${variables.heightLg};
  display: flex;
  align-items: center;
  border-radius: 5px;
}

.search-logo {
  position: absolute;
  top: 8px;
  left: 10px;
  width: 22px;
  height: 22px;
  stroke-width: 2.5px;
  color: ${variables.colorTx02};
}

.btn-primary {
  border-width: 0;
  flex-shrink: 0;
  padding-left: 18px;
  padding-right: 18px;
  font-weight: ${variables.fontWeightMedium};
  letter-spacing: -0.2px;
  text-transform: capitalize;
  color: rgba(255,255,255,0.85);

  &:hover, &:focus {
    color: #fff;
    background-color: #0158d4;
    border-color: #0153c7;
  }

  i {
    font-size: 16px;
    line-height: .8;
    margin-right: 7px;
    text-indent: -3px;
  }
}
`;
