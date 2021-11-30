import React, { CSSProperties, FC } from 'react';
import Skeleton from 'react-loading-skeleton';

export const getPropertyId = (): string => {
  const { pathname } = window.location;
  if (pathname.split('/').length > 2) {
    return pathname.split('/')[1];
  }
  return '';
};

interface LineSkeletonProps {
  width?: number,
  height?: number,
  style?: CSSProperties,
  count?: number,
  circle?: boolean,
}

export const LineSkeleton: FC<LineSkeletonProps> = ({ width, height, style, count, circle }) =>
  (<Skeleton width={width} height={height} style={{ ...style, borderRadius: '6px' }} count={count} circle={circle} />);

export const CheckboxSkeleton = () : JSX.Element =>
  (<Skeleton width="16px" height="16px" style={{ borderRadius: '3px', marginRight: '8px' }} />);

export const navigateToExternalUrl = (url: string, shouldOpenNewTab = true): Window | string =>
  (shouldOpenNewTab ? window.open(url, '_blank') : window.location.href = url);

export const formatPriceValue = (value: number): string => (`$${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`);
