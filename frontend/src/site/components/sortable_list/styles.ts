import styled from 'styled-components';
import { parseColor } from 'site/components/common/mixin';
import { ModalWindow as Modal, CustomSelect as Select } from '../common';

export const Gallery = styled.div`
  display: grid;
  gap: 20px;
  grid-gap:20px;
  grid-template-columns: repeat( auto-fit, minmax(250px, 1fr));
`;

export const GalleryItem = styled.figure`
  background-color: white;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 5px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const RemoveImage = styled.div`
  z-index: 1;
  padding: 5px;
  position: absolute;
  cursor: pointer;
  top: 0;
  right: 0;

  i {
    color: rgba(255,255,255,0.65);
    font-size: 20px;

    &:hover, &:focus {
      color: #fff;
    }
  }
`;

export const ItemImage = styled.div`
  height: 160px;
  border-radius: 5px;
  margin-bottom: 10px;
  overflow: hidden;
`;

export const GalleryItemOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: yellow;
  opacity: 0.6;
  pointer-events: none;
`;

export const GalleryItemNoIndent = styled(GalleryItem)`
  padding: 0;
  margin: 0;
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
  max-width: 100%;
  height: 160px;
  position: relative;
  padding: 0;

  &:focus, &:hover {
    ${ActionWrapper} { display: flex; }
  }
`;

export const PlayIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 3rem;
  color: #fff;
  transform: translate(-50%, -50%);
`;

export const VideoDescription = styled.div`
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 1rem;
  text-align: center;
  width: 100%;
`;

export const ModalWindow = styled(Modal)`
  .form-control {
    color: #4a5e8a;
  }

  .modal-title {
    font-size: 20px !important;
  }
`;

export const CustomSelect = styled(Select)`
  color: #4a5e8a;
`;
