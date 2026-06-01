import { useEffect, useRef, useState } from 'react'
import type { Locale } from '@/i18n/types'
import { LANG_META, LOCALES } from '@/i18n/types'
import { useI18n } from '@/i18n/I18nProvider'

type Variant = 'bordered' | 'ghost'

const TRIGGER_STYLES: Record<Variant, string> = {
  bordered:
    'flex items-center gap-1 px-3 py-1.5 text-sm text-ink-700 bg-white hover:bg-surface-alt border border-line rounded-lg shadow-panel',
  ghost: 'flex items-center gap-1 px-2 py-1.5 text-sm text-ink-700 hover:bg-surface-muted rounded',
}

export function LanguageSwitcher({
  className = '',
  variant = 'bordered',
}: {
  className?: string
  variant?: Variant
}) {
  const { locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [open])

  function pick(next: Locale) {
    setLocale(next)
    setOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} className={TRIGGER_STYLES[variant]}>
        <span>{LANG_META[locale].flag}</span>
        <span>{LANG_META[locale].label}</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-line rounded-lg shadow-pop py-1 z-50">
          {LOCALES.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => pick(opt)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-surface-alt flex items-center gap-2"
            >
              <span>{LANG_META[opt].flag}</span>
              <span>{LANG_META[opt].label}</span>
              {opt === locale && (
                <svg
                  className="ml-auto w-4 h-4 text-brand-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
