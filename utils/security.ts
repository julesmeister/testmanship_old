import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes user input to prevent XSS attacks and other malicious content
 * @param input - The user input to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Basic sanitization
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [] // No attributes allowed
  });

  // Additional security measures but preserve whitespace
  return sanitized
    .replace(/[<>]/g, '') // Remove any remaining angle brackets
    .replace(/\s+/g, ' '); // Normalize whitespace but don't remove it
}

/**
 * Validates that the input meets basic security requirements
 * @param input - The input to validate
 * @param options - Validation options
 * @returns Boolean indicating if input is valid
 */
export function validateInput(input: string, options: {
  maxLength?: number;
  minLength?: number;
  allowedChars?: RegExp;
} = {}): boolean {
  if (!input) return false;

  const {
    maxLength = 5000,
    minLength = 1,
    allowedChars = /^[\p{L}\p{N}\p{P}\p{Z}]+$/u
  } = options;

  if (input.length > maxLength || input.length < minLength) {
    return false;
  }

  return allowedChars.test(input);
}

/**
 * Escapes special characters in a string to prevent injection attacks
 * @param input - The string to escape
 * @returns Escaped string
 */
export function escapeSpecialChars(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
