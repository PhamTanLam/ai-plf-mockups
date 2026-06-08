import { useState, useEffect } from 'react'
import { CheckCircle2, AlertTriangle, ShieldAlert, BadgeInfo, Play, Check } from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'

interface AuditItem {
  id: string
  rungId: number
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  description: string
  solution: string
}

interface LadderAuditorProps {
  locale: string
  onProgressChange?: (progress: number) => void
}

export default function LadderAuditor({ locale, onProgressChange }: LadderAuditorProps) {
  void locale
  const { t } = useI18n()
  const [selectedRung, setSelectedRung] = useState<number>(81)
  const [solvedItems, setSolvedItems] = useState<string[]>([])

  useEffect(() => {
    if (onProgressChange) {
      const progress = Math.round((solvedItems.length / 3) * 100) // 3 is auditLogs.length
      onProgressChange(progress)
    }
  }, [solvedItems, onProgressChange])

  const auditLogs: AuditItem[] = [
    {
      id: 'ERR-001',
      rungId: 81,
      severity: 'error',
      code: 'ISO 13849-1',
      message: 'Mạch liên khóa an toàn thiếu phản hồi tiếp điểm phụ',
      description: 'Tiếp điểm của cuộn hút van an toàn KA1 đang được đấu nối trực tiếp mà không đi qua phản hồi kiểm tra tiếp điểm phụ (feedback loop) về PLC. Điều này vi phạm tiêu chuẩn ISO 13849 PLd.',
      solution: 'Đấu nối tiếp điểm phụ NC của rơ-le an toàn KA1 nối tiếp vào cổng tín hiệu đầu vào X20 của PLC để giám sát tình trạng kẹt tiếp điểm cơ khí.',
    },
    {
      id: 'WARN-002',
      rungId: 78,
      severity: 'warning',
      code: 'IEC 60204-1',
      message: 'Nút ấn chạy tự động không có chế độ duy trì an toàn',
      description: 'Tín hiệu PB2 kích hoạt chế độ chạy tự động (rung 78) chưa được khóa chéo (interlock) với cảnh báo còi hoặc đèn nhấp nháy trước khi máy vận hành.',
      solution: 'Thêm tiếp điểm thường đóng của đèn cảnh báo hoạt động (M50) hoặc khóa liên động an toàn trước lệnh kích hoạt tự động.',
    },
    {
      id: 'INFO-003',
      rungId: 79,
      severity: 'info',
      code: 'OPTIMIZE',
      message: 'Tối ưu hóa thời gian quét vòng quét (Scan time)',
      description: 'Lệnh điều khiển di chuyển xy-lanh (X40) có thể gộp vào chung một block chức năng điều hướng tích hợp để tăng hiệu năng xử lý vòng quét của CPU Mitsubishi Q-Series.',
      solution: 'Chuyển đổi các rungs lệnh tuần tự thành cấu trúc thanh ghi dịch hoặc lệnh bước SFC.',
    },
  ]

  const toggleSolve = (id: string) => {
    if (solvedItems.includes(id)) {
      setSolvedItems(solvedItems.filter((i) => i !== id))
    } else {
      setSolvedItems([...solvedItems, id])
    }
  }

  const handleLogClick = (rungId: number) => {
    setSelectedRung(rungId)
  }

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 border border-slate-200 rounded-2xl overflow-hidden shadow-card">
      {/* Top audit summary */}
      <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>1 Error</span>
          </span>
          <span className="flex items-center gap-1.5 font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>1 Warning</span>
          </span>
          <span className="flex items-center gap-1.5 font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-lg">
            <BadgeInfo className="w-3.5 h-3.5" />
            <span>1 Info</span>
          </span>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold rounded-xl shadow-xs transition cursor-pointer">
          <Play className="w-3 h-3 fill-current" />
          <span>{t('post.ladder.scanBtn')}</span>
        </button>
      </div>

      {/* Ladder logic SVG Diagram */}
      <div className="flex-1 overflow-auto ladder-bg p-3 border-b border-slate-200 min-h-[260px] max-h-[300px]">
        <svg viewBox="0 0 720 340" className="w-full h-auto min-w-[620px]">
          {/* Rails */}
          <line x1="60" y1="20" x2="60" y2="330" className="rail stroke-slate-500 stroke-2.5" />
          <line x1="660" y1="20" x2="660" y2="330" className="rail stroke-slate-500 stroke-2.5" />

          {/* Rung 78 */}
          <g className={`rung cursor-pointer ${selectedRung === 78 ? 'selected' : ''}`} onClick={() => setSelectedRung(78)}>
            <rect x="61" y="25" width="598" height="60" className={`fill-transparent transition ${selectedRung === 78 ? 'fill-slate-100/50 stroke-brand-500/20 stroke-1' : 'hover:fill-slate-50/30'}`} />
            <text x="50" y="58" textAnchor="end" className="font-mono text-[10px] fill-slate-400">78</text>
            <line x1="60" y1="55" x2="100" y2="55" className="wire stroke-slate-700 stroke-1.5" />
            <line x1="100" y1="47" x2="100" y2="63" className="wire stroke-slate-700 stroke-1.5" />
            <line x1="115" y1="47" x2="115" y2="63" className="wire stroke-slate-700 stroke-1.5" />
            <text x="107" y="42" textAnchor="middle" className="font-mono text-[9px] fill-slate-500">PB2</text>
            <line x1="115" y1="55" x2="180" y2="55" className="wire stroke-slate-700 stroke-1.5" />
            <line x1="180" y1="47" x2="180" y2="63" className="wire stroke-slate-700 stroke-1.5" />
            <line x1="195" y1="47" x2="195" y2="63" className="wire stroke-slate-700 stroke-1.5" />
            <text x="187" y="42" textAnchor="middle" className="font-mono text-[9px] fill-slate-500">M61</text>
            <line x1="195" y1="55" x2="555" y2="55" className="wire stroke-slate-700 stroke-1.5" />
            {/* Coil */}
            <path d="M555,47 Q547,55 555,63" className="wire stroke-slate-700 stroke-1.5 fill-none" />
            <path d="M575,47 Q583,55 575,63" className="wire stroke-slate-700 stroke-1.5 fill-none" />
            <text x="565" y="42" textAnchor="middle" className="font-mono text-[9px] fill-slate-500">M71</text>
            <line x1="575" y1="55" x2="660" y2="55" className="wire stroke-slate-700 stroke-1.5" />
            <text x="565" y="72" textAnchor="middle" className="text-[8px] fill-slate-400">Auto Operate Start</text>
          </g>

          {/* Rung 79 */}
          <g className={`rung cursor-pointer ${selectedRung === 79 ? 'selected' : ''}`} onClick={() => setSelectedRung(79)}>
            <rect x="61" y="105" width="598" height="60" className={`fill-transparent transition ${selectedRung === 79 ? 'fill-slate-100/50 stroke-brand-500/20 stroke-1' : 'hover:fill-slate-50/30'}`} />
            <text x="50" y="138" textAnchor="end" className="font-mono text-[10px] fill-slate-400">79</text>
            <line x1="60" y1="135" x2="100" y2="135" className="wire stroke-slate-700 stroke-1.5" />
            <line x1="100" y1="127" x2="100" y2="143" className="wire stroke-slate-700 stroke-1.5" />
            <line x1="115" y1="127" x2="115" y2="143" className="wire stroke-slate-700 stroke-1.5" />
            <text x="107" y="122" textAnchor="middle" className="font-mono text-[9px] fill-slate-500">M71</text>
            <line x1="115" y1="135" x2="220" y2="135" className="wire stroke-slate-700 stroke-1.5" />
            <line x1="220" y1="127" x2="220" y2="143" className="wire stroke-slate-700 stroke-1.5" />
            <line x1="235" y1="127" x2="235" y2="143" className="wire stroke-slate-700 stroke-1.5" />
            <text x="227" y="122" textAnchor="middle" className="font-mono text-[9px] fill-slate-500">X40</text>
            <line x1="235" y1="135" x2="555" y2="135" className="wire stroke-slate-700 stroke-1.5" />
            {/* Coil */}
            <path d="M555,127 Q547,135 555,143" className="wire stroke-slate-700 stroke-1.5 fill-none" />
            <path d="M575,127 Q583,135 575,143" className="wire stroke-slate-700 stroke-1.5 fill-none" />
            <text x="565" y="122" textAnchor="middle" className="font-mono text-[9px] fill-slate-500">M72</text>
            <line x1="575" y1="135" x2="660" y2="135" className="wire stroke-slate-700 stroke-1.5" />
            <text x="565" y="152" textAnchor="middle" className="text-[8px] fill-slate-400">Grip OK Step 2</text>
          </g>

          {/* Rung 81 Safety Warning */}
          <g className={`rung cursor-pointer ${selectedRung === 81 ? 'selected' : ''}`} onClick={() => setSelectedRung(81)}>
            {/* Highlight background for warning rung */}
            <rect x="61" y="185" width="598" height="90" className={`${solvedItems.includes('ERR-001') ? 'fill-green-50/30 stroke-green-500/20' : 'fill-red-50/40 stroke-red-500/20'} stroke-1 transition`} />
            <text x="50" y="228" textAnchor="end" className={`font-mono text-[10px] font-bold ${solvedItems.includes('ERR-001') ? 'fill-green-600' : 'fill-red-600'}`}>81</text>
            <line x1="60" y1="225" x2="100" y2="225" className="wire stroke-slate-700 stroke-1.5" />
            <line x1="100" y1="217" x2="100" y2="233" className="wire stroke-slate-700 stroke-1.5" />
            <line x1="115" y1="217" x2="115" y2="233" className="wire stroke-slate-700 stroke-1.5" />
            <text x="107" y="212" textAnchor="middle" className="font-mono text-[9px] fill-slate-500">M73</text>
            <line x1="115" y1="225" x2="220" y2="225" className="wire stroke-slate-700 stroke-1.5" />

            {/* X20 Contact */}
            <line x1="220" y1="217" x2="220" y2="233" className="wire stroke-slate-700 stroke-1.5" />
            <line x1="235" y1="217" x2="235" y2="233" className="wire stroke-slate-700 stroke-1.5" />
            <text x="227" y="212" textAnchor="middle" className="font-mono text-[9px] fill-slate-500 font-bold">X20</text>
            <line x1="235" y1="225" x2="340" y2="225" className="wire stroke-slate-700 stroke-1.5" />

            {/* Safety feedback contact - Missing */}
            <line x1="340" y1="217" x2="340" y2="233" className="wire stroke-red-500 stroke-2" />
            <line x1="355" y1="217" x2="355" y2="233" className="wire stroke-red-500 stroke-2" />
            <line x1="340" y1="215" x2="355" y2="235" className="wire stroke-red-500 stroke-2" /> {/* NC contact slash */}
            <text x="347" y="212" textAnchor="middle" className="font-mono text-[9px] fill-red-600 font-bold">KA1</text>
            <line x1="355" y1="225" x2="555" y2="225" className="wire stroke-slate-700 stroke-1.5" />

            {/* Coil */}
            <path d="M555,217 Q547,225 555,233" className="wire stroke-slate-700 stroke-1.5 fill-none" />
            <path d="M575,217 Q583,225 575,233" className="wire stroke-slate-700 stroke-1.5 fill-none" />
            <text x="565" y="212" textAnchor="middle" className="font-mono text-[9px] fill-slate-500">M735</text>
            <line x1="575" y1="225" x2="660" y2="225" className="wire stroke-slate-700 stroke-1.5" />
            <text x="565" y="252" textAnchor="middle" className="text-[8px] fill-slate-400">Step 3 Interlock OK</text>

            {/* Error Marker */}
            {!solvedItems.includes('ERR-001') && (
              <g>
                <circle cx="347" cy="225" r="12" className="fill-red-100 stroke-red-500 animate-pulse" strokeWidth="1" />
                <text x="347" y="228" textAnchor="middle" fill="#dc2626" fontSize="10" fontWeight="bold">!</text>
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Audit Logs list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {auditLogs.map((log) => {
          const isSolved = solvedItems.includes(log.id)
          return (
            <div
              key={log.id}
              onClick={() => handleLogClick(log.rungId)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedRung === log.rungId ? 'border-brand-500 shadow-sm shadow-brand-500/10 bg-white' : 'border-slate-200 bg-white'
              } ${
                isSolved
                  ? 'bg-green-50/70 border-green-200'
                  : log.severity === 'error'
                  ? 'bg-rose-50/60 border-rose-200'
                  : log.severity === 'warning'
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-sky-50/60 border-sky-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="shrink-0 mt-0.5">
                  {isSolved ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : log.severity === 'error' ? (
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                  ) : log.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <BadgeInfo className="w-4 h-4 text-sky-600" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                      isSolved
                        ? 'bg-green-100 text-green-700'
                        : log.severity === 'error'
                        ? 'bg-rose-100 text-rose-700'
                        : log.severity === 'warning'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-sky-100 text-sky-700'
                    }`}>
                      {log.code}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 font-semibold">Rung {log.rungId}</span>
                  </div>

                  <h6 className={`text-xs font-bold ${isSolved ? 'line-through text-slate-400 font-medium' : 'text-slate-900'}`}>
                    {log.message}
                  </h6>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{log.description}</p>

                  <div className="pt-2 mt-2 border-t border-slate-200 space-y-1 text-[11px]">
                    <span className="font-bold text-slate-550 font-mono">{t('post.ladder.fixSuggestion')}</span>
                    <p className="text-slate-700 font-mono bg-slate-50 p-2.5 rounded border border-slate-200 mt-1 leading-relaxed">{log.solution}</p>
                  </div>

                  <div className="pt-2.5 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSolve(log.id)
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border transition active:scale-95 cursor-pointer font-mono ${
                        isSolved
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'bg-white border-slate-250 text-slate-650 hover:bg-slate-50'
                      }`}
                    >
                      {isSolved ? <Check className="w-3 h-3" /> : null}
                      <span>{isSolved ? t('post.ladder.applied') : t('post.ladder.applyFix')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
