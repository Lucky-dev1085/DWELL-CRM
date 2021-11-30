import styled, { css } from 'styled-components';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Container, Modal } from 'reactstrap';

export const FlexCenter = css`
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const InnerTooltip = css`
    border-radius: 3px;
    font-weight: 300;
`;

export const SimpleButton = styled.button`
  min-height: ${props => props.theme.templates.heightxs};
  display: flex;
  align-items: center;
  padding: 0 15px;
  border-radius: 4px;
  cursor: pointer;

  font-weight: 400;
  color: ${props => props.theme.colors.bodyColor};
  text-align: center;
  vertical-align: middle;
  user-select: none;
  background-color: transparent;
  border: 1px solid transparent;
  font-size: ${props => props.theme.fontSizes.base};
  line-height: 1.5;
  transition: color 0.15s ease-in-out,background-color 0.15s ease-in-out,border-color 0.15s ease-in-out,box-shadow 0.15s ease-in-out;

  ${props => (props.disabled || props.$disabled) && css`
    opacity: 0.5;
    cursor: default;
  `}
`;

export const PrimaryButton = styled(SimpleButton)`
    color: #fff;
    background-color: ${props => props.theme.colors.colorui01};
    border-color: ${props => props.theme.colors.colorui01};

    ${props => !props.disabled && css`
        &:hover, &:focus {
            background-color: #1f76fa;
            border-color: #126ffa;
        }
    `}

    &:focus {
        box-shadow: 0 0 0 0.2rem rgba(96,158,252,0.5);
        outline: none;
    }
    ${props => props.disabled && css`
        opacity: 0.7, none !important;
        cursor: not-allowed !important;
    `}

    &:hover {
        color: #fff;
        background-color: #0158d4;
        border-color: #0153c7;
    }
`;

export const WhiteButton = styled(SimpleButton)`
  background-color: #fff;
  border-color: #d5dcf4;
  color: #4a5e8a;

  ${props => props.disabled && css`
        opacity: 0.5;
        cursor: default;
  `}

  &:hover, &:focus {
    border-color: #c1c8de;
    color: #4a5e8a;
    outline: none;
  }
`;

export const LightButton = styled(SimpleButton)`
  background-color: rgba(${props => props.theme.colors.gray200}, .6);
  border-color: ${props => props.theme.colors.gray400};
  color: ${props => props.theme.colors.gray600};

  &:hover, &:focus {
    color: ${props => props.theme.colors.gray600};
    background-color: #fff;
    border-color: rgba(${props => props.theme.colors.gray500}, .7);
  }
`;

export const SelectToggle = styled(DropdownToggle)`
    background-color: #fff;
    border-color: ${props => props.theme.input.borderColor};
    border-radius: 6px;
    height: 38px;
    outline: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: ${props => (props.isEmpty ? props.theme.colors.gray600 : props.theme.colors.gray700)};

    &:hover, &:active {
      background-color: #fff !important;
      border-color: ${props => props.theme.input.borderColor} !important;
      color: ${props => (props.isEmpty ? props.theme.colors.gray600 : props.theme.colors.gray700)} !important;
    }

    &:focus {
      box-shadow: none !important;
    }

    &:after {
        border-color: #888 transparent transparent transparent;
        border-style: solid;
        border-width: 5px 4px 0 4px;
        height: 0;
        margin-left: -4px;
        margin-top: -2px;
        position: absolute;
        top: 50%;
        right: 11px;
        width: 0;
    }
`;

export const SelectButton = styled(ButtonDropdown)`
    width: 300px;

    ${props => props.isOpen && css`
        ${SelectToggle} {
            background-color: #fff !important;
            border-color: ${props.theme.input.borderColor} !important;
            color: ${props.isEmpty ? props.theme.colors.gray600 : props.theme.colors.gray700} !important;
        }
    `}
`;

export const SelectMenu = styled(DropdownMenu)`
  width: 300px;
  border-color: ${props => props.theme.input.borderColor};
  padding: 4px;
  max-height: 146px;
  overflow-y: auto;
  border-radius: unset;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  top: -5px !important;
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
    background-color: ${props => props.theme.colors.blue} !important;
  }

  &:focus {
    outline: none;
  }

  ${props => props.selected && css`
        background-color: ${props.theme.colors.blue};
        color: white;
  `}

