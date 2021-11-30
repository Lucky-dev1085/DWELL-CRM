import styled, { css } from 'styled-components';
import TagsInput from 'react-tagsinput';
import { Input, Button } from 'reactstrap';
import lighten from '@bit/styled-components.polished.color.lighten';
import darken from '@bit/styled-components.polished.color.darken';
import { Search } from 'react-feather';
import * as variables from './styledVariables';
import { shadowSharp, parseColor } from './mixin';

export const ContainerUploadImage = styled.div`
  display: block;
  height: 100%;
  border: 2px solid ${variables.colorBg02};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: ${variables.borderRadius};
  color: rgba(${parseColor(variables.colorTx03).toString()}, .6);
  cursor: pointer;
  font-size: 14px;
  padding: 5px;

  i {
    line-height: 1;
    font-size: 32px;
  }

  span {
    margin-top: 5px;
    font-size: ${variables.fontSizeXs};
  }

  &:hover, &:focus {
    color: ${variables.colorTx03};
  }
`;

export const FlexEnd = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const NavGroup = styled.div`
  background-color: ${variables.colorBg01};
  border-radius: ${variables.borderRadiusSm};
  align-self: stretch;
  align-items: stretch;
  display: flex;
  cursor: pointer;
  letter-spacing: -0.3px;
  height: ${variables.heightLg};

  .dropdown-menu {
      max-height: 255px;
  }
`;

export const NavLink = styled.div`
  padding: 0 15px;
  color: ${variables.colorTx02};
  font-weight: ${variables.fontWeightMedium};
  border-radius: inherit;
  border: 1.5px solid transparent;
  display: flex;
  align-items: center;
  outline: none;
  min-width: 120px;
  justify-content: center;
  margin-right: 2px;

  span { margin-bottom: 2px; }

  ${props => (props.active ? css`
    border-color: ${lighten('0.1', variables.colorUi01)};
    background-color: ${lighten('0.48', variables.colorUi01)};
    color: ${variables.colorUi02};
  ` : '')}
`;

export const TextSmall = styled.div`
  font-weight: 400;
  font-size: ${variables.fontSizeSm};
  font-family: ${variables.fontFamilyNumeric};
  color: ${variables.colorTx02};
  margin-left: 8px;
  opacity: .5;
`;

export const IconAction = styled.div`
  color: ${variables.colorTx03};
  font-size: 18px;
  cursor: pointer;
  border-radius: 3px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:focus, &:hover {
    ${props => !props.disabled && css`
      color: ${variables.colorTx02};
      background-color: ${variables.colorBg01};
    `}
  }

  & + & { margin-left: 2px; }

  .icon {
    margin: auto;
    width: 16px;
    height: 16px;
    background-size: cover;
  }

  ${props => props.disabled && css`opacity: 0.5;`}
`;

export const TagsInputCustom = styled(TagsInput)`
  border-radius: 3px;
  background-color: #fff;
  padding-left: 5px;
  padding-top: 5px;
  border: 1px solid rgb(213, 220, 244) !important;

  .react-tagsinput-tag {
    margin-right: 7px;
    background-color: #ddebff;
    color: ${variables.colorUi01};
    border-radius: 3px;
    border-color: ${variables.colorUi01};
    padding: 2px 3px 2px 8px;

    .react-tagsinput-remove {
      font-size: 15px;
      margin: 0px 5px 0px 2px
    }
  }
`;

export const ErrorMessage = styled.p`
  width: 100%;
  margin-top: 0.25rem;
  font-size: 80%;
  color: #f86c6b;
`;

export const Spinner = styled.span`
  margin-right: 5px;
  width: 14px;
  height: 14px;
  border: 0.2em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border .75s linear infinite;
`;

export const CustomSelect = styled.select`
  height: ${variables.heightLg};
  color: #4a5e8a;
  border: 1px solid #ccced9;
  border-radius: 4px;
  background-color: #fff;
  display: inline-block;
  width: 100%;
  padding: 0.375rem 1.75rem 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  vertical-align: middle;
  -webkit-appearance: none;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  background: #fff url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5' viewBox='0 0 4 5'%3e%3cpath fill='%2315274d' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e") no-repeat right 15px center/8px 10px;
  text-transform: capitalize;

  ${props => props.invalid && css`border: 1px solid #f86c6b !important;`}

  &:focus {
    border-color: #7cb2fe;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(1,104,250,0.25);
  }
`;

export const AnimationWrapper = styled.div`
  animation-name: fadeIn;
  animation-duration: 1s;
`;

export const NavbarItem = styled.div`
  height: ${variables.heightLg};
  padding: 0 15px;
  background-color: rgba(${parseColor(variables.colorBg02).toString()},0.6);
  display: flex;
  align-items: center;
  letter-spacing: -.2px;
  color: ${variables.colorTx02};
  border-radius: 5px;
  margin-right: 5px;

  ${props => (props.active ? css`
  letter-spacing: -.4px;
    font-weight: ${variables.fontWeightMedium};
    color: ${variables.colorTx01};
    background-color: #fff;
    ${shadowSharp(variables.colorBg02)};
  ` : css`
      &:focus, &:hover {
        cursor: pointer;
        background-color: ${darken('0.02', variables.colorBg02)};
      }
  `)}

  i {
    margin-top: 2px;
    margin-left: 15px;
    margin-right: -5px;
    font-size: 17px;
    color: rgba(${parseColor(variables.colorTx03).toString()}, .5);

    &:focus, &:hover {
      color: ${variables.colorTx03};
    }
  }
