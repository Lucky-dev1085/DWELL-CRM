import styled from 'styled-components';
import PerfectScrollbar from 'react-perfect-scrollbar';

export const ContentContainer = styled.div`
  display: flex;
  transition: all 0.25s;
  padding: 15px 25px 25px;
  flex-direction: column;
`;

export const ContentHeader = styled.div`
  display: flex;
  margin-bottom: 15px;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

export const NavContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const NavLink = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  min-width: 80px;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: all 0.25s;
  cursor: pointer;

  &:hover, &:focus {
    background-color: #fff;
    box-shadow: 0 1px 1px rgba(225,230,247,0.08),
                0 2px 2px rgba(225,230,247,0.12),
                0 4px 4px rgba(225,230,247,0.16),
                0 8px 8px rgba(225,230,247,0.2);
  }

  i {
    line-height: 1;
    font-size: 24px;
    color: ${props => props.theme.colors.colortx03};
    margin-bottom: 8px;
  }

  span {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: ${props => props.theme.colors.colortx02};
  }
`;

export const ContentBody = styled.div`
  display: flex;
`;

export const ContentSidebar = styled.div`
  width: 230px;
  margin-right: 30px;
`;

export const ContentLabel = styled.label`
  color: ${props => props.theme.colors.colortx03};
  font-family: "Helvetica Neue",Arial,sans-serif;
  letter-spacing: 1px;
  line-height: 1;
  display: block;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
`;

export const NavCompete = styled.ul`
  display: flex;
  flex-wrap: wrap;
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
  flex-direction: column;

   & + & {
    margin-top: 2px;
   }
`;

export const CompeteItem = styled.li`
  position: relative;
`;

export const ItemLink = styled.div`
  color: ${props => props.theme.colors.colortx01};
  font-weight: 500;
  padding: 8.5px 10px;
  display: flex;
  align-items: center;
  position: relative;
  outline: none;
  transition: all 0.25s;
  cursor: pointer;

  &::before {
    content: '\\EA4E';
    font-family: 'remixicon';
    font-size: 16px;
    position: absolute;
    right: 10px;
    line-height: 0;
    opacity: .5;
    transition: all 0.25s;
  }

  .active &::before {
    transform: rotate(180deg);
  }

  &:hover {
    color: ${props => props.theme.colors.colorui01};
  }

  i {
    font-size: 20px;
    font-weight: 400;
    line-height: .7;
    margin-right: 8px;
  }
`;

export const NavSubCompete = styled(PerfectScrollbar)`
  display: flex;
  flex-direction: column;
  padding-left: 38px;
  transition: all 0.25s;
  max-height: 500px;

  .active & {
    padding-top: 6px;
    padding-bottom: 10px;
  }

  > .ps__rail-y {
    width: 2px;
    background-color: ${props => props.theme.colors.gray100};
    z-index: 0;
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
        > .ps__rail-y { opacity: ${props => (props.$scroll ? 1 : 0)}; }
    }
  }
`;

export const CompeteSubItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  .active & + & {
    margin-top: 12px;
  }
`;

export const SubItemLink = styled.div`
  width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${props => props.theme.colors.colortx02};
  height: 0;
  transition: all 0.25s;
  cursor: pointer;

  .active & {
    height: 21px;
  }

  &:hover, &:focus {
    color: ${props => props.theme.colors.colorui01};
  }
`;

export const SubItemRemove = styled.div`
  position: absolute;
  top: 40%;
  right: 10px;
  margin-top: -6px;
  color: ${props => props.theme.colors.colortx03};
  opacity: 0;
  transition: all 0.25s;
  cursor: pointer;

  ${SubItemLink}:hover ~ & {
    opacity: .5;
  }

  i {
    font-size: 16px;
    line-height: 1;
  }

  &:hover {
    opacity: .5;
    color: ${props => props.theme.colors.colortx01};
  }
`;

export const ContentMain = styled.div`
  flex: 1;

  .card-header {
    padding: 20px 25px 0;
  }

  .card-body {
    padding: 20px 25px 25px;
  }
`;
