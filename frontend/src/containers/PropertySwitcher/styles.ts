import { CustomInput, UncontrolledTooltip } from 'reactstrap';
import styled from 'styled-components';
import { FlexCenter } from 'styles/common';
import { parseColor } from 'site/components/common/mixin';
import PerfectScrollbar from 'react-perfect-scrollbar';

export const PropertyItemLogo = styled.div`
  position: relative;
  width: ${props => props.theme.templates.heightmd};
  height: ${props => props.theme.templates.heightmd};
  background-color: rgb(240, 242, 249);
  color: ${props => props.theme.colors.colortx02};
  margin-right: ${props => (props.isCallScorer ? '10px' : '15px')};
  flex-shrink: 0;
  border-radius: 5px;
  border: 1.5px solid ${props => props.theme.colors.colorbg03};
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
  font-size: 20px;
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
    width: calc(${props => props.theme.templates.sidebarWidth} - 75px);
  }

  p {
    margin-bottom: 0;
    font-size: ${props => props.theme.fontSizes.xs};
    color: ${props => props.theme.colors.colortx03};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: calc(${props => props.theme.templates.sidebarWidth} - 75px);
  }
`;

export const PropertyItemLink = styled.a`
  font-size: 16px;
  color: ${props => props.theme.colors.colortx03};
  opacity: .75;
  outline: none;
  transition: all 0.25s;
  line-height: 1;

  &:focus, &:hover {
    text-decoration: none;
    opacity: 1;
    color: ${props => props.theme.colors.colortx02};
  }
`;

export const PropertyItem = styled.div`
  padding: 12px 20px;
  display: flex;
  align-items: center;
  position: relative;

  &:first-child::before {
    content: '';
    position: absolute;
    top: 0;
    left: 20px;
    right: 20px;
    border-top: 1px solid ${props => props.theme.colors.colorbg01};
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20px;
    right: 20px;
    border-bottom: 1px solid ${props => props.theme.colors.colorbg01};
  }

  &:focus, &:hover {
    cursor: pointer;
    background-color: ${props => props.theme.colors.gray100};
    position: relative;
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
  width: 340px;
  min-height: 200px;
  background-color: #fff;
  z-index: 1300;
  visibility: ${props => (props.show ? 'visible' : 'hidden')};
  -webkit-transform: ${props => (props.show ? 'translate3d(0%, 0, 0)' : 'translate3d(-100%, 0, 0)')};
  transform: ${props => (props.show ? 'translate3d(0, 0, 0)' : 'translate3d(-100%, 0, 0)')};
  transition: all 0.25s;
  overflow: hidden;
`;

export const PropertyMenuGroup = styled.div`
  position: absolute;
  top: 0;
  left: ${props => props.step * 340}px;
  width: 340px;
  height: 100%;
  transition: all 0.25s;
`;

export const PropertyMenuHeader = styled.div`
  padding: 18px 20px;
  display: flex;
  align-items: center;
`;

export const MenuBack = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.theme.colors.colorui01};
  cursor: pointer;

  &:hover {
    color: #0148ae;
  }

  i {
    margin-right: 5px;
  }
`;

export const CancelButton = styled.span`
  color: ${props => props.theme.colors.colorui01};
  cursor: pointer;

  &:hover {
    color: #0148ae;
  }
`;

export const PropertyActiveBody = styled.div`
  flex: 1;
`;

export const PropertyCustomer = styled.div`
  margin-bottom: 2px;
  font-size: 13px;
  position: relative;
`;

export const CustomerName = styled.span`
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.colorui01};
`;

export const CustomerSwitch = styled.span`
  color: ${props => props.theme.colors.colortx03};
  font-size: ${props => props.theme.fontSizes.sm};
  cursor: pointer;
  font-weight: ${props => props.theme.fontWeights.semibold};

  &:hover {
    color: ${props => props.theme.colors.colortx02};
  }

  &:before {
    content: '';
    width: 3px;
    height: 3px;
    border-radius: 100%;
    background-color: ${props => props.theme.colors.colortx03};
    display: inline-block;
    position: relative;
    top: -2px;
    margin-left: 5px;
    margin-right: 5px;
  }
`;

export const PropertyActiveName = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;

  span {
    font-size: 20px;
    font-weight: ${props => props.theme.fontWeights.semibold};
    color: ${props => props.theme.colors.colortx01};
    line-height: 1.2;
  }
`;

export const PropertyTown = styled.small`
  display: block;
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.colortx03};
  line-height: 1;
`;

export const PropertySwitchLabel = styled.label`
  display: block;
  line-height: 1;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 600;
  color: #4a5e8a;
  letter-spacing: .5px;
  margin-bottom: 0;
  padding: 18px 10px 12px 20px;
`;

export const PropertyLinkTooltip = styled(UncontrolledTooltip)`
  transition: none;

  .tooltip {
    font-family: "IBM Plex Sans",sans-serif;
  }
`;

export const PropertyMenuSearch = styled.div`
  padding: 0 19px;
  margin-top: -1px;
  margin-bottom: 11px;

  .form-control {
    flex: 1;
    padding: 0 13px 2px 36px;
    height: ${props => props.theme.templates.heightlg};
    border: 1px solid transparent;
    border-radius: ${props => props.theme.borders.radius};
    margin-bottom: 2px;
    text-shadow: none;
    background-color: ${props => props.theme.colors.colorbg01};
    transition: all 0.15s;
    font-weight: 500;
    color: ${props => props.theme.colors.gray700};

    &:focus {
      background-color: #fff;
      border-color: ${props => props.theme.colors.colorbd02};
      box-shadow: 0 1px 1px rgba(240,242,249,0.08),
                  0 2px 2px rgba(240,242,249,0.12),
                  0 4px 4px rgba(240,242,249,0.16),
                  0 8px 8px rgba(240,242,249,0.2);

      svg { color: ${props => props.theme.colors.colortx02}; }
    }

    &::placeholder {
      color: ${props => props.theme.colors.colortx03};
      font-weight: 400;
    }
  }

  svg {
    position: absolute;
    left: 12px;
    top: 11px;
    width: 18px;
    height: 18px;
    stroke-width: 2.5px;
    color: ${props => props.theme.colors.colortx03};
    transition: all 0.15s;
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
    height: calc(100vh - 190px);
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
