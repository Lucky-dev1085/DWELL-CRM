import styled from 'styled-components';
import { Tooltip, Input } from 'reactstrap';
import { InnerTooltip, PrimaryButton, SimpleButton, WhiteButton } from 'styles/common';

// Common
export const ContentTitleSm = styled.h5`
  font-size: 20px;
  color: ${props => props.theme.colors.colortx01};
`;
export const ContentText = styled.p`
  color: ${props => props.theme.colors.colortx02};
`;

export const Divider = styled.hr`
  opacity: 0;
`;

export const FormGroupBar = styled.div`
    border-top: 1px solid ${props => props.theme.colors.colorbg01};
    padding: 10px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0;
    min-height: 50px;
`;

export const FormLabel = styled.label`
    margin-bottom: 0;
    color: ${props => props.theme.colors.colortx02};
    font-weight: 400;
`;

export const Tag = styled.span`
    margin-left: 4px;
    font-size: 8px;
    text-transform: uppercase;
    background-color: ${props => props.theme.colors.colorbg02};
    padding: 2px 3px;
    border-radius: 2px;
    line-height: 1.2;
    color: ${props => props.theme.colors.colortx03};
`;

export const SettingsFooter = styled.div`
    border-top: 1px solid ${props => props.theme.colors.gray200};
    display: flex;
    align-items: center;
    padding-top: 25px;
`;

export const SettingsPrimaryButton = styled(PrimaryButton)`
  height: 38px;
  border-radius: 5px;
`;

export const FormActions = styled.div`
  margin-left: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;

// Main
export const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  padding: 5px 0;
`;

export const ContentTitle = styled.h4`
  font-weight: 600;
  font-size: 24px;
  color: ${props => props.theme.colors.colortx01};
  margin-bottom: 0;
  letter-spacing: -0.5px;
`;

export const ContentBody = styled.div`
  display: flex;
`;

export const SettingsSidebar = styled.div`
  width: 210px;
  margin-right: 30px;
`;

export const ContentLabel = styled.label`
  display: block;
  font-size: 10px;
  font-weight: 500;
  color: ${props => props.theme.colors.colortx03};
  letter-spacing: .5px;
  line-height: 1;
  margin-bottom: 10px;
  text-transform: uppercase;
  font-family: ${props => props.theme.fonts.default};
  font-family: "IBM Plex Sans",sans-serif;
`;

export const MainDivider = styled(Divider)`
  margin-top: 15px;
  margin-bottom: 15px;
`;

export const SettingsNav = styled.ul`
  flex-direction: column;
  display: flex;
  flex-wrap: wrap;
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
`;

export const SettingsNavItem = styled.li`
  cursor: pointer;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  height: 38px;
  color: ${props => (props.active ? '#fff' : props.theme.colors.colortx02)};
  border-radius: 4px;
  background-color: ${props => (props.active ? props.theme.colors.blue : 'transparent')};

  &:hover, &:focus {
    background-color: ${props => (props.active ? props.theme.colors.blue : 'rgba(225,230,247,0.4)')};
    outline: none;
  }
`;

export const SettingsBody = styled.div`
  flex: 1;
  background-color: #fff;
  padding: 25px 30px 30px;
  border: 1px solid ${props => props.theme.colors.colorbg02};
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(36,55,130,0.06);
  position: relative;

  .op-0 {
    opacity: 0;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .mg-y-30 {
    margin-top: 30px;
    margin-bottom: 30px;
  }

`;

// Action
export const Icon = styled.img`
    background-color: #fff;
    height: 20px;
`;

export const FormAction = styled(SimpleButton)`
  background-color: transparent;
  padding: 0 5px;
  margin-top: -1px;
  &:focus {
    outline: none;
  }

  ${Icon} {
    filter: invert(96%) sepia(5%) saturate(1358%) hue-rotate(187deg) brightness(88%) contrast(92%);
  }

  &:hover {
        ${Icon} {
          filter: invert(20%) sepia(13%) saturate(2089%) hue-rotate(182deg) brightness(96%) contrast(98%);
        }
    }
`;

export const FormActionTooltip = styled(Tooltip)`
  .tooltip-inner {
    ${InnerTooltip}
    font-size: 13px;
    background-color: black;
    padding: 0.25rem 0.5rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  }
`;

export const CustomIcon = styled.i`
    font-size: 18px;
    color: ${props => props.theme.colors.colortx03};
    line-height: 1;
    height: 26px;
    width: 26px;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      background-color: ${props => props.theme.colors.colorbg01};
      color: ${props => props.theme.colors.colortx02};
      border-radius: 3px;
    }
`;

export const MenuIcon = styled.i`
    font-size: 20px;
    margin-right: 15px;
`;

export const CustomAddButton = styled(WhiteButton)`
    height: 38px;
    min-height: 38px;
    border-color: ${props => props.theme.input.borderColor};
    border-radius: 5px;
    color: ${props => props.theme.colors.colortx02};

    &:focus {
        outline: none;
    }

    &:hover {
      border-color: ${props => props.theme.colors.colorbg03};
      color: ${props => props.theme.colors.colortx02};
    }

    i {
      margin-right: 5px;
      font-size: 16px;
    }
`;

export const CustomFormInput = styled(Input)`
  height: 40px;
  border-radius: 4px;
  display: block;
  width: 100%;
  padding: .375rem .75rem;
  font-size: .875rem;
  font-weight: 400;
  line-height: 1.5;
  color: #233457;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #d5dcf4 !important;
  transition: border-color 0.15s ease-in-out,box-shadow 0.15s ease-in-out;

  &:focus {
    outline: none;
    box-shadow: inset 0 0 0 0.5px rgba(1,104,250,0.6);
    border-color: rgba(1,104,250,0.6) !important;
  }

  &.is-invalid {
    background-image: none !important;
    border: 1px solid #f86c6b !important;
    padding-right: .75rem !important;

    &:focus {
      box-shadow: none !important;
    }
  }
`;
