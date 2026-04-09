/**
 * Formatting helpers — French-locale defaults for the My Fleet car rental app.
 */

const DEFAULT_CURRENCY = 'EUR';
const DEFAULT_LOCALE = 'fr-FR';

/**
 * Format a monetary amount.
 * Defaults to EUR with French locale (e.g. "1 234,56 EUR").
 */
export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date in French locale.
 *
 * - `'short'`    -> "08/04/2026"
 * - `'long'`     -> "8 avril 2026"
 * - `'relative'` -> "il y a 3 jours" / "dans 2 heures" (approximate)
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'long' | 'relative' = 'short',
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'relative') {
    return formatRelativeDate(d);
  }

  const options: Intl.DateTimeFormatOptions =
    format === 'long'
      ? { day: 'numeric', month: 'long', year: 'numeric' }
      : { day: '2-digit', month: '2-digit', year: 'numeric' };

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, options).format(d);
}

/**
 * Approximate French relative-time string.
 */
function formatRelativeDate(date: Date): string {
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const absDiffSeconds = Math.round(Math.abs(diffMs) / 1000);

  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
    { unit: 'year', seconds: 31_536_000 },
    { unit: 'month', seconds: 2_592_000 },
    { unit: 'week', seconds: 604_800 },
    { unit: 'day', seconds: 86_400 },
    { unit: 'hour', seconds: 3_600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  const rtf = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, { numeric: 'auto' });

  for (const { unit, seconds } of units) {
    if (absDiffSeconds >= seconds) {
      const value = Math.round(diffMs / 1000 / seconds);
      return rtf.format(value, unit);
    }
  }

  return rtf.format(0, 'second');
}

/**
 * Format a French phone number.
 * Input may be "+33612345678", "0612345678", or "06 12 34 56 78".
 * Output: "06 12 34 56 78".
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  // Normalise international prefix to local
  const local = digits.startsWith('33')
    ? '0' + digits.slice(2)
    : digits;

  if (local.length !== 10) {
    return phone; // return as-is if unexpected length
  }

  return local.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
}

/**
 * Format a mileage value with French thousands separator.
 * e.g. 45230 -> "45 230 km"
 */
export function formatMileage(km: number): string {
  const formatted = new Intl.NumberFormat(DEFAULT_LOCALE, {
    maximumFractionDigits: 0,
  }).format(km);

  return `${formatted} km`;
}

/**
 * Format a French license plate to the standard AA-123-AA pattern.
 * Accepts "AA123AA", "aa-123-aa", "AA 123 AA", etc.
 */
export function formatLicensePlate(plate: string): string {
  const cleaned = plate.replace(/[\s-]/g, '').toUpperCase();

  // Standard French SIV format: 2 letters, 3 digits, 2 letters
  const match = cleaned.match(/^([A-Z]{2})(\d{3})([A-Z]{2})$/);

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  // Return uppercased original if it doesn't match the expected pattern
  return plate.toUpperCase().trim();
}
