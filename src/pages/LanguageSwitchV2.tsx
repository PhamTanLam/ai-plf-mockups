import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n/I18nProvider'
import { ROUTES, caseDetailPath, DEMO_CASE_ID } from '@/routes'

/**
 * S5 Language Switch — REDESIGN v2.
 * Clean inline-diff (no vertical separators, roomy rows, calm confidence dots),
 * collapsible alternatives panel.
 */
type Conf = 'high' | 'low' | 'edited'
interface Row { ln: string; kw?: string; addr?: string; orig: string; trans: string; conf: Conf }
interface Section { key: string; en: string; rows: Row[] }

const SECTIONS: Section[] = [
  { key: 'section.init', en: 'Initialization', rows: [
    { ln: '1', addr: 'M100', orig: 'モータ起動許可', trans: 'Motor start permit', conf: 'high' },
    { ln: '3', addr: 'D100', orig: '初期座標格納用', trans: 'Initial position storage', conf: 'high' },
  ]},
  { key: 'section.common', en: 'Common', rows: [
    { ln: '14', addr: 'X10', orig: '手動モード選択SW', trans: 'Manual mode select SW', conf: 'high' },
    { ln: '16', addr: 'PB1', orig: '原点復帰起動釦', trans: 'Home Return Start PB', conf: 'edited' },
    { ln: '17', addr: 'PB2', orig: '自動運転起動釦', trans: 'Auto run start PB', conf: 'high' },
  ]},
  { key: 'section.fault', en: 'Fault', rows: [
    { ln: '35', addr: 'M50', orig: '重故障まとめ', trans: 'Critical fault summary', conf: 'low' },
    { ln: '36', addr: 'M51', orig: '中故障まとめ', trans: 'Medium fault summary', conf: 'low' },
    { ln: '38', addr: 'Y30', orig: '異常ブザー出力', trans: 'Fault buzzer output', conf: 'high' },
  ]},
  { key: 'section.servo', en: 'Servo', rows: [
    { ln: '103', orig: 'MR-J5 軸1 原点復帰用イチギメ動作', trans: 'MR-J5 Axis 1 home return positioning', conf: 'low' },
  ]},
]

function ConfDot({ conf }: { conf: Conf }) {
  if (conf === 'edited') return <span className="text-blue-600" title="edited">✎</span>
  if (conf === 'low') return <span className="text-amber-500" title="low">●</span>
  return <span className="text-green-500" title="high">●</span>
}

