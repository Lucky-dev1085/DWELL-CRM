import styled, { css } from 'styled-components';
import { Search } from 'react-feather';
import { Input, Card, CardHeader, CardFooter } from 'reactstrap';
import { shadowSharp, shadowDiffuse } from 'src/styles/mixins';
import { hexToRgb } from 'dwell/constants';

export const LeadPanel = styled.div`
  background-color: #fff;
  border: 1px solid ${props => props.theme.colors.colorbg02};
  ${props => shadowSharp({ color: hexToRgb(props.theme.colors.colorbg02) })};
  border-radius: 6px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const NavLine = styled.nav`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-right: auto;
  color: ${props => props.theme.colors.colortx02};
`;

export const NavLink = styled.a`
  position: relative;
  height: 37px;
  padding: .5rem 1rem;
  justify-content: center;
  display: flex;
  align-items: center;
  display: flex;
  flex-direction: column;
  font-weight: 400 !important;

  :hover {
    color: ${props => props.theme.colors.colorui01} !important;
    cursor: pointer;
  }

  &.active {
    color: ${props => props.theme.colors.colorui01} !important;
    font-weight: 500 !important;
    letter-spacing: normal;

    &:before {
      bottom: -11px;
      z-index: 10;
      display: block;
      content: '';
      position: absolute;
      left: 10px;
      right: 10px;
      height: 2px;
      background-color: ${props => props.theme.colors.colorui01};
    }
  }
`;

export const NavLeadTab = styled.nav`
  background-color: #fff;
  padding: 10px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  border-bottom: 1px solid ${props => props.theme.colors.colorbd02};
`;

export const LeadPanelBody = styled.div`
  flex: 1;
  position: relative;
`;

export const LeadPanelSideBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 320px;
  height: 100%;
  border-right: 1px solid ${props => props.theme.colors.colorbd02};
`;

export const SideBarHeader = styled.div`
  padding: 10px;
  border-bottom: 1px solid ${props => props.theme.colors.colorbd02};
`;

export const SearchIcon = styled(Search)`
  position: absolute;
  top: 9px;
  left: 9px;
  width: 20px;
  height: 20px;
  stroke-width: 2.5px;
  color: ${props => props.theme.colors.colortx02};
  margin-right: 5px;
`;

export const FormSearch = styled(Input)`
  display: flex;
  align-items: center;
  height: 38px;
  background-color: #fff;
  border-radius: 5px;
  padding: 0 10px;
  min-width: 220px;
  padding-left: 36px;
  border-width: 1px;
  border-color: #d9def0;
  font-weight: 500;
  letter-spacing: -0.2px;
  color: ${props => props.theme.colors.gray700} !important;
  margin-bottom: 0px;

  &:focus {
    background-color: #fff;
    border-color: ${props => props.theme.input.borderColor};
    box-shadow: none;
  }

  &::placeholder {
    color: ${props => props.theme.colors.gray500};
    font-weight: 400;
  }
`;

export const SideBarContent = styled.div`
  height: calc(100% - 112px);
  position: relative;
  overflow: hidden;
  overflow-y: auto;

  &:hover {
    &::-webkit-scrollbar-thumb {
      background-color: ${props => props.theme.colors.colorbg03};
    }
  }

  &::-webkit-scrollbar {
    width: 1px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: transparent;
  }
`;

export const TimeWrapper = styled.div`
  span:nth-child(2) {
    display: none;
  }

  ${props => props.sms && `
    margin-top: -4px;
  `}
`;

export const CommItem = styled.div`
  padding: 12px;
  display: flex;
  position: relative;
  font-size: 13px;
  background-color: #fbfbfd;
  cursor: pointer;
  & + &, .ps__rail-y + & {
    border-top: 1px solid ${props => props.theme.colors.colorbd02};
  }
  ${props => props.lightGray && `
  background-color: ${props.theme.colors.colorbg01};`};

  ${props => props.isNote && `
    background-color: #fffce8;
  `}

  ${props => props.selected && `
    background-color: #cadeff;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      border-left: 2px solid ${props.theme.colors.colorui01};
    }
  `}

  &:hover {
    ${TimeWrapper} {
      span:nth-child(1) {
        display: none;
      }

      span:nth-child(2) {
        display: block;
      }
    }
  }
`;

