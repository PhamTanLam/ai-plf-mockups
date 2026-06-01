import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useI18n } from '@/i18n/I18nProvider'
import { ROUTES, DEMO_CASE_ID } from '@/routes'

/**
 * F4 Case Detail — REDESIGN v2 (Hybrid + 13-step SPINE backbone).
 * Hero = phased progress spine + "next action"; calmer overview; lighter tabs.
 */

type TabKey = 'overview' | 'files' | 'schedule' | 'tasks' | 'issues' | 'reports'

const TABS: { key: TabKey; labelKey: string; badge?: string }[] = [
  { key: 'overview', labelKey: 'tab.overview' },
  { key: 'files', labelKey: 'tab.files', badge: '12' },
  { key: 'schedule', labelKey: 'tab.schedule' },
  { key: 'tasks', labelKey: 'tab.tasks', badge: '5' },
  { key: 'issues', labelKey: 'tab.issues', badge: '3' },
  { key: 'reports', labelKey: 'tab.reports' },
]

export default function CaseDetailV2() {
  const { t } = useI18n()
  const { id } = useParams()
  const code = id ?? DEMO_CASE_ID
  const [tab, setTab] = useState<TabKey>('overview')

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <header>
        <div className="flex items-center text-xs text-ink-400 mb-2">
          <Link to={ROUTES.dashboard} className="hover:text-brand-600">{t('nav.dashboard')}</Link>
          <span className="mx-1.5">/</span>
          <Link to={ROUTES.cases} className="hover:text-brand-600">{t('nav.caseList')}</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-700">{code}</span>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm text-brand-600 font-medium">{code}</span>
              <span className="pill pill-design">{t('status.design')}</span>
              <span className="text-xs text-ai-700 px-2 py-0.5 bg-ai-50 rounded">{t('case.aiActive')}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{t('case.title')}</h1>
            <div className="text-sm text-ink-500 mt-1">
              {t('case.customer')}: <strong className="font-medium text-ink-700">AAA重機株式会社</strong> ・ {t('case.endUser')}: <strong className="font-medium text-ink-700">XYZ製鋼 千葉工場</strong> ・ {t('case.deadline')}: <strong className="font-medium text-ink-700">2026/09/15</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="px-3 py-1.5 text-sm border border-line rounded-lg hover:bg-surface-alt">{t('action.share')}</button>
            <button type="button" className="px-3 py-1.5 text-sm border border-line rounded-lg hover:bg-surface-alt">{t('action.exportPdf')}</button>
            <button type="button" className="px-3 py-1.5 text-sm btn-floating rounded-lg">{t('action.askAI')}</button>
          </div>
        </div>
      </header>

      {/* SPINE — hero */}
      <Spine />

      {/* Tabs */}
      <div className="border-b border-line flex items-center gap-1 overflow-x-auto">
        {TABS.map((tb) => {
          const on = tb.key === tab
          return (
            <button key={tb.key} type="button" onClick={() => setTab(tb.key)}
              className={`shrink-0 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px flex items-center gap-1.5 ${on ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-900'}`}>
              <span>{t(tb.labelKey)}</span>
              {tb.badge && <span className="text-[10px] text-ink-400">{tb.badge}</span>}
            </button>
          )
        })}
      </div>

      {tab === 'overview' && <Overview />}
      {tab === 'files' && <Files />}
      {tab === 'schedule' && <Schedule />}
      {tab === 'tasks' && <Tasks />}
      {tab === 'issues' && <Issues />}
      {tab === 'reports' && <Reports />}
    </div>
  )
}

