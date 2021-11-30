import React, { useEffect, useState, FC } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import leaseAction from 'dwell/actions/lease';
import { ContentText, ContentTitleSm, Divider } from 'dwell/views/Settings/styles';
import { isEmpty } from 'lodash';
import { DurationPricing } from 'src/interfaces';
import { toast, ToastOptions } from 'react-toastify';
import { toastOptions } from 'site/constants';
import 'src/scss/pages/_assign_lead_owners.scss';
import 'src/scss/pages/_business_hours.scss';
import 'src/scss/pages/_email_template.scss';
import PricingComponent from 'dwell/views/Settings/DurationPricing/Components/pricing';
import DurationComponent from 'dwell/views/Settings/DurationPricing/Components/duration';

import { SectionDivider, PolicyWrapper, ContentSubtitle, SettingsGroup } from './styles';

const DurationPricing: FC<RouteComponentProps> = () => {
  const [formData, setFormData] = useState({
    is_offer_month_to_month: false,
    base_rent_type: 'PLUS',
    base_rent_measurement: 'FIXED',
    pricing_term: 'DYNAMIC',
    term_premiums: [],
  } as DurationPricing);

  const dispatch = useDispatch();
  const durationPricing = useSelector(state => state.lease.durationPricing);
  const isSubmitting = useSelector(state => state.lease.isSubmitting);
  const { saveDurationPricing } = leaseAction;

  useEffect(() => {
    if (!isEmpty(durationPricing)) {
      setFormData(durationPricing);
    }
  }, [durationPricing]);

  const handleSave = () => {
    dispatch(saveDurationPricing(formData, () => toast.success('Duration pricing saved', toastOptions as ToastOptions)));
  };

  const handleCurrencyChange = (value, name) => {
    setFormData({ ...formData, [name]: Number(value) || null });
  };

  const handleChange = ({ target: { id, value } }) => {
    setFormData({ ...formData, [id]: value });
  };

  const handleChangeTermPremiums = (month, field, value) => {
    const termPremiums = formData.term_premiums.map((term) => {
      let newTerm = { ...term };
      if (newTerm.month === month) {
        newTerm = { ...newTerm, [field]: value };
      }
      return newTerm;
    });
    setFormData({ ...formData, term_premiums: termPremiums });
  };

  useEffect(() => {
    if (formData.shortest_lease_term && formData.longest_lease_term) {
      const termPremiums = [];
      if ((formData.longest_lease_term - formData.shortest_lease_term) >= 0) {
        new Array((formData.longest_lease_term - formData.shortest_lease_term) + 1)
          .fill(0).map((item, index) => (index + formData.shortest_lease_term)).forEach((month) => {
            const termPremium = formData.term_premiums.find(term => term.month === month);
            if (!termPremium) {
              let rent_type = 'NO_PREMIUM';
              if (month <= 12) {
                rent_type = month < 12 ? 'PLUS' : 'NO_PREMIUM';
              }
              termPremiums.push({
                month,
                base_rent_type: rent_type,
                base_rent: null,
                base_rent_measurement: 'FIXED',
              });
            } else {
              termPremiums.push(termPremium);
            }
          });
        setFormData({ ...formData, term_premiums: termPremiums });
      }
    }
  }, [formData.shortest_lease_term, formData.longest_lease_term]);

  return (
    <PolicyWrapper>
      <ContentTitleSm>Duration Pricing</ContentTitleSm>
      <ContentText>Define pricing for lease durations less than or greater than 12 months.</ContentText>
      <Divider />
      <ContentSubtitle>Duration</ContentSubtitle>
      <SettingsGroup>
        <DurationComponent
          handleChange={handleChange}
          handleCurrencyChange={handleCurrencyChange}
          formData={formData}
        />
      </SettingsGroup>
      <SectionDivider className="mt-4 mb-4" />
      <ContentSubtitle>Pricing</ContentSubtitle>
      <SettingsGroup>
        <PricingComponent
          handleChange={handleChange}
          handleCurrencyChange={handleCurrencyChange}
          handleChangeTermPremiums={handleChangeTermPremiums}
          formData={formData}
        />
      </SettingsGroup>
      <Button color="primary" onClick={() => handleSave()} disabled={isSubmitting}>Save Changes</Button>
    </PolicyWrapper>
  );
};

export default withRouter(DurationPricing);
