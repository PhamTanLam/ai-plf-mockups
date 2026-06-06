import { useState } from 'react'
import { Download, FileOutput, ArrowRight, PackageCheck } from 'lucide-react'
import type { PresalesApi, SavedOutput } from '@/hooks/usePresalesState'
import MarkdownLite from '@/components/MarkdownLite'

/**
 * ProposalStep — hoạt động "Trình dự toán" (hoạt động 3 trong chu trình pre-sales).
 * Gom đầu ra thành hồ sơ trình khách. Hai lối ra:
 *  - "Vòng mới": khách yêu cầu chỉnh → quay lại Nhập/Sửa, tăng số vòng (lặp).
 *  - "Đã nhận đơn": chốt đơn → sang giai đoạn sau nhận đơn (Bước 7).
 */
export default function ProposalStep({ pre, onToast, onAccept }: {
  pre: PresalesApi
  onToast?: (m: string) => void
  onAccept?: () => void
}) {
  const [open, setOpen] = useState<SavedOutput | null>(null)
  const gen = pre.savedOutputs.filter(o => o.kind === 'gen')
  const fmtAgo = (ts: number) => {
    const m = Math.floor(Math.max(0, Date.now() - ts) / 60000)
    if (m < 1) return 'vừa xong'; if (m < 60) return m + ' phút trước'
    const h = Math.floor(m / 60); return h < 24 ? h + ' giờ trước' : Math.floor(h / 24) + ' ngày trước'
  }

  if (open) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-panel space-y-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <button onClick={() => setOpen(null)} className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer">
            ← Quay lại danh sách
          </button>
          <strong className="text-sm text-slate-800 truncate max-w-[250px]">{open.title}</strong>
          <button onClick={() => pre.downloadOutput(open.oid)} className="text-[11px] inline-flex items-center gap-1 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 hover:bg-slate-50 cursor-pointer">
            <Download className="w-3 h-3" /> Tải .md
          </button>
        </div>
        <div className="prose prose-slate max-w-none text-slate-800 select-text">
          <MarkdownLite text={open.content} />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-5 shadow-panel space-y-4">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Trình dự toán</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Hồ sơ trình khách gồm các đầu ra đã sinh ở bước nhập thông tin.</p>
        </div>
      </div>

      {gen.length === 0 ? (
        <div className="text-center text-xs text-slate-400 py-8 border border-dashed border-slate-200 rounded-xl">
          Chưa có đầu ra nào. Quay lại <strong>Nhập / Sửa thông tin</strong> và bấm các nút "AI gợi ý" để sinh hồ sơ.
        </div>
      ) : (
        <div className="space-y-2">
          {gen.map(o => {
            const icon = pre.outputs.find(x => x.id === o.toolId)?.icon || '📄'
            return (
              <div key={o.oid} className="group relative border border-slate-200/80 hover:border-brand-300 rounded-xl bg-white hover:bg-brand-50/5 transition-all duration-200 shadow-3xs hover:shadow-xs flex items-center gap-3 px-3.5 py-2.5">
                <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => setOpen(o)}>
                  <span className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-base shrink-0 group-hover:bg-brand-50 group-hover:border-brand-100 transition-colors">{icon}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-semibold text-slate-800 truncate group-hover:text-brand-700 transition-colors">{o.title}</span>
                    <span className="block text-[10px] text-slate-450 mt-0.5">Tài liệu đề xuất · {fmtAgo(o.ts)}</span>
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-50 group-hover:bg-brand-50 group-hover:text-brand-600 px-2 py-1 rounded-md transition-colors shrink-0 select-none cursor-pointer" onClick={() => setOpen(o)}>
                  xem
                </span>
              </div>
            )
          })}
        </div>
      )}

      <button disabled={gen.length === 0} onClick={() => onToast?.('Đã xuất hồ sơ đề xuất gồm ' + gen.length + ' đầu ra (demo)')}
        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl cursor-pointer">
        <FileOutput className="w-3.5 h-3.5" /> Xuất hồ sơ đề xuất ({gen.length})
      </button>

      {/* Giai đoạn chốt đơn: Nhận đơn hàng */}
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/60 to-teal-50/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 shadow-3xs">
            <PackageCheck className="w-5.5 h-5.5" />
          </div>
          <div>
            <h5 className="text-xs font-extrabold text-slate-800 font-mono uppercase tracking-wider">Xác nhận nhận đơn hàng</h5>
            <p className="text-[11px] text-slate-650 mt-0.5 leading-relaxed">
              Khách <strong>chốt đơn</strong> → chuyển sang <strong>giai đoạn SAU nhận đơn (Pha 7)</strong>.<br />
              Dữ liệu kỹ thuật và dự toán sẽ được chuyển đổi tự động cho thiết kế và sản xuất.
            </p>
          </div>
        </div>
        <button
          onClick={onAccept}
          className="sm:self-center inline-flex items-center justify-center gap-1.5 px-5 py-3 text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-97 text-white rounded-xl shadow-md shadow-emerald-500/15 hover:shadow-lg transition duration-200 cursor-pointer shrink-0"
        >
          <span>Đã nhận đơn hàng — Bước 7</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  )
}
