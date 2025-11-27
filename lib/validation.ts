// ============================================
// Norwegian Validation Utilities
// ============================================

/** Validate Norwegian phone number (8 digits, optional +47 prefix) */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, "");
  return /^(\+47)?[0-9]{8}$/.test(cleaned);
}

/** Validate Norwegian postal code (4 digits) */
export function isValidPostalCode(code: string): boolean {
  return /^[0-9]{4}$/.test(code);
}

/** Validate email address */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validate Norwegian organization number (9 digits) */
export function isValidOrgNumber(orgNumber: string): boolean {
  const cleaned = orgNumber.replace(/\s/g, "");
  return /^[0-9]{9}$/.test(cleaned);
}

// ============================================
// Form Field Validators
// ============================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePhone(phone: string): ValidationResult {
  if (!phone.trim()) {
    return { valid: false, error: "Telefonnummer er påkrevd" };
  }
  if (!isValidPhone(phone)) {
    return { valid: false, error: "Ugyldig telefonnummer (8 siffer)" };
  }
  return { valid: true };
}

export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { valid: false, error: "E-post er påkrevd" };
  }
  if (!isValidEmail(email)) {
    return { valid: false, error: "Ugyldig e-postadresse" };
  }
  return { valid: true };
}

export function validatePostalCode(code: string): ValidationResult {
  if (!code.trim()) {
    return { valid: false, error: "Postnummer er påkrevd" };
  }
  if (!isValidPostalCode(code)) {
    return { valid: false, error: "Ugyldig postnummer (4 siffer)" };
  }
  return { valid: true };
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value.trim()) {
    return { valid: false, error: `${fieldName} er påkrevd` };
  }
  return { valid: true };
}

export function validateMinLength(value: string, minLength: number, fieldName: string): ValidationResult {
  if (value.length < minLength) {
    return { valid: false, error: `${fieldName} må være minst ${minLength} tegn` };
  }
  return { valid: true };
}

// ============================================
// Format helpers (for display/input)
// ============================================

/** Format phone number for display: "912 34 567" */
export function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, "").replace(/^47/, "");
  if (cleaned.length !== 8) return phone;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}`;
}

/** Format org number for display: "123 456 789" */
export function formatOrgNumberDisplay(orgNumber: string): string {
  const cleaned = orgNumber.replace(/\D/g, "");
  if (cleaned.length !== 9) return orgNumber;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
}
