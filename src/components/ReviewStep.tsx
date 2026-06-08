import { Check, ArrowRight } from 'lucide-react'
import type { PresalesApi } from '@/hooks/usePresalesState'
import { useI18n } from '@/i18n/I18nProvider'

/** ReviewStep — hoạt động "Kiểm tra" (hoạt động 2 trong chu trình pre-sales): rà soát dữ liệu AI đã ghi nhớ trước khi trình dự toán. */
export default function ReviewStep({ pre, onAdvance }: { pre: PresalesApi; onAdvance?: () => void }) {
  const { t } = useI18n()
  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-5 shadow-panel space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">{t('ps.review.title')}</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">{t('ps.review.reviewSubtitle')} <span className="italic">{t('ps.review.skippable')}</span></p>
        </div>
        <span className="text-xs font-mono text-slate-500">{pre.total} {t('ps.review.items')}</span>
      </div>

      {pre.total === 0 ? (
        <div className="text-center text-xs text-slate-400 py-6 border border-dashed border-slate-200 rounded-xl">{t('ps.review.noData')}</div>
      ) : (
        <div className="space-y-1.5">
          {pre.fields.map(f => (
            <div key={f.id} className="flex items-center gap-2 text-xs border border-slate-100 rounded-lg px-3 py-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-slate-500 w-48 shrink-0 truncate">{f.name}</span>
              <span className="text-slate-800 font-medium truncate">{f.value}</span>
            </div>
          ))}
        </div>
      )}

      <button onClick={onAdvance} className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-xl cursor-pointer">
        {t('ps.review.advance')} <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
