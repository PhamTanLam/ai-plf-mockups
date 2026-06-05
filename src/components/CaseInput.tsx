import { useState } from 'react'
import { Pencil, X, Trash2, MoreVertical, Download, Share2, FilePlus2, Sparkles, RefreshCw, ArrowRight } from 'lucide-react'
import type { PresalesApi, SavedOutput } from '@/hooks/usePresalesState'
import MarkdownLite from '@/components/MarkdownLite'

/**
 * CaseInput — màn "Nhập thông tin dự án" (NV1, bước 1 & 4).
 * KHÔNG còn bảng dữ liệu: dữ liệu là "bộ nhớ AI" (ngầm). Người dùng nhập qua Nguồn + Chat;
 * hỏi AI để tóm tắt/hiện dữ liệu. Màn này = gợi ý AI (sinh tài liệu) + danh sách đã tạo.
 */

const PROMPT: Record<string, string> = {
  doc: 'Soạn nội dung tài liệu dự toán',
  config: 'Mô tả cấu thành hệ thống (đơn giản)',
  estimate: 'Lập dự toán khái quát',
  schedule: 'Lập lịch trình khái quát',
  proposal: 'Soạn tài liệu nền đề xuất',
}

export default function CaseInput({ mode, pre, onConvertToSource, onToast, onAdvance }: {
  mode: 'initial' | 'reentry'
  pre: PresalesApi
  onConvertToSource?: (title: string) => void
  onToast?: (msg: string) => void
  onAdvance?: () => void
}) {
  const [menuOid, setMenuOid] = useState<string | null>(null)
  const [renameOid, setRenameOid] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')
  const [detail, setDetail] = useState<SavedOutput | null>(null)
  const [running, setRunning] = useState<string | null>(null)

  const toast = (m: string) => onToast?.(m)
  const doGenerate = (id: string) => {
    if (running) return
    setRunning(id)
    setTimeout(() => { const out = pre.generate(id); setRunning(null); if (out) toast('Đã sinh "' + out.title + '" ✓') }, 900)
  }
  const fmtAgo = (ts: number) => {
    const m = Math.floor(Math.max(0, Date.now() - ts) / 60000)
    if (m < 1) return 'vừa xong'; if (m < 60) return m + ' phút trước'
    const h = Math.floor(m / 60); return h < 24 ? h + ' giờ trước' : Math.floor(h / 24) + ' ngày trước'
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {mode === 'reentry' && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-2.5 text-xs">
          <RefreshCw className="w-3.5 h-3.5 shrink-0" />
          <span><strong>Vòng {pre.round} — sửa / bổ sung:</strong> thêm nguồn / trao đổi với AI để cập nhật thông tin, rồi dự toán lại.</span>
        </div>
      )}

      {/* Trạng thái dữ liệu (bộ nhớ AI) — gọn, không phải bảng */}
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
        <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
        <span>AI đang ghi nhớ <strong className="text-slate-800">{pre.total}</strong> thông tin của dự án. Thêm nguồn hoặc trao đổi ở khung chat để bổ sung; hỏi <em>“tóm tắt dự án”</em> để AI hiển thị.</span>
      </div>

      {/* ---- AI gợi ý (câu hỏi → sinh tài liệu) ---- */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-panel">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <h4 className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">AI gợi ý</h4>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 mb-3">Bấm một gợi ý để AI thực hiện và tạo tài liệu (lưu vào “Đã tạo”).</p>
        <div className="flex flex-wrap gap-2">
          {pre.outputs.map(o => (
            <button key={o.id} disabled={!!running} onClick={() => doGenerate(o.id)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-white hover:border-violet-300 px-3.5 py-2 text-xs text-slate-700 transition disabled:opacity-60 cursor-pointer">
              <span className="text-violet-500 leading-none">{running === o.id ? '⏳' : <Sparkles className="w-3.5 h-3.5" />}</span>
              <span>{PROMPT[o.id] || o.name}</span>
            </button>
          ))}
        </div>

        {pre.savedOutputs.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Đã tạo ({pre.savedOutputs.length})</div>
            <div className="space-y-2">
              {pre.savedOutputs.map(e => {
                const isNote = e.kind === 'note'
                const icon = isNote ? '📝' : (pre.outputs.find(o => o.id === e.toolId)?.icon || '📄')
                return (
                  <div key={e.oid} className="relative border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-50" onClick={() => { setMenuOid(null); setDetail(e) }}>
                      <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm shrink-0">{icon}</span>
                      {renameOid === e.oid ? (
                        <input autoFocus value={renameVal} onClick={ev => ev.stopPropagation()} onChange={ev => setRenameVal(ev.target.value)}
                          onKeyDown={ev => { if (ev.key === 'Enter') { pre.renameOutput(e.oid, renameVal); setRenameOid(null) } if (ev.key === 'Escape') setRenameOid(null) }}
                          className="flex-1 text-xs border border-brand-500 rounded-md px-2 py-1 outline-none" />
                      ) : (
                        <span className="flex-1 min-w-0">
                          <span className="block text-xs font-semibold text-slate-800 truncate">{e.title}</span>
                          <span className="block text-[10px] text-slate-400">{isNote ? 'Ghi chú từ chat' : 'Đầu ra'} · {fmtAgo(e.ts)}</span>
                        </span>
                      )}
                      <button onClick={ev => { ev.stopPropagation(); setMenuOid(menuOid === e.oid ? null : e.oid) }} className="p-1 text-slate-300 hover:text-slate-700 cursor-pointer"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                    {menuOid === e.oid && (
                      <div className="absolute right-2 top-11 z-20 bg-white border border-slate-200 rounded-lg shadow-pop py-1 min-w-[170px] text-xs">
                        <button onClick={() => { setRenameOid(e.oid); setRenameVal(e.title); setMenuOid(null) }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-slate-700"><Pencil className="w-3.5 h-3.5" />Đổi tên</button>
                        <button onClick={() => { setMenuOid(null); toast('Đã sao chép liên kết chia sẻ (demo)') }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-slate-700"><Share2 className="w-3.5 h-3.5" />Chia sẻ</button>
                        {isNote && <button onClick={() => { setMenuOid(null); onConvertToSource?.(e.title); toast('Đã thêm vào Nguồn') }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-slate-700"><FilePlus2 className="w-3.5 h-3.5" />Chuyển thành nguồn</button>}
                        <button onClick={() => { setMenuOid(null); pre.downloadOutput(e.oid) }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-slate-700"><Download className="w-3.5 h-3.5" />Tải .md</button>
                        <button onClick={() => { setMenuOid(null); pre.deleteOutput(e.oid); if (detail?.oid === e.oid) setDetail(null) }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 cursor-pointer text-rose-600"><Trash2 className="w-3.5 h-3.5" />Xoá</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {onAdvance && (
        <button onClick={onAdvance} className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer">
          Tiếp tục: Kiểm tra <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}

      {detail && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-6" onClick={e => { if (e.target === e.currentTarget) setDetail(null) }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[82vh] flex flex-col shadow-pop overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200">
              <span className="text-[11px] text-slate-400">Tính năng AI › {detail.kind === 'note' ? 'Ghi chú' : 'Đầu ra'}</span>
              <button onClick={() => pre.downloadOutput(detail.oid)} className="ml-auto text-[11px] inline-flex items-center gap-1 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 hover:bg-slate-50 cursor-pointer"><Download className="w-3 h-3" />Tải .md</button>
              <button onClick={() => setDetail(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-3 border-b border-slate-100"><h3 className="text-lg font-bold text-slate-900">{detail.title}</h3></div>
            <div className="px-6 py-4 overflow-y-auto"><MarkdownLite text={detail.content} /></div>
          </div>
        </div>
      )}
    </div>
  )
}