export default function LanguageSwitchV2() {
  const { t } = useI18n()
  const [selectedLn, setSelectedLn] = useState('16')
  const [panelOpen, setPanelOpen] = useState(true)

  return (
    <div className="flex flex-col min-w-0 h-full overflow-hidden bg-surface-alt">
      {/* header */}
      <div className="bg-surface border-b border-line px-5 lg:px-8 py-3">
        <div className="flex items-center text-xs text-ink-400 mb-2">
          <Link to={ROUTES.dashboard} className="hover:text-brand-600">{t('nav.dashboard')}</Link>
          <span className="mx-1.5">/</span>
          <Link to={caseDetailPath(DEMO_CASE_ID)} className="hover:text-brand-600">CASE-2026-0312</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-700">{t('page.langSwitch')}</span>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <span className="ai-grad-text">⑤</span> <span>{t('page.langSwitchTitle')}</span>
              <span className="text-xs font-normal text-ai-600 px-2 py-0.5 bg-ai-50 rounded">{t('page.aiBadge')}</span>
            </h1>
            <div className="text-sm text-ink-500 mt-0.5 flex items-center gap-2">
              <span className="font-mono text-xs">SH1_main.gxw</span>
              <span className="text-ink-300">·</span>
              <span>🇯🇵 {t('config.detected')} → 🇬🇧 English</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="px-3 py-1.5 text-sm border border-line rounded-lg hover:bg-surface-alt">{t('action.export')}</button>
            <button type="button" className="px-3 py-1.5 text-sm btn-floating rounded-lg">✓ {t('action.applyAll')}</button>
          </div>
        </div>
      </div>

      {/* stats bar */}
      <div className="bg-surface border-b border-line px-5 lg:px-8 py-2 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /><strong className="text-ink-700">128</strong> <span className="text-ink-400">{t('stats.highConf')}</span></span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /><strong className="text-ink-700">13</strong> <span className="text-ink-400">{t('stats.needReview')}</span></span>
        <span className="flex items-center gap-1.5"><span className="text-blue-600">✎</span><strong className="text-ink-700">6</strong> <span className="text-ink-400">{t('stats.edited')}</span></span>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-40 h-1.5 bg-surface-muted rounded-full overflow-hidden flex">
            <div className="bg-green-500 h-full" style={{ width: '87%' }} /><div className="bg-amber-500 h-full" style={{ width: '9%' }} /><div className="bg-blue-500 h-full" style={{ width: '4%' }} />
          </div>
          <span className="text-ink-700 font-medium">96%</span>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* diff */}
        <section className="flex-1 overflow-auto min-w-0">
          {/* col headers */}
          <div className="sticky top-0 bg-surface-alt/90 backdrop-blur grid items-center px-5 lg:px-8 py-2 text-[11px] font-medium text-ink-400" style={{ gridTemplateColumns: '40px 1fr 1fr 32px' }}>
            <div className="text-right pr-3">#</div>
            <div>🇯🇵 {t('diff.original')}</div>
            <div>🇬🇧 {t('diff.translated')} <span className="text-ink-300 font-normal">· {t('diff.editHint')}</span></div>
            <div className="text-center">⚡</div>
          </div>
          {SECTIONS.map((sec) => (
            <div key={sec.key}>
              <div className="px-5 lg:px-8 py-1.5 bg-surface-alt text-[11px] font-semibold text-ink-500">■ {t(sec.key)}</div>
              {sec.rows.map((r) => (
                <div key={r.ln} onClick={() => setSelectedLn(r.ln)}
                  className={`grid items-baseline px-5 lg:px-8 py-2.5 cursor-text font-mono text-[13px] border-t border-line/40 transition ${selectedLn === r.ln ? 'bg-brand-50/50' : r.conf === 'low' ? 'bg-amber-50/40' : 'hover:bg-surface'}`}
                  style={{ gridTemplateColumns: '40px 1fr 1fr 32px' }}>
                  <div className="text-right pr-3 text-ink-300 select-none">{r.ln}</div>
                  <div className="text-ink-700 pr-3">{r.kw && <span className="kw">{r.kw} </span>}{r.addr && <span className="addr">{r.addr}</span>}{r.addr ? '  ' : ''}{r.orig}</div>
                  <div className="text-ink-900">{r.kw && <span className="kw">{r.kw} </span>}{r.addr && <span className="addr">{r.addr}</span>}{r.addr ? '  ' : ''}{r.trans}{r.conf === 'edited' && <span className="text-[10px] text-blue-600 ml-1 font-sans">✎ {t('diff.editedByUser')}</span>}</div>
                  <div className="text-center text-xs"><ConfDot conf={r.conf} /></div>
                </div>
              ))}
            </div>
          ))}
        </section>

        {/* alternatives (collapsible) */}
        {panelOpen ? (
          <aside className="hidden xl:flex flex-col w-[340px] shrink-0 border-l border-line bg-surface">
            <div className="px-4 py-3 border-b border-line flex items-center justify-between">
              <div className="font-semibold text-sm">{t('alt.title')}</div>
              <div className="flex items-center gap-2"><span className="text-xs text-ink-400">{t('alt.lineSelected')}</span><button type="button" onClick={() => setPanelOpen(false)} className="text-ink-400 hover:text-ink-700">⟩</button></div>
            </div>
            <div className="px-4 py-3 border-b border-line space-y-2">
              <div><div className="text-[11px] text-ink-400 mb-1">🇯🇵 {t('alt.original')}</div><div className="font-mono text-sm bg-surface-alt rounded-lg px-2 py-1.5"><span className="addr">D100</span>  初期座標格納用</div></div>
              <div><div className="text-[11px] text-ink-400 mb-1">🇬🇧 {t('alt.current')}</div><div className="font-mono text-sm rounded-lg px-2 py-1.5 ring-1 ring-ai-500"><span className="addr">D100</span>  Initial position storage</div></div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="text-[11px] uppercase font-semibold text-ink-400">{t('alt.altTitle')}</div>
              {[['Initial coordinate storage', '0.88'], ['Initial pos. data', '0.82'], ['Home position memory', '0.76']].map(([txt, c]) => (
                <button key={txt} type="button" className="w-full text-left rounded-lg border border-line hover:border-brand-300 hover:bg-surface-alt p-2.5 transition">
                  <div className="font-mono text-sm"><span className="addr">D100</span>  {txt}</div>
                  <div className="text-[11px] text-ai-600 mt-0.5">confidence {c}</div>
                </button>
              ))}
              <div className="rounded-xl bg-purple-50/50 border border-purple-100 p-2.5 mt-2">
                <div className="text-xs font-medium text-purple-700">初期座標 · {t('alt.dictTitle')} v2.1</div>
                <div className="text-[11px] text-ink-600 mt-1">→ "Initial position" / "Initial coordinate" / "Home position"</div>
              </div>
            </div>
            <div className="border-t border-line p-3">
              <button type="button" className="w-full px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm hover:bg-purple-100">+ {t('alt.addToDict')}</button>
            </div>
          </aside>
        ) : (
          <button type="button" onClick={() => setPanelOpen(true)} className="hidden xl:flex flex-col items-center gap-2 border-l border-line bg-surface px-2 py-4 text-ink-400 hover:text-brand-600 hover:bg-surface-alt">
            <span className="text-sm">⟨</span><span className="text-[11px] [writing-mode:vertical-rl]">{t('alt.title')}</span>
          </button>
        )}
      </div>
    </div>
  )
}
