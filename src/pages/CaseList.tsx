import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n/I18nProvider'
import { ROUTES, caseDetailPath } from '@/routes'

type Dot = 'done' | 'active' | 'none'

interface Row {
  code: string
  name: string
  sub: string
  customer: string
  customerSub: string
  owner: { initial: string; bg: string; name: string }
  statusKey: string
  pillClass: string
  warnBadge?: string
  progress: { pct: number; color: string; labelKey?: string }
  deadline: { date: string; days: string; dateClass?: string; daysClass?: string }
  ai: [Dot, Dot, Dot, Dot, Dot]
  rowClass?: string
}

const DOT: Record<Dot, { char: string; cls: string }> = {
  done: { char: '●', cls: 'text-green-600' },
  active: { char: '●', cls: 'text-amber-600' },
  none: { char: '○', cls: 'text-ink-300' },
}

const ROWS: Row[] = [
  {
    code: 'CASE-2026-0312',
    name: 'SH1 小型旋回フレーム',
    sub: '完成検査ロボット',
    customer: 'AAA重機',
    customerSub: 'XYZ製鋼 千葉工場',
    owner: { initial: '金', bg: 'bg-brand-600', name: '金井田' },
    statusKey: 'status.design',
    pillClass: 'pill-design',
    progress: { pct: 38, color: 'ai-grad' },
    deadline: { date: '2026/09/15', days: '112日' },
    ai: ['done', 'done', 'active', 'none', 'none'],
  },
  {
    code: 'CASE-2026-0288',
    name: 'PP4 パレタイザ',
    sub: '梱包ライン',
    customer: 'XYZ製鋼',
    customerSub: 'XYZ製鋼 大阪工場',
    owner: { initial: 'V', bg: 'bg-green-600', name: 'VIET' },
    statusKey: 'status.build',
    pillClass: 'pill-build',
    progress: { pct: 62, color: 'bg-amber-500' },
    deadline: { date: '2026/08/30', days: '96日' },
    ai: ['done', 'done', 'done', 'done', 'active'],
  },
  {
    code: 'CASE-2026-0245',
    name: 'WW2 溶接セル',
    sub: '協働ロボット',
    customer: 'AAA重機',
    customerSub: 'EEE電機 京都',
    owner: { initial: 'L', bg: 'bg-pink-600', name: 'LINH' },
    statusKey: 'status.debug',
    pillClass: 'pill-debug',
    warnBadge: '⚠ 3',
    progress: { pct: 88, color: 'bg-red-500' },
    deadline: { date: '2026/06/15', days: '20日 ⚠', dateClass: 'text-red-600 font-medium', daysClass: 'text-red-600' },
    ai: ['done', 'done', 'done', 'done', 'active'],
    rowClass: 'bg-red-50/30',
  },
  {
    code: 'CASE-2026-0345',
    name: 'RR4 検査セル 改造',
    sub: '既設改造案件',
    customer: 'BBB自動車',
    customerSub: 'BBB自動車 名古屋',
    owner: { initial: '有', bg: 'bg-purple-600', name: '有村' },
    statusKey: 'status.pre',
    pillClass: 'pill-pre',
    progress: { pct: 70, color: 'bg-green-500', labelKey: 'pre.estimate' },
    deadline: { date: '2026/07/20', days: '55日 ⏰', daysClass: 'text-amber-600' },
    ai: ['active', 'active', 'none', 'none', 'none'],
  },
  {
    code: 'CASE-2026-0298',
    name: 'DD3 ドラム搬送',
    sub: '自動搬送ライン',
    customer: 'DDD工業',
    customerSub: 'DDD工業 福岡',
    owner: { initial: '金', bg: 'bg-brand-600', name: '金井田' },
    statusKey: 'status.design',
    pillClass: 'pill-design',
    progress: { pct: 25, color: 'ai-grad' },
    deadline: { date: '2026/11/10', days: '168日' },
    ai: ['done', 'active', 'none', 'none', 'none'],
  },
  {
    code: 'CASE-2026-0276',
    name: 'TT5 タレット制御',
    sub: 'CNC連動',
    customer: 'DDD工業',
    customerSub: 'DDD工業 福岡',
    owner: { initial: 'K', bg: 'bg-cyan-600', name: 'KIEU' },
    statusKey: 'status.build',
    pillClass: 'pill-build',
    progress: { pct: 55, color: 'bg-amber-500' },
    deadline: { date: '2026/10/05', days: '132日' },
    ai: ['done', 'done', 'active', 'none', 'none'],
  },
  {
    code: 'CASE-2026-0301',
    name: 'CC1 コンベア制御',
    sub: '標準ライン',
    customer: 'DDD工業',
    customerSub: 'DDD工業 福岡',
    owner: { initial: 'K', bg: 'bg-cyan-600', name: 'KIEU' },
    statusKey: 'status.done',
    pillClass: 'pill-done',
    progress: { pct: 100, color: 'bg-ai-500' },
    deadline: { date: '2026/05/20', days: '✓ 完了', daysClass: 'text-green-600' },
    ai: ['done', 'done', 'done', 'done', 'done'],
    rowClass: 'opacity-60',
  },
  {
    code: 'CASE-2026-0188',
    name: 'TT2 溶接ロボット',
    sub: '標準型',
    customer: 'AAA重機',
    customerSub: 'EEE電機 京都',
    owner: { initial: '金', bg: 'bg-brand-600', name: '金井田' },
    statusKey: 'status.done',
    pillClass: 'pill-done',
    progress: { pct: 100, color: 'bg-ai-500' },
    deadline: { date: '2024/11/30', days: '✓ 完了', daysClass: 'text-green-600' },
    ai: ['done', 'done', 'done', 'done', 'done'],
    rowClass: 'opacity-60',
  },
]

