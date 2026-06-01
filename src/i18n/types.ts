export type Locale = 'ja' | 'en' | 'vi'

export const LOCALES: Locale[] = ['ja', 'en', 'vi']

export const LANG_META: Record<Locale, { flag: string; label: string; htmlLang: string }> = {
  ja: { flag: '🇯🇵', label: '日本語', htmlLang: 'ja' },
  en: { flag: '🇬🇧', label: 'English', htmlLang: 'en' },
  vi: { flag: '🇻🇳', label: 'Tiếng Việt', htmlLang: 'vi' },
}

/** A translation table: one entry per locale, each a flat key→string map. */
export type Dictionary = Record<Locale, Record<string, string>>
