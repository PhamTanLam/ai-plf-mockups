import { useI18n } from '@/i18n/I18nProvider'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { t } = useI18n()
  return (
    <header className="bg-white border-b border-line h-14 flex items-center px-4 sticky top-0 z-30">
      <button
        type="button"
        className="lg:hidden mr-2 p-2 hover:bg-surface-muted rounded"
        onClick={onToggleSidebar}
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 ai-grad rounded-lg flex items-center justify-center text-white font-bold">
          E
        </div>
        <span className="font-semibold text-ink-900">Engineer Design AI</span>
        <span className="hidden md:inline text-ink-300">|</span>
        <span className="hidden md:inline text-sm text-ink-500">E-Mind PLF</span>
      </div>

      <div className="hidden md:flex items-center mx-6 flex-1 max-w-xl">
        <div className="relative w-full">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            placeholder={t('header.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-alt border border-line rounded-md text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex-1 md:flex-none" />

      <LanguageSwitcher variant="ghost" className="hidden sm:block" />

      <button type="button" className="relative p-2 hover:bg-surface-muted rounded ml-1" aria-label="Notifications">
        <svg className="w-5 h-5 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      <button type="button" className="flex items-center gap-2 pl-1 pr-2 py-1 hover:bg-surface-muted rounded">
        <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-semibold flex items-center justify-center">
          森
        </div>
        <span className="hidden sm:inline text-sm">森下 雄太</span>
      </button>
    </header>
  )
}
