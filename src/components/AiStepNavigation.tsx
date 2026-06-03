import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '@/routes'
import { useI18n } from '@/i18n/I18nProvider'

export default function AiStepNavigation() {
  const { t } = useI18n()
  const location = useLocation()

  const steps = [
    { num: '①', to: ROUTES.ai.caseInput, labelKey: 'cd.input' },
    { num: '②', to: ROUTES.ai.qa, labelKey: 'cd.qa' },
    { num: '③', to: ROUTES.ai.drawing, labelKey: 'cd.elec' },
    { num: '④', to: ROUTES.ai.programCheck, labelKey: 'cd.check' },
    { num: '⑤', to: ROUTES.ai.languageSwitch, labelKey: 'cd.lang' },
    { num: '⑥', to: ROUTES.ai.programGeneration, labelKey: 'cd.gen' },
  ]

  return (
    <div className="flex items-center gap-1.5 mt-3 overflow-x-auto border-t border-line/60 pt-3 select-none">
      {steps.map((s) => {
        const active = location.pathname.startsWith(s.to)
        
        return (
          <Link
            key={s.to}
            to={s.to}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              active
                ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-500/20 font-semibold'
                : 'text-ink-500 hover:text-ink-900 hover:bg-surface-alt'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
              active ? 'bg-brand-600 text-white' : 'bg-surface-alt text-ink-500'
            }`}>
              {s.num}
            </span>
            <span>{t(s.labelKey)}</span>
          </Link>
        )
      })}
    </div>
  )
}
