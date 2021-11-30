import styled, { css } from 'styled-components';
import { Card, CardHeader, CardTitle } from 'reactstrap';
import { PrimaryButton, WhiteButton } from 'styles/common';
import { FormSearch, FormSearchInput } from 'dwell/views/pipeline/styles';

export const PropertyListCard = styled(Card)`
    border: 1px solid #ccced9;
    border-radius: 4px;
`;

export const PropertyListCardHeader = styled(CardHeader)`
    border-color: #dfe1e8 !important;
    background-color: #fff;
`;

export const PropertyListCardTitle = styled(CardTitle)`
    padding: 10px !important;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #dfe1e8 !important;
    font-size: 13px;
    color: #657697;
`;

export const PropertyList = styled.div`
    height: 240px;
    overflow: hidden;
    overflow-y: auto;
    flex-direction: column !important;
    padding: 10px 0;
    display: flex;
`;

export const PropertyListAction = styled.div`
    cursor: pointer;
    margin-left: 10px;

    &:hover {
        color: #233457;
    }
`;

export const PropertyListLabel = styled.label`
    color: #657697 !important;
    margin-bottom: 0;
`;

export const PropertyListItem = styled.div`
    padding: 3px 10px;

    ${p => p.isSelected && css`
        label:not(.ri-close-line) {
            color: #344563 !important;
        }

        &:hover {
            background-color: #f7f8fc;
            cursor: default;
        }
    `}
`;

export const PropertyListCloseIcon = styled.label`
    font-weight: 400;
    color: #a0a9bd !important;
    cursor: pointer;
    font-size: 18px;
    margin-bottom: 0;
`;

export const SaveBtn = styled(PrimaryButton)`
    height: ${props => props.theme.templates.heightBase} !important;

    ${props => !props.disabled && css`
        &:hover {
            background-color: #0153c7;
            border-color: #0153c7;
            box-shadow: 0 1px 1px rgba(225,230,247,0.11), 0 2px 2px rgba(225,230,247,0.11), 0 4px 4px rgba(225,230,247,0.11), 0 6px 8px rgba(225,230,247,0.11), 0 8px 16px rgba(225,230,247,0.11);
        }
    `}
`;

export const CancelBtn = styled(WhiteButton)`
    height: ${props => props.theme.templates.heightBase} !important;
    margin-left: 8px;

    background-color: #fff;
    border-color: rgba(193,200,222,0.75);
    color: #4a5e8a;

    &:hover, &:focus {
        border-color: rgba(193,200,222,0.75);;
        color: #4a5e8a;
        outline: none;
    }
`;

export const PropertyListFormSearch = styled(FormSearch)`
    width: 238px;
    height: 42px;
    border: none;
    background-color: #fff;

    i {
        font-size: 20px;
        color: #a0a9bd;
    }
`;

export const PropertyListFormSearchInput = styled(FormSearchInput)`
    border: none;
    background-color: #fff;
    height: 42px;
    border-width: 0px;
    font-weight: 400;

    &:focus {
         background-color: #fff;
    }
`;
