import styled from 'styled-components';
import { Modal } from 'reactstrap';
import { hexToRgb } from 'dwell/constants';
import { shadowSharp } from 'src/styles/mixins';

export const ModalWindow = styled(Modal)`
  max-width: 1140px;

  .modal-content {
    flex-direction: row;
    background-color: ${props => props.theme.colors.bodyBg};
  }
`;

export const ModalSidebar = styled.div`
  max-height: 580px;
  width: 260px;
  background-color: #fff;
  padding: 25px 15px;
  border-right: 1px solid rgba(${props => hexToRgb(props.theme.colors.colorbg02)}, .6);
  border-top-left-radius: inherit;
  border-bottom-left-radius: inherit;
  overflow-y: auto;
`;

export const SidebarLabel = styled.label`
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: ${props => props.theme.colors.colortx03};
  padding-left: 10px;
  margin-bottom: 8px;
  line-height: 1;
  font-weight: 400;
`;

export const SessionList = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
  flex-direction: column;
`;

export const SessionItem = styled.div`
  padding: 10px 10px;
  color: ${props => props.theme.colors.colortx02};
  font-size: 13px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  cursor: pointer;

  & + & {
    margin-top: 1px;
  }

  i {
    line-height: 1;
    font-size: 18px;
    margin-right: 8px;
    color: rgba(${props => hexToRgb(props.theme.colors.colortx02)}, .6);
  }

   &:hover {
    background-color: rgba(${props => hexToRgb(props.theme.colors.colorbg02)}, .4);
   }

   ${props => props.selected && `
      background-color: ${props.theme.colors.colorbg02} !important;
      color: ${props.theme.colors.colortx01};
      font-weight: 500;
      letter-spacing: -.2px;

      i {
        color: ${props.theme.colors.colorui01};
      }
   `}
`;

export const ModalBody = styled.div`
  height: 580px;
  position: relative;
  flex: 1 1 auto;
  padding: 25px 30px;

  .react-loading-skeleton {
    background-color: ${props => props.theme.colors.colorbg01};
    background-image: linear-gradient( 90deg,${props => props.theme.colors.colorbg01},#fff,${props => props.theme.colors.colorbg01});
  }
`;

export const UnitPricingTitle = styled.div`
  display: flex;
  align-items: center;

  h2 {
    margin-bottom: 0;
    font-weight: 400;
    color: #0b2151;
    letter-spacing: -1px;

    strong {
      font-weight: 600;
      font-family: ${props => props.theme.fonts.default};
    }
  }
`;

export const Badge = styled.span`
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  display: flex;
  align-items: center;
  font-size: 12px;
  border-radius: 3px;
  padding: 5px 8px;
  margin-left: 10px;
  font-weight: 400;

  i {
    margin-left: 5px;
    font-size: 14px;
  }

  ${props => props.success && `
    background-color: rgba(${hexToRgb(props.theme.colors.success)}, .2);
    border: 1px solid ${props.theme.colors.success};
    color: #1c8f5f;
  `}

  ${props => !props.success && `
    background-color: rgba(${hexToRgb(props.theme.colors.red)}, 0.1);
    border: 1px solid rgba(${hexToRgb(props.theme.colors.red)}, 0.6);
    color: ${props.theme.colors.red};
  `}
`;

export const ButtonClose = styled.div`
  position: absolute;
  right: 30px;
  top: 21px;
  opacity: .5;
  cursor: pointer;
  line-height: 1;
  color: ${props => props.theme.colors.gray600};
  font-weight: 300;
  font-size: 32px;
  z-index: 1100;

  &:hover {
    opacity: .75;
  }
`;

export const Divider = styled.hr`
  margin: 15px 0;
  opacity: 0;
`;

export const UnitInfoList = styled.div`
  display: flex;
  align-items: center;
`;

export const UnitInfoWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid rgba(${props => hexToRgb(props.theme.colors.colortx01)}, 0.07);
  padding: 12px 10px;
  ${props => shadowSharp({ color: hexToRgb(props.theme.colors.colorbg01) })};

  & + & {
    margin-left: 8px;
  }
`;

export const InfoIcon = styled.div`
  margin-right: 5px;

  i {
    font-size: 16px;
    font-weight: 400;
    line-height: 1;
    color: ${props => props.theme.colors.colorui01};
    opacity: .75;
  }
`;

export const InfoBody = styled.div`
  flex: 1;
`;

export const InfoTitle = styled.label`
  display: block;
  margin-bottom: 8px;
  color: ${props => props.theme.colors.colortx03};
  font-size: 13px;
  line-height: 1.2;
  font-weight: 400;
`;

export const InfoContent = styled.h6`
  margin-bottom: 0;
  font-weight: 400;
  color: ${props => props.theme.colors.colortx01};
  letter-spacing: -.5px;
`;

export const ChartLabel = styled.label`
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.theme.colors.colortx01};
  letter-spacing: -.2px;
  margin-bottom: 20px;
  margin-top: 20px;
`;

export const ChartWrapper = styled.div`
  height: 300px;
  margin-bottom: 20px;

  .fusioncharts-container {
    background-color: ${props => props.theme.colors.bodyBg};
  }
`;

export const BadgeWrapper = styled.div`
  width: fit-content;
  margin-left: auto;
`;
