import Select from 'react-select';
import styled, { css } from 'styled-components';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Label } from 'reactstrap';
import CheckmarkIcon from 'images/checkmark.svg';

export const FormWrapper = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: auto;
    height: 520px;
    width: 380px;
    min-height: 400px;
    background: #FFFFFF;
    box-shadow: 0 7px 28px #00000029;
    border-radius: 6px;
    margin-top: 30px;
    padding: 22px 30px 30px;
    margin-left: auto;

    &:nth-last-child(2) {
        flex-grow: 1;
    }

    @media (max-width: 1199px) {
      width: 350px;
      height: 520px;
    }

    @media (max-width: 991px) {
      width: 380px;
      margin: 40px auto 15px;
      background-color: rgb(255,255,255);
    }

    @media (max-width: 767px) {
      width: 90%;
      margin: 10px auto 15px;
      background-color: rgb(255,255,255);
    }
`;

export const FormTitle = styled.span`
    margin-bottom: 3px;
    font-weight: 500;
    color: #0b2151;
    font-size: 24px;
    letter-spacing: -.5px;

    @media (max-width: 767px){
        font-size: 18px !important;
        letter-spacing: -.5px;
    }
`;

export const FormDescription = styled.span`
    color: #929eb9;
    font-size: 15px;
    white-space: nowrap;
    margin-bottom: 25px;
    line-height: 12px;

    ${props => props.isPersonal && css`
      color: #4a5e8a;
      @media (max-width: 767px){
        font-size: 13px;
      }
    `}
    ${props => props.error && css`
        color: red;
    `}
`;

export const CustomInput = styled.input`
    background-color: transparent;
    padding: 0;
    border-width: 0;
    border-radius: 0;
    visibility: hidden;
    opacity: 0;
    min-height: 0;
    height: auto;
    font-size: inherit;
    width: 100%;
    display: block;
    font-weight: 400;
    line-height: 1.5;
    color: #233457;
    background-clip: padding-box;
    transition: border-color 0.15s ease-in-out,box-shadow 0.15s ease-in-out;

    &:focus {
      color: #233457;
      border-color: #7cb2fe;
      outline: 0;
    }
     & ~ &  {
      &:focus {
          margin-top: 2px;
          left: 40px;
      }
    }
`;

export const CustomForm = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 8px;
    z-index: 1;
    flex-grow: 1;
`;

export const DemoBtn = styled.button`
    margin-top: auto;
    cursor: pointer;
    width: 100%;
    border-radius: 6px;
    background-color: #091534;
    color: #fff;
    border-color: transparent;
    height: 52px;
    text-transform: uppercase;
    font-size: 13px;
    letter-spacing: 1px;

    &:focus {
        outline: none;
    }
`;

export const ContactDataWrapper = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 15px;
`;

export const DateBtn = styled.button`
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;
    border: 1px solid #d5dcf4;
    background-color: #FFFFFF;
    opacity: 1;
    text-align: left;
    padding: 0 15px;
    font-size: 15px;
    color: #344563;
    position: relative;
    border-radius: 5px;
    height: 52px;

    margin-bottom: 12px;

    &:hover {
      cursor: pointer;
      border-color: #adbae9;
    }

    &:focus {
        outline: none;
    }

    ${props => props.selected && css`
        border-color: #5999f0;
        background-color: rgba(89,153,240,0.1);
  `}
`;
export const BackBtn = styled.button`
    width: 51px;
    height: 52px;
    align-items: center;
    justify-content: center;
    opacity: 1;
    color: #091534;
    font-size: 24px;
    display: inline-block;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    background-color: transparent;
    border: 1.5px solid #091534;
    padding: .375rem .75rem;
    line-height: 1.5;
    border-radius: 6px;
    transition: color 0.15s ease-in-out,background-color 0.15s ease-in-out,border-color 0.15s ease-in-out;
`;

export const ControlBtns = styled.div`
  display: flex;
  z-index: 1;
`;

export const ContinueBtn = styled.button`
    cursor: pointer;
    width: 260px;
    height: 52px;
    margin-left: 10px;
    background-color: #091534;
    color: #fff;
    border-color: transparent;
    text-transform: uppercase;
    font-size: 13px;
    letter-spacing: 1px;
    border-radius: 6px;

    &:focus {
        outline: none;
    }
`;

export const TimeBtn = styled.button`
      height: 50px;
      border: 1px solid #d5dcf4;
      padding: 0 15px;
      font-size: 15px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      position: relative;
      cursor: pointer;
      width: 100%;
      background-color: #FFFFFF;
      color: #344563;
    opacity: 1;
    text-align: left;
    justify-content: space-between;

    &:focus {
        outline: none;
    }

    @media (max-width: 767px) {
        padding: 0 10px;
    }

    ${props => props.selected && css`
        border-color: #5999f0;
        background-color: rgba(89,153,240,0.1);
  `}
`;
export const TimezoneToggle = styled(DropdownToggle)`
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    margin-top: 10px;
    width: 100%;
    height: 32px;
    font-size: 12px;
    font-weight: 500;
    background-color: #FFFFFF;
    border: 1px solid #14203033;
    border-radius: 4px;
    opacity: 1;

    &:hover {
        border-color: #142030D9;
        background-color: white !important;
    }
`;

export const SelectItem = styled(DropdownItem)`
  background-color: #fff;
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  margin-bottom: 1px;
  color: #344563;

  &:hover, &:focus {
    color: #fff !important;
    background-color: ${props => props.theme.colors.darkcyan} !important;
  }

  &:focus {
    outline: none;
  }

  ${props => props.selected && css`
        background-color: ${props.theme.colors.darkcyan};
        color: white;
  `}

