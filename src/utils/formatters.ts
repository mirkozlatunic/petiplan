export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return formatCurrency(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Parses a date string (YYYY-MM-DD or ISO) in local time to avoid UTC-offset shift.
 * new Date("2025-01-15") is midnight UTC, which is the previous calendar day in UTC- timezones.
 */
function parseDateLocal(isoString: string): Date {
  const datePart = isoString.split('T')[0];
  const parts = datePart.split('-').map(Number);
  if (parts.length === 3 && !parts.some(isNaN)) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(isoString);
}

export function formatDate(isoString: string): string {
  if (!isoString) return '';
  return parseDateLocal(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export { parseDateLocal };

export function formatDuration(days: number): string {
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''}`;
  const weeks = Math.floor(days / 7);
  const remaining = days % 7;
  const parts = [`${weeks} week${weeks !== 1 ? 's' : ''}`];
  if (remaining > 0) parts.push(`${remaining} day${remaining !== 1 ? 's' : ''}`);
  return parts.join(', ');
}
