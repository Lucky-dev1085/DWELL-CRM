import { PromotionProps } from 'src/interfaces';

export const calculateExamplePricing = (
  monthlyRent: number, avgTurnoverCosts: number, avgTurnoverTime: number,
  month: number, promotion: PromotionProps, isDiscounted: boolean,
): {change: number, currentMonthlyRent: number} => {
  let concession = 0;
  if (promotion) {
    switch (promotion.lease_duration_modifier) {
      case 'More than':
        concession = month > promotion.lease_duration ? promotion.dollar_value : concession;
        break;
      case 'Less than':
        concession = month < promotion.lease_duration ? promotion.dollar_value : concession;
        break;
      case 'Exactly':
        concession = month === promotion.lease_duration ? promotion.dollar_value : concession;
        break;
      case 'All months':
        concession = promotion.dollar_value;
        break;
    }
  }
  const effectiveRent = monthlyRent ? Math.round(monthlyRent - ((concession + avgTurnoverCosts) / 12)) : 0;
  const loss_percent = (avgTurnoverTime / 30.4);
  const loss_dollar = Math.round(effectiveRent * loss_percent);
  let premium = loss_dollar ? Math.round(loss_dollar - (loss_dollar / (12 / month))) : 0;
  premium = month > 12 ? -Math.round(loss_dollar / 12) : premium;
  let currentMonthlyRent = monthlyRent + premium;
  if (month > 12) {
    currentMonthlyRent = isDiscounted ? monthlyRent + premium : monthlyRent;
  }
  const change = monthlyRent ? Math.round((((currentMonthlyRent / monthlyRent) - 1) + Number.EPSILON) * 100 * 10) / 10 : 0;
  return { change, currentMonthlyRent };
};