const STATUS_FILTERS = [
  { key: 'status.pre', pill: 'pill-pre', count: 1, checked: true },
  { key: 'status.kickoff', pill: 'pill-kickoff', count: 0, checked: true },
  { key: 'status.design', pill: 'pill-design', count: 2, checked: true },
  { key: 'status.build', pill: 'pill-build', count: 2, checked: true },
  { key: 'status.debug', pill: 'pill-debug', count: 1, checked: true },
  { key: 'status.onsite', pill: 'pill-onsite', count: 0, checked: false },
  { key: 'status.done', pill: 'pill-done', count: 2, checked: false },
]

const CUSTOMERS = [
  { name: 'AAA重機', count: 3 },
  { name: 'XYZ製鋼', count: 2 },
  { name: 'BBB自動車', count: 1 },
  { name: 'DDD工業', count: 2 },
]

const OWNERS = [
  { name: '森下 雄太', count: 1 },
  { name: '金井田 俊', count: 2 },
  { name: 'VIET', count: 1 },
  { name: 'LINH', count: 1 },
]

function AiDots({ ai }: { ai: Dot[] }) {
  return (
    <div className="flex items-center gap-0.5 justify-center text-xs">
      {ai.map((d, i) => (
        <span key={i} className={DOT[d].cls}>
          {DOT[d].char}
        </span>
      ))}
    </div>
  )
}

