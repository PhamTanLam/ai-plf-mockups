import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n/I18nProvider'
import { ROUTES, caseDetailPath, DEMO_CASE_ID } from '@/routes'

type Scope = 'case' | 'mine' | 'company' | 'enduser'
type CiteId = 'c1' | 'c2' | 'c3' | 'c4' | 'c5'

const SCOPES: { key: Scope; labelKey: string }[] = [
  { key: 'case', labelKey: 'scope.case' },
  { key: 'mine', labelKey: 'scope.mine' },
  { key: 'company', labelKey: 'scope.company' },
  { key: 'enduser', labelKey: 'scope.enduser' },
]

/** S2 Q&A — REDESIGN v2 (full-width chat, collapsible citation panel). */
export default function CaseQAV2() {
  const { t } = useI18n()
  const [scope, setScope] = useState<Scope>('case')
  const [activeCite, setActiveCite] = useState<CiteId | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  const open = (id: CiteId) => { setActiveCite(id); setPanelOpen(true) }
  const Cite = ({ id, n }: { id: CiteId; n: number }) => (
    <button type="button" className={`cite ${activeCite === id ? 'active' : ''}`} onClick={() => open(id)}>{n}</button>
  )

  return (
    <div className="flex flex-col min-w-0 h-full overflow-hidden bg-surface-alt">
      {/* header */}
      <div className="bg-surface border-b border-line px-5 lg:px-8 py-3">
        <div className="flex items-center text-xs text-ink-400 mb-2">
          <Link to={ROUTES.dashboard} className="hover:text-brand-600">{t('nav.dashboard')}</Link>
          <span className="mx-1.5">/</span>
          <Link to={caseDetailPath(DEMO_CASE_ID)} className="hover:text-brand-600">CASE-2026-0312</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-700">{t('page.qa')}</span>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <span className="ai-grad-text">②</span> <span>{t('page.qaTitle')}</span>
            <span className="text-xs font-normal text-ai-600 px-2 py-0.5 bg-ai-50 rounded">{t('page.aiBadge')}</span>
          </h1>
          <div className="flex items-center gap-2">
            <button type="button" className="px-3 py-1.5 text-sm border border-line rounded-lg hover:bg-surface-alt">{t('action.history')}</button>
            <button type="button" className="px-3 py-1.5 text-sm btn-floating rounded-lg">+ {t('action.newChat')}</button>
          </div>
        </div>
        {/* scope + answer language */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-sm">
          <span className="text-xs text-ink-400">{t('scope.label')}</span>
          <div className="inline-flex rounded-lg bg-surface-alt p-0.5">
            {SCOPES.map((s) => (
              <button key={s.key} type="button" onClick={() => setScope(s.key)}
                className={`px-3 py-1 text-xs rounded-md transition ${scope === s.key ? 'bg-surface text-brand-700 font-medium shadow-sm' : 'text-ink-500 hover:text-ink-800'}`}>
                {t(s.labelKey)}
              </button>
            ))}
          </div>
          <div className="h-5 w-px bg-line mx-1" />
          <span className="text-xs text-ink-400">{t('answerLang.label')}</span>
          <select className="text-xs border border-line rounded-lg px-2 py-1 bg-surface focus:outline-none focus:border-brand-500">
            <option>{t('answerLang.auto')}</option><option>🇯🇵 日本語</option><option>🇬🇧 English</option><option>🇻🇳 Tiếng Việt</option>
          </select>
          <span className="ml-auto text-xs text-ink-400">21 {t('page.fieldsIndexed')}</span>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* chat */}
        <section className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto px-5 lg:px-8 py-5 space-y-5">
            {/* greeting + prompts */}
            <Ai who={t('chat.moduleA')} time="14:02">
              <div dangerouslySetInnerHTML={{ __html: t('qa.greeting') }} />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['qa.promptSummary', 'qa.promptSafety', 'qa.promptSimilar', 'qa.promptOwners'].map((k) => (
                  <button key={k} type="button" className="px-2.5 py-1 text-xs bg-surface-alt rounded-full hover:bg-surface-muted">{t(k)}</button>
                ))}
              </div>
            </Ai>

            <User time="14:03">{t('qa.userQ1')}</User>

            {/* AI answer with citations */}
            <div className="flex gap-3">
              <Avatar />
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-ai-600">{t('sidebar.moduleA')}</span>
                  <span className="text-xs text-ink-300">14:03</span>
                  <span className="ml-auto text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">confidence 0.89</span>
                </div>
                <div className="bg-surface border border-line rounded-2xl rounded-tl-sm px-3.5 py-3 text-sm leading-relaxed">
                  <div>{t('qa.answer1Part1')}</div>
                  <ul className="mt-2 space-y-1 ml-1">
                    <li>・ ISO 10218-1 <Cite id="c1" n={1} /> <span>{t('qa.answer1Std1')}</span></li>
                    <li>・ TS 15066 <Cite id="c2" n={2} /> <span>{t('qa.answer1Std2')}</span></li>
                    <li>・ <span>{t('qa.answer1Custom')}</span> <Cite id="c3" n={3} /></li>
                  </ul>
                  <div className="mt-2 pt-2 border-t border-line">
                    <div className="font-medium text-ink-800 mb-1">{t('qa.answer1Past')}</div>
                    <ul className="space-y-1">
                      <li>・ <span>{t('qa.answer1Past1')}</span> <Cite id="c4" n={4} /></li>
                      <li>・ <span>{t('qa.answer1Past2')}</span> <Cite id="c5" n={5} /></li>
                    </ul>
                    <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2">{t('qa.answer1Tip')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-xs text-ink-300">
                  <button type="button" className="hover:text-green-600 px-1.5 py-1 rounded hover:bg-surface-muted">👍</button>
                  <button type="button" className="hover:text-red-600 px-1.5 py-1 rounded hover:bg-surface-muted">👎</button>
                  <button type="button" className="hover:text-brand-600 px-1.5 py-1 rounded hover:bg-surface-muted">{t('action.copy')}</button>
                  <span className="ml-2">{t('qa.responseTime')}</span>
                </div>
              </div>
            </div>

            <User time="14:05">{t('qa.userQ2')}</User>

            <div className="flex gap-3">
              <Avatar />
              <div className="bg-surface border border-line rounded-2xl rounded-tl-sm px-3.5 py-3 w-64 space-y-2">
                <div className="h-2 rounded shimmer" /><div className="h-2 rounded shimmer w-4/5" />
              </div>
            </div>
          </div>

          {/* composer */}
          <div className="bg-surface border-t border-line px-5 lg:px-8 py-3">
            <div className="flex items-end gap-2 bg-surface-alt border border-line focus-within:border-brand-500 focus-within:bg-surface rounded-xl p-2">
              <textarea rows={1} placeholder={t('composer.placeholderQA')} className="flex-1 bg-transparent text-sm focus:outline-none resize-none py-1.5 px-1" />
              <button type="button" className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">{t('action.send')}</button>
            </div>
            <div className="flex items-center justify-between mt-1.5 text-[11px] text-ink-400">
              <span>{t('composer.qaTip')}</span>
              <span>{t('composer.scope')}: <span className="text-brand-600 font-medium">{t(`scope.${scope}`)}</span></span>
            </div>
          </div>
        </section>

        {/* citation panel (collapsible) */}
        {panelOpen ? (
          <aside className="hidden xl:flex flex-col w-[380px] shrink-0 border-l border-line bg-surface">
            <div className="px-4 py-3 border-b border-line flex items-center justify-between">
              <div className="font-semibold text-sm">{t('cite.title')}</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-400">5 {t('cite.refs')}</span>
                <button type="button" onClick={() => setPanelOpen(false)} className="text-ink-400 hover:text-ink-700">⟩</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <CiteItem n={1} active={activeCite === 'c1'} title={<>CASE-2026-0312 → {t('group.safety')}</>} cls="text-ai-700">
                <Source label={`${t('cite.sourceFrom')}: 仕様書_SH1_v2.pdf (P.4)`}>
                  <div className="text-[11px] text-ink-400">{t('field.standard')}</div>
                  <div className="font-medium text-sm">ISO 10218-1, TS 15066</div>
                </Source>
              </CiteItem>
              <CiteItem n={2} active={activeCite === 'c2'} title={<>{t('cite.standardDoc')} (TS 15066)</>} cls="text-ink-700">
                <div className="bg-surface-alt rounded-lg p-2.5 text-xs text-ink-600 leading-relaxed">"Robots and robotic devices — Collaborative robots…"<div className="text-[11px] text-ink-400 mt-2">{t('cite.source')}: ISO TS 15066:2016</div></div>
              </CiteItem>
              <CiteItem n={3} active={activeCite === 'c3'} title={<>CASE-2026-0312 → {t('cite.chatLog')}</>} cls="text-ink-700">
                <Source label={`${t('cite.source')}: S1`}>
                  <div className="text-[11px] text-ink-400">10:17 — 金井田 俊</div>
                  <div className="text-sm">"…ISO 10218-1 と TS 15066 <mark className="bg-yellow-100">準拠です</mark>。"</div>
                </Source>
              </CiteItem>
              <CiteItem n={4} active={activeCite === 'c4'} title={<>📂 {t('cite.pastCase')} CASE-2024-0188</>} cls="text-purple-700">
                <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-2.5">
                  <div className="text-sm font-medium">{t('cite.pastCase4')}</div>
                  <div className="text-[11px] text-ink-500 mt-1">{t('cite.standardLabel')}</div>
                </div>
              </CiteItem>
              <CiteItem n={5} active={activeCite === 'c5'} title={<>📂 {t('cite.pastCase')} CASE-2025-0207</>} cls="text-purple-700">
                <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-2.5">
                  <div className="text-sm font-medium">{t('cite.pastCase5')}</div>
                  <div className="text-[11px] text-ink-500 mt-1">{t('cite.standardLabel2')}</div>
                </div>
              </CiteItem>
            </div>
            <div className="border-t border-line p-3 text-[11px] text-ink-500 flex items-start gap-2">
              <span className="text-amber-600">⚠</span>
              <span dangerouslySetInnerHTML={{ __html: t('cite.governance') }} />
            </div>
          </aside>
        ) : (
          <button type="button" onClick={() => setPanelOpen(true)} className="hidden xl:flex flex-col items-center gap-2 border-l border-line bg-surface px-2 py-4 text-ink-400 hover:text-brand-600 hover:bg-surface-alt">
            <span className="text-sm">⟨</span>
            <span className="text-[11px] [writing-mode:vertical-rl]">{t('cite.title')} · 5</span>
          </button>
        )}
      </div>
    </div>
  )
}

