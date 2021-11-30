import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { leasingTypes } from 'dwell/constants';
import { FormLabel, SubLabel } from 'dwell/views/Settings/DurationPricing/styles';
import CurrencyInput from 'react-currency-input-field';
import { Col, Row, Input } from 'reactstrap';
import promotionActions from 'site/actions/promotion';
import { formatPriceValue } from 'src/utils';
import { DurationPricing } from 'src/interfaces';
import { isEmpty } from 'lodash';
import { FormYesNoSwitch } from 'dwell/views/Settings/PropertyPolices/styles';
import { calculateExamplePricing } from '../_utils';

interface PricingComponentProps {
  handleChange: ({ target: { id, value } }) => void,
  handleCurrencyChange: (value: string, name: string) => void,
  handleChangeTermPremiums: (month: number, field: string, value: string) => void,
  formData: DurationPricing,
}

const PricingComponent: FC<PricingComponentProps> = ({ handleChange, handleCurrencyChange, handleChangeTermPremiums, formData }) => {
  const [selectedFloorPlan, setSelectedFloorPlan] = useState(null);
  const currentProperty = useSelector(state => state.property.property);
  const currentPropertyPromotions = useSelector(state => state.promotion.promotions);
  const dispatch = useDispatch();

  const { getPromotions } = promotionActions;

  useEffect(() => {
    dispatch(getPromotions());
  }, []);

  useEffect(() => {
    if (!isEmpty(currentProperty) && !isEmpty(currentProperty.floor_plans)) {
      setSelectedFloorPlan(currentProperty.floor_plans[0].id);
    }
  }, [currentProperty]);

  return (
    <React.Fragment>
      <Input type="select" id="pricing_term" className="mb-30" value={formData.pricing_term} onChange={handleChange} style={{ width: 200 }}>
        {Object.keys(leasingTypes.PRICING_TERM).map(key =>
          <option value={key}>{leasingTypes.PRICING_TERM[key]}</option>)}
      </Input>
      {formData.pricing_term === 'DYNAMIC' ?
        <div className="mb-20">
          <h6 className="mb-20">Formula Inputs</h6>
          <Row className="align-items-center mb-20 m-row-10">
            <Col sm={4} className="p-x-10"><FormLabel>Average turnover time</FormLabel></Col>
            <Col sm={3} className="p-x-10">
              <CurrencyInput
                id="avg_turnover_time"
                name="avg_turnover_time"
                value={formData.avg_turnover_time || undefined}
                onChange={handleCurrencyChange}
                className="form-control mb-0"
                placeholder="days"
              />
            </Col>
          </Row>
          <Row className="align-items-center mb-20 m-row-10">
            <Col sm={4} className="p-x-10"><FormLabel>Average turnover costs</FormLabel></Col>
            <Col sm={3} className="p-x-10">
              <CurrencyInput
                id="avg_turnover_costs"
                name="avg_turnover_costs"
                value={formData.avg_turnover_costs || undefined}
                onChange={handleCurrencyChange}
                className="form-control mb-0"
                prefix="$"
                placeholder="$"
              />
            </Col>
          </Row>
          <Row className="align-items-center m-row-10">
            <Col sm={4} className="p-x-10">
              <FormLabel>Offer discounts for longer lease terms<br /><SubLabel>(lease lengths greater than 12 months)</SubLabel></FormLabel>
            </Col>
            <Col sm={3} className="p-x-10">
              <FormYesNoSwitch
                checked={formData.is_offer_discounts}
                onClick={() => handleChange({ target: { id: 'is_offer_discounts', value: !formData.is_offer_discounts } })}
              />
            </Col>
          </Row>
          {[formData.shortest_lease_term, formData.longest_lease_term, formData.avg_turnover_costs, formData.avg_turnover_time].every(field => ![null, undefined].includes(field)) &&
          <>
            <h6 className="mb-20 mt-30">Example Pricing</h6>
            <Input type="select" id="floor_plan" className="mb-30" value={selectedFloorPlan} onChange={({ target: { value } }) => setSelectedFloorPlan(Number(value))} style={{ width: 300 }}>
              {currentProperty.floor_plans.map(floor_Plan =>
                <option value={floor_Plan.id}>{`${floor_Plan.plan} - ${formatPriceValue(floor_Plan.max_rent)} / month`}</option>)}
            </Input>
            {!!selectedFloorPlan &&
            <div className="mt-20">
              {
                (formData.longest_lease_term - formData.shortest_lease_term) >= 0 &&
                new Array((formData.longest_lease_term - formData.shortest_lease_term) + 1)
                  .fill(0).map((item, index) => {
                    const month = index + formData.shortest_lease_term;
                    const floor_plan = currentProperty.floor_plans.find(fp => fp.id === selectedFloorPlan);
                    const monthlyRent = floor_plan.max_rent;
                    const promotion = currentPropertyPromotions.find((prom) => {
                      if (prom.floor_plans.includes(floor_plan.id) && prom.is_active) {
                        return true;
                      }
                      if (prom.is_active && !prom.floor_plans.length) {
                        switch (floor_plan.bedrooms) {
                          case 0:
                            return prom.unit_types.includes('STUDIO');
                          case 1:
                            return prom.unit_types.includes('ONE_BEDROOM');
                          case 2:
                            return prom.unit_types.includes('TWO_BEDROOM');
                          case 3:
                            return prom.unit_types.includes('THREE_BEDROOM');
                          case 4:
                            return prom.unit_types.includes('FOUR_BEDROOM');
                          default:
                            return false;
                        }
                      }
                      return false;
                    });
                    const { change, currentMonthlyRent } = calculateExamplePricing(monthlyRent, formData.avg_turnover_costs, formData.avg_turnover_time, month, promotion, formData.is_offer_discounts);
                    return (
                      <Row className="align-items-center m-row-10 pt-3 pb-3" style={{ borderTop: index !== 0 ? '1px solid #e2e7f4' : '' }}>
                        <Col sm={3} className="p-x-10">
                          <FormLabel>{`${month} ${month > 1 ? 'months' : 'month'}`}</FormLabel>
                        </Col>
                        <Col sm={4} className="p-x-10">
                          <FormLabel>{formatPriceValue(currentMonthlyRent)}</FormLabel>
                        </Col>
                        <Col className="p-x-10">
                          {
                            change >= 0 ?
                              <FormLabel>{change > 0 ? `${change}% more per month` : 'no premium'}</FormLabel>
                              :
                              <FormLabel>{ `${Math.abs(change)}% less per month`}</FormLabel>
                          }
                        </Col>
                      </Row>);
                  })}
            </div>}
          </>}
        </div> :
        <div className="mb-20">
          <h6 className="mb-20">Term Premiums</h6>
          {[formData.shortest_lease_term, formData.longest_lease_term].every(field => ![null, undefined].includes(field)) && !isEmpty(formData.term_premiums) &&
          <>
            {
              (formData.longest_lease_term - formData.shortest_lease_term) >= 0 &&
              new Array((formData.longest_lease_term - formData.shortest_lease_term) + 1)
                .fill(0).map((item, index) => {
                  const month = index + formData.shortest_lease_term;
                  const term_premium = formData.term_premiums.find(term => term.month === month);
                  if (!term_premium) return null;
                  return (
                    <Row className="align-items-center m-row-10 pt-3 pb-3" style={{ borderTop: index !== 0 ? '1px solid #e2e7f4' : '' }}>
                      <Col sm={3} className="p-x-10">
                        <FormLabel>{`${month} ${month > 1 ? 'months' : 'month'}`}</FormLabel>
                      </Col>
                      <Col className="p-x-10">
                        <div className="d-flex align-items-center">
                          <span className="d-block">base rent</span>
                          <Input type="select" id="base_rent_type" className="mb-0 ml-2" value={term_premium.base_rent_type} onChange={({ target: { value, id } }) => handleChangeTermPremiums(month, id, value)} style={{ width: 120 }}>
                            {Object.keys(leasingTypes.BASE_RENT_TYPES).map(key =>
                              <option value={key}>{leasingTypes.BASE_RENT_TYPES[key]}</option>)}
                          </Input>
                          {term_premium.base_rent_type !== 'NO_PREMIUM' &&
                          <>
                            <CurrencyInput
                              id="base_rent"
                              name="base_rent"
                              value={term_premium.base_rent || undefined}
                              onChange={(value, name) => handleChangeTermPremiums(month, name, value)}
                              className="form-control mb-0 ml-2"
                              style={{ width: 100 }}
                            />
                            <Input type="select" id="base_rent_measurement" className="mb-0 ml-2" value={term_premium.base_rent_measurement} onChange={({ target: { value, id } }) => handleChangeTermPremiums(month, id, value)} style={{ width: 150 }}>
                              {Object.keys(leasingTypes.BASE_RENT_MEASUREMENT).map(key =>
                                <option value={key}>{leasingTypes.BASE_RENT_MEASUREMENT[key]}</option>)}
                            </Input>
                            <span className="d-block ml-2">{term_premium.base_rent_type === 'MINUS' ? 'less' : 'more'} per month</span>
                          </>}
                        </div>
                      </Col>
                    </Row>);
                })}
          </>}
        </div>}
    </React.Fragment>
  );
};

export default PricingComponent;
