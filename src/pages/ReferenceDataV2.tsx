import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n/I18nProvider'
import { ROUTES } from '@/routes'

/**
 * S6 Reference Data — REDESIGN v2.
 * Clean table (no vertical separators, roomy padding, calm tags), collapsible
 * detail drawer, "your standards = moat" + marketplace surfaced calmly.
 */
type Vis = 'public' | 'private' | 'draft'
const VIS: Record<Vis, { dot: string; key: string }> = {
  public: { dot: 'bg-green-500', key: 'vis.public' },
  private: { dot: 'bg-amber-500', key: 'vis.private' },
  draft: { dot: 'bg-slate-400', key: 'vis.draft' },
}

interface Row {
  id: string; name?: string; nameKey?: string; typeKey: string; typeIcon: string
  vendor: string; vendorCls?: string; tech?: string; owner: string; version: string; usage: string; updated: string; vis: Vis
}

const ROWS: Row[] = [
  { id: 'mrj5', name: 'MR-J5 標準構成', typeIcon: '🔧', typeKey: 'filter.type.device', vendor: 'Mitsubishi', vendorCls: 'text-purple-700', tech: '#servo', owner: '金井田', version: 'v3.2', usage: '23', updated: '2025/11/12', vis: 'public' },
  { id: 'phase3', nameKey: 'row.phase3Name', typeIcon: '📐', typeKey: 'filter.type.circuit', vendor: '汎用', tech: '#power', owner: '森下', version: 'v3.2', usage: '56', updated: '2025/10/30', vis: 'public' },
  { id: 'cyl', nameKey: 'row.cylName', typeIcon: '💻', typeKey: 'filter.type.ladderShort', vendor: '汎用', tech: '#fault', owner: 'VIET', version: 'v2.1', usage: '45', updated: '2025/09/18', vis: 'public' },
  { id: 'xyz', nameKey: 'row.xyzName', typeIcon: '🎨', typeKey: 'filter.type.colorShort', vendor: 'XYZ製鋼', vendorCls: 'text-blue-700', owner: '金井田', version: 'v1.0', usage: '7', updated: '2024/12/05', vis: 'private' },
  { id: 'home', nameKey: 'row.homeName', typeIcon: '💻', typeKey: 'filter.type.ladderShort', vendor: 'Mitsubishi', vendorCls: 'text-purple-700', tech: '#servo', owner: 'KIEU', version: 'v1.5', usage: '31', updated: '2025/11/01', vis: 'public' },
  { id: 'cclink', nameKey: 'row.cclinkName', typeIcon: '📐', typeKey: 'filter.type.circuit', vendor: 'Mitsubishi', vendorCls: 'text-purple-700', tech: '#cc-link', owner: 'VIET', version: 'v0.3', usage: '—', updated: '2026/05/24', vis: 'draft' },
]

