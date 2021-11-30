import React, { FC } from 'react';
import { Col } from 'reactstrap';
import Skeleton from 'react-loading-skeleton';
import { times } from 'lodash';
import { BreakdownItem, BreakdownLabel } from 'compete/views/styles';

interface BreakdownSkeletonProps {
  number: number,
  colSize?: number,
}

const BreakdownSkeleton: FC<BreakdownSkeletonProps> = ({ number, colSize = 3 }) => (
  <React.Fragment>
    {times(number, i => (
      <Col xs={colSize} className="p-x-10" key={i}>
        <BreakdownItem>
          <Skeleton width={100} height={30} style={{ borderRadius: '6px', marginBottom: '5px' }} />
          <BreakdownLabel>
            <Skeleton width={80} style={{ borderRadius: '6px' }} />
          </BreakdownLabel>
        </BreakdownItem>
      </Col>
    ))}
  </React.Fragment>
);

export default BreakdownSkeleton;
