import { CustomInput } from 'reactstrap';
import styled from 'styled-components';
import lighten from '@bit/styled-components.polished.color.lighten';
import { FlexCenter } from 'styles/common';
import { shadowSharp, parseColor } from 'site/components/common/mixin';
import PerfectScrollbar from 'react-perfect-scrollbar';

export const PropertyItemLogo = styled.div`
  position: relative;
  width: ${props => props.theme.templates.heightmd};
  height: ${props => props.theme.templates.heightmd};
  background-color: ${props => props.theme.colors.colorbg01};
  color: ${props => props.theme.colors.colortx02};
  margin-right: ${props => (props.isCallScorer ? '10px' : '15px')};
  flex-shrink: 0;
  border-radius: 5px;
  ${FlexCenter}
  .badge {
    position: absolute;
    top: -2px;
    right: -7px;
    width: 15px;
    height: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border-radius: 100%;
    flex-shrink: 0;
    font-size: 10px;
    font-weight: 400;
    font-family: ${props => props.theme.fonts.secondary};
    background-color: ${props => props.theme.colors.red};
    padding-bottom: 1px;
    box-shadow: 0 0 0 1px #fff;
  }
  .badge {
    top: -5px;
    font-size: 9px;
    width: 18px;
    height: 18px;
    padding: 0px 0px 0px;
    font-weight: 600;
  }
`;

export const PropertyItemLogoImg = styled.img`
  width: 24px;
`;

export const PropertyDefaultLogoIcon = styled.i`
  font-size: 25px;
`;

export const PropertyItemBody = styled.div`
  flex: 1;
  h6 {
    margin-bottom: 2px;
    font-weight: 500;
    color: ${props => props.theme.colors.colortx01};
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: calc(${props => props.theme.templates.sidebarWidth} - 95px);
  }
  p {
    margin-bottom: 0;
    font-size: ${props => props.theme.fontSizes.xs};
    color: ${props => props.theme.colors.colortx03};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: calc(${props => props.theme.templates.sidebarWidth} - 95px);
  }
`;

export const PropertyItemLink = styled.a`
  font-size: 16px;
  color: ${props => props.theme.colors.colortx03};
  opacity: .75;
  outline: none;
  transition: all 0.25s;
  &:focus, &:hover {
    text-decoration: none;
    opacity: 1;
    color: ${props => props.theme.colors.colortx02};
  }
`;

export const PropertyItem = styled.div`
  padding: 12px 35px;
  display: flex;
  align-items: center;
  position: relative;
  background-color: ${props => (props.disabledProperty ? props.theme.colors.colorbg01 : 'unset')};

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 25px;
    right: 25px;
    border-bottom: 1px solid rgba(${props => parseColor(props.theme.colors.colorbg02).toString()}, .6);
  }
  &:focus, &:hover {
    cursor: pointer;
    background-color: ${props => props.theme.colors.gray100};
    position: relative;
  }
  &.active {
    margin-bottom: 15px;
    background-color: #fff;
    border: 1px solid ${props => props.theme.colors.colorui01};
    border-radius: 5px;
    position: relative;
    overflow: hidden;
    margin-left: 25px;
    margin-right: 25px;
    padding-left: 10px;
    padding-right: 10px;
    &::before {
      content: '';
      position: absolute;
      top: -18px;
      right: -18px;
      background-color: ${props => lighten('0.05', props.theme.colors.colorui01)};
      color: #fff;
      width: 36px;
      height: 36px;
      transform: rotate(45deg);
    }
    .property-item-logo {
      position: static;
      background-color: #92BEFF;
      color: #fff;
      &:after {
        content: '\\EB7B';
        font-family: 'remixicon';
        position: absolute;
        top: 4px;
        right: 1px;
        color: #fff;
        font-size: 12px;
        line-height: .5;
      }
    }
  }
`;

export const Checkbox = styled(CustomInput)`
    input:checked ~ label::before {
      background-color: ${props => props.theme.colors.colorui01} !important;
      border-color: ${props => props.theme.colors.colorui01} !important;
    }
    label {
        margin: 0 !important;
    }
`;

export const PropertyMenu = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  width: 320px;
  min-height: 200px;
  background-color: #fff;
  z-index: 1300;
  visibility: ${props => (props.show ? 'visible' : 'hidden')};
  -webkit-transform: ${props => (props.show ? 'translate3d(0%, 0, 0)' : 'translate3d(-100%, 0, 0)')};
  transform: ${props => (props.show ? 'translate3d(0, 0, 0)' : 'translate3d(-100%, 0, 0)')};
  transition: all 0.25s;
`;

export const PropertyMenuHeader = styled.div`
  padding-top: 22px;
  padding-left: 25px;
  padding-right: 25px;
  padding-bottom: 15px;
  h5 {
    font-size: 18px;
    font-weight: ${props => props.theme.fontWeights.semibold};
    color: ${props => props.theme.colors.colortx01};
    margin-bottom: 8px;
  }
  span {
    display: block;
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.colortx02};
  }
`;

export const PropertyMenuSearch = styled.div`
  padding: 4px 24px 0;
  .form-control {
    flex: 1;
    padding: 0 35px 2px 13px;
    height: ${props => props.theme.templates.heightlg};
    border: 1px solid transparent;
    border-radius: ${props => props.theme.borders.radius};
    margin-bottom: 2px;
    text-shadow: none;
    background-color: ${props => props.theme.colors.colorbg01};
    transition: all 0.15s;
    &:focus {
      background-color: #fff;
      border-color: ${props => props.theme.colors.colorbg03};
      ${props => shadowSharp(props.theme.colors.colorbg02)}
      svg { color: ${props => props.theme.colors.colortx02}; }
    }
    &::placeholder { color: ${props => props.theme.colors.colortx03}; }
  }
  svg {
    position: absolute;
    right: 12px;
    top: 10px;
    width: 20px;
    height: 20px;
    stroke-width: 2.5px;
    color: ${props => props.theme.colors.colortx03};
    transition: all 0.15s;
  }
`;

export const PropertyMenuBody = styled.div`
  padding: 22px 0;
  label {
    display: block;
    line-height: 1;
    text-transform: uppercase;
    font-size: 10px;
    font-weight: 400;
    font-family: ${props => props.theme.fonts.secondary};
    color: ${props => props.theme.colors.colortx03};
    letter-spacing: 1px;
    margin-bottom: 0;
    margin-left: 25px;
    margin-right: 25px;
    padding-bottom: 12px;
    border-bottom: 1px solid ${props => props.theme.colors.colorbg02};
  }
`;

export const BackDrop = styled.div`
  position: fixed;
  z-index: 1200;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(${props => parseColor(props.theme.colors.gray700).toString()}, .35);
  visibility: ${props => (props.show ? 'visible' : 'hidden')};
  opacity: ${props => (props.show ? '1' : '0')};
  transition: all 0.25s;
`;

export const PropertiesList = styled(PerfectScrollbar)`
    height: calc(100vh - 280px);
    position: relative;
    > .ps__rail-y {
        width: 2px;
        background-color: ${props => props.theme.colors.gray100};
        z-index: 10;
        position: absolute;
        left: auto !important;
        right: 0;
        opacity: 0;
        margin: 1px;
        transition: opacity .2s;
        > .ps__thumb-y {
            position: absolute;
            width: 2px;
            left: 0;
            background-color: ${props => props.theme.colors.gray500};
            border-radius: 0;
        }
  }
  &.ps--active-y {
    &:hover, &:focus {
        > .ps__rail-y { opacity: 1; }
    }
  }
`;

export const ProspectItems = styled.div`
    height: 100%;
`;