`;

export const SelectDropDownItem = styled(DropdownItem)`
    color: ${props => props.theme.colors.colortx02};
    padding: 7px 10px;
    border-radius: 3px;
    outline: none;
    transition: all 0.25s;
    border: 0;

    &:hover, &:focus {
        background-color: ${props => props.theme.colors.colorbg01} !important;
        color: ${props => props.theme.colors.colortx02} !important;
        outline: none;
    }
`;

export const SelectDropdownMenu = styled(DropdownMenu)`
    min-width: 160px;
    border-radius: 5px;
    border-width: 0;
    padding: 8px;
    margin-top: 5px;
    box-shadow: 2px 5px 45px rgba(36,55,130,0.12), 0 1px 2px rgba(225,230,247,0.07), 0 2px 4px rgba(225,230,247,0.07),
     0 4px 8px rgba(225,230,247,0.07), 0 8px 16px rgba(225,230,247,0.07), 0 16px 32px rgba(225,230,247,0.07),
      0 32px 64px rgba(225,230,247,0.07);
`;

export const Content = styled.div`
    min-height: calc(100vh - ${props => props.theme.templates.headerHeight});
`;

export const ContainerFluid = styled(Container)`
  padding: 25px 30px 50px;
  table {
    tr.scored {
      td {
        background: #f0f2f9;
      }
    }
  }

  ${props => props.scroll && `
    overflow: auto;
  `}
`;

export const ContentHeader = styled.div`
    margin-bottom: 30px;
    display: flex;
    align-items: center !important;
`;

export const ContentTitle = styled.div`
    font-size: 24px;
    font-weight: ${props => props.theme.fontWeights.semibold};
    color: ${props => props.theme.colors.colortx01};
    letter-spacing: -0.5px;
    margin-bottom: 0;

    span {
        font-weight: 400;
        color: ${props => props.theme.colors.colortx03};
    }
`;

export const ContentText = styled.span`
    color: ${props => props.theme.colors.colortx02};
`;

export const DropdownLink = styled(DropdownToggle)`
    display: flex;
    align-items: center;
    height: 42px;
    padding-left: 12px;
    padding-right: 28px;
    padding-bottom: 2px;
    border-radius: 5px;
    border: 1px solid #d9def0;
    background-color: #fff;
    color: #4a5e8a;
    position: relative;
    outline: none;
    transition: all 0.2s;
    cursor: pointer;

    i {
        margin-right: 5px;
        font-size: 16px;
        font-weight: 700;
        line-height: .8;
        color: #0168fa;
    }

    &:after {
        content: '\\EBA8';
        font-family: 'remixicon';
        font-size: 11px;
        position: absolute;
        top: 50%;
        right: 10px;
        transform: rotate(90deg);
        line-height: 0;
        opacity: .5;
    }

    &:hover {
        background-color: #fff;
        border-color: #c1c8de;
        box-shadow: 0 1px 1px rgba(225,230,247,0.25), 0 2px 2px rgba(225,230,247,0.2), 0 4px 4px rgba(225,230,247,0.15),
         0 8px 8px rgba(225,230,247,0.1), 0 16px 16px rgba(225,230,247,0.05);
    }
`;

export const Nav = styled.nav`
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
`;

export const DefaultDropdownMenu = css`
    border: none;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(152,164,193,0.07), 0 2px 4px rgba(152,164,193,0.07),
    0 4px 8px rgba(152,164,193,0.07), 0 8px 16px rgba(152,164,193,0.07),
    0 16px 32px rgba(152,164,193,0.07), 0 32px 64px rgba(152,164,193,0.07);
`;

export const DefaultDropdownItem = css`
    outline: none;
    padding: 8px 10px;
    color: ${props => props.theme.colors.colortx02};
    border-radius: 3px;
    border: none;
    width: 100%;
    text-align: start;
    background-color: white;
    font-weight: 400;
    &:hover {
        background-color: ${props => props.theme.colors.colorbg01};
        color: ${props => props.theme.colors.gray800};
    }
    &:focus {
        outline: none;
    }
    i {
        color: ${props => props.theme.colors.colortx02};
    }