export default function ReferenceDataV2() {
  const { t } = useI18n()
  const [selected, setSelected] = useState('mrj5')
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [filter, setFilter] = useState<'all' | Vis>('all')

  const rows = filter === 'all' ? ROWS : ROWS.filter((r) => r.vis === filter)
  const chips: { k: 'all' | Vis; label: string; n: number }[] = [
    { k: 'all', label: t('filter.all'), n: 87 },
    { k: 'private', label: t('filter.private'), n: 24 },
    { k: 'public', label: t('filter.public'), n: 47 },
    { k: 'draft', label: t('filter.draft'), n: 16 },
  ]

  return (
    <div className="flex flex-col min-w-0 h-full overflow-hidden bg-surface-alt">
      {/* header */}
      <div className="bg-surface border-b border-line px-5 lg:px-8 py-3">
        <div className="flex items-center text-xs text-ink-400 mb-2">
          <Link to={ROUTES.dashboard} className="hover:text-brand-600">{t('nav.dashboard')}</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-700">{t('page.refData')}</span>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              ⭐ <span>{t('page.refDataTitle')}</span>
              <span className="text-xs font-normal text-ai-600 px-2 py-0.5 bg-ai-50 rounded">{t('page.aiBadge')}</span>
            </h1>
            <div className="text-sm text-ink-500 mt-0.5">{t('page.refDataSubtitle')}</div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="px-3 py-1.5 text-sm border border-line rounded-lg hover:bg-surface-alt">{t('action.import')}</button>
            <button type="button" className="px-3 py-1.5 text-sm btn-floating rounded-lg">{t('action.addViaChat')}</button>
          </div>
        </div>
        {/* marketplace — calm one-liner */}
        <div className="mt-3 flex items-center gap-2 text-xs text-ink-500 bg-purple-50/50 border border-purple-100 rounded-lg px-3 py-2">
          <span>📦</span>
          <span dangerouslySetInnerHTML={{ __html: `${t('marketplace.bannerTitle')} ${t('marketplace.bannerBody')}` }} />
          <button type="button" className="ml-auto text-purple-700 hover:underline shrink-0">{t('marketplace.viewStats')}</button>
        </div>
      </div>

      {/* toolbar */}
      <div className="bg-surface border-b border-line px-5 lg:px-8 py-2.5 flex items-center gap-3 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input placeholder={t('toolbar.searchPlaceholder')} className="w-full pl-9 pr-3 py-1.5 bg-surface-alt rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div className="inline-flex rounded-lg bg-surface-alt p-0.5">
          {chips.map((c) => (
            <button key={c.k} type="button" onClick={() => setFilter(c.k)}
              className={`px-2.5 py-1 text-xs rounded-md transition ${filter === c.k ? 'bg-surface text-brand-700 font-medium shadow-sm' : 'text-ink-500 hover:text-ink-800'}`}>
              {c.label} <span className="text-ink-400">{c.n}</span>
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-ink-400">{t('toolbar.sortBy')} {t('sort.usage')}</span>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* TABLE — clean */}
        <section className="flex-1 overflow-auto min-w-0">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface-alt/90 backdrop-blur z-10">
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400">
                <th className="px-5 lg:px-8 py-2.5 font-medium">{t('s6.colName')}</th>
                <th className="px-3 py-2.5 font-medium">{t('col.type')}</th>
                <th className="px-3 py-2.5 font-medium">{t('col.vendor')}</th>
                <th className="px-3 py-2.5 font-medium">{t('s6.colOwner')}</th>
                <th className="px-3 py-2.5 font-medium text-right">{t('col.usage')}</th>
                <th className="px-3 py-2.5 font-medium">{t('col.updated')}</th>
                <th className="px-3 py-2.5 font-medium text-center">{t('col.visibility')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} onClick={() => { setSelected(r.id); setDrawerOpen(true) }}
                  className={`cursor-pointer border-t border-line/50 transition ${selected === r.id ? 'bg-brand-50/50' : 'hover:bg-surface'}`}>
                  <td className="px-5 lg:px-8 py-3">
                    <div className="font-medium text-ink-900">{r.name ?? t(r.nameKey!)}</div>
                    {r.tech && <span className="text-[11px] text-ink-400">{r.tech}</span>}
                  </td>
                  <td className="px-3 py-3 text-ink-600">{r.typeIcon} {t(r.typeKey)}</td>
                  <td className={`px-3 py-3 ${r.vendorCls ?? 'text-ink-500'}`}>{r.vendor === '汎用' ? t('filter.generic') : r.vendor}</td>
                  <td className="px-3 py-3 text-ink-600">{r.owner}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{r.usage === '—' ? <span className="text-ink-300">—</span> : <strong className="text-ink-800">{r.usage}</strong>}</td>
                  <td className="px-3 py-3 text-xs text-ink-400 tabular-nums">{r.updated}</td>
                  <td className="px-3 py-3">
                    <span className="flex items-center justify-center gap-1.5 text-xs text-ink-500">
                      <span className={`w-1.5 h-1.5 rounded-full ${VIS[r.vis].dot}`} />{t(VIS[r.vis].key)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 lg:px-8 py-3 text-xs text-ink-400">{rows.length} / 87 {t('pagination.items')}</div>
        </section>

        {/* DETAIL drawer (collapsible) */}
        {drawerOpen && (
          <aside className="hidden xl:flex flex-col w-[360px] shrink-0 border-l border-line bg-surface">
            <div className="px-4 py-3 border-b border-line">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 text-xs">
                    <span className="text-ink-500">🔧 {t('filter.type.device')}</span>
                    <span className="text-purple-700">Mitsubishi</span>
                    <span className="font-mono text-ink-400">v3.2</span>
                  </div>
                  <div className="font-semibold text-base">MR-J5 標準構成</div>
                  <div className="text-xs text-ink-400 mt-0.5">{t('detail.mrj5Desc')}</div>
                </div>
                <button type="button" onClick={() => setDrawerOpen(false)} className="text-ink-400 hover:text-ink-700">⟩</button>
              </div>
              {/* visibility = trust, first-class */}
              <div className="flex items-center gap-2 mt-3 rounded-lg bg-surface-alt px-3 py-2">
                <div className="flex-1">
                  <div className="text-xs font-medium">{t('detail.visibility')}</div>
                  <div className="text-[10px] text-ink-400">{t('detail.visibilityHint')}</div>
                </div>
                <span className="text-xs text-green-700 font-medium">🌍 {t('vis.public')}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              <div className="mini-cad rounded-xl border border-line p-3">
                <svg viewBox="0 0 320 120" className="w-full">
                  <line x1="20" y1="25" x2="300" y2="25" stroke="#C62828" strokeWidth="1.5" /><line x1="20" y1="40" x2="300" y2="40" stroke="#C62828" strokeWidth="1.5" />
                  <rect x="120" y="60" width="80" height="40" rx="3" fill="white" stroke="#099E9A" strokeWidth="1.5" />
                  <text x="160" y="84" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="600">MR-J5-40A</text>
                </svg>
                <div className="text-[10px] text-ink-300 text-center mt-1">{t('detail.previewHint')}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[['142', 'detail.downloads'], ['12', 'detail.companies'], ['4.6⭐', 'detail.rating']].map(([v, k]) => (
                  <div key={k} className="bg-surface-alt rounded-lg py-2"><div className="text-base font-semibold">{v}</div><div className="text-[10px] text-ink-400">{t(k)}</div></div>
                ))}
              </div>
              <div className="rounded-lg bg-purple-50/50 border border-purple-100 px-3 py-2 text-xs text-purple-700" dangerouslySetInnerHTML={{ __html: `💰 ${t('detail.revenue')}` }} />
              <div className="rounded-xl bg-ai-50/40 border border-ai-100 p-3 text-xs">
                <div className="font-semibold text-ai-700 mb-1">🤖 {t('detail.aiInfo')}</div>
                <div className="text-ink-500">{t('detail.aiUsedIn')}</div>
                <div className="flex gap-1.5 mt-1.5">
                  <span className="px-1.5 py-0.5 bg-surface rounded text-ink-600">{t('s6.step3')}</span>
                  <span className="px-1.5 py-0.5 bg-surface rounded text-ink-600">{t('s6.step5')}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-line p-3 flex gap-2">
              <button type="button" className="flex-1 px-3 py-1.5 btn-floating rounded-lg text-sm">{t('action.edit')}</button>
              <button type="button" className="px-3 py-1.5 border border-line rounded-lg text-sm hover:bg-surface-alt">{t('s6.share')}</button>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
