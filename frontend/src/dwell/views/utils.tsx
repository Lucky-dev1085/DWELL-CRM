import React, { FC } from 'react';
import styled, { DefaultTheme } from 'styled-components';
import { Avatar as CommonAvatar } from 'styles/common';
import { Nav as CommonNav, NavLink, Container, UncontrolledTooltip } from 'reactstrap';

let theme: DefaultTheme;

export const messageStatusToProps: { [key: string]: (c: typeof theme.colors) => { color?: string, background?: number, colorSaturation?: number } } = {
  null: () => ({}),
  undefined: () => ({}),
  // todo change the colors of the buttons
  CORRECT: c => ({ color: c.green, background: 0.5, colorSaturation: 0.2 }),
  INCORRECT: c => ({ color: c.red, background: 0.34, colorSaturation: 0.4 }),
  SUPPORTED: c => ({ color: c.green, background: 0.5, colorSaturation: 0.2 }),
  NOT_SUPPORTED: c => ({ color: c.red, background: 0.34, colorSaturation: 0.4 }),
};

export const Nav = styled(CommonNav)``;

export const ContainerFluid = styled(Container).attrs({ fluid: true })`
  padding: 30px 30px 50px;
`;

export const Avatar: FC<{ icon?: string, text?: string }> = ({ icon, text, ...props }) => (
  <CommonAvatar {...props}>
    {text && <span>{text}</span>}
    {icon && <i className={`ri-${icon}`} />}
  </CommonAvatar>
);

export interface NavLinkWithTooltipProps {
  id: string,
  icon: string,
  title: string,
  onClick?: () => void,
  className?: string,
}

export const NavLinkWithTooltip: FC<NavLinkWithTooltipProps> = ({ onClick, id, icon, title, className }) => (
  <>
    <NavLink id={id} className={className} onClick={onClick}>
      <span>
        <i className={`ri-${icon}`} />
      </span>
    </NavLink>
    <UncontrolledTooltip target={id}>{title}</UncontrolledTooltip>
  </>
);

export interface NavLinkWithIconProps extends React.HTMLAttributes<HTMLElement> {
  icon: string,
  label: string,
}

export const NavLinkWithIcon: FC<NavLinkWithIconProps> = ({ icon, label, onClick, className }) => (
  <NavLink onClick={e => e.preventDefault() || onClick(e)} className={className} href="">
    <i className={`ri-${icon}`} />
    <span>{ label }</span>
  </NavLink>
);

export const formatInteger = (value: number | string): string => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