/* ===================== SPINE (hero) ===================== */
function Spine() {
  const { t } = useI18n()
  const phases = [
    { labelKey: 'cd.phaseEstimate', range: '1-6', state: 'done' as const },
    { labelKey: 'cd.phaseOrder', range: '7-8', state: 'done' as const },
    { labelKey: 'timeline.design', range: '9', state: 'active' as const },
    { labelKey: 'cd.phaseBuild', range: '10-13', state: 'pending' as const },
  ]
  return (
    <section className="bg-surface border border-line rounded-2xl p-5 lg:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-sm font-semibold text-ink-700">{t('overview.progress')}</div>
          <div className="text-xs text-ink-400">{t('overview.progressHint')}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold ai-grad-text leading-none">38%</div>
          <div className="text-xs text-ink-400 mt-1">{t('overview.progressOf')}</div>
        </div>
      </div>

      {/* stepper */}
      <div className="relative">
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-surface-muted" />
        <div className="absolute top-3 left-0 h-0.5 bg-brand-500" style={{ width: '66%' }} />
        <div className="relative grid grid-cols-4">
          {phases.map((p) => {
            const dot =
              p.state === 'done' ? 'bg-brand-500 text-white' :
              p.state === 'active' ? 'bg-white border-2 border-brand-500 text-brand-600 shadow-[0_0_0_4px_rgba(10,186,181,0.15)] animate-pulse' :
              'bg-surface-muted text-ink-400'
            return (
              <div key={p.labelKey} className="flex flex-col items-center text-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${dot}`}>
                  {p.state === 'done' ? '✓' : p.range.split('-')[0]}
                </div>
                <span className={`text-xs mt-2 ${p.state === 'active' ? 'font-semibold text-brand-700' : 'text-ink-600'}`}>{t(p.labelKey)}</span>
                <span className="text-[10px] text-ink-400">{p.range}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* next action */}
      <div className="mt-5 flex items-center gap-3 rounded-xl bg-brand-50/60 border border-brand-100 px-4 py-3">
        <div className="w-8 h-8 rounded-lg ai-grad flex items-center justify-center text-white text-sm shrink-0">→</div>
        <div className="min-w-0">
          <div className="text-[11px] text-ink-500">{t('cd.nextAction')}</div>
          <div className="text-sm font-medium text-ink-900">{t('cd.nextActionCta')}</div>
        </div>
        <Link to={ROUTES.ai.drawing} className="ml-auto px-3 py-1.5 text-sm btn-floating rounded-lg shrink-0">{t('dash.open')} →</Link>
      </div>
    </section>
  )
}

/* ===================== OVERVIEW ===================== */
function Overview() {
  const { t } = useI18n()
  const aiCards = [
    { num: '①', to: ROUTES.ai.caseInput, labelKey: 'cd.input', state: '✓', stateCls: 'text-green-600', detail: '62% · 13/21' },
    { num: '②', to: ROUTES.ai.qa, labelKey: 'cd.qa', state: '✓', stateCls: 'text-green-600', detail: `7 ${t('cd.queries')}` },
    { num: '③', to: ROUTES.ai.drawing, labelKey: 'cd.elec', state: '⏳', stateCls: 'text-amber-600', detail: t('cd.aiGenerating'), hot: true },
    { num: '④', to: ROUTES.ai.programCheck, labelKey: 'cd.check', state: 'β', stateCls: 'text-amber-600', detail: t('cd.notStarted'), beta: true },
    { num: '⑤', to: ROUTES.ai.languageSwitch, labelKey: 'cd.lang', state: '○', stateCls: 'text-ink-300', detail: t('cd.notStarted') },
    { num: '⑥', to: ROUTES.ai.programGeneration, labelKey: 'cd.gen', state: 'β', stateCls: 'text-amber-600', detail: t('cd.notStarted'), beta: true },
  ]
  const owners = [
    { i: '金', bg: 'bg-brand-600', name: '金井田 俊', roleKey: 'owner.lead' },
    { i: '新', bg: 'bg-purple-600', name: '新路 友希奈', roleKey: 'owner.mech' },
    { i: 'L', bg: 'bg-pink-600', name: 'LINH', roleKey: 'owner.soft' },
    { i: '森', bg: 'bg-amber-600', name: '森下 雄太', roleKey: 'owner.pm' },
  ]
  const tech = ['Mitsubishi Q03UDE', 'MR-J5 ×6軸', 'CC-LINK IE Field', 'ISO 10218-1', 'TS 15066']
  return (
    <section className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-6">
        {/* basic info */}
        <Card title={t('overview.basic')} action={t('action.edit')}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Field label={t('field.customer')} value="AAA重機株式会社" />
            <Field label={t('field.endUser')} value="XYZ製鋼 千葉工場" />
            <Field label={t('field.contract')} value="2026/03/14" />
            <Field label={t('field.deadline')} value="2026/09/15 (112日)" />
            <Field label={t('field.takt')} value="35 秒 / 個" mono />
            <Field label={t('field.variants')} value="3 機種" />
            <div className="col-span-2">
              <div className="text-xs text-ink-400 mb-1">{t('field.tech')}</div>
              <div className="flex flex-wrap gap-1.5">
                {tech.map((tg) => <span key={tg} className="px-2 py-0.5 text-xs bg-surface-alt text-ink-600 rounded-md">{tg}</span>)}
              </div>
            </div>
          </div>
        </Card>

        {/* AI features */}
        <Card title={t('overview.aiStatus')}>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
            {aiCards.map((c) => (
              <Link key={c.labelKey} to={c.to}
                className={`rounded-xl border px-3 py-2.5 transition hover:shadow-sm ${c.hot ? 'border-brand-200 bg-brand-50/40' : 'border-line bg-surface'}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-ink-800">{c.num} {t(c.labelKey)}</span>
                  {c.beta && <span className="text-[9px] text-amber-700 bg-amber-50 px-1 rounded">β</span>}
                  <span className={`ml-auto text-xs ${c.stateCls}`}>{c.state}</span>
                </div>
                <div className="text-[11px] text-ink-400 mt-1">{c.detail}</div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* right rail */}
      <div className="space-y-6">
        <Card title={t('overview.owners')}>
          <div className="space-y-2.5">
            {owners.map((o) => (
              <div key={o.name} className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full ${o.bg} text-white text-[10px] font-semibold flex items-center justify-center`}>{o.i}</div>
                <div className="min-w-0">
                  <div className="text-sm text-ink-800">{o.name}</div>
                  <div className="text-[11px] text-ink-400">{t(o.roleKey)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title={t('overview.stats')}>
          <div className="grid grid-cols-2 gap-2 text-center">
            {[['12', 'cdstat.files'], ['5', 'cdstat.tasksDone'], ['3', 'cdstat.issuesOpen'], ['47', 'cdstat.aiCalls']].map(([v, k], i) => (
              <div key={k} className="bg-surface-alt rounded-lg py-2.5">
                <div className={`text-lg font-semibold ${i === 3 ? 'ai-grad-text' : i === 2 ? 'text-brand-600' : 'text-ink-900'}`}>{v}</div>
                <div className="text-[10px] text-ink-400">{t(k)}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title={t('overview.activity')}>
          <div className="space-y-3">
            {[['ai-grad', 'AI', 'act.1', '5 min'], ['bg-brand-600', '金', 'act.2', '2 h'], ['bg-purple-500', '📁', 'act.3', '1 d']].map(([bg, av, k, time]) => (
              <div key={k} className="flex items-start gap-2">
                <div className={`w-6 h-6 ${bg} rounded shrink-0 flex items-center justify-center text-white text-[10px] font-bold`}>{av}</div>
                <div className="min-w-0">
                  <div className="text-[11px] text-ink-700 leading-snug" dangerouslySetInnerHTML={{ __html: t(k) }} />
                  <div className="text-[10px] text-ink-400 mt-0.5">{time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}

/* ===================== lighter tabs ===================== */
function Files() {
  const { t } = useI18n()
  const files = [
    { icon: '📄', name: '仕様書_SH1_v2.pdf', meta: '2.4 MB · 金井田' },
    { icon: '📐', name: 'SH1_main_v0.3.dxf', meta: '820 KB · AI' },
    { icon: '📊', name: '議事録_1109.docx', meta: '86 KB · 森下' },
    { icon: '💻', name: 'SH1_main.gxw', meta: '1.2 MB · 金井田' },
  ]
  return (
    <Card title={t('files.title')}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {files.map((f) => (
          <div key={f.name} className="rounded-xl border border-line p-3 hover:shadow-sm transition">
            <div className="text-2xl">{f.icon}</div>
            <div className="text-sm font-medium text-ink-800 mt-2 truncate">{f.name}</div>
            <div className="text-[11px] text-ink-400">{f.meta}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
function Schedule() {
  const { t } = useI18n()
  const rows = [['sched.r2', 'bg-blue-500', '14%', '28%'], ['sched.r3', 'bg-amber-500', '38%', '30%'], ['sched.r4', 'bg-purple-500', '62%', '18%']]
  return (
    <Card title={t('sched.title')}>
      <div className="space-y-2">
        {rows.map(([k, color, left, width]) => (
          <div key={k} className="grid grid-cols-[140px_1fr] items-center gap-2 text-xs">
            <span className="text-ink-600">{t(k)}</span>
            <div className="relative h-6"><div className={`absolute top-1 h-4 rounded ${color}`} style={{ left, width }} /></div>
          </div>
        ))}
      </div>
    </Card>
  )
}
function Tasks() {
  const { t } = useI18n()
  const tasks = [
    { n: '電気図面 最終レビュー', o: '金井田', k: 'tasks.inprog', cls: 'bg-blue-100 text-blue-700', due: '6/05' },
    { n: 'PLC プログラム生成', o: 'LINH', k: 'tasks.todo', cls: 'bg-amber-100 text-amber-700', due: '6/10' },
    { n: '安全回路 検証', o: '金井田', k: 'tasks.todo', cls: 'bg-amber-100 text-amber-700', due: '6/08' },
  ]
  return (
    <Card title={t('tasks.title')}>
      <div className="divide-y divide-line/60">
        {tasks.map((tk) => (
          <div key={tk.n} className="flex items-center gap-3 py-2.5 text-sm">
            <input type="checkbox" className="rounded" />
            <span className="flex-1 text-ink-800">{tk.n}</span>
            <span className="text-xs text-ink-500">{tk.o}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded ${tk.cls}`}>{t(tk.k)}</span>
            <span className="text-xs text-ink-400 w-10 text-right">{tk.due}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
function Issues() {
  const { t } = useI18n()
  const issues = [
    { border: 'border-l-red-500', prio: 'issues.high', cls: 'bg-red-100 text-red-700', titleKey: 'issues.1', refKey: 'issues.1ref' },
    { border: 'border-l-amber-500', prio: 'issues.mid', cls: 'bg-amber-100 text-amber-700', titleKey: 'issues.2', refKey: 'issues.2ref' },
    { border: 'border-l-blue-400', prio: 'issues.low', cls: 'bg-blue-100 text-blue-700', titleKey: 'issues.3', refKey: 'issues.3ref' },
  ]
  return (
    <div className="space-y-3">
      {issues.map((is) => (
        <div key={is.titleKey} className={`bg-surface border border-line rounded-xl p-4 border-l-4 ${is.border}`}>
          <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${is.cls}`}>{t(is.prio)}</span>
          <div className="font-medium text-sm text-ink-800 mt-2">{t(is.titleKey)}</div>
          <div className="text-xs text-ink-500 mt-1">{t(is.refKey)}</div>
        </div>
      ))}
    </div>
  )
}
function Reports() {
  const { t } = useI18n()
  const reports = [
    { icon: '📋', titleKey: 'reports.1', subKey: 'reports.1sub', statusKey: 'reports.ready', cls: 'bg-green-100 text-green-700' },
    { icon: '📊', titleKey: 'reports.2', subKey: 'reports.2sub', statusKey: 'reports.draft', cls: 'bg-amber-100 text-amber-700' },
    { icon: '📖', titleKey: 'reports.3', subKey: 'reports.3sub', statusKey: 'reports.notyet', cls: 'bg-slate-100 text-slate-500' },
  ]
  return (
    <Card title={t('reports.title')}>
      <div className="divide-y divide-line/60">
        {reports.map((r) => (
          <div key={r.titleKey} className="flex items-center gap-3 py-3">
            <span className="text-xl">{r.icon}</span>
            <div className="flex-1"><div className="text-sm font-medium text-ink-800">{t(r.titleKey)}</div><div className="text-xs text-ink-400">{t(r.subKey)}</div></div>
            <span className={`text-[11px] px-2 py-0.5 rounded ${r.cls}`}>{t(r.statusKey)}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

/* ===================== shared ===================== */
function Card({ title, action, children }: { title: string; action?: string; children: ReactNode }) {
  return (
    <div className="bg-surface border border-line rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink-700">{title}</h2>
        {action && <button type="button" className="text-xs text-brand-600 hover:underline">{action}</button>}
      </div>
      {children}
    </div>
  )
}
function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-ink-400 mb-0.5">{label}</div>
      <div className={`text-ink-800 ${mono ? 'font-mono' : 'font-medium'}`}>{value}</div>
    </div>
  )
}
