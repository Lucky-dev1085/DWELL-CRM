import React, { FC } from 'react';
import { FormLabel, SubLabel } from 'dwell/views/Settings/DurationPricing/styles';
import CurrencyInput from 'react-currency-input-field';
import { leasingTypes } from 'dwell/constants';
import { Col, Row, Input } from 'reactstrap';
import { DurationPricing } from 'src/interfaces';
import { FormYesNoSwitch } from 'dwell/views/Settings/PropertyPolices/styles';

interface DurationComponentProps {
  handleChange: ({ target: { id, value } }) => void,
  handleCurrencyChange: (value: string, name: string) => void,
  formData: DurationPricing,
}

const DurationComponent: FC<DurationComponentProps> = ({ handleChange, handleCurrencyChange, formData }) => (
  <React.Fragment>
    <Row className="align-items-center mb-20 m-row-10">
      <Col sm={4} className="p-x-10"><FormLabel>Shortest lease term (months)</FormLabel></Col>
      <Col sm={3} className="p-x-10">
        <CurrencyInput
          id="shortest_lease_term"
          name="shortest_lease_term"
          value={formData.shortest_lease_term || undefined}
          onChange={handleCurrencyChange}
          className="form-control mb-0"
        />
      </Col>
    </Row>
    <Row className="align-items-center mb-20 m-row-10">
      <Col sm={4} className="p-x-10"><FormLabel>Longest lease term (months)</FormLabel></Col>
      <Col sm={3} className="p-x-10">
        <CurrencyInput
          id="longest_lease_term"
          name="longest_lease_term"
          value={formData.longest_lease_term || undefined}
          onChange={handleCurrencyChange}
          className="form-control mb-0"
        />
      </Col>
    </Row>
    <Row className="align-items-center m-row-10">
      <Col sm={4} className="p-x-10">
        <FormLabel>Offer month-to-month<br /><SubLabel>(after lease contract fulfilled)</SubLabel></FormLabel>
      </Col>
      <Col sm={3} className="p-x-10">
        <FormYesNoSwitch checked={formData.is_offer_month_to_month} onClick={() => handleChange({ target: { id: 'is_offer_month_to_month', value: !formData.is_offer_month_to_month } })} />
      </Col>
    </Row>
    {formData.is_offer_month_to_month &&
        <Row className="align-items-center m-row-10 mt-20">
          <Col sm={4} className="p-x-10">
            <FormLabel>Month-to-month premium</FormLabel>
          </Col>
          <Col className="p-x-10">
            <div className="d-flex align-items-center">
              <span className="d-block">base rent</span>
              <Input type="select" id="base_rent_type" className="mb-0 ml-2" value={formData.base_rent_type} onChange={handleChange} style={{ width: 120 }}>
                {Object.keys(leasingTypes.BASE_RENT_TYPES).map((key, index) =>
                  <option key={index} value={key}>{leasingTypes.BASE_RENT_TYPES[key]}</option>)}
              </Input>
              {formData.base_rent_type !== 'NO_PREMIUM' &&
            <>
              <CurrencyInput
                id="base_rent"
                name="base_rent"
                value={formData.base_rent || undefined}
                onChange={handleCurrencyChange}
                className="form-control mb-0 ml-2"
                style={{ width: 100 }}
              />
              <Input type="select" id="base_rent_measurement" className="mb-0 ml-2" value={formData.base_rent_measurement} onChange={handleChange} style={{ width: 150 }}>
                {Object.keys(leasingTypes.BASE_RENT_MEASUREMENT).map((key, index) =>
                  <option key={index} value={key}>{leasingTypes.BASE_RENT_MEASUREMENT[key]}</option>)}
              </Input>
              <span className="d-block ml-2">{formData.base_rent_type === 'MINUS' ? 'less' : 'more'} per month</span>
            </>}
            </div>
          </Col>
        </Row>}
  </React.Fragment>
);

export default DurationComponent;