`;

export const TimezoneDropdown = styled(Dropdown)`
    z-index: 2;
    ${p => p.isOpen && css`
        > .dropdown-toggle {
            color: #0b2151;
            background-color: #fff !important;
            border-color: ${p.disabled ? 'transparent' : '#d9def0'}  !important;
        }
    `}
`;

export const TimezoneDropdownMenu = styled(DropdownMenu)`
    width: 100%;
`;

export const ContactInfo = styled.span`
    display: flex;
    align-items: center;
    margin-top: 6px;
    font-size: 15px;
    color: #344563;
`;

export const ConfirmContactInfo = styled(ContactInfo)`
    line-height: 1;
    margin-top: 0;
`;

export const CancelContactInfo = styled(ContactInfo)`
    color: #4a5e8a;
`;

export const CustomStrong = styled.strong`
   color: #0b2151;
`;
export const Article = styled.span`
    display: flex;
    align-items: center;
    margin-top: 10px;
    font-weight: 600;
    font-size: 15px;
    color: #344563;
`;

export const ConfirmedArticle = styled(Article)`
    line-height: 1;
`;

export const Checkmark = styled.div`
    background-repeat: no-repeat;
    width: 16px;
    height: 16px;
    background-size: 16px;
    background-image: url(${CheckmarkIcon});
`;

export const CustomBtn = styled.button`
    display: flex;
    align-items: center;
    opacity: 1;
    background: #FFFFFF;
    text-align: left;
    padding: 1px 10px;
    margin-top: 0.7em;
    border: 1px solid #d5dcf4;
    height: 52px;
    justify-content: flex-start;
    font-weight: 400;
    color: #344563;
    vertical-align: middle;
    user-select: none;
    font-size: .875rem;
    line-height: 1.5;
    border-radius: 6px;
    transition: color 0.15s ease-in-out,background-color 0.15s ease-in-out,border-color 0.15s ease-in-out;
    &:focus {
        outline: none;
    }
`;

export const ActionBtn = styled.button`
    z-index: 1;
    text-transform: uppercase;
    margin-top: 10px;
    font-weight: 500;
    font-size: 13px;
    border-radius: 6px;
    letter-spacing: 1px;
    width: 100%;
    opacity: 1;
    border-color: #091534;
    border-width: 1.5px;
    color: #091534;
    background-color: transparent;
    height: 52px;

    &:focus {
        outline: none;
    }
`;

export const CancelButton = styled(ActionBtn)`
  font-weight: 400;
  background-color: #142030;
  color: white;
  border: 2px solid #142030;
`;

export const CloseBtn = styled.button`
    cursor: pointer;

    width: 100%;
    height: 32px;
    background-color: #FFFFFF;
    border-radius: 2px;
    font-size: 12px;
    font-weight: 700;
    color: #142030;
    border: 2px solid #142030;
    margin-top: 150px;

    &:focus {
        outline: none;
    }
`;

export const Content = styled.div`
  margin-top: 10px;
`;

export const EmailLink = styled.a`
  font-size: 14px;
  color: ${props => props.theme.colors.colorui01};
  font-weight: 600;

  &:hover {
    color: ${props => props.theme.colors.colorui01} !important;
  }
`;

export const TimezoneSelect = styled(Select)`
    .select__control {
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        margin-top: 10px;
        width: 100%;
        background-color: #FFFFFF;
        opacity: 1;
        height: 40px;
        border-radius: 5px;
        border-color: #d5dcf4;
        font-size: 15px;

        &:hover {
            background-color: white !important;
        }
    }

    .select__menu {
        z-index: 2;
        font-size: 12px;

        .select__menu-list {
            max-height: 200px;
        }

        .select__option--is-selected {
            background-color: ${props => props.theme.colors.darkcyan};
        }
    }

    .select__control--is-focused {
        border-color: ${props => props.theme.colors.darkcyan};
    }
`;

export const CustomLabel = styled(Label)`
      display: block;
      line-height: 1.2;
      margin-bottom: 0;
      top: 16px;
      left: 12px;
      color: #c0ccda;
      font-size: 15px;
      cursor: text;
`;

export const InputWrapper = styled.div`
    position: relative;
    cursor: text;
    margin-bottom: 10px;
    border: 1px solid #d5dcf4;
    border-radius: 5px;
    height: 52px;
    padding: 16px 12px;

    ${props => props.focused && css`
        padding: 6px 12px;
        border-color: #5798f0;
        ${CustomLabel} {
            font-size: 12px;
            color: #5798f0;
            top: 8px;
            letter-spacing: .2px;
         }
         ${CustomInput} {
            visibility: visible;
            opacity: 1;
          }
    `}

    ${props => props.filled && css`
    padding: 6px 12px;
    border-color: #929eb9;

      ${CustomLabel} {
        font-size: 12px;
        color: #929eb9;
        top: 8px;
        letter-spacing: .2px;
      }
      ${CustomInput} {
        visibility: visible;
        opacity: 1;
      }
    `}

    ${props => props.isError && css`
          border-color: red;
          ${CustomLabel} {
              color: red;
          }
    `}
`;

export const IconWrapper = styled.i`
      line-height: 1;
      font-size: 20px;
      color: #929eb9;
      font-weight: 400;
      margin-right: 10px;
`;

export const IconCalendarWrapper = styled(IconWrapper)`
     color: #344563;
     margin-right: 20px;
`;
