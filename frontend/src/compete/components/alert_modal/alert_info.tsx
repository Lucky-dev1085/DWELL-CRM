import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { Input, FormFeedback, CustomInput } from 'reactstrap';
import CurrencyInput from 'react-currency-input-field';
import Select from 'react-select';
import { get } from 'lodash';
import { CustomSelect } from 'src/common';
import { Alert, ExploreMarket } from 'src/interfaces';
import { reportSettingsFilters, multiSelectProps } from 'compete/constants';
import { conditionList, thresholdTypeList, trackedAssets, alertTypes, baselineList } from 'compete/constants/alert_modal';
import { FormLabel, AlertStatusText } from './styles';

interface AlertInfoProps {
  isEdit: boolean,
  submitIsClicked: boolean,
  handleChange: (key: string, value: string) => void,
  alert: Alert,
  alertType: string,
  assetsMarket: ExploreMarket[],
  setAssetsMarket: (data: ExploreMarket[]) => void,
  assetsSubmarket: ExploreMarket[],
  setAssetsSubmarket: (data: ExploreMarket[]) => void,
  customAssets: ExploreMarket[],
  setCustomAssets: (data: ExploreMarket[]) => void,
}

const AlertInfo: FC<AlertInfoProps> = ({ submitIsClicked, handleChange, alert, alertType, isEdit, assetsMarket, setAssetsMarket,
  assetsSubmarket, setAssetsSubmarket, customAssets, setCustomAssets }) => {
  const isSubmitting = useSelector(state => state.alert.isSubmitting);
  const exploreMarketsList = useSelector(state => state.exploreMarkets.exploreMarketsList);

  return (
    <React.Fragment>
      <div className="mb-3">
        <FormLabel>Name</FormLabel>
        <Input
          id="alertName"
          placeholder="Enter name"
          value={alert.name}
          onChange={e => handleChange('name', e.target.value)}
          disabled={isSubmitting}
          invalid={submitIsClicked && !alert.name}
        />
        <FormFeedback>{submitIsClicked && !alert.name && 'Please provide Alert name'}</FormFeedback>
      </div>
      {alertType === alertTypes.THRESHOLD &&
        <React.Fragment>
          <div className="mb-3">
            <FormLabel>Condition</FormLabel>
            <CustomSelect
              selected={alert.condition}
              optionList={conditionList}
              onChange={selected => handleChange('condition', selected)}
            />
            <div className="d-flex mt-20">
              <CustomSelect
                selected={alert.thresholdType}
                optionList={thresholdTypeList}
                onChange={selected => handleChange('thresholdType', selected)}
                className="w-75 mr-2"
              />
              <span className="mt-10">by</span>
              <CurrencyInput
                id="treshold-percent"
                value={alert.thresholdPercent || ''}
                onChange={value => handleChange('thresholdPercent', value)}
                className="form-control mb-0 mx-2 percent-input"
                placeholder="%"
              />
              <span className="mt-10">%</span>
            </div>
          </div>
          {alert.condition === 'Rent' &&
            <div className="mb-3">
              <FormLabel>Select unit types to monitor</FormLabel>
              <Select
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                backspaceRemovesValue={false}
                defaultValue={alert.unitTypes}
                options={reportSettingsFilters.showRentForOptions}
                onChange={selected => handleChange('unitTypes', selected)}
                isMulti
              />
            </div>}
          <div className="mb-3">
            <FormLabel>Baseline</FormLabel>
            {baselineList.map((item, i) => (
              <CustomInput
                key={`baseline-${i}`}
                value={item.label}
                type="radio"
                id={`baseline-${item.label}`}
                label={item.label}
                checked={alert.baseline === item.value}
                onChange={() => handleChange('baseline', item.value)}
                className="mb-5"
              />))}
          </div>
        </React.Fragment>
      }
      <div>
        <FormLabel>Select properties to {alertType === alertTypes.BENCHMARK ? 'benchmark' : 'monitor'}</FormLabel>
        <CustomInput
          value="markets"
          type="radio"
          id="asset_markets"
          label="Track all assets in a market(s)"
          checked={alert.trackedAssets === trackedAssets.MARKETS}
          onChange={() => handleChange('trackedAssets', trackedAssets.MARKETS)}
          className="mb-5"
        />
        {alert.trackedAssets === trackedAssets.MARKETS &&
          <Select
            {...multiSelectProps}
            defaultValue={assetsMarket}
            options={get(exploreMarketsList, 'markets', [])}
            onChange={e => setAssetsMarket(e)}
          />}
        <CustomInput
          value="submarkets"
          type="radio"
          id="asset_submarkets"
          label="Track all assets in a submarket(s)"
          checked={alert.trackedAssets === trackedAssets.SUBMARKETS}
          onChange={() => handleChange('trackedAssets', trackedAssets.SUBMARKETS)}
          className="mb-5"
        />
        {alert.trackedAssets === trackedAssets.SUBMARKETS &&
          <Select
            {...multiSelectProps}
            defaultValue={assetsSubmarket}
            options={get(exploreMarketsList, 'submarkets', [])}
            onChange={e => setAssetsSubmarket(e)}
          />}
        <CustomInput
          value="custom"
          type="radio"
          id="asset_custom"
          label="Track custom set of assets"
          checked={alert.trackedAssets === trackedAssets.CUSTOM}
          onChange={() => handleChange('trackedAssets', trackedAssets.CUSTOM)}
          className="mb-5"
        />
        {alert.trackedAssets === trackedAssets.CUSTOM &&
          <Select
            {...multiSelectProps}
            defaultValue={customAssets}
            options={get(exploreMarketsList, 'properties', [])}
            onChange={e => setCustomAssets(e)}
          />}
      </div>
      {isEdit &&
      <div className="mt-3">
        <FormLabel>Status</FormLabel>
        <CustomInput
          value="active"
          type="radio"
          id="status_active"
          label="Active"
          checked={alert.status === 'ACTIVE'}
          onChange={() => handleChange('status', 'ACTIVE')}
          className="mb-5"
        />
        <AlertStatusText>Dwell will continue to generate data for this alert and notify you.</AlertStatusText>
        <CustomInput
          value="pause"
          type="radio"
          id="status_pause"
          label="Pause"
          checked={alert.status === 'INACTIVE'}
          onChange={() => handleChange('status', 'INACTIVE')}
          className="mb-5"
        />
        <AlertStatusText>Dwell will pause all activity including generating data for this alert.</AlertStatusText>
      </div>
      }
    </React.Fragment>
  );
};

export default AlertInfo;
