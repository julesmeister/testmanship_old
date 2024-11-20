/**
 * Language codes and their full names
 * ISO 639-1 language codes: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 */

export type LanguageCode = 'DE' | 'EN' | 'ES' | 'FR' | 'IT' | 'PT' | 'NL' | 'RU' | 'ZH' | 'JA' | 'KO';

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  'DE': 'German',
  'EN': 'English',
  'ES': 'Spanish',
  'FR': 'French',
  'IT': 'Italian',
  'PT': 'Portuguese',
  'NL': 'Dutch',
  'RU': 'Russian',
  'ZH': 'Chinese',
  'JA': 'Japanese',
  'KO': 'Korean'
} as const;

export const DEFAULT_LANGUAGE: LanguageCode = 'EN';

/**
 * Get the full language name from a language code
 * @param code Language code (case insensitive)
 * @returns Full language name or default language name if code is invalid
 */
export function getLanguageName(code: string): string {
  const upperCode = code.toUpperCase() as LanguageCode;
  return LANGUAGE_NAMES[upperCode] || LANGUAGE_NAMES[DEFAULT_LANGUAGE];
}

/**
 * Check if a language code is supported
 * @param code Language code to check (case insensitive)
 * @returns true if language is supported
 */
export function isLanguageSupported(code: string): boolean {
  return code.toUpperCase() in LANGUAGE_NAMES;
}
