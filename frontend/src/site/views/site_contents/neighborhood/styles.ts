import styled from 'styled-components';
import { ModalWindow as Modal } from 'site/components/common';

export const ModalWindow = styled(Modal)`
  max-width: 500px;

  .css-1hwfws3, .css-2b097c-container, .css-yk16xz-control {
    height: 42px !important;
  }
`;

export const RemoveImage = styled.div`
  z-index: 1;
  position: absolute;
  cursor: pointer;
  top: -7px;
  right: -3px;

  i {
    color: #d5dcf4;
    font-size: 20px;
  }
`;

export const ImageWrapper = styled.div`
  height: 130px;
  width: 130px;
  border-radius: 5px;
  margin-bottom: 10px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const LinkToWebstite = styled.a`
  border-radius: 3px;
  color: ${props => props.theme.colors.colortx03};
  line-height: 1;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  outline: none;
  margin: auto;

  &:hover {
    background-color: #f0f2f9;
    color: #4a5e8a;
    text-decoration: none;
  }

  i {
    font-size: 18px;
  }
`;

export const CategoryImage = styled.div`
  img {
    width: 24px;
    height: auto;
  }
`;

export const ButtonControls = styled.div`
  display: flex;
  justify-content: flex-end;
`;
