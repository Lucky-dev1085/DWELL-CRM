import styled from 'styled-components';
import { WhiteButton } from 'styles/common';
import { FiltersNavLink } from 'dwell/components/Leads/LeadsFilterDropDown/styles';

export const LeadDetailMain = styled.div`
    display: block;
    transition: none;
`;

export const LeadDetailHeader = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    padding: 0 15px;
    height: 86px;
    background-color: #fff;
    border-bottom: 1px solid ${props => props.theme.colors.colorbg02};
`;

export const LeadDetailNavbar = styled.div`
    height: 60px;
    padding: 0 25px;
    background-color: #fff;
    box-shadow: 0 1px 1px rgba(240,242,249,0.25), 0 2px 2px rgba(240,242,249,0.2), 0 4px 4px rgba(240,242,249,0.15), 0 8px 8px rgba(240,242,249,0.1), 0 16px 16px rgba(240,242,249,0.05);
    display: flex;
    align-items: center;
    border-top: 1px solid #e1e6f7;
    border-bottom: 1px solid #e1e6f7;
`;

export const UploadIconButton = styled(WhiteButton)`
    padding: 0 10px;
    i {
        font-size: 18px;
    }
`;

export const UploadTextButton = styled(FiltersNavLink)`
    background-color: ${props => props.theme.colors.colorbg01};
    width: 120px;
    height: 40px;
    border-radius: 0.25rem;
    border: 1px solid ${props => props.theme.colors.colortx02};

    &:hover {
        cursor: pointer;
        background-color: ${props => props.theme.colors.colorbg02};
        color: ${props => props.theme.colors.colortx02};
        outline: none;
    }
`;
