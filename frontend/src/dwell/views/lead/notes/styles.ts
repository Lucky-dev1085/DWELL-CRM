import styled from 'styled-components';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { PrimaryButton, WhiteButton } from 'styles/common';

export const ContentBodyNotes = styled.div`
    background-color: #FFFFFF;
    display: block;
    position: fixed;
    top: 234px;
    left: 400px;
    right: 25px;
    bottom: 28px;
    z-index: 10;
`;

export const ContentNodeSidebar = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 320px;
    border-right: 1px solid #e1e6f7;
`;

export const ContentNoteBody = styled.div`
  padding: ${props => (props.isNote ? '18px 25px' : 0)};
  top: 0;
  right: 0;
  bottom: 0;
  left: 320px;
  overflow-y: auto;
  position: absolute;

  .cke_contents {
     height: calc(100vh - 430px) !important;
  }
`;

export const NoteSidebarHeader = styled.div`
    height: 64px;
    padding: 0 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e1e6f7;
`;

export const NoteSidebarHeaderLabel = styled.label`
    color: #0b2151;
    font-weight: 600;
    font-size: 15px;
    margin-bottom: 0;
    display: flex;
    align-items: center;
`;

export const NoteSidebarHeaderSpan = styled.span`
    margin-left: 8px;
    padding: 0 5px;
    font-weight: 400;
    font-size: 11px;
    color: ${props => props.theme.colors.colortx03};
    min-width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background-color: ${props => props.theme.colors.colorbg01};
`;

export const NoteSidebarHeaderAddButton = styled(PrimaryButton)`
    padding: 8px;
`;

export const NoteSidebarHeaderAddButtonSpan = styled.span``;

export const NavNotes = styled(PerfectScrollbar)`
    height: calc(100% - 64px);
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

export const TimeWrapper = styled.div`
  span:nth-child(2) {
    display: none;
  }
`;

export const NavNotesLink = styled.a`
  display: flex;
  padding: 15px;
  padding-right: 13px;
  outline: none;
  border-right: 1.5px solid transparent;
  border-bottom: 1px solid ${props => props.theme.colors.colorbg01};
  transition: all 0.2s;
  cursor: pointer;

  :hover{
    background-color: ${props => props.theme.colors.colorbg01};

    ${TimeWrapper} {
      span:nth-child(1) {
        display: none;
      }

      span:nth-child(2) {
        display: block;
      }
    }
  }

  &.active {
    border-right-color: ${props => props.theme.colors.colorui01};
    background-color: #fff;

    .note-icon {
      color: ${props => props.theme.colors.colorui01};
      svg {
        fill: ${props => props.theme.colors.colorui01};
        fill-opacity: 0.1;
      }
    }
    h6 {
        color: ${props => props.theme.colors.colorui01};
    }
  }
`;

export const NoteBody = styled.div`
  h6 {
    color: ${props => props.theme.colors.colortx01};
    font-weight: ${props => props.theme.fontWeights.medium};
    font-size: ${props => props.theme.fontSizes.sm};
    margin-bottom: 3px;
  }

  span {
    display: block;
    font-size: ${props => props.theme.fontSizes.xs};
    color: ${props => props.theme.colors.colortx03};
  }
`;

export const NoteIcon = styled.div`
  margin-right: 8px;
  line-height: 1;
  color: $color-tx-02;

  i {
    font-size: 28px;
    line-height: 0;
  }

  svg {
    width: 36px;
    height: 36px;
    stroke-width: 1px;
    margin-left: -5px;
    fill: rgba(#fff, .2);
  }
`;

export const ContentNoteFooter = styled.div`
  display: flex;
  align-items: center;
  padding: 25px 0 0;

  span {
    margin-left: 15px;
    font-size: ${props => props.theme.fontSizes.xs};
    color: #929eb9;
  }

  .btn {
    height: $height-base;
    + .btn { margin-left: 8px; }

    &.btn-white { border-color: ${props => props.theme.colors.colorbg03}; }
  }
`;

export const SaveBtn = styled(PrimaryButton)`
    height: ${props => props.theme.templates.heightmd};
    margin-right: 8px;

    :hover {
      background-color: #0153c7;
      border-color: #0153c7;
      box-shadow: 0 1px 1px rgba(225,230,247,0.11), 0 2px 2px rgba(225,230,247,0.11), 0 4px 4px rgba(225,230,247,0.11), 0 6px 8px rgba(225,230,247,0.11), 0 8px 16px rgba(225,230,247,0.11);
    }
`;

export const RemoveBtn = styled(WhiteButton)`
    height: ${props => props.theme.templates.heightmd};

    background-color: #fff;
    border-color: rgba(193,200,222,0.75);
    color: #4a5e8a;

    &:hover, &:focus {
        border-color: rgba(193,200,222,0.75);;
        color: #4a5e8a;
        outline: none;
    }
`;

export const NotePane = styled.div`
  position: relative;
  padding: 20px 25px;
  & + & {
    border-top: 1px solid #e1e6f7;
  }
`;

export const TextMuted = styled.p`
  color: ${props => props.theme.colors.gray};
`;

export const NoteList = styled.div`
  overflow: auto;
  height: 100%;
`;

export const FollowupCheck = styled.div`
    display: flex;
    align-items: center;
    margin-right: 8px;

    span {
        margin-left: 5px;
    }
`;