`;

export const Badge = styled.span`
    display: inline-block;
    padding: .25em .4em;
    font-size: 75%;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: 6px;
    transition: color 0.15s ease-in-out,
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
`;

export const Divider = styled.hr`
  opacity: 0;
`;

export const Avatar = styled.div`
    width: 38px;
    height: 38px;
    background-color: #929eb9;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100%;
    position: relative;

    &:before {
        content: '';
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 6px;
        height: 6px;
        border-radius: 100%;
        background-color: #e1e6f7;
        box-shadow: 0 0 0 1.5px #fff;
    }

    img {
        width: 38px;
        height: 38px;
        border-radius: 100%;
    }

    ${props => props.hideOnlineIcon && css`
        &:before {
            display: none !important;
        }
    `}
`;

export const FormCheckBox = styled.div`
    position: relative;
    width: 16px;
    height: 16px;
    background-color: #fff;
    border: 1px solid #c1c8de;
    border-radius: 3px;
    overflow: hidden;
    cursor: pointer;

    &:before {
        content: '\\EB7A';
        font-family: 'remixicon';
        font-size: 12px;
        font-weight: 700;
        position: absolute;
        top: 1px;
        left: 1px;
        line-height: 1;
        color: #fff;
        opacity: 0;
        z-index: 1;
    }

    input {
        position: absolute;
        top: 0;
        left: -20px;
        opacity: 0;
        z-index: -1;
    }

    ${props => props.checked && css`
        background-color: #0168fa;
        border-color: transparent;

        &:before {
            opacity: 1;
        }
    `}
`;

export const EmptyContent = styled.div`
    width: 100%;
    height: calc(100vh - 250px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    i {
        font-size: 100px;
        line-height: 1;
        color: ${props => props.theme.colors.gray500};
        margin-bottom: 10px;
    }

    h5 {
        font-size: 20px;
        color: ${props => props.theme.colors.colortx01};
    }

    p {
        color: ${props => props.theme.colors.gray500};
    }

    button {
        height: ${props => props.theme.templates.heightlg};
        display: flex;
        align-items: center;

        span {
          font-size: 20px;
          font-family: ${props => props.theme.fonts.default};
          display: block;
          margin-right: 8px;

          i {
              font-size: 18px;
              vertical-align: middle;
              color: white;
          }
        }
    }
`;

export const StyledModal = styled(Modal)`
    max-width: 600px;

    .modal-content {
        border-width: 0;
        border-radius: 8px;
    }

    label {
        font-size: 13px;
        color: ${props => props.theme.colors.colortx02};
        margin-bottom: 6px;
    }

    input {
        margin-bottom: 0;
    }

    .flag-dropdown {
        &:h
        border-color:
    }

    .mg-t-20 {
        margin-top: 20px;
    }

    input, textarea, .dropdown-toggle {
        color: ${props => props.theme.colors.colortx01} !important;
    }

    .dropdown-item.selected {
        color: white;
    }

    .form-control:focus, .dropdown-toggle:focus, input:focus, .rw-state-focus > .rw-widget-container, .select__control--is-focused {
        border-color: #3085fe !important;
        box-shadow: none !important;
    }

    .rbt-highlight-text {
        background: transparent;
    }

    .dropdown-item:hover {
        .rbt-highlight-text {
            color: white;
        }
    }

    .select__value-container {
        > div:last-child {
          margin: 0;
          padding: 0;
        }
    }

    .phone-number-input, .DateInput_input {
       padding: 0.375rem 0.75rem;
    }

    .reminder-checkbox {
        label {
            margin-bottom: 0;
            line-height: 21px;
        }
    }

    .rw-widget-picker {
        border-color: #d5dcf4;

        .rw-widget-input {
            box-shadow: none;
        }

        .rw-select {
            border-color: #d5dcf4;

            &:hover {
                background-color: #fff;
            }

            .rw-btn {
                color: #0b2151;
            }
        }
    }

    .form-control.is-invalid {
        background-image: none;
    }
`;