`;

export const FileInput = styled.input`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  opacity: 0.00001;
  pointer-events: none;
`;

export const MediaWrapper = styled.div`
  display: flex;
  align-items: flex-end;
`;

export const MediaBody = styled.div`
  padding-left: 15px;
  flex: 1;
`;

export const Avatar = styled.div`
  width: ${variables.heightMd};
  height: ${variables.heightMd};
  background-color: ${variables.colorBg01};
  color: ${variables.colorTx03};
  font-size: 24px;
  border-radius: ${variables.borderRadiusSm};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const PropertyName = styled.h6`
  color: ${variables.colorTx01};
  margin-bottom: 3px;
  line-height: 1;
  letter-spacing: -0.4px;
  font-weight: ${variables.fontWeightMedium};
`;

export const SearchIcon = styled(Search)`
  position: absolute;
  top: 10px;
  left: 11px;
  width: 20px;
  height: 20px;
  stroke-width: 2.5px;
  color: ${variables.colorTx02};
  margin-right: 5px;
`;

export const FormSearch = styled(Input)`
  display: flex;
  align-items: center;
  height: ${variables.heightLg};
  background-color: ${variables.colorBg01};
  border-radius: 5px;
  padding: 0 10px;
  min-width: 220px;
  padding-left: 38px;
  border-width: 1.5px;
  border-color: ${variables.colorBg01};
  width: 220px;
  font-weight: 500;
  letter-spacing: -0.2px;
  color: ${variables.gray700};
  margin-bottom: 0px;

  &:focus {
    background-color: #fff;
    border-color: ${variables.borderColor};
    box-shadow: none;
  }

  &::placeholder {
    color: ${variables.gray500};
    font-weight: 400;
  }
`;

export const NavSteps = styled.div`
  justify-content: center;
  display: flex;
  flex-wrap: wrap;
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
  cursor: default;

  span {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    background-color: ${variables.colorBg02};
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    color: ${variables.colorTx03};
    font-size: ${variables.fontSizeXs};
    font-weight: 400;
    font-family: ${variables.fontFamilyNumeric};
  }
`;

export const NavStepItem = styled.div`
  padding: 0;
  position: relative;
  color: ${variables.colorTx03};
  display: flex;
  align-items: center;

   & + & {
    margin-left: 40px;

    &::before {
      content: '\\EA6C';
      font-family: 'remixicon';
      position: absolute;
      top: 50%;
      left: -30px;
      line-height: 0;
      margin-top: 1px;
      color: ${variables.colorTx03};
    }
   }

  ${props => (props.done ? css`
    color: #24ba7b;

    span {
      background-color: #24ba7b;
      color: #fff;
    }
  ` : '')}

  ${props => (props.active ? css`
    color: ${variables.colorUi01};

    span {
      background-color: ${variables.colorUi01};
      color: #fff;
    }
    ` : '')}
`;

export const SearchBox = styled.div`
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border: 1px solid #dddddd;
  border-bottom: none;

  input {
    height: 45px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    flex: 1;
    outline: none;
    border: 0;
    font-size: 14px;
    background: transparent;
  }

  svg {
    width: 20px;
    height: 20px;
    stroke-width: 2.5px;
    color: #a0a6bd;
  }
`;

export const AvatarPreview = styled.div`
  width: 70px;
  margin-left: 15px;
  margin-right: 10px;

  img {
    height: auto;
    width: 100%;
  }
`;

export const Divider = styled.hr`
  border-color: ${props => props.theme.colors.gray200};
`;

export const RemoveImage = styled.div`
  z-index: 1;
  padding: 5px;
  position: absolute;
  cursor: pointer;
  top: 4px;
  right: 4px;
  background: #fff;
  border-radius: 5px;
  border: 1px solid ${props => props.theme.colors.colorbg02};
  display: flex;
  align-items: center;
  width: 32px;
  height: 32px;

  i {
    color: ${props => props.theme.colors.colortx02};
    font-size: 20px;

    &:hover, &:focus {
      color: rgba(${props => parseColor(props.theme.colors.colortx02).toString()}, .9);
    }
  }
`;

export const ButtonPrimary = styled(Button)`
  height: 38px;
  border-radius: 5px;
  display: flex;

  &:hover, &:focus {
    background-color: #0158d4 !important;
    border-color: #0153c7 !important;
  }
`;

export const ActionWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(${props => parseColor(props.theme.colors.gray900).toString()}, .5);
  display: none;
  pointer-events: none;
`;

export const ButtonAction = styled.div`
  width: ${props => props.theme.templates.heightxs};
  height: ${props => props.theme.templates.heightxs};
  padding: 0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  color: ${props => props.theme.colors.colortx02};
  font-size: 18px;
  transition: all 0.15s;
  margin-right: 5px;
  pointer-events: all;

  &:focus, &:hover {
    transform: scale(1.1);
  }
`;

export const GalleryWrapper = styled.div`
  flex-basis: 0;
  flex-grow: 1;
  width: 100%;
  height: 100%;
  position: relative;
  padding: 0;
  border-radius: 6px;
  object-fit: cover;

  &:focus, &:hover {
    ${ActionWrapper} { display: flex; }
  }
`;
