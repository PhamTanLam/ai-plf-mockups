import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n/I18nProvider'
import { ROUTES, caseDetailPath, DEMO_CASE_ID } from '@/routes'

type RungId = 'r14' | 'r15' | 'r16' | 'r17' | 'r18' | 'r19' | 'r20' | 'r21'
type PanelTab = 'explain' | 'check'

const SECTION_TABS = [
  { label: '初期化', badge: '(3)', cls: 'text-ink-300', active: false },
  { label: '共通', badge: '⚠ (1)', cls: 'text-amber-600', active: true },
  { label: '異常', badge: '❌ (1)', cls: 'text-red-600', active: false },
  { label: '手動', badge: '(8)', cls: 'text-ink-300', active: false },
  { label: '自動運転', badge: '⚠ (2)', cls: 'text-amber-600', active: false },
  { label: 'サーボ', badge: '(12)', cls: 'text-ink-300', active: false },
  { label: '出力', badge: '(6)', cls: 'text-ink-300', active: false },
]

export default function ProgramCheck() {
  const { t } = useI18n()
  const [selectedRung, setSelectedRung] = useState<RungId>('r16')
  const [tab, setTab] = useState<PanelTab>('check')

  const rungCls = (id: RungId, extra = '') =>
    `rung ${extra} ${selectedRung === id ? 'selected' : ''}`

  return (
    <div className="flex flex-col min-w-0 h-full overflow-hidden">
      {/* header */}
      <div className="bg-white border-b border-line px-4 lg:px-6 py-3">
        <div className="flex items-center text-xs text-ink-500 mb-2">
          <Link to={ROUTES.dashboard} className="hover:text-brand-600">{t('nav.dashboard')}</Link>
          <span className="mx-1">/</span>
          <Link to={ROUTES.cases} className="hover:text-brand-600">{t('nav.caseList')}</Link>
          <span className="mx-1">/</span>
          <Link to={caseDetailPath(DEMO_CASE_ID)} className="hover:text-brand-600">CASE-2026-0312</Link>
          <span className="mx-1">/</span>
          <span className="text-ink-900">{t('page.program')}</span>
        </div>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <span className="ai-grad-text">④</span> <span>{t('page.programTitle')}</span>
              <span className="text-xs font-normal text-amber-700 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded">{t('page.addonBadge')}</span>
            </h1>
            <div className="text-sm text-ink-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{t('page.programSubtitle')}</span>
              <span className="text-ink-300">|</span>
              <span className="flex items-center gap-1">📄 <span className="font-mono text-xs">SH1_main_v0.3.gxw</span></span>
              <span className="text-ink-300">|</span>
              <span className="font-mono text-xs">147 lines</span>
              <span className="text-ink-300">|</span>
              <span className="text-xs">Mitsubishi Q03UDE</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="px-3 py-1.5 text-sm border border-line rounded hover:bg-surface-muted">{t('action.changeFile')}</button>
            <button type="button" className="px-3 py-1.5 text-sm border border-line rounded hover:bg-surface-muted">{t('action.exportReport')}</button>
            <button type="button" className="px-3 py-1.5 text-sm btn-floating rounded flex items-center gap-1.5">{t('action.rerunAI')}</button>
          </div>
        </div>
      </div>

      {/* section tabs */}
      <div className="bg-white border-b border-line px-4 lg:px-6 flex items-center gap-1 overflow-x-auto">
        {SECTION_TABS.map((s) => (
          <button
            key={s.label}
            type="button"
            className={`px-3 py-2 text-xs font-medium border-b-2 ${
              s.active ? 'border-brand-600 text-brand-600' : 'border-transparent text-ink-500 hover:text-ink-900'
            }`}
          >
            {s.label} <span className={s.cls}>{s.badge}</span>
          </button>
        ))}
      </div>

      {/* 2-col area */}
      <div className="flex-1 flex min-h-0">
        {/* LEFT: ladder viewer */}
        <section className="flex-1 flex flex-col bg-white min-w-0">
          <div className="px-4 py-2 bg-surface-alt border-b border-line flex items-center gap-3 text-xs">
            <span className="font-semibold text-ink-700">{t('ladder.section')}</span>
            <span className="text-ink-300">|</span>
            <span className="text-ink-500">{t('ladder.rungs')}</span>
            <div className="ml-auto flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" defaultChecked className="rounded text-brand-600" /> <span>{t('ladder.showComments')}</span></label>
              <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" defaultChecked className="rounded text-brand-600" /> <span>{t('ladder.showAITips')}</span></label>
              <button type="button" className="px-2 py-0.5 text-xs border border-line rounded hover:bg-surface-muted">−</button>
              <span className="font-mono">100%</span>
              <button type="button" className="px-2 py-0.5 text-xs border border-line rounded hover:bg-surface-muted">+</button>
            </div>
          </div>

          <div className="flex-1 overflow-auto ladder-bg">
            <svg viewBox="0 0 720 720" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ minHeight: 720 }}>
              <line x1="60" y1="30" x2="60" y2="700" className="rail" />
              <line x1="600" y1="30" x2="600" y2="700" className="rail" />
              <text x="55" y="22" textAnchor="end" className="ladder-text" fontWeight="600" fill="#C62828">L+</text>
              <text x="605" y="22" className="ladder-text" fontWeight="600" fill="#2E7D32">L-</text>

              {/* Section: Common */}
              <rect x="60" y="40" width="540" height="22" className="section-header" />
              <text x="70" y="56" className="section-text">■ 共通 (Common)</text>

              {/* Rung 14 */}
              <g className={rungCls('r14')} onClick={() => setSelectedRung('r14')}>
                <rect className="rung-bg" x="60" y="70" width="540" height="60" fill="white" stroke="transparent" />
                <text x="50" y="103" textAnchor="end" className="ladder-ln">14</text>
                <line x1="60" y1="100" x2="130" y2="100" className="wire" />
                <line x1="130" y1="92" x2="130" y2="108" className="wire" />
                <line x1="145" y1="92" x2="145" y2="108" className="wire" />
                <text x="137" y="86" textAnchor="middle" className="ladder-addr">X10</text>
                <line x1="145" y1="100" x2="220" y2="100" className="wire" />
                <line x1="220" y1="92" x2="220" y2="108" className="wire" />
                <line x1="235" y1="92" x2="235" y2="108" className="wire" />
                <line x1="220" y1="90" x2="235" y2="110" className="wire" />
                <text x="227" y="86" textAnchor="middle" className="ladder-addr">X11</text>
                <line x1="235" y1="100" x2="490" y2="100" className="wire" />
                <path d="M490,92 Q482,100 490,108" className="wire" />
                <path d="M510,92 Q518,100 510,108" className="wire" />
                <text x="500" y="86" textAnchor="middle" className="ladder-addr">M60</text>
                <line x1="510" y1="100" x2="600" y2="100" className="wire" />
                <text x="495" y="125" textAnchor="middle" className="ladder-comment">手動モード許可</text>
              </g>

              {/* Rung 15 */}
              <g className={rungCls('r15')} onClick={() => setSelectedRung('r15')}>
                <rect className="rung-bg" x="60" y="130" width="540" height="60" fill="white" stroke="transparent" />
                <text x="50" y="163" textAnchor="end" className="ladder-ln">15</text>
                <line x1="60" y1="160" x2="130" y2="160" className="wire" />
                <line x1="130" y1="152" x2="130" y2="168" className="wire" />
                <line x1="145" y1="152" x2="145" y2="168" className="wire" />
                <text x="137" y="146" textAnchor="middle" className="ladder-addr">X11</text>
                <line x1="145" y1="160" x2="220" y2="160" className="wire" />
                <line x1="220" y1="152" x2="220" y2="168" className="wire" />
                <line x1="235" y1="152" x2="235" y2="168" className="wire" />
                <line x1="220" y1="150" x2="235" y2="170" className="wire" />
                <text x="227" y="146" textAnchor="middle" className="ladder-addr">X10</text>
                <line x1="235" y1="160" x2="490" y2="160" className="wire" />
                <path d="M490,152 Q482,160 490,168" className="wire" />
                <path d="M510,152 Q518,160 510,168" className="wire" />
                <text x="500" y="146" textAnchor="middle" className="ladder-addr">M61</text>
                <line x1="510" y1="160" x2="600" y2="160" className="wire" />
                <text x="495" y="185" textAnchor="middle" className="ladder-comment">自動モード許可 (M60 と排他)</text>
              </g>

              {/* Rung 16 (warning) */}
              <g className={rungCls('r16', 'warning')} onClick={() => setSelectedRung('r16')}>
                <rect className="rung-bg" x="60" y="190" width="540" height="80" fill="#FFFBEB" stroke="#ED6C02" strokeWidth="1.5" />
                <text x="50" y="223" textAnchor="end" className="ladder-ln" fontWeight="600" fill="#ED6C02">16</text>
                <text x="610" y="206" className="ladder-text" fill="#ED6C02">⚠</text>
                <line x1="60" y1="220" x2="130" y2="220" className="wire" />
                <line x1="130" y1="212" x2="130" y2="228" className="wire" />
                <line x1="145" y1="212" x2="145" y2="228" className="wire" />
                <text x="137" y="206" textAnchor="middle" className="ladder-addr">PB1</text>
                <line x1="145" y1="220" x2="220" y2="220" className="wire" />
                <line x1="220" y1="212" x2="220" y2="228" className="wire" />
                <line x1="235" y1="212" x2="235" y2="228" className="wire" />
                <text x="227" y="206" textAnchor="middle" className="ladder-addr">M60</text>
                <line x1="235" y1="220" x2="310" y2="220" className="wire" />
                <line x1="310" y1="212" x2="310" y2="228" className="wire" />
                <line x1="325" y1="212" x2="325" y2="228" className="wire" />
                <line x1="310" y1="210" x2="325" y2="230" className="wire" />
                <text x="317" y="206" textAnchor="middle" className="ladder-addr">Y20</text>
                <line x1="325" y1="220" x2="490" y2="220" className="wire" />
                <path d="M490,212 Q482,220 490,228" className="wire" />
                <path d="M510,212 Q518,220 510,228" className="wire" />
                <text x="500" y="206" textAnchor="middle" className="ladder-addr" fill="#ED6C02" fontWeight="600">M70</text>
                <line x1="510" y1="220" x2="600" y2="220" className="wire" />
                <text x="495" y="245" textAnchor="middle" className="ladder-comment">原点復帰起動</text>
                <rect x="120" y="252" width="380" height="14" rx="3" fill="#FFF3C0" stroke="#FFD54F" />
                <text x="125" y="262" className="ladder-comment" fill="#92400E" fontSize="9">⚠ AI: M70 は他セクションでも SET されています — 競合の可能性</text>
              </g>

              {/* Rung 17 */}
              <g className={rungCls('r17')} onClick={() => setSelectedRung('r17')}>
                <rect className="rung-bg" x="60" y="270" width="540" height="60" fill="white" stroke="transparent" />
                <text x="50" y="303" textAnchor="end" className="ladder-ln">17</text>
                <line x1="60" y1="300" x2="130" y2="300" className="wire" />
                <line x1="130" y1="292" x2="130" y2="308" className="wire" />
                <line x1="145" y1="292" x2="145" y2="308" className="wire" />
                <text x="137" y="286" textAnchor="middle" className="ladder-addr">PB2</text>
                <line x1="145" y1="300" x2="220" y2="300" className="wire" />
                <line x1="220" y1="292" x2="220" y2="308" className="wire" />
                <line x1="235" y1="292" x2="235" y2="308" className="wire" />
                <text x="227" y="286" textAnchor="middle" className="ladder-addr">M61</text>
                <line x1="235" y1="300" x2="490" y2="300" className="wire" />
                <path d="M490,292 Q482,300 490,308" className="wire" />
                <path d="M510,292 Q518,300 510,308" className="wire" />
                <text x="500" y="286" textAnchor="middle" className="ladder-addr">M71</text>
                <line x1="510" y1="300" x2="600" y2="300" className="wire" />
                <text x="495" y="325" textAnchor="middle" className="ladder-comment">自動運転起動</text>
              </g>

              {/* Section: Fault */}
              <rect x="60" y="340" width="540" height="22" className="section-header" />
              <text x="70" y="356" className="section-text">■ 異常 (Fault)</text>

              {/* Rung 18 */}
              <g className={rungCls('r18')} onClick={() => setSelectedRung('r18')}>
                <rect className="rung-bg" x="60" y="370" width="540" height="60" fill="white" stroke="transparent" />
                <text x="50" y="403" textAnchor="end" className="ladder-ln">18</text>
                <line x1="60" y1="400" x2="130" y2="400" className="wire" />
                <line x1="130" y1="392" x2="130" y2="408" className="wire" />
                <line x1="145" y1="392" x2="145" y2="408" className="wire" />
                <text x="137" y="386" textAnchor="middle" className="ladder-addr">X20</text>
                <line x1="145" y1="400" x2="490" y2="400" className="wire" />
                <path d="M490,392 Q482,400 490,408" className="wire" />
                <path d="M510,392 Q518,400 510,408" className="wire" />
                <text x="500" y="386" textAnchor="middle" className="ladder-addr">M50</text>
                <line x1="510" y1="400" x2="600" y2="400" className="wire" />
                <text x="495" y="425" textAnchor="middle" className="ladder-comment">非常停止押下 → 重故障</text>
              </g>

              {/* Rung 19 */}
              <g className={rungCls('r19')} onClick={() => setSelectedRung('r19')}>
                <rect className="rung-bg" x="60" y="430" width="540" height="60" fill="white" stroke="transparent" />
                <text x="50" y="463" textAnchor="end" className="ladder-ln">19</text>
                <line x1="60" y1="460" x2="130" y2="460" className="wire" />
                <line x1="130" y1="452" x2="130" y2="468" className="wire" />
                <line x1="145" y1="452" x2="145" y2="468" className="wire" />
                <text x="137" y="446" textAnchor="middle" className="ladder-addr">M40</text>
                <line x1="145" y1="460" x2="220" y2="460" className="wire" />
                <line x1="220" y1="445" x2="220" y2="475" className="wire" />
                <line x1="220" y1="445" x2="280" y2="445" className="wire" />
                <line x1="220" y1="475" x2="280" y2="475" className="wire" />
                <line x1="280" y1="445" x2="280" y2="475" className="wire" />
                <text x="195" y="440" className="ladder-addr">M41</text>
                <text x="195" y="490" className="ladder-addr">M42</text>
                <line x1="280" y1="460" x2="490" y2="460" className="wire" />
                <path d="M490,452 Q482,460 490,468" className="wire" />
                <path d="M510,452 Q518,460 510,468" className="wire" />
                <text x="500" y="446" textAnchor="middle" className="ladder-addr">M51</text>
                <line x1="510" y1="460" x2="600" y2="460" className="wire" />
                <text x="495" y="485" textAnchor="middle" className="ladder-comment">中故障まとめ</text>
              </g>

              {/* Rung 20 (error) */}
              <g className={rungCls('r20', 'error')} onClick={() => setSelectedRung('r20')}>
                <rect className="rung-bg" x="60" y="490" width="540" height="80" fill="#FEF2F2" stroke="transparent" />
                <text x="50" y="523" textAnchor="end" className="ladder-ln" fontWeight="600" fill="#991B1B">20</text>
                <text x="610" y="506" className="ladder-text" fill="#991B1B">❌</text>
                <line x1="60" y1="520" x2="130" y2="520" className="wire" />
                <line x1="130" y1="512" x2="130" y2="528" className="wire" />
                <line x1="145" y1="512" x2="145" y2="528" className="wire" />
                <text x="137" y="506" textAnchor="middle" className="ladder-addr" fill="#991B1B">T10</text>
                <line x1="145" y1="520" x2="220" y2="520" className="wire" />
                <line x1="220" y1="512" x2="220" y2="528" className="wire" />
                <line x1="235" y1="512" x2="235" y2="528" className="wire" />
                <line x1="220" y1="510" x2="235" y2="530" className="wire" />
                <text x="227" y="506" textAnchor="middle" className="ladder-addr">Y30</text>
                <line x1="235" y1="520" x2="490" y2="520" className="wire" />
                <path d="M490,512 Q482,520 490,528" className="wire" />
                <path d="M510,512 Q518,520 510,528" className="wire" />
                <text x="500" y="506" textAnchor="middle" className="ladder-addr">M52</text>
                <line x1="510" y1="520" x2="600" y2="520" className="wire" />
                <text x="495" y="545" textAnchor="middle" className="ladder-comment">タイムアウト警告</text>
                <rect x="120" y="552" width="380" height="14" rx="3" fill="#FFE4E6" stroke="#FCA5A5" />
                <text x="125" y="562" className="ladder-comment" fill="#991B1B" fontSize="9">❌ AI: T10 が初期化されていません — 起動時に予期しない動作の可能性</text>
              </g>

              {/* Rung 21 */}
              <g className={rungCls('r21')} onClick={() => setSelectedRung('r21')}>
                <rect className="rung-bg" x="60" y="570" width="540" height="60" fill="white" stroke="transparent" />
                <text x="50" y="603" textAnchor="end" className="ladder-ln">21</text>
                <line x1="60" y1="600" x2="130" y2="600" className="wire" />
                <line x1="130" y1="592" x2="130" y2="608" className="wire" />
                <line x1="145" y1="592" x2="145" y2="608" className="wire" />
                <text x="137" y="586" textAnchor="middle" className="ladder-addr">M50</text>
                <line x1="145" y1="600" x2="490" y2="600" className="wire" />
                <path d="M490,592 Q482,600 490,608" className="wire" />
                <path d="M510,592 Q518,600 510,608" className="wire" />
                <text x="500" y="586" textAnchor="middle" className="ladder-addr">Y30</text>
                <line x1="510" y1="600" x2="600" y2="600" className="wire" />
                <text x="495" y="625" textAnchor="middle" className="ladder-comment">異常ブザー出力</text>
              </g>

              <text x="330" y="700" textAnchor="middle" className="ladder-text" fill="#9AA4B2" fontSize="9">— continued at rung 22 —</text>
            </svg>
          </div>

          {/* free-form chat */}
          <div className="border-t border-line bg-white px-4 py-2.5">
            <div className="flex items-end gap-2 max-w-4xl">
              <div className="flex-1 flex items-end gap-2 bg-surface-alt border border-line focus-within:border-brand-500 focus-within:bg-white rounded-lg p-2">
                <button type="button" className="p-1 hover:bg-surface-muted rounded text-ai-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </button>
                <textarea rows={1} placeholder={t('composer.placeholderProg')} className="flex-1 bg-transparent text-sm focus:outline-none resize-none py-1" />
                <button type="button" className="px-3 py-1 bg-brand-600 text-white rounded text-sm hover:bg-brand-700 flex items-center gap-1">
                  <span>{t('action.ask')}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-xs">
              <span className="text-ink-300">{t('composer.suggest')}</span>
              <button type="button" className="text-brand-600 hover:underline">{t('composer.s1')}</button>
              <span className="text-ink-300">・</span>
              <button type="button" className="text-brand-600 hover:underline">{t('composer.s2')}</button>
              <span className="text-ink-300">・</span>
              <button type="button" className="text-brand-600 hover:underline">{t('composer.s3')}</button>
            </div>
          </div>
        </section>

        {/* RIGHT: AI panel (2 tabs) */}
        <aside className="hidden lg:flex flex-col w-[400px] shrink-0 border-l border-line bg-white">
          <div className="border-b border-line flex">
            <button type="button" onClick={() => setTab('explain')} className={`flex-1 px-4 py-2.5 text-sm font-medium border-b-2 flex items-center justify-center gap-1.5 ${tab === 'explain' ? 'border-brand-600 text-brand-600' : 'border-transparent text-ink-500 hover:text-ink-900'}`}>
              📖 <span>{t('tab.explain')}</span>
            </button>
            <button type="button" onClick={() => setTab('check')} className={`flex-1 px-4 py-2.5 text-sm font-medium border-b-2 flex items-center justify-center gap-1.5 ${tab === 'check' ? 'border-brand-600 text-brand-600' : 'border-transparent text-ink-500 hover:text-ink-900'}`}>
              🔍 <span>{t('tab.check')}</span>
              <span className="px-1.5 py-0 bg-red-100 text-red-700 rounded text-[10px]">2</span>
            </button>
          </div>

          {tab === 'check' ? (
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-3 border-b border-line bg-surface-alt">
                <div className="text-xs font-semibold text-ink-500 uppercase mb-2">{t('check.summary')}</div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="bg-white rounded p-2 border border-line"><div className="text-lg font-semibold text-red-600">2</div><div className="text-[10px] text-ink-500">{t('check.errors')}</div></div>
                  <div className="bg-white rounded p-2 border border-line"><div className="text-lg font-semibold text-amber-600">5</div><div className="text-[10px] text-ink-500">{t('check.warnings')}</div></div>
                  <div className="bg-white rounded p-2 border border-line"><div className="text-lg font-semibold text-blue-600">3</div><div className="text-[10px] text-ink-500">{t('check.infos')}</div></div>
                </div>
                <div className="mt-2 text-xs text-ink-500">{t('check.scanInfo')}</div>
              </div>

              <div className="divide-y divide-line">
                {/* ERROR 1 */}
                <div className="p-3 hover:bg-surface-alt cursor-pointer" onClick={() => setSelectedRung('r20')}>
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 sev-error rounded text-[10px] font-semibold">ERROR</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{t('issue.1title')}</div>
                      <div className="text-xs text-ink-500 mt-0.5"><span className="font-mono text-brand-600">Line 20</span> ・ <span>{t('issue.1cat')}</span></div>
                    </div>
                  </div>
                  <div className="text-xs text-ink-700 mt-2 leading-relaxed pl-12">{t('issue.1desc')}</div>
                  <div className="ml-12 mt-2 px-2 py-1.5 bg-ai-50 border border-ai-100 rounded text-xs">
                    <div className="font-semibold text-ai-700 mb-1">🤖 <span>{t('issue.suggest')}</span></div>
                    <div className="font-mono text-[11px] text-ink-700">{t('issue.1fix')}</div>
                    <button type="button" className="mt-1.5 text-xs text-brand-600 hover:underline">{t('issue.applyFix')}</button>
                  </div>
                </div>
                {/* ERROR 2 */}
                <div className="p-3 hover:bg-surface-alt cursor-pointer">
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 sev-error rounded text-[10px] font-semibold">ERROR</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{t('issue.2title')}</div>
                      <div className="text-xs text-ink-500 mt-0.5"><span className="font-mono text-brand-600">Line 17</span> ・ <span>{t('issue.2cat')}</span></div>
                    </div>
                  </div>
                  <div className="text-xs text-ink-700 mt-2 leading-relaxed pl-12">{t('issue.2desc')}</div>
                </div>
                {/* WARNING rung16 */}
                <div className="p-3 bg-amber-50/50 cursor-pointer" onClick={() => setSelectedRung('r16')}>
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 sev-warning rounded text-[10px] font-semibold">WARNING</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{t('issue.3title')}</div>
                      <div className="text-xs text-ink-500 mt-0.5"><span className="font-mono text-brand-600">Line 16, 82, 134</span></div>
                    </div>
                  </div>
                  <div className="text-xs text-ink-700 mt-2 leading-relaxed pl-12">{t('issue.3desc')}</div>
                  <div className="ml-12 mt-1.5 flex items-center gap-2"><button type="button" className="text-xs text-brand-600 hover:underline">{t('issue.viewAll')}</button></div>
                </div>
                {/* WARNING Y20 */}
                <div className="p-3 hover:bg-surface-alt cursor-pointer">
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 sev-warning rounded text-[10px] font-semibold">WARNING</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{t('issue.4title')}</div>
                      <div className="text-xs text-ink-500 mt-0.5"><span className="font-mono text-brand-600">Line 16</span></div>
                    </div>
                  </div>
                  <div className="text-xs text-ink-700 mt-2 leading-relaxed pl-12">{t('issue.4desc')}</div>
                </div>
                {/* WARNING naming */}
                <div className="p-3 hover:bg-surface-alt cursor-pointer">
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 sev-warning rounded text-[10px] font-semibold">WARNING</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{t('issue.5title')}</div>
                      <div className="text-xs text-ink-500 mt-0.5"><span className="font-mono text-brand-600">Line 19</span></div>
                    </div>
                  </div>
                </div>
                {/* INFO */}
                <div className="p-3 hover:bg-surface-alt cursor-pointer">
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 sev-info rounded text-[10px] font-semibold">INFO</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{t('issue.6title')}</div>
                      <div className="text-xs text-ink-500 mt-0.5"><span className="font-mono text-brand-600">Line 19</span></div>
                    </div>
                  </div>
                  <div className="text-xs text-ink-700 mt-2 leading-relaxed pl-12">{t('issue.6desc')}</div>
                </div>
              </div>

              <div className="p-3 border-t border-line bg-surface-alt sticky bottom-0">
                <div className="flex gap-2">
                  <button type="button" className="flex-1 px-3 py-1.5 text-xs border border-line rounded bg-white hover:bg-surface-muted">{t('check.exportExcel')}</button>
                  <button type="button" className="flex-1 px-3 py-1.5 text-xs border border-line rounded bg-white hover:bg-surface-muted">{t('check.exportPdf')}</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-3 border-b border-line bg-gradient-to-br from-ai-50/50 to-white">
                <div className="text-xs font-semibold text-ai-700 uppercase mb-1">🤖 <span>{t('explain.aiSummary')}</span></div>
                <div className="text-sm text-ink-900 font-medium">{t('explain.sectionTitle')}</div>
                <div className="text-xs text-ink-700 mt-1.5 leading-relaxed">{t('explain.sectionDesc')}</div>
              </div>
              <div className="px-4 py-3 border-b border-line">
                <div className="text-xs font-semibold text-ink-500 uppercase mb-2">{t('explain.flowchart')}</div>
                <div className="bg-surface-alt rounded p-3 border border-line">
                  <svg viewBox="0 0 320 220" className="w-full">
                    <rect x="120" y="10" width="80" height="28" rx="14" fill="#E8F5E9" stroke="#2E7D32" strokeWidth="1.2" />
                    <text x="160" y="29" textAnchor="middle" fontFamily="Inter" fontSize="11" fill="#1B5E20">Start</text>
                    <line x1="160" y1="38" x2="160" y2="55" stroke="#5F6B7A" strokeWidth="1.2" />
                    <polygon points="160,55 220,85 160,115 100,85" fill="#FFF8E1" stroke="#F57F17" strokeWidth="1.2" />
                    <text x="160" y="83" textAnchor="middle" fontFamily="Inter" fontSize="10" fill="#1A2233">X10/X11</text>
                    <text x="160" y="95" textAnchor="middle" fontFamily="Inter" fontSize="9" fill="#5F6B7A">モード?</text>
                    <line x1="220" y1="85" x2="260" y2="85" stroke="#5F6B7A" strokeWidth="1.2" />
                    <line x1="100" y1="85" x2="60" y2="85" stroke="#5F6B7A" strokeWidth="1.2" />
                    <text x="240" y="78" fontFamily="Inter" fontSize="9" fill="#5F6B7A">手動</text>
                    <text x="70" y="78" fontFamily="Inter" fontSize="9" fill="#5F6B7A">自動</text>
                    <rect x="220" y="120" width="80" height="28" rx="3" fill="white" stroke="#5F6B7A" />
                    <text x="260" y="139" textAnchor="middle" fontFamily="monospace" fontSize="10">M60 SET</text>
                    <line x1="260" y1="85" x2="260" y2="120" stroke="#5F6B7A" strokeWidth="1.2" />
                    <rect x="20" y="120" width="80" height="28" rx="3" fill="white" stroke="#5F6B7A" />
                    <text x="60" y="139" textAnchor="middle" fontFamily="monospace" fontSize="10">M61 SET</text>
                    <line x1="60" y1="85" x2="60" y2="120" stroke="#5F6B7A" strokeWidth="1.2" />
                    <line x1="260" y1="148" x2="260" y2="165" stroke="#5F6B7A" strokeWidth="1.2" />
                    <line x1="60" y1="148" x2="60" y2="165" stroke="#5F6B7A" strokeWidth="1.2" />
                    <rect x="220" y="165" width="80" height="36" rx="3" fill="#E6F7F7" stroke="#099E9A" />
                    <text x="260" y="180" textAnchor="middle" fontFamily="Inter" fontSize="9" fill="#099E9A">PB1 押下</text>
                    <text x="260" y="193" textAnchor="middle" fontFamily="monospace" fontSize="9">→ M70 起動</text>
                    <rect x="20" y="165" width="80" height="36" rx="3" fill="#E6F7F7" stroke="#099E9A" />
                    <text x="60" y="180" textAnchor="middle" fontFamily="Inter" fontSize="9" fill="#099E9A">PB2 押下</text>
                    <text x="60" y="193" textAnchor="middle" fontFamily="monospace" fontSize="9">→ M71 起動</text>
                  </svg>
                </div>
                <div className="text-[10px] text-ink-300 text-center mt-1.5">{t('explain.flowchartHint')}</div>
              </div>
              <div className="px-4 py-3">
                <div className="text-xs font-semibold text-ink-500 uppercase mb-2">{t('explain.perRung')}</div>
                <div className="space-y-2 text-xs">
                  <ExplainRow ln="L14" title={t('explain.r14title')} desc={t('explain.r14desc')} />
                  <ExplainRow ln="L15" title={t('explain.r15title')} desc={t('explain.r15desc')} />
                  <ExplainRow ln="L16 ⚠" title={t('explain.r16title')} desc={t('explain.r16desc')} warn />
                  <ExplainRow ln="L17" title={t('explain.r17title')} desc={t('explain.r17desc')} />
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function ExplainRow({ ln, title, desc, warn }: { ln: string; title: string; desc: string; warn?: boolean }) {
  return (
    <div className={`rounded p-2 ${warn ? 'bg-amber-50 border border-amber-200' : 'bg-surface-alt'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`font-mono font-semibold ${warn ? 'text-amber-700' : 'text-brand-600'}`}>{ln}</span>
        <span className="font-medium">{title}</span>
      </div>
      <div className="text-ink-700 leading-snug">{desc}</div>
    </div>
  )
}
