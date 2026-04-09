/**
 * Form-validation helpers for the My Fleet car rental app.
 */

/**
 * Validate an email address.
 * Uses a pragmatic regex that covers the vast majority of real-world addresses.
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email.trim());
}

/**
 * Validate a French phone number.
 * Accepts local (06 12 34 56 78) and international (+33 6 12 34 56 78) formats,
 * with or without spaces / dashes.
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[\s\-().]/g, '');

  // International format: +33 followed by 9 digits
  if (/^\+33\d{9}$/.test(digits)) {
    return true;
  }

  // Local format: 10 digits starting with 0
  if (/^0[1-9]\d{8}$/.test(digits)) {
    return true;
  }

  return false;
}

/**
 * Validate a French SIV license plate (AA-123-AA).
 * Accepts with or without dashes / spaces.
 */
export function isValidLicensePlate(plate: string): boolean {
  const cleaned = plate.replace(/[\s-]/g, '').toUpperCase();
  return /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(cleaned);
}

/**
 * Check that a string value is non-empty after trimming.
 */
export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}
