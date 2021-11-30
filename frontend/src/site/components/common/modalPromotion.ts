import styled from 'styled-components';
import { ModalUser } from './modalUser';

export const ModalPromotion = styled(ModalUser)`
  #wyswyg {
    border: 1px solid ${props => props.theme.colors.colorbg03};
    font-family: "IBM Plex Sans",sans-serif;
    font-size: .875rem;
    color: ${props => props.theme.colors.colortx02};
    height: calc(100% - 35px);
    border-radius: 4px;
  }

  .wyswyg-invalid {
    border-color: ${props => props.theme.colors.red} !important;
  }

  .toolbar-menu {
    border-width: 1px;
    border-bottom-width: 0;
    border-color: #d5dcf4;
    padding: 10px 10px 5px;
    display: flex;
    font-family: inherit;

    .wyswyg__button {
      background-color: ${props => props.theme.colors.colorbg01};
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 3px;
      float: none;
      margin-left: 2px;
      cursor: pointer;

      i {
        font-size: 16px;
      }

      &:first-child {
        margin-left: 0px;
      }

      &:hover, &:focus {
        color: #06c;
      }
    }
  }

  .editor {
    padding: 10px;
    min-height: 50px;
    font-size: .875rem;
    color: ${props => props.theme.colors.colortx02};
    span[contenteditable="false"]:first-child {
      opacity: 0.6 !important;
      font-style: italic;
    }
  }
  img {
    max-height: 176px;
    object-fit: cover;
  }

  .img-container {
    height: calc(100% - 35px);
  }

  .css-yk16xz-control, .css-1pahdxg-control {
    border-color: #d9def0 !important;
    outline: none !important;
    box-shadow: none !important;
  }

  .css-1hwfws3 {
    padding: 0 8px !important;
  }

  .css-b8ldur-Input, .css-1g6gooi {
    margin: 0 !important;
    padding: 0 !important;
    height: 23px;
  }

  .css-xb97g8 {
    font-size: 14px;
    font-weight: 400;
    display: inline-block;
    background-color: ${props => props.theme.colors.colorui01} !important;
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
    svg {
      opacity: .5;
      color: #fff !important;
      cursor: pointer;
      &:hover {
        color: #333 !important;
        background-color: ${props => props.theme.colors.colorui01} !important;
      }
    }
  }

  .css-12jo7m5 {
    color: #fff !important;
    background-color: ${props => props.theme.colors.colorui01} !important;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
`;
