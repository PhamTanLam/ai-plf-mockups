import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Locale } from '@/i18n/types'
import { LANG_META } from '@/i18n/types'
import { DICTIONARY } from '@/i18n/dictionaries'

const STORAGE_KEY = 'aiplf.lang'
const DEFAULT_LOCALE: Locale = 'ja'

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  /** Translate a key for the current locale (falls back to ja, then the key itself). */
  t: (key: string) => string
  /** Like t() but interpolates {name} placeholders from vars. */
  tf: (key: string, vars: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored && stored in LANG_META) return stored
  } catch {
    /* localStorage unavailable */
  }
  return DEFAULT_LOCALE
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale)

  useEffect(() => {
    document.documentElement.lang = LANG_META[locale].htmlLang
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      /* ignore */
    }
  }, [locale])

  const setLocale = useCallback((next: Locale) => setLocaleState(next), [])

  const t = useCallback(
    (key: string) => DICTIONARY[locale][key] ?? DICTIONARY.ja[key] ?? key,
    [locale],
  )

  const tf = useCallback(
    (key: string, vars: Record<string, string | number>) =>
      t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? '')),
    [t],
  )

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t, tf }), [locale, setLocale, t, tf])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider>')
  return ctx
}
