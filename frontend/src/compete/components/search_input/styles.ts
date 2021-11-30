import styled, { css } from 'styled-components';
import { Input } from 'reactstrap';
import { Search } from 'react-feather';
import { shadowDropdown } from 'compete/components/common/mixin';

export const SearchIcon = styled(Search)`
  position: absolute;
  top: ${props => (props.$small ? '12px' : '11px')};
  left: 9px;
  width: ${props => (props.$small ? '18px' : '20px')};
  height: ${props => (props.$small ? '18px' : '20px')};
  stroke-width: 2.5px;
  color: ${props => (props.$small ? props.theme.colors.colortx03 : props.theme.colors.colortx02)};
  margin-right: 5px;
`;

export const FormSearch = styled(Input)`
  display: flex;
  align-items: center;
  height: 42px;
  background-color: transparent;
  border-radius: 4px;
  padding: 0 8px;
  min-width: ${props => (props.$small ? '100px' : '220px')};
  width: 100%;
  padding-left: ${props => (props.$small ? '34px' : '36px')};
  border: 1px solid ${props => props.theme.colors.colorbd02};
  font-weight: 500;
  letter-spacing: -0.2px;
  color: ${props => props.theme.colors.gray700};
  margin-bottom: 0px;

  &:focus {
    background-color: #fff;
    border-color: ${props => props.theme.colors.colorbd02};
    box-shadow: none;
    color: ${props => props.theme.colors.gray700};
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }

  &::placeholder {
    color: ${props => props.theme.colors.gray500};
    font-weight: 400;
  }

  ${props => props.$search && css`
    border-bottom-left-radius: unset;
    border-top-left-radius: unset;
  `}
`;

export const SearchResults = styled.div`
  position: absolute;
  top: 42px;
  left: 0;
  right: 0;
  min-height: 100px;
  background-color: #fff;
  padding: 15px;
  border: 1px solid ${props => props.theme.input.borderColor};
  border-top-width: 0;
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
  ${props => shadowDropdown(props.theme.colors.colorbg02)};
  display: ${props => (props.show ? 'block' : 'none')};
  z-index: 100;
  max-height: 620px;
  overflow: auto;
  pointer-events: all;
`;

export const KeywordLabel = styled.label`
  display: block;
  color: ${props => props.theme.colors.colortx03};
  margin-bottom: 2px;
  font-size: 13px;
  font-weight: 400;
`;

export const ListItem = styled.div`
  display: flex;
  flex-direction: column;
  &:not(:last-child) {
    margin-bottom: 20px;
  }
`;

export const ItemLink = styled.div`
  color: ${props => props.theme.colors.colortx01};
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    color: ${props => props.theme.colors.colortx01};
    background-color: ${props => props.theme.colors.colorbg01};
  }
`;
