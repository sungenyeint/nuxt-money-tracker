export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

export function formatPercentage(value: number) {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}
