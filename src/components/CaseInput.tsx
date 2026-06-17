import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Pencil, Trash2, MoreVertical, Download, Share2, FilePlus2, Sparkles, ArrowRight, Maximize2, X } from 'lucide-react'
import type { PresalesApi, SavedOutput } from '@/hooks/usePresalesState'
import { buildOutputMarkdown } from '@/hooks/usePresalesState'
import MarkdownLite from '@/components/MarkdownLite'
import DeckView from '@/components/DeckView'
import { useI18n } from '@/i18n/I18nProvider'
import { tcText } from '@/i18n/chat'


export default function CaseInput({ pre, onConvertToSource, onToast, onAdvance, openSignal }: {
  mode?: 'initial' | 'reentry'
  pre: PresalesApi
  onConvertToSource?: (title: string) => void
  onToast?: (msg: string) => void
  onAdvance?: () => void
  /** Tín hiệu mở thẳng chi tiết (từ nút trong chat). oid = output có sẵn (version = snapshot cụ thể); doc = tài liệu tổng hợp. n đổi → mở lại. */
  openSignal?: { oid?: string; version?: number; doc?: { title: string; content: string }; n: number }
}) {
  const { t, tf, locale } = useI18n()
  const verLabel = (v: number) => locale === 'ja' ? `版${v}` : locale === 'en' ? `V${v}` : `Bản V${v}`
  const zoomLabel = locale === 'ja' ? '拡大' : locale === 'en' ? 'Zoom' : 'Phóng to'
  const [menuOid, setMenuOid] = useState<string | null>(null)
  const [renameOid, setRenameOid] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')
  const [detail, setDetail] = useState<SavedOutput | null>(null)
  const [zoomed, setZoomed] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Đóng menu "..." khi click ra ngoài (document-level — chạy đúng kể cả khi tổ tiên có transform)
  useEffect(() => {
    if (!menuOid) return
    const onDocDown = (ev: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(ev.target as Node)) setMenuOid(null)
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [menuOid])

  // Mở chi tiết khi nhận tín hiệu từ ngoài (nút trong chat): output có sẵn (oid) hoặc doc tổng hợp
  useEffect(() => {
    if (!openSignal) return
    if (openSignal.doc) {
      setDetail({ oid: '_doc', kind: 'note', title: openSignal.doc.title, ts: Date.now(), content: openSignal.doc.content })
    } else if (openSignal.oid) {
      const o = pre.savedOutputs.find(s => s.oid === openSignal.oid)
      if (o) {
        // Nếu nút chỉ định version cụ thể → mở đúng snapshot version đó (vd nút chat cũ = V1)
        const snap = openSignal.version && o.versions ? o.versions.find(v => v.v === openSignal.version) : undefined
        setDetail(snap ? { ...o, content: snap.content, version: snap.v } : o)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSignal?.n])

  // "Hồ sơ trình khách" (final) và "Đề án" (deck) không hiển thị ở danh sách nháp — chúng là sản phẩm bàn giao (ở Thư viện)
  const visibleOutputs = pre.savedOutputs.filter(e => !(e.kind === 'gen' && (e.toolId === 'final' || e.toolId === 'deck')))

  const toast = (m: string) => onToast?.(m)
  const fmtAgo = (ts: number) => {
    const m = Math.floor(Math.max(0, Date.now() - ts) / 60000)
    if (m < 1) return t('ps.time.justNow'); if (m < 60) return m + ' ' + t('ps.time.minAgo')
    const h = Math.floor(m / 60); return h < 24 ? h + ' ' + t('ps.time.hrAgo') : Math.floor(h / 24) + ' ' + t('ps.time.dayAgo')
  }

  if (detail) {
    const isDeck = detail.toolId === 'deck'
    // Output do AI sinh → dựng lại nội dung theo NGÔN NGỮ hiện tại (nội dung lưu bị đóng băng theo locale lúc tạo)
    const detailContent = detail.kind === 'gen' && detail.toolId
      ? buildOutputMarkdown(detail.toolId, pre.fields, locale)
      : detail.content
    const pdfLabel = locale === 'ja' ? 'PDFを保存' : locale === 'en' ? 'Download PDF' : 'Tải PDF'
    // Deck = slide → xuất PDF qua print (chỉ hiện phần slide khi in); output khác → tải .md
    const printDeck = () => {
      document.body.classList.add('printing-deck')
      const cleanup = () => { document.body.classList.remove('printing-deck'); window.removeEventListener('afterprint', cleanup) }
      window.addEventListener('afterprint', cleanup)
      setTimeout(() => window.print(), 60)
    }
    return (
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-panel space-y-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <button onClick={() => { setZoomed(false); setDetail(null) }} className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer">
            {t('ps.common.backToList')}
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <strong className="text-sm text-slate-800 truncate max-w-[220px]">{tcText(detail.title, locale)}</strong>
            {detail.version && (
              <span className="shrink-0 text-[9px] font-bold bg-brand-500/10 text-brand-700 border border-brand-500/20 px-1.5 py-0.5 rounded-full font-mono">{verLabel(detail.version)}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setZoomed(true)} title={zoomLabel} className="text-[11px] inline-flex items-center gap-1 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 hover:bg-slate-50 cursor-pointer">
              <Maximize2 className="w-3 h-3" /> {zoomLabel}
            </button>
            {isDeck ? (
              <button onClick={printDeck} className="text-[11px] inline-flex items-center gap-1 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 hover:bg-slate-50 cursor-pointer">
                <Download className="w-3 h-3" /> {pdfLabel}
              </button>
            ) : (
              <button onClick={() => pre.downloadOutput(detail.oid)} className="text-[11px] inline-flex items-center gap-1 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 hover:bg-slate-50 cursor-pointer">
                <Download className="w-3 h-3" /> {t('ps.common.downloadMd')}
              </button>
            )}
          </div>
        </div>
        {isDeck ? (
          <div className="deck-print-area">
            <DeckView content={detailContent} />
          </div>
        ) : (
          <div className="prose prose-slate max-w-none text-slate-800 select-text">
            <MarkdownLite text={detailContent} />
          </div>
        )}

        {/* Modal phóng to — đọc docs toàn màn hình (portal ra body để không bị containing-block của canvas giới hạn) */}
        {zoomed && createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200" onClick={() => setZoomed(false)}>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-pop w-full h-full max-w-[1400px] max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-2 min-w-0 pr-4">
                  <strong className="text-base text-slate-900 truncate">{tcText(detail.title, locale)}</strong>
                  {detail.version && (
                    <span className="shrink-0 text-[9px] font-bold bg-brand-500/10 text-brand-700 border border-brand-500/20 px-1.5 py-0.5 rounded-full font-mono">{verLabel(detail.version)}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isDeck ? (
                    <button onClick={printDeck} className="text-xs inline-flex items-center gap-1 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-50 cursor-pointer">
                      <Download className="w-3.5 h-3.5" /> {pdfLabel}
                    </button>
                  ) : (
                    <button onClick={() => pre.downloadOutput(detail.oid)} className="text-xs inline-flex items-center gap-1 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-50 cursor-pointer">
                      <Download className="w-3.5 h-3.5" /> {t('ps.common.downloadMd')}
                    </button>
                  )}
                  <button onClick={() => setZoomed(false)} className="p-1.5 text-slate-450 hover:text-slate-850 hover:bg-slate-100 rounded-full transition cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-10 py-8 max-w-4xl mx-auto w-full text-slate-800 select-text">
                {isDeck ? (
                  <DeckView content={detailContent} />
                ) : (
                  <div className="prose prose-lg prose-slate max-w-none">
                    <MarkdownLite text={detailContent} />
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Trạng thái dữ liệu (bộ nhớ AI) — gọn, không phải bảng */}
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
        <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
        <span>{tf('ps.input.status', { n: pre.total })}</span>
      </div>

      {/* ---- Đầu ra đã tạo ---- (ẩn "Hồ sơ trình khách" final — nó nằm ở Thư viện, không phải scratch) */}
      {visibleOutputs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-panel">
          <div className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider mb-3">{tf('ps.input.createdN', { n: visibleOutputs.length })}</div>
          <div className="space-y-2">
            {visibleOutputs.map(e => {
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
                        <span className="block text-xs font-semibold text-slate-800 truncate group-hover:text-brand-700 transition-colors">{tcText(e.title, locale)}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{isNote ? t('ps.input.noteFromChat') : t('ps.input.outputLabel')} · {fmtAgo(e.ts)}</span>
                      </span>
                    )}
                  </div>
                  <button onClick={ev => { ev.stopPropagation(); setMenuOid(menuOid === e.oid ? null : e.oid) }} className="p-1 text-slate-350 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {menuOid === e.oid && (
                    <div ref={menuRef} className="absolute right-2 top-11 z-20 bg-white border border-slate-200 rounded-lg shadow-pop py-1 min-w-[170px] text-xs">
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
