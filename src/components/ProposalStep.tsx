import { useState } from 'react'
import { FileText, Download, FileOutput, ArrowRight, PackageCheck, RefreshCw } from 'lucide-react'
import type { PresalesApi, SavedOutput } from '@/hooks/usePresalesState'
import MarkdownLite from '@/components/MarkdownLite'

/**
 * ProposalStep — hoạt động "Trình dự toán" (hoạt động 3 trong chu trình pre-sales).
 * Gom đầu ra thành hồ sơ trình khách. Hai lối ra:
 *  - "Vòng mới": khách yêu cầu chỉnh → quay lại Nhập/Sửa, tăng số vòng (lặp).
 *  - "Đã nhận đơn": chốt đơn → sang giai đoạn sau nhận đơn (Bước 7).
 */
export default function ProposalStep({ pre, onToast, onNewRound, onAccept }: {
  pre: PresalesApi
  onToast?: (m: string) => void
  onNewRound?: () => void
  onAccept?: () => void
}) {
  const [open, setOpen] = useState<SavedOutput | null>(null)
  const gen = pre.savedOutputs.filter(o => o.kind === 'gen')

  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-5 shadow-panel space-y-4">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Trình dự toán · Vòng {pre.round}</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Hồ sơ trình khách gồm các đầu ra đã sinh ở bước nhập thông tin.</p>
        </div>
        <span className="text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-1 shrink-0">Vòng {pre.round}</span>
      </div>

      {gen.length === 0 ? (
        <div className="text-center text-xs text-slate-400 py-8 border border-dashed border-slate-200 rounded-xl">
          Chưa có đầu ra nào. Quay lại <strong>Nhập / Sửa thông tin</strong> và bấm các nút "AI gợi ý" để sinh hồ sơ.
        </div>
      ) : (
        <div className="space-y-2">
          {gen.map(o => (
            <button key={o.oid} onClick={() => setOpen(o)} className="w-full flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 hover:bg-slate-50 text-left cursor-pointer">
              <FileText className="w-4 h-4 text-brand-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-800 flex-1 truncate">{o.title}</span>
              <span className="text-[10px] text-slate-400">xem</span>
            </button>
          ))}
        </div>
      )}

      <button disabled={gen.length === 0} onClick={() => onToast?.('Đã xuất hồ sơ đề xuất gồm ' + gen.length + ' đầu ra (demo)')}
        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl cursor-pointer">
        <FileOutput className="w-3.5 h-3.5" /> Xuất hồ sơ đề xuất ({gen.length})
      </button>

      {/* Hai lối ra của chu trình */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {/* Lặp: vòng mới */}
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-3.5 flex flex-col">
          <div className="flex items-start gap-2 text-[11px] text-violet-800 mb-2.5 flex-1">
            <RefreshCw className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Khách yêu cầu <strong>chỉnh sửa / bổ sung</strong> → quay lại Nhập-Sửa và dự toán lại (tăng số vòng).</span>
          </div>
          <button onClick={onNewRound} className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold border border-violet-300 bg-white text-violet-700 hover:bg-violet-100 rounded-xl cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Vòng mới (sửa & dự toán lại)
          </button>
        </div>

        {/* Chốt: nhận đơn */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 flex flex-col">
          <div className="flex items-start gap-2 text-[11px] text-emerald-800 mb-2.5 flex-1">
            <PackageCheck className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Khách <strong>chốt đơn</strong> → sang <strong>giai đoạn SAU nhận đơn</strong>. Dữ liệu được tái dùng cho thiết kế/sản xuất.</span>
          </div>
          <button onClick={onAccept} className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer">
            ✅ Đã nhận đơn hàng — Bước 7 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-6" onClick={e => { if (e.target === e.currentTarget) setOpen(null) }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[82vh] flex flex-col shadow-pop overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200">
              <strong className="text-sm flex-1 truncate">{open.title}</strong>
              <button onClick={() => pre.downloadOutput(open.oid)} className="text-[11px] inline-flex items-center gap-1 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 hover:bg-slate-50 cursor-pointer"><Download className="w-3 h-3" />Tải .md</button>
              <button onClick={() => setOpen(null)} className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer">✕</button>
            </div>
            <div className="px-6 py-4 overflow-y-auto"><MarkdownLite text={open.content} /></div>
          </div>
        </div>
      )}
    </div>
  )
}
