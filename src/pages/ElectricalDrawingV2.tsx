import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n/I18nProvider'
import { ROUTES, caseDetailPath, DEMO_CASE_ID } from '@/routes'

type LayerKey = 'main' | 'control' | 'network' | 'safety'

/**
 * S3 Electrical Drawing — REDESIGN v2.
 * Canvas is the focus; AI chat (left) and property drawer (right) are collapsible;
 * calmer toolbar; "uses YOUR reference template" surfaced.
 */
export default function ElectricalDrawingV2() {
  const { t } = useI18n()
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({ main: true, control: true, network: true, safety: true })
  const [selected, setSelected] = useState('A1')
  const [chatOpen, setChatOpen] = useState(true)
  const [propOpen, setPropOpen] = useState(true)
  const toggleLayer = (k: LayerKey) => setLayers((p) => ({ ...p, [k]: !p[k] }))
  const compClass = (id: string, base = 'cad-comp ai-generated') => `${base} ${selected === id ? 'selected' : ''}`

  const LAYER_TOGGLES: { key: LayerKey; labelKey: string; dot: string }[] = [
    { key: 'main', labelKey: 'cad.layerMain', dot: 'bg-red-500' },
    { key: 'control', labelKey: 'cad.layerControl', dot: 'bg-blue-500' },
    { key: 'network', labelKey: 'cad.layerNetwork', dot: 'bg-purple-500' },
    { key: 'safety', labelKey: 'cad.layerSafety', dot: 'bg-amber-500' },
  ]

  return (
    <div className="flex flex-col min-w-0 h-full overflow-hidden bg-surface-alt">
      {/* header */}
      <div className="bg-surface border-b border-line px-5 lg:px-8 py-3">
        <div className="flex items-center text-xs text-ink-400 mb-2">
          <Link to={ROUTES.dashboard} className="hover:text-brand-600">{t('nav.dashboard')}</Link>
          <span className="mx-1.5">/</span>
          <Link to={caseDetailPath(DEMO_CASE_ID)} className="hover:text-brand-600">CASE-2026-0312</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-700">{t('page.elec')}</span>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <span className="ai-grad-text">③</span> <span>{t('page.elecTitle')}</span>
              <span className="text-xs font-normal text-ai-600 px-2 py-0.5 bg-ai-50 rounded">{t('page.aiBadge')}</span>
            </h1>
            <div className="text-sm text-ink-500 mt-0.5 flex items-center gap-2">
              <span className="font-mono text-xs">SH1_main_v0.3.dxf</span>
              <span className="text-[11px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">⭐ {t('elec.refData')} ×3</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="px-3 py-1.5 text-sm border border-line rounded-lg hover:bg-surface-alt">{t('action.versions')}</button>
            <button type="button" className="px-3 py-1.5 text-sm border border-line rounded-lg hover:bg-surface-alt">{t('action.export')}</button>
            <button type="button" className="px-3 py-1.5 text-sm btn-floating rounded-lg">{t('action.save')}</button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* LEFT chat (collapsible) */}
        {chatOpen ? (
          <section className="flex flex-col w-[340px] shrink-0 border-r border-line bg-surface">
            <div className="px-4 py-2.5 border-b border-line flex items-center gap-2">
              <div className="w-6 h-6 ai-grad rounded flex items-center justify-center text-white text-[10px] font-bold">AI</div>
              <div className="font-semibold text-sm">{t('chat.moduleB')}</div>
              <button type="button" onClick={() => setChatOpen(false)} className="ml-auto text-ink-400 hover:text-ink-700">⟨</button>
            </div>
            <div className="px-3 py-2 border-b border-line flex flex-wrap gap-1.5">
              {['chat.qaMain', 'chat.qaServo', 'chat.qaSafety', 'chat.qaCheck'].map((k) => (
                <button key={k} type="button" className="px-2 py-1 text-xs bg-surface-alt rounded-md hover:bg-surface-muted">{t(k)}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 text-sm">
              <div className="bg-surface-alt rounded-xl rounded-tl-sm p-2.5 text-[13px] leading-relaxed" dangerouslySetInnerHTML={{ __html: t('elec.greeting') }} />
              <div className="bg-brand-600 text-white rounded-xl rounded-tr-sm p-2.5 text-[13px] ml-8">{t('elec.userReq1')}</div>
              <div className="bg-surface-alt rounded-xl rounded-tl-sm p-2.5 text-[13px]">
                <div>{t('elec.gen1')}</div>
                <ul className="mt-1.5 space-y-0.5 text-xs">
                  <li>✓ {t('elec.gen1b')}</li>
                  <li>✓ {t('elec.gen1c')} <span className="text-[9px] text-purple-700 bg-purple-50 px-1 rounded">⭐</span></li>
                  <li>⏳ {t('elec.gen1e')}</li>
                </ul>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-2.5 text-xs">
                <div className="font-medium text-amber-700 mb-1">⚠ {t('elec.warnTitle')}</div>
                <div className="text-ink-600 leading-snug" dangerouslySetInnerHTML={{ __html: t('elec.warnBody') }} />
                <button type="button" className="mt-1.5 px-2 py-0.5 text-xs bg-amber-600 text-white rounded">{t('elec.warnApply')}</button>
              </div>
            </div>
            <div className="border-t border-line p-2.5">
              <div className="flex items-end gap-1.5 bg-surface-alt border border-line rounded-xl p-1.5">
                <textarea rows={1} placeholder={t('composer.placeholderElec')} className="flex-1 bg-transparent text-sm focus:outline-none resize-none py-1 px-1" />
                <button type="button" className="px-2 py-1 bg-brand-600 text-white rounded-lg text-xs">→</button>
              </div>
            </div>
          </section>
        ) : (
          <button type="button" onClick={() => setChatOpen(true)} className="flex flex-col items-center gap-2 border-r border-line bg-surface px-2 py-4 text-ink-400 hover:text-brand-600 hover:bg-surface-alt">
            <span className="text-sm">⟩</span><span className="text-[11px] [writing-mode:vertical-rl]">{t('chat.moduleB')}</span>
          </button>
        )}

        {/* CENTER canvas */}
        <section className="flex-1 flex flex-col min-w-0">
          <div className="bg-surface border-b border-line px-3 py-1.5 flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-surface-alt rounded-lg p-0.5">
              <button type="button" className="px-2 py-1 text-xs hover:bg-surface rounded">−</button>
              <span className="px-2 text-xs font-mono">100%</span>
              <button type="button" className="px-2 py-1 text-xs hover:bg-surface rounded">+</button>
            </div>
            <div className="h-5 w-px bg-line" />
            <span className="text-xs text-ink-400">{t('cad.layers')}</span>
            {LAYER_TOGGLES.map((l) => (
              <button key={l.key} type="button" onClick={() => toggleLayer(l.key)}
                className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition ${layers[l.key] ? 'bg-surface-alt text-ink-700' : 'text-ink-300'}`}>
                <span className={`w-2 h-2 ${l.dot} rounded-full ${layers[l.key] ? '' : 'opacity-30'}`} />{t(l.labelKey)}
              </button>
            ))}
            {!propOpen && <button type="button" onClick={() => setPropOpen(true)} className="ml-auto text-xs text-brand-600">{t('prop.servoTitle')} ⟨</button>}
          </div>

          <div className="cad-canvas flex-1 overflow-auto">
            <svg viewBox="0 0 800 620" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ minHeight: 600 }}>
              <g className={layers.main ? '' : 'hidden'}>
                <line x1="60" y1="40" x2="700" y2="40" className="wire wire-power" /><line x1="60" y1="60" x2="700" y2="60" className="wire wire-power" /><line x1="60" y1="80" x2="700" y2="80" className="wire wire-power" />
                <text x="40" y="44" className="cad-label">L1</text><text x="40" y="64" className="cad-label">L2</text><text x="40" y="84" className="cad-label">L3</text>
                <g className={compClass('QF1')} onClick={() => setSelected('QF1')}>
                  <rect x="130" y="30" width="80" height="60" rx="2" fill="white" stroke="#5F6B7A" strokeWidth="1.5" />
                  <text x="170" y="55" className="cad-label" textAnchor="middle" fontWeight="600">QF1</text>
                  <text x="170" y="68" className="cad-label-sm" textAnchor="middle">3P 32A</text>
                  <circle cx="200" cy="22" r="6" className="ai-badge" /><text x="200" y="25" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">AI</text>
                </g>
                <g className={compClass('SPD1')} onClick={() => setSelected('SPD1')}>
                  <rect x="240" y="30" width="60" height="60" rx="2" fill="white" stroke="#5F6B7A" strokeWidth="1.5" />
                  <text x="270" y="55" className="cad-label" textAnchor="middle" fontWeight="600">SPD1</text><text x="270" y="68" className="cad-label-sm" textAnchor="middle">Surge</text>
                </g>
                <line x1="310" y1="40" x2="700" y2="40" className="wire wire-power" /><line x1="310" y1="60" x2="700" y2="60" className="wire wire-power" /><line x1="310" y1="80" x2="700" y2="80" className="wire wire-power" />
                <line x1="360" y1="80" x2="360" y2="140" className="wire" /><line x1="460" y1="80" x2="460" y2="140" className="wire" /><line x1="560" y1="80" x2="560" y2="140" className="wire" /><line x1="660" y1="80" x2="660" y2="140" className="wire" />
                {[['A1', 320, 'white', '#5F6B7A', '1.5'], ['A2', 420, 'white', '#5F6B7A', '1.5'], ['A3', 520, 'white', '#5F6B7A', '1.5']].map(([id, x]) => (
                  <g key={id as string} className={compClass(id as string)} onClick={() => setSelected(id as string)}>
                    <rect x={x as number} y="140" width="80" height="80" rx="3" fill="white" stroke="#5F6B7A" strokeWidth="1.5" />
                    <text x={(x as number) + 40} y="160" className="cad-label" textAnchor="middle" fontWeight="600">{id}</text>
                    <text x={(x as number) + 40} y="175" className="cad-label-sm" textAnchor="middle">MR-J5-40A</text>
                    <text x={(x as number) + 40} y="205" className="cad-label-sm" textAnchor="middle" fill="#00838F">Axis {(id as string).slice(1)}</text>
                  </g>
                ))}
                {selected === 'A1' && <circle cx="390" cy="132" r="6" className="ai-badge" />}
                <g className="cad-comp processing" onClick={() => setSelected('A4')}>
                  <rect x="620" y="140" width="80" height="80" rx="3" fill="#E6F7F7" stroke="#077D7A" strokeWidth="2" strokeDasharray="4 2" />
                  <text x="660" y="160" className="cad-label" textAnchor="middle" fontWeight="600">A4</text>
                  <text x="660" y="188" className="cad-label-sm" textAnchor="middle" fill="#00838F">⏳ AI gen…</text>
                </g>
              </g>
              <g className={layers.control ? '' : 'hidden'}>
                <line x1="60" y1="310" x2="700" y2="310" className="wire wire-power" /><text x="35" y="313" className="cad-label" fill="#C62828">+24V</text>
                <g className={compClass('PLC1')} onClick={() => setSelected('PLC1')}>
                  <rect x="120" y="280" width="140" height="120" rx="3" fill="white" stroke="#099E9A" strokeWidth="1.5" />
                  <text x="190" y="305" className="cad-label" textAnchor="middle" fontWeight="600">PLC1</text>
                  <text x="190" y="320" className="cad-label-sm" textAnchor="middle">Mitsubishi Q03UDE</text>
                </g>
                <line x1="60" y1="420" x2="700" y2="420" className="wire wire-ground" /><text x="40" y="423" className="cad-label" fill="#2E7D32">0V</text>
              </g>
              <g className={layers.network ? '' : 'hidden'}>
                <line x1="300" y1="340" x2="700" y2="340" className="wire wire-signal" /><text x="475" y="333" className="wire-label" fill="#6B5BFF" fontWeight="600">CC-LINK IE Field</text>
                <g className={compClass('NW1')} onClick={() => setSelected('NW1')}>
                  <rect x="270" y="320" width="40" height="40" rx="2" fill="white" stroke="#6B5BFF" strokeWidth="1.5" /><text x="290" y="343" className="cad-label-sm" textAnchor="middle" fontWeight="600">QJ71</text>
                </g>
                <line x1="360" y1="340" x2="360" y2="140" className="wire wire-signal" /><line x1="460" y1="340" x2="460" y2="140" className="wire wire-signal" /><line x1="560" y1="340" x2="560" y2="140" className="wire wire-signal" /><line x1="660" y1="340" x2="660" y2="140" className="wire wire-signal" />
              </g>
              <g className={layers.safety ? '' : 'hidden'}>
                <g className={compClass('KA1', 'cad-comp')} onClick={() => setSelected('KA1')}>
                  <rect x="320" y="450" width="100" height="80" rx="3" fill="#FFF8E1" stroke="#ED6C02" strokeWidth="1.5" />
                  <text x="370" y="475" className="cad-label" textAnchor="middle" fontWeight="600">KA1</text><text x="370" y="490" className="cad-label-sm" textAnchor="middle">PNoz X1P</text>
                </g>
                <g className={compClass('EMG1', 'cad-comp')} onClick={() => setSelected('EMG1')}>
                  <circle cx="180" cy="490" r="22" fill="#C62828" stroke="#5F6B7A" strokeWidth="1.5" /><text x="180" y="494" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">EMG</text>
                </g>
                <line x1="202" y1="490" x2="320" y2="490" className="wire wire-ground" />
              </g>
            </svg>
          </div>

          <div className="border-t border-line bg-surface px-3 py-1.5 flex items-center gap-4 text-xs text-ink-500">
            <span><strong className="text-ink-700">21</strong> {t('cad.aiCount')}</span>
            <span><strong className="text-amber-600">1</strong> {t('cad.warnCount')}</span>
            <span className="text-purple-600">⭐ 3 {t('cad.tplCount')}</span>
            <span className="ml-auto">{t('cad.autoSaved')} 14:32</span>
          </div>
        </section>

        {/* RIGHT property (collapsible) */}
        {propOpen && (
          <aside className="hidden xl:flex flex-col w-[300px] shrink-0 border-l border-line bg-surface">
            <div className="px-4 py-3 border-b border-line flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-50 border border-brand-100 rounded-lg flex items-center justify-center text-brand-700 text-xs font-bold">{selected}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{t('prop.servoTitle')}</div>
                <div className="text-xs text-ink-400">MR-J5-40A</div>
              </div>
              <button type="button" onClick={() => setPropOpen(false)} className="text-ink-400 hover:text-ink-700">⟩</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              <div className="rounded-xl bg-purple-50/50 border border-purple-100 p-3">
                <div className="text-xs font-semibold text-purple-700">⭐ {t('prop.fromTemplate')}</div>
                <div className="text-xs text-brand-600 mt-0.5">{t('prop.templateName')}</div>
                <div className="text-[11px] text-ink-400 mt-0.5">{t('prop.templateUsage')}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase font-semibold text-ink-400 mb-2">{t('prop.groupBasic')}</div>
                <div className="space-y-1.5">
                  <PRow k={t('prop.tag')} v="A1" /><PRow k={t('prop.model')} v="MR-J5-40A" /><PRow k={t('prop.maker')} v="Mitsubishi" /><PRow k={t('prop.capacity')} v="400 W" /><PRow k={t('prop.voltage')} v="AC200V 3φ" />
                </div>
              </div>
              <div className="rounded-xl bg-ai-50/40 border border-ai-100 p-3 text-xs">
                <div className="font-semibold text-ai-700 mb-1">🤖 {t('prop.groupAI')}</div>
                <div className="text-ink-600 leading-snug" dangerouslySetInnerHTML={{ __html: t('prop.aiSuggest1') }} />
                <button type="button" className="mt-1.5 text-brand-600 hover:underline">{t('prop.askAlt')}</button>
              </div>
            </div>
            <div className="border-t border-line p-3">
              <button type="button" className="w-full px-3 py-2 btn-floating rounded-lg text-sm">{t('prop.edit')}</button>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

function PRow({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-2"><span className="text-xs text-ink-400">{k}</span><span className="font-mono text-ink-800">{v}</span></div>
}