export const Avatar = styled.div`
  width: ${props => (props.lg ? '36px' : '22px')};
  min-width: ${props => (props.lg ? '36px' : '22px')};
  height: ${props => (props.lg ? '36px' : '22px')};
  background-color: ${props => (props.color || props.theme.colors.colortx03)};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  position: relative;

  ${props => props.gray && `background-color: ${props.theme.colors.colorbg03};`}
  ${props => (props.small || props.isChat) && `
    width: 24px;
    height: 24px;`}

  i {
    font-size: 14px;
  }

  span {
    font-size: ${props => (props.lg ? '16px' : '12px')};
    text-transform: uppercase;
  }

  ${props => props.isChat && `
    margin-top: 8px;

    span {
      font-size: 13px;
    }

    i {
      font-size: 14px;
    }
  `}
`;

export const CommItemBody = styled.div`
  flex: 1;
  padding-left: 8px;
`;

export const BodyHeader = styled.div`
  margin-bottom: 3px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h6 {
    margin-bottom: 0;
    margin-right: auto;
    color: ${props => props.theme.colors.colortx02};
  }

  span {
    display: block;
    font-size: 12px;
    color: ${props => props.theme.colors.colortx03};
  }
`;

export const CommDot = styled.small`
  width: 8px;
  height: 8px;
  border-radius: 100%;
  margin-right: 5px;
  background-color: ${props => props.color};
`;

export const CommMessage = styled.p`
  margin-bottom: 0;
  font-size: 12px;
  color: ${props => (props.selected ? '#6077ab' : props.theme.colors.colortx03)};
  line-height: 1.4;
`;

export const ShowMore = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 20px;
  left: 50%;
  padding: 5px 18px;
  border-radius: 16px;
  border: 1px solid #ccced9;
  transform: translateX(-50%);
  font-size: 13px;
  opacity: .95;
  outline: none;
  transition: all 0.2s;
  background-color: ${props => props.theme.colors.colorbg01};
  color: ${props => props.theme.colors.colortx01};
  cursor: pointer;

  ${props => props.disable && css`
    opacity: 0.6;
    pointer-events: none;
  `}

  &:hover {
    background-color: #fff;
    ${props => shadowDiffuse({ color: hexToRgb(props.theme.colors.colorbg03) })};
  }

  i {
    margin-right: 2px;
    line-height: 1;
  }
`;

export const SearchWrapper = styled.div`
  position: relative;
  margin-top: 10px;
`;

export const EmptySearch = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px;

  i {
    font-size: 48px;
    line-height: 1;
    margin-bottom: 20px;
  }

  h5 {
    font-weight: 600;
    margin-bottom: 2px;
    color: ${props => props.theme.colors.colortx01};
  }

  p {
    color: ${props => props.theme.colors.gray500};
    text-align: center;
  }
`;

export const CommunicationContent = styled.div`
  position: absolute;
  top: 0;
  bottom: 59px;
  left: 320px;
  right: 0;
  overflow: hidden;
  overflow-y: auto;
  padding: 0 15px 15px;
  height: calc(100% - 56px);

  &:hover {
    &::-webkit-scrollbar-thumb {
      background-color: ${props => props.theme.colors.colorbg03};
    }
  }

  &::-webkit-scrollbar {
    width: 2px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: transparent;
  }
`;

export const CommunicationItem = styled.div`
  display: flex;
  margin-bottom: 5px;
  padding-top: ${props => (props.$first ? '30px' : '15px')};
`;

export const CommunicationWrapper = styled.div`
  flex-basis: 80%;
  ${props => props.reverse && `
    margin-left: 0;
    margin-right: 10px;
    flex-basis: ${props.activity ? 75 : 80}%;
  `}
  ${props => props.$isNote && `
    flex-basis: 100%;
  `}
`;

export const GreenBadge = styled.span`
  color: #fff !important;
  background-color: ${props => props.theme.colors.green};
  font-size: 9px !important;
  border-radius: 2px;
  padding: .25em .4em;
  font-weight: 500;
  width: fit-content;
`;

