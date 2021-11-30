import styled from 'styled-components';

export const TableNavBar = styled.div`
  padding-left: 20px;
  display: flex;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(193,200,222,0.2);
  align-items: center !important;
  justify-content: flex-end;
`;

export const SizePerPage = styled.div`
  margin-right: auto;
  display: flex;
  align-items: center;
  color: #929eb9;
  ${props => props.hide && 'display: none;'}
`;
