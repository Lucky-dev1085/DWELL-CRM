import styled from 'styled-components';

export const SectionDivider = styled.hr`
  margin: 30px 0;
  border-color: #eaedf5;
`;

export const SelectWrapper = styled.div`
  .css-yk16xz-control, .css-1pahdxg-control {
    border-color: #d5dcf4 !important;
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

export const ErrorMessage = styled.p`
  width: 100%;
  margin-top: 0.25rem;
  font-size: 80%;
  color: #f86c6b;
`;
