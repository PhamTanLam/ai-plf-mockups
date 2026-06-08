import { useState, useEffect } from 'react'
import { FileDown, Award } from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'

type LayerKey = 'main' | 'control' | 'network' | 'safety'

interface CadViewerProps {
  locale: string
  currentUser?: 'Linh' | 'Kanai' | 'AI'
  onProgressChange?: (progress: number) => void
  onSelectComponent?: (id: string) => void
}

export default function CadViewer({ locale, currentUser = 'Linh', onProgressChange, onSelectComponent }: CadViewerProps) {
  const { t, tf } = useI18n()
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    main: true,
    control: true,
    network: true,
    safety: true,
  })
  const [selected, setSelected] = useState('A1')
  const [onsiteAdjustText, setOnsiteAdjustText] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [savedBy, setSavedBy] = useState<'Linh' | 'Kanai' | 'AI' | null>(null)

  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(isSaved ? 100 : 30)
    }
  }, [isSaved, onProgressChange])

  const toggleLayer = (k: LayerKey) => setLayers((p) => ({ ...p, [k]: !p[k] }))
  const compClass = (id: string) =>
    `flow-node transition-all ${
      selected === id 
        ? 'selected fill-brand-500/10 stroke-brand-500' 
        : 'fill-white stroke-slate-350 hover:stroke-slate-400'
    }`

  const handleComponentClick = (id: string) => {
    setSelected(id)
    if (onSelectComponent) {
      onSelectComponent(id)
    }
  }

  const servos = [
    { id: 'A1', x: 320 },
    { id: 'A2', x: 420 },
    { id: 'A3', x: 520 },
  ]

  return (
    <div className="flex flex-col h-full bg-white text-slate-800">
      {/* CAD Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 p-3 bg-slate-50 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl p-1 shadow-2xs">
          {([
            { key: 'main', label: 'Main', dot: 'bg-rose-500' },
            { key: 'control', label: 'Ctrl', dot: 'bg-sky-500' },
            { key: 'network', label: 'Net', dot: 'bg-purple-500' },
            { key: 'safety', label: 'Safe', dot: 'bg-amber-500' },
          ] as const).map((l) => (
            <button
              key={l.key}
              onClick={() => toggleLayer(l.key)}
              className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition cursor-pointer ${
                layers[l.key] ? 'bg-white text-slate-850 shadow-3xs border border-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 ${l.dot} rounded-full ${layers[l.key] ? '' : 'opacity-30'}`} />
              <span>{l.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-purple-700 bg-purple-100/50 px-2 py-0.5 rounded-full font-semibold border border-purple-200 flex items-center gap-1">
            <Award className="w-3 h-3 text-purple-600" />
            <span>Template x3</span>
          </span>
          <button className="flex items-center gap-1 text-[10px] font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-2.5 py-1.5 rounded-xl transition cursor-pointer shadow-3xs">
            <FileDown className="w-3 h-3" />
            <span>{locale === 'ja' ? 'DXF出力' : locale === 'vi' ? 'Xuất DXF' : 'Export DXF'}</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="flex-1 overflow-auto mini-cad p-2 min-h-[320px] max-h-[380px] border-b border-slate-200 bg-slate-50/50">
        <svg viewBox="0 0 800 620" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto min-w-[700px]">
          {/* Main Power Circuit */}
          <g className={layers.main ? '' : 'hidden'}>
            <line x1="60" y1="40" x2="700" y2="40" className="wire wire-power stroke-red-500 stroke-2" />
            <line x1="60" y1="60" x2="700" y2="60" className="wire wire-power stroke-red-500 stroke-2" />
            <line x1="60" y1="80" x2="700" y2="80" className="wire wire-power stroke-red-500 stroke-2" />
            <text x="35" y="44" className="font-mono text-xs font-bold fill-red-600">L1</text>
            <text x="35" y="64" className="font-mono text-xs font-bold fill-red-600">L2</text>
            <text x="35" y="84" className="font-mono text-xs font-bold fill-red-600">L3</text>

            <g className={compClass('QF1')} onClick={() => handleComponentClick('QF1')}>
              <rect x="130" y="30" width="80" height="60" rx="3" strokeWidth="1.5" />
              <text x="170" y="55" className="font-mono text-xs font-bold fill-slate-800" textAnchor="middle">QF1</text>
              <text x="170" y="68" className="text-[9px] fill-slate-500" textAnchor="middle">3P 32A</text>
              <circle cx="200" cy="22" r="6" className="fill-brand-500" />
              <text x="200" y="25" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">AI</text>
            </g>

            <g className={compClass('SPD1')} onClick={() => handleComponentClick('SPD1')}>
              <rect x="240" y="30" width="60" height="60" rx="3" strokeWidth="1.5" />
              <text x="270" y="55" className="font-mono text-xs font-bold fill-slate-800" textAnchor="middle">SPD1</text>
              <text x="270" y="68" className="text-[9px] fill-slate-500" textAnchor="middle">Surge</text>
            </g>

            <line x1="310" y1="40" x2="700" y2="40" className="wire stroke-red-500 stroke-2" />
            <line x1="310" y1="60" x2="700" y2="60" className="wire stroke-red-500 stroke-2" />
            <line x1="310" y1="80" x2="700" y2="80" className="wire stroke-red-500 stroke-2" />

            <line x1="360" y1="80" x2="360" y2="140" className="wire stroke-slate-400 stroke-1.5" />
            <line x1="460" y1="80" x2="460" y2="140" className="wire stroke-slate-400 stroke-1.5" />
            <line x1="560" y1="80" x2="560" y2="140" className="wire stroke-slate-400 stroke-1.5" />
            <line x1="660" y1="80" x2="660" y2="140" className="wire stroke-slate-400 stroke-1.5" />

            {/* Servos */}
            {servos.map(({ id, x }) => (
              <g key={id} className={compClass(id)} onClick={() => handleComponentClick(id)}>
                <rect x={x} y="140" width="80" height="80" rx="4" strokeWidth="1.5" />
                <text x={x + 40} y="165" className="font-mono text-xs font-bold fill-slate-800" textAnchor="middle">{id}</text>
                <text x={x + 40} y="180" className="text-[8px] fill-slate-500" textAnchor="middle">MR-J5-40A</text>
                <text x={x + 40} y="200" className="text-[9px] font-semibold fill-brand-600" textAnchor="middle">Axis {id.slice(1)}</text>
              </g>
            ))}

            {/* Generated Servo */}
            <g className="cad-comp cursor-pointer" onClick={() => handleComponentClick('A4')}>
              <rect x="620" y="140" width="80" height="80" rx="4" className={`stroke-2 ${selected === 'A4' ? 'fill-brand-500/10 stroke-brand-500' : 'fill-white stroke-brand-500/40 stroke-dasharray-4'}`} />
              <text x="660" y="165" className="font-mono text-xs font-bold fill-slate-800" textAnchor="middle">A4</text>
              <text x="660" y="185" className="text-[8px] fill-brand-600" textAnchor="middle">⏳ AI Suggest</text>
              <circle cx="690" cy="132" r="6" className="fill-brand-500" />
              <text x="690" y="135" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">AI</text>
            </g>
          </g>

          {/* Control Power Circuit */}
          <g className={layers.control ? '' : 'hidden'}>
            <line x1="60" y1="310" x2="700" y2="310" className="wire stroke-blue-500 stroke-2" />
            <text x="25" y="313" className="font-mono text-xs font-bold fill-blue-600">+24V</text>

            <g className={compClass('PLC1')} onClick={() => handleComponentClick('PLC1')}>
              <rect x="120" y="280" width="140" height="120" rx="4" strokeWidth="1.5" />
              <text x="190" y="305" className="font-mono text-xs font-bold fill-slate-800" textAnchor="middle">PLC1</text>
              <text x="190" y="325" className="text-[9px] fill-slate-500" textAnchor="middle">Melsec Q03UDE</text>
              <text x="190" y="340" className="text-[9px] fill-slate-500" textAnchor="middle">Mitsubishi</text>
            </g>

            <line x1="60" y1="420" x2="700" y2="420" className="wire stroke-slate-400 stroke-2" />
            <text x="35" y="423" className="font-mono text-xs font-bold fill-slate-500">0V</text>
          </g>

          {/* Network Bus */}
          <g className={layers.network ? '' : 'hidden'}>
            <line x1="300" y1="340" x2="700" y2="340" className="wire stroke-purple-550 stroke-1.5 stroke-dasharray-4" />
            <text x="475" y="333" className="text-[9px] font-bold fill-purple-600" textAnchor="middle">CC-LINK IE Field</text>

            <g className={compClass('NW1')} onClick={() => handleComponentClick('NW1')}>
              <rect x="270" y="320" width="40" height="40" rx="3" strokeWidth="1.5" />
              <text x="290" y="343" className="text-[9px] font-mono font-bold fill-slate-800" textAnchor="middle">QJ71</text>
            </g>

            <line x1="360" y1="340" x2="360" y2="220" className="wire stroke-purple-550/40 stroke-1.2 stroke-dasharray-2" />
            <line x1="460" y1="340" x2="460" y2="220" className="wire stroke-purple-550/40 stroke-1.2 stroke-dasharray-2" />
            <line x1="560" y1="340" x2="560" y2="220" className="wire stroke-purple-550/40 stroke-1.2 stroke-dasharray-2" />
            <line x1="660" y1="340" x2="660" y2="220" className="wire stroke-purple-550/40 stroke-1.2 stroke-dasharray-2" />
          </g>

          {/* Safety Relay */}
          <g className={layers.safety ? '' : 'hidden'}>
            <g className={compClass('KA1')} onClick={() => handleComponentClick('KA1')}>
              <rect x="320" y="460" width="100" height="80" rx="4" strokeWidth="1.5" />
              <text x="370" y="485" className="font-mono text-xs font-bold fill-slate-800" textAnchor="middle">KA1</text>
              <text x="370" y="500" className="text-[9px] fill-amber-700 bg-amber-50 px-1 font-bold" textAnchor="middle">Safety Relay</text>
              <text x="370" y="515" className="text-[8px] fill-slate-500" textAnchor="middle">PNoz X1P</text>
            </g>

            <g className={compClass('EMG1')} onClick={() => handleComponentClick('EMG1')}>
              <circle cx="180" cy="500" r="22" className="fill-rose-50 stroke-rose-500" strokeWidth="2" />
              <circle cx="180" cy="500" r="14" className="fill-rose-600 stroke-none" />
              <text x="180" y="503" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">EMG</text>
            </g>
            <line x1="202" y1="500" x2="320" y2="500" className="wire stroke-slate-400 stroke-1.5" />
          </g>
        </svg>
      </div>

      {/* Property Drawer (integrated on selected component) */}
      <div className="p-4 bg-slate-50 flex-none space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-brand-500 text-white font-mono font-bold text-xs">{selected}</span>
            <span className="text-xs font-bold text-slate-800">
              {selected.startsWith('A') ? 'Servo Drive Parameters' : selected.startsWith('Q') ? 'Circuit Breaker' : 'Industrial Controller'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">MR-J5 Series</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <div className="flex justify-between border-b border-slate-100 pb-1">
            <span className="text-slate-500">Maker:</span>
            <span className="font-bold text-slate-700">Mitsubishi Electric</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1">
            <span className="text-slate-500">Model:</span>
            <span className="font-mono text-slate-700">{selected === 'A4' ? 'MR-J5-40A (AI gen)' : 'MR-J5-40A'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1">
            <span className="text-slate-500">Voltage:</span>
            <span className="font-mono text-slate-700">AC200V 3-Phase</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1">
            <span className="text-slate-500">Capacity:</span>
            <span className="font-mono text-slate-700">400 W</span>
          </div>
        </div>

        {selected === 'A4' && (
          <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-[10px] text-brand-700 flex items-start gap-2">
            <span className="text-brand-500">🤖</span>
            <div>
              <span className="font-bold text-brand-650">AI Recommendation:</span>
              <p className="mt-0.5 leading-relaxed">
                This unit was automatically suggested based on the conveyor speed calculations (1.2m/s) in the Technical Specs PDF.
              </p>
            </div>
          </div>
        )}

        {/* Onsite Adjustment Form (STT 12) */}
        <div className="pt-2 border-t border-slate-200 mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block">{t('post.cad.onsiteLabel')}</label>
            {isSaved && savedBy && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                ✓ {tf('post.cad.savedBy', { name: savedBy })}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t('post.cad.placeholder')}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-250 rounded-xl outline-none focus:border-brand-500 bg-white text-slate-800"
              value={onsiteAdjustText}
              onChange={(e) => setOnsiteAdjustText(e.target.value)}
              id="onsite-input"
            />
            <button 
              onClick={() => {
                const val = onsiteAdjustText || 'Đấu nối KA1 NC vào PLC X20';
                setIsSaved(true);
                setSavedBy(currentUser);
                alert(`Đã cập nhật bản vẽ CAD điện với nội dung sửa đổi: "${val}". Bản vẽ đã được lưu thành phiên bản mới bởi ${currentUser}.`);
              }}
              className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer shrink-0"
            >
              {t('post.cad.updateBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
