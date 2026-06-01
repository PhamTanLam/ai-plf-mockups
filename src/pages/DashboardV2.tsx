import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n/I18nProvider'
import { Counter } from '@/components/Counter'
import { ROUTES, caseDetailPath } from '@/routes'

/**
 * F2 Dashboard — REDESIGN v2 (Hybrid layout per UX_STRATEGY.md).
 * KPI row + horizontal phase-pipeline + "today's priorities" cards + right rail.
 * Richer than the first v2 attempt; single teal accent; global-SaaS feel.
 */

type Dot = 'done' | 'active' | 'none'
const DOT: Record<Dot, string> = { done: 'bg-green-500', active: 'bg-amber-500', none: 'bg-ink-300/40' }

function Icon({ d }: { d: string }) {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

export default function DashboardV2() {
  const { t } = useI18n()

  const kpis = [
    { value: 8, label: t('stat.activeCases'), icon: 'M3 7h18M3 12h18M3 17h18', delta: '↑ 2', deltaCls: 'text-green-600' },
    { value: 12, label: t('stat.pendingTasks'), icon: 'M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z', delta: `3 ${t('stat.dueSoon')}`, deltaCls: 'text-red-600' },
    { value: 47, label: t('stat.aiUsage'), icon: 'M13 10V3L4 14h7v7l9-11h-7z', accent: true, sub: '¥2,840' },
    { value: 48000, currency: true, label: t('stat.marketplace'), icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 4.5M17 13l2.3 4.5M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z', delta: '142 DL', deltaCls: 'text-ink-500' },
  ]

  const phases = [
    { key: 'status.preSales', count: 2, to: ROUTES.cases },
    { key: 'status.design', count: 2, to: ROUTES.cases },
    { key: 'dash.phaseBuild', count: 1, to: ROUTES.cases },
    { key: 'status.done', count: 2, to: ROUTES.cases },
  ]

  const priorities = [
    {
      code: 'CASE-2026-0245', title: 'WW2 溶接セル', owner: 'L', ownerName: 'LINH', ownerBg: 'bg-pink-600',
      statusKey: 'status.debug', pill: 'pill-debug', pct: 88, pctColor: 'bg-red-500',
      reasonKey: 'dash.reasonWarn', reasonCls: 'text-red-700 bg-red-50', ai: ['done', 'done', 'done', 'done', 'active'] as Dot[],
      to: caseDetailPath('CASE-2026-0245'), ctaKey: 'dash.open',
    },
    {
      code: 'CASE-2026-0312', title: 'SH1 小型旋回フレーム', owner: '金', ownerName: '金井田', ownerBg: 'bg-brand-600',
      statusKey: 'status.design', pill: 'pill-design', pct: 38, pctColor: 'ai-grad',
      reasonKey: 'dash.reasonInput', reasonCls: 'text-brand-700 bg-brand-50', ai: ['done', 'done', 'active', 'none', 'none'] as Dot[],
      to: ROUTES.ai.caseInput, ctaKey: 'dash.continue',
    },
    {
      code: 'CASE-2026-0345', title: 'RR4 検査セル 改造', owner: '有', ownerName: '有村', ownerBg: 'bg-purple-600',
      statusKey: 'status.pre', pill: 'pill-pre', pct: 70, pctColor: 'bg-green-500',
      reasonKey: 'dash.reasonDue', reasonCls: 'text-amber-700 bg-amber-50', ai: ['active', 'active', 'none', 'none', 'none'] as Dot[],
      to: caseDetailPath('CASE-2026-0345'), ctaKey: 'dash.open',
    },
  ]

  const deadlines = [
    { date: '6/15', days: '20', tone: 'text-red-600', code: 'CASE-2026-0245', sub: 'WW2 溶接セル' },
    { date: '7/20', days: '55', tone: 'text-amber-600', code: 'CASE-2026-0345', sub: 'RR4 検査セル' },
    { date: '8/30', days: '96', tone: 'text-ink-500', code: 'CASE-2026-0288', sub: 'PP4 パレタイザ' },
  ]

  const activity = [
    { bg: 'ai-grad', av: 'AI', key: 'dash.act1', time: 'just now' },
    { bg: 'bg-brand-600', av: '金', key: 'dash.act2', time: '10 min' },
    { bg: 'bg-purple-500', av: '📦', key: 'dash.act3', time: '1 h' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-6 space-y-6">
      {/* Greeting */}
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-900">{t('dash.greet')}</h1>
          <p className="text-sm text-ink-500 mt-0.5">{t('dash.todayIs')} 2026年5月26日 (火)</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="px-3 py-2 text-sm btn-floating rounded-lg flex items-center gap-1.5 shadow-sm">
            <Icon d="M12 4v16m8-8H4" /> <span>{t('dash.newCase')}</span>
          </button>
        </div>
      </header>

      {/* KPI row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="bg-surface border border-line rounded-xl p-4 hover:shadow-sm transition">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.accent ? 'bg-brand-50 text-brand-600' : 'bg-surface-alt text-ink-500'}`}>
                <Icon d={k.icon} />
              </div>
              {k.delta && <span className={`text-xs font-medium ${k.deltaCls}`}>{k.delta}</span>}
            </div>
            <div className={`text-2xl font-semibold tabular-nums mt-3 ${k.accent ? 'ai-grad-text' : 'text-ink-900'}`}>
              <Counter target={k.value} currency={k.currency} />
            </div>
            <div className="text-xs text-ink-500 mt-0.5">{k.label}{k.sub && <span className="text-ink-400"> · {k.sub}</span>}</div>
          </div>
        ))}
      </section>

      {/* Pipeline strip */}
      <section className="bg-surface border border-line rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ink-700">{t('dash.pipeline')}</h2>
          <Link to={ROUTES.cases} className="text-xs text-brand-600 hover:underline">{t('dash.viewAll')}</Link>
        </div>
        <div className="flex items-stretch gap-2">
          {phases.map((p, i) => (
            <Link
              key={p.key}
              to={p.to}
              className="flex-1 group rounded-lg bg-surface-alt hover:bg-surface-muted px-3 py-2.5 transition relative"
              style={{ flexGrow: p.count + 0.5 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-600">{t(p.key)}</span>
                <span className="text-xs font-semibold tabular-nums text-ink-900">{p.count}</span>
              </div>
              <div className="mt-2 h-1 rounded-full bg-brand-500/70" style={{ opacity: 0.35 + i * 0.2 }} />
            </Link>
          ))}
        </div>
      </section>

      {/* Priorities + right rail */}
      <section className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Priorities */}
        <div>
          <h2 className="text-sm font-semibold text-ink-700 mb-3">{t('dash.needAction')}</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {priorities.map((c) => (
              <Link key={c.code} to={c.to} className="bg-surface border border-line rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className={`pill ${c.pill}`}>{t(c.statusKey)}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${c.reasonCls} ml-auto`}>{t(c.reasonKey)}</span>
                </div>
                <div>
                  <div className="font-mono text-[11px] text-ink-400">{c.code}</div>
                  <div className="text-sm font-medium text-ink-900 mt-0.5 leading-snug">{c.title}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-surface-muted rounded-full overflow-hidden">
                    <div className={`${c.pctColor} h-full`} style={{ width: `${c.pct}%` }} />
                  </div>
                  <span className="text-[11px] tabular-nums text-ink-500">{c.pct}%</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-line/60">
                  <div className={`w-6 h-6 rounded-full ${c.ownerBg} text-white text-[10px] font-semibold flex items-center justify-center`}>{c.owner}</div>
                  <span className="text-xs text-ink-500">{c.ownerName}</span>
                  <div className="flex items-center gap-0.5 ml-auto">
                    {c.ai.map((d, i) => <span key={i} className={`w-1.5 h-1.5 rounded-full ${DOT[d]}`} />)}
                  </div>
                  <span className="text-xs font-medium text-brand-600">{t(c.ctaKey)} →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-5">
          <Panel title={t('dash.upcoming')}>
            <div className="space-y-2.5">
              {deadlines.map((d) => (
                <div key={d.code} className="flex items-center gap-3">
                  <div className="text-center shrink-0 w-10">
                    <div className={`text-base font-semibold tabular-nums leading-none ${d.tone}`}>{d.date}</div>
                    <div className="text-[10px] text-ink-400 mt-0.5">{d.days}日</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-ink-900 truncate">{d.sub}</div>
                    <div className="font-mono text-[10px] text-ink-400">{d.code}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={t('dash.activity')}>
            <div className="space-y-3">
              {activity.map((a) => (
                <div key={a.key} className="flex items-start gap-2">
                  <div className={`w-6 h-6 ${a.bg} rounded shrink-0 flex items-center justify-center text-white text-[10px] font-bold`}>{a.av}</div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-ink-700 leading-snug" dangerouslySetInnerHTML={{ __html: t(a.key) }} />
                    <div className="text-[10px] text-ink-400 mt-0.5">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      {/* Quiet what's-new line */}
      <Link to={ROUTES.ai.programGeneration} className="flex items-center gap-3 text-sm text-ink-500 hover:text-ink-700 border-t border-line/60 pt-4">
        <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">NEW</span>
        <span>{t('dash.newFeat')}</span>
        <span className="text-brand-600 ml-auto">{t('dash.tryNow')}</span>
      </Link>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <h2 className="text-sm font-semibold text-ink-700 mb-3">{title}</h2>
      {children}
    </div>
  )
}
