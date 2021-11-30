import React, { useEffect, useState, FC } from 'react';
import { useSelector, connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import Select from 'react-select';
import actions from 'compete/actions';
import { toast, ToastOptions } from 'react-toastify';
import { toastOptions } from 'site/constants';
import { ContentText, ContentTitleSm, FormLabel } from 'dwell/views/Settings/styles';
import { CustomSelect } from 'src/common';
import { ExploreMarketsList, PropertyProps, MarketEnvironment, ExploreMarket, ListResponse } from 'src/interfaces';
import { selectProperties } from 'compete/reducers/properties';
import { SectionDivider, SelectWrapper, ErrorMessage } from './styles';

interface CompetitorProps extends RouteComponentProps {
  getExploreMarketsList: () => void,
  isExploreMarketsLoaded: boolean,
  exploreMarketsList: ExploreMarketsList,
  settingsActiveTab: string,
  tab: string,
  isShow: boolean,
  setIsShow: (show: boolean) => void,
  getPropertiesCompetitors: (id: number) => Promise<ListResponse>,
  getProperties: () => Promise<ListResponse>,
  saveMarketEnvironment: (id: number, data: MarketEnvironment, msg: () => void) => void,
  currentProperty: PropertyProps,
  isSubmitting: boolean,
}

const Competitor: FC<CompetitorProps> = ({ settingsActiveTab, tab, setIsShow, getExploreMarketsList, isExploreMarketsLoaded, exploreMarketsList,
  getPropertiesCompetitors, currentProperty, isSubmitting, saveMarketEnvironment, getProperties }) => {
  const [marketId, setMarketId] = useState({} as ExploreMarket);
  const [submarketId, setSubmarketId] = useState({} as ExploreMarket);
  const [competitors, setCompetitors] = useState([] as ExploreMarket[]);
  const [submitIsClicked, updateSubmitIsClicked] = useState(false);
  const properties = useSelector(selectProperties);

  useEffect(() => {
    getExploreMarketsList();
    getPropertiesCompetitors(currentProperty.competitor_property).then(({ result: { data: { results } } }) => {
      if (currentProperty.competitors) {
        const selectedCompetitors = results.filter(el => currentProperty.competitors.includes(el.id)) as ExploreMarket[];
        setCompetitors(selectedCompetitors);
      }
    });
    getProperties();
  }, []);

  useEffect(() => {
    if (exploreMarketsList) {
      if (currentProperty.market) {
        setMarketId(exploreMarketsList.markets.find(el => el.id === currentProperty.market) || {} as ExploreMarket);
      }

      if (currentProperty.submarket) {
        setSubmarketId(exploreMarketsList.submarkets.find(el => el.id === currentProperty.submarket) || {} as ExploreMarket);
      }
    }
  }, [exploreMarketsList]);

  useEffect(() => {
    if (settingsActiveTab !== tab) {
      setIsShow(false);
    }
  }, [settingsActiveTab, tab]);

  const handleSave = () => {
    updateSubmitIsClicked(true);

    if (marketId.id && submarketId.id && competitors.length) {
      saveMarketEnvironment(currentProperty.competitor_property, {
        market: marketId.id,
        submarket: submarketId.id,
        competitors: competitors.map(el => el.id),
      }, () => toast.success('Market Environment saved', toastOptions as ToastOptions));
      updateSubmitIsClicked(false);
    }
  };

  const content = (
    <React.Fragment>
      <ContentTitleSm>Market Environment</ContentTitleSm>
      <ContentText>Define your market, submarket, and competitor set.</ContentText>
      <Row className="mt-30 align-items-center m-row-10">
        <Col xs="5" className="p-x-10"><FormLabel>Market</FormLabel></Col>
        <Col xs="7" className="p-x-10">
          <CustomSelect
            selected={marketId}
            optionList={isExploreMarketsLoaded ? exploreMarketsList.markets : []}
            onChange={selected => setMarketId(selected)}
            fieldName="name"
          />
        </Col>
      </Row>
      <SectionDivider />
      <Row className="mt-30 align-items-center m-row-10">
        <Col xs="5" className="p-x-10"><FormLabel>Submarket</FormLabel></Col>
        <Col xs="7" className="p-x-10">
          <CustomSelect
            selected={submarketId}
            optionList={isExploreMarketsLoaded ? exploreMarketsList.submarkets : []}
            onChange={selected => setSubmarketId(selected)}
            fieldName="name"
          />
        </Col>
      </Row>
      <SectionDivider />
      <Row className="mt-30 align-items-center m-row-10">
        <Col xs="5" className="p-x-10"><FormLabel>Competitors</FormLabel></Col>
        <Col xs="7" className="p-x-10">
          <SelectWrapper>
            <Select
              closeMenuOnSelect={false}
              isMulti
              value={competitors}
              options={properties}
              hideSelectedOptions={false}
              backspaceRemovesValue={false}
              onChange={e => setCompetitors(e)}
              getOptionLabel={option => option.name}
              getOptionValue={option => option.id}
              className="mb-5"
            />
          </SelectWrapper>
        </Col>
      </Row>
      <SectionDivider />
    </React.Fragment>
  );

  return (
    <React.Fragment>
      {content}
      {submitIsClicked && <ErrorMessage>Please choose all items</ErrorMessage>}
      <Button color="primary" onClick={handleSave} disabled={isSubmitting}>Save Changes</Button>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  isExploreMarketsLoaded: state.exploreMarkets.isExploreMarketsLoaded,
  exploreMarketsList: state.exploreMarkets.exploreMarketsList,
  currentProperty: state.property.property,
  isSubmitting: state.properties.isSubmitting,
});

export default connect(
  mapStateToProps,
  {
    ...actions.exploreMarkets,
    ...actions.properties,
  },
)(withRouter(Competitor));