function Avatar() {
  return <div className="w-8 h-8 ai-grad rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-bold">AI</div>
}
function Ai({ who, time, children }: { who: string; time: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <Avatar />
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 mb-1"><span className="text-xs font-medium text-ai-600">{who}</span><span className="text-xs text-ink-300">{time}</span></div>
        <div className="bg-surface border border-line rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
function User({ time, children }: { time: string; children: ReactNode }) {
  const { t } = useI18n()
  return (
    <div className="flex gap-3 justify-end">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 mb-1 justify-end"><span className="text-xs text-ink-300">{time}</span><span className="text-xs font-medium text-brand-600">{t('chat.userName')}</span></div>
        <div className="bg-brand-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm">{children}</div>
      </div>
      <div className="w-8 h-8 bg-brand-600 rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-bold">金</div>
    </div>
  )
}
function CiteItem({ n, active, title, cls, children }: { n: number; active: boolean; title: ReactNode; cls: string; children: ReactNode }) {
  return (
    <div className={`rounded-xl border p-3 transition ${active ? 'border-ai-200 bg-ai-50/40' : 'border-line'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`cite ${active ? 'active' : ''}`}>{n}</span>
        <span className={`text-xs font-semibold ${cls}`}>{title}</span>
      </div>
      {children}
    </div>
  )
}
function Source({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-surface border border-line rounded-lg p-2.5">
      {children}
      <div className="text-[11px] text-ink-400 mt-2">{label}</div>
    </div>
  )
}