export const ItemCard = styled(Card)`
  border-color: ${props => props.theme.colors.colorbd02};
  background-color: ${props => props.theme.colors.gray100};
  font-size: 13px;
  margin-bottom: 0;

  ${props => props.$white && `
    background-color: white;
  `}

  ${props => props.$isNote && `
    background-color: #fffce8;
  `}

  ${props => props.selected && `
    background-color: #cadeff;

    span {
      color: #6077ab !important;
    }

    ${GreenBadge} {
      color: #fff !important;
    }
  `}

  &:hover {
    ${TimeWrapper} {
      margin-top: 0px;
      span:nth-child(1) {
        display: none;
      }

      span:nth-child(2) {
        display: block;
      }
    }
  }
`;

export const ItemHeader = styled(CardHeader)`
  padding: 10px 15px;
  border-bottom-color: ${props => (!props.$transparentBottom ? props.theme.colors.colorbd02 : 'transparent')};
  background-color: transparent;
  display: flex;

  ${props => props.borderBottomNone && `
    border-bottom-width: 0;
  `}
`;

export const TitleWrapper = styled.div`
  margin-left: 10px;
  flex: 1 1 auto;
`;

export const EntireMessage = styled.p`
  margin-bottom: 0;
  text-align: center;
  color: ${props => props.theme.colors.colorui01};
  cursor: pointer;

  &:hover {
    color: #0148ae;
  }
`;

export const ItemFooter = styled(CardFooter)`
  padding: 10px 15px;
  display: flex;
  align-items: center;
  background-color: transparent;
  border-top: 1px solid ${props => props.theme.colors.colorbd02};

  .select-input {
    min-width: 160px;
  }

  .dropdown-menu {
    width: fit-content !important;
  }
`;

export const ButtonWhite = styled.button`
  background-color: #fff;
  border-color: ${props => props.theme.input.borderColor};
  color: ${props => props.theme.colors.colortx02};
  min-height: 36px;
  height: 36px;
  line-height: 1;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 15px;
  border-radius: 5px;

  ${props => props.icon && `
    width: 36px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 5px;

    i {
      font-size: 18px;
      line-height: 1;
      transition: all 0.25s;
    }
  `}

  &:hover {
    border-color: ${props => props.theme.colors.colorbg03};
    color: ${props => props.theme.colors.colortx02};
  }

  ${props => props.right && `
    margin-left: auto;
  `}

  ${props => props.blue && `
    color: ${props.theme.colors.colorui01};

    &:hover {
      color: ${props.theme.colors.colorui01};
    }
  `}
`;

export const MessageItem = styled.div`
  display: flex;
  align-items: flex-start;

  ${props => props.reverse && `
    justify-content: flex-end;
    flex-direction: row;
  `}
  & + & {
    margin-top: 20px;
  }

  ${props => props.agentJoined && css`
      justify-content: center;
  `};
`;

export const MessageBody = styled.div`
  margin: 0 10px;
  flex: none;
  flex-basis: 70%;

  & > div {
    padding: 10px;
    background-color: ${props => props.theme.colors.gray200};
    margin-bottom: 5px;
    border: 1px solid transparent;
    border-radius: 3px;

    ${props => props.reverse && `
      background-color: #fff;
      border-color: ${props.theme.colors.colorbd02};
    `}

    i {
      font-size: 16px;
      color: #ccc;
    }
  }

  p {
    margin-bottom: 0;
    font-size: 12px;
    color: ${props => props.theme.colors.colortx03};

    strong {
      font-weight: 500;
      color: ${props => props.theme.colors.colortx02};
      display: inline-block;
      margin-right: 5px;
    }
  }

  .calendar-links {
    flex-direction: row;
    width: 100%;
    flex-wrap: wrap;

    .calendar {
      display: flex;
      height: 38px;
      margin: 3px 5px 0 0;

      .calendar-logo {
        margin-top: -1px;
        margin-right: 3px;
      }
      .apple, .yahoo {
        margin-top: -2px;
      }

      div:nth-child(2) {
        white-space: nowrap;
      }
    }
  }
`;

export const LeadContentFooter = styled.div`
  position: absolute;
  bottom: 0;
  left: 320px;
  right: 0;
  padding: 10px;
  border-top: 1px solid ${props => props.theme.colors.colorbd02};
  display: flex;
  background-color: #fff;
`;

