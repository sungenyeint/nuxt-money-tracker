import { CURRENCIES } from "~/constants/app";

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  if (!currency) return amount.toString();

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code
  }).format(amount);
}

export function formatPercentage(value: number): string {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}

export function formatDate(dateStr: string, format: string = 'YYYY-MM-DD'): string {
  const date = new Date(dateStr);

  // Handle invalid dates gracefully
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
    default:
      return `${year}-${month}-${day}`;
  }
}

