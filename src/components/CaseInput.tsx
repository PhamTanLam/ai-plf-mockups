import { useState } from 'react'
import { Pencil, Trash2, MoreVertical, Download, Share2, FilePlus2, Sparkles, RefreshCw, ArrowRight } from 'lucide-react'
import type { PresalesApi, SavedOutput } from '@/hooks/usePresalesState'
import MarkdownLite from '@/components/MarkdownLite'
import { useI18n } from '@/i18n/I18nProvider'


export default function CaseInput({ mode, pre, onConvertToSource, onToast, onAdvance }: {
  mode: 'initial' | 'reentry'
  pre: PresalesApi
  onConvertToSource?: (title: string) => void
  onToast?: (msg: string) => void
  onAdvance?: () => void
}) {
  const { t, tf } = useI18n()
  const [menuOid, setMenuOid] = useState<string | null>(null)
  const [renameOid, setRenameOid] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')
  const [detail, setDetail] = useState<SavedOutput | null>(null)

  const toast = (m: string) => onToast?.(m)
  const fmtAgo = (ts: number) => {
    const m = Math.floor(Math.max(0, Date.now() - ts) / 60000)
    if (m < 1) return t('ps.time.justNow'); if (m < 60) return m + ' ' + t('ps.time.minAgo')
    const h = Math.floor(m / 60); return h < 24 ? h + ' ' + t('ps.time.hrAgo') : Math.floor(h / 24) + ' ' + t('ps.time.dayAgo')
  }

  if (detail) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-panel space-y-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <button onClick={() => setDetail(null)} className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer">
            {t('ps.common.backToList')}
          </button>
          <strong className="text-sm text-slate-800 truncate max-w-[250px]">{detail.title}</strong>
          <button onClick={() => pre.downloadOutput(detail.oid)} className="text-[11px] inline-flex items-center gap-1 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 hover:bg-slate-50 cursor-pointer">
            <Download className="w-3 h-3" /> {t('ps.common.downloadMd')}
          </button>
        </div>
        <div className="prose prose-slate max-w-none text-slate-800 select-text">
          <MarkdownLite text={detail.content} />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {mode === 'reentry' && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-2.5 text-xs">
          <RefreshCw className="w-3.5 h-3.5 shrink-0" />
          <span><strong>{t('ps.input.reentryLabel')}</strong> {t('ps.input.reentryDesc')}</span>
        </div>
      )}

      {/* Trạng thái dữ liệu (bộ nhớ AI) — gọn, không phải bảng */}
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
        <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
        <span>{tf('ps.input.status', { n: pre.total })}</span>
      </div>

      {/* ---- Đầu ra đã tạo ---- */}
      {pre.savedOutputs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-panel">
          <div className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider mb-3">{tf('ps.input.createdN', { n: pre.savedOutputs.length })}</div>
          <div className="space-y-2">
            {pre.savedOutputs.map(e => {
              const isNote = e.kind === 'note'
              const icon = isNote ? '📝' : (pre.outputs.find(o => o.id === e.toolId)?.icon || '📄')
              return (
                <div key={e.oid} className="group relative border border-slate-200/80 hover:border-brand-300 rounded-xl bg-white hover:bg-brand-50/5 transition-all duration-200 shadow-3xs hover:shadow-xs flex items-center gap-3 px-3.5 py-2.5">
                  <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => { setMenuOid(null); setDetail(e) }}>
                    <span className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-base shrink-0 group-hover:bg-brand-50 group-hover:border-brand-100 transition-colors">{icon}</span>
                    {renameOid === e.oid ? (
                      <input autoFocus value={renameVal} onClick={ev => ev.stopPropagation()} onChange={ev => setRenameVal(ev.target.value)}
                        onKeyDown={ev => { if (ev.key === 'Enter') { pre.renameOutput(e.oid, renameVal); setRenameOid(null) } if (ev.key === 'Escape') setRenameOid(null) }}
                        className="flex-1 text-xs border border-brand-500 rounded-md px-2 py-1 outline-none" />
                    ) : (
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs font-semibold text-slate-800 truncate group-hover:text-brand-700 transition-colors">{e.title}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{isNote ? t('ps.input.noteFromChat') : t('ps.input.outputLabel')} · {fmtAgo(e.ts)}</span>
                      </span>
                    )}
                  </div>
                  <button onClick={ev => { ev.stopPropagation(); setMenuOid(menuOid === e.oid ? null : e.oid) }} className="p-1 text-slate-350 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {menuOid === e.oid && (
                    <div className="absolute right-2 top-11 z-20 bg-white border border-slate-200 rounded-lg shadow-pop py-1 min-w-[170px] text-xs">
                      <button onClick={() => { setRenameOid(e.oid); setRenameVal(e.title); setMenuOid(null) }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-slate-700"><Pencil className="w-3.5 h-3.5" />{t('ps.common.rename')}</button>
                      <button onClick={() => { setMenuOid(null); toast(t('ps.input.toastShare')) }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-slate-700"><Share2 className="w-3.5 h-3.5" />{t('ps.common.share')}</button>
                      {isNote && <button onClick={() => { setMenuOid(null); onConvertToSource?.(e.title); toast(t('ps.input.toastToSource')) }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-slate-700"><FilePlus2 className="w-3.5 h-3.5" />{t('ps.input.toSource')}</button>}
                      <button onClick={() => { setMenuOid(null); pre.downloadOutput(e.oid) }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-slate-700"><Download className="w-3.5 h-3.5" />{t('ps.common.downloadMd')}</button>
                      <button onClick={() => { setMenuOid(null); pre.deleteOutput(e.oid) }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 cursor-pointer text-rose-600"><Trash2 className="w-3.5 h-3.5" />{t('ps.common.delete')}</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {onAdvance && (
        <button
          onClick={onAdvance}
          className="w-full inline-flex items-center justify-center gap-2 py-3 text-xs font-bold border border-brand-200 bg-brand-50/20 text-brand-700 hover:bg-brand-500 hover:text-white hover:border-brand-500 rounded-xl shadow-sm transition-all duration-300 active:scale-[0.99] cursor-pointer group hover:shadow-md hover:shadow-brand-500/10"
        >
          <span>{t('ps.input.continueReview')}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      )}
    </div>
  )
}