export const ButtonGroup = styled.div`
  position: relative;
  display: inline-flex;
  vertical-align: middle;

  .btn {
    font-size: 13px;
    padding-left: 10px;
    padding-right: 10px;

    i {
      margin-right: 3px;
      font-size: 16px;
      line-height: 1;
    }
  }

  &>.btn:not(:first-child) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    margin-left: -1px;
  }

  &>.btn:not(:last-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  &>.btn:hover {
    z-index: 1;
  }

  &:last-child {
    margin-left: 10px;
    padding-left: 10px;
    border-left: 1px solid #d9def0;
  }
`;

export const TranscriptionWrapper = styled.div`
  .public-DraftEditor-content {
    max-height: 100% !important;
  }

  .card {
    border: none;
    margin-top: 0;
  }

  .transcription-wrapper {
    grid-template-columns: [col-speaker] minmax(32px, 2%) [col-text] minmax(52%, 98%);
  }
`;

export const CallWrapper = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  left: 150px;
  top: 27px;
`;

export const AgentJoinedText = styled.div`
  font-size: 13px;
  font-weight: 400;
  color: ${props => props.theme.colors.darkblue};
  margin: 2px;
  text-align: center;
  margin-top: 10px;
  background-color: transparent !important;
  border: none !important;
  padding: 0 10px !important;
`;

export const BodyTitle = styled.div`
  display: flex;
  justify-content: space-between;

  span {
    font-size: 12px;
    color: ${props => props.theme.colors.colortx03};
    line-height: 10px;
  }
`;

export const FollowupCheck = styled.div`
  display: flex;
  align-items: center;
  margin-right: 8px;

  span {
    margin-left: 5px;
    font-size: 13px;
  }
`;

export const NoteFooter = styled.div`
  padding: 16px;
  display: flex;
  justify-content: space-between;
`;

export const ShowUnits = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.colortx03};
  margin-top: 5px;
`;

export const ClearInput = styled.div`
  position: absolute;
  top: 9px;
  right: 10px;

  i {
    background-color: ${props => props.theme.colors.colorbd02};
    color: ${props => props.theme.colors.colortx01};
    border-radius: 50%;
    cursor: pointer;
    padding: 1px
  }

  i:hover {
    color: ${props => props.theme.colors.colortx02};
  }
`;

export const TourTitle = styled.span`
  font-weight: ${props => (props.weight ? 600 : 400)};
  font-size: 13px;
`;

export const PreloadEditor = styled.div`
  display: none;
  visibility: hidden;
`;

export const ContentWrapper = styled.div`
  padding: 0 15px 15px;
  margin-top: -12px;

  ${props => props.$isNote && `
    padding-bottom: 0;
  `}
`;

export const AvatarImg = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

export const StickyDay = styled.div`
  background-color: #dee0e8;
  color: ${props => props.theme.colors.colortx01};
  padding: 3px 20px;
  border-radius: 4px;
  font-size: 11px;
`;

export const ChatTitle = styled.h6`
  margin-bottom: 0;
  font-size: 12px;
`;

export const DayDivider = styled.hr`
  position: absolute;
  width: calc(100% + 30px);
  margin-left: -15px;
  top: 10px;
  border-color: ${props => props.theme.colors.colorbd02};
`;

export const DayWrapper = styled.div`
  position: sticky;
  top: 0;
  margin: auto;
  width: fit-content;
  z-index: 100;
  padding-top: 15px;
`;

export const CommunicationByDayWrapper = styled.div`
  position: relative;
  ${DayWrapper} {
    ${props => !props.$isFirst && 'margin-top: 15px;'}
  }

  ${CommunicationItem} {
    ${props => props.$isFirst && `
      padding-top: 15px !important;
    `}
  }
`;

export const HeaderWrapper = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 130px;

  @media (min-width: 1200px) {
    width: 12vw;
  }
  @media (min-width: 1250px) {
    width: 15vw;
  }
  @media (min-width: 1301px) {
    width: 18vw;
  }
  @media (min-width: 1400px) {
    width: 22vw;
  }
  @media (min-width: 1500px) {
    width: 25vw;
  }
  @media (min-width: 1600px) {
    width: 29vw;
  }
`;
