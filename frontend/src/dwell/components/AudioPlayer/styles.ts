import styled from 'styled-components';
import { Progress, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

export const CallPlay = styled.div`
    margin-right: 5px;
    display: block;
    font-size: 24px;
    color: ${props => props.theme.colors.teal};
    line-height: 1;
    outline: none;
    text-indent: -1.2px;
    cursor: pointer;

    i:first-child { display: block; }
    i:last-child { display: none; }

    ${props => props.active && `
        i:first-child { display: none; }
        i:last-child { display: block; }
    `}
`;

export const CallTime = styled.div`
    min-width: 30px;
    font-size: ${props => props.theme.fontSizes.sm};
    font-family: ${props => props.theme.fonts.numeric};
    color: ${props => props.theme.colors.colortx03};
`;

export const CallProgress = styled(Progress)`
    margin: 0 5px;
    width: 80px;
    height: 4px;
    background-color: ${props => props.theme.colors.colorbg02};
`;

export const SpeedControlToggle = styled(DropdownToggle)`
    position: relative;
    outline: none;

    span {
        display: block;
        font-size: 13px;
        font-family: ${props => props.theme.fonts.numeric};
        background-color: #fff;
        border: 1px solid ${props => props.theme.input.borderColor};
        border-radius: 3px;
        padding: 4px 13px 4px 5px;
        line-height: 1;
        letter-spacing: normal;
        position: relative;

        &::after {
            content: '\\EA4F';
            font-family: 'remixicon';
            font-size: 16px;
            position: absolute;
            top: 50%;
            right: 0;
            line-height: 0;
            margin-top: .5px;
        }
    }

    &:hover, &:focus {
        span {
            border-color: ${props => props.theme.colors.colorbg03};
        }
    }
`;

export const SpeedControlMenu = styled(DropdownMenu)`
    padding: 2px;
    width: 75px;
    min-width: inherit;
    max-height: 240px;
    border: 1px solid ${props => props.theme.input.borderColor};
    border-radius: 4px;
    box-shadow: 0 1px 1px rgba(225,230,247,0.25),
        0 2px 2px rgba(225,230,247,0.2),
        0 4px 4px rgba(225,230,247,0.15),
        0 8px 8px rgba(225,230,247,0.1),
        0 16px 16px rgba(225,230,247,0.05);
`;

export const SpeedControlItem = styled(DropdownItem)`
    padding: 6px 7px;
    line-height: 1;
    font-size: ${props => props.theme.fontSizes.sm};
    font-family: ${props => props.theme.fonts.numeric};
    color ${props => props.theme.colors.colortx03};
    border-radius: 3px;
    border: 0;
    outline: 0;

    &:hover, &:focus {
        background-color: ${props => props.theme.colors.colorbg01} !important;
        color: ${props => props.theme.colors.colortx02} !important;
        border: 0;
    }
`;
