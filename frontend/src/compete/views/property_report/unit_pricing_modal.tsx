import React, { useState, useEffect, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Skeleton from 'react-loading-skeleton';
import Charts from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'fusioncharts/react-fusioncharts';
import FusionCharts from 'fusioncharts/fusioncharts';
import moment from 'moment';
import { get } from 'lodash';
import { unitTypeLabels, chartConfigs } from 'compete/constants';
import propertiesAction from 'compete/actions/properties';
import { CompeteEmpty } from 'compete/components';
import { UnitSession } from 'src/interfaces';
import { ModalWindow, ModalBody, ModalSidebar, SidebarLabel, SessionList, SessionItem, UnitPricingTitle, Badge, ButtonClose, Divider, UnitInfoList,
  UnitInfoWrapper, InfoIcon, InfoBody, InfoTitle, InfoContent, ChartLabel, ChartWrapper } from './styles';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

interface UnitPricingModalProps {
  isModalOpen: boolean,
  unitInfo: { id: number, session: UnitSession[] },
  handleClose: () => void,
  isOnMarket?: boolean,
}

const unitInfoList = [
  { icon: 'ri-home-5-line', label: 'Unit Type', field: 'unit_type', type: 'unit' }, { icon: 'ri-ruler-line', label: 'Unit Size (SqFt)', field: 'unit_size' },
  { icon: 'ri-calendar-todo-line', label: 'Start Listing Date', field: 'start_listing_date', type: 'date' }, { icon: 'ri-calendar-line', label: 'End Listing Date', field: 'end_listing_date', type: 'date' },
  { icon: 'ri-calendar-event-line', label: 'Days on Market', field: 'days_on_market' },
];

const UnitPricingModal: FC<UnitPricingModalProps> = ({ isModalOpen, unitInfo, handleClose, isOnMarket }) => {
  const [currentSession, setSession] = useState(null);
  const dispatch = useDispatch();
  const isSessionLoaded = useSelector(state => state.properties.isSessionLoaded);
  const sessionInfo = useSelector(state => state.properties.sessionInfo);

  useEffect(() => {
    if ((unitInfo.session || []).length) {
      setSession(unitInfo.session[0]);
    }
  }, []);

  useEffect(() => {
    if (currentSession && currentSession.id) {
      const { getSessionDetailById } = propertiesAction;
      dispatch(getSessionDetailById(currentSession.id));
    }
  }, [currentSession]);

  const prepareData = data => data.map(el => ({ value: el.rent, start_date: el.scrapping_date }));
  const isRotateLabel = get(sessionInfo, 'unit_pricing', []).length > 12;

  return (
    <ModalWindow isOpen={isModalOpen} toggle={handleClose} centered>
      <ButtonClose onClick={handleClose}>
        <span>×</span>
      </ButtonClose>
      {currentSession ?
        <React.Fragment>
          <ModalSidebar>
            <SidebarLabel>Sessions</SidebarLabel>
            <SessionList>
              {unitInfo.session.map((el, index) => {
                const isCurrentSession = isOnMarket && !el.end_listing_date;
                const title = isCurrentSession ? 'Current Session' : `${moment(el.start_listing_date).format('L')} - ${moment(el.end_listing_date).format('L')}`;
                const isSelected = el.id === currentSession.id;
                return (
                  <SessionItem key={index} selected={isSelected} onClick={() => setSession(el)}>
                    <i className={isCurrentSession ? 'ri-time-line' : 'ri-calendar-todo-line'} />
                    {title}
                  </SessionItem>
                );
              })}
            </SessionList>
          </ModalSidebar>
          <ModalBody>
            <UnitPricingTitle>
              {isSessionLoaded ?
                <React.Fragment>
                  <h2>Unit #<strong>{unitInfo.id}</strong></h2>
                  <Badge success={isOnMarket}>
                    {isOnMarket ? 'On' : 'Off'} market
                    <i className={isOnMarket ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'} />
                  </Badge>
                </React.Fragment> :
                <Skeleton width={600} height={28} style={{ borderRadius: '6px' }} />}
            </UnitPricingTitle>
            <Divider />
            <UnitInfoList>
              {unitInfoList.map((el, index) => (
                isSessionLoaded ?
                  <UnitInfoWrapper key={index}>
                    <InfoIcon><i className={el.icon} /></InfoIcon>
                    <InfoBody>
                      <InfoTitle>{el.label}</InfoTitle>
                      <InfoContent>
                        {el.type === 'unit' && unitTypeLabels[sessionInfo[el.field]]}
                        {el.type === 'date' && (!sessionInfo[el.field] && el.field === 'end_listing_date' ? '-' : moment(sessionInfo[el.field]).format('L'))}
                        {!el.type && Math.round(sessionInfo[el.field])}
                      </InfoContent>
                    </InfoBody>
                  </UnitInfoWrapper> :
                  <Skeleton width={108} height={65} style={{ borderRadius: '6px', marginRight: '8px' }} key={index} />
              ))}
            </UnitInfoList>
            <ChartLabel>Unit Pricing</ChartLabel>
            <ChartWrapper>
              {isSessionLoaded ?
                <ReactFC {...chartConfigs(prepareData(sessionInfo.unit_pricing), true, isRotateLabel, 'currency', true)} /> :
                <Skeleton width="100%" height="100%" style={{ borderRadius: '6px' }} />}
            </ChartWrapper>
          </ModalBody>
        </React.Fragment> :
        <div className="mx-auto">
          <CompeteEmpty
            title="No Session Info"
            text="This unit has no session info yet"
            icon="ri-calendar-line"
          />
        </div>}
    </ModalWindow>
  );
};

export default UnitPricingModal;
