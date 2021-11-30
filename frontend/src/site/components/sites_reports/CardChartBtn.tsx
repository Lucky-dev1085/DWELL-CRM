import React, { FC, useEffect, useState } from 'react';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons/faArrowUp';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons/faArrowDown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Charts from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'fusioncharts/react-fusioncharts';
import FusionCharts from 'fusioncharts/fusioncharts';

import { CardChartContainer, CardTitle, CardChartRateContainer, CardChartRateSucess, CardChartRateFail } from './styles';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface CardChartBtnProps {
  title: string,
  content: number,
  compare_rate: string,
  compare_val: string,
  content_color: string,
  compare_status: boolean,
  active: boolean,
  onClick: () => void,
}

const CardChartBtn: FC<CardChartBtnProps> = ({ title, content, compare_rate, compare_val, content_color, compare_status, active, onClick }) => {
  const [chartContent, setChartContent] = useState('');
  useEffect(() => {
    let label = content.toString();
    label += ' %';

    setChartContent(label);
  }, [content]);

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i += 1) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const datasource = {
    chart: {
      showLegend: '0',
      showValues: '0',
      showLabels: '0',
      showToolTip: 0,
      usedataplotcolorforlabels: '1',
      theme: 'fusion',
      decimals: 1,
      defaultCenterLabel: chartContent,
      pieRadius: 36,
      doughnutRadius: 30,
      enableSlicing: 0,
      plotHoverEffect: 0,
    },
    data: [
      {
        label: 'value',
        value: content,
        color: content_color,
      },
      {
        label: 'tmp',
        value: 100 - content,
        color: '#e1e6f7',
      },
    ],
  };

  const chartConfigs = {
    type: 'doughnut2d',
    width: '100%',
    height: 90,
    dataFormat: 'json',
    dataSource: datasource,
  };

  return (
    <CardChartContainer onClick={onClick} active={active}>
      <CardTitle>{title}</CardTitle>
      <ReactFC
        {...chartConfigs}
      />
      <CardChartRateContainer>
        {compare_status ? (
          <CardChartRateSucess>
            {compare_rate}
            <FontAwesomeIcon icon={faArrowUp} />
          </CardChartRateSucess>
        ) : (
          <CardChartRateFail>
            {compare_rate}
            <FontAwesomeIcon icon={faArrowDown} />
          </CardChartRateFail>
        )}
        {compare_val}
      </CardChartRateContainer>
    </CardChartContainer>
  );
};

CardChartBtn.defaultProps = {
  title: 'VISITORS',
  content: 15,
  compare_rate: '24.1%',
  compare_val: '785',
};

export default CardChartBtn;
