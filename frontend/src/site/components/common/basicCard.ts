import { Card } from 'reactstrap';
import styled from 'styled-components';
import * as variables from './styledVariables';
import * as mixin from './mixin';

export const CardBasic = styled(Card)`
border-color: ${variables.colorBg02};
border-radius: 6px;
${mixin.shadowDreamy(variables.colorBg02)};
margin-bottom: 20px;

.card-header {
  background-color: transparent;
  border-bottom-color: rgba(${mixin.parseColor(variables.colorBg02).toString()}, .6);
  padding: 18px 20px;
}

.card-text {
  margin-bottom: 0;
  color: ${variables.colorTx03};
  font-size: ${variables.fontSizeSm};
}

.card-body { padding: 25px 30px 30px; }
.card-body + .card-body { border-top: 1px solid ${variables.colorBg01}; }

.form-group {
  margin-bottom: 20px;
}

.form-info {
  display: block;
  line-height: .5;
  color: ${variables.colorTx03};
  font-size: 15px;
}

.form-control {
  border-radius: 5px;
  font-weight: 400;
  color: ${variables.colorTx01};
  height: auto;
  text-shadow: none;
  transition: all 0.25s;
  border: 1px solid #d5dcf4;

  &:focus {
    border-color: ${variables.colorBg03};
    ${mixin.shadowSharp(variables.colorBg02)};
  }

  &::placeholder { color: ${variables.colorTx03}; }
}

input.form-control { height: 42px; }
textarea.form-control {
  padding: 10px;
}

.label-wrapper-no-tooltip {
  margin-bottom: 5px !important;
  line-height: 18px !important;
}

.react-tagsinput {
  border: 1px solid #d5dcf4;
  border-radius: 3px;
}

.css-yk16xz-control {
  min-height: 43px !important;
  border-color: #d5dcf4 !important;
}

.css-1pahdxg-control, .css-1pahdxg-control:hover {
  min-height: 43px !important;
}

.label-checkbox {
  font-size: ${variables.fontSizeSm};
  font-family: ${variables.fontFamilyLabel};
  color: ${variables.colorTx02};
}
`;
