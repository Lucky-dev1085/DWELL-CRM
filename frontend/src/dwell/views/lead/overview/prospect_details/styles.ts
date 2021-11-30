import styled from 'styled-components';
import { StyledModal } from 'styles/common';
import { CardWidgetPrimaryButton } from 'dwell/views/lead/overview/styles';

export const RoommateDetail = styled.small`
  display: block;
  font-size: 12px;
  color: ${props => props.theme.colors.colortx03};
`;

export const Modal = styled(StyledModal)`
  max-width: 780px;

  .modal-header {
    padding: 20px 25px;

    .modal-title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .modal-body {
    padding: 10px 25px 25px;
  }

  .modal-footer {
    padding: 15px 25px 25px;
  }

  .row {
    margin-left: -10px;
    margin-right: -10px;
    margin-top: 0 !important;
  }

  .col {
    padding-left: 10px;
    padding-right: 10px;
  }

  .btn-white {
    &:hover, &:focus {
      border-color: ${props => props.theme.colors.gray400};
    }
  }
`;

export const RoommateItem = styled.div`
  & + & {
    margin-top: 25px;
  }
`;

export const SectionTitle = styled.h6`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: ${props => props.theme.fonts.default};
  font-size: 12px;
  font-weight: 400;
  color: ${props => props.theme.colors.colortx03};
  text-transform: uppercase;
  position: relative;
  letter-spacing: .5px;
  margin-bottom: 15px;

  span {
    background-color: #fff;
    padding-right: 10px;
    position: relative;
    z-index: 5;
    padding-right: 5px;
  }

  &::before {
    content: '';
    position: absolute;
    bottom: 50%;
    left: 0;
    right: 0;
    border-bottom: 1px solid ${props => props.theme.colors.colorbd02};
  }
`;

export const RemoveItem = styled.span`
  cursor: pointer;
  display: flex;
  align-items: center;
  letter-spacing: normal;
  text-transform: capitalize;
  color: ${props => props.theme.colors.colortx03};
  padding-left: 5px;
  padding-right: 0 !important;

  &:hover { color: ${props => props.theme.colors.colorui01}; }

  i {
    font-size: 14px;
    line-height: 1;
    margin-right: 2px;
  }
`;

export const PrimaryButton = styled(CardWidgetPrimaryButton)`
  height: 40px;
  padding: 0 15px;
  width: fit-content;
  white-space: nowrap;
`;

export const RoommateName = styled.a`
    cursor: pointer;
    color: #0168fa !important;

    &:hover {
        color: #0148ae !important;
        text-decoration: none !important;
    }
`;
