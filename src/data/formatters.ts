import * as LocaleCurrency from 'locale-currency';

export const formatCurrency = (value: number | null) => {
  if (value == null) { return value }
  const locale = navigator.language || 'en-US';
  const currencyCode = LocaleCurrency.getCurrency(locale) || 'USD';
  return new Intl.NumberFormat(locale, { style: "currency", currency: currencyCode })
    .format(value);
}