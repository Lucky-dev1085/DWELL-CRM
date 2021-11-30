import React, { FC } from 'react';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons/faArrowUp';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons/faArrowDown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CardContainer, CardTitle, CardContent, CardRateContainer, CardRateSucess, CardRateFail } from './styles';

interface CardBtnProps {
  title: string,
  content: string,
  compare_rate: string,
  compare_val: string,
  compare_status: boolean,
  active: boolean,
  onClick: () => void,
}

const CardBtn: FC<CardBtnProps> = ({ title, content, compare_rate, compare_val, compare_status, active, onClick }) => (
  <CardContainer onClick={onClick} active={active}>
    <CardTitle>{title}</CardTitle>
    <CardContent>{content}</CardContent>
    <CardRateContainer>
      {compare_status ? (
        <CardRateSucess>
          {compare_rate}
          <FontAwesomeIcon icon={faArrowUp} />
        </CardRateSucess>
      ) : (
        <CardRateFail>
          {compare_rate}
          <FontAwesomeIcon icon={faArrowDown} />
        </CardRateFail>
      )}
      {compare_val}
    </CardRateContainer>
  </CardContainer>
);

CardBtn.defaultProps = {
  title: 'VISITORS',
  content: '3,000',
  compare_rate: '24.1%',
  compare_val: '785',
};

export default CardBtn;
