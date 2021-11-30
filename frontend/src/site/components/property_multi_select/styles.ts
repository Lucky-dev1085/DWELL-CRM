import styled, { css } from 'styled-components';

export const MultiSelectHeader = styled.div`
  justify-content: flex-end;
  padding: 10px;
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #657697;
  line-height: 19px;
  cursor: pointer;
  border-bottom: 1px solid #dddddd;

  div:hover {
    color: #233457;
  }
`;

export const MultiSelectBody = styled.div`
  height: calc(100% - 46px);
  overflow: auto;
  marginTop: 5px;
`;

export const ClientPropertyChoice = styled.div`
  display: flex;
  align-items: center;
  line-height: 14px;
  height: 100%;
  padding: 12px;
  color: #657697;
  cursor: pointer;
  justify-content: space-between;

  &:hover {
    background-color: #f3f3f3;
  }

  i {
    font-size: 16px;
  }

  ${props => (props.disabled ? css`
  cursor: default;
  color: #b4b4b4;
  ` : '')}
`;

export const CheckIcon = styled.div`
  position: relative;
  width: 16px;
  height: 16px;
  background-color: #f7f8fc;
  border: 1px solid #a0a6bd;
  border-radius: 3px;
  margin-right: 8px;
  padding: 0 1px 1px;

  &::before {
    content: '\\EB7A';
    font-family: 'remixicon';
    font-size: 12px;
    font-weight: 700;
    position: absolute;
    top: 1px;
    left: 1px;
    line-height: 1;
    color: #fff;
    opacity: 0;
  }

  ${props => (props.checked ? css`
    background-color: #448dfb;
    border-color: transparent;
    &:before {
      opacity: 1;
    }
  ` : '')}
`;

export const AccessSelect = styled.div`
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  flex: 1;
  border: 1px solid #ddd;
  height: 348px;
`;

export const PropListItem = styled.div`
  padding: 3px 10px;
  display: flex;
  align-items: center;

  &:focus, &:hover {
    background-color: ${props => props.theme.colors.gray100};
    cursor: default;
  }

  span {
    flex: 1;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 14px;
    white-space: nowrap;
  }

  i {
    color: ${props => props.theme.colors.gray500};
    line-height: 1;
    font-size: 18px;
    position: relative;
    top: 3px;
    cursor: pointer;
  }
`;