export default function CaseList() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-w-0 h-full">
      {/* Page header */}
      <div className="bg-white border-b border-line px-4 lg:px-6 py-3">
        <div className="flex items-center text-xs text-ink-500 mb-2">
          <Link to={ROUTES.dashboard} className="hover:text-brand-600">
            {t('nav.dashboard')}
          </Link>
          <span className="mx-1">/</span>
          <span className="text-ink-900">{t('nav.caseList')}</span>
        </div>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold">{t('page.caseListTitle')}</h1>
            <div className="text-sm text-ink-500 mt-0.5">{t('page.caseListSub')}</div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="px-3 py-1.5 text-sm border border-line bg-white rounded-md text-ink-700 hover:border-brand-500 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-1.5">
              <span>{t('action.import')}</span>
            </button>
            <button type="button" className="px-3 py-1.5 text-sm border border-line bg-white rounded-md text-ink-700 hover:border-brand-500 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-1.5">
              <span>{t('action.export')}</span>
            </button>
            <button type="button" className="px-3 py-1.5 text-sm btn-floating rounded flex items-center gap-1.5 shadow-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{t('action.newCase')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-line px-4 lg:px-6 py-2.5 flex items-center gap-3 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input placeholder={t('toolbar.search')} className="w-full pl-9 pr-3 py-1.5 bg-surface-alt border border-line rounded-md text-sm focus:outline-none focus:border-brand-500 focus:bg-white" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button type="button" className="px-2.5 py-1 text-xs bg-brand-50 text-brand-700 border border-brand-200 rounded-full font-medium">
            <span>{t('filter.all')}</span> (8)
          </button>
          <button type="button" className="px-2.5 py-1 text-xs bg-white border border-line rounded-full hover:bg-surface-alt">
            <span>{t('filter.mine')}</span> (3)
          </button>
          <button type="button" className="px-2.5 py-1 text-xs bg-white border border-line rounded-full hover:bg-surface-alt">
            <span className="text-amber-600">⏰</span> <span>{t('filter.dueSoon')}</span> (2)
          </button>
          <button type="button" className="px-2.5 py-1 text-xs bg-white border border-line rounded-full hover:bg-surface-alt">
            <span className="text-red-600">⚠</span> <span>{t('filter.hasWarning')}</span> (1)
          </button>
          <button type="button" className="px-2.5 py-1 text-xs bg-white border border-line rounded-full hover:bg-surface-alt">
            <span className="text-ai-700">🤖</span> <span>{t('filter.aiActive')}</span> (4)
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs">
          <span className="text-ink-500">{t('toolbar.sort')}</span>
          <select className="text-xs border border-line rounded px-2 py-1 bg-white">
            <option>{t('sort.updated')}</option>
            <option>{t('sort.deadline')}</option>
            <option>{t('sort.progress')}</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Filter sidebar */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-line bg-white overflow-y-auto">
          <div className="px-3 py-2 border-b border-line text-xs font-semibold text-ink-500 uppercase">
            {t('filter.title')}
          </div>
          <div className="px-3 py-3 border-b border-line">
            <div className="text-xs font-semibold text-ink-700 mb-2">{t('filter.status')}</div>
            {STATUS_FILTERS.map((s) => (
              <label key={s.key} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
                <input type="checkbox" defaultChecked={s.checked} className="rounded text-brand-600" />
                <span className={`pill ${s.pill}`}>{t(s.key)}</span>
                <span className="ml-auto text-xs text-ink-300">{s.count}</span>
              </label>
            ))}
          </div>
          <div className="px-3 py-3 border-b border-line">
            <div className="text-xs font-semibold text-ink-700 mb-2">{t('filter.customer')}</div>
            {CUSTOMERS.map((c) => (
              <label key={c.name} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
                <input type="checkbox" className="rounded text-brand-600" />
                {c.name}
                <span className="ml-auto text-xs text-ink-300">{c.count}</span>
              </label>
            ))}
          </div>
          <div className="px-3 py-3 border-b border-line">
            <div className="text-xs font-semibold text-ink-700 mb-2">{t('filter.owner')}</div>
            {OWNERS.map((o) => (
              <label key={o.name} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
                <input type="checkbox" className="rounded text-brand-600" />
                {o.name}
                <span className="ml-auto text-xs text-ink-300">{o.count}</span>
              </label>
            ))}
          </div>
          <div className="px-3 py-3 border-b border-line">
            <div className="text-xs font-semibold text-ink-700 mb-2">{t('filter.deadline')}</div>
            <input type="date" className="w-full text-xs border border-line rounded px-2 py-1 mb-1.5" defaultValue="2026-05-01" />
            <input type="date" className="w-full text-xs border border-line rounded px-2 py-1" defaultValue="2026-12-31" />
          </div>
          <button type="button" className="px-3 py-2 text-xs text-brand-600 hover:bg-surface-alt text-left">
            {t('filter.clear')}
          </button>
        </aside>

        {/* Table */}
        <section className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-alt sticky top-0 z-10">
                <tr className="border-b border-line">
                  <th className="px-3 py-2 text-left w-8">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-ink-500">{t('col.code')}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-ink-500">{t('col.name')}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-ink-500">{t('col.customer')}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-ink-500">{t('col.owner')}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-ink-500">{t('col.status')}</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-ink-500">{t('col.progress')}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-ink-500">{t('col.deadline')}</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-ink-500">{t('col.ai')}</th>
                  <th className="px-3 py-2 w-8" />
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr
                    key={r.code}
                    className={`row border-b border-line cursor-pointer ${r.rowClass ?? ''}`}
                    onClick={() => navigate(caseDetailPath(r.code))}
                  >
                    <td className="px-3 py-2.5">
                      <input type="checkbox" className="rounded" onClick={(e) => e.stopPropagation()} />
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-xs text-brand-600 font-medium">{r.code}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-sm text-ink-900 flex items-center gap-1.5">
                        {r.name}
                        {r.warnBadge && (
                          <span className="text-[10px] text-red-700 px-1.5 py-0.5 bg-red-100 rounded">{r.warnBadge}</span>
                        )}
                      </div>
                      <div className="text-xs text-ink-500">{r.sub}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-sm">{r.customer}</div>
                      <div className="text-xs text-ink-500">{r.customerSub}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-6 h-6 rounded-full ${r.owner.bg} text-white text-[10px] font-semibold flex items-center justify-center`}>
                          {r.owner.initial}
                        </div>
                        <span className="text-xs">{r.owner.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`pill ${r.pillClass}`}>{t(r.statusKey)}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <div className="w-16 h-1.5 bg-surface-muted rounded-full overflow-hidden">
                          <div className={`${r.progress.color} h-full`} style={{ width: `${r.progress.pct}%` }} />
                        </div>
                        <span className="text-xs font-medium">
                          {r.progress.labelKey ? t(r.progress.labelKey) : `${r.progress.pct}%`}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className={`text-xs ${r.deadline.dateClass ?? ''}`}>{r.deadline.date}</div>
                      <div className={`text-[10px] ${r.deadline.daysClass ?? 'text-ink-500'}`}>{r.deadline.days}</div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <AiDots ai={r.ai} />
                    </td>
                    <td className="px-3 py-2.5 text-ink-300">⋮</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="border-t border-line bg-white px-4 py-2 flex items-center gap-3 text-xs">
            <span className="text-ink-500">
              <strong>8</strong> / 8 <span>{t('pagination.items')}</span>
            </span>
            <div className="ml-4 text-ink-500 flex items-center gap-2">
              <span>{t('pagination.legend')}</span>
              <span>
                <span className="text-green-600">●</span> {t('pagination.aiDone')}
              </span>
              <span>
                <span className="text-amber-600">●</span> {t('pagination.aiActive')}
              </span>
              <span>○ {t('pagination.aiNone')}</span>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <button type="button" className="px-2 py-1 hover:bg-surface-muted rounded text-ink-300" disabled>
                ‹
              </button>
              <button type="button" className="px-2 py-1 bg-brand-50 text-brand-700 rounded">
                1
              </button>
              <button type="button" className="px-2 py-1 hover:bg-surface-muted rounded text-ink-300" disabled>
                ›
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
